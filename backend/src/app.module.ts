import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { envValidationSchema } from './config/validation';
import { getRedisConfig } from './config/redis.config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ServicesModule } from './modules/services/services.module';
import { BalanceModule } from './modules/balance/balance.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { BotModule } from './modules/bot/bot.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SupportModule } from './modules/support/support.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { SettingsModule } from './modules/settings/settings.module';
import { QueueModule } from './modules/queue/queue.module';
import { HealthModule } from './modules/health/health.module';
import { SmsModule } from './modules/sms/sms.module';
import { PromoModule } from './modules/promo/promo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: getRedisConfig(configService),
      }),
    }),

    ScheduleModule.forRoot(),

    PrismaModule,
    AuthModule,
    UsersModule,
    ServicesModule,
    BalanceModule,
    OrdersModule,
    ProvidersModule,
    PaymentsModule,
    BotModule,
    NotificationsModule,
    SupportModule,
    StatisticsModule,
    SettingsModule,
    QueueModule,
    HealthModule,
    SmsModule,
    PromoModule,
  ],
})
export class AppModule {}
