import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot, session, GrammyError, HttpError } from 'grammy';
import { conversations } from '@grammyjs/conversations';
import { BotContext, SessionData } from './types/context.type';
import { createAuthMiddleware } from './middlewares/auth.middleware';
import { createI18nMiddleware } from './middlewares/i18n.middleware';
import { createStartComposer } from './composers/start.composer';
import { createMenuComposer } from './composers/menu.composer';
import { createServicesComposer, showPlatforms } from './composers/services.composer';
import { createOrderComposer } from './composers/order.composer';
import { createBalanceComposer, showBalance } from './composers/balance.composer';
import { createHistoryComposer, showOrders } from './composers/history.composer';
import { createReferralComposer, showReferral } from './composers/referral.composer';
import { createProfileComposer, showProfile } from './composers/profile.composer';
import { createSupportComposer, showSupport } from './composers/support.composer';
import { createLanguageComposer, showLanguage } from './composers/language.composer';
import { createSmsComposer, showSmsServices } from './composers/sms.composer';
import { createGuideComposer, showGuide } from './composers/guide.composer';
import { createPartnershipComposer, showPartnership } from './composers/partnership.composer';
import { createDiscountComposer, showDiscount } from './composers/discount.composer';
import { UsersService } from '../users/users.service';
import { CategoriesService } from '../services/categories.service';
import { ServicesService } from '../services/services.service';
import { BalanceService } from '../balance/balance.service';
import { PaymentsService } from '../payments/payments.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BotService.name);
  private bot: Bot<BotContext>;
  private readonly botToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
    private readonly servicesService: ServicesService,
    private readonly balanceService: BalanceService,
    private readonly paymentsService: PaymentsService,
    private readonly prisma: PrismaService,
  ) {
    this.botToken = this.configService.get<string>('telegram.botToken', '');

    if (!this.botToken) {
      this.logger.warn('TELEGRAM_BOT_TOKEN is not set. Bot will not start.');
      return;
    }

    this.bot = new Bot<BotContext>(this.botToken);
    this.setupMiddlewares();
    this.setupComposers();
    this.setupErrorHandler();
  }

  private setupMiddlewares(): void {
    // Session middleware
    this.bot.use(
      session({
        initial: (): SessionData => ({
          language: 'uz',
        }),
      }),
    );

    // Conversations middleware (must be before composers that use conversations)
    this.bot.use(conversations());

    // Auth middleware — loads/creates user
    this.bot.use(createAuthMiddleware(this.usersService));

    // i18n middleware — provides ctx.t()
    this.bot.use(createI18nMiddleware());
  }

  private setupComposers(): void {
    // Balance and topup flow — MUST be before menu to capture payment amount/receipt
    this.bot.use(createBalanceComposer(this.balanceService, this.paymentsService, this.prisma));

    // Start command
    this.bot.use(createStartComposer(this.usersService));

    // SMS activation
    this.bot.use(createSmsComposer(this.prisma, this.balanceService));

    // Service browsing
    this.bot.use(createServicesComposer(this.categoriesService, this.servicesService));

    // Order flow (with conversations)
    this.bot.use(createOrderComposer(this.servicesService, this.prisma, this.balanceService));

    // Order history
    this.bot.use(createHistoryComposer(this.prisma));

    // Referral
    this.bot.use(createReferralComposer(this.prisma, this.configService));

    // Profile
    this.bot.use(createProfileComposer(this.prisma));

    // Support (with conversations)
    this.bot.use(createSupportComposer(this.prisma));

    // Language
    this.bot.use(createLanguageComposer(this.prisma));

    // Guide
    this.bot.use(createGuideComposer());

    // Partnership
    this.bot.use(createPartnershipComposer(this.prisma));

    // Discount (with conversations)
    this.bot.use(createDiscountComposer(this.prisma, this.balanceService));

    // Menu composer — routes text button presses to handlers (must be last)
    this.bot.use(
      createMenuComposer({
        onSms: async (ctx) => showSmsServices(ctx),
        onServices: async (ctx) => showPlatforms(ctx),
        onOrders: async (ctx) => showOrders(ctx, this.prisma),
        onReferral: async (ctx) => showReferral(ctx, this.prisma, this.configService),
        onBalance: async (ctx) => showBalance(ctx, this.balanceService, this.prisma),
        onPayment: async (ctx) => showBalance(ctx, this.balanceService, this.prisma),
        onGuide: async (ctx) => showGuide(ctx),
        onSupport: async (ctx) => showSupport(ctx),
        onPartnership: async (ctx) => showPartnership(ctx),
        onDiscount: async (ctx) => showDiscount(ctx),
      }),
    );
  }

  private setupErrorHandler(): void {
    this.bot.catch((err) => {
      const ctx = err.ctx;
      const error = err.error;

      this.logger.error(`Error while handling update ${ctx.update.update_id}:`);

      if (error instanceof GrammyError) {
        this.logger.error(`Error in request: ${error.description}`);
      } else if (error instanceof HttpError) {
        this.logger.error(`Could not contact Telegram: ${error}`);
      } else {
        this.logger.error(`Unknown error: ${error}`);
      }
    });
  }

  async onModuleInit(): Promise<void> {
    if (!this.botToken || !this.bot) {
      this.logger.warn('Bot token not configured, skipping bot startup');
      return;
    }

    const nodeEnv = this.configService.get<string>('nodeEnv', 'development');

    if (nodeEnv === 'production') {
      const webhookUrl = this.configService.get<string>('telegram.webhookUrl');
      if (webhookUrl) {
        await this.bot.api.setWebhook(webhookUrl);
        this.logger.log(`Bot webhook set to: ${webhookUrl}`);
      } else {
        this.logger.warn('TELEGRAM_WEBHOOK_URL not set, starting polling in production');
        this.bot.start();
      }
    } else {
      // Development: use long polling
      this.bot.start();
      this.logger.log('Bot started with long polling');
    }

    const botInfo = await this.bot.api.getMe();
    this.logger.log(`Bot started: @${botInfo.username}`);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.bot) {
      await this.bot.stop();
      this.logger.log('Bot stopped');
    }
  }

  getBotInstance(): Bot<BotContext> {
    return this.bot;
  }

  async sendMessage(
    telegramId: bigint | number | string,
    text: string,
    options?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.bot) {
      this.logger.warn('Bot not initialized, cannot send message');
      return;
    }

    try {
      await this.bot.api.sendMessage(Number(telegramId), text, {
        parse_mode: 'HTML',
        ...options,
      });
    } catch (error) {
      this.logger.error(`Failed to send message to ${telegramId}: ${error}`);
    }
  }
}
