import { Composer } from 'grammy';
import { Logger } from '@nestjs/common';
import { type Conversation, createConversation } from '@grammyjs/conversations';
import { BotContext } from '../types/context.type';
import { paymentMethodKeyboard, balanceKeyboard } from '../keyboards/inline.keyboard';
import { mainMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { formatPrice, formatDate } from '../utils/format-message';
import { BalanceService } from '../../balance/balance.service';
import { PaymentsService } from '../../payments/payments.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';

const logger = new Logger('BalanceComposer');

const MIN_TOPUP_AMOUNT = 1000;

type TopupConversation = Conversation<BotContext>;

export function createBalanceComposer(
  balanceService: BalanceService,
  paymentsService: PaymentsService,
  prisma: PrismaService,
): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  async function topupFlow(conversation: TopupConversation, ctx: BotContext) {
    const lang = ctx.user?.language || 'uz';

    await ctx.reply(ctx.t('topup_select_method'), {
      parse_mode: 'HTML',
      reply_markup: paymentMethodKeyboard(lang),
    });

    const methodCtx = await conversation.waitForCallbackQuery([
      'pay:CLICK',
      'pay:HUMO',
      'pay:BANK',
      'pay:CRYPTO',
      'pay:ADMIN',
      'back:balance',
    ]);

    if (methodCtx.callbackQuery.data === 'back:balance') {
      await showBalance(ctx, balanceService, prisma);
      return;
    }

    const method = methodCtx.callbackQuery.data.replace('pay:', '') as PaymentMethod;
    await methodCtx.answerCallbackQuery();

    await ctx.reply(ctx.t('topup_enter_amount', { min: MIN_TOPUP_AMOUNT }), {
      parse_mode: 'HTML',
    });

    let amount = 0;
    let validAmount = false;

    while (!validAmount) {
      const amountCtx = await conversation.wait();

      if (!amountCtx.message?.text) {
        await amountCtx.reply(ctx.t('topup_enter_amount', { min: MIN_TOPUP_AMOUNT }), {
          parse_mode: 'HTML',
        });
        continue;
      }

      const parsed = parseInt(amountCtx.message.text.trim(), 10);

      if (isNaN(parsed) || parsed < MIN_TOPUP_AMOUNT) {
        await amountCtx.reply(ctx.t('topup_enter_amount', { min: MIN_TOPUP_AMOUNT }), {
          parse_mode: 'HTML',
        });
        continue;
      }

      amount = parsed;
      validAmount = true;
    }

    try {
      const result = await paymentsService.initiate(ctx.user!.id, {
        amount,
        method,
      });

      const paymentUrl = result.data.paymentUrl || '';
      const paymentInfo = paymentUrl
        ? `🔗 <a href="${paymentUrl}">To'lov sahifasi</a>`
        : `🆔 Payment ID: <code>${result.data.paymentId}</code>`;

      await ctx.reply(
        ctx.t('topup_created', {
          amount: formatPrice(amount),
          paymentInfo,
        }),
        { parse_mode: 'HTML' },
      );

      await ctx.reply(ctx.t('main_menu'), {
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard(lang),
      });

      logger.log(`Topup payment created: userId=${ctx.user!.id}, amount=${amount}, method=${method}`);
    } catch (error) {
      logger.error(`Topup payment creation failed: ${error}`);
      await ctx.reply(ctx.t('order_status_failed'), { parse_mode: 'HTML' });
    }
  }

  composer.use(createConversation(topupFlow, 'topup-flow'));

  composer.callbackQuery('topup', async (ctx) => {
    await ctx.conversation.enter('topup-flow');
    await ctx.answerCallbackQuery();
  });

  composer.callbackQuery('back:balance', async (ctx) => {
    await showBalance(ctx, balanceService, prisma);
    await ctx.answerCallbackQuery();
  });

  composer.callbackQuery('balance:history', async (ctx) => {
    await showBalanceWithHistory(ctx, balanceService, prisma);
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

  const lang = ctx.user.language;
  const result = await balanceService.getBalance(ctx.user.id);
  const balance = Number(result.data.balance);

  await ctx.reply(
    ctx.t('balance_info', { balance: formatPrice(balance) }),
    {
      parse_mode: 'HTML',
      reply_markup: balanceKeyboard(lang),
    },
  );
}

async function showBalanceWithHistory(
  ctx: BotContext,
  balanceService: BalanceService,
  prisma: PrismaService,
): Promise<void> {
  if (!ctx.user) return;

  const lang = ctx.user.language;
  const result = await balanceService.getBalance(ctx.user.id);
  const balance = Number(result.data.balance);

  let historyText = '';

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (transactions.length > 0) {
      const lines: string[] = [];
      for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i];
        const txAmount = Number(tx.amount);
        const sign = txAmount >= 0 ? '+' : '';
        const date = formatDate(tx.createdAt).split(' ')[0];
        const desc = tx.description || tx.type;
        const prefix = i === transactions.length - 1 ? '└' : '├';
        lines.push(`${prefix} ${sign}${formatPrice(txAmount)} (${desc}) — ${date}`);
      }
      historyText = lines.join('\n');
    }
  } catch {
    // If no transaction table, just show balance
  }

  if (historyText) {
    await ctx.reply(
      ctx.t('balance_with_history', {
        balance: formatPrice(balance),
        history: historyText,
      }),
      {
        parse_mode: 'HTML',
        reply_markup: balanceKeyboard(lang),
      },
    );
  } else {
    await ctx.reply(
      ctx.t('balance_info', { balance: formatPrice(balance) }),
      {
        parse_mode: 'HTML',
        reply_markup: balanceKeyboard(lang),
      },
    );
  }
}
