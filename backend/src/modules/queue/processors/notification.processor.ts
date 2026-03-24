import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { ORDER_NOTIFICATION_QUEUE } from '../queue.constants';

interface OrderStatusChangedPayload {
  orderId: string;
  oldStatus: string;
  newStatus: string;
}

@Processor(ORDER_NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing notification job: ${job.name}`);

    try {
      switch (job.name) {
        case 'order-status-changed':
          await this.handleOrderStatusChanged(job.data as OrderStatusChangedPayload);
          break;

        default:
          this.logger.warn(`Unknown notification job name: ${job.name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Notification job failed: ${errorMessage}`);
      throw error;
    }
  }

  private async handleOrderStatusChanged(payload: OrderStatusChangedPayload): Promise<void> {
    const { orderId, oldStatus, newStatus } = payload;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, telegramId: true, username: true, language: true } },
        service: { select: { id: true, name: true } },
      },
    });

    if (!order) {
      this.logger.warn(`Order ${orderId} not found for notification`);
      return;
    }

    // TODO: Connect to BotService to send Telegram message to user
    // For now, log the notification that would be sent
    this.logger.log(
      `[NOTIFICATION] Order #${orderId} status changed: ${oldStatus} -> ${newStatus}. ` +
      `User: ${order.user.username ?? order.user.telegramId} (${order.user.id}). ` +
      `Service: ${JSON.stringify(order.service.name)}. ` +
      `Telegram message would be sent to user ${order.user.telegramId}.`,
    );
  }
}
