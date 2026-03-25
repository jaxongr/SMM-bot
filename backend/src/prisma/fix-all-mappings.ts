import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'https://peakerr.com/api/v2';
const API_KEY = 'c7e71376ea65956e31f386da479fa163';
const UZS_RATE = 12800;
const MARKUP = 2.5;

// Har bir bizning xizmat uchun ENG TO'G'RI Peakerr service ID
const MANUAL_MAPPINGS: Record<string, { peakerrId: string; description: string }> = {
  // === TELEGRAM OBUNACHILAR ===
  '🤖 Bot obunachilar': { peakerrId: '28540', description: 'Cheapest Telegram Members' },
  '👤 Arzon obunachilar': { peakerrId: '28540', description: 'Cheap Telegram Members 3 Day No Drop' },
  '👥 O\'rta sifat': { peakerrId: '28495', description: 'Telegram Members Refill 365 Days' },
  '⭐ Yuqori sifat (HQ)': { peakerrId: '27942', description: 'Telegram Members Zero Drop 365 Days Refill' },
  '💎 Premium obunachilar': { peakerrId: '28506', description: 'Telegram Premium Members HQ 3 Days Premium' },
  '🇺🇿 O\'zbek obunachilar': { peakerrId: '28495', description: 'Telegram Members Refill (no UZ-specific available)' },
  '🇷🇺 Rus obunachilar': { peakerrId: '28526', description: 'Telegram Russian Premium Members' },
  '🌍 Xalqaro obunachilar': { peakerrId: '28540', description: 'Telegram Members Worldwide' },
  '🔄 Refill kafolatli': { peakerrId: '28495', description: 'Telegram Members 365 Days Refill' },

  // === TELEGRAM KO'RISHLAR ===
  '⚡ Tez ko\'rishlar': { peakerrId: '15982', description: 'Telegram Post Views Ultra Fast' },
  '⭐ Sifatli ko\'rishlar': { peakerrId: '28665', description: 'Telegram Post Views HQ' },
  '📋 Oxirgi 5 post ko\'rishlar': { peakerrId: '28479', description: 'Telegram Premium Views Last 5 Posts' },

  // === TELEGRAM REAKTSIYALAR ===
  '👍 Like reaktsiya': { peakerrId: '28594', description: 'Telegram 👍 Reaction' },
  '🔥 Fire reaktsiya': { peakerrId: '28595', description: 'Telegram 🔥 Reaction' },
  '❤️ Heart reaktsiya': { peakerrId: '28596', description: 'Telegram ❤ Reaction' },
  '🎲 Random reaktsiyalar': { peakerrId: '28611', description: 'Telegram Random Reaction' },

  // === TELEGRAM BOSHQA ===
  '📊 So\'rovnoma ovozlari': { peakerrId: '13291', description: 'Telegram Poll Vote' },

  // === INSTAGRAM FOLLOWERS ===
  '👤 Arzon followerlar': { peakerrId: '28127', description: 'Instagram Followers Real+Bots' },
  '👥 O\'rta sifat': { peakerrId: '28127', description: 'Instagram Followers Real+Bots' },
  '⭐ Yuqori sifat (HQ)': { peakerrId: '28364', description: 'Instagram Followers Real Quality' },
  '💎 Real followerlar': { peakerrId: '28364', description: 'Instagram Followers Real Quality' },

  // === INSTAGRAM LIKES ===
  '❤️ Arzon layklar': { peakerrId: '30295', description: 'Instagram Likes Cheapest' },
  '⭐ Sifatli layklar': { peakerrId: '28425', description: 'Instagram Likes HQ Real No Drop' },

  // === INSTAGRAM BOSHQA ===
  '😍 Emoji kommentlar': { peakerrId: '29488', description: 'Instagram Custom Comments' },
  '✍️ Maxsus kommentlar': { peakerrId: '26738', description: 'Instagram Custom Comments HQ' },
  '🎬 Reel ko\'rishlar': { peakerrId: '9598', description: 'Instagram Reel Views' },
  '📱 Story ko\'rishlar': { peakerrId: '29242', description: 'Instagram Story Impression' },
  '🔖 Saqlashlar': { peakerrId: '11055', description: 'Instagram Saves' },
  '🔄 Ulashishlar': { peakerrId: '24433', description: 'Instagram Share' },
  '📊 Impressions + Reach': { peakerrId: '17629', description: 'Instagram Reach + Impressions' },
  '🔄 Avto layklar (30 kun)': { peakerrId: '29184', description: 'Instagram Auto Likes 30 Days' },
  '🔴 Jonli efir tomosha': { peakerrId: '29303', description: 'Instagram Live Viewers 60 Min' },

  // === YOUTUBE ===
  '👤 Arzon obunachilar': { peakerrId: '23304', description: 'YouTube Subscribers Cheapest' },
  // O'rta sifat YT — handled by category
  // Yuqori sifat YT — handled by category
  '⏱ 1000 soat': { peakerrId: '21882', description: 'YouTube Watch Hours' },
  '📱 Shorts ko\'rishlar': { peakerrId: '13227', description: 'YouTube Shorts Views' },
  '❤️ Shorts layklar': { peakerrId: '28718', description: 'YouTube Likes' },
  '🔴 Live tomosha': { peakerrId: '27675', description: 'YouTube Livestream Views' },

  // === TIKTOK ===
  '👁 Ko\'rishlar': { peakerrId: '25127', description: 'TikTok Views HQ' },
  '🔄 Ulashishlar': { peakerrId: '29453', description: 'TikTok Shares' },
  '🔖 Saqlashlar': { peakerrId: '24523', description: 'TikTok Saves' },
};

