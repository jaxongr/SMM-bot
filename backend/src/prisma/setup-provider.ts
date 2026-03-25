import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const PROVIDER = {
  name: 'Peakerr',
  apiUrl: 'https://peakerr.com/api/v2',
  apiKey: 'c7e71376ea65956e31f386da479fa163',
  priority: 10,
  description: 'Main SMM provider — 4700+ services',
};

// Map Peakerr categories to our category slugs
const CATEGORY_MAP: Record<string, string[]> = {
  'tg-subscribers': ['Telegram - Members', 'Telegram Members', 'Telegram - Subscribers', 'Telegram Channel Members', 'Telegram Group Members'],
  'tg-post-views': ['Telegram - Views', 'Telegram Views', 'Telegram Post Views'],
  'tg-reactions': ['Telegram - Reactions', 'Telegram Reactions'],
  'tg-comments': ['Telegram - Comments', 'Telegram Comments'],
  'tg-shares': ['Telegram - Shares', 'Telegram Shares', 'Telegram Forwards'],
  'tg-poll-votes': ['Telegram - Poll', 'Telegram Poll'],
  'tg-auto-views': ['Telegram - Auto Views', 'Telegram Auto Views'],
  'tg-story-views': ['Telegram - Story', 'Telegram Story'],

  'ig-followers': ['Instagram Followers', 'Instagram - Followers'],
  'ig-likes': ['Instagram Likes', 'Instagram - Likes'],
  'ig-comments': ['Instagram Comments', 'Instagram - Comments'],
  'ig-reel-views': ['Instagram - Reel', 'Instagram Reel Views', 'Instagram - Reels'],
  'ig-story-views': ['Instagram - Story', 'Instagram Story'],
  'ig-igtv-views': ['Instagram - IGTV', 'Instagram IGTV'],
  'ig-saves': ['Instagram - Saves', 'Instagram Saves'],
  'ig-shares': ['Instagram - Shares', 'Instagram Shares'],
  'ig-impressions': ['Instagram - Impressions', 'Instagram Impressions', 'Instagram - Reach'],
  'ig-auto-likes': ['Instagram - Auto Likes', 'Instagram Auto'],

  'yt-subscribers': ['YouTube - Subscribers', 'YouTube Subscribers'],
  'yt-views': ['YouTube Views', 'YouTube - Views'],
  'yt-likes': ['YouTube - Likes', 'YouTube Likes'],
  'yt-comments': ['YouTube - Comments', 'YouTube Comments'],
  'yt-watch-hours': ['YouTube - Watch', 'YouTube Watch Hours', 'YouTube Watch Time'],
  'yt-shorts': ['YouTube - Shorts', 'YouTube Shorts'],
  'yt-live': ['YouTube - Live', 'YouTube Live'],

  'tt-followers': ['TikTok - Followers', 'TikTok Followers'],
  'tt-likes': ['TikTok - Likes', 'TikTok Likes'],
  'tt-views': ['TikTok - Views', 'TikTok Views'],
  'tt-comments': ['TikTok - Comments', 'TikTok Comments'],
  'tt-shares': ['TikTok - Shares', 'TikTok Shares'],
  'tt-saves': ['TikTok - Saves', 'TikTok Saves'],
  'tt-live': ['TikTok - Live', 'TikTok Live'],

  'fb-page-likes': ['Facebook - Page Likes', 'Facebook Page Likes'],
  'fb-post-likes': ['Facebook - Post Likes', 'Facebook Post Likes', 'Facebook - Reactions'],
  'fb-followers': ['Facebook - Followers', 'Facebook Followers'],
  'fb-views': ['Facebook - Views', 'Facebook Views', 'Facebook - Video', 'Facebook Live'],
  'fb-comments': ['Facebook - Comments', 'Facebook Comments'],
  'fb-shares': ['Facebook - Shares', 'Facebook Shares'],
  'fb-group': ['Facebook - Group', 'Facebook Group'],

  'tw-followers': ['Twitter - Followers', 'Twitter Followers', 'X -'],
  'tw-likes': ['Twitter - Likes', 'Twitter Likes'],
  'tw-retweets': ['Twitter - Retweets', 'Twitter Retweets', 'Twitter - Repost'],
  'tw-views': ['Twitter - Views', 'Twitter Views', 'Twitter - Impressions'],
  'tw-comments': ['Twitter - Comments', 'Twitter Comments', 'Twitter - Replies'],

  'sp-plays': ['Spotify - Plays', 'Spotify Plays', 'Spotify - Streams'],
  'sp-followers': ['Spotify - Followers', 'Spotify Followers'],
  'sp-saves': ['Spotify - Saves', 'Spotify Saves'],
  'sp-playlist': ['Spotify - Playlist', 'Spotify Playlist'],

  'dc-members': ['Discord - Members', 'Discord Members'],
  'dc-online': ['Discord - Online', 'Discord Online'],
};

