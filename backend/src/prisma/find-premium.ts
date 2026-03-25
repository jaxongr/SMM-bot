const API_URL = 'https://peakerr.com/api/v2';
const API_KEY = 'c7e71376ea65956e31f386da479fa163';

async function main() {
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `key=${API_KEY}&action=services`,
  });
  const services = await resp.json() as Array<Record<string, string>>;

  // Search for Premium Telegram members
  const premium = services.filter((s) =>
    s.name.toLowerCase().includes('premium') &&
    (s.category.toLowerCase().includes('telegram') || s.name.toLowerCase().includes('telegram'))
  );

  console.log(`=== TELEGRAM PREMIUM XIZMATLARI (${premium.length} ta) ===\n`);

  premium.sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));

  for (const s of premium) {
    console.log(`  ID: ${s.service} | $${s.rate}/1K | Min:${s.min} Max:${s.max}`);
    console.log(`  ${s.name}`);
    console.log(`  Kategoriya: ${s.category}`);
    console.log();
  }
}

main().catch(console.error);
