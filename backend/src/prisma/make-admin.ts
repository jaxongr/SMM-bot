import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Abdullabuvo ni ADMIN qilish
  const result = await prisma.user.updateMany({
    where: { username: 'Abdullabuvo' },
    data: { role: 'ADMIN' },
  });
  console.log(`Abdullabuvo -> ADMIN: ${result.count} updated`);

  // 2. Karta raqam sozlamasini yaratish
  await prisma.setting.upsert({
    where: { key: 'payment_card_number' },
    update: { value: '8600 0000 0000 0000' },
    create: {
      key: 'payment_card_number',
      value: '8600 0000 0000 0000',
      description: 'To\'lov uchun karta raqam (Uzcard/Humo)',
      group: 'payment',
    },
  });

  await prisma.setting.upsert({
    where: { key: 'payment_card_holder' },
    update: { value: 'SMM Bot Admin' },
    create: {
      key: 'payment_card_holder',
      value: 'SMM Bot Admin',
      description: 'Karta egasining ismi',
      group: 'payment',
    },
  });

  console.log('Payment card settings created');
  console.log('Admin panelda Sozlamalar -> To\'lovlar sahifasidan karta raqamni o\'zgartiring');
}

main().catch(console.error).finally(() => prisma.$disconnect());
