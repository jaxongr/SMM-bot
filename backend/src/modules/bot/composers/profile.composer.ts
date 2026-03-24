import { Composer } from 'grammy';
import { Logger } from '@nestjs/common';
import { BotContext } from '../types/context.type';
import { formatPrice, formatDate } from '../utils/format-message';
import { PrismaService } from '../../../prisma/prisma.service';

const logger = new Logger('ProfileComposer');

export function createProfileComposer(prisma: PrismaService): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  // No specific callback queries for profile
  return composer;
}

export async function showProfile(ctx: BotContext, prisma: PrismaService): Promise<void> {
  if (!ctx.user) return;

  const lang = ctx.user.language;

  const [user, orderCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: { id: true, firstName: true, username: true, balance: true, createdAt: true },
    }),
    prisma.order.count({ where: { userId: ctx.user.id } }),
  ]);

  if (!user) return;

  const name = user.firstName || user.username || 'User';

  await ctx.reply(
    ctx.t('profile_info', {
      id: user.id.slice(-8).toUpperCase(),
      name,
      balance: formatPrice(Number(user.balance)),
      orders: orderCount,
      date: formatDate(user.createdAt),
    }),
    { parse_mode: 'HTML' },
  );
}
