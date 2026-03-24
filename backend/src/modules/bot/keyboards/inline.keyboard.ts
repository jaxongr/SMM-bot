import { InlineKeyboard } from 'grammy';
import { translate } from '../middlewares/i18n.middleware';

export function platformKeyboard(lang: string): InlineKeyboard {
  return new InlineKeyboard()
    .text(translate('telegram', lang), 'platform:TELEGRAM')
    .text(translate('instagram', lang), 'platform:INSTAGRAM');
}

export function categoryKeyboard(
  categories: Array<{ id: string; name: Record<string, string> }>,
  lang: string,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  for (const category of categories) {
    const name = category.name[lang] || category.name['uz'] || 'Unknown';
    keyboard.text(name, `category:${category.id}`).row();
  }

  keyboard.text(translate('back', lang), 'back:platforms');

  return keyboard;
}

export function serviceKeyboard(
  services: Array<{ id: string; name: Record<string, string>; pricePerUnit: number | string }>,
  lang: string,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  for (const service of services) {
    const name = service.name[lang] || service.name['uz'] || 'Unknown';
    const price = Number(service.pricePerUnit);
    const label = `${name} - ${price.toLocaleString()} so'm`;
    keyboard.text(label, `service:${service.id}`).row();
  }

  keyboard.text(translate('back', lang), 'back:categories');

  return keyboard;
}

export function confirmKeyboard(lang: string): InlineKeyboard {
  return new InlineKeyboard()
    .text(translate('confirm_order', lang), 'order:confirm')
    .text(translate('cancel', lang), 'order:cancel');
}

export function paymentMethodKeyboard(lang: string): InlineKeyboard {
  return new InlineKeyboard()
    .text('Click', 'pay:CLICK')
    .text('Payme', 'pay:PAYME')
    .row()
    .text(translate('back', lang), 'back:balance');
}

export function paginationKeyboard(
  page: number,
  totalPages: number,
  prefix: string,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  if (page > 1) {
    keyboard.text('\u25c0\ufe0f', `${prefix}:${page - 1}`);
  }

  keyboard.text(`${page}/${totalPages}`, 'noop');

  if (page < totalPages) {
    keyboard.text('\u25b6\ufe0f', `${prefix}:${page + 1}`);
  }

  return keyboard;
}

export function backKeyboard(lang: string): InlineKeyboard {
  return new InlineKeyboard().text(translate('back', lang), 'back:menu');
}

export function languageKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("\ud83c\uddfa\ud83c\uddff O'zbek", 'lang:uz')
    .row()
    .text('\ud83c\uddf7\ud83c\uddfa \u0420\u0443\u0441\u0441\u043a\u0438\u0439', 'lang:ru')
    .row()
    .text('\ud83c\uddfa\ud83c\uddf8 English', 'lang:en');
}
