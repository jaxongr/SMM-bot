import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsCountry, SmsService as SmsServiceType, SmsNumber } from './types/sms-api.types';

const SMS_STATUS_READY = '1';
const SMS_STATUS_RETRY = '3';
const SMS_STATUS_COMPLETE = '6';
const SMS_STATUS_CANCEL = '8';

interface PriceResult {
  price: number;
  count: number;
}

@Injectable()
export class SmsApiService {
  private readonly logger = new Logger(SmsApiService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.getOrThrow<string>('SMS_ACTIVATE_API_URL');
    this.apiKey = this.configService.getOrThrow<string>('SMS_ACTIVATE_API_KEY');
  }

  private buildUrl(action: string, params: Record<string, string> = {}): string {
    const url = new URL(`${this.apiUrl}/stubs/handler_api.php`);
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('action', action);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    return url.toString();
  }

  private async request(action: string, params: Record<string, string> = {}): Promise<string> {
    const url = this.buildUrl(action, params);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new BadRequestException(`SMS API returned status ${response.status}`);
      }

      const text = await response.text();

      if (text.startsWith('BAD_KEY') || text.startsWith('ERROR_SQL')) {
        throw new BadRequestException(`SMS API error: ${text}`);
      }

      if (text.startsWith('NO_NUMBERS') || text.startsWith('NO_BALANCE')) {
        throw new BadRequestException(`SMS API: ${text}`);
      }

      return text;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`SMS API request failed: ${action}`, (error as Error).stack);
      throw new BadRequestException('SMS activation service is unavailable');
    }
  }

  async getBalance(): Promise<number> {
    const result = await this.request('getBalance');
    const balance = parseFloat(result.replace('ACCESS_BALANCE:', ''));

    if (isNaN(balance)) {
      throw new BadRequestException('Invalid balance response from SMS API');
    }

    return balance;
  }

  async getCountries(): Promise<Record<string, SmsCountry>> {
    const url = this.buildUrl('getCountries');
    const response = await fetch(url);

    if (!response.ok) {
      throw new BadRequestException('Failed to fetch countries from SMS API');
    }

    return response.json();
  }

  async getServices(): Promise<Record<string, SmsServiceType>> {
    const url = this.buildUrl('getServices');
    const response = await fetch(url);

    if (!response.ok) {
      throw new BadRequestException('Failed to fetch services from SMS API');
    }

    return response.json();
  }

  async getPrice(service: string, country: string): Promise<PriceResult> {
    const url = this.buildUrl('getPrices', { service, country });
    const response = await fetch(url);

    if (!response.ok) {
      throw new BadRequestException('Failed to fetch price from SMS API');
    }

    const data = await response.json();

    const countryData = data[country];
    if (!countryData || !countryData[service]) {
      throw new BadRequestException('Price not available for this service/country combination');
    }

    const serviceData = countryData[service];
    return {
      price: parseFloat(serviceData.cost),
      count: parseInt(serviceData.count, 10),
    };
  }

  async buyNumber(service: string, country: string): Promise<SmsNumber> {
    const result = await this.request('getNumber', { service, country });

    if (!result.startsWith('ACCESS_NUMBER')) {
      throw new BadRequestException(`Failed to buy number: ${result}`);
    }

    const parts = result.split(':');
    if (parts.length < 3) {
      throw new BadRequestException('Invalid buy number response');
    }

    return {
      id: parts[1],
      phone: parts[2],
      operator: parts[3] || 'unknown',
    };
  }

  async getStatus(activationId: string): Promise<{ status: string; code?: string }> {
    const result = await this.request('getStatus', { id: activationId });

    if (result.startsWith('STATUS_WAIT_CODE')) {
      return { status: 'WAITING' };
    }

    if (result.startsWith('STATUS_WAIT_RETRY')) {
      return { status: 'WAITING', code: result.split(':')[1] };
    }

    if (result.startsWith('STATUS_OK')) {
      return { status: 'RECEIVED', code: result.split(':')[1] };
    }

    if (result.startsWith('STATUS_CANCEL')) {
      return { status: 'CANCELED' };
    }

    return { status: 'WAITING' };
  }

  async setStatus(activationId: string, status: number): Promise<string> {
    const validStatuses = [
      parseInt(SMS_STATUS_READY, 10),
      parseInt(SMS_STATUS_RETRY, 10),
      parseInt(SMS_STATUS_COMPLETE, 10),
      parseInt(SMS_STATUS_CANCEL, 10),
    ];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status code: ${status}`);
    }

    return this.request('setStatus', { id: activationId, status: status.toString() });
  }
}
