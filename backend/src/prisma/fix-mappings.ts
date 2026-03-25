import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const PEAKERR_API_URL = 'https://peakerr.com/api/v2';
const PEAKERR_API_KEY = 'c7e71376ea65956e31f386da479fa163';

// ============ CATEGORY MAPPING ============
// Maps our category slugs to Peakerr category keywords
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
  'ig-saves': ['Instagram - Saves', 'Instagram Saves'],
  'ig-shares': ['Instagram - Shares', 'Instagram Shares'],
  'ig-impressions': ['Instagram - Impressions', 'Instagram Impressions', 'Instagram - Reach'],
  'ig-auto-likes': ['Instagram - Auto Likes', 'Instagram Auto'],
  'ig-live-viewers': ['Instagram - Live', 'Instagram Live'],
  'ig-igtv-views': ['Instagram - IGTV', 'Instagram IGTV'],

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

  'fb-page-likes': ['Facebook - Page', 'Facebook Page Likes'],
  'fb-post-likes': ['Facebook - Post Likes', 'Facebook Post Likes', 'Facebook - Reactions'],
  'fb-followers': ['Facebook - Followers', 'Facebook Followers'],
  'fb-views': ['Facebook - Views', 'Facebook Views', 'Facebook - Video', 'Facebook Live'],
  'fb-comments': ['Facebook - Comments', 'Facebook Comments'],
  'fb-shares': ['Facebook - Shares', 'Facebook Shares'],
  'fb-group': ['Facebook - Group', 'Facebook Group'],

  'tw-followers': ['Twitter - Followers', 'Twitter Followers', 'X -'],
  'tw-likes': ['Twitter - Likes', 'Twitter Likes'],
  'tw-retweets': ['Twitter - Retweets', 'Twitter Retweets', 'Twitter - Retweet', 'Twitter - Repost'],
  'tw-views': ['Twitter - Views', 'Twitter Views', 'Twitter - Impressions', 'Twitter - Impression'],
  'tw-comments': ['Twitter - Comments', 'Twitter Comments', 'Twitter - Replies'],

  'sp-plays': ['Spotify - Plays', 'Spotify Plays', 'Spotify - Streams', 'Spotify - Stream'],
  'sp-followers': ['Spotify - Followers', 'Spotify Followers'],
  'sp-saves': ['Spotify - Saves', 'Spotify Saves'],
  'sp-playlist': ['Spotify - Playlist', 'Spotify Playlist'],

  'dc-members': ['Discord - Members', 'Discord Members'],
  'dc-online': ['Discord - Online', 'Discord Online'],
};

// ============ QUALITY TIER CATEGORIES ============
// Categories where services have multiple quality tiers (followers/subscribers)
const TIERED_CATEGORIES = new Set([
  'tg-subscribers', 'ig-followers', 'yt-subscribers', 'tt-followers',
  'fb-page-likes', 'fb-followers', 'fb-group',
  'tw-followers', 'sp-followers', 'dc-members',
]);

// ============ TIER DETECTION ============

interface PeakerrService {
  service: string;
  name: string;
  type: string;
  rate: string;
  min: string;
  max: string;
  category: string;
  refill: boolean;
  cancel: boolean;
}

/**
 * Detect quality tier from our service name (uz field).
 * For tiered categories (followers/subscribers):
 *   tier 0 = bot/cheapest
 *   tier 1 = medium
 *   tier 2 = high quality / targeted
 *   tier 3 = premium / real
 *
 * For engagement categories (views, likes, reactions, comments):
 *   tier 0 = fast/cheap
 *   tier 1 = default/standard
 *   tier 2 = HQ/quality
 *   tier 3 = targeted/premium
 */
