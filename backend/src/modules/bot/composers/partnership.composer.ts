import { Composer } from 'grammy';
import { Logger } from '@nestjs/common';
import { BotContext } from '../types/context.type';
import { partnershipKeyboard } from '../keyboards/inline.keyboard';
import { mainMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { PrismaService } from '../../../prisma/prisma.service';

const logger = new Logger('PartnershipComposer');

export function createPartnershipComposer(prisma: PrismaService): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  // Handle partnership application
  composer.callbackQuery('partnership:apply', async (ctx) => {
    if (!ctx.user) return;

    const lang = ctx.user.language;

    try {
      // Create a support ticket for partnership application
      await prisma.supportTicket.create({
        data: {
          userId: ctx.user.id,
          subject: 'Partnership application',
          status: 'OPEN',
          messages: {
            create: {
              senderId: ctx.user.id,
              isAdmin: false,
              message: `Partnership application from user ${ctx.user.firstName || ctx.user.username || 'Unknown'} (ID: ${ctx.user.id})`,
            },
          },
        },
      });

      await ctx.editMessageText(ctx.t('partnership_applied'), {
        parse_mode: 'HTML',
      });

      await ctx.reply(ctx.t('main_menu'), {
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard(lang),
      });

      logger.log(`Partnership application: userId=${ctx.user.id}`);
    } catch (error) {
      logger.error(`Partnership application failed: ${error}`);
      await ctx.answerCallbackQuery({ text: 'Error occurred' });
    }

    await ctx.answerCallbackQuery();
  });

  return composer;
}

export async function showPartnership(ctx: BotContext): Promise<void> {
  const lang = ctx.user?.language || 'uz';

  await ctx.reply(ctx.t('partnership_title'), {
    parse_mode: 'HTML',
    reply_markup: partnershipKeyboard(lang),
  });
}
