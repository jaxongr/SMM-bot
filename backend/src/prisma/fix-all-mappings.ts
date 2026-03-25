import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const UZS_RATE = 12800;
const MARKUP = 2.5;

// Har bir kategoriya + xizmat nomi uchun Peakerr service ID
const MAPPINGS: Record<string, Record<string, string>> = {
  'tg-subscribers': {
    '🤖 Bot obunachilar': '28540',
    '👤 Arzon obunachilar': '28540',
    '👥 O\'rta sifat': '28495',
    '⭐ Yuqori sifat (HQ)': '27942',
    '💎 Premium obunachilar': '28506',
    '🇺🇿 O\'zbek obunachilar': '28495',
    '🇷🇺 Rus obunachilar': '28526',
    '🌍 Xalqaro obunachilar': '28540',
    '🔄 Refill kafolatli': '28495',
  },
  'tg-post-views': {
    '⚡ Tez ko\'rishlar': '15982',
    '⭐ Sifatli ko\'rishlar': '28665',
    '📋 Oxirgi 5 post ko\'rishlar': '28479',
  },
  'tg-reactions': {
    '👍 Like reaktsiya': '28594',
    '🔥 Fire reaktsiya': '28595',
    '❤️ Heart reaktsiya': '28596',
    '🎲 Random reaktsiyalar': '28611',
  },
  'tg-poll-votes': {
    '📊 So\'rovnoma ovozlari': '13291',
  },
  'ig-followers': {
    '👤 Arzon followerlar': '28127',
    '👥 O\'rta sifat': '28127',
    '⭐ Yuqori sifat (HQ)': '28364',
    '💎 Real followerlar': '28364',
  },
  'ig-likes': {
    '❤️ Arzon layklar': '30295',
    '⭐ Sifatli layklar': '28425',
  },
  'ig-comments': {
    '😍 Emoji kommentlar': '29488',
    '✍️ Maxsus kommentlar': '26738',
  },
  'ig-reel-views': {
    '🎬 Reel ko\'rishlar': '9598',
  },
  'ig-story-views': {
    '📱 Story ko\'rishlar': '29242',
  },
  'ig-saves': {
    '🔖 Saqlashlar': '11055',
  },
  'ig-shares': {
    '🔄 Ulashishlar': '24433',
  },
  'ig-impressions': {
    '📊 Impressions + Reach': '17629',
  },
  'ig-auto-likes': {
    '🔄 Avto layklar (30 kun)': '29184',
  },
  'ig-live-viewers': {
    '🔴 Jonli efir tomosha': '29303',
  },
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
  'yt-watch-hours': {
    '⏱ 1000 soat': '21882',
  },
  'yt-shorts': {
    '📱 Shorts ko\'rishlar': '13227',
    '❤️ Shorts layklar': '28718',
  },
  'yt-live': {
    '🔴 Live tomosha': '27675',
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
  'tt-views': {
    '👁 Ko\'rishlar': '25127',
  },
  'tt-comments': {
    '💬 Random': '27980',
  },
  'tt-shares': {
    '🔄 Ulashishlar': '29453',
  },
  'tt-saves': {
    '🔖 Saqlashlar': '24523',
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
};

async function main() {
  console.log('=== TO\'LIQ MAPPING TUZATISH ===\n');

  const provider = await prisma.provider.findFirst({ where: { name: 'Peakerr' } });
  if (!provider) { console.log('Provider not found!'); return; }

  await prisma.serviceProviderMapping.deleteMany({});
  console.log('Eski mappinglar o\'chirildi\n');

  const services = await prisma.service.findMany({ include: { category: true } });

  let mapped = 0;
  let unmapped = 0;

  for (const svc of services) {
    const name = (svc.name as Record<string, string>).uz;
    const catSlug = svc.category.slug;
    const peakerrId = MAPPINGS[catSlug]?.[name];

    if (!peakerrId) {
      console.log(`  ❌ ${catSlug.padEnd(15)} | ${name} — mapping yo'q`);
      unmapped++;
      continue;
    }

    const providerSvc = await prisma.providerService.findFirst({
      where: { providerId: provider.id, externalServiceId: peakerrId },
    });

    if (!providerSvc) {
      console.log(`  ⚠️ ${catSlug.padEnd(15)} | ${name} — Peakerr #${peakerrId} topilmadi`);
      unmapped++;
      continue;
    }

    await prisma.serviceProviderMapping.create({
      data: {
        serviceId: svc.id,
        providerServiceId: providerSvc.id,
        providerId: provider.id,
        priority: 10,
        isActive: true,
      },
    });

    const price = Number(providerSvc.pricePerUnit);
    const sell = (price * UZS_RATE * MARKUP) / 1000;
    await prisma.service.update({
      where: { id: svc.id },
      data: { pricePerUnit: new Prisma.Decimal(sell) },
    });

    console.log(`  ✅ ${catSlug.padEnd(15)} | ${name.padEnd(35)} → #${peakerrId} ($${price}/1K) → ${(sell * 1000).toFixed(0)} so'm/1K`);
    mapped++;
  }

  console.log(`\n=== NATIJA: ${mapped} mapped, ${unmapped} unmapped, ${services.length} jami ===`);
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); });
