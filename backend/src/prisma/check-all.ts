import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany({
    include: {
      category: true,
      providerMappings: { include: { providerService: true } },
    },
    orderBy: [
      { category: { platform: 'asc' } },
      { category: { sortOrder: 'asc' } },
      { sortOrder: 'asc' },
    ],
  });

  let currentPlatform = '';
  let ok = 0;
  let fail = 0;

  for (const s of services) {
    const platform = s.category.platform;
    const cat = (s.category.name as Record<string, string>).uz;
    const name = (s.name as Record<string, string>).uz;
    const mapping = s.providerMappings[0];

    if (platform !== currentPlatform) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`  ${platform}`);
      console.log(`${'='.repeat(60)}`);
      currentPlatform = platform;
    }

    if (mapping) {
      const ext = mapping.providerService.externalServiceId;
      const rate = Number(mapping.providerService.pricePerUnit);
      const sell = Number(s.pricePerUnit) * 1000;
      console.log(`  ✅ ${cat.padEnd(20)} | ${name.padEnd(35)} | #${ext} | $${rate.toFixed(4)}/1K | ${sell.toFixed(0)} som/1K`);
      ok++;
    } else {
      console.log(`  ❌ ${cat.padEnd(20)} | ${name.padEnd(35)} | MAPPING YO'Q — ISHLAMAYDI`);
      fail++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  NATIJA: ${ok} ✅ ishlaydi | ${fail} ❌ ishlamaydi | ${services.length} jami`);
  console.log(`${'='.repeat(60)}`);

  if (fail > 0) {
    console.log(`\n⚠️ Ishlamaydiganlarni botda "Tez kunda" deb ko'rsatish kerak yoki o'chirish kerak.`);
  }
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); });
