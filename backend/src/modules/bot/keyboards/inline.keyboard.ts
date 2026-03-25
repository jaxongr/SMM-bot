import { InlineKeyboard } from 'grammy';
import { translate } from '../middlewares/i18n.middleware';

export function platformKeyboard(lang: string): InlineKeyboard {
  return new InlineKeyboard()
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
}

export function categoryKeyboard(
  categories: Array<{ id: string; name: Record<string, string>; serviceCount?: number }>,
  lang: string,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  for (const category of categories) {
    const name = category.name[lang] || category.name['uz'] || 'Unknown';
    const countLabel = category.serviceCount ? ` (${category.serviceCount})` : '';
    keyboard.text(`📂 ${name}${countLabel}`, `category:${category.id}`).row();
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
    const label = `💎 ${name} — ${price.toLocaleString()} so'm`;
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
    .text(translate('payment_click', lang), 'pay:CLICK')
    .row()
    .text(translate('payment_humo', lang), 'pay:HUMO')
    .row()
    .text(translate('payment_bank', lang), 'pay:BANK')
    .row()
    .text(translate('payment_crypto', lang), 'pay:CRYPTO')
    .row()
    .text(translate('payment_admin', lang), 'pay:ADMIN')
    .row()
    .text(translate('back', lang), 'back:balance');
}

export function smsServiceKeyboard(
  services: Array<{ code: string; name: string; icon: string }>,
  lang: string,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  for (let i = 0; i < services.length; i += 2) {
    const svc1 = services[i];
    keyboard.text(`${svc1.icon} ${svc1.name}`, `sms_service:${svc1.code}`);

    if (i + 1 < services.length) {
      const svc2 = services[i + 1];
      keyboard.text(`${svc2.icon} ${svc2.name}`, `sms_service:${svc2.code}`);
    }

    keyboard.row();
  }

  keyboard.text(translate('back', lang), 'back:menu');

  return keyboard;
}

export function smsCountryKeyboard(
  countries: Array<{ code: string; name: string; flag: string; price: number }>,
  lang: string,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  for (const country of countries) {
    const label = `${country.flag} ${country.name} — ${country.price.toLocaleString()} so'm`;
    keyboard.text(label, `sms_country:${country.code}`).row();
  }

  keyboard.text(translate('back', lang), 'back:sms_services');

  return keyboard;
}

export function smsBuyKeyboard(lang: string, serviceCode: string, countryCode: string): InlineKeyboard {
  return new InlineKeyboard()
    .text(translate('sms_buy_btn', lang), `sms_buy:${serviceCode}:${countryCode}`)
    .row()
    .text(translate('cancel', lang), 'back:sms_services');
}

export function smsStatusKeyboard(lang: string, activationId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text(translate('sms_check_status', lang), `sms_status:${activationId}`)
    .text(translate('sms_cancel_btn', lang), `sms_cancel:${activationId}`);
}

export function promoKeyboard(lang: string): InlineKeyboard {
  return new InlineKeyboard()
    .text(translate('discount_enter_code', lang), 'promo:enter')
    .row()
    .text(translate('back', lang), 'back:menu');
}

export function paginationKeyboard(
  page: number,
  totalPages: number,
  prefix: string,
): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  if (page > 1) {
    keyboard.text('◀️', `${prefix}:${page - 1}`);
  }

  keyboard.text(`${page}/${totalPages}`, 'noop');

  if (page < totalPages) {
    keyboard.text('▶️', `${prefix}:${page + 1}`);
  }

  return keyboard;
}

export function backKeyboard(lang: string, target = 'menu'): InlineKeyboard {
  return new InlineKeyboard().text(translate('back', lang), `back:${target}`);
}

export function languageKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🇺🇿 O'zbek", 'lang:uz')
    .row()
    .text('🇷🇺 Русский', 'lang:ru')
    .row()
    .text('🇺🇸 English', 'lang:en');
}

export function balanceKeyboard(lang: string): InlineKeyboard {
  return new InlineKeyboard()
    .text(translate('balance_topup_btn', lang), 'topup')
    .row()
    .text(translate('balance_history_btn', lang), 'balance:history');
}

export function partnershipKeyboard(lang: string): InlineKeyboard {
  return new InlineKeyboard()
    .text(translate('partnership_apply_btn', lang), 'partnership:apply')
    .row()
    .text(translate('back', lang), 'back:menu');
}

export function guideKeyboard(lang: string): InlineKeyboard {
  return new InlineKeyboard()
    .text(translate('guide_back_btn', lang), 'back:menu');
}

export function referralKeyboard(lang: string, referralLink: string): InlineKeyboard {
  return new InlineKeyboard()
    .url(translate('referral_share_btn', lang), `https://t.me/share/url?url=${encodeURIComponent(referralLink)}`)
    .row()
    .text(translate('back', lang), 'back:menu');
}
