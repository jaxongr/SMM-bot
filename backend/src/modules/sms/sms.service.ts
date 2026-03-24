import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BalanceService } from '../balance/balance.service';
import { SmsApiService } from './sms-api.service';
import { BuyNumberDto } from './dto/buy-number.dto';
import { SmsQueryDto } from './dto/sms-query.dto';
import { buildPaginationMeta, getPaginationParams } from '../../common/types/response.type';

const PRICE_MARKUP_PERCENT = 30;
const UZS_RATE_KEY = 'SMS_UZS_RATE';
const DEFAULT_UZS_RATE = 150;
const ACTIVATION_EXPIRY_MINUTES = 20;

export interface ServiceInfo {
  code: string;
  name: string;
  icon?: string;
}

const POPULAR_SERVICES: ServiceInfo[] = [
  { code: 'tg', name: 'Telegram', icon: 'telegram' },
  { code: 'wa', name: 'WhatsApp', icon: 'whatsapp' },
  { code: 'ig', name: 'Instagram', icon: 'instagram' },
  { code: 'fb', name: 'Facebook', icon: 'facebook' },
  { code: 'tw', name: 'Twitter', icon: 'twitter' },
  { code: 'go', name: 'Google/Gmail', icon: 'google' },
  { code: 'ot', name: 'Any other', icon: 'other' },
  { code: 'ds', name: 'Discord', icon: 'discord' },
  { code: 'tk', name: 'TikTok', icon: 'tiktok' },
  { code: 'vi', name: 'Viber', icon: 'viber' },
];

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly balanceService: BalanceService,
    private readonly smsApiService: SmsApiService,
    private readonly configService: ConfigService,
  ) {}

  private getUzsRate(): number {
    return this.configService.get<number>(UZS_RATE_KEY) || DEFAULT_UZS_RATE;
  }

  private calculatePriceInUzs(providerPrice: number): number {
    const uzsRate = this.getUzsRate();
    const basePrice = providerPrice * uzsRate;
    const markup = basePrice * (PRICE_MARKUP_PERCENT / 100);
    return Math.ceil(basePrice + markup);
  }

  async getAvailableServices(): Promise<{ data: ServiceInfo[] }> {
    return { data: POPULAR_SERVICES };
  }

  async getCountries(): Promise<{ data: Record<string, unknown> }> {
    const countries = await this.smsApiService.getCountries();
    return { data: countries };
  }

  async getPrice(service: string, country: string): Promise<{ data: { price: number; available: number } }> {
    const result = await this.smsApiService.getPrice(service, country);
    const priceInUzs = this.calculatePriceInUzs(result.price);

    return {
      data: {
        price: priceInUzs,
        available: result.count,
      },
    };
  }

  async buyNumber(userId: string, dto: BuyNumberDto) {
    const { service, country } = dto;

    const priceResult = await this.smsApiService.getPrice(service, country);
    const priceInUzs = this.calculatePriceInUzs(priceResult.price);

    await this.balanceService.deduct(
      userId,
      priceInUzs,
      `SMS activation: ${service} (${country})`,
      { type: 'SMS_ACTIVATION', service, country },
    );

    let smsNumber;
    try {
      smsNumber = await this.smsApiService.buyNumber(service, country);
    } catch (error) {
      await this.balanceService.refund(
        userId,
        priceInUzs,
        `SMS activation refund: ${service} (${country}) - failed to buy number`,
        { type: 'SMS_ACTIVATION_REFUND', service, country },
      );
      throw error;
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + ACTIVATION_EXPIRY_MINUTES);

    const smsOrder = await this.prisma.smsActivation.create({
      data: {
        id: smsNumber.id,
        userId,
        service,
        country,
        phone: smsNumber.phone,
        status: 'WAITING',
        price: Math.round(priceInUzs),
        expiresAt,
      },
    });

    this.logger.log(`SMS number purchased: user=${userId}, service=${service}, phone=${smsNumber.phone}`);

    return {
      data: {
        id: smsOrder.id,
        phone: smsOrder.phone,
        service: smsOrder.service,
        country: smsOrder.country,
        status: smsOrder.status,
        price: smsOrder.price,
        expiresAt: smsOrder.expiresAt,
      },
    };
  }

  async checkStatus(orderId: string) {
    const smsOrder = await this.prisma.smsActivation.findUnique({
      where: { id: orderId },
    });

    if (!smsOrder) {
      throw new NotFoundException('SMS order not found');
    }

    if (smsOrder.status === 'RECEIVED' || smsOrder.status === 'CANCELED') {
      return { data: smsOrder };
    }

    const apiStatus = await this.smsApiService.getStatus(smsOrder.id);

    if (apiStatus.status !== smsOrder.status || apiStatus.code) {
      const updatedOrder = await this.prisma.smsActivation.update({
        where: { id: orderId },
        data: {
          status: apiStatus.status as unknown as undefined,
          code: apiStatus.code || smsOrder.code,
        },
      });

      return { data: updatedOrder };
    }

    return { data: smsOrder };
  }

  async cancelNumber(orderId: string, userId: string) {
    const smsOrder = await this.prisma.smsActivation.findUnique({
      where: { id: orderId },
    });

    if (!smsOrder) {
      throw new NotFoundException('SMS order not found');
    }

    if (smsOrder.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    if (smsOrder.status !== 'WAITING') {
      throw new BadRequestException('Only orders with WAITING status can be canceled');
    }

    await this.smsApiService.setStatus(smsOrder.id, 8);

    const updatedOrder = await this.prisma.smsActivation.update({
      where: { id: orderId },
      data: { status: 'CANCELED' },
    });

    const refundAmount = Number(smsOrder.price);
    await this.balanceService.refund(
      userId,
      refundAmount,
      `SMS activation canceled: ${smsOrder.service} (${smsOrder.phone})`,
      { type: 'SMS_ACTIVATION_REFUND', orderId },
    );

    this.logger.log(`SMS order canceled and refunded: user=${userId}, orderId=${orderId}`);

    return { data: updatedOrder };
  }

  async getUserOrders(userId: string, query: SmsQueryDto) {
    const { page, limit, skip } = getPaginationParams(query);

    const where: Prisma.SmsActivationWhereInput = { userId };

    if (query.status) {
      where.status = query.status as unknown as Prisma.EnumSmsActivationStatusFilter;
    }

    const [orders, total] = await Promise.all([
      this.prisma.smsActivation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.smsActivation.count({ where }),
    ]);

    return {
      data: orders,
      meta: buildPaginationMeta(total, page, limit),
    };
  }
}
