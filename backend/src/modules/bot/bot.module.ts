import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { UsersModule } from '../users/users.module';
import { ServicesModule } from '../services/services.module';
import { BalanceModule } from '../balance/balance.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    UsersModule,
    ServicesModule,
    BalanceModule,
    PaymentsModule,
  ],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
