import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Job } from 'bullmq';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { OrderProcessorService } from '../../orders/order-processor.service';
import { ORDER_STATUS_CHECK_QUEUE } from '../queue.constants';

const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PROCESSING,
  OrderStatus.IN_PROGRESS,
];

const STATUS_CHECK_BATCH_SIZE = 50;

@Processor(ORDER_STATUS_CHECK_QUEUE)
export class StatusCheckProcessor extends WorkerHost {
  private readonly logger = new Logger(StatusCheckProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly orderProcessorService: OrderProcessorService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing status check job: ${job.name}`);

    try {
      switch (job.name) {
        case 'check-all-statuses':
          await this.checkAllOrderStatuses();
          break;

        case 'check-single-status':
          await this.orderProcessorService.checkOrderStatus(job.data.orderId);
          break;

        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Status check job failed: ${errorMessage}`);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleStatusCheckCron(): Promise<void> {
    this.logger.log('Starting scheduled order status check');
    await this.checkAllOrderStatuses();
  }

  private async checkAllOrderStatuses(): Promise<void> {
    const activeOrders = await this.prisma.order.findMany({
      where: {
        status: { in: ACTIVE_ORDER_STATUSES },
        providerOrderId: { not: null },
        providerId: { not: null },
      },
      select: {
        id: true,
        providerId: true,
      },
      take: STATUS_CHECK_BATCH_SIZE,
      orderBy: { updatedAt: 'asc' },
    });

    if (activeOrders.length === 0) {
      this.logger.log('No active orders to check');
      return;
    }

    this.logger.log(`Checking status for ${activeOrders.length} active orders`);

    const ordersByProvider = new Map<string, string[]>();
    for (const order of activeOrders) {
      if (order.providerId) {
        const existing = ordersByProvider.get(order.providerId) ?? [];
        existing.push(order.id);
        ordersByProvider.set(order.providerId, existing);
      }
    }

    for (const [providerId, orderIds] of ordersByProvider) {
      this.logger.log(
        `Checking ${orderIds.length} orders for provider ${providerId}`,
      );

      for (const orderId of orderIds) {
        try {
          await this.orderProcessorService.checkOrderStatus(orderId);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Failed to check status for order ${orderId}: ${errorMessage}`,
          );
        }
      }
    }

    this.logger.log('Order status check cycle completed');
  }
}
