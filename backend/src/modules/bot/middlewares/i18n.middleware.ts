import { Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { BotContext } from '../types/context.type';

const logger = new Logger('BotI18nMiddleware');

type Translations = Record<string, Record<string, string>>;

const SUPPORTED_LANGUAGES = ['uz', 'ru', 'en'];
const DEFAULT_LANGUAGE = 'uz';

function loadTranslations(): Translations {
  const translations: Translations = {};

  for (const lang of SUPPORTED_LANGUAGES) {
    try {
      const filePath = join(__dirname, '..', 'i18n', `${lang}.json`);
      const content = readFileSync(filePath, 'utf-8');
      translations[lang] = JSON.parse(content);
    } catch (error) {
      logger.error(`Failed to load translations for language: ${lang}`, error);
      translations[lang] = {};
    }
  }

  return translations;
}

let cachedTranslations: Translations | null = null;

function getTranslations(): Translations {
  if (!cachedTranslations) {
    cachedTranslations = loadTranslations();
  }
  return cachedTranslations;
}

export function translate(
  key: string,
  language: string,
  params?: Record<string, string | number>,
): string {
  const translations = getTranslations();
  const lang = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
  let text = translations[lang]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || key;

  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
    }
  }

  return text;
}

export function createI18nMiddleware() {
  // Pre-load translations on startup
  getTranslations();

  return async (ctx: BotContext, next: () => Promise<void>) => {
    ctx.t = (key: string, params?: Record<string, string | number>) => {
      const language = ctx.session?.language || ctx.user?.language || DEFAULT_LANGUAGE;
      return translate(key, language, params);
    };

    return next();
  };
}
