import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { OrderProcessorService } from '../../orders/order-processor.service';
import { ORDER_PROCESSING_QUEUE } from '../queue.constants';

@Processor(ORDER_PROCESSING_QUEUE)
export class OrderQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderQueueProcessor.name);

  constructor(private readonly orderProcessorService: OrderProcessorService) {
    super();
  }

  async process(job: Job<{ orderId: string }>): Promise<void> {
    const { orderId } = job.data;

    this.logger.log(`Processing job ${job.name} for order ${orderId}`);

    try {
      switch (job.name) {
        case 'process-order':
          await this.orderProcessorService.processOrder(orderId);
          break;

        case 'cancel-order':
          await this.orderProcessorService.cancelOrderAtProvider(orderId);
          break;

        case 'refill-order':
          await this.orderProcessorService.refillOrderAtProvider(orderId);
          break;

        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
      }

      this.logger.log(`Job ${job.name} completed for order ${orderId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Job ${job.name} failed for order ${orderId}: ${errorMessage}`,
      );
      throw error;
    }
  }
}
