import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway, PaymentInitResult } from './payment-gateway.interface';

@Injectable()
export class PaymeGateway implements PaymentGateway {
  private readonly logger = new Logger(PaymeGateway.name);
  private readonly merchantId: string;
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.merchantId = this.configService.get<string>('payme.merchantId', '');
    this.secretKey = this.configService.get<string>('payme.secretKey', '');
  }

  async createPayment(
    amount: number,
    paymentId: string,
    metadata?: Record<string, unknown>,
  ): Promise<PaymentInitResult> {
    const amountInTiyin = amount * 100;

    const params = `m=${this.merchantId};ac.order_id=${paymentId};a=${amountInTiyin}`;
    const encodedParams = Buffer.from(params).toString('base64');
    const paymentUrl = `https://checkout.paycom.uz/${encodedParams}`;

    this.logger.log(`Payme payment created: paymentId=${paymentId}, amount=${amount}`);

    return {
      paymentUrl,
      paymentId,
      metadata: { provider: 'payme' },
    };
  }

  verifySignature(data: Record<string, unknown>): boolean {
    const authHeader = data.authorization as string;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return false;
    }

    const encoded = authHeader.replace('Basic ', '');
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    const [, key] = decoded.split(':');

    return key === this.secretKey;
  }
}
