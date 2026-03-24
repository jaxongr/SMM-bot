import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';

interface HealthStatus {
  status: 'ok' | 'error';
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
  };
  timestamp: string;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  private redis: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const redisUrl = this.configService.get<string>('redis.url', 'redis://localhost:6379');
    this.redis = new Redis(redisUrl);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check — database and Redis status' })
  async check(): Promise<HealthStatus> {
    let databaseStatus: 'up' | 'down' = 'down';
    let redisStatus: 'up' | 'down' = 'down';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'up';
    } catch (error) {
      this.logger.error(`Database health check failed: ${error}`);
    }

    try {
      const pong = await this.redis.ping();
      if (pong === 'PONG') {
        redisStatus = 'up';
      }
    } catch (error) {
      this.logger.error(`Redis health check failed: ${error}`);
    }

    const allUp = databaseStatus === 'up' && redisStatus === 'up';

    return {
      status: allUp ? 'ok' : 'error',
      services: {
        database: databaseStatus,
        redis: redisStatus,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
