import { Composer } from 'grammy';
import { BotContext } from '../types/context.type';
import { PrismaService } from '../../../prisma/prisma.service';
import { BalanceService } from '../../balance/balance.service';

export function createSmsComposer(
  _prisma: PrismaService,
  _balanceService: BalanceService,
): Composer<BotContext> {
  const composer = new Composer<BotContext>();
  // SMS callbacks will be handled when SMS API is configured
  return composer;
}

export async function showSmsServices(ctx: BotContext): Promise<void> {
  await ctx.reply(
    '<b>📞 Nomer olish</b>\n\n' +
    '🔧 <i>Tez kunda ishga tushadi!</i>\n\n' +
    'Virtual raqam sotib olish xizmati tayyorlanmoqda.\n' +
    'Telegram, WhatsApp, Instagram va boshqa platformalar uchun.',
    { parse_mode: 'HTML' },
  );
}
