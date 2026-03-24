import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface ServiceSeed {
  slug: string;
  name: { uz: string; ru: string; en: string };
  description: { uz: string; ru: string; en: string };
  minQuantity: number;
  maxQuantity: number;
  pricePerUnit: number; // so'm per 1 dona
  sortOrder: number;
  isAutoService?: boolean;
}

const TELEGRAM_SERVICES: Record<string, ServiceSeed[]> = {
  'tg-subscribers': [
    {
      slug: 'tg-sub-bot',
      name: { uz: '🤖 Bot obunachilar', ru: '🤖 Бот подписчики', en: '🤖 Bot Subscribers' },
      description: {
        uz: '⚡ Eng arzon variant\n⏱ Tezlik: 0-1 soat\n📉 Tushish: 10-30%\n⚠️ Kafolat yo\'q',
        ru: '⚡ Самый дешёвый\n⏱ Скорость: 0-1 час\n📉 Отписки: 10-30%\n⚠️ Без гарантии',
        en: '⚡ Cheapest option\n⏱ Speed: 0-1 hour\n📉 Drop: 10-30%\n⚠️ No guarantee',
      },
      minQuantity: 100, maxQuantity: 100000, pricePerUnit: 5, sortOrder: 1,
    },
    {
      slug: 'tg-sub-low',
      name: { uz: '👤 Arzon obunachilar', ru: '👤 Дешёвые подписчики', en: '👤 Low Quality Subscribers' },
      description: {
        uz: '💰 Arzon narx\n⏱ Tezlik: 0-6 soat\n📉 Tushish: 5-15%\n🛡 Kafolat: 7 kun',
        ru: '💰 Низкая цена\n⏱ Скорость: 0-6 часов\n📉 Отписки: 5-15%\n🛡 Гарантия: 7 дней',
        en: '💰 Low price\n⏱ Speed: 0-6 hours\n📉 Drop: 5-15%\n🛡 Guarantee: 7 days',
      },
      minQuantity: 50, maxQuantity: 50000, pricePerUnit: 15, sortOrder: 2,
    },
    {
      slug: 'tg-sub-medium',
      name: { uz: '👥 O\'rta sifat', ru: '👥 Среднее качество', en: '👥 Medium Quality' },
      description: {
        uz: '✅ Yaxshi sifat\n⏱ Tezlik: 0-12 soat\n📉 Tushish: 3-8%\n🛡 Kafolat: 30 kun',
        ru: '✅ Хорошее качество\n⏱ Скорость: 0-12 часов\n📉 Отписки: 3-8%\n🛡 Гарантия: 30 дней',
        en: '✅ Good quality\n⏱ Speed: 0-12 hours\n📉 Drop: 3-8%\n🛡 Guarantee: 30 days',
      },
      minQuantity: 50, maxQuantity: 50000, pricePerUnit: 30, sortOrder: 3,
    },
    {
      slug: 'tg-sub-hq',
      name: { uz: '⭐ Yuqori sifat (HQ)', ru: '⭐ Высокое качество (HQ)', en: '⭐ High Quality (HQ)' },
      description: {
        uz: '⭐ Premium sifat\n⏱ Tezlik: 0-24 soat\n📉 Tushish: 1-5%\n🛡 Kafolat: 60 kun\n👤 Real ko\'rinish',
        ru: '⭐ Премиум качество\n⏱ Скорость: 0-24 часа\n📉 Отписки: 1-5%\n🛡 Гарантия: 60 дней\n👤 Реальные профили',
        en: '⭐ Premium quality\n⏱ Speed: 0-24 hours\n📉 Drop: 1-5%\n🛡 Guarantee: 60 days\n👤 Real-looking profiles',
      },
      minQuantity: 10, maxQuantity: 20000, pricePerUnit: 50, sortOrder: 4,
    },
    {
      slug: 'tg-sub-premium',
      name: { uz: '💎 Premium obunachilar', ru: '💎 Премиум подписчики', en: '💎 Premium Subscribers' },
      description: {
        uz: '💎 Telegram Premium akkauntlar\n⏱ Tezlik: 1-48 soat\n📉 Tushish: 0-3%\n🛡 Kafolat: 90 kun\n✨ Premium badge bilan',
        ru: '💎 Аккаунты Telegram Premium\n⏱ Скорость: 1-48 часов\n📉 Отписки: 0-3%\n🛡 Гарантия: 90 дней\n✨ С Premium значком',
        en: '💎 Telegram Premium accounts\n⏱ Speed: 1-48 hours\n📉 Drop: 0-3%\n🛡 Guarantee: 90 days\n✨ With Premium badge',
      },
      minQuantity: 10, maxQuantity: 10000, pricePerUnit: 80, sortOrder: 5,
    },
    {
      slug: 'tg-sub-uz',
      name: { uz: '🇺🇿 O\'zbek obunachilar', ru: '🇺🇿 Узбекские подписчики', en: '🇺🇿 Uzbek Subscribers' },
      description: {
        uz: '🇺🇿 O\'zbekistonlik obunachilar\n⏱ Tezlik: 1-24 soat\n📉 Tushish: 5-10%\n🛡 Kafolat: 30 kun\n🎯 Target: O\'zbekiston',
        ru: '🇺🇿 Подписчики из Узбекистана\n⏱ Скорость: 1-24 часа\n📉 Отписки: 5-10%\n🛡 Гарантия: 30 дней\n🎯 Таргет: Узбекистан',
        en: '🇺🇿 Subscribers from Uzbekistan\n⏱ Speed: 1-24 hours\n📉 Drop: 5-10%\n🛡 Guarantee: 30 days\n🎯 Target: Uzbekistan',
      },
      minQuantity: 10, maxQuantity: 10000, pricePerUnit: 100, sortOrder: 6,
    },
    {
      slug: 'tg-sub-ru',
      name: { uz: '🇷🇺 Rus obunachilar', ru: '🇷🇺 Русские подписчики', en: '🇷🇺 Russian Subscribers' },
      description: {
        uz: '🇷🇺 Rossiyalik obunachilar\n⏱ Tezlik: 1-24 soat\n📉 Tushish: 5-10%\n🛡 Kafolat: 30 kun',
        ru: '🇷🇺 Подписчики из России\n⏱ Скорость: 1-24 часа\n📉 Отписки: 5-10%\n🛡 Гарантия: 30 дней',
        en: '🇷🇺 Subscribers from Russia\n⏱ Speed: 1-24 hours\n📉 Drop: 5-10%\n🛡 Guarantee: 30 days',
      },
      minQuantity: 10, maxQuantity: 20000, pricePerUnit: 70, sortOrder: 7,
    },
  ],
  'tg-post-views': [
    {
      slug: 'tg-views-fast',
      name: { uz: '⚡ Tez ko\'rishlar', ru: '⚡ Быстрые просмотры', en: '⚡ Fast Views' },
      description: { uz: '⚡ 0-30 daqiqa\n📊 1 ta post uchun', ru: '⚡ 0-30 минут\n📊 Для 1 поста', en: '⚡ 0-30 minutes\n📊 For 1 post' },
      minQuantity: 100, maxQuantity: 1000000, pricePerUnit: 0.3, sortOrder: 1,
    },
    {
      slug: 'tg-views-hq',
      name: { uz: '⭐ Sifatli ko\'rishlar', ru: '⭐ Качественные просмотры', en: '⭐ HQ Views' },
      description: { uz: '⭐ Real ko\'rishlar\n⏱ 0-1 soat\n📊 1 ta post', ru: '⭐ Реальные просмотры\n⏱ 0-1 час\n📊 1 пост', en: '⭐ Real views\n⏱ 0-1 hour\n📊 1 post' },
      minQuantity: 100, maxQuantity: 500000, pricePerUnit: 0.8, sortOrder: 2,
    },
    {
      slug: 'tg-views-last5',
      name: { uz: '📋 Oxirgi 5 post ko\'rishlar', ru: '📋 Просмотры на 5 постов', en: '📋 Last 5 Posts Views' },
      description: { uz: '📋 Oxirgi 5 ta postga\n⏱ 0-2 soat', ru: '📋 На последние 5 постов\n⏱ 0-2 часа', en: '📋 Last 5 posts\n⏱ 0-2 hours' },
      minQuantity: 100, maxQuantity: 200000, pricePerUnit: 1.2, sortOrder: 3,
    },
  ],
  'tg-reactions': [
    {
      slug: 'tg-react-like',
      name: { uz: '👍 Like reaktsiya', ru: '👍 Лайк реакция', en: '👍 Like Reaction' },
      description: { uz: '👍 Like emoji\n⏱ 0-1 soat', ru: '👍 Лайк эмодзи\n⏱ 0-1 час', en: '👍 Like emoji\n⏱ 0-1 hour' },
      minQuantity: 10, maxQuantity: 50000, pricePerUnit: 2, sortOrder: 1,
    },
    {
      slug: 'tg-react-fire',
      name: { uz: '🔥 Fire reaktsiya', ru: '🔥 Огонь реакция', en: '🔥 Fire Reaction' },
      description: { uz: '🔥 Olov emoji\n⏱ 0-1 soat', ru: '🔥 Огонь эмодзи\n⏱ 0-1 час', en: '🔥 Fire emoji\n⏱ 0-1 hour' },
      minQuantity: 10, maxQuantity: 50000, pricePerUnit: 2, sortOrder: 2,
    },
    {
      slug: 'tg-react-heart',
      name: { uz: '❤️ Heart reaktsiya', ru: '❤️ Сердце реакция', en: '❤️ Heart Reaction' },
      description: { uz: '❤️ Yurak emoji\n⏱ 0-1 soat', ru: '❤️ Сердце эмодзи\n⏱ 0-1 час', en: '❤️ Heart emoji\n⏱ 0-1 hour' },
      minQuantity: 10, maxQuantity: 50000, pricePerUnit: 2, sortOrder: 3,
    },
    {
      slug: 'tg-react-random',
      name: { uz: '🎲 Random reaktsiyalar', ru: '🎲 Рандомные реакции', en: '🎲 Random Reactions' },
      description: { uz: '🎲 Turli emoji\n⏱ 0-1 soat', ru: '🎲 Разные эмодзи\n⏱ 0-1 час', en: '🎲 Mixed emoji\n⏱ 0-1 hour' },
      minQuantity: 10, maxQuantity: 50000, pricePerUnit: 1.5, sortOrder: 4,
    },
  ],
  'tg-comments': [
    {
      slug: 'tg-comments-random',
      name: { uz: '💬 Random kommentlar', ru: '💬 Случайные комменты', en: '💬 Random Comments' },
      description: { uz: '💬 Turli kommentariyalar\n⏱ 0-6 soat', ru: '💬 Разные комментарии\n⏱ 0-6 часов', en: '💬 Various comments\n⏱ 0-6 hours' },
      minQuantity: 5, maxQuantity: 5000, pricePerUnit: 50, sortOrder: 1,
    },
    {
      slug: 'tg-comments-positive',
      name: { uz: '😍 Ijobiy kommentlar', ru: '😍 Позитивные комменты', en: '😍 Positive Comments' },
      description: { uz: '😍 Faqat ijobiy\n⏱ 0-12 soat', ru: '😍 Только позитивные\n⏱ 0-12 часов', en: '😍 Positive only\n⏱ 0-12 hours' },
      minQuantity: 5, maxQuantity: 2000, pricePerUnit: 80, sortOrder: 2,
    },
  ],
  'tg-shares': [
    {
      slug: 'tg-shares-forward',
      name: { uz: '🔄 Post ulashish', ru: '🔄 Репост', en: '🔄 Post Shares' },
      description: { uz: '🔄 Postni boshqa kanallarga\n⏱ 0-6 soat', ru: '🔄 Репост в другие каналы\n⏱ 0-6 часов', en: '🔄 Share to other channels\n⏱ 0-6 hours' },
      minQuantity: 10, maxQuantity: 10000, pricePerUnit: 10, sortOrder: 1,
    },
  ],
  'tg-poll-votes': [
    {
      slug: 'tg-poll-votes',
      name: { uz: '📊 So\'rovnoma ovozlari', ru: '📊 Голоса в опросе', en: '📊 Poll Votes' },
      description: { uz: '📊 Istalgan variantga\n⏱ 0-6 soat', ru: '📊 На любой вариант\n⏱ 0-6 часов', en: '📊 Any option\n⏱ 0-6 hours' },
      minQuantity: 10, maxQuantity: 50000, pricePerUnit: 5, sortOrder: 1,
    },
  ],
  'tg-auto-views': [
    {
      slug: 'tg-auto-views-30',
      name: { uz: '🔄 Avto ko\'rish (30 kun)', ru: '🔄 Авто просмотры (30 дн)', en: '🔄 Auto Views (30 days)' },
      description: { uz: '🔄 Har bir yangi postga avtomatik\n📅 30 kun davomida\n⏱ Darhol', ru: '🔄 Автоматически на каждый пост\n📅 30 дней\n⏱ Моментально', en: '🔄 Auto on every new post\n📅 30 days\n⏱ Instant' },
      minQuantity: 100, maxQuantity: 100000, pricePerUnit: 3, sortOrder: 1, isAutoService: true,
    },
  ],
  'tg-story-views': [
    {
      slug: 'tg-story-views',
      name: { uz: '📱 Story ko\'rishlar', ru: '📱 Просмотры историй', en: '📱 Story Views' },
      description: { uz: '📱 Telegram story uchun\n⏱ 0-1 soat', ru: '📱 Для историй Telegram\n⏱ 0-1 час', en: '📱 For Telegram stories\n⏱ 0-1 hour' },
      minQuantity: 100, maxQuantity: 100000, pricePerUnit: 0.5, sortOrder: 1,
    },
  ],
};

