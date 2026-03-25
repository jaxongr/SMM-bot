import { Composer } from 'grammy';
import { Logger } from '@nestjs/common';
import { type Conversation, createConversation } from '@grammyjs/conversations';
import { BotContext } from '../types/context.type';
import { confirmKeyboard } from '../keyboards/inline.keyboard';
import { mainMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { isValidLink } from '../utils/validate-link';
import { formatPrice } from '../utils/format-message';
import { t, getLang } from '../utils/i18n.helper';
import { ServicesService } from '../../services/services.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { BalanceService } from '../../balance/balance.service';

const logger = new Logger('OrderComposer');

type OrderConversation = Conversation<BotContext>;

export function createOrderComposer(
  servicesService: ServicesService,
  prisma: PrismaService,
  balanceService: BalanceService,
): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  async function orderFlow(conversation: OrderConversation, ctx: BotContext) {
    const callbackData = ctx.callbackQuery?.data;
    if (!callbackData) return;

    const svcId = callbackData.replace('service:', '');

    let service: Awaited<ReturnType<typeof servicesService.findById>>['data'];

    try {
      const result = await servicesService.findById(svcId);
      service = result.data;
    } catch {
      await ctx.reply('Service not found');
      return;
    }

    const lang = getLang(ctx);
    const platform = (service.category as { platform?: string })?.platform || 'TELEGRAM';

    // Step 1: Ask for link
    await ctx.reply(t(ctx, 'enter_link'), { parse_mode: 'HTML' });

    let link = '';
    let validLink = false;

    while (!validLink) {
      const linkCtx = await conversation.wait();

      if (!linkCtx.message?.text) {
        await linkCtx.reply(t(ctx, 'invalid_link'), { parse_mode: 'HTML' });
        continue;
      }

      link = linkCtx.message.text.trim();

      if (!isValidLink(link, platform)) {
        await linkCtx.reply(t(ctx, 'invalid_link'), { parse_mode: 'HTML' });
        continue;
      }

      validLink = true;
    }

    // Step 2: Ask for quantity
    const minQty = service.minQuantity;
    const maxQty = service.maxQuantity;

    await ctx.reply(t(ctx, 'enter_quantity', { min: minQty, max: maxQty }), {
      parse_mode: 'HTML',
    });

    let quantity = 0;
    let validQuantity = false;

    while (!validQuantity) {
      const qtyCtx = await conversation.wait();

      if (!qtyCtx.message?.text) {
        await qtyCtx.reply(t(ctx, 'invalid_quantity', { min: minQty, max: maxQty }), {
          parse_mode: 'HTML',
        });
        continue;
      }

      const parsed = parseInt(qtyCtx.message.text.trim(), 10);

      if (isNaN(parsed) || parsed < minQty || parsed > maxQty) {
        await qtyCtx.reply(t(ctx, 'invalid_quantity', { min: minQty, max: maxQty }), {
          parse_mode: 'HTML',
        });
        continue;
      }

      quantity = parsed;
      validQuantity = true;
    }

    // Step 3: Calculate price and show summary
    const pricePerUnit = Number(service.pricePerUnit);
    const totalPrice = pricePerUnit * quantity;
    const userBalance = ctx.user?.balance || 0;
    const serviceName =
      (service.name as Record<string, string>)[lang] ||
      (service.name as Record<string, string>)['uz'] ||
      'Unknown';

    await ctx.reply(
      t(ctx, 'order_summary', {
        service: serviceName,
        link,
        quantity,
        price: formatPrice(totalPrice),
        balance: formatPrice(userBalance),
      }),
      {
        parse_mode: 'HTML',
        reply_markup: confirmKeyboard(lang),
      },
    );

    // Step 4: Wait for confirmation
    const confirmCtx = await conversation.waitForCallbackQuery([
      'order:confirm',
      'order:cancel',
    ]);

    if (confirmCtx.callbackQuery.data === 'order:cancel') {
      await confirmCtx.editMessageText(t(ctx, 'cancel'), { parse_mode: 'HTML' });
      return;
    }

    // Step 5: Check balance and create order
    if (userBalance < totalPrice) {
      await confirmCtx.editMessageText(
        t(ctx, 'insufficient_balance', {
          required: formatPrice(totalPrice),
          balance: formatPrice(userBalance),
        }),
        { parse_mode: 'HTML' },
      );
      return;
    }

    try {
      // Deduct balance
      await balanceService.deduct(
        ctx.user!.id,
        totalPrice,
        `Order for service: ${serviceName}`,
      );

      // Create order
      const order = await prisma.order.create({
        data: {
          userId: ctx.user!.id,
          serviceId: svcId,
          link,
          quantity,
          totalPrice,
          status: 'PENDING',
        },
      });

      await confirmCtx.editMessageText(
        t(ctx, 'order_created', { orderId: order.id.slice(-6).toUpperCase() }),
        { parse_mode: 'HTML' },
      );

      // Show main menu
      await ctx.reply(t(ctx, 'main_menu'), {
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard(lang),
      });

      logger.log(`Order created: id=${order.id}, userId=${ctx.user!.id}, serviceId=${svcId}`);
    } catch (error) {
      logger.error(`Order creation failed: ${error}`);
      await confirmCtx.editMessageText(t(ctx, 'order_status_failed'), { parse_mode: 'HTML' });
    }
  }

  composer.use(createConversation(orderFlow, 'order-flow'));

  // When user selects a service, start the order conversation
  composer.callbackQuery(/^service:(.+)$/, async (ctx) => {
    await ctx.conversation.enter('order-flow');
  });

  return composer;
}
