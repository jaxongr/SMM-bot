import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const logger = new Logger('PackageOrders');

// Har bir paket ichidagi xizmatlar ro'yxati
// catSlug + service name → provider service ID va miqdor
const PACKAGE_CONTENTS: Record<string, Array<{ peakerrId: string; quantity: number; label: string }>> = {
  '🚀 Kanal Starter': [
    { peakerrId: '28495', quantity: 1000, label: '1000 obunachi (HQ)' },
    { peakerrId: '15982', quantity: 5000, label: '5000 ko\'rish' },
    { peakerrId: '28611', quantity: 500, label: '500 reaktsiya' },
  ],
  '💎 Kanal Pro': [
    { peakerrId: '28495', quantity: 5000, label: '5000 obunachi (HQ)' },
    { peakerrId: '15982', quantity: 20000, label: '20000 ko\'rish' },
    { peakerrId: '28611', quantity: 3000, label: '3000 reaktsiya' },
    { peakerrId: '28561', quantity: 1000, label: '1000 Premium ko\'rish' },
  ],
  '🌍 Globalga chiqarish': [
    { peakerrId: '28512', quantity: 10000, label: '10000 Premium obunachi (30 kun)' },
    { peakerrId: '28561', quantity: 50000, label: '50000 Premium ko\'rish' },
    { peakerrId: '28611', quantity: 10000, label: '10000 reaktsiya' },
    { peakerrId: '28565', quantity: 5000, label: '5000 Premium Shares' },
  ],
  '👑 VIP Kanal': [
    { peakerrId: '28514', quantity: 25000, label: '25000 Premium obunachi (90 kun)' },
    { peakerrId: '28561', quantity: 100000, label: '100000 Premium ko\'rish' },
    { peakerrId: '28611', quantity: 25000, label: '25000 reaktsiya' },
    { peakerrId: '28565', quantity: 10000, label: '10000 Premium Shares' },
    { peakerrId: '28554', quantity: 5000, label: '5000 Real obunachi' },
  ],
  '🚀 IG Starter': [
    { peakerrId: '28127', quantity: 1000, label: '1000 follower' },
    { peakerrId: '30295', quantity: 2000, label: '2000 like' },
    { peakerrId: '9598', quantity: 1000, label: '1000 Reel ko\'rish' },
  ],
  '💎 IG Pro': [
    { peakerrId: '28364', quantity: 5000, label: '5000 follower (HQ)' },
    { peakerrId: '28425', quantity: 10000, label: '10000 like (HQ)' },
    { peakerrId: '9598', quantity: 5000, label: '5000 Reel ko\'rish' },
    { peakerrId: '11055', quantity: 1000, label: '1000 saqlash' },
    { peakerrId: '29488', quantity: 500, label: '500 komment' },
  ],
  '🚀 YT Starter': [
    { peakerrId: '23304', quantity: 500, label: '500 subscriber' },
    { peakerrId: '28711', quantity: 5000, label: '5000 ko\'rish' },
    { peakerrId: '28718', quantity: 500, label: '500 like' },
  ],
  '💰 YT Monetizatsiya': [
    { peakerrId: '23304', quantity: 1000, label: '1000 subscriber' },
    { peakerrId: '21882', quantity: 4000, label: '4000 soat tomosha' },
    { peakerrId: '28711', quantity: 10000, label: '10000 ko\'rish' },
  ],
  '🚀 TT Starter': [
    { peakerrId: '29841', quantity: 1000, label: '1000 follower' },
    { peakerrId: '25127', quantity: 10000, label: '10000 ko\'rish' },
    { peakerrId: '28166', quantity: 2000, label: '2000 like' },
    { peakerrId: '24523', quantity: 500, label: '500 saqlash' },
  ],
  '🔥 TT Viral': [
    { peakerrId: '28203', quantity: 5000, label: '5000 follower (HQ)' },
    { peakerrId: '25127', quantity: 100000, label: '100000 ko\'rish' },
    { peakerrId: '15366', quantity: 10000, label: '10000 like (HQ)' },
    { peakerrId: '24523', quantity: 2000, label: '2000 saqlash' },
    { peakerrId: '29453', quantity: 1000, label: '1000 ulashish' },
  ],
};

export function getPackageContents(serviceName: string): Array<{ peakerrId: string; quantity: number; label: string }> | null {
  return PACKAGE_CONTENTS[serviceName] || null;
}

export async function sendPackageToProvider(
  prisma: PrismaClient,
  orderId: string,
  link: string,
  serviceName: string,
): Promise<{ success: boolean; results: string[] }> {
  const contents = PACKAGE_CONTENTS[serviceName];
  if (!contents) return { success: false, results: ['Paket topilmadi'] };

  const provider = await prisma.provider.findFirst({ where: { name: 'Peakerr', isActive: true } });
  if (!provider) return { success: false, results: ['Provayeder topilmadi'] };

  const results: string[] = [];
  let allSuccess = true;
  const providerOrderIds: string[] = [];

  for (const item of contents) {
    try {
      const params = new URLSearchParams({
        key: provider.apiKey,
        action: 'add',
        service: item.peakerrId,
        link,
        quantity: item.quantity.toString(),
      });

      const resp = await fetch(provider.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const apiResult = await resp.json() as Record<string, unknown>;

      if (apiResult.order) {
        providerOrderIds.push(String(apiResult.order));
        results.push(`✅ ${item.label} — yuborildi (#${apiResult.order})`);
        logger.log(`Package item sent: ${item.label} → #${apiResult.order}`);
      } else {
        results.push(`❌ ${item.label} — xato: ${JSON.stringify(apiResult)}`);
        allSuccess = false;
        logger.error(`Package item failed: ${item.label} — ${JSON.stringify(apiResult)}`);
      }
    } catch (error) {
      results.push(`❌ ${item.label} — xato`);
      allSuccess = false;
    }
  }

  // Buyurtmani yangilash
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: allSuccess ? 'PROCESSING' : 'PARTIAL',
      providerId: provider.id,
      providerOrderId: providerOrderIds.join(','),
      providerResponse: { items: results, orderIds: providerOrderIds },
    },
  });

  return { success: allSuccess, results };
}
