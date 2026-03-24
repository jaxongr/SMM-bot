import { Composer } from 'grammy';
import { Logger } from '@nestjs/common';
import { BotContext } from '../types/context.type';
import { paginationKeyboard } from '../keyboards/inline.keyboard';
import { formatPrice, formatDate, formatOrderStatus } from '../utils/format-message';
import { PrismaService } from '../../../prisma/prisma.service';

const logger = new Logger('HistoryComposer');

const ORDERS_PER_PAGE = 5;

export function createHistoryComposer(prisma: PrismaService): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  // Pagination callback
  composer.callbackQuery(/^orders_page:(\d+)$/, async (ctx) => {
    const page = parseInt(ctx.match[1], 10);
    await showOrders(ctx, prisma, page);
    await ctx.answerCallbackQuery();
  });

  // Order detail callback
  composer.callbackQuery(/^order:detail:(.+)$/, async (ctx) => {
    const orderId = ctx.match[1];
    await showOrderDetail(ctx, prisma, orderId);
    await ctx.answerCallbackQuery();
  });

  return composer;
}

export async function showOrders(ctx: BotContext, prisma: PrismaService, page = 1): Promise<void> {
  if (!ctx.user) return;

  const lang = ctx.user.language;
  const skip = (page - 1) * ORDERS_PER_PAGE;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: ctx.user.id },
      skip,
      take: ORDERS_PER_PAGE,
      orderBy: { createdAt: 'desc' },
      include: {
        service: { select: { name: true } },
      },
    }),
    prisma.order.count({ where: { userId: ctx.user.id } }),
  ]);

  if (orders.length === 0) {
    await ctx.reply(ctx.t('no_orders'));
    return;
  }

  const totalPages = Math.ceil(total / ORDERS_PER_PAGE);

  let text = `${ctx.t('my_orders')} (${total}):\n\n`;

  for (const order of orders) {
    const serviceName = (order.service.name as Record<string, string>)[lang] ||
      (order.service.name as Record<string, string>)['uz'] || 'Unknown';
    const status = formatOrderStatus(order.status, lang);

    text += `#${order.id.slice(-6)} | ${serviceName}\n`;
    text += `${status} | ${formatPrice(Number(order.totalPrice))}\n`;
    text += `${formatDate(order.createdAt)}\n\n`;
  }

  const { InlineKeyboard } = await import('grammy');
  const keyboard = new InlineKeyboard();

  for (const order of orders) {
    const shortId = order.id.slice(-6);
    keyboard.text(`#${shortId}`, `order:detail:${order.id}`).row();
  }

  if (totalPages > 1) {
    const pagination = paginationKeyboard(page, totalPages, 'orders_page');
    // Merge pagination into the keyboard
    if (page > 1) {
      keyboard.text('\u25c0\ufe0f', `orders_page:${page - 1}`);
    }
    keyboard.text(`${page}/${totalPages}`, 'noop');
    if (page < totalPages) {
      keyboard.text('\u25b6\ufe0f', `orders_page:${page + 1}`);
    }
  }

  await ctx.reply(text, { reply_markup: keyboard });
}

async function showOrderDetail(ctx: BotContext, prisma: PrismaService, orderId: string): Promise<void> {
  if (!ctx.user) return;

  const lang = ctx.user.language;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      service: { select: { name: true } },
    },
  });

  if (!order || order.userId !== ctx.user.id) {
    await ctx.reply(ctx.t('no_orders'));
    return;
  }

  const serviceName = (order.service.name as Record<string, string>)[lang] ||
    (order.service.name as Record<string, string>)['uz'] || 'Unknown';
  const status = formatOrderStatus(order.status, lang);

  let text = `\ud83d\udccb Order #${order.id.slice(-6)}\n\n`;
  text += `\ud83d\udd27 ${serviceName}\n`;
  text += `\ud83d\udd17 ${order.link}\n`;
  text += `\ud83d\udd22 ${order.quantity}\n`;
  text += `\ud83d\udcb0 ${formatPrice(Number(order.totalPrice))}\n`;
  text += `\ud83d\udcca ${status}\n`;
  text += `\ud83d\udcc5 ${formatDate(order.createdAt)}\n`;

  if (order.startCount !== null) {
    text += `\n\u25b6\ufe0f Start: ${order.startCount}`;
  }
  if (order.currentCount !== null) {
    text += `\n\ud83d\udcca Current: ${order.currentCount}`;
  }
  if (order.remains !== null) {
    text += `\n\u23f3 Remains: ${order.remains}`;
  }

  const { InlineKeyboard } = await import('grammy');
  const keyboard = new InlineKeyboard()
    .text(ctx.t('back'), 'orders_page:1');

  await ctx.editMessageText(text, { reply_markup: keyboard });
}
