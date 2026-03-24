import { Composer } from 'grammy';
import { Logger } from '@nestjs/common';
import { BotContext } from '../types/context.type';
import { formatPrice } from '../utils/format-message';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

const logger = new Logger('ReferralComposer');

const DEFAULT_REFERRAL_PERCENTAGE = 5;

export function createReferralComposer(
  prisma: PrismaService,
  configService: ConfigService,
): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  // No specific callback queries for referral, it's handled via menu composer
  return composer;
}

export async function showReferral(
  ctx: BotContext,
  prisma: PrismaService,
  configService: ConfigService,
): Promise<void> {
  if (!ctx.user) return;

  const lang = ctx.user.language;

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

  const botToken = configService.get<string>('telegram.botToken', '');
  const botUsername = botToken ? '' : 'bot'; // Will be set dynamically
  const referralLink = `https://t.me/${botUsername}?start=${user.referralCode}`;

  const earned = Number(referralEarnings._sum.earnedAmount || 0);

  await ctx.reply(
    ctx.t('referral_info', {
      link: referralLink,
      count: referralCount,
      earned: formatPrice(earned),
      percentage: DEFAULT_REFERRAL_PERCENTAGE,
    }),
  );
}
