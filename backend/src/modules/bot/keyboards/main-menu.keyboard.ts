import { Keyboard } from 'grammy';
import { translate } from '../middlewares/i18n.middleware';

export function mainMenuKeyboard(lang: string): Keyboard {
  return new Keyboard()
    .text(translate('services', lang))
    .text(translate('my_orders', lang))
    .row()
    .text(translate('balance', lang))
    .text(translate('profile', lang))
    .row()
    .text(translate('referral', lang))
    .text(translate('support', lang))
    .row()
    .text(translate('language', lang))
    .resized()
    .persistent();
}
