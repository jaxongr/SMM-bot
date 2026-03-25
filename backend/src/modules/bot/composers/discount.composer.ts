import { Composer } from 'grammy';
import { BotContext } from '../types/context.type';
import { PrismaService } from '../../../prisma/prisma.service';
import { BalanceService } from '../../balance/balance.service';

export function createDiscountComposer(
  _prisma: PrismaService,
  _balanceService: BalanceService,
): Composer<BotContext> {
  const composer = new Composer<BotContext>();
  return composer;
}

export async function showDiscount(ctx: BotContext): Promise<void> {
  await ctx.reply(
    '<b>🎫 Promo kod</b>\n\n' +
    '🔧 <i>Tez kunda ishga tushadi!</i>\n\n' +
    'Promo kod kiritish va chegirmalardan foydalanish imkoniyati tayyorlanmoqda.',
    { parse_mode: 'HTML' },
  );
}
