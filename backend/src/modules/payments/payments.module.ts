import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ClickGateway } from './gateways/click.gateway';
import { PaymeGateway } from './gateways/payme.gateway';
import { ClickWebhookController } from './webhooks/click.webhook.controller';
import { PaymeWebhookController } from './webhooks/payme.webhook.controller';
import { BalanceModule } from '../balance/balance.module';

@Module({
  imports: [BalanceModule],
  controllers: [PaymentsController, ClickWebhookController, PaymeWebhookController],
  providers: [PaymentsService, ClickGateway, PaymeGateway],
  exports: [PaymentsService],
})
export class PaymentsModule {}
