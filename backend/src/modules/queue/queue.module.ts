import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrdersModule } from '../orders/orders.module';
import { OrderQueueProcessor } from './processors/order.processor';
import { StatusCheckProcessor } from './processors/status-check.processor';
import { NotificationProcessor } from './processors/notification.processor';
import {
  ORDER_PROCESSING_QUEUE,
  ORDER_STATUS_CHECK_QUEUE,
  ORDER_NOTIFICATION_QUEUE,
} from './queue.constants';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: ORDER_PROCESSING_QUEUE },
      { name: ORDER_STATUS_CHECK_QUEUE },
      { name: ORDER_NOTIFICATION_QUEUE },
    ),
    OrdersModule,
  ],
  providers: [
    OrderQueueProcessor,
    StatusCheckProcessor,
    NotificationProcessor,
  ],
  exports: [
    OrderQueueProcessor,
    StatusCheckProcessor,
    NotificationProcessor,
  ],
})
export class QueueModule {}
