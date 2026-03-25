import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function processOrders() {
  const orders = await prisma.order.findMany({
    where: { status: 'PENDING', providerId: null },
    include: {
      service: {
        include: {
          providerMappings: {
            include: { providerService: true, provider: true },
            where: { isActive: true },
            orderBy: { priority: 'desc' },
          },
        },
      },
    },
  });

  console.log(`Found ${orders.length} pending orders`);

  for (const order of orders) {
    const mapping = order.service.providerMappings[0];
    if (!mapping) {
      console.log(`  Order ${order.id.slice(-8)}: No provider mapping!`);
      continue;
    }

    console.log(`  Processing: ${order.id.slice(-8)} | Link: ${order.link} | Qty: ${order.quantity}`);
    console.log(`  Provider: ${mapping.provider.name} | ExtService: ${mapping.providerService.externalServiceId}`);

    try {
      const params = new URLSearchParams({
        key: mapping.provider.apiKey,
        action: 'add',
        service: mapping.providerService.externalServiceId,
        link: order.link,
        quantity: order.quantity.toString(),
      });

      const resp = await fetch(mapping.provider.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const result = await resp.json() as Record<string, unknown>;
      console.log(`  Peakerr response: ${JSON.stringify(result)}`);

      if (result.order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'PROCESSING',
            providerId: mapping.provider.id,
            providerOrderId: String(result.order),
          },
        });
        console.log(`  ✅ Sent! ProviderOrderId: ${result.order}`);
      } else {
        console.log(`  ❌ Error: ${JSON.stringify(result)}`);
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'FAILED', errorMessage: JSON.stringify(result) },
        });
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error}`);
    }
  }

  // Check status of PROCESSING orders
  const activeOrders = await prisma.order.findMany({
    where: { status: { in: ['PROCESSING', 'IN_PROGRESS'] }, providerOrderId: { not: null } },
    include: { provider: true },
  });

  console.log(`\nChecking ${activeOrders.length} active orders...`);

  for (const order of activeOrders) {
    if (!order.provider || !order.providerOrderId) continue;

    try {
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
            status: newStatus as 'PROCESSING' | 'IN_PROGRESS' | 'COMPLETED' | 'PARTIAL' | 'CANCELED',
            startCount: result.start_count ? parseInt(String(result.start_count)) : undefined,
            remains: result.remains ? parseInt(String(result.remains)) : undefined,
            completedAt: newStatus === 'COMPLETED' ? new Date() : undefined,
          },
        });
        console.log(`  ✅ Status updated: ${order.status} → ${newStatus}`);
      }
    } catch (error) {
      console.log(`  ❌ Status check error: ${error}`);
    }
  }
}

processOrders().then(() => {
  console.log('\nDone!');
  prisma.$disconnect();
}).catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
