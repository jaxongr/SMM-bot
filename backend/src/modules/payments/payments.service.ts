import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, PaymentStatus, PaymentMethod } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BalanceService } from '../balance/balance.service';
import { ClickGateway } from './gateways/click.gateway';
import { PaymeGateway } from './gateways/payme.gateway';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { PaymentGateway, PaymentInitResult } from './gateways/payment-gateway.interface';
import { buildPaginationMeta, getPaginationParams } from '../../common/types/response.type';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly gateways: Map<PaymentMethod, PaymentGateway>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly balanceService: BalanceService,
    private readonly clickGateway: ClickGateway,
    private readonly paymeGateway: PaymeGateway,
  ) {
    this.gateways = new Map<PaymentMethod, PaymentGateway>([
      [PaymentMethod.CLICK, this.clickGateway],
      [PaymentMethod.PAYME, this.paymeGateway],
    ]);
  }

  async initiate(userId: string, dto: CreatePaymentDto) {
    const gateway = this.gateways.get(dto.method);

    if (!gateway) {
      throw new BadRequestException(`Payment method ${dto.method} is not supported`);
    }

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount: new Prisma.Decimal(dto.amount),
        method: dto.method,
        status: PaymentStatus.PENDING,
      },
    });

    let initResult: PaymentInitResult;

    try {
      initResult = await gateway.createPayment(dto.amount, payment.id);
    } catch (error) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      this.logger.error(`Payment initiation failed: ${error}`);
      throw new BadRequestException('Failed to initiate payment');
    }

    this.logger.log(`Payment initiated: id=${payment.id}, userId=${userId}, amount=${dto.amount}, method=${dto.method}`);

    return {
      data: {
        paymentId: payment.id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        paymentUrl: initResult.paymentUrl,
      },
    };
  }

  async findAll(query: PaymentQueryDto, userId?: string) {
    const { page, limit, skip } = getPaginationParams(query);

    const where: Prisma.PaymentWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.method) {
      where.method = query.method;
    }

    if (query.userId && !userId) {
      where.userId = query.userId;
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

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        include: {
          user: {
            select: { id: true, username: true, firstName: true, lastName: true, telegramId: true },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, firstName: true, lastName: true, telegramId: true },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return { data: payment };
  }

  async approve(id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(`Payment is already ${payment.status}`);
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.COMPLETED,
        metadata: {
          ...(payment.metadata as Record<string, unknown> || {}),
          approvedManually: true,
          approvedAt: new Date().toISOString(),
        },
      },
    });

    await this.balanceService.topUp(
      payment.userId,
      Number(payment.amount),
      `Payment top-up (manual approve) #${payment.id}`,
      { paymentId: payment.id, method: payment.method },
    );

    this.logger.log(`Payment manually approved: id=${id}`);

    return { data: updatedPayment };
  }

  async complete(id: string, externalId?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      this.logger.warn(`Payment already completed: id=${id}`);
      return { data: payment };
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(`Payment cannot be completed, current status: ${payment.status}`);
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.COMPLETED,
        externalId: externalId || payment.externalId,
      },
    });

    await this.balanceService.topUp(
      payment.userId,
      Number(payment.amount),
      `Payment top-up #${payment.id}`,
      { paymentId: payment.id, method: payment.method, externalId },
    );

    this.logger.log(`Payment completed: id=${id}, externalId=${externalId}`);

    return { data: updatedPayment };
  }

  async fail(id: string, reason?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(`Payment cannot be failed, current status: ${payment.status}`);
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.FAILED,
        metadata: {
          ...(payment.metadata as Record<string, unknown> || {}),
          failReason: reason,
          failedAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Payment failed: id=${id}, reason=${reason}`);

    return { data: updatedPayment };
  }

  async cancel(id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(`Payment cannot be canceled, current status: ${payment.status}`);
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.CANCELED },
    });

    this.logger.log(`Payment canceled: id=${id}`);

    return { data: updatedPayment };
  }
}
