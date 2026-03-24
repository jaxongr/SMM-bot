import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { ClickGateway } from '../gateways/click.gateway';
import { PaymentsService } from '../payments.service';

const CLICK_ACTION_PREPARE = 0;
const CLICK_ACTION_COMPLETE = 1;

const CLICK_ERROR_SUCCESS = 0;
const CLICK_ERROR_SIGN_CHECK_FAILED = -1;
const CLICK_ERROR_INVALID_AMOUNT = -2;
const CLICK_ERROR_ACTION_NOT_FOUND = -3;
const CLICK_ERROR_ALREADY_PAID = -4;
const CLICK_ERROR_TRANSACTION_NOT_FOUND = -5;
const CLICK_ERROR_TRANSACTION_CANCELED = -9;

interface ClickWebhookBody {
  click_trans_id: number;
  service_id: number;
  click_paydoc_id: number;
  merchant_trans_id: string;
  amount: number;
  action: number;
  error: number;
  error_note: string;
  sign_time: string;
  sign_string: string;
  merchant_prepare_id?: number;
}

@ApiTags('Payment Webhooks')
@Controller('payments/webhook/click')
export class ClickWebhookController {
  private readonly logger = new Logger(ClickWebhookController.name);

  constructor(
    private readonly clickGateway: ClickGateway,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post('prepare')
  @Public()
  @ApiOperation({ summary: 'Click prepare endpoint' })
  async prepare(@Body() body: ClickWebhookBody) {
    this.logger.log(`Click prepare: click_trans_id=${body.click_trans_id}, merchant_trans_id=${body.merchant_trans_id}`);

    const isValid = this.clickGateway.verifySignature({
      click_trans_id: body.click_trans_id,
      service_id: body.service_id,
      merchant_trans_id: body.merchant_trans_id,
      amount: body.amount,
      action: body.action,
      sign_time: body.sign_time,
      sign_string: body.sign_string,
    });

    if (!isValid) {
      this.logger.warn(`Click prepare: invalid signature for click_trans_id=${body.click_trans_id}`);
      return this.buildResponse(body, CLICK_ERROR_SIGN_CHECK_FAILED, 'Invalid signature');
    }

    if (body.action !== CLICK_ACTION_PREPARE) {
      return this.buildResponse(body, CLICK_ERROR_ACTION_NOT_FOUND, 'Invalid action');
    }

    try {
      const { data: payment } = await this.paymentsService.findById(body.merchant_trans_id);

      if (Number(payment.amount) !== body.amount) {
        return this.buildResponse(body, CLICK_ERROR_INVALID_AMOUNT, 'Invalid amount');
      }

      if (payment.status === 'COMPLETED') {
        return this.buildResponse(body, CLICK_ERROR_ALREADY_PAID, 'Already paid');
      }

      if (payment.status === 'CANCELED') {
        return this.buildResponse(body, CLICK_ERROR_TRANSACTION_CANCELED, 'Transaction canceled');
      }

      return this.buildResponse(body, CLICK_ERROR_SUCCESS, 'Success', payment.id);
    } catch {
      return this.buildResponse(body, CLICK_ERROR_TRANSACTION_NOT_FOUND, 'Transaction not found');
    }
  }

  @Post('complete')
  @Public()
  @ApiOperation({ summary: 'Click complete endpoint' })
  async complete(@Body() body: ClickWebhookBody) {
    this.logger.log(`Click complete: click_trans_id=${body.click_trans_id}, merchant_trans_id=${body.merchant_trans_id}`);

    const isValid = this.clickGateway.verifySignature({
      click_trans_id: body.click_trans_id,
      service_id: body.service_id,
      merchant_trans_id: body.merchant_trans_id,
      amount: body.amount,
      action: body.action,
      sign_time: body.sign_time,
      sign_string: body.sign_string,
    });

    if (!isValid) {
      this.logger.warn(`Click complete: invalid signature for click_trans_id=${body.click_trans_id}`);
      return this.buildResponse(body, CLICK_ERROR_SIGN_CHECK_FAILED, 'Invalid signature');
    }

    if (body.action !== CLICK_ACTION_COMPLETE) {
      return this.buildResponse(body, CLICK_ERROR_ACTION_NOT_FOUND, 'Invalid action');
    }

    try {
      const { data: payment } = await this.paymentsService.findById(body.merchant_trans_id);

      if (payment.status === 'COMPLETED') {
        return this.buildResponse(body, CLICK_ERROR_ALREADY_PAID, 'Already paid');
      }

      if (payment.status === 'CANCELED') {
        return this.buildResponse(body, CLICK_ERROR_TRANSACTION_CANCELED, 'Transaction canceled');
      }

      if (body.error < 0) {
        await this.paymentsService.fail(payment.id, body.error_note);
        return this.buildResponse(body, body.error, body.error_note);
      }

      await this.paymentsService.complete(payment.id, String(body.click_trans_id));

      return this.buildResponse(body, CLICK_ERROR_SUCCESS, 'Success');
    } catch {
      return this.buildResponse(body, CLICK_ERROR_TRANSACTION_NOT_FOUND, 'Transaction not found');
    }
  }

  private buildResponse(
    body: ClickWebhookBody,
    error: number,
    errorNote: string,
    merchantPrepareId?: string,
  ) {
    return {
      click_trans_id: body.click_trans_id,
      merchant_trans_id: body.merchant_trans_id,
      merchant_prepare_id: merchantPrepareId || body.merchant_prepare_id,
      error,
      error_note: errorNote,
    };
  }
}
