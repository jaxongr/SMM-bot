import { Composer } from 'grammy';
import { Logger } from '@nestjs/common';
import { type Conversation, createConversation } from '@grammyjs/conversations';
import { BotContext } from '../types/context.type';
import { mainMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { PrismaService } from '../../../prisma/prisma.service';
import { BalanceService } from '../../balance/balance.service';

const logger = new Logger('DiscountComposer');

type DiscountConversation = Conversation<BotContext>;

export function createDiscountComposer(
  prisma: PrismaService,
  balanceService: BalanceService,
): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  async function discountFlow(conversation: DiscountConversation, ctx: BotContext) {
    if (!ctx.user) return;

    const lang = ctx.user.language;

    await ctx.reply(ctx.t('discount_title'), { parse_mode: 'HTML' });

    const codeCtx = await conversation.wait();

    if (!codeCtx.message?.text) {
      await ctx.reply(ctx.t('discount_invalid'), { parse_mode: 'HTML' });
      return;
    }

    const promoCode = codeCtx.message.text.trim().toUpperCase();

    try {
      // Try to find the promo code in DB
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode },
      });

      if (!promo) {
        await ctx.reply(ctx.t('discount_invalid'), { parse_mode: 'HTML' });
        return;
      }

      if (!promo.isActive) {
        await ctx.reply(ctx.t('discount_invalid'), { parse_mode: 'HTML' });
        return;
      }

      // Check if already used by this user
      const alreadyUsed = await prisma.promoUsage.findUnique({
        where: {
          promoId_userId: {
            promoId: promo.id,
            userId: ctx.user.id,
          },
        },
      });

      if (alreadyUsed) {
        await ctx.reply(ctx.t('discount_already_used'), { parse_mode: 'HTML' });
        return;
      }

      // Check expiry
      if (promo.expiresAt && new Date() > promo.expiresAt) {
        await ctx.reply(ctx.t('discount_invalid'), { parse_mode: 'HTML' });
        return;
      }

      // Check max uses
      if (promo.maxUsages !== null && promo.usedCount >= (promo.maxUsages ?? 0)) {
        await ctx.reply(ctx.t('discount_invalid'), { parse_mode: 'HTML' });
        return;
      }

      // Apply promo code — add balance
      const discountAmount = Number(promo.value);

      await balanceService.topUp(
        ctx.user.id,
        discountAmount,
        `Promo code: ${promoCode}`,
        { promoCodeId: promo.id },
      );

      // Record usage and increment used count
      await prisma.promoCode.update({
        where: { id: promo.id },
        data: { usedCount: { increment: 1 } },
      });

      await prisma.promoUsage.create({
        data: {
          promoId: promo.id,
          userId: ctx.user.id,
          amount: promo.value,
        },
      });

      const discountFormatted = `${discountAmount.toLocaleString()} so'm`;

      await ctx.reply(
        ctx.t('discount_success', {
          code: promoCode,
          discount: discountFormatted,
        }),
        { parse_mode: 'HTML' },
      );

      await ctx.reply(ctx.t('main_menu'), {
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard(lang),
      });

      logger.log(`Promo code applied: code=${promoCode}, userId=${ctx.user.id}, amount=${discountAmount}`);
    } catch (error) {
      logger.error(`Promo code application failed: ${error}`);
      await ctx.reply(ctx.t('discount_invalid'), { parse_mode: 'HTML' });
    }
  }

  composer.use(createConversation(discountFlow, 'discount-flow'));

  // Handle inline promo enter button
  composer.callbackQuery('promo:enter', async (ctx) => {
    await ctx.conversation.enter('discount-flow');
    await ctx.answerCallbackQuery();
  });

  return composer;
}

export async function showDiscount(ctx: BotContext): Promise<void> {
  await ctx.conversation.enter('discount-flow');
}
