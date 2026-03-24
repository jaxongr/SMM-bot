import { Composer } from 'grammy';
import { Logger } from '@nestjs/common';
import { BotContext } from '../types/context.type';
import { guideKeyboard } from '../keyboards/inline.keyboard';

const logger = new Logger('GuideComposer');

export function createGuideComposer(): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  // No specific callback queries needed for guide
  return composer;
}

export async function showGuide(ctx: BotContext): Promise<void> {
  const lang = ctx.user?.language || 'uz';

  await ctx.reply(ctx.t('guide_title'), {
    parse_mode: 'HTML',
    reply_markup: guideKeyboard(lang),
  });
}
