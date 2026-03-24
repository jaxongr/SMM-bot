import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { PaymentGateway, PaymentInitResult } from './payment-gateway.interface';

@Injectable()
export class ClickGateway implements PaymentGateway {
  private readonly logger = new Logger(ClickGateway.name);
  private readonly merchantId: string;
  private readonly serviceId: string;
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.merchantId = this.configService.get<string>('click.merchantId', '');
    this.serviceId = this.configService.get<string>('click.serviceId', '');
    this.secretKey = this.configService.get<string>('click.secretKey', '');
  }

  async createPayment(
    amount: number,
    paymentId: string,
    metadata?: Record<string, unknown>,
  ): Promise<PaymentInitResult> {
    const params = new URLSearchParams({
      merchant_id: this.merchantId,
      service_id: this.serviceId,
      transaction_param: paymentId,
      amount: amount.toString(),
      return_url: metadata?.returnUrl as string || '',
    });

    const paymentUrl = `https://my.click.uz/services/pay?${params.toString()}`;

    this.logger.log(`Click payment created: paymentId=${paymentId}, amount=${amount}`);

    return {
      paymentUrl,
      paymentId,
      metadata: { provider: 'click' },
    };
  }

  verifySignature(data: Record<string, unknown>): boolean {
    const {
      click_trans_id,
      service_id,
      merchant_trans_id,
      amount,
      action,
      sign_time,
      sign_string,
    } = data;

    const expectedSign = this.generateSignature(
      String(click_trans_id),
      String(service_id),
      String(merchant_trans_id),
      String(amount),
      String(action),
      String(sign_time),
    );

    return expectedSign === sign_string;
  }

  generateSignature(
    clickTransId: string,
    serviceId: string,
    merchantTransId: string,
    amount: string,
    action: string,
    signTime: string,
  ): string {
    const signString = `${clickTransId}${serviceId}${this.secretKey}${merchantTransId}${amount}${action}${signTime}`;
    return createHash('md5').update(signString).digest('hex');
  }
}