const INSTAGRAM_SERVICES: Record<string, ServiceSeed[]> = {
  'ig-followers': [
    {
      slug: 'ig-fol-cheap',
      name: { uz: '👤 Arzon followerlar', ru: '👤 Дешёвые подписчики', en: '👤 Cheap Followers' },
      description: { uz: '💰 Eng arzon\n⏱ 0-6 soat\n📉 Tushish: 10-20%\n⚠️ Kafolat yo\'q', ru: '💰 Самые дешёвые\n⏱ 0-6 часов\n📉 Отписки: 10-20%\n⚠️ Без гарантии', en: '💰 Cheapest\n⏱ 0-6 hours\n📉 Drop: 10-20%\n⚠️ No guarantee' },
      minQuantity: 50, maxQuantity: 100000, pricePerUnit: 8, sortOrder: 1,
    },
    {
      slug: 'ig-fol-medium',
      name: { uz: '👥 O\'rta sifat', ru: '👥 Среднее качество', en: '👥 Medium Quality' },
      description: { uz: '✅ Yaxshi sifat\n⏱ 0-12 soat\n📉 Tushish: 5-10%\n🛡 Kafolat: 30 kun', ru: '✅ Хорошее качество\n⏱ 0-12 часов\n📉 Отписки: 5-10%\n🛡 Гарантия: 30 дней', en: '✅ Good quality\n⏱ 0-12 hours\n📉 Drop: 5-10%\n🛡 Guarantee: 30 days' },
      minQuantity: 50, maxQuantity: 50000, pricePerUnit: 25, sortOrder: 2,
    },
    {
      slug: 'ig-fol-hq',
      name: { uz: '⭐ Yuqori sifat (HQ)', ru: '⭐ Высокое качество (HQ)', en: '⭐ High Quality (HQ)' },
      description: { uz: '⭐ Real profillar\n⏱ 0-24 soat\n📉 Tushish: 1-5%\n🛡 Kafolat: 60 kun\n📸 Avatar + postlar bor', ru: '⭐ Реальные профили\n⏱ 0-24 часа\n📉 Отписки: 1-5%\n🛡 Гарантия: 60 дней\n📸 С аватаром и постами', en: '⭐ Real profiles\n⏱ 0-24 hours\n📉 Drop: 1-5%\n🛡 Guarantee: 60 days\n📸 With avatar + posts' },
      minQuantity: 10, maxQuantity: 20000, pricePerUnit: 50, sortOrder: 3,
    },
    {
      slug: 'ig-fol-real',
      name: { uz: '💎 Real followerlar', ru: '💎 Реальные подписчики', en: '💎 Real Followers' },
      description: { uz: '💎 100% real akkauntlar\n⏱ 1-72 soat\n📉 Tushish: 0-3%\n🛡 Kafolat: 90 kun\n🌟 Eng sifatli', ru: '💎 100% реальные аккаунты\n⏱ 1-72 часа\n📉 Отписки: 0-3%\n🛡 Гарантия: 90 дней\n🌟 Лучшее качество', en: '💎 100% real accounts\n⏱ 1-72 hours\n📉 Drop: 0-3%\n🛡 Guarantee: 90 days\n🌟 Best quality' },
      minQuantity: 10, maxQuantity: 10000, pricePerUnit: 100, sortOrder: 4,
    },
  ],
  'ig-likes': [
    {
      slug: 'ig-likes-cheap',
      name: { uz: '❤️ Arzon layklar', ru: '❤️ Дешёвые лайки', en: '❤️ Cheap Likes' },
      description: { uz: '⚡ Tez\n⏱ 0-30 daqiqa', ru: '⚡ Быстро\n⏱ 0-30 минут', en: '⚡ Fast\n⏱ 0-30 minutes' },
      minQuantity: 10, maxQuantity: 100000, pricePerUnit: 2, sortOrder: 1,
    },
    {
      slug: 'ig-likes-hq',
      name: { uz: '⭐ Sifatli layklar', ru: '⭐ Качественные лайки', en: '⭐ HQ Likes' },
      description: { uz: '⭐ Real akkauntlardan\n⏱ 0-2 soat\n🛡 Kafolat: 30 kun', ru: '⭐ С реальных аккаунтов\n⏱ 0-2 часа\n🛡 Гарантия: 30 дней', en: '⭐ From real accounts\n⏱ 0-2 hours\n🛡 Guarantee: 30 days' },
      minQuantity: 10, maxQuantity: 50000, pricePerUnit: 8, sortOrder: 2,
    },
  ],
  'ig-comments': [
    {
      slug: 'ig-comments-emoji',
      name: { uz: '😍 Emoji kommentlar', ru: '😍 Эмодзи комменты', en: '😍 Emoji Comments' },
      description: { uz: '😍 Emoji kommentariyalar\n⏱ 0-6 soat', ru: '😍 Эмодзи комментарии\n⏱ 0-6 часов', en: '😍 Emoji comments\n⏱ 0-6 hours' },
      minQuantity: 5, maxQuantity: 5000, pricePerUnit: 30, sortOrder: 1,
    },
    {
      slug: 'ig-comments-custom',
      name: { uz: '✍️ Maxsus kommentlar', ru: '✍️ Кастомные комменты', en: '✍️ Custom Comments' },
      description: { uz: '✍️ Siz yozgan kommentlar\n⏱ 0-12 soat', ru: '✍️ Ваши комментарии\n⏱ 0-12 часов', en: '✍️ Your custom comments\n⏱ 0-12 hours' },
      minQuantity: 5, maxQuantity: 1000, pricePerUnit: 100, sortOrder: 2,
    },
  ],
  'ig-reel-views': [
    {
      slug: 'ig-reel-views',
      name: { uz: '🎬 Reel ko\'rishlar', ru: '🎬 Просмотры Reels', en: '🎬 Reel Views' },
      description: { uz: '🎬 Instagram Reels uchun\n⏱ 0-2 soat', ru: '🎬 Для Instagram Reels\n⏱ 0-2 часа', en: '🎬 For Instagram Reels\n⏱ 0-2 hours' },
      minQuantity: 100, maxQuantity: 1000000, pricePerUnit: 0.3, sortOrder: 1,
    },
  ],
  'ig-story-views': [
    {
      slug: 'ig-story-views',
      name: { uz: '📱 Story ko\'rishlar', ru: '📱 Просмотры историй', en: '📱 Story Views' },
      description: { uz: '📱 Instagram Story uchun\n⏱ 0-1 soat', ru: '📱 Для историй Instagram\n⏱ 0-1 час', en: '📱 For Instagram Stories\n⏱ 0-1 hour' },
      minQuantity: 100, maxQuantity: 100000, pricePerUnit: 0.5, sortOrder: 1,
    },
  ],
  'ig-saves': [
    {
      slug: 'ig-saves',
      name: { uz: '🔖 Saqlashlar', ru: '🔖 Сохранения', en: '🔖 Saves' },
      description: { uz: '🔖 Post saqlash\n⏱ 0-6 soat', ru: '🔖 Сохранение поста\n⏱ 0-6 часов', en: '🔖 Post saves\n⏱ 0-6 hours' },
      minQuantity: 10, maxQuantity: 50000, pricePerUnit: 3, sortOrder: 1,
    },
  ],
  'ig-shares': [
    {
      slug: 'ig-shares',
      name: { uz: '🔄 Ulashishlar', ru: '🔄 Репосты', en: '🔄 Shares' },
      description: { uz: '🔄 Post ulashish\n⏱ 0-6 soat', ru: '🔄 Поделиться постом\n⏱ 0-6 часов', en: '🔄 Share post\n⏱ 0-6 hours' },
      minQuantity: 10, maxQuantity: 50000, pricePerUnit: 3, sortOrder: 1,
    },
  ],
  'ig-live-viewers': [
    {
      slug: 'ig-live-viewers',
      name: { uz: '🔴 Jonli efir tomosha', ru: '🔴 Зрители прямого эфира', en: '🔴 Live Viewers' },
      description: { uz: '🔴 Live stream uchun\n⏱ Darhol\n⏳ 30-60 daqiqa davomida', ru: '🔴 Для прямого эфира\n⏱ Моментально\n⏳ 30-60 минут', en: '🔴 For live stream\n⏱ Instant\n⏳ 30-60 minutes' },
      minQuantity: 50, maxQuantity: 10000, pricePerUnit: 15, sortOrder: 1,
    },
  ],
  'ig-impressions': [
    {
      slug: 'ig-impressions',
      name: { uz: '📊 Impressions + Reach', ru: '📊 Показы + Охват', en: '📊 Impressions + Reach' },
      description: { uz: '📊 Post ko\'rishlar + qamrov\n⏱ 0-6 soat', ru: '📊 Показы + охват поста\n⏱ 0-6 часов', en: '📊 Post impressions + reach\n⏱ 0-6 hours' },
      minQuantity: 100, maxQuantity: 500000, pricePerUnit: 0.5, sortOrder: 1,
    },
  ],
  'ig-auto-likes': [
    {
      slug: 'ig-auto-likes-30',
      name: { uz: '🔄 Avto layklar (30 kun)', ru: '🔄 Авто лайки (30 дн)', en: '🔄 Auto Likes (30 days)' },
      description: { uz: '🔄 Har bir yangi postga avtomatik\n📅 30 kun\n⏱ Darhol', ru: '🔄 Автоматически на каждый пост\n📅 30 дней\n⏱ Моментально', en: '🔄 Auto on every new post\n📅 30 days\n⏱ Instant' },
      minQuantity: 50, maxQuantity: 50000, pricePerUnit: 5, sortOrder: 1, isAutoService: true,
    },
  ],
};

