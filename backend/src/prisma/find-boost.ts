const API_URL = 'https://peakerr.com/api/v2';
const API_KEY = 'c7e71376ea65956e31f386da479fa163';

async function main() {
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `key=${API_KEY}&action=services`,
  });
  const services = await resp.json() as Array<Record<string, string>>;

  const boost = services.filter((s) => {
    const name = s.name.toLowerCase();
    const cat = s.category.toLowerCase();
    return (name.includes('boost') || cat.includes('boost') || name.includes('vote') || name.includes('ovoz'));
  });

  console.log(`=== TELEGRAM BOOST/OVOZ XIZMATLARI (${boost.length} ta) ===\n`);

  boost.sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));

  for (const s of boost) {
    const rateUsd = parseFloat(s.rate);
    const rateSom = (rateUsd * 12800).toFixed(0);
    console.log(`  ID: ${s.service} | $${s.rate}/dona | ${rateSom} so'm | Min:${s.min} Max:${s.max}`);
    console.log(`  ${s.name}`);
    console.log(`  ${s.category}`);
    console.log();
  }
}

main().catch(console.error);
