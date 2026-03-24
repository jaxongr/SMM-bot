import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export const getRedisConfig = (configService: ConfigService): RedisOptions => {
  const url = configService.get<string>('redis.url', 'redis://localhost:6379');
  const password = configService.get<string>('redis.password');
  const parsed = new URL(url);

  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || '6379', 10),
    password: password || parsed.password || undefined,
    maxRetriesPerRequest: null,
  };
};

export const getRedisUrl = (configService: ConfigService): string => {
  const url = configService.get<string>('redis.url', 'redis://localhost:6379');
  const password = configService.get<string>('redis.password');

  if (password) {
    const parsed = new URL(url);
    parsed.password = password;
    return parsed.toString();
  }

  return url;
};
