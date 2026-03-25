import { Composer } from 'grammy';
import { Logger } from '@nestjs/common';
import { BotContext } from '../types/context.type';
import { formatPrice, formatDate, formatOrderStatus } from '../utils/format-message';
import { t, getLang } from '../utils/i18n.helper';
import { PrismaService } from '../../../prisma/prisma.service';

const logger = new Logger('HistoryComposer');

const ORDERS_PER_PAGE = 5;

const PLATFORM_ICONS: Record<string, string> = {
  TELEGRAM: '📱',
  INSTAGRAM: '📸',
};

const NUM_EMOJIS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function createHistoryComposer(prisma: PrismaService): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  // Pagination callback
  composer.callbackQuery(/^orders_page:(\d+)$/, async (ctx) => {
    const page = parseInt(ctx.match[1], 10);
    await showOrders(ctx, prisma, page, true);
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

export async function showOrders(
  ctx: BotContext,
  prisma: PrismaService,
  page = 1,
  editMessage = false,
): Promise<void> {
  if (!ctx.user) return;

  const lang = getLang(ctx);
  const skip = (page - 1) * ORDERS_PER_PAGE;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: ctx.user.id },
      skip,
      take: ORDERS_PER_PAGE,
      orderBy: { createdAt: 'desc' },
      include: {
        service: { select: { name: true, category: { select: { platform: true } } } },
      },
    }),
    prisma.order.count({ where: { userId: ctx.user.id } }),
  ]);

  if (orders.length === 0) {
    await ctx.reply(t(ctx, 'no_orders'), { parse_mode: 'HTML' });
    return;
  }

  const totalPages = Math.ceil(total / ORDERS_PER_PAGE);

  let text = t(ctx, 'orders_title', { total });

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const serviceName =
      (order.service.name as Record<string, string>)[lang] ||
      (order.service.name as Record<string, string>)['uz'] ||
      'Unknown';
    const status = formatOrderStatus(order.status, lang);
    const platform = (order.service.category as { platform?: string })?.platform || 'TELEGRAM';
    const icon = PLATFORM_ICONS[platform] || '📦';
    const shortId = order.id.slice(-6).toUpperCase();
    const date = formatDate(order.createdAt).split(' ')[0];
    const num = NUM_EMOJIS[i] || String(i + 1);

    text += t(ctx, 'orders_item', {
      num,
      id: shortId,
      status,
      icon,
      service: serviceName,
      quantity: order.quantity,
      price: formatPrice(Number(order.totalPrice)),
      date,
    });
  }

  if (totalPages > 1) {
    text += t(ctx, 'orders_page', { page, totalPages });
  }

  const { InlineKeyboard } = await import('grammy');
  const keyboard = new InlineKeyboard();

  for (const order of orders) {
    const shortId = order.id.slice(-6).toUpperCase();
    keyboard.text(`🔍 #${shortId}`, `order:detail:${order.id}`).row();
  }

  if (totalPages > 1) {
    if (page > 1) {
      keyboard.text('◀️', `orders_page:${page - 1}`);
    }
    keyboard.text(`${page}/${totalPages}`, 'noop');
    if (page < totalPages) {
      keyboard.text('▶️', `orders_page:${page + 1}`);
    }
  }

  const replyOptions = { parse_mode: 'HTML' as const, reply_markup: keyboard };

  if (editMessage) {
    try {
      await ctx.editMessageText(text, replyOptions);
    } catch {
      await ctx.reply(text, replyOptions);
    }
  } else {
    await ctx.reply(text, replyOptions);
  }
}

async function showOrderDetail(
  ctx: BotContext,
  prisma: PrismaService,
  orderId: string,
): Promise<void> {
  if (!ctx.user) return;

  const lang = getLang(ctx);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      service: { select: { name: true } },
    },
  });

  if (!order || order.userId !== ctx.user.id) {
    await ctx.reply(t(ctx, 'no_orders'), { parse_mode: 'HTML' });
    return;
  }

  const serviceName =
    (order.service.name as Record<string, string>)[lang] ||
    (order.service.name as Record<string, string>)['uz'] ||
    'Unknown';
  const status = formatOrderStatus(order.status, lang);
  const shortId = order.id.slice(-6).toUpperCase();

  let extra = '';
  if (order.startCount !== null) {
    extra += t(ctx, 'order_detail_start', { count: order.startCount });
  }
  if (order.currentCount !== null) {
    extra += t(ctx, 'order_detail_current', { count: order.currentCount });
  }
  if (order.remains !== null) {
    extra += t(ctx, 'order_detail_remains', { count: order.remains });
  }

  const text = t(ctx, 'order_detail', {
    id: shortId,
    service: serviceName,
    link: order.link,
    quantity: order.quantity,
    price: formatPrice(Number(order.totalPrice)),
    status,
    date: formatDate(order.createdAt),
    extra,
  });

  const { InlineKeyboard } = await import('grammy');
  const keyboard = new InlineKeyboard().text(t(ctx, 'back'), 'orders_page:1');

  try {
    await ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup: keyboard });
  } catch {
    await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
  }
}
