const API_URL = 'https://peakerr.com/api/v2';
const API_KEY = 'c7e71376ea65956e31f386da479fa163';

async function main() {
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `key=${API_KEY}&action=services`,
  });
  const services = await resp.json() as Array<Record<string, string>>;

  // Search, Targeted, Real Active, Organic
  const keywords = ['search', 'target', 'organic', 'real active', 'invite', 'join', 'keyword', 'niche', 'ranking', 'seo'];

  const found = services.filter((s) => {
    const name = s.name.toLowerCase();
    const cat = s.category.toLowerCase();
    return (cat.includes('telegram') || name.includes('telegram')) &&
           keywords.some(k => name.includes(k) || cat.includes(k));
  });

  console.log(`=== TELEGRAM TARGETED/SEARCH XIZMATLARI (${found.length} ta) ===\n`);

  found.sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));

  for (const s of found.slice(0, 30)) {
    console.log(`  ID: ${s.service} | $${s.rate}/1K | Min:${s.min} Max:${s.max}`);
    console.log(`  ${s.name}`);
    console.log(`  Kategoriya: ${s.category}`);
    console.log();
  }

  // Also search for boost, ranking
  const boost = services.filter((s) => {
    const name = s.name.toLowerCase();
    const cat = s.category.toLowerCase();
    return (cat.includes('telegram') || name.includes('telegram')) &&
           (name.includes('boost') || cat.includes('boost') || name.includes('ranking') || cat.includes('ranking'));
  });

  console.log(`\n=== TELEGRAM BOOST/RANKING (${boost.length} ta) ===\n`);
  boost.sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));
  for (const s of boost.slice(0, 15)) {
    console.log(`  ID: ${s.service} | $${s.rate}/1K | Min:${s.min} Max:${s.max}`);
    console.log(`  ${s.name}`);
    console.log();
  }

  // Real users who join from search
  const real = services.filter((s) => {
    const name = s.name.toLowerCase();
    const cat = s.category.toLowerCase();
    return (cat.includes('telegram') || name.includes('telegram')) &&
           (cat.includes('real active') || cat.includes('[real') || name.includes('real active') || name.includes('activity'));
  });

  console.log(`\n=== TELEGRAM REAL ACTIVE USERS (${real.length} ta) ===\n`);
  real.sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));
  for (const s of real.slice(0, 15)) {
    console.log(`  ID: ${s.service} | $${s.rate}/1K | Min:${s.min} Max:${s.max}`);
    console.log(`  ${s.name}`);
    console.log();
  }
}

main().catch(console.error);
