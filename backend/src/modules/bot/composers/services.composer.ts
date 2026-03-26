import { Composer, InlineKeyboard } from 'grammy';
import { Logger } from '@nestjs/common';
import { Platform } from '@prisma/client';
import { BotContext } from '../types/context.type';
import { categoryKeyboard } from '../keyboards/inline.keyboard';
import { t, getLang } from '../utils/i18n.helper';
import { formatPrice } from '../utils/format-message';
import { CategoriesService } from '../../services/categories.service';
import { ServicesService } from '../../services/services.service';

const logger = new Logger('ServicesComposer');

const PLATFORM_INFO: Record<string, { icon: string; name: string }> = {
  TELEGRAM: { icon: '📱', name: 'Telegram' },
  INSTAGRAM: { icon: '📸', name: 'Instagram' },
  YOUTUBE: { icon: '🎬', name: 'YouTube' },
  TIKTOK: { icon: '🎵', name: 'TikTok' },
  FACEBOOK: { icon: '👤', name: 'Facebook' },
  TWITTER: { icon: '🐦', name: 'Twitter/X' },
  SPOTIFY: { icon: '🎧', name: 'Spotify' },
  DISCORD: { icon: '💬', name: 'Discord' },
};

export function createServicesComposer(
  categoriesService: CategoriesService,
  servicesService: ServicesService,
): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  // Show categories for a platform
  composer.callbackQuery(/^platform:(.+)$/, async (ctx) => {
    const platform = ctx.match[1] as Platform;
    const lang = getLang(ctx);

    try {
      const result = await categoriesService.findAll(platform);

      const categories = result.data.map((cat: Record<string, unknown>) => ({
        id: cat.id as string,
        name: cat.name as Record<string, string>,
        serviceCount: (cat._count as Record<string, number>)?.services || 0,
      }));

      if (categories.length === 0) {
        await ctx.answerCallbackQuery({ text: 'Kategoriyalar topilmadi' });
        return;
      }

      const info = PLATFORM_INFO[platform] || { icon: '📦', name: platform };
      const kb = categoryKeyboard(categories, lang);
      kb.row().text('⬅️ Orqaga', 'show:platforms');

      await ctx.editMessageText(
        `${info.icon} <b>${info.name}</b>\n\n📂 Kategoriyani tanlang:`,
        { parse_mode: 'HTML', reply_markup: kb },
      );
    } catch (error) {
      logger.error(`Error loading categories: ${error}`);
      await ctx.answerCallbackQuery({ text: 'Xatolik yuz berdi' });
    }

    await ctx.answerCallbackQuery();
  });

  // Show services for a category
  composer.callbackQuery(/^category:(.+)$/, async (ctx) => {
    const categoryId = ctx.match[1];
    const lang = getLang(ctx);

    try {
      const result = await servicesService.getServicesByCategory(categoryId);

      if (!result.data || result.data.length === 0) {
        await ctx.answerCallbackQuery({ text: 'Xizmatlar topilmadi' });
        return;
      }

      const keyboard = new InlineKeyboard();
      for (const svc of result.data) {
        const name = (svc.name as Record<string, string>)[lang] ||
          (svc.name as Record<string, string>)['uz'] || 'Xizmat';
        const price = Number(svc.pricePerUnit);
        const isPackage = svc.minQuantity === 1 && svc.maxQuantity <= 10;
        const priceLabel = isPackage ? formatPrice(price) : `${formatPrice(price * 1000)}/1K`;
        keyboard.text(`${name} — ${priceLabel}`, `service:${svc.id}`);
        keyboard.row();
      }
      keyboard.text('⬅️ Orqaga', 'show:platforms');

      await ctx.editMessageText(
        `🔧 <b>Xizmatni tanlang:</b>`,
        { parse_mode: 'HTML', reply_markup: keyboard },
      );
    } catch (error) {
      logger.error(`Error loading services: ${error}`);
      await ctx.answerCallbackQuery({ text: 'Xatolik yuz berdi' });
    }

    await ctx.answerCallbackQuery();
  });

  // Show service detail
  composer.callbackQuery(/^service:(.+)$/, async (ctx) => {
    const serviceId = ctx.match[1];
    const lang = getLang(ctx);

    try {
      const result = await servicesService.findById(serviceId);
      const svc = result.data;
      const name = (svc.name as Record<string, string>)[lang] ||
        (svc.name as Record<string, string>)['uz'] || 'Xizmat';
      const desc = svc.description
        ? ((svc.description as Record<string, string>)[lang] ||
           (svc.description as Record<string, string>)['uz'] || '')
        : '';
      const price = Number(svc.pricePerUnit);
      const isPackage = svc.minQuantity === 1 && svc.maxQuantity <= 10;

      const keyboard = new InlineKeyboard()
        .text('🛒 Buyurtma berish', `order:${serviceId}`)
        .row()
        .text('⬅️ Orqaga', `category:${svc.categoryId}`);

      const priceText = isPackage
        ? `💰 Paket narxi: <b>${formatPrice(price)}</b>`
        : `💰 Narx: <b>${formatPrice(price * 1000)}</b> / 1000 dona`;

      await ctx.editMessageText(
        `<b>${name}</b>\n\n` +
        `${desc}\n\n` +
        `${priceText}\n` +
        `📦 Min: <b>${svc.minQuantity.toLocaleString()}</b> | Max: <b>${svc.maxQuantity.toLocaleString()}</b>\n\n` +
        `🔗 Buyurtma berish uchun tugmani bosing:`,
        { parse_mode: 'HTML', reply_markup: keyboard },
      );
    } catch (error) {
      logger.error(`Error loading service: ${error}`);
      await ctx.answerCallbackQuery({ text: 'Xatolik yuz berdi' });
    }

    await ctx.answerCallbackQuery();
  });

  // Back to platforms
  composer.callbackQuery('show:platforms', async (ctx) => {
    await showPlatforms(ctx);
    await ctx.answerCallbackQuery();
  });

  return composer;
}

export async function showPlatforms(ctx: BotContext): Promise<void> {
  const keyboard = new InlineKeyboard()
    .text('📱 Telegram', 'platform:TELEGRAM')
    .text('📸 Instagram', 'platform:INSTAGRAM')
    .row()
    .text('🎬 YouTube', 'platform:YOUTUBE')
    .text('🎵 TikTok', 'platform:TIKTOK')
    .row()
    .text('👤 Facebook', 'platform:FACEBOOK')
    .text('🐦 Twitter/X', 'platform:TWITTER')
    .row()
    .text('🎧 Spotify', 'platform:SPOTIFY')
    .text('💬 Discord', 'platform:DISCORD');

  const text = '<b>📱 Platformani tanlang:</b>\n\n8 ta platforma, 80+ xizmat mavjud!';

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup: keyboard });
  } else {
    await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
  }
}
