import { Logger } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { BotContext } from '../types/context.type';

const logger = new Logger('BotAuthMiddleware');

export function createAuthMiddleware(usersService: UsersService) {
  return async (ctx: BotContext, next: () => Promise<void>) => {
    if (!ctx.from) {
      return next();
    }

    try {
      const user = await usersService.findOrCreateFromTelegram({
        telegramId: ctx.from.id,
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        language: ctx.from.language_code === 'ru' ? 'ru' : 'uz',
      });

      ctx.user = {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username ?? undefined,
        firstName: user.firstName ?? undefined,
        balance: Number(user.balance),
        language: user.language,
        role: user.role,
      };

      ctx.session.language = user.language;
      ctx.session.userId = user.id;
    } catch (error) {
      logger.error(`Auth middleware error for telegramId=${ctx.from.id}: ${error}`);
    }

    return next();
  };
}
