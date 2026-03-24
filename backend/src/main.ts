import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CustomValidationPipe } from './common/pipes/validation.pipe';
import { createWinstonLogger } from './common/utils/logger';

async function bootstrap() {
  const logger = createWinstonLogger();
  const app = await NestFactory.create(AppModule, { logger });

  const configService = app.get(ConfigService);

  app.use(helmet());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(CustomValidationPipe);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor(), new LoggingInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SMM Bot API')
    .setDescription('Professional SMM Bot for Telegram & Instagram')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('port', 3000);
  await app.listen(port);
  logger.log(`Application running on port ${port}`, 'Bootstrap');
}
bootstrap();
