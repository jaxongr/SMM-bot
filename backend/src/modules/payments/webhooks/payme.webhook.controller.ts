import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { PaymeGateway } from '../gateways/payme.gateway';
import { PaymentsService } from '../payments.service';
import { PrismaService } from '../../../prisma/prisma.service';

const PAYME_ERROR_INVALID_AUTH = -32504;
const PAYME_ERROR_TRANSACTION_NOT_FOUND = -31003;
const PAYME_ERROR_INVALID_AMOUNT = -31001;
const PAYME_ERROR_CANT_PERFORM = -31008;
const PAYME_ERROR_CANT_CANCEL = -31007;
const PAYME_ERROR_METHOD_NOT_FOUND = -32601;

interface PaymeRpcRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params: Record<string, unknown>;
}

@ApiTags('Payment Webhooks')
@Controller('payments/webhook/payme')
export class PaymeWebhookController {
  private readonly logger = new Logger(PaymeWebhookController.name);

  constructor(
    private readonly paymeGateway: PaymeGateway,
    private readonly paymentsService: PaymentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Payme JSON-RPC endpoint' })
  async handleRpc(
    @Body() body: PaymeRpcRequest,
    @Headers('authorization') authorization: string,
  ) {
    this.logger.log(`Payme RPC: method=${body.method}, id=${body.id}`);

    const isValid = this.paymeGateway.verifySignature({ authorization });

    if (!isValid) {
      this.logger.warn(`Payme: invalid authorization`);
      return this.errorResponse(body.id, PAYME_ERROR_INVALID_AUTH, 'Invalid authorization');
    }

    switch (body.method) {
      case 'CheckPerformTransaction':
        return this.checkPerformTransaction(body);
      case 'CreateTransaction':
        return this.createTransaction(body);
      case 'PerformTransaction':
        return this.performTransaction(body);
      case 'CancelTransaction':
        return this.cancelTransaction(body);
      case 'CheckTransaction':
        return this.checkTransaction(body);
      default:
        return this.errorResponse(body.id, PAYME_ERROR_METHOD_NOT_FOUND, 'Method not found');
    }
  }

  private async checkPerformTransaction(body: PaymeRpcRequest) {
    const { account, amount } = body.params as { account: { order_id: string }; amount: number };
    const amountInSoum = amount / 100;

    try {
      const { data: payment } = await this.paymentsService.findById(account.order_id);

      if (Number(payment.amount) !== amountInSoum) {
        return this.errorResponse(body.id, PAYME_ERROR_INVALID_AMOUNT, 'Invalid amount');
      }

      if (payment.status !== 'PENDING') {
        return this.errorResponse(body.id, PAYME_ERROR_CANT_PERFORM, 'Transaction cannot be performed');
      }

      return this.successResponse(body.id, { allow: true });
    } catch {
      return this.errorResponse(body.id, PAYME_ERROR_TRANSACTION_NOT_FOUND, 'Order not found');
    }
  }

  private async createTransaction(body: PaymeRpcRequest) {
    const { id: paymeTransId, account, amount, time } = body.params as {
      id: string;
      account: { order_id: string };
      amount: number;
      time: number;
    };
    const amountInSoum = amount / 100;

    try {
      const { data: payment } = await this.paymentsService.findById(account.order_id);

      if (Number(payment.amount) !== amountInSoum) {
        return this.errorResponse(body.id, PAYME_ERROR_INVALID_AMOUNT, 'Invalid amount');
      }

      if (payment.status === 'COMPLETED') {
        return this.errorResponse(body.id, PAYME_ERROR_CANT_PERFORM, 'Already completed');
      }

      if (payment.status === 'CANCELED' || payment.status === 'FAILED') {
        return this.errorResponse(body.id, PAYME_ERROR_CANT_PERFORM, 'Transaction canceled');
      }

      return this.successResponse(body.id, {
        create_time: time,
        transaction: account.order_id,
        state: 1,
      });
    } catch {
      return this.errorResponse(body.id, PAYME_ERROR_TRANSACTION_NOT_FOUND, 'Order not found');
    }
  }

  private async performTransaction(body: PaymeRpcRequest) {
    const { id: paymeTransId } = body.params as { id: string };

    try {
      const payments = await this.findPaymentByExternalId(paymeTransId);

      if (!payments) {
        const { account } = body.params as { account?: { order_id: string } };
        if (account?.order_id) {
          const result = await this.paymentsService.complete(account.order_id, paymeTransId);
          return this.successResponse(body.id, {
            transaction: result.data.id,
            perform_time: Date.now(),
            state: 2,
          });
        }
        return this.errorResponse(body.id, PAYME_ERROR_TRANSACTION_NOT_FOUND, 'Transaction not found');
      }

      if (payments.status === 'COMPLETED') {
        return this.successResponse(body.id, {
          transaction: payments.id,
          perform_time: payments.updatedAt.getTime(),
          state: 2,
        });
      }

      const result = await this.paymentsService.complete(payments.id, paymeTransId);

      return this.successResponse(body.id, {
        transaction: result.data.id,
        perform_time: Date.now(),
        state: 2,
      });
    } catch {
      return this.errorResponse(body.id, PAYME_ERROR_TRANSACTION_NOT_FOUND, 'Transaction not found');
    }
  }

  private async cancelTransaction(body: PaymeRpcRequest) {
    const { id: paymeTransId, reason } = body.params as { id: string; reason: number };

    try {
      const payment = await this.findPaymentByExternalId(paymeTransId);

      if (!payment) {
        return this.errorResponse(body.id, PAYME_ERROR_TRANSACTION_NOT_FOUND, 'Transaction not found');
      }

      if (payment.status === 'COMPLETED') {
        return this.errorResponse(body.id, PAYME_ERROR_CANT_CANCEL, 'Cannot cancel completed transaction');
      }

      if (payment.status === 'CANCELED') {
        return this.successResponse(body.id, {
          transaction: payment.id,
          cancel_time: payment.updatedAt.getTime(),
          state: -1,
        });
      }

      await this.paymentsService.cancel(payment.id);

      return this.successResponse(body.id, {
        transaction: payment.id,
        cancel_time: Date.now(),
        state: -1,
      });
    } catch {
      return this.errorResponse(body.id, PAYME_ERROR_TRANSACTION_NOT_FOUND, 'Transaction not found');
    }
  }

  private async checkTransaction(body: PaymeRpcRequest) {
    const { id: paymeTransId } = body.params as { id: string };

    try {
      const payment = await this.findPaymentByExternalId(paymeTransId);

      if (!payment) {
        return this.errorResponse(body.id, PAYME_ERROR_TRANSACTION_NOT_FOUND, 'Transaction not found');
      }

      const stateMap: Record<string, number> = {
        PENDING: 1,
        COMPLETED: 2,
        CANCELED: -1,
        FAILED: -2,
      };

      return this.successResponse(body.id, {
        create_time: payment.createdAt.getTime(),
        perform_time: payment.status === 'COMPLETED' ? payment.updatedAt.getTime() : 0,
        cancel_time: payment.status === 'CANCELED' ? payment.updatedAt.getTime() : 0,
        transaction: payment.id,
        state: stateMap[payment.status] ?? 1,
        reason: null,
      });
    } catch {
      return this.errorResponse(body.id, PAYME_ERROR_TRANSACTION_NOT_FOUND, 'Transaction not found');
    }
  }

  private async findPaymentByExternalId(externalId: string) {
    return this.prisma.payment.findFirst({
      where: { externalId },
    });
  }

  private successResponse(id: number, result: Record<string, unknown>) {
    return {
      jsonrpc: '2.0',
      id,
      result,
    };
  }

  private errorResponse(id: number, code: number, message: string) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message: { uz: message, ru: message, en: message },
      },
    };
  }
}
