import { Composer } from 'grammy';
import { Logger } from '@nestjs/common';
import { BotContext } from '../types/context.type';
import { languageKeyboard } from '../keyboards/inline.keyboard';
import { mainMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { t } from '../utils/i18n.helper';
import { PrismaService } from '../../../prisma/prisma.service';

const logger = new Logger('LanguageComposer');

const VALID_LANGUAGES = ['uz', 'ru', 'en'];

export function createLanguageComposer(prisma: PrismaService): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  composer.callbackQuery(/^lang:(.+)$/, async (ctx) => {
    const language = ctx.match[1];

    if (!VALID_LANGUAGES.includes(language)) {
      await ctx.answerCallbackQuery({ text: 'Invalid language' });
      return;
    }

    if (!ctx.user) {
      await ctx.answerCallbackQuery();
      return;
    }

    try {
      await prisma.user.update({
        where: { id: ctx.user.id },
        data: { language },
      });

      ctx.user.language = language;
      ctx.session.language = language;

      await ctx.editMessageText(t(ctx, 'language_changed'), {
        parse_mode: 'HTML',
      });

      await ctx.reply(t(ctx, 'main_menu'), {
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard(language),
      });

      logger.log(`Language changed: userId=${ctx.user.id}, language=${language}`);
    } catch (error) {
      logger.error(`Language change failed: ${error}`);
    }

    await ctx.answerCallbackQuery();
  });

  return composer;
}

export async function showLanguage(ctx: BotContext): Promise<void> {
  await ctx.reply(t(ctx, 'language_select'), {
    parse_mode: 'HTML',
    reply_markup: languageKeyboard(),
  });
}
