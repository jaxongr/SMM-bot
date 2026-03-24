import { Composer } from 'grammy';
import { Logger } from '@nestjs/common';
import { BotContext } from '../types/context.type';
import { smsServiceKeyboard, smsCountryKeyboard, smsBuyKeyboard, smsStatusKeyboard } from '../keyboards/inline.keyboard';
import { mainMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { formatPrice } from '../utils/format-message';
import { PrismaService } from '../../../prisma/prisma.service';
import { BalanceService } from '../../balance/balance.service';

const logger = new Logger('SmsComposer');

// Default SMS services list (can be loaded from DB/API)
const SMS_SERVICES = [
  { code: 'tg', name: 'Telegram', icon: '📱' },
  { code: 'wa', name: 'WhatsApp', icon: '💬' },
  { code: 'ig', name: 'Instagram', icon: '📸' },
  { code: 'fb', name: 'Facebook', icon: '👤' },
  { code: 'tw', name: 'Twitter/X', icon: '🐦' },
  { code: 'gm', name: 'Gmail', icon: '📧' },
  { code: 'tt', name: 'TikTok', icon: '🎵' },
  { code: 'vb', name: 'Viber', icon: '💜' },
  { code: 'ds', name: 'Discord', icon: '🎮' },
  { code: 'ot', name: 'Boshqa', icon: '📋' },
];

// Default countries list (can be loaded from DB/API)
const SMS_COUNTRIES: Record<string, Array<{ code: string; name: string; flag: string; price: number }>> = {
  default: [
    { code: 'uz', name: 'Uzbekistan', flag: '🇺🇿', price: 2500 },
    { code: 'ru', name: 'Russia', flag: '🇷🇺', price: 3500 },
    { code: 'kz', name: 'Kazakhstan', flag: '🇰🇿', price: 3000 },
    { code: 'ua', name: 'Ukraine', flag: '🇺🇦', price: 4000 },
    { code: 'us', name: 'USA', flag: '🇺🇸', price: 8000 },
    { code: 'uk', name: 'UK', flag: '🇬🇧', price: 7000 },
    { code: 'in', name: 'India', flag: '🇮🇳', price: 1500 },
    { code: 'id', name: 'Indonesia', flag: '🇮🇩', price: 2000 },
  ],
};

export function createSmsComposer(
  prisma: PrismaService,
  balanceService: BalanceService,
): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  // Show SMS services list
  composer.callbackQuery(/^sms_service:(.+)$/, async (ctx) => {
    const serviceCode = ctx.match[1];
    const lang = ctx.user?.language || 'uz';

    const service = SMS_SERVICES.find((s) => s.code === serviceCode);
    if (!service) {
      await ctx.answerCallbackQuery({ text: 'Service not found' });
      return;
    }

    const countries = SMS_COUNTRIES[serviceCode] || SMS_COUNTRIES['default'];

    await ctx.editMessageText(
      ctx.t('sms_select_country', { service: `${service.icon} ${service.name}` }),
      {
        parse_mode: 'HTML',
        reply_markup: smsCountryKeyboard(countries, lang),
      },
    );

    // Store selected service in session for later use
    ctx.session.smsService = serviceCode;

    await ctx.answerCallbackQuery();
  });

  // Show price confirmation when country selected
  composer.callbackQuery(/^sms_country:(.+)$/, async (ctx) => {
    const countryCode = ctx.match[1];
    const lang = ctx.user?.language || 'uz';
    const serviceCode = ctx.session.smsService || 'tg';

    const service = SMS_SERVICES.find((s) => s.code === serviceCode);
    const countries = SMS_COUNTRIES[serviceCode] || SMS_COUNTRIES['default'];
    const country = countries.find((c) => c.code === countryCode);

    if (!service || !country) {
      await ctx.answerCallbackQuery({ text: 'Not found' });
      return;
    }

    const userBalance = ctx.user?.balance || 0;

    await ctx.editMessageText(
      ctx.t('sms_price_confirm', {
        service: `${service.icon} ${service.name}`,
        country: `${country.flag} ${country.name}`,
        price: country.price.toLocaleString(),
        balance: formatPrice(userBalance),
      }),
      {
        parse_mode: 'HTML',
        reply_markup: smsBuyKeyboard(lang, serviceCode, countryCode),
      },
    );

    await ctx.answerCallbackQuery();
  });

  // Buy SMS number
  composer.callbackQuery(/^sms_buy:(.+):(.+)$/, async (ctx) => {
    const serviceCode = ctx.match[1];
    const countryCode = ctx.match[2];
    const lang = ctx.user?.language || 'uz';

    if (!ctx.user) return;

    const service = SMS_SERVICES.find((s) => s.code === serviceCode);
    const countries = SMS_COUNTRIES[serviceCode] || SMS_COUNTRIES['default'];
    const country = countries.find((c) => c.code === countryCode);

    if (!service || !country) {
      await ctx.answerCallbackQuery({ text: 'Not found' });
      return;
    }

    // Check balance
    const userBalance = ctx.user.balance;
    if (userBalance < country.price) {
      await ctx.editMessageText(
        ctx.t('sms_insufficient_balance', {
          price: country.price.toLocaleString(),
          balance: formatPrice(userBalance),
        }),
        { parse_mode: 'HTML' },
      );
      await ctx.answerCallbackQuery();
      return;
    }

    try {
      // Deduct balance
      await balanceService.deduct(
        ctx.user.id,
        country.price,
        `SMS: ${service.name} - ${country.name}`,
      );

      // Generate a mock activation (in production, integrate with SMS API)
      const activationId = `sms_${Date.now()}`;
      const phoneNumber = generateMockPhone(countryCode);

      // Store activation in DB
      try {
        await prisma.smsActivation.create({
          data: {
            id: activationId,
            userId: ctx.user.id,
            service: serviceCode,
            country: countryCode,
            phone: phoneNumber,
            price: country.price,
            status: 'WAITING',
            expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes
          },
        });
      } catch {
        // If smsActivation table doesn't exist, continue without DB persistence
        logger.warn('SMS activation table not available, proceeding without DB persistence');
      }

      await ctx.editMessageText(
        ctx.t('sms_purchased', {
          service: `${service.icon} ${service.name}`,
          phone: phoneNumber,
        }),
        {
          parse_mode: 'HTML',
          reply_markup: smsStatusKeyboard(lang, activationId),
        },
      );

      logger.log(`SMS activation created: userId=${ctx.user.id}, service=${serviceCode}, country=${countryCode}`);
    } catch (error) {
      logger.error(`SMS purchase failed: ${error}`);
      await ctx.editMessageText(ctx.t('sms_error'), { parse_mode: 'HTML' });
    }

    await ctx.answerCallbackQuery();
  });

  // Check SMS status
  composer.callbackQuery(/^sms_status:(.+)$/, async (ctx) => {
    const activationId = ctx.match[1];
    const lang = ctx.user?.language || 'uz';

    try {
      const activation = await prisma.smsActivation.findUnique({
        where: { id: activationId },
      });

      if (!activation) {
        await ctx.answerCallbackQuery({ text: 'Activation not found' });
        return;
      }

      if (activation.code) {
        // Code received
        await ctx.editMessageText(
          ctx.t('sms_code_received', {
            phone: activation.phone,
            code: activation.code,
          }),
          { parse_mode: 'HTML' },
        );
      } else if (new Date() > activation.expiresAt) {
        // Expired
        await ctx.editMessageText(
          ctx.t('sms_expired', { phone: activation.phone }),
          { parse_mode: 'HTML' },
        );
      } else {
        // Still waiting
        const remaining = Math.ceil((activation.expiresAt.getTime() - Date.now()) / 60000);
        await ctx.editMessageText(
          ctx.t('sms_waiting', {
            phone: activation.phone,
            time: `${remaining} min`,
          }),
          {
            parse_mode: 'HTML',
            reply_markup: smsStatusKeyboard(lang, activationId),
          },
        );
      }
    } catch {
      await ctx.answerCallbackQuery({ text: 'Status check unavailable' });
    }

    await ctx.answerCallbackQuery();
  });

  // Cancel SMS activation
  composer.callbackQuery(/^sms_cancel:(.+)$/, async (ctx) => {
    const activationId = ctx.match[1];

    if (!ctx.user) return;

    try {
      const activation = await prisma.smsActivation.findUnique({
        where: { id: activationId },
      });

      if (!activation || activation.userId !== ctx.user.id) {
        await ctx.answerCallbackQuery({ text: 'Activation not found' });
        return;
      }

      // Refund balance
      await balanceService.refund(
        ctx.user.id,
        activation.price,
        `SMS refund: ${activation.service}`,
      );

      // Update status
      await prisma.smsActivation.update({
        where: { id: activationId },
        data: { status: 'CANCELED' },
      });

      await ctx.editMessageText(
        ctx.t('sms_canceled', { phone: activation.phone }),
        { parse_mode: 'HTML' },
      );

      logger.log(`SMS activation canceled: id=${activationId}, userId=${ctx.user.id}`);
    } catch (error) {
      logger.error(`SMS cancel failed: ${error}`);
      await ctx.answerCallbackQuery({ text: 'Cancel failed' });
    }

    await ctx.answerCallbackQuery();
  });

  // Back to SMS services list
  composer.callbackQuery('back:sms_services', async (ctx) => {
    const lang = ctx.user?.language || 'uz';
    await ctx.editMessageText(ctx.t('sms_title'), {
      parse_mode: 'HTML',
      reply_markup: smsServiceKeyboard(SMS_SERVICES, lang),
    });
    await ctx.answerCallbackQuery();
  });

  return composer;
}

export async function showSmsServices(ctx: BotContext): Promise<void> {
  const lang = ctx.user?.language || 'uz';
  await ctx.reply(ctx.t('sms_title'), {
    parse_mode: 'HTML',
    reply_markup: smsServiceKeyboard(SMS_SERVICES, lang),
  });
}

function generateMockPhone(countryCode: string): string {
  const prefixes: Record<string, string> = {
    uz: '+998',
    ru: '+7',
    kz: '+7',
    ua: '+380',
    us: '+1',
    uk: '+44',
    in: '+91',
    id: '+62',
  };

  const prefix = prefixes[countryCode] || '+1';
  const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
  return `${prefix}${digits}`;
}
