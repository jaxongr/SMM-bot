import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderProcessorService } from './order-processor.service';
import { ProvidersModule } from '../providers/providers.module';
import { BalanceModule } from '../balance/balance.module';
import {
  ORDER_PROCESSING_QUEUE,
  ORDER_STATUS_CHECK_QUEUE,
  ORDER_NOTIFICATION_QUEUE,
} from '../queue/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: ORDER_PROCESSING_QUEUE },
      { name: ORDER_STATUS_CHECK_QUEUE },
      { name: ORDER_NOTIFICATION_QUEUE },
    ),
    ProvidersModule,
    BalanceModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderProcessorService],
  exports: [OrdersService, OrderProcessorService],
})
export class OrdersModule {}
