import { Injectable, Logger, NotFoundException, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingItem } from './dto/bulk-update-settings.dto';

const CACHE_PREFIX = 'setting:';
const CACHE_TTL_SECONDS = 1800; // 30 minutes

@Injectable()
export class SettingsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SettingsService.name);
  private redis: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('redis.url', 'redis://localhost:6379');
    this.redis = new Redis(redisUrl);
    this.logger.log('Settings Redis client initialized');
  }

  onModuleDestroy() {
    this.redis?.disconnect();
  }

  async findAll(group?: string) {
    const where: Prisma.SettingWhereInput = {};

    if (group) {
      where.group = group;
    }

    const settings = await this.prisma.setting.findMany({
      where,
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });

    return { data: settings };
  }

  async get(key: string) {
    const cacheKey = `${CACHE_PREFIX}${key}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return { data: { key, value: JSON.parse(cached) } };
      }
    } catch (error) {
      this.logger.warn(`Cache read error for setting key=${key}: ${error}`);
    }

    const setting = await this.prisma.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }

    try {
      await this.redis.set(cacheKey, JSON.stringify(setting.value), 'EX', CACHE_TTL_SECONDS);
    } catch (error) {
      this.logger.warn(`Cache write error for setting key=${key}: ${error}`);
    }

    return { data: setting };
  }

  async set(key: string, value: unknown) {
    const setting = await this.prisma.setting.upsert({
      where: { key },
      update: { value: value as Prisma.InputJsonValue },
      create: {
        key,
        value: value as Prisma.InputJsonValue,
      },
    });

    await this.invalidateCache(key);

    this.logger.log(`Setting updated: key=${key}`);

    return { data: setting };
  }

  async bulkUpdate(settings: SettingItem[]) {
    const results = await this.prisma.$transaction(
      settings.map((item) =>
        this.prisma.setting.upsert({
          where: { key: item.key },
          update: { value: item.value as Prisma.InputJsonValue },
          create: {
            key: item.key,
            value: item.value as Prisma.InputJsonValue,
          },
        }),
      ),
    );

    const keys = settings.map((s) => s.key);
    await Promise.all(keys.map((key) => this.invalidateCache(key)));

    this.logger.log(`Bulk settings updated: keys=${keys.join(', ')}`);

    return { data: results };
  }

  private async invalidateCache(key: string): Promise<void> {
    try {
      await this.redis.del(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      this.logger.warn(`Cache invalidation error for setting key=${key}: ${error}`);
    }
  }
}
