import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
  APP_PORT: Joi.number().default(3000),
  APP_URL: Joi.string().default('http://localhost:3000'),

  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().default('redis://localhost:6379'),

  JWT_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

  TELEGRAM_BOT_TOKEN: Joi.string().required(),
  TELEGRAM_WEBHOOK_URL: Joi.string().optional(),

  CLICK_MERCHANT_ID: Joi.string().optional().allow(''),
  CLICK_SERVICE_ID: Joi.string().optional().allow(''),
  CLICK_SECRET_KEY: Joi.string().optional().allow(''),

  PAYME_MERCHANT_ID: Joi.string().optional().allow(''),
  PAYME_SECRET_KEY: Joi.string().optional().allow(''),

  SENTRY_DSN: Joi.string().optional().allow(''),

  ADMIN_DEFAULT_USERNAME: Joi.string().default('admin'),
  ADMIN_DEFAULT_PASSWORD: Joi.string().default('admin123'),
});