function detectTier(serviceName: string, isTieredCategory: boolean): number {
  const name = serviceName.toLowerCase();

  if (isTieredCategory) {
    // Followers/subscribers tier detection
    if (name.includes('bot') || name.includes('cheap') || name.includes('eng arzon')) {
      return 0;
    }
    if (name.includes('arzon') || name.includes('low') || name.includes('дешёв')) {
      return 0;
    }
    if (name.includes('premium') || name.includes('real') || name.includes('💎')) {
      return 3;
    }
    if (name.includes('yuqori') || name.includes('hq') || name.includes('sifatli') || name.includes('высок')) {
      return 2;
    }
    if (name.includes("o'zbek") || name.includes('rus') || name.includes('xalqaro') || name.includes('refill')) {
      return 2;
    }
    if (name.includes("o'rta") || name.includes('medium') || name.includes('средн')) {
      return 1;
    }
    if (name.includes('onlayn') || name.includes('online')) {
      return 2;
    }
    return 1;
  }

  // Engagement tier detection (views, likes, reactions, comments, etc.)
  if (name.includes('tez') || name.includes('fast') || name.includes('arzon') || name.includes('cheap') || name.includes('быстр') || name.includes('дешёв')) {
    return 0;
  }
  if (name.includes('target') || name.includes('🎯') || name.includes('maxsus') || name.includes('custom') || name.includes('кастом')) {
    return 3;
  }
  if (name.includes('sifatli') || name.includes('hq') || name.includes('hr') || name.includes('yuqori') || name.includes('качеств') || name.includes('высок')) {
    return 2;
  }
  if (name.includes('premium') || name.includes('💎')) {
    return 3;
  }
  if (name.includes('ijobiy') || name.includes('positive') || name.includes('позитив')) {
    return 2;
  }
  if (name.includes('oxirgi') || name.includes('last')) {
    return 2;
  }
  if (name.includes('avto') || name.includes('auto') || name.includes('авто')) {
    return 1;
  }
  return 1;
}

/**
 * Pick a Peakerr service from sorted list based on tier and percentile.
 * tier 0 → #1 cheapest (0-10th percentile)
 * tier 1 → 30-40th percentile
 * tier 2 → 60-70th percentile
 * tier 3 → 80-90th percentile
 */
function pickByTier(sortedServices: PeakerrService[], tier: number): PeakerrService {
  const count = sortedServices.length;
  if (count === 0) {
    throw new Error('No services to pick from');
  }
  if (count === 1) {
    return sortedServices[0];
  }

  let index: number;
  switch (tier) {
    case 0:
      // Cheapest — pick first
      index = 0;
      break;
    case 1:
      // Medium — 30-40th percentile
      index = Math.floor(count * 0.35);
      break;
    case 2:
      // High quality — 60-70th percentile
      index = Math.floor(count * 0.65);
      break;
    case 3:
      // Premium — 80-90th percentile
      index = Math.floor(count * 0.85);
      break;
    default:
      index = Math.floor(count * 0.35);
  }

  // Clamp to valid range
  index = Math.min(index, count - 1);
  index = Math.max(index, 0);

  return sortedServices[index];
}

/**
 * Find matching Peakerr services for a given category slug.
 * Returns services sorted by price (cheapest first).
 */
function findMatchingPeakerrServices(
  allPeakerrServices: PeakerrService[],
  categorySlug: string,
): PeakerrService[] {
  const keywords = CATEGORY_MAP[categorySlug];
  if (!keywords) return [];

  const matching = allPeakerrServices.filter((ps) =>
    keywords.some((kw) => ps.category.toLowerCase().includes(kw.toLowerCase())),
  );

  // Sort by price ascending (cheapest first)
  return matching.sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));
}