// Category-specific mappings (when same name exists in multiple categories)
const CATEGORY_MAPPINGS: Record<string, Record<string, string>> = {
  'yt-subscribers': {
    '👤 Arzon obunachilar': '23304',
    '👥 O\'rta sifat': '22464',
    '⭐ Yuqori sifat': '4763',
  },
  'yt-views': {
    '⚡ Tez ko\'rishlar': '28711',
    '⭐ HR ko\'rishlar': '28739',
    '🎯 Targetli ko\'rishlar': '30748',
  },
  'yt-likes': {
    '👍 Layklar': '28718',
    '👎 Dislayklar': '28718',
  },
  'yt-comments': {
    '💬 Random kommentlar': '20616',
    '✍️ Maxsus kommentlar': '2039',
  },
  'tt-followers': {
    '👤 Arzon followerlar': '29841',
    '👥 O\'rta sifat': '29841',
    '⭐ Yuqori sifat': '28203',
  },
  'tt-likes': {
    '❤️ Arzon layklar': '28166',
    '⭐ Sifatli layklar': '15366',
  },
  'tt-comments': {
    '💬 Random': '27980',
  },
  'tt-live': {
    '🔴 Live tomosha': '27791',
  },
  'fb-page-likes': {
    '👍 Sahifa layklar': '29812',
  },
  'fb-post-likes': {
    '❤️ Post layklar': '20927',
    '😍 Reaktsiyalar': '20927',
  },
  'fb-followers': {
    '👥 Followerlar': '30130',
  },
  'fb-views': {
    '👁 Video ko\'rishlar': '29386',
    '📱 Reels ko\'rishlar': '29386',
  },
  'fb-comments': {
    '💬 Kommentlar': '29611',
  },
  'fb-group': {
    '👥 Guruh a\'zolari': '29909',
  },
  'tw-followers': {
    '👥 Followerlar': '29067',
    '⭐ HQ Followerlar': '29067',
  },
  'tw-views': {
    '👁 Ko\'rishlar': '29011',
  },
  'sp-plays': {
    '🎵 Tinglanishlar': '28252',
    '🎵 Premium tinglanish': '28253',
  },
  'ig-followers': {
    '👤 Arzon followerlar': '28127',
    '👥 O\'rta sifat': '28127',
    '⭐ Yuqori sifat (HQ)': '28364',
    '💎 Real followerlar': '28364',
  },
};

async function main() {
  console.log('=== TO\'LIQ MAPPING TUZATISH ===\n');

  const provider = await prisma.provider.findFirst({ where: { name: 'Peakerr' } });
  if (!provider) { console.log('Provider not found!'); return; }

  // Barcha eski mappinglarni o'chirish
  const deleted = await prisma.serviceProviderMapping.deleteMany({});
  console.log(`Eski mappinglar o'chirildi: ${deleted.count}\n`);

  // Barcha xizmatlarni olish
  const services = await prisma.service.findMany({
    include: { category: true },
  });

  let mapped = 0;
  let unmapped = 0;

  for (const svc of services) {
    const name = (svc.name as Record<string, string>).uz;
    const catSlug = svc.category.slug;

    // 1. Avval category-specific mapping tekshir
    let peakerrId: string | undefined;

    if (CATEGORY_MAPPINGS[catSlug]?.[name]) {
      peakerrId = CATEGORY_MAPPINGS[catSlug][name];
    }

    // 2. Keyin global MANUAL_MAPPINGS tekshir (faqat category-specific topilmasa)
    if (!peakerrId && MANUAL_MAPPINGS[name]) {
      peakerrId = MANUAL_MAPPINGS[name].peakerrId;
    }

    if (!peakerrId) {
      console.log(`  ❌ ${catSlug} | ${name} — mapping topilmadi`);
      unmapped++;
      continue;
    }

    // Provider service topish
    const providerSvc = await prisma.providerService.findFirst({
      where: { providerId: provider.id, externalServiceId: peakerrId },
    });

    if (!providerSvc) {
      console.log(`  ⚠️ ${catSlug} | ${name} — Peakerr #${peakerrId} DB'da topilmadi`);
      unmapped++;
      continue;
    }

    // Mapping yaratish
    await prisma.serviceProviderMapping.create({
      data: {
        serviceId: svc.id,
        providerServiceId: providerSvc.id,
        providerId: provider.id,
        priority: 10,
        isActive: true,
      },
    });

    // Narxni yangilash
    const providerPrice = Number(providerSvc.pricePerUnit);
    const sellPrice = (providerPrice * UZS_RATE * MARKUP) / 1000;
    await prisma.service.update({
      where: { id: svc.id },
      data: { pricePerUnit: new Prisma.Decimal(sellPrice) },
    });

    console.log(`  ✅ ${catSlug.padEnd(15)} | ${name.padEnd(35)} → #${peakerrId} ($${providerPrice}/1K) → ${(sellPrice * 1000).toFixed(0)} so'm/1K`);
    mapped++;
  }

  console.log(`\n=== NATIJA ===`);
  console.log(`Mapped: ${mapped}`);
  console.log(`Unmapped: ${unmapped}`);
  console.log(`Jami: ${services.length}`);
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); });
