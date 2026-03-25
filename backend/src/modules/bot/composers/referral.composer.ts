import { Composer } from 'grammy';
import { Logger } from '@nestjs/common';
import { BotContext } from '../types/context.type';
import { referralKeyboard } from '../keyboards/inline.keyboard';
import { formatPrice } from '../utils/format-message';
import { t, getLang } from '../utils/i18n.helper';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

const logger = new Logger('ReferralComposer');

const DEFAULT_REFERRAL_PERCENTAGE = 5;

export function createReferralComposer(
  prisma: PrismaService,
  configService: ConfigService,
): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  // Back to menu from referral
  composer.callbackQuery('back:menu', async (ctx) => {
    // Handled by other composers or ignored
    await ctx.answerCallbackQuery();
  });

  return composer;
}

export async function showReferral(
  ctx: BotContext,
  prisma: PrismaService,
  configService: ConfigService,
): Promise<void> {
  if (!ctx.user) return;

  const lang = getLang(ctx);

  const user = await prisma.user.findUnique({
    where: { id: ctx.user.id },
    select: { referralCode: true },
  });

  if (!user) return;

  const [referralCount, referralEarnings] = await Promise.all([
    prisma.referral.count({ where: { referrerId: ctx.user.id } }),
    prisma.referral.aggregate({
      where: { referrerId: ctx.user.id },
      _sum: { earnedAmount: true },
    }),
  ]);

  let botUsername = 'SMM_chibot';
  try {
    const me = await ctx.api.getMe();
    botUsername = me.username || botUsername;
  } catch {
    // Use default
  }

  const referralLink = `https://t.me/${botUsername}?start=${user.referralCode}`;
  const earned = Number(referralEarnings._sum.earnedAmount || 0);

  await ctx.reply(
    t(ctx, 'referral_info', {
      link: referralLink,
      count: referralCount,
      earned: formatPrice(earned),
      percentage: DEFAULT_REFERRAL_PERCENTAGE,
    }),
    {
      parse_mode: 'HTML',
      reply_markup: referralKeyboard(lang, referralLink),
    },
  );
}
