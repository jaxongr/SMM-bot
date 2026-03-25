import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const API_URL = 'https://peakerr.com/api/v2';
const API_KEY = 'c7e71376ea65956e31f386da479fa163';
const UZS_RATE = 12800; // 1 USD = 12800 UZS
const MARKUP = 2.5; // 2.5x markup (150% profit)

async function main() {
  console.log('📡 Fetching prices from Peakerr API...\n');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `key=${API_KEY}&action=services`,
  });
  const apiServices = await response.json() as Array<{
    service: string;
    name: string;
    rate: string;
    min: string;
    max: string;
    category: string;
  }>;

  console.log(`📦 ${apiServices.length} xizmat topildi\n`);

  // Get all our service-provider mappings
  const mappings = await prisma.serviceProviderMapping.findMany({
    include: {
      service: { include: { category: true } },
      providerService: true,
    },
  });

  console.log(`🔗 ${mappings.length} ta mapping topildi\n`);

  let updatedCount = 0;

  for (const mapping of mappings) {
    const providerSvc = mapping.providerService;

    // Find this service in API response
    const apiSvc = apiServices.find(
      (s) => String(s.service) === providerSvc.externalServiceId,
    );

    if (!apiSvc) continue;

    const providerPriceUsd = parseFloat(apiSvc.rate); // per 1000
    const pricePerUnitUzs = (providerPriceUsd * UZS_RATE * MARKUP) / 1000; // per 1 unit in UZS

    const oldPrice = Number(mapping.service.pricePerUnit);

    // Update our service price
    await prisma.service.update({
      where: { id: mapping.service.id },
      data: {
        pricePerUnit: new Prisma.Decimal(pricePerUnitUzs),
        minQuantity: parseInt(apiSvc.min) || mapping.service.minQuantity,
        maxQuantity: parseInt(apiSvc.max) || mapping.service.maxQuantity,
      },
    });

    // Update provider service price too
    await prisma.providerService.update({
      where: { id: providerSvc.id },
      data: {
        pricePerUnit: new Prisma.Decimal(providerPriceUsd),
        minQuantity: parseInt(apiSvc.min) || providerSvc.minQuantity,
        maxQuantity: parseInt(apiSvc.max) || providerSvc.maxQuantity,
      },
    });

    const platform = mapping.service.category.platform;
    const serviceName = (mapping.service.name as Record<string, string>).uz;
    console.log(
      `  ${platform.padEnd(10)} | ${serviceName.padEnd(35)} | Provider: $${providerPriceUsd.toFixed(4)}/1000 → Biz: ${pricePerUnitUzs.toFixed(1)} so'm/1dona (${(pricePerUnitUzs * 1000).toFixed(0)} so'm/1000) | eski: ${oldPrice}`,
    );
    updatedCount++;
  }

  console.log(`\n✅ ${updatedCount} ta xizmat narxi yangilandi`);
  console.log(`\n💰 Narx formulasi: Provider narx × ${UZS_RATE} UZS × ${MARKUP} markup ÷ 1000`);
  console.log(`📊 Foyda: ${((MARKUP - 1) * 100).toFixed(0)}% (${MARKUP - 1}x)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
