import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { provider: true },
  });

  console.log(`Total orders: ${orders.length}\n`);

  for (const o of orders) {
    console.log(`Order: ${o.id.slice(-8)}`);
    console.log(`  Status: ${o.status}`);
    console.log(`  Link: ${o.link}`);
    console.log(`  Qty: ${o.quantity}`);
    console.log(`  Provider: ${o.provider?.name || 'NONE'}`);
    console.log(`  ProviderOrderId: ${o.providerOrderId || 'NONE'}`);
    console.log(`  Created: ${o.createdAt}`);
    console.log();
  }

  // Fix: update status for orders with providerOrderId
  const ordersToCheck = await prisma.order.findMany({
    where: { providerOrderId: { not: null }, status: { not: 'COMPLETED' } },
    include: { provider: true },
  });

  console.log(`\nOrders to check status: ${ordersToCheck.length}`);

  for (const order of ordersToCheck) {
    if (!order.provider || !order.providerOrderId) continue;

    const params = new URLSearchParams({
      key: order.provider.apiKey,
      action: 'status',
      order: order.providerOrderId,
    });

    const resp = await fetch(order.provider.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const result = await resp.json() as Record<string, unknown>;
    console.log(`  Order ${order.id.slice(-8)}: ${JSON.stringify(result)}`);

    const statusMap: Record<string, string> = {
      'Pending': 'PROCESSING',
      'In progress': 'IN_PROGRESS',
      'Processing': 'PROCESSING',
      'Completed': 'COMPLETED',
      'Partial': 'PARTIAL',
      'Canceled': 'CANCELED',
    };

    const newStatus = statusMap[result.status as string];
    if (newStatus && newStatus !== order.status) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: newStatus as never,
          startCount: result.start_count ? parseInt(String(result.start_count)) : undefined,
          remains: result.remains ? parseInt(String(result.remains)) : undefined,
          completedAt: newStatus === 'COMPLETED' ? new Date() : undefined,
        },
      });
      console.log(`  ✅ Updated: ${order.status} → ${newStatus}`);
    }
  }
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); });
