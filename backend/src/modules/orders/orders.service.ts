import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BalanceService } from '../balance/balance.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { buildPaginationMeta, getPaginationParams } from '../../common/types/response.type';
import { ORDER_PROCESSING_QUEUE } from '../queue/queue.constants';

const CANCELLABLE_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PROCESSING,
];

const REFILLABLE_STATUSES: OrderStatus[] = [
  OrderStatus.COMPLETED,
  OrderStatus.PARTIAL,
];

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly balanceService: BalanceService,
    @InjectQueue(ORDER_PROCESSING_QUEUE)
    private readonly orderProcessingQueue: Queue,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${dto.serviceId} not found`);
    }

    if (!service.isActive) {
      throw new BadRequestException('This service is currently unavailable');
    }

    if (dto.quantity < service.minQuantity || dto.quantity > service.maxQuantity) {
      throw new BadRequestException(
        `Quantity must be between ${service.minQuantity} and ${service.maxQuantity}`,
      );
    }

    if (dto.dripFeedInterval && !service.dripFeed) {
      throw new BadRequestException('This service does not support drip feed');
    }

    const totalPrice = service.pricePerUnit.mul(dto.quantity);

    await this.balanceService.deduct(
      userId,
      totalPrice.toNumber(),
      `Order for service: ${dto.serviceId}`,
      { serviceId: dto.serviceId, link: dto.link, quantity: dto.quantity },
    );

    const order = await this.prisma.order.create({
      data: {
        userId,
        serviceId: dto.serviceId,
        link: dto.link,
        quantity: dto.quantity,
        totalPrice,
        status: OrderStatus.PENDING,
        dripFeedInterval: dto.dripFeedInterval,
        dripFeedQuantity: dto.dripFeedQuantity,
      },
      include: {
        service: {
          select: { id: true, name: true, categoryId: true },
        },
      },
    });

    await this.orderProcessingQueue.add(
      'process-order',
      { orderId: order.id },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    );

    this.logger.log(
      `Order created: id=${order.id}, userId=${userId}, serviceId=${dto.serviceId}, quantity=${dto.quantity}, totalPrice=${totalPrice}`,
    );

    return { data: order };
  }

  async findAll(query: OrderQueryDto, userId?: string) {
    const { page, limit, skip } = getPaginationParams(query);

    const where: Prisma.OrderWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.serviceId) {
      where.serviceId = query.serviceId;
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) {
        where.createdAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.createdAt.lte = new Date(query.dateTo);
      }
    }

    if (query.search) {
      where.link = { contains: query.search, mode: 'insensitive' };
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          service: {
            select: { id: true, name: true },
          },
          user: {
            select: { id: true, username: true, firstName: true, telegramId: true },
          },
          provider: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        service: {
          select: { id: true, name: true, categoryId: true, pricePerUnit: true },
        },
        user: {
          select: { id: true, username: true, firstName: true, telegramId: true },
        },
        provider: {
          select: { id: true, name: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return { data: order };
  }

  async cancelOrder(id: string, userId: string, isAdmin = false) {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (!isAdmin && order.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      throw new BadRequestException(
        `Order cannot be canceled in ${order.status} status. Cancellable statuses: ${CANCELLABLE_STATUSES.join(', ')}`,
      );
    }

    if (order.providerOrderId) {
      await this.orderProcessingQueue.add(
        'cancel-order',
        { orderId: order.id },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        },
      );
    } else {
      await this.prisma.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELED, canceledAt: new Date() },
      });

      await this.balanceService.refund(
        order.userId,
        order.totalPrice.toNumber(),
        `Refund for canceled order #${order.id}`,
        { orderId: order.id },
      );
    }

    this.logger.log(`Order cancel requested: id=${id}, userId=${userId}`);
    return { data: { message: 'Cancel request submitted' } };
  }

  async refillOrder(id: string, userId: string, isAdmin = false) {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (!isAdmin && order.userId !== userId) {
      throw new ForbiddenException('You can only refill your own orders');
    }

    if (!REFILLABLE_STATUSES.includes(order.status)) {
      throw new BadRequestException(
        `Order cannot be refilled in ${order.status} status. Refillable statuses: ${REFILLABLE_STATUSES.join(', ')}`,
      );
    }

    if (!order.providerOrderId) {
      throw new BadRequestException('Order has no provider order ID, cannot refill');
    }

    await this.orderProcessingQueue.add(
      'refill-order',
      { orderId: order.id },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );

    this.logger.log(`Order refill requested: id=${id}, userId=${userId}`);
    return { data: { message: 'Refill request submitted' } };
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [statusCounts, todayOrders, revenueResult] = await Promise.all([
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          status: { in: [OrderStatus.COMPLETED, OrderStatus.PARTIAL, OrderStatus.PROCESSING, OrderStatus.IN_PROGRESS] },
        },
      }),
    ]);

    const statusMap: Record<string, number> = {};
    for (const item of statusCounts) {
      statusMap[item.status] = item._count.id;
    }

    return {
      data: {
        byStatus: statusMap,
        todayOrders,
        totalRevenue: revenueResult._sum.totalPrice ?? new Prisma.Decimal(0),
        totalOrders: Object.values(statusMap).reduce((sum, count) => sum + count, 0),
      },
    };
  }
}
