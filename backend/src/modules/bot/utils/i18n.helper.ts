import { translate } from '../middlewares/i18n.middleware';
import { BotContext } from '../types/context.type';

/**
 * Get translated text for the current user's language.
 * This helper works reliably in all contexts including conversations.
 */
export function t(ctx: BotContext, key: string, params?: Record<string, string | number>): string {
  const lang = ctx.session?.language || ctx.user?.language || 'uz';
  return translate(key, lang, params);
}

/**
 * Get the user's current language.
 */
export function getLang(ctx: BotContext): string {
  return ctx.session?.language || ctx.user?.language || 'uz';
}
