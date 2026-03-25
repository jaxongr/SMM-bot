import { Composer } from 'grammy';
import { Logger } from '@nestjs/common';
import { BotContext } from '../types/context.type';
import { mainMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { formatPrice } from '../utils/format-message';
import { t, getLang } from '../utils/i18n.helper';
import { UsersService } from '../../users/users.service';

const logger = new Logger('StartComposer');

export function createStartComposer(usersService: UsersService): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  composer.command('start', async (ctx) => {
    if (!ctx.user) return;

    const lang = getLang(ctx);
    const name = ctx.user.firstName || ctx.user.username || 'User';
    const balance = formatPrice(ctx.user.balance);
    const userId = ctx.user.id.slice(-8).toUpperCase();

    const startPayload = ctx.match;

    if (startPayload && typeof startPayload === 'string' && startPayload.length > 0) {
      try {
        logger.log(`Start with referral code: ${startPayload}, user=${ctx.user.id}`);
      } catch {
        // Ignore referral errors
      }
    }

    await ctx.reply(
      t(ctx, 'welcome', { name, balance, id: userId }),
      {
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard(lang),
      },
    );
  });

  return composer;
}
