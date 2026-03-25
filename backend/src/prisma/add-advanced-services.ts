import { PrismaClient, Prisma, Platform } from '@prisma/client';

const prisma = new PrismaClient();
const UZS_RATE = 12800;
const MARKUP = 2.5;

async function main() {
  const provider = await prisma.provider.findFirst({ where: { name: 'Peakerr' } });
  if (!provider) { console.log('Provider not found!'); return; }

  console.log('=== YANGI KATEGORIYALAR VA XIZMATLAR QO\'SHISH ===\n');

  // Yangi kategoriyalar
  const newCategories = [
    { name: { uz: 'Real obunachilar', ru: 'Реальные подписчики', en: 'Real Subscribers' }, slug: 'tg-real-members', platform: 'TELEGRAM' as Platform, icon: '👤', sortOrder: 10 },
    { name: { uz: 'Premium Boost', ru: 'Премиум Буст', en: 'Premium Boost' }, slug: 'tg-premium-boost', platform: 'TELEGRAM' as Platform, icon: '🚀', sortOrder: 11 },
    { name: { uz: 'Globalga chiqarish', ru: 'Вывод в глобальный', en: 'Global Ranking' }, slug: 'tg-global', platform: 'TELEGRAM' as Platform, icon: '🌍', sortOrder: 12 },
    { name: { uz: 'Premium Members', ru: 'Премиум участники', en: 'Premium Members' }, slug: 'tg-premium-members', platform: 'TELEGRAM' as Platform, icon: '💎', sortOrder: 13 },
  ];

  for (const cat of newCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder },
      create: cat,
    });
  }
  console.log(`${newCategories.length} yangi kategoriya yaratildi\n`);

  // Yangi xizmatlar
  const newServices: Array<{
    catSlug: string;
    name: { uz: string; ru: string; en: string };
    desc: { uz: string; ru: string; en: string };
    min: number;
    max: number;
    peakerrId: string;
    sort: number;
  }> = [
    // === REAL OBUNACHILAR (qidirib topadigan) ===
    {
      catSlug: 'tg-real-members',
      name: { uz: '🔍 Qidiruvdan obunachi', ru: '🔍 Подписчики из поиска', en: '🔍 Search Subscribers' },
      desc: {
        uz: '🔍 Haqiqiy odamlar qidirib topadi va obuna bo\'ladi\n⏱ Tezlik: 1K/kun\n📉 Tushish: 0%\n🌍 Dunyo bo\'ylab\n⭐ ENG SIFATLI — Telegram algoritmi uchun ideal',
        ru: '🔍 Реальные люди находят и подписываются\n⏱ Скорость: 1K/день\n📉 Отписки: 0%\n🌍 По всему миру\n⭐ ЛУЧШЕЕ КАЧЕСТВО',
        en: '🔍 Real people find and subscribe\n⏱ Speed: 1K/day\n📉 Drop: 0%\n🌍 Worldwide\n⭐ BEST QUALITY',
      },
      min: 1, max: 15000, peakerrId: '28554', sort: 1,
    },
    {
      catSlug: 'tg-real-members',
      name: { uz: '👀 Real ko\'rishlar', ru: '👀 Реальные просмотры', en: '👀 Real Views' },
      desc: {
        uz: '👀 Haqiqiy odamlarning ko\'rishlari\n⏱ 1K/kun\n🌍 Dunyo bo\'ylab\n✅ Organik ko\'rinish',
        ru: '👀 Просмотры реальных людей\n⏱ 1K/день\n🌍 По всему миру',
        en: '👀 Real people views\n⏱ 1K/day\n🌍 Worldwide',
      },
      min: 1, max: 15000, peakerrId: '28549', sort: 2,
    },
    {
      catSlug: 'tg-real-members',
      name: { uz: '💬 Real reaktsiyalar', ru: '💬 Реальные реакции', en: '💬 Real Reactions' },
      desc: {
        uz: '💬 Haqiqiy odamlarning reaktsiyalari\n⏱ 1K/kun\n🌍 Dunyo bo\'ylab',
        ru: '💬 Реакции реальных людей\n⏱ 1K/день\n🌍 По всему миру',
        en: '💬 Real people reactions\n⏱ 1K/day\n🌍 Worldwide',
      },
      min: 1, max: 15000, peakerrId: '28551', sort: 3,
    },
    {
      catSlug: 'tg-real-members',
      name: { uz: '📝 Real kommentlar', ru: '📝 Реальные комментарии', en: '📝 Real Comments' },
      desc: {
        uz: '📝 Haqiqiy odamlar komment yozadi\n⏱ 1K/kun\n🌍 Dunyo bo\'ylab\n⭐ Eng sifatli kommentlar',
        ru: '📝 Реальные люди пишут комментарии\n⏱ 1K/день\n🌍 По всему миру',
        en: '📝 Real people write comments\n⏱ 1K/day\n🌍 Worldwide',
      },
      min: 1, max: 15000, peakerrId: '28557', sort: 4,
    },

    // === PREMIUM BOOST ===
    {
      catSlug: 'tg-premium-boost',
      name: { uz: '🚀 Kanal Boost (1 kun)', ru: '🚀 Буст канала (1 день)', en: '🚀 Channel Boost (1 day)' },
      desc: {
        uz: '🚀 Telegram Premium Boost\n📅 1 kun davomida\n⚡ Kanalga rasmiy boost\n🌍 Globalga chiqishga yordam beradi',
        ru: '🚀 Telegram Premium Boost\n📅 1 день\n⚡ Официальный буст канала',
        en: '🚀 Telegram Premium Boost\n📅 1 day\n⚡ Official channel boost',
      },
      min: 10, max: 150000, peakerrId: '28483', sort: 1,
    },
    {
      catSlug: 'tg-premium-boost',
      name: { uz: '🚀 Kanal Boost (7 kun)', ru: '🚀 Буст канала (7 дней)', en: '🚀 Channel Boost (7 days)' },
      desc: {
        uz: '🚀 Telegram Premium Boost\n📅 7 kun davomida\n⚡ Kanalga rasmiy boost\n🌍 Globalga chiqish kafolati',
        ru: '🚀 Telegram Premium Boost\n📅 7 дней\n⚡ Официальный буст',
        en: '🚀 Telegram Premium Boost\n📅 7 days\n⚡ Official boost',
      },
      min: 10, max: 150000, peakerrId: '28484', sort: 2,
    },
    {
      catSlug: 'tg-premium-boost',
      name: { uz: '🚀 Premium Shares', ru: '🚀 Премиум репосты', en: '🚀 Premium Shares' },
      desc: {
        uz: '🚀 Premium akkauntlardan ulashish\n⏱ Darhol\n⚡ Kanalni tarqatadi',
        ru: '🚀 Репосты с премиум аккаунтов\n⏱ Моментально',
        en: '🚀 Shares from premium accounts\n⏱ Instant',
      },
      min: 10, max: 100000, peakerrId: '28565', sort: 3,
    },
    {
      catSlug: 'tg-premium-boost',
      name: { uz: '❤️ Story Likes', ru: '❤️ Лайки историй', en: '❤️ Story Likes' },
      desc: {
        uz: '❤️ Story layklar\n⏱ Darhol',
        ru: '❤️ Лайки на истории\n⏱ Моментально',
        en: '❤️ Story likes\n⏱ Instant',
      },
      min: 10, max: 100000, peakerrId: '28564', sort: 4,
    },

    // === GLOBALGA CHIQARISH (paketlar) ===
    {
      catSlug: 'tg-global',
      name: { uz: '🔍 Qidiruv ko\'rishlar (Rus)', ru: '🔍 Просмотры из поиска (РУ)', en: '🔍 Search Views (RU)' },
      desc: {
        uz: '🔍 Rus qidiruvdan ko\'rishlar\n⏱ Darhol\n📊 Qidiruv reytingini oshiradi\n🇷🇺 Rossiya auditoriyasi',
        ru: '🔍 Просмотры из русского поиска\n⏱ Моментально\n📊 Улучшает поисковый рейтинг',
        en: '🔍 Views from Russian search\n⏱ Instant\n📊 Improves search ranking',
      },
      min: 10, max: 200000, peakerrId: '18129', sort: 1,
    },
    {
      catSlug: 'tg-global',
      name: { uz: '📊 Premium Views', ru: '📊 Премиум просмотры', en: '📊 Premium Views' },
      desc: {
        uz: '📊 Premium akkauntlardan ko\'rishlar\n⏱ Darhol\n🚀 Ranking uchun',
        ru: '📊 Просмотры с премиум аккаунтов\n⏱ Моментально',
        en: '📊 Views from premium accounts\n⏱ Instant',
      },
      min: 10, max: 100000, peakerrId: '28561', sort: 2,
    },
    {
      catSlug: 'tg-global',
      name: { uz: '📱 Premium Story Views', ru: '📱 Просмотры историй', en: '📱 Premium Story Views' },
      desc: {
        uz: '📱 Premium akkauntlardan story ko\'rish\n⏱ Darhol',
        ru: '📱 Просмотры историй с премиум аккаунтов\n⏱ Моментально',
        en: '📱 Story views from premium accounts\n⏱ Instant',
      },
      min: 10, max: 100000, peakerrId: '28562', sort: 3,
    },

    // === PREMIUM MEMBERS (turli muddatli) ===
    {
      catSlug: 'tg-premium-members',
      name: { uz: '💎 Premium 7 kun', ru: '💎 Премиум 7 дней', en: '💎 Premium 7 days' },
      desc: {
        uz: '💎 Telegram Premium badge\n📅 7 kun premium turadi\n⏱ Darhol\n📉 Non Drop',
        ru: '💎 Telegram Premium значок\n📅 7 дней премиум\n⏱ Моментально',
        en: '💎 Telegram Premium badge\n📅 7 days premium\n⏱ Instant',
      },
      min: 10, max: 50000, peakerrId: '28507', sort: 1,
    },
    {
      catSlug: 'tg-premium-members',
      name: { uz: '💎 Premium 15 kun', ru: '💎 Премиум 15 дней', en: '💎 Premium 15 days' },
      desc: {
        uz: '💎 Telegram Premium badge\n📅 15 kun premium turadi\n⏱ Darhol\n📉 Non Drop',
        ru: '💎 Telegram Premium значок\n📅 15 дней премиум',
        en: '💎 Telegram Premium badge\n📅 15 days premium',
      },
      min: 10, max: 50000, peakerrId: '28509', sort: 2,
    },
    {
      catSlug: 'tg-premium-members',
      name: { uz: '💎 Premium 30 kun', ru: '💎 Премиум 30 дней', en: '💎 Premium 30 days' },
      desc: {
        uz: '💎 Telegram Premium badge\n📅 30 kun premium turadi\n⏱ Darhol\n📉 Non Drop\n⭐ Eng mashhur',
        ru: '💎 Telegram Premium значок\n📅 30 дней премиум\n⭐ Самый популярный',
        en: '💎 Telegram Premium badge\n📅 30 days premium\n⭐ Most popular',
      },
      min: 10, max: 50000, peakerrId: '28512', sort: 3,
    },
    {
      catSlug: 'tg-premium-members',
      name: { uz: '💎 Premium 60 kun', ru: '💎 Премиум 60 дней', en: '💎 Premium 60 days' },
      desc: {
        uz: '💎 Telegram Premium badge\n📅 60 kun\n📉 Non Drop',
        ru: '💎 Telegram Premium\n📅 60 дней',
        en: '💎 Telegram Premium\n📅 60 days',
      },
      min: 10, max: 50000, peakerrId: '28513', sort: 4,
    },
    {
      catSlug: 'tg-premium-members',
      name: { uz: '💎 Premium 90 kun', ru: '💎 Премиум 90 дней', en: '💎 Premium 90 days' },
      desc: {
        uz: '💎 Telegram Premium badge\n📅 90 kun\n📉 Non Drop',
        ru: '💎 Telegram Premium\n📅 90 дней',
        en: '💎 Telegram Premium\n📅 90 days',
      },
      min: 10, max: 50000, peakerrId: '28514', sort: 5,
    },
    {
      catSlug: 'tg-premium-members',
      name: { uz: '💎 Premium 180 kun', ru: '💎 Премиум 180 дней', en: '💎 Premium 180 days' },
      desc: {
        uz: '💎 Telegram Premium badge\n📅 180 kun (6 oy)\n📉 Non Drop\n🌟 Eng uzoq muddat',
        ru: '💎 Telegram Premium\n📅 180 дней (6 мес)\n🌟 Самый долгий',
        en: '💎 Telegram Premium\n📅 180 days (6 months)\n🌟 Longest duration',
      },
      min: 10, max: 50000, peakerrId: '28515', sort: 6,
    },
    {
      catSlug: 'tg-premium-members',
      name: { uz: '🇷🇺 Rus Premium Members', ru: '🇷🇺 Русские Премиум', en: '🇷🇺 Russian Premium' },
      desc: {
        uz: '🇷🇺 Rossiyalik Premium obunachilar\n📅 7 kun premium\n🎯 Target: Rossiya',
        ru: '🇷🇺 Русские Премиум подписчики\n📅 7 дней премиум',
        en: '🇷🇺 Russian Premium subscribers\n📅 7 days premium',
      },
      min: 10, max: 15000, peakerrId: '28526', sort: 7,
    },
  ];

  let added = 0;
  for (const svc of newServices) {
    const cat = await prisma.category.findUnique({ where: { slug: svc.catSlug } });
    if (!cat) { console.log(`  ⚠️ Category ${svc.catSlug} not found`); continue; }

    // Check if already exists
    const existing = await prisma.service.findFirst({
      where: { categoryId: cat.id, name: { path: ['uz'], equals: svc.name.uz } },
    });
    if (existing) { console.log(`  ⏭ ${svc.name.uz} — already exists`); continue; }

    // Find provider service
    const provSvc = await prisma.providerService.findFirst({
      where: { providerId: provider.id, externalServiceId: svc.peakerrId },
    });
    if (!provSvc) { console.log(`  ⚠️ Peakerr #${svc.peakerrId} not found`); continue; }

    const price = Number(provSvc.pricePerUnit);
    const sellPrice = (price * UZS_RATE * MARKUP) / 1000;

    const service = await prisma.service.create({
      data: {
        categoryId: cat.id,
        name: svc.name,
        description: svc.desc,
        minQuantity: svc.min,
        maxQuantity: svc.max,
        pricePerUnit: new Prisma.Decimal(sellPrice),
        sortOrder: svc.sort,
        isActive: true,
      },
    });

    // Create mapping
    await prisma.serviceProviderMapping.create({
      data: {
        serviceId: service.id,
        providerServiceId: provSvc.id,
        providerId: provider.id,
        priority: 10,
        isActive: true,
      },
    });

    console.log(`  ✅ ${svc.catSlug.padEnd(20)} | ${svc.name.uz.padEnd(30)} → #${svc.peakerrId} ($${price}/1K) → ${(sellPrice * 1000).toFixed(0)} so'm/1K`);
    added++;
  }

  const total = await prisma.service.count({ where: { isActive: true } });
  console.log(`\n🎉 ${added} ta yangi xizmat qo'shildi!`);
  console.log(`📊 Jami aktiv xizmatlar: ${total}`);
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); });
