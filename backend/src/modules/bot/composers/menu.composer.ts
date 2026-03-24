import { Composer } from 'grammy';
import { BotContext } from '../types/context.type';
import { translate } from '../middlewares/i18n.middleware';

const SUPPORTED_LANGUAGES = ['uz', 'ru', 'en'];

function getMenuLabels(key: string): string[] {
  return SUPPORTED_LANGUAGES.map((lang) => translate(key, lang));
}

export interface MenuHandlers {
  onSms: (ctx: BotContext) => Promise<void>;
  onServices: (ctx: BotContext) => Promise<void>;
  onOrders: (ctx: BotContext) => Promise<void>;
  onReferral: (ctx: BotContext) => Promise<void>;
  onBalance: (ctx: BotContext) => Promise<void>;
  onPayment: (ctx: BotContext) => Promise<void>;
  onGuide: (ctx: BotContext) => Promise<void>;
  onSupport: (ctx: BotContext) => Promise<void>;
  onPartnership: (ctx: BotContext) => Promise<void>;
  onDiscount: (ctx: BotContext) => Promise<void>;
}

export function createMenuComposer(handlers: MenuHandlers): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  const menuItems: Array<{ key: string; handler: (ctx: BotContext) => Promise<void> }> = [
    { key: 'menu_sms', handler: handlers.onSms },
    { key: 'menu_services', handler: handlers.onServices },
    { key: 'menu_orders', handler: handlers.onOrders },
    { key: 'menu_referral', handler: handlers.onReferral },
    { key: 'menu_balance', handler: handlers.onBalance },
    { key: 'menu_payment', handler: handlers.onPayment },
    { key: 'menu_guide', handler: handlers.onGuide },
    { key: 'menu_support', handler: handlers.onSupport },
    { key: 'menu_partnership', handler: handlers.onPartnership },
    { key: 'menu_discount', handler: handlers.onDiscount },
  ];

  for (const item of menuItems) {
    const labels = getMenuLabels(item.key);
    composer.hears(labels, item.handler);
  }

  return composer;
}
