import { Injectable, Logger } from '@nestjs/common';
import {
  ProviderInfo,
  ProviderBalanceResponse,
  ProviderExternalService,
  ProviderCreateOrderParams,
  ProviderCreateOrderResponse,
  ProviderOrderStatusResponse,
  ProviderMultipleOrderStatusResponse,
  ProviderCancelResponse,
  ProviderRefillResponse,
} from './types/provider-api.types';

const REQUEST_TIMEOUT_MS = 10000;
const MAX_RETRIES = 1;

@Injectable()
export class ProviderApiService {
  private readonly logger = new Logger(ProviderApiService.name);

  private async sendRequest<T>(
    provider: ProviderInfo,
    params: Record<string, string>,
    retryCount = 0,
  ): Promise<T> {
    const body = new URLSearchParams({
      key: provider.apiKey,
      ...params,
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const response = await fetch(provider.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (data.error) {
        throw new Error(`Provider API error: ${data.error}`);
      }

      return data as T;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (retryCount < MAX_RETRIES) {
        this.logger.warn(
          `Provider request failed (attempt ${retryCount + 1}), retrying: provider=${provider.id}, action=${params.action}, error=${errorMessage}`,
        );
        return this.sendRequest<T>(provider, params, retryCount + 1);
      }

      this.logger.error(
        `Provider request failed after ${MAX_RETRIES + 1} attempts: provider=${provider.id}, action=${params.action}, error=${errorMessage}`,
      );
      throw error;
    }
  }

  async getBalance(provider: ProviderInfo): Promise<ProviderBalanceResponse> {
    return this.sendRequest<ProviderBalanceResponse>(provider, {
      action: 'balance',
    });
  }

  async getServices(provider: ProviderInfo): Promise<ProviderExternalService[]> {
    return this.sendRequest<ProviderExternalService[]>(provider, {
      action: 'services',
    });
  }

  async createOrder(
    provider: ProviderInfo,
    params: ProviderCreateOrderParams,
  ): Promise<ProviderCreateOrderResponse> {
    const requestParams: Record<string, string> = {
      action: 'add',
      service: params.service,
      link: params.link,
      quantity: String(params.quantity),
    };

    if (params.runs !== undefined) {
      requestParams.runs = String(params.runs);
    }
    if (params.interval !== undefined) {
      requestParams.interval = String(params.interval);
    }

    return this.sendRequest<ProviderCreateOrderResponse>(provider, requestParams);
  }

  async getOrderStatus(
    provider: ProviderInfo,
    orderId: string,
  ): Promise<ProviderOrderStatusResponse> {
    return this.sendRequest<ProviderOrderStatusResponse>(provider, {
      action: 'status',
      order: orderId,
    });
  }

  async getMultipleOrderStatus(
    provider: ProviderInfo,
    orderIds: string[],
  ): Promise<ProviderMultipleOrderStatusResponse> {
    return this.sendRequest<ProviderMultipleOrderStatusResponse>(provider, {
      action: 'status',
      orders: orderIds.join(','),
    });
  }

  async cancelOrder(provider: ProviderInfo, orderId: string): Promise<ProviderCancelResponse> {
    return this.sendRequest<ProviderCancelResponse>(provider, {
      action: 'cancel',
      order: orderId,
    });
  }

  async refillOrder(provider: ProviderInfo, orderId: string): Promise<ProviderRefillResponse> {
    return this.sendRequest<ProviderRefillResponse>(provider, {
      action: 'refill',
      order: orderId,
    });
  }
}
