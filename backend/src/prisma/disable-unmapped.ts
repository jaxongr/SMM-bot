import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany({
    include: { providerMappings: true, category: true },
  });

  let disabled = 0;

  for (const svc of services) {
    if (svc.providerMappings.length === 0 && svc.isActive) {
      await prisma.service.update({
        where: { id: svc.id },
        data: { isActive: false },
      });
      const name = (svc.name as Record<string, string>).uz;
      console.log(`  ❌ O'chirildi: ${svc.category.slug} | ${name}`);
      disabled++;
    }
  }

  console.log(`\n${disabled} ta xizmat o'chirildi (mapping yo'q edi)`);
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); });
