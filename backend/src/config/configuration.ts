export default () => ({
  port: parseInt(process.env.APP_PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:3000',

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
  },

  click: {
    merchantId: process.env.CLICK_MERCHANT_ID,
    serviceId: process.env.CLICK_SERVICE_ID,
    secretKey: process.env.CLICK_SECRET_KEY,
  },

  payme: {
    merchantId: process.env.PAYME_MERCHANT_ID,
    secretKey: process.env.PAYME_SECRET_KEY,
  },

  sentry: {
    dsn: process.env.SENTRY_DSN,
  },

  admin: {
    defaultUsername: process.env.ADMIN_DEFAULT_USERNAME || 'admin',
    defaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || 'admin123',
  },
});
