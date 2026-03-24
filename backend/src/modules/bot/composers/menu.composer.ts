import { Composer } from 'grammy';
import { BotContext } from '../types/context.type';
import { translate } from '../middlewares/i18n.middleware';

const SUPPORTED_LANGUAGES = ['uz', 'ru', 'en'];

function getMenuLabels(key: string): string[] {
  return SUPPORTED_LANGUAGES.map((lang) => translate(key, lang));
}

export function createMenuComposer(handlers: {
  onServices: (ctx: BotContext) => Promise<void>;
  onOrders: (ctx: BotContext) => Promise<void>;
  onBalance: (ctx: BotContext) => Promise<void>;
  onProfile: (ctx: BotContext) => Promise<void>;
  onReferral: (ctx: BotContext) => Promise<void>;
  onSupport: (ctx: BotContext) => Promise<void>;
  onLanguage: (ctx: BotContext) => Promise<void>;
}): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  const menuItems: Array<{ key: string; handler: (ctx: BotContext) => Promise<void> }> = [
    { key: 'services', handler: handlers.onServices },
    { key: 'my_orders', handler: handlers.onOrders },
    { key: 'balance', handler: handlers.onBalance },
    { key: 'profile', handler: handlers.onProfile },
    { key: 'referral', handler: handlers.onReferral },
    { key: 'support', handler: handlers.onSupport },
    { key: 'language', handler: handlers.onLanguage },
  ];

  for (const item of menuItems) {
    const labels = getMenuLabels(item.key);
    composer.hears(labels, item.handler);
  }

  return composer;
}
