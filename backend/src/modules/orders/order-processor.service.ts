import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProviderApiService } from '../providers/provider-api.service';
import { BalanceService } from '../balance/balance.service';
import {
  ORDER_NOTIFICATION_QUEUE,
  ORDER_STATUS_CHECK_QUEUE,
} from '../queue/queue.constants';

const PROVIDER_STATUS_MAP: Record<string, OrderStatus> = {
  Pending: OrderStatus.PENDING,
  Processing: OrderStatus.PROCESSING,
  'In progress': OrderStatus.IN_PROGRESS,
  Completed: OrderStatus.COMPLETED,
  Partial: OrderStatus.PARTIAL,
  Canceled: OrderStatus.CANCELED,
  Refunded: OrderStatus.REFUNDED,
  Failed: OrderStatus.FAILED,
};

@Injectable()
export class OrderProcessorService {
  private readonly logger = new Logger(OrderProcessorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providerApiService: ProviderApiService,
    private readonly balanceService: BalanceService,
    @InjectQueue(ORDER_NOTIFICATION_QUEUE)
    private readonly notificationQueue: Queue,
    @InjectQueue(ORDER_STATUS_CHECK_QUEUE)
    private readonly statusCheckQueue: Queue,
  ) {}

  async processOrder(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        service: {
          include: {
            providerMappings: {
              where: { isActive: true, provider: { isActive: true } },
              include: {
                provider: true,
                providerService: true,
              },
              orderBy: { priority: 'desc' },
            },
          },
        },
      },
    });

    if (!order) {
      this.logger.error(`Order not found: ${orderId}`);
      return;
    }

    if (order.status !== OrderStatus.PENDING) {
      this.logger.warn(`Order ${orderId} is not in PENDING status, skipping`);
      return;
    }

    const mappings = order.service.providerMappings;

    if (mappings.length === 0) {
      this.logger.error(`No active provider mappings found for service ${order.serviceId}`);
      await this.failOrderAndRefund(order.id, order.userId, order.totalPrice, 'No provider available');
      return;
    }

    for (const mapping of mappings) {
      try {
        const result = await this.providerApiService.createOrder(
          {
            id: mapping.provider.id,
            apiUrl: mapping.provider.apiUrl,
            apiKey: mapping.provider.apiKey,
          },
          {
            service: mapping.providerService.externalServiceId,
            link: order.link,
            quantity: order.quantity,
            runs: order.dripFeedQuantity ?? undefined,
            interval: order.dripFeedInterval ?? undefined,
          },
        );

        await this.prisma.order.update({
          where: { id: orderId },
          data: {
            providerId: mapping.provider.id,
            providerOrderId: String(result.order),
            status: OrderStatus.PROCESSING,
            providerResponse: result as unknown as Prisma.InputJsonValue,
          },
        });

        this.logger.log(
          `Order ${orderId} sent to provider ${mapping.provider.name}, providerOrderId=${result.order}`,
        );

        await this.notificationQueue.add('order-status-changed', {
          orderId,
          oldStatus: OrderStatus.PENDING,
          newStatus: OrderStatus.PROCESSING,
        });

        return;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(
          `Failed to send order ${orderId} to provider ${mapping.provider.name}: ${errorMessage}`,
        );
      }
    }

    await this.failOrderAndRefund(
      order.id,
      order.userId,
      order.totalPrice,
      'All providers failed to process the order',
    );
  }

  async checkOrderStatus(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { provider: true },
    });

    if (!order || !order.provider || !order.providerOrderId) {
      this.logger.warn(`Order ${orderId} missing provider info, skipping status check`);
      return;
    }

    try {
      const statusResponse = await this.providerApiService.getOrderStatus(
        {
          id: order.provider.id,
          apiUrl: order.provider.apiUrl,
          apiKey: order.provider.apiKey,
        },
        order.providerOrderId,
      );

      const newStatus = PROVIDER_STATUS_MAP[statusResponse.status] ?? order.status;
      const oldStatus = order.status;

      const updateData: Prisma.OrderUpdateInput = {
        startCount: statusResponse.start_count ? parseInt(statusResponse.start_count, 10) : order.startCount,
        remains: statusResponse.remains ? parseInt(statusResponse.remains, 10) : order.remains,
      };

      if (newStatus !== oldStatus) {
        updateData.status = newStatus;

        if (newStatus === OrderStatus.COMPLETED) {
          updateData.completedAt = new Date();
          updateData.remains = 0;
        }

        if (newStatus === OrderStatus.PARTIAL) {
          const remains = parseInt(statusResponse.remains, 10) || 0;
          const deliveredQuantity = order.quantity - remains;
          const pricePerUnit = order.totalPrice.div(order.quantity);
          const refundAmount = pricePerUnit.mul(remains);

          if (refundAmount.greaterThan(0)) {
            await this.balanceService.refund(
              order.userId,
              refundAmount.toNumber(),
              `Partial refund for order #${order.id} (${remains} undelivered)`,
              { orderId: order.id, remains, deliveredQuantity },
            );
          }

          updateData.completedAt = new Date();
          updateData.currentCount = deliveredQuantity;
        }

        if (newStatus === OrderStatus.CANCELED || newStatus === OrderStatus.REFUNDED) {
          updateData.canceledAt = new Date();
          await this.balanceService.refund(
            order.userId,
            order.totalPrice.toNumber(),
            `Refund for canceled order #${order.id}`,
            { orderId: order.id },
          );
        }

        await this.notificationQueue.add('order-status-changed', {
          orderId,
          oldStatus,
          newStatus,
        });
      }

      await this.prisma.order.update({
        where: { id: orderId },
        data: updateData,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to check status for order ${orderId}: ${errorMessage}`);
    }
  }

  async cancelOrderAtProvider(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { provider: true },
    });

    if (!order || !order.provider || !order.providerOrderId) {
      this.logger.warn(`Order ${orderId} missing provider info, cannot cancel at provider`);
      return;
    }

    try {
      await this.providerApiService.cancelOrder(
        {
          id: order.provider.id,
          apiUrl: order.provider.apiUrl,
          apiKey: order.provider.apiKey,
        },
        order.providerOrderId,
      );

      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELED,
          canceledAt: new Date(),
        },
      });

      await this.balanceService.refund(
        order.userId,
        order.totalPrice.toNumber(),
        `Refund for canceled order #${order.id}`,
        { orderId: order.id },
      );

      await this.notificationQueue.add('order-status-changed', {
        orderId,
        oldStatus: order.status,
        newStatus: OrderStatus.CANCELED,
      });

      this.logger.log(`Order ${orderId} canceled at provider`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to cancel order ${orderId} at provider: ${errorMessage}`);

      await this.prisma.order.update({
        where: { id: orderId },
        data: { errorMessage: `Cancel failed: ${errorMessage}` },
      });
    }
  }

  async refillOrderAtProvider(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { provider: true },
    });

    if (!order || !order.provider || !order.providerOrderId) {
      this.logger.warn(`Order ${orderId} missing provider info, cannot refill at provider`);
      return;
    }

    try {
      await this.providerApiService.refillOrder(
        {
          id: order.provider.id,
          apiUrl: order.provider.apiUrl,
          apiKey: order.provider.apiKey,
        },
        order.providerOrderId,
      );

      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          refillCount: { increment: 1 },
          lastRefillAt: new Date(),
          status: OrderStatus.PROCESSING,
        },
      });

      this.logger.log(`Order ${orderId} refill requested at provider`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to refill order ${orderId} at provider: ${errorMessage}`);

      await this.prisma.order.update({
        where: { id: orderId },
        data: { errorMessage: `Refill failed: ${errorMessage}` },
      });
    }
  }

  private async failOrderAndRefund(
    orderId: string,
    userId: string,
    totalPrice: Prisma.Decimal,
    errorMessage: string,
  ): Promise<void> {
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.FAILED,
        errorMessage,
      },
    });

    await this.balanceService.refund(
      userId,
      totalPrice.toNumber(),
      `Refund for failed order #${orderId}`,
      { orderId },
    );

    await this.notificationQueue.add('order-status-changed', {
      orderId,
      oldStatus: OrderStatus.PENDING,
      newStatus: OrderStatus.FAILED,
    });

    this.logger.error(`Order ${orderId} failed: ${errorMessage}. Balance refunded.`);
  }
}
