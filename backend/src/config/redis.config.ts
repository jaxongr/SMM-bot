import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export const getRedisConfig = (configService: ConfigService): RedisOptions => {
  const url = configService.get<string>('redis.url', 'redis://localhost:6379');
  const parsed = new URL(url);
  const redisPassword = process.env.REDIS_PASSWORD || parsed.password || undefined;

  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || '6379', 10),
    password: redisPassword,
    maxRetriesPerRequest: null,
  };
};
