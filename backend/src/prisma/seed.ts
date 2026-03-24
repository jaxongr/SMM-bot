import { PrismaClient, Platform, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Super Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { telegramId: BigInt(0) },
    update: {},
    create: {
      telegramId: BigInt(0),
      username: 'admin',
      firstName: 'Super',
      lastName: 'Admin',
      password: adminPassword,
      role: UserRole.SUPER_ADMIN,
      language: 'uz',
    },
  });
  console.log(`Admin created: ${admin.id}`);

  // 2. Telegram Categories
  const telegramCategories = [
    { name: { uz: 'Obunachilar', ru: 'Подписчики', en: 'Subscribers' }, slug: 'tg-subscribers', icon: '👥', sortOrder: 1 },
    { name: { uz: 'Post ko\'rishlar', ru: 'Просмотры постов', en: 'Post Views' }, slug: 'tg-post-views', icon: '👁', sortOrder: 2 },
    { name: { uz: 'Reaktsiyalar', ru: 'Реакции', en: 'Reactions' }, slug: 'tg-reactions', icon: '👍', sortOrder: 3 },
    { name: { uz: 'Kommentariyalar', ru: 'Комментарии', en: 'Comments' }, slug: 'tg-comments', icon: '💬', sortOrder: 4 },
    { name: { uz: 'Ulashishlar', ru: 'Репосты', en: 'Shares/Forwards' }, slug: 'tg-shares', icon: '🔄', sortOrder: 5 },
    { name: { uz: 'So\'rovnoma ovozlari', ru: 'Голоса в опросах', en: 'Poll Votes' }, slug: 'tg-poll-votes', icon: '📊', sortOrder: 6 },
    { name: { uz: 'Premium obunachilar', ru: 'Премиум подписчики', en: 'Premium Subscribers' }, slug: 'tg-premium', icon: '⭐', sortOrder: 7 },
    { name: { uz: 'Avto ko\'rishlar', ru: 'Авто просмотры', en: 'Auto Views' }, slug: 'tg-auto-views', icon: '🔄👁', sortOrder: 8 },
    { name: { uz: 'Story ko\'rishlar', ru: 'Просмотры историй', en: 'Story Views' }, slug: 'tg-story-views', icon: '📱', sortOrder: 9 },
  ];

  // 3. Instagram Categories
  const instagramCategories = [
    { name: { uz: 'Obunachilar', ru: 'Подписчики', en: 'Followers' }, slug: 'ig-followers', icon: '👥', sortOrder: 1 },
    { name: { uz: 'Layklar', ru: 'Лайки', en: 'Likes' }, slug: 'ig-likes', icon: '❤️', sortOrder: 2 },
    { name: { uz: 'Kommentariyalar', ru: 'Комментарии', en: 'Comments' }, slug: 'ig-comments', icon: '💬', sortOrder: 3 },
    { name: { uz: 'Reel ko\'rishlar', ru: 'Просмотры Reels', en: 'Reel Views' }, slug: 'ig-reel-views', icon: '🎬', sortOrder: 4 },
    { name: { uz: 'Story ko\'rishlar', ru: 'Просмотры историй', en: 'Story Views' }, slug: 'ig-story-views', icon: '📱', sortOrder: 5 },
    { name: { uz: 'IGTV ko\'rishlar', ru: 'Просмотры IGTV', en: 'IGTV Views' }, slug: 'ig-igtv-views', icon: '📺', sortOrder: 6 },
    { name: { uz: 'Saqlashlar', ru: 'Сохранения', en: 'Saves' }, slug: 'ig-saves', icon: '🔖', sortOrder: 7 },
    { name: { uz: 'Ulashishlar', ru: 'Репосты', en: 'Shares' }, slug: 'ig-shares', icon: '🔄', sortOrder: 8 },
    { name: { uz: 'Jonli efir tomosha', ru: 'Зрители прямого эфира', en: 'Live Viewers' }, slug: 'ig-live-viewers', icon: '🔴', sortOrder: 9 },
    { name: { uz: 'Ko\'rishlar/Qamrov', ru: 'Показы/Охват', en: 'Impressions/Reach' }, slug: 'ig-impressions', icon: '📊', sortOrder: 10 },
    { name: { uz: 'Avto layklar', ru: 'Авто лайки', en: 'Auto Likes' }, slug: 'ig-auto-likes', icon: '🔄❤️', sortOrder: 11 },
  ];

  for (const cat of telegramCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder },
      create: { ...cat, platform: Platform.TELEGRAM },
    });
  }
  console.log(`${telegramCategories.length} Telegram categories created`);

  for (const cat of instagramCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder },
      create: { ...cat, platform: Platform.INSTAGRAM },
    });
  }
  console.log(`${instagramCategories.length} Instagram categories created`);

  // 4. Default Settings
  const defaultSettings = [
    { key: 'referral_percentage', value: 5, description: 'Referral bonus percentage', group: 'referral' },
    { key: 'min_referral_payout', value: 10000, description: 'Minimum referral payout amount', group: 'referral' },
    { key: 'min_topup_amount', value: 1000, description: 'Minimum top-up amount (UZS)', group: 'payment' },
    { key: 'max_topup_amount', value: 10000000, description: 'Maximum top-up amount (UZS)', group: 'payment' },
    { key: 'default_currency', value: 'UZS', description: 'Default currency', group: 'general' },
    { key: 'bot_maintenance_mode', value: false, description: 'Bot maintenance mode', group: 'bot' },
    { key: 'auto_order_processing', value: true, description: 'Auto process orders', group: 'general' },
    { key: 'status_check_interval_seconds', value: 60, description: 'Order status check interval', group: 'general' },
    { key: 'max_orders_per_user_daily', value: 100, description: 'Max orders per user per day', group: 'general' },
    { key: 'support_telegram_username', value: '@smm_support', description: 'Support Telegram username', group: 'bot' },
    { key: 'click_enabled', value: false, description: 'Enable Click payments', group: 'payment' },
    { key: 'payme_enabled', value: false, description: 'Enable Payme payments', group: 'payment' },
    { key: 'crypto_enabled', value: false, description: 'Enable Crypto payments', group: 'payment' },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description, group: setting.group },
      create: setting,
    });
  }
  console.log(`${defaultSettings.length} settings created`);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
