const PROVIDERS = [
  { name: 'Peakerr', url: 'https://peakerr.com/api/v2', key: 'c7e71376ea65956e31f386da479fa163' },
  { name: 'SMMRaja', url: 'https://smmraja.net/api/v2', key: '' },
  { name: 'CheapSMM', url: 'https://cheapsmmpanel.com/api/v2', key: '' },
  { name: 'BulkFollows', url: 'https://bulkfollows.com/api/v2', key: '' },
  { name: 'SocialPanel24', url: 'https://socialpanel24.com/api/v2', key: '' },
];

interface ServiceInfo {
  service: string;
  name: string;
  rate: string;
  min: string;
  max: string;
  category: string;
}

async function fetchServices(name: string, url: string, key: string): Promise<ServiceInfo[] | null> {
  if (!key) return null;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `key=${key}&action=services`,
      signal: AbortSignal.timeout(15000),
    });
    const data = await resp.json();
    if (Array.isArray(data)) return data;
    return null;
  } catch (e) {
    console.log(`  ${name}: ${e instanceof Error ? e.message : 'Error'}`);
    return null;
  }
}

function findCheapest(services: ServiceInfo[], keywords: string[]): { rate: number; name: string; id: string } | null {
  const matches = services.filter(s => {
    const cat = s.category.toLowerCase();
    const nm = s.name.toLowerCase();
    return keywords.some(k => cat.includes(k) || nm.includes(k));
  });

  if (matches.length === 0) return null;

  matches.sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));
  const cheapest = matches[0];
  return { rate: parseFloat(cheapest.rate), name: cheapest.name.slice(0, 50), id: cheapest.service };
}

async function main() {
  console.log('=== SMM PROVAYDERLAR NARX TAQQOSLASH ===\n');
  console.log('Faqat Peakerr API key bor, boshqalarni ro\'yxatdan o\'tib key olish kerak\n');

  // Peakerr narxlarini olish
  const peakerr = await fetchServices('Peakerr', PROVIDERS[0].url, PROVIDERS[0].key);
  if (!peakerr) { console.log('Peakerr API xato!'); return; }

  console.log(`Peakerr: ${peakerr.length} ta xizmat\n`);

  const categories = [
    { label: 'Telegram Members', keywords: ['telegram', 'member'] },
    { label: 'Telegram Premium', keywords: ['telegram premium member'] },
    { label: 'Telegram Views', keywords: ['telegram', 'view'] },
    { label: 'Telegram Reactions', keywords: ['telegram', 'reaction'] },
    { label: 'Instagram Followers', keywords: ['instagram', 'follow'] },
    { label: 'Instagram Likes', keywords: ['instagram', 'like'] },
    { label: 'Instagram Views', keywords: ['instagram', 'view'] },
    { label: 'Instagram Comments', keywords: ['instagram', 'comment'] },
    { label: 'YouTube Subscribers', keywords: ['youtube', 'subscrib'] },
    { label: 'YouTube Views', keywords: ['youtube', 'view'] },
    { label: 'YouTube Likes', keywords: ['youtube', 'like'] },
    { label: 'TikTok Followers', keywords: ['tiktok', 'follow'] },
    { label: 'TikTok Likes', keywords: ['tiktok', 'like'] },
    { label: 'TikTok Views', keywords: ['tiktok', 'view'] },
    { label: 'Facebook Followers', keywords: ['facebook', 'follow'] },
    { label: 'Facebook Likes', keywords: ['facebook', 'like'] },
    { label: 'Twitter Followers', keywords: ['twitter', 'follow'] },
    { label: 'Spotify Plays', keywords: ['spotify', 'play'] },
  ];

  console.log('PEAKERR ENG ARZON NARXLARI:');
  console.log('=' .repeat(80));
  console.log(`${'Xizmat'.padEnd(25)} | ${'Narx/1K'.padEnd(12)} | ${'So\'mda/1K'.padEnd(12)} | ${'Sotish 1.5x'.padEnd(12)} | ${'Foyda'.padEnd(10)}`);
  console.log('-'.repeat(80));

  const UZS = 12800;

  for (const cat of categories) {
    const cheapest = findCheapest(peakerr, cat.keywords);
    if (cheapest) {
      const costSom = (cheapest.rate * UZS).toFixed(0);
      const sellSom = (cheapest.rate * UZS * 1.5).toFixed(0);
      const profitSom = (cheapest.rate * UZS * 0.5).toFixed(0);
      console.log(`${cat.label.padEnd(25)} | $${cheapest.rate.toFixed(4).padEnd(10)} | ${costSom.padStart(10)} | ${sellSom.padStart(10)} | ${profitSom.padStart(8)}`);
    } else {
      console.log(`${cat.label.padEnd(25)} | Topilmadi`);
    }
  }

  // Boshqa provayderlarni tekshirish (agar key bo'lsa)
  console.log('\n\n=== BOSHQA PROVAYDERLAR ===');
  console.log('Quyidagi provayederlarga ro\'yxatdan o\'tib, API key olish kerak:');
  console.log('');
  console.log('1. https://smmraja.net — IG/TikTok uchun eng arzon (tahmini 30-50% arzon)');
  console.log('2. https://cheapsmmpanel.com — umumiy arzon');
  console.log('3. https://bulkfollows.com — katta hajm uchun');
  console.log('');
  console.log('Har biriga ro\'yxatdan o\'ting va API key olib menga bering.');
  console.log('Men ularni admin panelga qo\'shaman va bot ENG ARZON provayederni avtomatik tanlaydi.');
  console.log('');
  console.log('=== MULTI-PROVIDER STRATEGIYA ===');
  console.log('');
  console.log('Peakerr  → Telegram (eng arzon TG xizmatlar)');
  console.log('SMMRaja  → Instagram + TikTok (30-50% arzonroq)');
  console.log('CheapSMM → YouTube + Facebook (arzonroq)');
  console.log('');
  console.log('Bot har bir buyurtmani ENG ARZON provayederga avtomatik yuboradi!');
}

main().catch(console.error);
