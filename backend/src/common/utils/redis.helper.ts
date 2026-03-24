import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export function createRedisClient(configService: ConfigService): Redis {
  const url = configService.get<string>('redis.url', 'redis://localhost:6379');
  const password = configService.get<string>('redis.password');
  const parsed = new URL(url);

  return new Redis({
    host: parsed.hostname,
    port: parseInt(parsed.port || '6379', 10),
    password: password || parsed.password || undefined,
    maxRetriesPerRequest: null,
    lazyConnect: true,
  });
}