async function main() {
  console.log('=== Fix Mappings Script ===\n');

  // 1. Fetch Peakerr services
  console.log('1. Fetching services from Peakerr API...');
  const response = await fetch(PEAKERR_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `key=${PEAKERR_API_KEY}&action=services`,
  });

  if (!response.ok) {
    throw new Error(`Peakerr API error: ${response.status} ${response.statusText}`);
  }

  const peakerrServices = (await response.json()) as PeakerrService[];
  console.log(`   Found ${peakerrServices.length} Peakerr services\n`);

  // 2. Get our provider
  const provider = await prisma.provider.findFirst({ where: { name: 'Peakerr' } });
  if (!provider) {
    throw new Error('Peakerr provider not found. Run setup-provider.ts first.');
  }
  console.log(`2. Provider: ${provider.name} (${provider.id})\n`);

  // 3. Delete all existing mappings
  console.log('3. Deleting all existing mappings...');
  const deletedCount = await prisma.serviceProviderMapping.deleteMany({});
  console.log(`   Deleted ${deletedCount.count} mappings\n`);

  // 4. Get all our services with categories
  const allOurServices = await prisma.service.findMany({
    include: { category: true },
  });
  console.log(`4. Our services: ${allOurServices.length}\n`);

  // 5. Build ProviderService lookup (externalServiceId -> ProviderService)
  const providerServiceMap = new Map<string, { id: string; externalServiceId: string }>();
  const allProviderServices = await prisma.providerService.findMany({
    where: { providerId: provider.id },
    select: { id: true, externalServiceId: true },
  });
  for (const ps of allProviderServices) {
    providerServiceMap.set(ps.externalServiceId, ps);
  }
  console.log(`5. Provider services in DB: ${allProviderServices.length}\n`);

  // 6. Create mappings
  console.log('6. Creating new mappings...\n');

  let mappedCount = 0;
  let unmappedCount = 0;
  const summary: Array<{ ourService: string; categorySlug: string; tier: number; peakerrId: string; peakerrName: string; peakerrRate: string }> = [];
  const unmappedServices: Array<{ name: string; categorySlug: string; reason: string }> = [];

  for (const ourService of allOurServices) {
    const categorySlug = ourService.category.slug;
    const serviceName = (ourService.name as { uz: string; ru: string; en: string }).uz;
    const isTiered = TIERED_CATEGORIES.has(categorySlug);
    const tier = detectTier(serviceName, isTiered);

    // Find matching Peakerr services for this category
    const matchingPeakerr = findMatchingPeakerrServices(peakerrServices, categorySlug);

    if (matchingPeakerr.length === 0) {
      unmappedServices.push({ name: serviceName, categorySlug, reason: 'No matching Peakerr category' });
      unmappedCount++;
      continue;
    }

    // Pick the best Peakerr service based on tier
    const selectedPeakerr = pickByTier(matchingPeakerr, tier);

    // Find the ProviderService record in our DB
    const providerService = providerServiceMap.get(String(selectedPeakerr.service));
    if (!providerService) {
      unmappedServices.push({ name: serviceName, categorySlug, reason: `ProviderService not found for Peakerr ID ${selectedPeakerr.service}` });
      unmappedCount++;
      continue;
    }

    // Create the mapping
    await prisma.serviceProviderMapping.create({
      data: {
        serviceId: ourService.id,
        providerServiceId: providerService.id,
        providerId: provider.id,
        priority: 10,
        isActive: true,
      },
    });

    summary.push({
      ourService: serviceName,
      categorySlug,
      tier,
      peakerrId: selectedPeakerr.service,
      peakerrName: selectedPeakerr.name,
      peakerrRate: selectedPeakerr.rate,
    });
    mappedCount++;
  }

  // 7. Print summary
  console.log('=== MAPPING SUMMARY ===\n');
  console.log(`Total our services: ${allOurServices.length}`);
  console.log(`Successfully mapped: ${mappedCount}`);
  console.log(`Unmapped: ${unmappedCount}\n`);

  // Group by category for nice output
  const byCategory = new Map<string, typeof summary>();
  for (const item of summary) {
    const existing = byCategory.get(item.categorySlug) || [];
    existing.push(item);
    byCategory.set(item.categorySlug, existing);
  }

  const tierLabels = ['CHEAP', 'MEDIUM', 'HQ', 'PREMIUM'];

  for (const [slug, items] of byCategory) {
    console.log(`--- ${slug} (${items.length} services) ---`);
    for (const item of items) {
      console.log(
        `  [${tierLabels[item.tier]}] "${item.ourService}" -> Peakerr #${item.peakerrId} ($${item.peakerrRate}/1K) "${item.peakerrName.substring(0, 60)}"`,
      );
    }
    console.log('');
  }

  if (unmappedServices.length > 0) {
    console.log('--- UNMAPPED SERVICES ---');
    for (const item of unmappedServices) {
      console.log(`  [!] "${item.name}" (${item.categorySlug}) - ${item.reason}`);
    }
    console.log('');
  }

  // 8. Verify final state
  const finalMappingCount = await prisma.serviceProviderMapping.count();
  console.log(`=== FINAL STATE ===`);
  console.log(`Total mappings in DB: ${finalMappingCount}`);
  console.log(`Done!`);
}

main()
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
