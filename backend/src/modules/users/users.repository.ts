import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UserQueryDto } from './dto/user-query.dto';
import { getPaginationParams } from '../../common/types/response.type';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        referredBy: {
          select: { id: true, username: true, firstName: true, telegramId: true },
        },
      },
    });
  }

  async findByTelegramId(telegramId: bigint) {
    return this.prisma.user.findUnique({
      where: { telegramId },
    });
  }

  async findByReferralCode(code: string) {
    return this.prisma.user.findUnique({
      where: { referralCode: code },
    });
  }

  async findAll(params: UserQueryDto) {
    const { limit, skip } = getPaginationParams(params);
    const where = this.buildWhereClause(params);
    const orderBy = this.buildOrderBy(params.sortBy, params.sortOrder);

    return this.prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        referredBy: {
          select: { id: true, username: true, firstName: true },
        },
        _count: {
          select: { orders: true, referrals: true },
        },
      },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateBalance(id: string, amount: Prisma.Decimal) {
    return this.prisma.user.update({
      where: { id },
      data: {
        balance: { increment: amount },
      },
    });
  }

  async countAll(params: UserQueryDto): Promise<number> {
    const where = this.buildWhereClause(params);
    return this.prisma.user.count({ where });
  }

  async findReferrals(userId: string, skip: number, take: number) {
    return this.prisma.user.findMany({
      where: { referredById: userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });
  }

  async countReferrals(userId: string): Promise<number> {
    return this.prisma.user.count({
      where: { referredById: userId },
    });
  }

  private buildWhereClause(params: UserQueryDto): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (params.search) {
      where.OR = [
        { username: { contains: params.search, mode: 'insensitive' } },
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search, mode: 'insensitive' } },
      ];

      try {
        const telegramId = BigInt(params.search);
        where.OR.push({ telegramId });
      } catch {
        // Not a valid BigInt, skip telegramId filter
      }
    }

    if (params.role) {
      where.role = params.role;
    }

    if (params.isBlocked !== undefined) {
      where.isBlocked = params.isBlocked;
    }

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) {
        where.createdAt.gte = new Date(params.dateFrom);
      }
      if (params.dateTo) {
        where.createdAt.lte = new Date(params.dateTo);
      }
    }

    return where;
  }

  private buildOrderBy(
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Prisma.UserOrderByWithRelationInput {
    const allowedSortFields = ['createdAt', 'balance', 'username', 'firstName', 'role'];
    const field = allowedSortFields.includes(sortBy ?? '') ? sortBy : 'createdAt';
    const order = sortOrder ?? 'desc';

    return { [field!]: order };
  }
}
