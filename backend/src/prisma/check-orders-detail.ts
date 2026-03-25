import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      service: { include: { category: true } },
      provider: true,
    },
  });

  for (const o of orders) {
    const serviceName = (o.service.name as Record<string, string>).uz;
    const categoryName = (o.service.category.name as Record<string, string>).uz;

    // Find mapping
    const mapping = await prisma.serviceProviderMapping.findFirst({
      where: { serviceId: o.serviceId },
      include: { providerService: true },
    });

    console.log(`Order: ${o.id.slice(-8)} | ${o.status}`);
    console.log(`  Xizmat: ${serviceName} (${categoryName})`);
    console.log(`  Link: ${o.link} | Qty: ${o.quantity}`);
    console.log(`  Peakerr OrderID: ${o.providerOrderId || 'NONE'}`);
    console.log(`  Peakerr Service: ${mapping?.providerService.externalServiceId || 'NONE'} — ${mapping?.providerService.name?.slice(0, 60) || 'NONE'}`);
    console.log(`  Peakerr Rate: $${mapping ? Number(mapping.providerService.pricePerUnit) : 0}/1K`);
    console.log();
  }
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); });