async function main() {
  console.log('🔧 Setting up Peakerr provider...\n');

  // 1. Create provider
  let provider = await prisma.provider.findFirst({ where: { name: PROVIDER.name } });
  if (!provider) {
    provider = await prisma.provider.create({
      data: {
        name: PROVIDER.name,
        apiUrl: PROVIDER.apiUrl,
        apiKey: PROVIDER.apiKey,
        priority: PROVIDER.priority,
        description: PROVIDER.description,
      },
    });
    console.log(`✅ Provider created: ${provider.name} (${provider.id})`);
  } else {
    await prisma.provider.update({
      where: { id: provider.id },
      data: { apiKey: PROVIDER.apiKey, apiUrl: PROVIDER.apiUrl },
    });
    console.log(`✅ Provider updated: ${provider.name}`);
  }

  // 2. Fetch services from API
  console.log('\n📡 Fetching services from Peakerr API...');
  const response = await fetch(`${PROVIDER.apiUrl}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `key=${PROVIDER.apiKey}&action=services`,
  });
  const apiServices = await response.json() as Array<{
    service: string;
    name: string;
    type: string;
    rate: string;
    min: string;
    max: string;
    category: string;
    refill: boolean;
    cancel: boolean;
  }>;
  console.log(`📦 ${apiServices.length} xizmat topildi\n`);

  // 3. Save provider services
  let savedCount = 0;
  for (const svc of apiServices) {
    await prisma.providerService.upsert({
      where: {
        providerId_externalServiceId: {
          providerId: provider.id,
          externalServiceId: String(svc.service),
        },
      },
      update: {
        name: svc.name,
        category: svc.category,
        pricePerUnit: new Prisma.Decimal(svc.rate),
        minQuantity: parseInt(svc.min) || 1,
        maxQuantity: parseInt(svc.max) || 100000,
      },
      create: {
        providerId: provider.id,
        externalServiceId: String(svc.service),
        name: svc.name,
        category: svc.category,
        pricePerUnit: new Prisma.Decimal(svc.rate),
        minQuantity: parseInt(svc.min) || 1,
        maxQuantity: parseInt(svc.max) || 100000,
      },
    });
    savedCount++;
  }
  console.log(`💾 ${savedCount} provider xizmat saqlandi\n`);

  // 4. Auto-map services
  console.log('🔗 Xizmatlarni ulash...\n');
  let mappedCount = 0;

  for (const [categorySlug, keywords] of Object.entries(CATEGORY_MAP)) {
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) continue;

    const ourServices = await prisma.service.findMany({ where: { categoryId: category.id } });
    if (ourServices.length === 0) continue;

    // Find matching provider services
    const matchingProviderServices = apiServices.filter((ps) =>
      keywords.some((kw) => ps.category.toLowerCase().includes(kw.toLowerCase())),
    );

    if (matchingProviderServices.length === 0) continue;

    // Map cheapest provider service to first our service as default
    const cheapest = matchingProviderServices.sort(
      (a, b) => parseFloat(a.rate) - parseFloat(b.rate),
    )[0];

    const providerService = await prisma.providerService.findFirst({
      where: {
        providerId: provider.id,
        externalServiceId: String(cheapest.service),
      },
    });

    if (!providerService) continue;

    for (const ourService of ourServices) {
      const existingMapping = await prisma.serviceProviderMapping.findFirst({
        where: { serviceId: ourService.id, providerId: provider.id },
      });

      if (!existingMapping) {
        // Find best matching provider service for this tier
        let bestMatch = providerService;

        // Try to match by price tier
        const ourPrice = Number(ourService.pricePerUnit);
        const sortedMatches = matchingProviderServices.sort(
          (a, b) => parseFloat(a.rate) - parseFloat(b.rate),
        );

        // Pick provider service closest to our price (but cheaper)
        for (const m of sortedMatches) {
          const ps = await prisma.providerService.findFirst({
            where: { providerId: provider.id, externalServiceId: String(m.service) },
          });
          if (ps) {
            bestMatch = ps;
            // If provider price is less than our price, use it
            if (Number(ps.pricePerUnit) * 12800 < ourPrice * 1000 * 0.5) {
              break;
            }
          }
        }

        await prisma.serviceProviderMapping.create({
          data: {
            serviceId: ourService.id,
            providerServiceId: bestMatch.id,
            providerId: provider.id,
            priority: 10,
            isActive: true,
          },
        });
        mappedCount++;
      }
    }
    console.log(`  ✅ ${categorySlug}: ${ourServices.length} xizmat ulandi`);
  }

  console.log(`\n🎉 Jami ${mappedCount} ta xizmat provayderga ulandi!`);
  console.log(`\n📊 Natija:`);
  console.log(`  Provider: ${provider.name}`);
  console.log(`  Provider xizmatlari: ${savedCount}`);
  console.log(`  Ulangan xizmatlar: ${mappedCount}`);
  console.log(`  Balans: $0 (to'ldirish kerak)`);
  console.log(`\n⚠️ Buyurtmalar ishlashi uchun Peakerr balansini to'ldiring!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