async function seedServices() {
  console.log('Seeding services...');

  const allServices = { ...TELEGRAM_SERVICES, ...INSTAGRAM_SERVICES };

  for (const [categorySlug, services] of Object.entries(allServices)) {
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) {
      console.log(`Category not found: ${categorySlug}, skipping`);
      continue;
    }

    for (const svc of services) {
      const existing = await prisma.service.findFirst({
        where: { categoryId: category.id, name: { path: ['uz'], equals: svc.name.uz } },
      });

      if (existing) {
        console.log(`  Service exists: ${svc.name.uz}, updating...`);
        await prisma.service.update({
          where: { id: existing.id },
          data: {
            name: svc.name,
            description: svc.description,
            minQuantity: svc.minQuantity,
            maxQuantity: svc.maxQuantity,
            pricePerUnit: new Prisma.Decimal(svc.pricePerUnit),
            sortOrder: svc.sortOrder,
            isAutoService: svc.isAutoService || false,
          },
        });
      } else {
        await prisma.service.create({
          data: {
            categoryId: category.id,
            name: svc.name,
            description: svc.description,
            minQuantity: svc.minQuantity,
            maxQuantity: svc.maxQuantity,
            pricePerUnit: new Prisma.Decimal(svc.pricePerUnit),
            sortOrder: svc.sortOrder,
            isAutoService: svc.isAutoService || false,
          },
        });
        console.log(`  + ${svc.name.uz}`);
      }
    }
    console.log(`✅ ${categorySlug}: ${services.length} services`);
  }

  const total = await prisma.service.count();
  console.log(`\n🎉 Total services: ${total}`);
}

seedServices()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
