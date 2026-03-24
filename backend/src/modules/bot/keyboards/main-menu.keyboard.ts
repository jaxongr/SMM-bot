import { Keyboard } from 'grammy';
import { translate } from '../middlewares/i18n.middleware';

export function mainMenuKeyboard(lang: string): Keyboard {
  return new Keyboard()
    .text(translate('menu_sms', lang))
    .text(translate('menu_services', lang))
    .row()
    .text(translate('menu_orders', lang))
    .text(translate('menu_referral', lang))
    .row()
    .text(translate('menu_balance', lang))
    .text(translate('menu_payment', lang))
    .row()
    .text(translate('menu_guide', lang))
    .text(translate('menu_support', lang))
    .row()
    .text(translate('menu_partnership', lang))
    .text(translate('menu_discount', lang))
    .resized()
    .persistent();
}
