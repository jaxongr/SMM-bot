import { Module } from '@nestjs/common';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';
import { SmsApiService } from './sms-api.service';
import { BalanceModule } from '../balance/balance.module';

@Module({
  imports: [BalanceModule],
  controllers: [SmsController],
  providers: [SmsService, SmsApiService],
  exports: [SmsService, SmsApiService],
})
export class SmsModule {}
