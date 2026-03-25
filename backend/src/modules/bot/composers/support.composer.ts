import { Composer } from 'grammy';
import { Logger } from '@nestjs/common';
import { type Conversation, createConversation } from '@grammyjs/conversations';
import { BotContext } from '../types/context.type';
import { mainMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { t, getLang } from '../utils/i18n.helper';
import { PrismaService } from '../../../prisma/prisma.service';

const logger = new Logger('SupportComposer');

type SupportConversation = Conversation<BotContext>;

export function createSupportComposer(prisma: PrismaService): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  async function supportFlow(conversation: SupportConversation, ctx: BotContext) {
    if (!ctx.user) return;

    const lang = getLang(ctx);

    await ctx.reply(t(ctx, 'support_new'), { parse_mode: 'HTML' });

    const msgCtx = await conversation.wait();

    if (!msgCtx.message?.text) {
      await ctx.reply(t(ctx, 'support_new'), { parse_mode: 'HTML' });
      return;
    }

    const userMessage = msgCtx.message.text.trim();

    try {
      const ticket = await prisma.supportTicket.create({
        data: {
          userId: ctx.user.id,
          subject: userMessage.substring(0, 100),
          status: 'OPEN',
          messages: {
            create: {
              senderId: ctx.user.id,
              isAdmin: false,
              message: userMessage,
            },
          },
        },
      });

      await ctx.reply(t(ctx, 'support_sent'), {
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard(lang),
      });

      logger.log(`Support ticket created: id=${ticket.id}, userId=${ctx.user.id}`);
    } catch (error) {
      logger.error(`Support ticket creation failed: ${error}`);
      await ctx.reply(t(ctx, 'order_status_failed'), { parse_mode: 'HTML' });
    }
  }

  composer.use(createConversation(supportFlow, 'support-flow'));

  return composer;
}

export async function showSupport(ctx: BotContext): Promise<void> {
  await ctx.conversation.enter('support-flow');
}
