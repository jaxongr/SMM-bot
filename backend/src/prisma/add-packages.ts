import { PrismaClient, Prisma, Platform } from '@prisma/client';

const prisma = new PrismaClient();
const UZS_RATE = 12800;

async function main() {
  console.log('=== PAKETLAR QO\'SHISH ===\n');

  // Paketlar kategoriyasi yaratish
  const packageCategories = [
    {
      name: { uz: '📦 Telegram paketlar', ru: '📦 Телеграм пакеты', en: '📦 Telegram Packages' },
      slug: 'tg-packages',
      platform: 'TELEGRAM' as Platform,
      icon: '📦',
      sortOrder: 1,
    },
    {
      name: { uz: '📦 Instagram paketlar', ru: '📦 Инстаграм пакеты', en: '📦 Instagram Packages' },
      slug: 'ig-packages',
      platform: 'INSTAGRAM' as Platform,
      icon: '📦',
      sortOrder: 1,
    },
    {
      name: { uz: '📦 YouTube paketlar', ru: '📦 Ютуб пакеты', en: '📦 YouTube Packages' },
      slug: 'yt-packages',
      platform: 'YOUTUBE' as Platform,
      icon: '📦',
      sortOrder: 1,
    },
    {
      name: { uz: '📦 TikTok paketlar', ru: '📦 ТикТок пакеты', en: '📦 TikTok Packages' },
      slug: 'tt-packages',
      platform: 'TIKTOK' as Platform,
      icon: '📦',
      sortOrder: 1,
    },
  ];

  for (const cat of packageCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
  }
  console.log(`${packageCategories.length} ta paket kategoriyasi yaratildi\n`);

  const provider = await prisma.provider.findFirst({ where: { name: 'Peakerr' } });
  if (!provider) { console.log('Provider not found!'); return; }

  // === TELEGRAM PAKETLAR ===
  const tgPackages = [
    {
      name: { uz: '🚀 Kanal Starter', ru: '🚀 Стартер канала', en: '🚀 Channel Starter' },
      desc: {
        uz: '📦 <b>Kanal boshlash uchun ideal paket!</b>\n\n' +
          '✅ 1,000 ta obunachi (HQ, 365 kun refill)\n' +
          '✅ 5,000 ta post ko\'rish\n' +
          '✅ 500 ta reaktsiya (random)\n\n' +
          '💰 Alohida olsangiz: 25,000 so\'m\n' +
          '🔥 <b>Paket narxi: 19,900 so\'m (20% tejash!)</b>',
        ru: '📦 <b>Идеальный пакет для старта!</b>\n\n' +
          '✅ 1,000 подписчиков (HQ, 365 дней рефилл)\n' +
          '✅ 5,000 просмотров\n' +
          '✅ 500 реакций\n\n' +
          '🔥 <b>Цена: 19,900 сум (скидка 20%!)</b>',
        en: '📦 <b>Perfect starter package!</b>\n\n' +
          '✅ 1,000 subscribers (HQ, 365 days refill)\n' +
          '✅ 5,000 post views\n' +
          '✅ 500 reactions\n\n' +
          '🔥 <b>Price: 19,900 UZS (20% off!)</b>',
      },
      price: 19900,
      min: 1, max: 1,
      sort: 1,
      peakerrId: '28495', // Will create multi-order
    },
    {
      name: { uz: '💎 Kanal Pro', ru: '💎 Канал Про', en: '💎 Channel Pro' },
      desc: {
        uz: '📦 <b>Professional kanal uchun!</b>\n\n' +
          '✅ 5,000 ta obunachi (HQ, 365 kun refill)\n' +
          '✅ 20,000 ta post ko\'rish\n' +
          '✅ 3,000 ta reaktsiya (random)\n' +
          '✅ 1,000 ta Premium ko\'rish\n\n' +
          '💰 Alohida olsangiz: 110,000 so\'m\n' +
          '🔥 <b>Paket narxi: 79,900 so\'m (27% tejash!)</b>',
        ru: '📦 <b>Для профессионального канала!</b>\n\n' +
          '✅ 5,000 подписчиков (HQ, 365 дней)\n' +
          '✅ 20,000 просмотров\n' +
          '✅ 3,000 реакций\n' +
          '✅ 1,000 премиум просмотров\n\n' +
          '🔥 <b>Цена: 79,900 сум (скидка 27%!)</b>',
        en: '📦 <b>For professional channels!</b>\n\n' +
          '✅ 5,000 subscribers (HQ, 365 days)\n' +
          '✅ 20,000 views\n' +
          '✅ 3,000 reactions\n' +
          '✅ 1,000 premium views\n\n' +
          '🔥 <b>Price: 79,900 UZS (27% off!)</b>',
      },
      price: 79900,
      min: 1, max: 1,
      sort: 2,
      peakerrId: '28495',
    },
    {
      name: { uz: '🌍 Globalga chiqarish', ru: '🌍 Вывод в глобальный', en: '🌍 Global Ranking' },
      desc: {
        uz: '📦 <b>Kanalni globalga chiqarish!</b>\n\n' +
          '✅ 10,000 ta Premium obunachi (30 kun)\n' +
          '✅ 50,000 ta Premium ko\'rish\n' +
          '✅ 10,000 ta reaktsiya\n' +
          '✅ 5,000 ta Premium Shares\n' +
          '✅ 1 ta Kanal Boost (1 kun)\n\n' +
          '💰 Alohida olsangiz: 1,500,000 so\'m\n' +
          '🔥 <b>Paket narxi: 999,000 so\'m (33% tejash!)</b>\n\n' +
          '⭐ <i>Kafolatli globalga chiqish!</i>',
        ru: '📦 <b>Вывод канала в глобальный!</b>\n\n' +
          '✅ 10,000 премиум подписчиков (30 дней)\n' +
          '✅ 50,000 премиум просмотров\n' +
          '✅ 10,000 реакций\n' +
          '✅ 5,000 премиум репостов\n' +
          '✅ 1 буст канала (1 день)\n\n' +
          '🔥 <b>Цена: 999,000 сум (скидка 33%!)</b>',
        en: '📦 <b>Get your channel to global!</b>\n\n' +
          '✅ 10,000 premium subscribers (30 days)\n' +
          '✅ 50,000 premium views\n' +
          '✅ 10,000 reactions\n' +
          '✅ 5,000 premium shares\n' +
          '✅ 1 channel boost (1 day)\n\n' +
          '🔥 <b>Price: 999,000 UZS (33% off!)</b>',
      },
      price: 999000,
      min: 1, max: 1,
      sort: 3,
      peakerrId: '28512',
    },
    {
      name: { uz: '👑 VIP Kanal', ru: '👑 VIP Канал', en: '👑 VIP Channel' },
      desc: {
        uz: '📦 <b>Eng kuchli paket!</b>\n\n' +
          '✅ 25,000 ta Premium obunachi (90 kun)\n' +
          '✅ 100,000 ta Premium ko\'rish\n' +
          '✅ 25,000 ta reaktsiya\n' +
          '✅ 10,000 ta Premium Shares\n' +
          '✅ 5,000 ta Real obunachi (qidiruvdan)\n' +
          '✅ Kanal Boost (7 kun)\n\n' +
          '💰 Alohida olsangiz: 5,000,000+ so\'m\n' +
          '🔥 <b>Paket narxi: 2,990,000 so\'m (40% tejash!)</b>\n\n' +
          '👑 <i>Premium sifat, kafolatli natija!</i>',
        ru: '📦 <b>Самый мощный пакет!</b>\n\n' +
          '✅ 25,000 премиум подписчиков (90 дней)\n' +
          '✅ 100,000 премиум просмотров\n' +
          '✅ 25,000 реакций\n' +
          '✅ 10,000 репостов\n' +
          '✅ 5,000 реальных подписчиков\n' +
          '✅ Буст канала (7 дней)\n\n' +
          '🔥 <b>Цена: 2,990,000 сум (скидка 40%!)</b>',
        en: '📦 <b>Most powerful package!</b>\n\n' +
          '✅ 25,000 premium subscribers (90 days)\n' +
          '✅ 100,000 premium views\n' +
          '✅ 25,000 reactions\n' +
          '✅ 10,000 shares\n' +
          '✅ 5,000 real subscribers\n' +
          '✅ Channel boost (7 days)\n\n' +
          '🔥 <b>Price: 2,990,000 UZS (40% off!)</b>',
      },
      price: 2990000,
      min: 1, max: 1,
      sort: 4,
      peakerrId: '28514',
    },
  ];

  // === INSTAGRAM PAKETLAR ===
  const igPackages = [
    {
      name: { uz: '🚀 IG Starter', ru: '🚀 IG Стартер', en: '🚀 IG Starter' },
      desc: {
        uz: '📦 <b>Instagram boshlash paketi!</b>\n\n' +
          '✅ 1,000 ta follower (HQ)\n' +
          '✅ 2,000 ta like (oxirgi 5 postga)\n' +
          '✅ 1,000 ta Reel ko\'rish\n\n' +
          '💰 Alohida: 35,000 so\'m\n' +
          '🔥 <b>Paket: 24,900 so\'m (29% tejash!)</b>',
        ru: '📦 <b>Стартовый пакет Instagram!</b>\n\n✅ 1,000 подписчиков\n✅ 2,000 лайков\n✅ 1,000 просмотров Reels\n\n🔥 <b>24,900 сум</b>',
        en: '📦 <b>Instagram starter!</b>\n\n✅ 1,000 followers\n✅ 2,000 likes\n✅ 1,000 reel views\n\n🔥 <b>24,900 UZS</b>',
      },
      price: 24900,
      min: 1, max: 1, sort: 1,
      peakerrId: '28127',
    },
    {
      name: { uz: '💎 IG Pro', ru: '💎 IG Про', en: '💎 IG Pro' },
      desc: {
        uz: '📦 <b>Instagram Professional!</b>\n\n' +
          '✅ 5,000 ta follower (Real HQ)\n' +
          '✅ 10,000 ta like\n' +
          '✅ 5,000 ta Reel ko\'rish\n' +
          '✅ 1,000 ta saqlash\n' +
          '✅ 500 ta komment (emoji)\n\n' +
          '💰 Alohida: 180,000 so\'m\n' +
          '🔥 <b>Paket: 119,900 so\'m (33% tejash!)</b>',
        ru: '📦 <b>Instagram Профессиональный!</b>\n\n✅ 5,000 подписчиков\n✅ 10,000 лайков\n✅ 5,000 просмотров\n✅ 1,000 сохранений\n✅ 500 комментариев\n\n🔥 <b>119,900 сум</b>',
        en: '📦 <b>Instagram Professional!</b>\n\n✅ 5,000 followers\n✅ 10,000 likes\n✅ 5,000 views\n✅ 1,000 saves\n✅ 500 comments\n\n🔥 <b>119,900 UZS</b>',
      },
      price: 119900,
      min: 1, max: 1, sort: 2,
      peakerrId: '28364',
    },
  ];

  // === YOUTUBE PAKETLAR ===
  const ytPackages = [
    {
      name: { uz: '🚀 YT Starter', ru: '🚀 YT Стартер', en: '🚀 YT Starter' },
      desc: {
        uz: '📦 <b>YouTube boshlash paketi!</b>\n\n' +
          '✅ 500 ta subscriber\n' +
          '✅ 5,000 ta ko\'rish (HR)\n' +
          '✅ 500 ta like\n\n' +
          '💰 Alohida: 25,000 so\'m\n' +
          '🔥 <b>Paket: 17,900 so\'m (28% tejash!)</b>',
        ru: '📦 <b>YouTube стартер!</b>\n\n✅ 500 подписчиков\n✅ 5,000 просмотров\n✅ 500 лайков\n\n🔥 <b>17,900 сум</b>',
        en: '📦 <b>YouTube starter!</b>\n\n✅ 500 subscribers\n✅ 5,000 views\n✅ 500 likes\n\n🔥 <b>17,900 UZS</b>',
      },
      price: 17900,
      min: 1, max: 1, sort: 1,
      peakerrId: '23304',
    },
    {
      name: { uz: '💰 YT Monetizatsiya', ru: '💰 YT Монетизация', en: '💰 YT Monetization' },
      desc: {
        uz: '📦 <b>Monetizatsiya uchun!</b>\n\n' +
          '✅ 1,000 ta subscriber (shart: 1K)\n' +
          '✅ 4,000 soat tomosha vaqti (shart: 4K soat)\n' +
          '✅ 10,000 ta ko\'rish\n\n' +
          '💰 Alohida: 3,500,000 so\'m\n' +
          '🔥 <b>Paket: 2,490,000 so\'m (29% tejash!)</b>\n\n' +
          '⭐ <i>AdSense ochish uchun barcha shartlar!</i>',
        ru: '📦 <b>Для монетизации!</b>\n\n✅ 1,000 подписчиков\n✅ 4,000 часов просмотра\n✅ 10,000 просмотров\n\n🔥 <b>2,490,000 сум</b>',
        en: '📦 <b>For monetization!</b>\n\n✅ 1,000 subscribers\n✅ 4,000 watch hours\n✅ 10,000 views\n\n🔥 <b>2,490,000 UZS</b>',
      },
      price: 2490000,
      min: 1, max: 1, sort: 2,
      peakerrId: '21882',
    },
  ];

  // === TIKTOK PAKETLAR ===
  const ttPackages = [
    {
      name: { uz: '🚀 TT Starter', ru: '🚀 TT Стартер', en: '🚀 TT Starter' },
      desc: {
        uz: '📦 <b>TikTok boshlash paketi!</b>\n\n' +
          '✅ 1,000 ta follower\n' +
          '✅ 10,000 ta ko\'rish\n' +
          '✅ 2,000 ta like\n' +
          '✅ 500 ta saqlash\n\n' +
          '💰 Alohida: 30,000 so\'m\n' +
          '🔥 <b>Paket: 19,900 so\'m (34% tejash!)</b>',
        ru: '📦 <b>TikTok стартер!</b>\n\n✅ 1,000 подписчиков\n✅ 10,000 просмотров\n✅ 2,000 лайков\n✅ 500 сохранений\n\n🔥 <b>19,900 сум</b>',
        en: '📦 <b>TikTok starter!</b>\n\n✅ 1,000 followers\n✅ 10,000 views\n✅ 2,000 likes\n✅ 500 saves\n\n🔥 <b>19,900 UZS</b>',
      },
      price: 19900,
      min: 1, max: 1, sort: 1,
      peakerrId: '29841',
    },
    {
      name: { uz: '🔥 TT Viral', ru: '🔥 TT Вирал', en: '🔥 TT Viral' },
      desc: {
        uz: '📦 <b>TikTok viral paket!</b>\n\n' +
          '✅ 5,000 ta follower (HQ)\n' +
          '✅ 100,000 ta ko\'rish\n' +
          '✅ 10,000 ta like\n' +
          '✅ 2,000 ta saqlash\n' +
          '✅ 1,000 ta ulashish\n\n' +
          '💰 Alohida: 100,000 so\'m\n' +
          '🔥 <b>Paket: 69,900 so\'m (30% tejash!)</b>',
        ru: '📦 <b>TikTok вирусный!</b>\n\n✅ 5,000 подписчиков\n✅ 100,000 просмотров\n✅ 10,000 лайков\n✅ 2,000 сохранений\n✅ 1,000 репостов\n\n🔥 <b>69,900 сум</b>',
        en: '📦 <b>TikTok viral!</b>\n\n✅ 5,000 followers\n✅ 100,000 views\n✅ 10,000 likes\n✅ 2,000 saves\n✅ 1,000 shares\n\n🔥 <b>69,900 UZS</b>',
      },
      price: 69900,
      min: 1, max: 1, sort: 2,
      peakerrId: '28203',
    },
  ];

  const allPackages = [
    { catSlug: 'tg-packages', items: tgPackages },
    { catSlug: 'ig-packages', items: igPackages },
    { catSlug: 'yt-packages', items: ytPackages },
    { catSlug: 'tt-packages', items: ttPackages },
  ];

  let added = 0;

  for (const { catSlug, items } of allPackages) {
    const cat = await prisma.category.findUnique({ where: { slug: catSlug } });
    if (!cat) continue;

    for (const pkg of items) {
      const existing = await prisma.service.findFirst({
        where: { categoryId: cat.id, name: { path: ['uz'], equals: pkg.name.uz } },
      });
      if (existing) { console.log(`  ⏭ ${pkg.name.uz} — bor`); continue; }

      const provSvc = await prisma.providerService.findFirst({
        where: { providerId: provider.id, externalServiceId: pkg.peakerrId },
      });

      const service = await prisma.service.create({
        data: {
          categoryId: cat.id,
          name: pkg.name,
          description: pkg.desc,
          minQuantity: pkg.min,
          maxQuantity: pkg.max,
          pricePerUnit: new Prisma.Decimal(pkg.price),
          sortOrder: pkg.sort,
          isActive: true,
        },
      });

      if (provSvc) {
        await prisma.serviceProviderMapping.create({
          data: {
            serviceId: service.id,
            providerServiceId: provSvc.id,
            providerId: provider.id,
            priority: 10,
            isActive: true,
          },
        });
      }

      console.log(`  ✅ ${catSlug.padEnd(15)} | ${pkg.name.uz.padEnd(25)} | ${pkg.price.toLocaleString()} so'm`);
      added++;
    }
  }

  const total = await prisma.service.count({ where: { isActive: true } });
  console.log(`\n🎉 ${added} ta paket qo'shildi!`);
  console.log(`📊 Jami aktiv xizmatlar: ${total}`);
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); });
