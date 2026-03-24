export interface PaymentGateway {
  createPayment(
    amount: number,
    paymentId: string,
    metadata?: Record<string, unknown>,
  ): Promise<PaymentInitResult>;

  verifySignature(data: Record<string, unknown>): boolean;
}

export interface PaymentInitResult {
  paymentUrl?: string;
  paymentId: string;
  metadata?: Record<string, unknown>;
}
