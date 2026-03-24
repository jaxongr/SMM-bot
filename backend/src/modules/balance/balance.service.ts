import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminAdjustDto } from './dto/admin-adjust.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { buildPaginationMeta, getPaginationParams } from '../../common/types/response.type';

@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, balance: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return { data: { userId: user.id, balance: user.balance } };
  }

  async topUp(
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<Prisma.Decimal> {
    if (amount <= 0) {
      throw new BadRequestException('Top-up amount must be positive');
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });

      const decimalAmount = new Prisma.Decimal(amount);
      const newBalance = user.balance.add(decimalAmount);

      await tx.user.update({
        where: { id: userId },
        data: { balance: newBalance },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.TOPUP,
          amount: decimalAmount,
          balanceAfter: newBalance,
          description,
          metadata: metadata as Prisma.InputJsonValue,
        },
      });

      this.logger.log(`Top-up: user=${userId}, amount=${amount}, newBalance=${newBalance}`);
      return newBalance;
    });
  }

  async deduct(
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<Prisma.Decimal> {
    if (amount <= 0) {
      throw new BadRequestException('Deduction amount must be positive');
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });

      const decimalAmount = new Prisma.Decimal(amount);

      if (user.balance.lessThan(decimalAmount)) {
        throw new BadRequestException(
          `Insufficient balance. Current: ${user.balance}, Required: ${decimalAmount}`,
        );
      }

      const newBalance = user.balance.sub(decimalAmount);

      await tx.user.update({
        where: { id: userId },
        data: { balance: newBalance },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.DEDUCT,
          amount: decimalAmount,
          balanceAfter: newBalance,
          description,
          metadata: metadata as Prisma.InputJsonValue,
        },
      });

      this.logger.log(`Deduct: user=${userId}, amount=${amount}, newBalance=${newBalance}`);
      return newBalance;
    });
  }

  async refund(
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<Prisma.Decimal> {
    if (amount <= 0) {
      throw new BadRequestException('Refund amount must be positive');
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });

      const decimalAmount = new Prisma.Decimal(amount);
      const newBalance = user.balance.add(decimalAmount);

      await tx.user.update({
        where: { id: userId },
        data: { balance: newBalance },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.REFUND,
          amount: decimalAmount,
          balanceAfter: newBalance,
          description,
          metadata: metadata as Prisma.InputJsonValue,
        },
      });

      this.logger.log(`Refund: user=${userId}, amount=${amount}, newBalance=${newBalance}`);
      return newBalance;
    });
  }

  async addReferralBonus(
    userId: string,
    amount: number,
    metadata?: Record<string, unknown>,
  ): Promise<Prisma.Decimal> {
    if (amount <= 0) {
      throw new BadRequestException('Referral bonus amount must be positive');
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });

      const decimalAmount = new Prisma.Decimal(amount);
      const newBalance = user.balance.add(decimalAmount);

      await tx.user.update({
        where: { id: userId },
        data: { balance: newBalance },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.REFERRAL,
          amount: decimalAmount,
          balanceAfter: newBalance,
          description: 'Referral bonus',
          metadata: metadata as Prisma.InputJsonValue,
        },
      });

      this.logger.log(`Referral bonus: user=${userId}, amount=${amount}, newBalance=${newBalance}`);
      return newBalance;
    });
  }

  async adminAdjust(adminId: string, dto: AdminAdjustDto): Promise<Prisma.Decimal> {
    const { userId, amount, description } = dto;

    if (amount === 0) {
      throw new BadRequestException('Adjustment amount cannot be zero');
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });

      const decimalAmount = new Prisma.Decimal(Math.abs(amount));
      const newBalance = amount > 0
        ? user.balance.add(decimalAmount)
        : user.balance.sub(decimalAmount);

      if (newBalance.lessThan(0)) {
        throw new BadRequestException(
          `Adjustment would result in negative balance. Current: ${user.balance}, Adjustment: ${amount}`,
        );
      }

      await tx.user.update({
        where: { id: userId },
        data: { balance: newBalance },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: TransactionType.ADMIN_ADJUST,
          amount: decimalAmount,
          balanceAfter: newBalance,
          description,
          metadata: { adminId, adjustmentDirection: amount > 0 ? 'ADD' : 'SUBTRACT' } as Prisma.InputJsonValue,
        },
      });

      this.logger.log(`Admin adjust: admin=${adminId}, user=${userId}, amount=${amount}, newBalance=${newBalance}`);
      return newBalance;
    });
  }

  async getTransactions(userId: string | undefined, query: TransactionQueryDto) {
    const { page, limit, skip } = getPaginationParams(query);

    const where: Prisma.TransactionWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (query.type) {
      where.type = query.type;
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

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
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
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      meta: buildPaginationMeta(total, page, limit),
    };
  }
}
