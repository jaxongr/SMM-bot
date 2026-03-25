import { Composer, InlineKeyboard } from 'grammy';
import { Logger } from '@nestjs/common';
import { BotContext } from '../types/context.type';
import { mainMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { formatPrice, formatDate } from '../utils/format-message';
import { t, getLang } from '../utils/i18n.helper';
import { BalanceService } from '../../balance/balance.service';
import { PrismaService } from '../../../prisma/prisma.service';

const logger = new Logger('BalanceComposer');

async function getCardInfo(prisma: PrismaService): Promise<{ number: string; holder: string }> {
  try {
    const cardNumber = await prisma.setting.findUnique({ where: { key: 'payment_card_number' } });
    const cardHolder = await prisma.setting.findUnique({ where: { key: 'payment_card_holder' } });
    return {
      number: (cardNumber?.value as string) || '8600 0000 0000 0000',
      holder: (cardHolder?.value as string) || 'SMM Bot Admin',
    };
  } catch {
    return { number: '8600 0000 0000 0000', holder: 'SMM Bot Admin' };
  }
}

export function createBalanceComposer(
  balanceService: BalanceService,
  _paymentsService: unknown,
  prisma: PrismaService,
): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  // To'ldirish tugmasi bosilganda
  composer.callbackQuery('topup', async (ctx) => {
    const lang = getLang(ctx);
    const keyboard = new InlineKeyboard()
      .text('🏦 Bank karta (Uzcard/Humo)', 'topup:card')
      .row()
      .text('💳 Click', 'topup:click')
      .row()
      .text('💎 Crypto (USDT)', 'topup:crypto')
      .row()
      .text('👨‍💻 Adminga murojaat', 'topup:admin')
      .row()
      .text('⬅️ Orqaga', 'back:balance');

    await ctx.editMessageText(
      '<b>💳 To\'lov usulini tanlang:</b>\n\n' +
      '🏦 <b>Bank karta</b> — Uzcard/Humo orqali\n' +
      '💳 <b>Click</b> — Click ilovasi orqali\n' +
      '💎 <b>Crypto</b> — USDT (TRC20)\n' +
      '👨‍💻 <b>Admin</b> — bevosita admin bilan',
      { parse_mode: 'HTML', reply_markup: keyboard },
    );
    await ctx.answerCallbackQuery();
  });

  // Bank karta to'lov
  composer.callbackQuery('topup:card', async (ctx) => {
    const card = await getCardInfo(prisma);
    const keyboard = new InlineKeyboard()
      .text('✅ To\'lov qildim', 'topup:card:done')
      .row()
      .text('⬅️ Orqaga', 'topup');

    await ctx.editMessageText(
      '<b>🏦 Bank karta orqali to\'lov</b>\n\n' +
      '📋 Quyidagi karta raqamga pul o\'tkazing:\n\n' +
      `💳 Karta: <code>${card.number}</code>\n` +
      `👤 Egasi: <b>${card.holder}</b>\n\n` +
      '⚠️ <b>Muhim:</b>\n' +
      '• Minimal summa: <b>1,000 so\'m</b>\n' +
      '• To\'lovdan keyin "✅ To\'lov qildim" tugmasini bosing\n' +
      '• Admin tekshirib, balansingizni to\'ldiradi\n' +
      '• O\'rtacha kutish: <b>5-30 daqiqa</b>',
      { parse_mode: 'HTML', reply_markup: keyboard },
    );
    await ctx.answerCallbackQuery();
  });

  // To'lov qildim — summa so'rash
  composer.callbackQuery('topup:card:done', async (ctx) => {
    if (!ctx.user) return;

    await ctx.editMessageText(
      '<b>💰 To\'lov summasini kiriting:</b>\n\n' +
      'Necha so\'m o\'tkazdingiz? Raqam kiriting.\n' +
      'Masalan: <code>50000</code>',
      { parse_mode: 'HTML' },
    );

    // Set session flag to capture next message as payment amount
    if (ctx.session) {
      ctx.session.waitingPaymentAmount = true;
    }
    await ctx.answerCallbackQuery();
  });

  // Capture payment amount and receipt
  composer.on('message:text', async (ctx, next) => {
    if (!ctx.session?.waitingPaymentAmount) {
      return next();
    }

    const amount = parseInt(ctx.message.text.replace(/\s/g, ''), 10);
    if (isNaN(amount) || amount < 1000) {
      await ctx.reply(
        '❌ Noto\'g\'ri summa! Minimal 1,000 so\'m.\nQaytadan kiriting:',
        { parse_mode: 'HTML' },
      );
      return;
    }

    ctx.session.waitingPaymentAmount = false;
    ctx.session.pendingPaymentAmount = amount;
    ctx.session.waitingPaymentReceipt = true;

    await ctx.reply(
      `<b>💰 Summa: ${formatPrice(amount)}</b>\n\n` +
      '📸 Endi to\'lov chekini (screenshot) yuboring:\n\n' +
      '⚠️ Cheksiz to\'lov tasdiqlanmaydi!',
      { parse_mode: 'HTML' },
    );
  });

  // Capture receipt photo
  composer.on('message:photo', async (ctx, next) => {
    if (!ctx.session?.waitingPaymentReceipt) {
      return next();
    }

    if (!ctx.user) return;

    const amount = ctx.session.pendingPaymentAmount as number || 0;
    ctx.session.waitingPaymentReceipt = false;
    ctx.session.pendingPaymentAmount = 0;

    const photo = ctx.message.photo;
    const fileId = photo[photo.length - 1].file_id;

    try {
      await prisma.payment.create({
        data: {
          userId: ctx.user.id,
          amount,
          method: 'BANK',
          status: 'PENDING',
          metadata: {
            type: 'card_transfer',
            telegramId: ctx.user.telegramId.toString(),
            username: ctx.user.username || '',
            firstName: ctx.user.firstName || '',
            receiptFileId: fileId,
          },
        },
      });

      const lang = getLang(ctx);
      await ctx.reply(
        '<b>✅ To\'lov so\'rovi qabul qilindi!</b>\n\n' +
        `💰 Summa: <b>${formatPrice(amount)}</b>\n` +
        '📸 Chek: Qabul qilindi\n\n' +
        '⏱ Admin tekshirib, <b>5-30 daqiqa</b> ichida\n' +
        'balansingizni to\'ldiradi.\n\n' +
        '📋 Holat: <b>Kutilmoqda...</b>',
        {
          parse_mode: 'HTML',
          reply_markup: mainMenuKeyboard(lang),
        },
      );

      logger.log(`Card payment: user=${ctx.user.id}, amount=${amount}, receipt=${fileId}`);
    } catch (error) {
      logger.error(`Payment creation failed: ${error}`);
      await ctx.reply('❌ Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  });

  // Click to'lov
  composer.callbackQuery('topup:click', async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text('⬅️ Orqaga', 'topup');

    await ctx.editMessageText(
      '<b>💳 Click orqali to\'lov</b>\n\n' +
      '🔧 <i>Tez kunda ishga tushadi!</i>\n\n' +
      'Hozircha 🏦 Bank karta orqali to\'lov qilishingiz mumkin.',
      { parse_mode: 'HTML', reply_markup: keyboard },
    );
    await ctx.answerCallbackQuery();
  });

  // Crypto to'lov
  composer.callbackQuery('topup:crypto', async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text('⬅️ Orqaga', 'topup');

    await ctx.editMessageText(
      '<b>💎 Crypto (USDT) orqali to\'lov</b>\n\n' +
      '🔧 <i>Tez kunda ishga tushadi!</i>\n\n' +
      'Hozircha 🏦 Bank karta orqali to\'lov qilishingiz mumkin.',
      { parse_mode: 'HTML', reply_markup: keyboard },
    );
    await ctx.answerCallbackQuery();
  });

  // Admin bilan to'lov
  composer.callbackQuery('topup:admin', async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text('⬅️ Orqaga', 'topup');

    await ctx.editMessageText(
      '<b>👨‍💻 Admin bilan to\'lov</b>\n\n' +
      '📩 Admin bilan bog\'lanish uchun:\n' +
      '👤 @smm_admin\n\n' +
      '💬 Yoki 🆘 Qo\'llab-quvvatlash bo\'limiga yozing.',
      { parse_mode: 'HTML', reply_markup: keyboard },
    );
    await ctx.answerCallbackQuery();
  });

  // Orqaga — balans
  composer.callbackQuery('back:balance', async (ctx) => {
    await showBalance(ctx, balanceService, prisma);
    await ctx.answerCallbackQuery();
  });

  // Balans tarixi
  composer.callbackQuery('balance:history', async (ctx) => {
    await showBalanceHistory(ctx, prisma);
    await ctx.answerCallbackQuery();
  });

  return composer;
}

export async function showBalance(
  ctx: BotContext,
  balanceService: BalanceService,
  prisma?: PrismaService,
): Promise<void> {
  if (!ctx.user) return;

  const result = await balanceService.getBalance(ctx.user.id);
  const balance = Number(result.data.balance);

  const keyboard = new InlineKeyboard()
    .text('💳 Balansni to\'ldirish', 'topup')
    .row()
    .text('📊 To\'lovlar tarixi', 'balance:history');

  const text =
    '<b>💰 Sizning balansingiz</b>\n\n' +
    '┌─────────────────────┐\n' +
    `│  💳 <b>${formatPrice(balance)}</b>\n` +
    '└─────────────────────┘\n\n' +
    '💳 Balansni to\'ldirish uchun tugmani bosing:';

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup: keyboard });
  } else {
    await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
  }
}

async function showBalanceHistory(ctx: BotContext, prisma: PrismaService): Promise<void> {
  if (!ctx.user) return;

  const keyboard = new InlineKeyboard()
    .text('⬅️ Orqaga', 'back:balance');

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (transactions.length === 0) {
      await ctx.editMessageText(
        '<b>📊 To\'lovlar tarixi</b>\n\n📭 Hali to\'lovlar yo\'q.',
        { parse_mode: 'HTML', reply_markup: keyboard },
      );
      return;
    }

    const lines = transactions.map((tx) => {
      const amount = Number(tx.amount);
      const sign = amount >= 0 ? '+' : '';
      const date = formatDate(tx.createdAt).split(' ')[0];
      const desc = tx.description || tx.type;
      return `${sign}${formatPrice(amount)} — ${desc} (${date})`;
    });

    await ctx.editMessageText(
      '<b>📊 To\'lovlar tarixi</b>\n\n' + lines.join('\n'),
      { parse_mode: 'HTML', reply_markup: keyboard },
    );
  } catch {
    await ctx.editMessageText(
      '<b>📊 To\'lovlar tarixi</b>\n\n📭 Hali to\'lovlar yo\'q.',
      { parse_mode: 'HTML', reply_markup: keyboard },
    );
  }
}
