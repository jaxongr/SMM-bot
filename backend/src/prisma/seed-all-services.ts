import { PrismaClient, Platform, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface CategorySeed {
  name: { uz: string; ru: string; en: string };
  slug: string;
  platform: Platform;
  icon: string;
  sortOrder: number;
}

interface ServiceSeed {
  name: { uz: string; ru: string; en: string };
  desc: { uz: string; ru: string; en: string };
  min: number;
  max: number;
  price: number;
  sort: number;
  auto?: boolean;
}

// ============ CATEGORIES ============
const NEW_CATEGORIES: CategorySeed[] = [
  // YouTube
  { name: { uz: 'Obunachilar', ru: 'Подписчики', en: 'Subscribers' }, slug: 'yt-subscribers', platform: 'YOUTUBE', icon: '👥', sortOrder: 1 },
  { name: { uz: 'Ko\'rishlar', ru: 'Просмотры', en: 'Views' }, slug: 'yt-views', platform: 'YOUTUBE', icon: '👁', sortOrder: 2 },
  { name: { uz: 'Layklar', ru: 'Лайки', en: 'Likes' }, slug: 'yt-likes', platform: 'YOUTUBE', icon: '👍', sortOrder: 3 },
  { name: { uz: 'Kommentariyalar', ru: 'Комментарии', en: 'Comments' }, slug: 'yt-comments', platform: 'YOUTUBE', icon: '💬', sortOrder: 4 },
  { name: { uz: 'Tomosha soatlari', ru: 'Часы просмотра', en: 'Watch Hours' }, slug: 'yt-watch-hours', platform: 'YOUTUBE', icon: '⏱', sortOrder: 5 },
  { name: { uz: 'Shorts ko\'rishlar', ru: 'Просмотры Shorts', en: 'Shorts Views' }, slug: 'yt-shorts', platform: 'YOUTUBE', icon: '📱', sortOrder: 6 },
  { name: { uz: 'Jonli efir', ru: 'Прямой эфир', en: 'Live Stream' }, slug: 'yt-live', platform: 'YOUTUBE', icon: '🔴', sortOrder: 7 },

  // TikTok
  { name: { uz: 'Obunachilar', ru: 'Подписчики', en: 'Followers' }, slug: 'tt-followers', platform: 'TIKTOK', icon: '👥', sortOrder: 1 },
  { name: { uz: 'Layklar', ru: 'Лайки', en: 'Likes' }, slug: 'tt-likes', platform: 'TIKTOK', icon: '❤️', sortOrder: 2 },
  { name: { uz: 'Ko\'rishlar', ru: 'Просмотры', en: 'Views' }, slug: 'tt-views', platform: 'TIKTOK', icon: '👁', sortOrder: 3 },
  { name: { uz: 'Kommentariyalar', ru: 'Комментарии', en: 'Comments' }, slug: 'tt-comments', platform: 'TIKTOK', icon: '💬', sortOrder: 4 },
  { name: { uz: 'Ulashishlar', ru: 'Репосты', en: 'Shares' }, slug: 'tt-shares', platform: 'TIKTOK', icon: '🔄', sortOrder: 5 },
  { name: { uz: 'Saqlashlar', ru: 'Сохранения', en: 'Saves' }, slug: 'tt-saves', platform: 'TIKTOK', icon: '🔖', sortOrder: 6 },
  { name: { uz: 'Jonli efir', ru: 'Прямой эфир', en: 'Live Viewers' }, slug: 'tt-live', platform: 'TIKTOK', icon: '🔴', sortOrder: 7 },

  // Facebook
  { name: { uz: 'Sahifa layklari', ru: 'Лайки страницы', en: 'Page Likes' }, slug: 'fb-page-likes', platform: 'FACEBOOK', icon: '👍', sortOrder: 1 },
  { name: { uz: 'Post layklari', ru: 'Лайки поста', en: 'Post Likes' }, slug: 'fb-post-likes', platform: 'FACEBOOK', icon: '❤️', sortOrder: 2 },
  { name: { uz: 'Obunachilar', ru: 'Подписчики', en: 'Followers' }, slug: 'fb-followers', platform: 'FACEBOOK', icon: '👥', sortOrder: 3 },
  { name: { uz: 'Ko\'rishlar', ru: 'Просмотры', en: 'Video Views' }, slug: 'fb-views', platform: 'FACEBOOK', icon: '👁', sortOrder: 4 },
  { name: { uz: 'Kommentariyalar', ru: 'Комментарии', en: 'Comments' }, slug: 'fb-comments', platform: 'FACEBOOK', icon: '💬', sortOrder: 5 },
  { name: { uz: 'Ulashishlar', ru: 'Репосты', en: 'Shares' }, slug: 'fb-shares', platform: 'FACEBOOK', icon: '🔄', sortOrder: 6 },
  { name: { uz: 'Guruh a\'zolari', ru: 'Участники группы', en: 'Group Members' }, slug: 'fb-group', platform: 'FACEBOOK', icon: '👥', sortOrder: 7 },

  // Twitter/X
  { name: { uz: 'Obunachilar', ru: 'Подписчики', en: 'Followers' }, slug: 'tw-followers', platform: 'TWITTER', icon: '👥', sortOrder: 1 },
  { name: { uz: 'Layklar', ru: 'Лайки', en: 'Likes' }, slug: 'tw-likes', platform: 'TWITTER', icon: '❤️', sortOrder: 2 },
  { name: { uz: 'Repostlar', ru: 'Ретвиты', en: 'Retweets' }, slug: 'tw-retweets', platform: 'TWITTER', icon: '🔄', sortOrder: 3 },
  { name: { uz: 'Ko\'rishlar', ru: 'Просмотры', en: 'Views' }, slug: 'tw-views', platform: 'TWITTER', icon: '👁', sortOrder: 4 },
  { name: { uz: 'Kommentariyalar', ru: 'Комментарии', en: 'Comments' }, slug: 'tw-comments', platform: 'TWITTER', icon: '💬', sortOrder: 5 },

  // Spotify
  { name: { uz: 'Tinglovchilar', ru: 'Прослушивания', en: 'Plays' }, slug: 'sp-plays', platform: 'SPOTIFY', icon: '🎵', sortOrder: 1 },
  { name: { uz: 'Obunachilar', ru: 'Подписчики', en: 'Followers' }, slug: 'sp-followers', platform: 'SPOTIFY', icon: '👥', sortOrder: 2 },
  { name: { uz: 'Saqlashlar', ru: 'Сохранения', en: 'Saves' }, slug: 'sp-saves', platform: 'SPOTIFY', icon: '🔖', sortOrder: 3 },
  { name: { uz: 'Playlist qo\'shish', ru: 'Добавление в плейлист', en: 'Playlist Adds' }, slug: 'sp-playlist', platform: 'SPOTIFY', icon: '📋', sortOrder: 4 },

  // Discord
  { name: { uz: 'Server a\'zolari', ru: 'Участники сервера', en: 'Server Members' }, slug: 'dc-members', platform: 'DISCORD', icon: '👥', sortOrder: 1 },
  { name: { uz: 'Onlayn a\'zolar', ru: 'Онлайн участники', en: 'Online Members' }, slug: 'dc-online', platform: 'DISCORD', icon: '🟢', sortOrder: 2 },
];

// ============ SERVICES ============
const ALL_SERVICES: Record<string, ServiceSeed[]> = {
  // === TELEGRAM ADDITIONAL ===
  'tg-subscribers': [
    { name: { uz: '🌍 Xalqaro obunachilar', ru: '🌍 Международные', en: '🌍 International' }, desc: { uz: '🌍 Turli davlatlardan\n⏱ 0-12 soat\n📉 Tushish: 5-10%\n🛡 30 kun', ru: '🌍 Из разных стран\n⏱ 0-12 часов\n📉 Отписки: 5-10%\n🛡 30 дней', en: '🌍 From various countries\n⏱ 0-12 hours\n📉 Drop: 5-10%\n🛡 30 days' }, min: 50, max: 50000, price: 20, sort: 8 },
    { name: { uz: '🔄 Refill kafolatli', ru: '🔄 С рефиллом', en: '🔄 Refill Guaranteed' }, desc: { uz: '🔄 Avtomatik to\'ldirish\n⏱ 0-24 soat\n🛡 Umrbod kafolat\n♻️ Tushsa qayta to\'ldiriladi', ru: '🔄 Автопополнение\n⏱ 0-24 часа\n🛡 Пожизненная гарантия\n♻️ Рефилл при отписке', en: '🔄 Auto refill\n⏱ 0-24 hours\n🛡 Lifetime guarantee\n♻️ Refill on drop' }, min: 50, max: 30000, price: 45, sort: 9 },
  ],

  // === YOUTUBE ===
  'yt-subscribers': [
    { name: { uz: '👤 Arzon obunachilar', ru: '👤 Дешёвые', en: '👤 Cheap Subscribers' }, desc: { uz: '💰 Arzon\n⏱ 0-24 soat\n📉 10-20%\n⚠️ Kafolat yo\'q', ru: '💰 Дешёвые\n⏱ 0-24 часа\n📉 10-20%\n⚠️ Без гарантии', en: '💰 Cheap\n⏱ 0-24 hours\n📉 10-20%\n⚠️ No guarantee' }, min: 50, max: 50000, price: 25, sort: 1 },
    { name: { uz: '👥 O\'rta sifat', ru: '👥 Среднее качество', en: '👥 Medium Quality' }, desc: { uz: '✅ Yaxshi\n⏱ 0-48 soat\n📉 5-10%\n🛡 30 kun', ru: '✅ Хорошее\n⏱ 0-48 часов\n📉 5-10%\n🛡 30 дней', en: '✅ Good\n⏱ 0-48 hours\n📉 5-10%\n🛡 30 days' }, min: 50, max: 20000, price: 60, sort: 2 },
    { name: { uz: '⭐ Yuqori sifat', ru: '⭐ Высокое качество', en: '⭐ High Quality' }, desc: { uz: '⭐ Real\n⏱ 1-72 soat\n📉 0-5%\n🛡 60 kun', ru: '⭐ Реальные\n⏱ 1-72 часа\n📉 0-5%\n🛡 60 дней', en: '⭐ Real\n⏱ 1-72 hours\n📉 0-5%\n🛡 60 days' }, min: 10, max: 10000, price: 120, sort: 3 },
  ],
  'yt-views': [
    { name: { uz: '⚡ Tez ko\'rishlar', ru: '⚡ Быстрые', en: '⚡ Fast Views' }, desc: { uz: '⚡ 0-6 soat\n📊 Retention: past', ru: '⚡ 0-6 часов\n📊 Удержание: низкое', en: '⚡ 0-6 hours\n📊 Retention: low' }, min: 500, max: 1000000, price: 1, sort: 1 },
    { name: { uz: '⭐ HR ko\'rishlar', ru: '⭐ HR просмотры', en: '⭐ High Retention Views' }, desc: { uz: '⭐ Yuqori retention\n⏱ 0-24 soat\n📊 70-90% retention', ru: '⭐ Высокое удержание\n⏱ 0-24 часа\n📊 70-90% удержание', en: '⭐ High retention\n⏱ 0-24 hours\n📊 70-90% retention' }, min: 500, max: 500000, price: 5, sort: 2 },
    { name: { uz: '🎯 Targetli ko\'rishlar', ru: '🎯 Таргетированные', en: '🎯 Targeted Views' }, desc: { uz: '🎯 Davlat bo\'yicha\n⏱ 0-48 soat\n📊 80%+ retention', ru: '🎯 По странам\n⏱ 0-48 часов\n📊 80%+ удержание', en: '🎯 By country\n⏱ 0-48 hours\n📊 80%+ retention' }, min: 1000, max: 200000, price: 10, sort: 3 },
  ],
  'yt-likes': [
    { name: { uz: '👍 Layklar', ru: '👍 Лайки', en: '👍 Likes' }, desc: { uz: '👍 Video layklar\n⏱ 0-12 soat', ru: '👍 Лайки видео\n⏱ 0-12 часов', en: '👍 Video likes\n⏱ 0-12 hours' }, min: 10, max: 50000, price: 8, sort: 1 },
    { name: { uz: '👎 Dislayklar', ru: '👎 Дизлайки', en: '👎 Dislikes' }, desc: { uz: '👎 Video dislayklar\n⏱ 0-12 soat', ru: '👎 Дизлайки видео\n⏱ 0-12 часов', en: '👎 Video dislikes\n⏱ 0-12 hours' }, min: 10, max: 50000, price: 8, sort: 2 },
  ],
  'yt-comments': [
    { name: { uz: '💬 Random kommentlar', ru: '💬 Случайные', en: '💬 Random Comments' }, desc: { uz: '💬 Turli kommentlar\n⏱ 0-24 soat', ru: '💬 Разные комменты\n⏱ 0-24 часа', en: '💬 Various comments\n⏱ 0-24 hours' }, min: 5, max: 2000, price: 80, sort: 1 },
    { name: { uz: '✍️ Maxsus kommentlar', ru: '✍️ Кастомные', en: '✍️ Custom Comments' }, desc: { uz: '✍️ Siz yozgan matn\n⏱ 0-48 soat', ru: '✍️ Ваш текст\n⏱ 0-48 часов', en: '✍️ Your text\n⏱ 0-48 hours' }, min: 5, max: 500, price: 150, sort: 2 },
  ],
  'yt-watch-hours': [
    { name: { uz: '⏱ 1000 soat', ru: '⏱ 1000 часов', en: '⏱ 1000 Hours' }, desc: { uz: '⏱ Monetizatsiya uchun\n📅 7-30 kun\n✅ AdSense uchun', ru: '⏱ Для монетизации\n📅 7-30 дней\n✅ Для AdSense', en: '⏱ For monetization\n📅 7-30 days\n✅ For AdSense' }, min: 500, max: 4000, price: 1500, sort: 1 },
  ],
  'yt-shorts': [
    { name: { uz: '📱 Shorts ko\'rishlar', ru: '📱 Shorts просмотры', en: '📱 Shorts Views' }, desc: { uz: '📱 YouTube Shorts\n⏱ 0-12 soat', ru: '📱 YouTube Shorts\n⏱ 0-12 часов', en: '📱 YouTube Shorts\n⏱ 0-12 hours' }, min: 100, max: 1000000, price: 0.5, sort: 1 },
    { name: { uz: '❤️ Shorts layklar', ru: '❤️ Shorts лайки', en: '❤️ Shorts Likes' }, desc: { uz: '❤️ Shorts uchun layklar\n⏱ 0-12 soat', ru: '❤️ Лайки для Shorts\n⏱ 0-12 часов', en: '❤️ Likes for Shorts\n⏱ 0-12 hours' }, min: 10, max: 50000, price: 5, sort: 2 },
  ],
  'yt-live': [
    { name: { uz: '🔴 Live tomosha', ru: '🔴 Зрители эфира', en: '🔴 Live Viewers' }, desc: { uz: '🔴 Jonli efir uchun\n⏱ Darhol\n⏳ 30-180 daqiqa', ru: '🔴 Для эфира\n⏱ Моментально\n⏳ 30-180 минут', en: '🔴 For live stream\n⏱ Instant\n⏳ 30-180 minutes' }, min: 50, max: 10000, price: 20, sort: 1 },
  ],

  // === TIKTOK ===
  'tt-followers': [
    { name: { uz: '👤 Arzon followerlar', ru: '👤 Дешёвые', en: '👤 Cheap Followers' }, desc: { uz: '💰 Arzon\n⏱ 0-6 soat\n📉 10-20%', ru: '💰 Дешёвые\n⏱ 0-6 часов\n📉 10-20%', en: '💰 Cheap\n⏱ 0-6 hours\n📉 10-20%' }, min: 50, max: 100000, price: 10, sort: 1 },
    { name: { uz: '👥 O\'rta sifat', ru: '👥 Среднее', en: '👥 Medium Quality' }, desc: { uz: '✅ Yaxshi\n⏱ 0-24 soat\n📉 5-10%\n🛡 30 kun', ru: '✅ Хорошее\n⏱ 0-24 часа\n📉 5-10%\n🛡 30 дней', en: '✅ Good\n⏱ 0-24 hours\n📉 5-10%\n🛡 30 days' }, min: 50, max: 50000, price: 30, sort: 2 },
    { name: { uz: '⭐ Yuqori sifat', ru: '⭐ Высокое', en: '⭐ High Quality' }, desc: { uz: '⭐ Real\n⏱ 0-48 soat\n📉 0-5%\n🛡 60 kun', ru: '⭐ Реальные\n⏱ 0-48 часов\n📉 0-5%\n🛡 60 дней', en: '⭐ Real\n⏱ 0-48 hours\n📉 0-5%\n🛡 60 days' }, min: 10, max: 20000, price: 60, sort: 3 },
  ],
  'tt-likes': [
    { name: { uz: '❤️ Arzon layklar', ru: '❤️ Дешёвые', en: '❤️ Cheap Likes' }, desc: { uz: '⚡ Tez\n⏱ 0-1 soat', ru: '⚡ Быстро\n⏱ 0-1 час', en: '⚡ Fast\n⏱ 0-1 hour' }, min: 50, max: 100000, price: 2, sort: 1 },
    { name: { uz: '⭐ Sifatli layklar', ru: '⭐ Качественные', en: '⭐ HQ Likes' }, desc: { uz: '⭐ Real\n⏱ 0-6 soat\n🛡 30 kun', ru: '⭐ Реальные\n⏱ 0-6 часов\n🛡 30 дней', en: '⭐ Real\n⏱ 0-6 hours\n🛡 30 days' }, min: 50, max: 50000, price: 6, sort: 2 },
  ],
  'tt-views': [
    { name: { uz: '👁 Ko\'rishlar', ru: '👁 Просмотры', en: '👁 Views' }, desc: { uz: '👁 TikTok video\n⏱ 0-2 soat', ru: '👁 TikTok видео\n⏱ 0-2 часа', en: '👁 TikTok video\n⏱ 0-2 hours' }, min: 100, max: 10000000, price: 0.2, sort: 1 },
  ],
  'tt-comments': [
    { name: { uz: '💬 Random', ru: '💬 Случайные', en: '💬 Random' }, desc: { uz: '💬 Turli\n⏱ 0-12 soat', ru: '💬 Разные\n⏱ 0-12 часов', en: '💬 Various\n⏱ 0-12 hours' }, min: 5, max: 5000, price: 40, sort: 1 },
  ],
  'tt-shares': [
    { name: { uz: '🔄 Ulashishlar', ru: '🔄 Репосты', en: '🔄 Shares' }, desc: { uz: '🔄 Video share\n⏱ 0-6 soat', ru: '🔄 Поделиться\n⏱ 0-6 часов', en: '🔄 Video share\n⏱ 0-6 hours' }, min: 10, max: 50000, price: 3, sort: 1 },
  ],
  'tt-saves': [
    { name: { uz: '🔖 Saqlashlar', ru: '🔖 Сохранения', en: '🔖 Saves' }, desc: { uz: '🔖 Video saqlash\n⏱ 0-6 soat', ru: '🔖 Сохранить видео\n⏱ 0-6 часов', en: '🔖 Save video\n⏱ 0-6 hours' }, min: 10, max: 50000, price: 3, sort: 1 },
  ],
  'tt-live': [
    { name: { uz: '🔴 Live tomosha', ru: '🔴 Зрители', en: '🔴 Live Viewers' }, desc: { uz: '🔴 Jonli efir\n⏱ Darhol\n⏳ 30-60 daq', ru: '🔴 Прямой эфир\n⏱ Моментально\n⏳ 30-60 мин', en: '🔴 Live stream\n⏱ Instant\n⏳ 30-60 min' }, min: 50, max: 10000, price: 15, sort: 1 },
  ],

  // === FACEBOOK ===
  'fb-page-likes': [
    { name: { uz: '👍 Sahifa layklar', ru: '👍 Лайки страницы', en: '👍 Page Likes' }, desc: { uz: '👍 Facebook sahifa\n⏱ 0-24 soat\n🛡 30 kun', ru: '👍 Facebook страница\n⏱ 0-24 часа\n🛡 30 дней', en: '👍 Facebook page\n⏱ 0-24 hours\n🛡 30 days' }, min: 50, max: 50000, price: 20, sort: 1 },
  ],
  'fb-post-likes': [
    { name: { uz: '❤️ Post layklar', ru: '❤️ Лайки поста', en: '❤️ Post Likes' }, desc: { uz: '❤️ Post/rasm uchun\n⏱ 0-6 soat', ru: '❤️ Для поста/фото\n⏱ 0-6 часов', en: '❤️ For post/photo\n⏱ 0-6 hours' }, min: 10, max: 50000, price: 5, sort: 1 },
    { name: { uz: '😍 Reaktsiyalar', ru: '😍 Реакции', en: '😍 Reactions' }, desc: { uz: '😍 Love/Haha/Wow\n⏱ 0-6 soat', ru: '😍 Love/Haha/Wow\n⏱ 0-6 часов', en: '😍 Love/Haha/Wow\n⏱ 0-6 hours' }, min: 10, max: 50000, price: 8, sort: 2 },
  ],
  'fb-followers': [
    { name: { uz: '👥 Followerlar', ru: '👥 Подписчики', en: '👥 Followers' }, desc: { uz: '👥 Profil uchun\n⏱ 0-24 soat\n🛡 30 kun', ru: '👥 Для профиля\n⏱ 0-24 часа\n🛡 30 дней', en: '👥 For profile\n⏱ 0-24 hours\n🛡 30 days' }, min: 50, max: 50000, price: 20, sort: 1 },
  ],
  'fb-views': [
    { name: { uz: '👁 Video ko\'rishlar', ru: '👁 Просмотры видео', en: '👁 Video Views' }, desc: { uz: '👁 Facebook video\n⏱ 0-6 soat', ru: '👁 Facebook видео\n⏱ 0-6 часов', en: '👁 Facebook video\n⏱ 0-6 hours' }, min: 100, max: 1000000, price: 0.5, sort: 1 },
    { name: { uz: '📱 Reels ko\'rishlar', ru: '📱 Просмотры Reels', en: '📱 Reels Views' }, desc: { uz: '📱 Facebook Reels\n⏱ 0-6 soat', ru: '📱 Facebook Reels\n⏱ 0-6 часов', en: '📱 Facebook Reels\n⏱ 0-6 hours' }, min: 100, max: 1000000, price: 0.5, sort: 2 },
  ],
  'fb-comments': [
    { name: { uz: '💬 Kommentlar', ru: '💬 Комментарии', en: '💬 Comments' }, desc: { uz: '💬 Random\n⏱ 0-12 soat', ru: '💬 Случайные\n⏱ 0-12 часов', en: '💬 Random\n⏱ 0-12 hours' }, min: 5, max: 2000, price: 50, sort: 1 },
  ],
  'fb-shares': [
    { name: { uz: '🔄 Ulashishlar', ru: '🔄 Репосты', en: '🔄 Shares' }, desc: { uz: '🔄 Post ulashish\n⏱ 0-12 soat', ru: '🔄 Поделиться\n⏱ 0-12 часов', en: '🔄 Share post\n⏱ 0-12 hours' }, min: 10, max: 20000, price: 10, sort: 1 },
  ],
  'fb-group': [
    { name: { uz: '👥 Guruh a\'zolari', ru: '👥 Участники', en: '👥 Group Members' }, desc: { uz: '👥 Facebook guruh\n⏱ 0-48 soat\n🛡 30 kun', ru: '👥 Facebook группа\n⏱ 0-48 часов\n🛡 30 дней', en: '👥 Facebook group\n⏱ 0-48 hours\n🛡 30 days' }, min: 50, max: 20000, price: 25, sort: 1 },
  ],

  // === TWITTER/X ===
  'tw-followers': [
    { name: { uz: '👥 Followerlar', ru: '👥 Подписчики', en: '👥 Followers' }, desc: { uz: '👥 X/Twitter profil\n⏱ 0-24 soat\n🛡 30 kun', ru: '👥 X/Twitter профиль\n⏱ 0-24 часа\n🛡 30 дней', en: '👥 X/Twitter profile\n⏱ 0-24 hours\n🛡 30 days' }, min: 50, max: 50000, price: 20, sort: 1 },
    { name: { uz: '⭐ HQ Followerlar', ru: '⭐ HQ Подписчики', en: '⭐ HQ Followers' }, desc: { uz: '⭐ Real profillar\n⏱ 0-48 soat\n🛡 60 kun', ru: '⭐ Реальные профили\n⏱ 0-48 часов\n🛡 60 дней', en: '⭐ Real profiles\n⏱ 0-48 hours\n🛡 60 days' }, min: 10, max: 20000, price: 50, sort: 2 },
  ],
  'tw-likes': [
    { name: { uz: '❤️ Layklar', ru: '❤️ Лайки', en: '❤️ Likes' }, desc: { uz: '❤️ Tweet layklar\n⏱ 0-6 soat', ru: '❤️ Лайки твита\n⏱ 0-6 часов', en: '❤️ Tweet likes\n⏱ 0-6 hours' }, min: 10, max: 50000, price: 5, sort: 1 },
  ],
  'tw-retweets': [
    { name: { uz: '🔄 Repostlar', ru: '🔄 Ретвиты', en: '🔄 Retweets' }, desc: { uz: '🔄 Tweet repost\n⏱ 0-6 soat', ru: '🔄 Ретвит\n⏱ 0-6 часов', en: '🔄 Retweet\n⏱ 0-6 hours' }, min: 10, max: 50000, price: 8, sort: 1 },
  ],
  'tw-views': [
    { name: { uz: '👁 Ko\'rishlar', ru: '👁 Просмотры', en: '👁 Views' }, desc: { uz: '👁 Tweet ko\'rishlar\n⏱ 0-2 soat', ru: '👁 Просмотры твита\n⏱ 0-2 часа', en: '👁 Tweet views\n⏱ 0-2 hours' }, min: 100, max: 1000000, price: 0.3, sort: 1 },
  ],
  'tw-comments': [
    { name: { uz: '💬 Javoblar', ru: '💬 Ответы', en: '💬 Replies' }, desc: { uz: '💬 Tweet javoblar\n⏱ 0-24 soat', ru: '💬 Ответы на твит\n⏱ 0-24 часа', en: '💬 Tweet replies\n⏱ 0-24 hours' }, min: 5, max: 1000, price: 60, sort: 1 },
  ],

  // === SPOTIFY ===
  'sp-plays': [
    { name: { uz: '🎵 Tinglanishlar', ru: '🎵 Прослушивания', en: '🎵 Plays' }, desc: { uz: '🎵 Spotify trek\n⏱ 0-48 soat', ru: '🎵 Spotify трек\n⏱ 0-48 часов', en: '🎵 Spotify track\n⏱ 0-48 hours' }, min: 500, max: 1000000, price: 2, sort: 1 },
    { name: { uz: '🎵 Premium tinglanish', ru: '🎵 Премиум прослушивания', en: '🎵 Premium Plays' }, desc: { uz: '🎵 Premium akkauntlardan\n⏱ 1-72 soat\n💰 Royalty uchun', ru: '🎵 С премиум аккаунтов\n⏱ 1-72 часа\n💰 Для роялти', en: '🎵 From premium accounts\n⏱ 1-72 hours\n💰 Royalty eligible' }, min: 1000, max: 500000, price: 8, sort: 2 },
  ],
  'sp-followers': [
    { name: { uz: '👥 Followerlar', ru: '👥 Подписчики', en: '👥 Followers' }, desc: { uz: '👥 Spotify artist/playlist\n⏱ 0-48 soat', ru: '👥 Spotify артист/плейлист\n⏱ 0-48 часов', en: '👥 Spotify artist/playlist\n⏱ 0-48 hours' }, min: 50, max: 50000, price: 15, sort: 1 },
  ],
  'sp-saves': [
    { name: { uz: '🔖 Saqlashlar', ru: '🔖 Сохранения', en: '🔖 Saves' }, desc: { uz: '🔖 Trek saqlash\n⏱ 0-24 soat', ru: '🔖 Сохранение трека\n⏱ 0-24 часа', en: '🔖 Save track\n⏱ 0-24 hours' }, min: 50, max: 50000, price: 5, sort: 1 },
  ],
  'sp-playlist': [
    { name: { uz: '📋 Playlist qo\'shish', ru: '📋 Добавить в плейлист', en: '📋 Playlist Adds' }, desc: { uz: '📋 Playlistga qo\'shish\n⏱ 0-48 soat', ru: '📋 Добавление в плейлист\n⏱ 0-48 часов', en: '📋 Add to playlist\n⏱ 0-48 hours' }, min: 50, max: 20000, price: 10, sort: 1 },
  ],

  // === DISCORD ===
  'dc-members': [
    { name: { uz: '👥 Server a\'zolari', ru: '👥 Участники', en: '👥 Server Members' }, desc: { uz: '👥 Discord server\n⏱ 0-24 soat\n🛡 30 kun', ru: '👥 Discord сервер\n⏱ 0-24 часа\n🛡 30 дней', en: '👥 Discord server\n⏱ 0-24 hours\n🛡 30 days' }, min: 50, max: 20000, price: 30, sort: 1 },
    { name: { uz: '👥 Onlayn a\'zolar', ru: '👥 Онлайн участники', en: '👥 Online Members' }, desc: { uz: '👥 Onlayn bo\'lib turadi\n⏱ Darhol\n⏳ 24 soat', ru: '👥 Будут онлайн\n⏱ Моментально\n⏳ 24 часа', en: '👥 Will be online\n⏱ Instant\n⏳ 24 hours' }, min: 10, max: 5000, price: 50, sort: 2 },
  ],
  'dc-online': [
    { name: { uz: '🟢 Onlayn boost', ru: '🟢 Онлайн буст', en: '🟢 Online Boost' }, desc: { uz: '🟢 Onlayn ko\'rsatish\n⏱ Darhol\n⏳ 1-30 kun', ru: '🟢 Показать онлайн\n⏱ Моментально\n⏳ 1-30 дней', en: '🟢 Show online\n⏱ Instant\n⏳ 1-30 days' }, min: 10, max: 5000, price: 100, sort: 1 },
  ],
};

async function main() {
  console.log('🚀 Seeding all platforms & services...\n');

  // 1. Create new categories
  for (const cat of NEW_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder },
      create: { name: cat.name, slug: cat.slug, platform: cat.platform, icon: cat.icon, sortOrder: cat.sortOrder },
    });
  }
  console.log(`📂 ${NEW_CATEGORIES.length} yangi kategoriya yaratildi\n`);

  // 2. Create services for each category
  let totalServices = 0;
  for (const [categorySlug, services] of Object.entries(ALL_SERVICES)) {
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) { console.log(`⚠️ Category not found: ${categorySlug}`); continue; }

    for (const svc of services) {
      const existing = await prisma.service.findFirst({
        where: { categoryId: category.id, name: { path: ['uz'], equals: svc.name.uz } },
      });
      if (!existing) {
        await prisma.service.create({
          data: {
            categoryId: category.id,
            name: svc.name,
            description: svc.desc,
            minQuantity: svc.min,
            maxQuantity: svc.max,
            pricePerUnit: new Prisma.Decimal(svc.price),
            sortOrder: svc.sort,
            isAutoService: svc.auto || false,
          },
        });
        totalServices++;
      }
    }
    console.log(`✅ ${categorySlug}: ${services.length} xizmat`);
  }

  const grandTotal = await prisma.service.count();
  const catTotal = await prisma.category.count();
  console.log(`\n🎉 Yangi qo'shildi: ${totalServices} ta xizmat`);
  console.log(`📊 Jami: ${catTotal} kategoriya, ${grandTotal} xizmat`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
