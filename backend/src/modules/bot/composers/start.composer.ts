import { Composer } from 'grammy';
import { Logger } from '@nestjs/common';
import { BotContext } from '../types/context.type';
import { mainMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { UsersService } from '../../users/users.service';

const logger = new Logger('StartComposer');

export function createStartComposer(usersService: UsersService): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  composer.command('start', async (ctx) => {
    if (!ctx.user) return;

    const lang = ctx.user.language;
    const name = ctx.user.firstName || ctx.user.username || 'User';

    const startPayload = ctx.match;

    if (startPayload && typeof startPayload === 'string' && startPayload.length > 0) {
      try {
        const referrer = await usersService.findByTelegramId(BigInt(0));
        // Referral is handled in auth middleware via findOrCreateFromTelegram
        // The start payload is the referral code
        logger.log(`Start with referral code: ${startPayload}, user=${ctx.user.id}`);
      } catch {
        // Ignore referral errors
      }
    }

    await ctx.reply(ctx.t('welcome', { name }), {
      reply_markup: mainMenuKeyboard(lang),
    });
  });

  return composer;
}
