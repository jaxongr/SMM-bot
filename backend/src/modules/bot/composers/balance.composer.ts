import { Composer } from 'grammy';
import { Logger } from '@nestjs/common';
import { type Conversation, createConversation } from '@grammyjs/conversations';
import { BotContext } from '../types/context.type';
import { paymentMethodKeyboard } from '../keyboards/inline.keyboard';
import { mainMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { formatPrice } from '../utils/format-message';
import { BalanceService } from '../../balance/balance.service';
import { PaymentsService } from '../../payments/payments.service';
import { PaymentMethod } from '@prisma/client';

const logger = new Logger('BalanceComposer');

const MIN_TOPUP_AMOUNT = 1000;

type TopupConversation = Conversation<BotContext>;

export function createBalanceComposer(
  balanceService: BalanceService,
  paymentsService: PaymentsService,
): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  async function topupFlow(conversation: TopupConversation, ctx: BotContext) {
    const lang = ctx.user?.language || 'uz';

    // Step 1: Select payment method
    await ctx.reply(ctx.t('topup_select_method'), {
      reply_markup: paymentMethodKeyboard(lang),
    });

    const methodCtx = await conversation.waitForCallbackQuery([
      'pay:CLICK',
      'pay:PAYME',
      'back:balance',
    ]);

    if (methodCtx.callbackQuery.data === 'back:balance') {
      await showBalance(ctx, balanceService);
      return;
    }

    const method = methodCtx.callbackQuery.data.replace('pay:', '') as PaymentMethod;
    await methodCtx.answerCallbackQuery();

    // Step 2: Enter amount
    await ctx.reply(ctx.t('topup_enter_amount', { min: MIN_TOPUP_AMOUNT }));

    let amount = 0;
    let validAmount = false;

    while (!validAmount) {
      const amountCtx = await conversation.wait();

      if (!amountCtx.message?.text) {
        await amountCtx.reply(ctx.t('topup_enter_amount', { min: MIN_TOPUP_AMOUNT }));
        continue;
      }

      const parsed = parseInt(amountCtx.message.text.trim(), 10);

      if (isNaN(parsed) || parsed < MIN_TOPUP_AMOUNT) {
        await amountCtx.reply(ctx.t('topup_enter_amount', { min: MIN_TOPUP_AMOUNT }));
        continue;
      }

      amount = parsed;
      validAmount = true;
    }

    // Step 3: Create payment
    try {
      const result = await paymentsService.initiate(ctx.user!.id, {
        amount,
        method,
      });

      const paymentUrl = result.data.paymentUrl || '';
      const paymentInfo = paymentUrl
        ? `\ud83d\udd17 ${paymentUrl}`
        : `Payment ID: ${result.data.paymentId}`;

      await ctx.reply(
        ctx.t('topup_created', {
          amount: formatPrice(amount),
          paymentInfo,
        }),
      );

      // Show main menu
      await ctx.reply(ctx.t('main_menu'), {
        reply_markup: mainMenuKeyboard(lang),
      });

      logger.log(`Topup payment created: userId=${ctx.user!.id}, amount=${amount}, method=${method}`);
    } catch (error) {
      logger.error(`Topup payment creation failed: ${error}`);
      await ctx.reply(ctx.t('order_status_failed'));
    }
  }

  composer.use(createConversation(topupFlow, 'topup-flow'));

  // Topup button callback
  composer.callbackQuery('topup', async (ctx) => {
    await ctx.conversation.enter('topup-flow');
    await ctx.answerCallbackQuery();
  });

  // Back to balance
  composer.callbackQuery('back:balance', async (ctx) => {
    await showBalance(ctx, balanceService);
    await ctx.answerCallbackQuery();
  });

  return composer;
}

export async function showBalance(ctx: BotContext, balanceService: BalanceService): Promise<void> {
  if (!ctx.user) return;

  const lang = ctx.user.language;
  const result = await balanceService.getBalance(ctx.user.id);
  const balance = Number(result.data.balance);

  const { InlineKeyboard } = await import('grammy');
  const keyboard = new InlineKeyboard()
    .text(ctx.t('topup'), 'topup');

  await ctx.reply(ctx.t('balance_info', { balance: formatPrice(balance) }), {
    reply_markup: keyboard,
  });
}
