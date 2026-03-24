import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DashboardStats,
  RevenueChartItem,
  OrderStats,
  UserGrowthItem,
  ProviderStat,
  StatsPeriod,
} from './types/statistics.types';

const CACHE_TTL_SECONDS = 300; // 5 minutes

@Injectable()
export class StatisticsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StatisticsService.name);
  private redis: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('redis.url', 'redis://localhost:6379');
    this.redis = new Redis(redisUrl);
    this.logger.log('Statistics Redis client initialized');
  }

  onModuleDestroy() {
    this.redis?.disconnect();
  }

  async getDashboardStats(): Promise<{ data: DashboardStats }> {
    const cacheKey = 'stats:dashboard';
    const cached = await this.getFromCache<DashboardStats>(cacheKey);
    if (cached) return { data: cached };

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      totalOrders,
      ordersToday,
      activeOrders,
      revenueTotal,
      revenueToday,
      revenueThisWeek,
      revenueThisMonth,
      providerBalances,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfToday }, deletedAt: null } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfWeek }, deletedAt: null } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth }, deletedAt: null } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.order.count({
        where: { status: { in: [OrderStatus.PROCESSING, OrderStatus.IN_PROGRESS] } },
      }),
      this.prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { status: { in: [OrderStatus.COMPLETED, OrderStatus.PARTIAL] } },
      }),
      this.prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          status: { in: [OrderStatus.COMPLETED, OrderStatus.PARTIAL] },
          createdAt: { gte: startOfToday },
        },
      }),
      this.prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          status: { in: [OrderStatus.COMPLETED, OrderStatus.PARTIAL] },
          createdAt: { gte: startOfWeek },
        },
      }),
      this.prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          status: { in: [OrderStatus.COMPLETED, OrderStatus.PARTIAL] },
          createdAt: { gte: startOfMonth },
        },
      }),
      this.prisma.provider.aggregate({ _sum: { balance: true } }),
    ]);

    const stats: DashboardStats = {
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      totalOrders,
      ordersToday,
      activeOrders,
      totalRevenue: Number(revenueTotal._sum.totalPrice || 0),
      revenueToday: Number(revenueToday._sum.totalPrice || 0),
      revenueThisWeek: Number(revenueThisWeek._sum.totalPrice || 0),
      revenueThisMonth: Number(revenueThisMonth._sum.totalPrice || 0),
      totalProviderBalance: Number(providerBalances._sum.balance || 0),
    };

    await this.setCache(cacheKey, stats);

    return { data: stats };
  }

  async getRevenueChart(
    period: StatsPeriod,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<{ data: RevenueChartItem[] }> {
    const cacheKey = `stats:revenue:${period}:${dateFrom || ''}:${dateTo || ''}`;
    const cached = await this.getFromCache<RevenueChartItem[]>(cacheKey);
    if (cached) return { data: cached };

    const truncFn = this.getDateTruncSql(period);
    const whereClause = this.buildDateWhereClause(dateFrom, dateTo);

    const results = await this.prisma.$queryRawUnsafe<Array<{ date: Date; amount: Prisma.Decimal }>>(
      `SELECT date_trunc('${truncFn}', "createdAt") as date, SUM("totalPrice") as amount
       FROM "Order"
       WHERE "status" IN ('COMPLETED', 'PARTIAL') ${whereClause}
       GROUP BY date
       ORDER BY date ASC`,
    );

    const data: RevenueChartItem[] = results.map((r) => ({
      date: new Date(r.date).toISOString().split('T')[0],
      amount: Number(r.amount),
    }));

    await this.setCache(cacheKey, data);

    return { data };
  }

  async getOrdersStats(
    dateFrom?: string,
    dateTo?: string,
  ): Promise<{ data: OrderStats }> {
    const cacheKey = `stats:orders:${dateFrom || ''}:${dateTo || ''}`;
    const cached = await this.getFromCache<OrderStats>(cacheKey);
    if (cached) return { data: cached };

    const dateFilter: Prisma.OrderWhereInput = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.gte = new Date(dateFrom);
      if (dateTo) dateFilter.createdAt.lte = new Date(dateTo);
    }

    const [byStatus, byPlatformRaw, topServicesRaw] = await Promise.all([
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
        where: dateFilter,
      }),
      this.prisma.$queryRawUnsafe<Array<{ platform: string; count: bigint }>>(
        `SELECT c."platform", COUNT(o."id") as count
         FROM "Order" o
         JOIN "Service" s ON o."serviceId" = s."id"
         JOIN "Category" c ON s."categoryId" = c."id"
         ${this.buildDateWhereClauseWithAlias(dateFrom, dateTo, 'o')}
         GROUP BY c."platform"`,
      ),
      this.prisma.$queryRawUnsafe<Array<{ serviceId: string; serviceName: string; count: bigint; revenue: Prisma.Decimal }>>(
        `SELECT o."serviceId", s."name"::text as "serviceName",
                COUNT(o."id") as count, SUM(o."totalPrice") as revenue
         FROM "Order" o
         JOIN "Service" s ON o."serviceId" = s."id"
         ${this.buildDateWhereClauseWithAlias(dateFrom, dateTo, 'o')}
         GROUP BY o."serviceId", s."name"
         ORDER BY count DESC
         LIMIT 10`,
      ),
    ]);

    const stats: OrderStats = {
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      byPlatform: byPlatformRaw.map((p) => ({ platform: p.platform, count: Number(p.count) })),
      topServices: topServicesRaw.map((s) => ({
        serviceId: s.serviceId,
        serviceName: s.serviceName,
        count: Number(s.count),
        revenue: Number(s.revenue),
      })),
    };

    await this.setCache(cacheKey, stats);

    return { data: stats };
  }

  async getUserGrowth(
    period: StatsPeriod,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<{ data: UserGrowthItem[] }> {
    const cacheKey = `stats:users:${period}:${dateFrom || ''}:${dateTo || ''}`;
    const cached = await this.getFromCache<UserGrowthItem[]>(cacheKey);
    if (cached) return { data: cached };

    const truncFn = this.getDateTruncSql(period);
    const whereClause = this.buildDateWhereClause(dateFrom, dateTo);

    const results = await this.prisma.$queryRawUnsafe<Array<{ date: Date; count: bigint }>>(
      `SELECT date_trunc('${truncFn}', "createdAt") as date, COUNT(*) as count
       FROM "User"
       WHERE "deletedAt" IS NULL ${whereClause}
       GROUP BY date
       ORDER BY date ASC`,
    );

    const data: UserGrowthItem[] = results.map((r) => ({
      date: new Date(r.date).toISOString().split('T')[0],
      count: Number(r.count),
    }));

    await this.setCache(cacheKey, data);

    return { data };
  }

  async getProviderStats(): Promise<{ data: ProviderStat[] }> {
    const cacheKey = 'stats:providers';
    const cached = await this.getFromCache<ProviderStat[]>(cacheKey);
    if (cached) return { data: cached };

    const providers = await this.prisma.provider.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { orders: true } },
      },
    });

    const stats: ProviderStat[] = await Promise.all(
      providers.map(async (provider) => {
        const [totalSpentResult, completedCount] = await Promise.all([
          this.prisma.order.aggregate({
            _sum: { totalPrice: true },
            where: { providerId: provider.id },
          }),
          this.prisma.order.count({
            where: {
              providerId: provider.id,
              status: { in: [OrderStatus.COMPLETED, OrderStatus.PARTIAL] },
            },
          }),
        ]);

        const totalOrders = provider._count.orders;
        const successRate = totalOrders > 0 ? (completedCount / totalOrders) * 100 : 0;

        return {
          providerId: provider.id,
          providerName: provider.name,
          ordersCount: totalOrders,
          totalSpent: Number(totalSpentResult._sum.totalPrice || 0),
          successRate: Math.round(successRate * 100) / 100,
        };
      }),
    );

    await this.setCache(cacheKey, stats);

    return { data: stats };
  }

  private getDateTruncSql(period: StatsPeriod): string {
    const periodMap: Record<StatsPeriod, string> = {
      day: 'day',
      week: 'week',
      month: 'month',
    };
    return periodMap[period] || 'day';
  }

  private buildDateWhereClause(dateFrom?: string, dateTo?: string): string {
    let clause = '';
    if (dateFrom) {
      clause += ` AND "createdAt" >= '${new Date(dateFrom).toISOString()}'`;
    }
    if (dateTo) {
      clause += ` AND "createdAt" <= '${new Date(dateTo).toISOString()}'`;
    }
    return clause;
  }

  private buildDateWhereClauseWithAlias(dateFrom?: string, dateTo?: string, alias?: string): string {
    const prefix = alias ? `${alias}.` : '';
    const conditions: string[] = [];

    if (dateFrom) {
      conditions.push(`${prefix}"createdAt" >= '${new Date(dateFrom).toISOString()}'`);
    }
    if (dateTo) {
      conditions.push(`${prefix}"createdAt" <= '${new Date(dateTo).toISOString()}'`);
    }

    return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch (error) {
      this.logger.warn(`Cache read error for key=${key}: ${error}`);
    }
    return null;
  }

  private async setCache(key: string, data: unknown): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(data), 'EX', CACHE_TTL_SECONDS);
    } catch (error) {
      this.logger.warn(`Cache write error for key=${key}: ${error}`);
    }
  }
}
