import { Composer } from 'grammy';
import { Logger } from '@nestjs/common';
import { BotContext } from '../types/context.type';
import { platformKeyboard, categoryKeyboard, serviceKeyboard } from '../keyboards/inline.keyboard';
import { CategoriesService } from '../../services/categories.service';
import { ServicesService } from '../../services/services.service';

const logger = new Logger('ServicesComposer');

export function createServicesComposer(
  categoriesService: CategoriesService,
  servicesService: ServicesService,
): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  // Show categories for a platform
  composer.callbackQuery(/^platform:(.+)$/, async (ctx) => {
    const platform = ctx.match[1];
    const lang = ctx.user?.language || 'uz';

    try {
      const result = await categoriesService.findAll(
        platform as 'TELEGRAM' | 'INSTAGRAM',
      );

      const categories = result.data.map((cat) => ({
        id: cat.id,
        name: cat.name as Record<string, string>,
      }));

      if (categories.length === 0) {
        await ctx.answerCallbackQuery({ text: 'No categories available' });
        return;
      }

      const platformIcon = platform === 'TELEGRAM' ? '📱' : '📸';
      const platformName = platform === 'TELEGRAM' ? 'Telegram' : 'Instagram';

      await ctx.editMessageText(
        `${platformIcon} <b>${platformName}</b>\n\n${ctx.t('select_category')}`,
        {
          parse_mode: 'HTML',
          reply_markup: categoryKeyboard(categories, lang),
        },
      );
    } catch (error) {
      logger.error(`Error loading categories: ${error}`);
      await ctx.answerCallbackQuery({ text: 'Error loading categories' });
    }

    await ctx.answerCallbackQuery();
  });

  // Show services for a category
  composer.callbackQuery(/^category:(.+)$/, async (ctx) => {
    const categoryId = ctx.match[1];
    const lang = ctx.user?.language || 'uz';

    try {
      const result = await servicesService.getServicesByCategory(categoryId);

      const services = result.data.map((svc) => ({
        id: svc.id,
        name: svc.name as Record<string, string>,
        pricePerUnit: Number(svc.pricePerUnit),
      }));

      if (services.length === 0) {
        await ctx.answerCallbackQuery({ text: 'No services available' });
        return;
      }

      await ctx.editMessageText(ctx.t('select_service'), {
        parse_mode: 'HTML',
        reply_markup: serviceKeyboard(services, lang),
      });
    } catch (error) {
      logger.error(`Error loading services: ${error}`);
      await ctx.answerCallbackQuery({ text: 'Error loading services' });
    }

    await ctx.answerCallbackQuery();
  });

  // Back to platforms
  composer.callbackQuery('back:platforms', async (ctx) => {
    const lang = ctx.user?.language || 'uz';
    await ctx.editMessageText(ctx.t('select_platform'), {
      parse_mode: 'HTML',
      reply_markup: platformKeyboard(lang),
    });
    await ctx.answerCallbackQuery();
  });

  // Back to categories — go back to platform selection
  composer.callbackQuery('back:categories', async (ctx) => {
    const lang = ctx.user?.language || 'uz';
    await ctx.editMessageText(ctx.t('select_platform'), {
      parse_mode: 'HTML',
      reply_markup: platformKeyboard(lang),
    });
    await ctx.answerCallbackQuery();
  });

  return composer;
}

export async function showPlatforms(ctx: BotContext): Promise<void> {
  const lang = ctx.user?.language || 'uz';
  await ctx.reply(ctx.t('select_platform'), {
    parse_mode: 'HTML',
    reply_markup: platformKeyboard(lang),
  });
}
