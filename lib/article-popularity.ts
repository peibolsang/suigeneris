import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { unstable_cache } from "next/cache";
import { createClient, type RedisClientType } from "redis";
import { getArticleCatalog, type ArticleCatalogEntry } from "@/lib/content";

const POPULAR_ARTICLE_LIMIT = 3;
const POPULARITY_REVALIDATE_SECONDS = 300;
const VIEW_COOLDOWN_MS = 30 * 60 * 1000;
const LOCAL_TRACKING_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];
const botUserAgentPattern =
  /bot|crawler|spider|crawling|headless|preview|slurp|facebookexternalhit|bingpreview|embedly|quora link preview|ia_archiver|whatsapp|discordbot|slackbot|telegrambot/i;
const incrementArticleViewScript = `
  local acquired = redis.call("SET", KEYS[1], "1", "NX", "PX", ARGV[1])
  if not acquired then
    return 0
  end
  local count = redis.call("INCR", KEYS[2])
  redis.call("ZINCRBY", KEYS[3], 1, ARGV[2])
  return count
`;

type PopularityRecord = {
  articleId: string;
  viewCount: number;
};

export type PopularitySnapshot = {
  enabled: boolean;
  tracked: boolean;
  popularRank: number | null;
  isPopular: boolean;
};

export type PopularArticle = ArticleCatalogEntry & {
  viewCount: number;
  popularRank: number;
};

export type SeedCount = {
  articleId: string;
  viewCount: number;
};

export type TrackArticleViewOptions = {
  increment?: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
};

let redisClient: RedisClientType | null = null;
let redisConnectPromise: Promise<RedisClientType> | null = null;
const seedCounts: SeedCount[] = [
  { articleId: "carpenter-chef-painter-fatigue-pierna-recta", viewCount: 2 },
  { articleId: "sashiko-reparacion-textil-y-menswear", viewCount: 1 },
  { articleId: "chore-coat-workwear-fundacional", viewCount: 1 },
  { articleId: "algodon-fibra-larga-origen-calidad", viewCount: 2 },
  { articleId: "denim-japones-y-mito-americano", viewCount: 2 },
  { articleId: "m65-legado-civil", viewCount: 1 },
  { articleId: "aaron-levine-elegancia-casual", viewCount: 2 },
  { articleId: "ivy-ocbd-y-loafers", viewCount: 1 },
  { articleId: "chambray-y-fatiga", viewCount: 2 },
  { articleId: "wrangler-13mwz-icono-vaquero", viewCount: 3 },
  { articleId: "algodon-sarga-denim-canvas-duck-chambray", viewCount: 1 },
  { articleId: "dirty-dozen-relojes-militares-y-menswear", viewCount: 1 },
  { articleId: "sudaderas-crewneck-triangulo-cuello", viewCount: 3 },
  { articleId: "champion-reverse-weave-hoodies", viewCount: 2 },
  { articleId: "cone-mills-white-oak-gustin-deadstock", viewCount: 5 },
  { articleId: "buzz-rickson-atencion-al-detalle", viewCount: 5 },
  { articleId: "camisetas-loopwheeled-merz-whitesville", viewCount: 7 },
  { articleId: "donegal-tweed-neps-y-cultura-textil", viewCount: 2 },
  { articleId: "trucker-jackets-type-1-2-3", viewCount: 7 },
  { articleId: "german-army-trainers", viewCount: 3 },
  { articleId: "tartanes-de-casas-barbour-baracuta-y-otras", viewCount: 1 },
  { articleId: "mcgregor-drizzler-eisenhower", viewCount: 1 },
  { articleId: "n1-deck-jacket-y-version-rll", viewCount: 3 },
  { articleId: "rl67-jacket-importancia-menswear", viewCount: 2 },
  { articleId: "g1-leather-jacket", viewCount: 1 },
  { articleId: "woolrich-arctic-parka-frio-icono-civil", viewCount: 2 },
];

function isTruthyEnv(value: string | undefined) {
  if (!value) {
    return false;
  }

  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function sortPopularArticles(left: PopularArticle, right: PopularArticle) {
  return (
    right.viewCount - left.viewCount ||
    new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime() ||
    left.title.localeCompare(right.title, "es") ||
    left.slug.localeCompare(right.slug, "es")
  );
}

function resetRedisClient() {
  redisConnectPromise = null;
  redisClient = null;
}

async function getRedisClient() {
  const url = process.env.REDIS_URL?.trim();

  if (!url) {
    return null;
  }

  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (!redisClient) {
    redisClient = createClient({
      url,
      socket: {
        connectTimeout: 1500,
        reconnectStrategy: false,
      },
    });
    redisClient.on("error", () => {
      resetRedisClient();
    });
  }

  if (!redisConnectPromise) {
    redisConnectPromise = redisClient
      .connect()
      .then(() => redisClient as RedisClientType)
      .catch((error) => {
        resetRedisClient();
        throw error;
      });
  }

  return redisConnectPromise;
}

async function withRedis<T>(operation: (client: RedisClientType) => Promise<T>) {
  try {
    const client = await getRedisClient();

    if (!client) {
      return null;
    }

    return await operation(client);
  } catch {
    resetRedisClient();
    return null;
  }
}

function getRankingKey() {
  return `site:${getPopularityNamespace()}:article:views:ranking`;
}

function rankArticles(
  articles: ArticleCatalogEntry[],
  records: PopularityRecord[],
): PopularArticle[] {
  const viewCountByArticleId = new Map(
    records
      .filter((record) => record.viewCount > 0)
      .map((record) => [record.articleId, record.viewCount]),
  );

  return articles
    .filter((article) => viewCountByArticleId.has(article.popularityId))
    .map((article) => ({
      ...article,
      viewCount: viewCountByArticleId.get(article.popularityId) ?? 0,
      popularRank: 0,
    }))
    .sort(sortPopularArticles)
    .map((article, index) => ({
      ...article,
      popularRank: index + 1,
    }));
}

async function readPopularityRecords() {
  return withRedis(async (client) => {
    const rankingKey = getRankingKey();
    const entries = await client.zRangeWithScores(rankingKey, 0, -1, { REV: true });

    return entries.map((entry) => ({
      articleId: entry.value,
      viewCount: Number(entry.score),
    }));
  });
}

const getCachedPopularArticleRankings = unstable_cache(
  async () => {
    const [articles, records] = await Promise.all([
      getArticleCatalog(),
      readPopularityRecords(),
    ]);

    if (!records) {
      return [];
    }

    return rankArticles(articles, records);
  },
  ["popular-article-rankings"],
  {
    revalidate: POPULARITY_REVALIDATE_SECONDS,
  },
);

export function getPopularityNamespace() {
  return process.env.POPULARITY_NAMESPACE?.trim() || "suigeneris";
}

export function getSeedCounts() {
  return seedCounts;
}

export function getPopularityKeys(articleId: string) {
  const prefix = `site:${getPopularityNamespace()}:article:views`;

  return {
    counter: `${prefix}:${articleId}`,
    ranking: `${prefix}:ranking`,
  };
}

export function isPopularityEnabled() {
  return Boolean(process.env.REDIS_URL?.trim());
}

export function isLocalDevelopmentTrackingDisabled() {
  return isTruthyEnv(process.env.LOCAL_DEV);
}

function getCanonicalSiteOrigin() {
  const rawOrigin =
    process.env.SITE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!rawOrigin) {
    return null;
  }

  try {
    return new URL(rawOrigin).origin;
  } catch {
    return null;
  }
}

function getPopularityTrackingSecret() {
  const secret = process.env.POPULARITY_TRACKING_SECRET?.trim();

  return secret || null;
}

export function isTrackingProtectionConfigured() {
  return Boolean(getCanonicalSiteOrigin() && getPopularityTrackingSecret());
}

function getAllowedTrackingOrigins() {
  const canonicalOrigin = getCanonicalSiteOrigin();

  if (canonicalOrigin) {
    return new Set([canonicalOrigin]);
  }

  if (process.env.NODE_ENV !== "production") {
    return new Set(LOCAL_TRACKING_ORIGINS);
  }

  return null;
}

function getCooldownKey(articleId: string, fingerprint: string) {
  return `site:${getPopularityNamespace()}:article:views:cooldown:${articleId}:${fingerprint}`;
}

function getClientFingerprint(ipAddress: string, userAgent: string | null) {
  return createHash("sha256")
    .update(`${ipAddress}:${userAgent ?? ""}`)
    .digest("hex");
}

function signTrackingMessage(articleId: string) {
  const secret = getPopularityTrackingSecret();

  if (!secret) {
    return null;
  }

  return createHmac("sha256", secret)
    .update(articleId)
    .digest("hex");
}

export function createArticleTrackingToken(articleId: string) {
  return signTrackingMessage(articleId);
}

export function verifyArticleTrackingToken(articleId: string, token: string) {
  const expectedSignature = signTrackingMessage(articleId);

  if (!token || !expectedSignature) {
    return false;
  }

  const providedSignature = Buffer.from(token, "utf8");
  const expectedSignatureBuffer = Buffer.from(expectedSignature, "utf8");

  if (providedSignature.length !== expectedSignatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedSignature, expectedSignatureBuffer);
}

export function shouldTrackArticleViewRequest(input: {
  articleId: string;
  ipAddress: string | null;
  userAgent: string | null;
  origin: string | null;
  referer: string | null;
  secFetchSite: string | null;
  contentType: string | null;
}) {
  if (isLocalDevelopmentTrackingDisabled()) {
    return false;
  }

  if (!input.articleId) {
    return false;
  }

  if (input.userAgent && botUserAgentPattern.test(input.userAgent)) {
    return false;
  }

  if (!input.ipAddress) {
    return false;
  }

  if (input.contentType && !input.contentType.toLowerCase().startsWith("application/json")) {
    return false;
  }

  const allowedOrigins = getAllowedTrackingOrigins();

  if (!allowedOrigins || !input.origin || !allowedOrigins.has(input.origin)) {
    return false;
  }

  if (!input.referer) {
    return false;
  }

  try {
    const refererOrigin = new URL(input.referer).origin;

    if (!allowedOrigins.has(refererOrigin)) {
      return false;
    }
  } catch {
    return false;
  }

  if (input.secFetchSite !== "same-origin") {
    return false;
  }

  return true;
}

export async function getPopularityCatalog() {
  const articles = await getArticleCatalog();

  return new Map(articles.map((article) => [article.popularityId, article]));
}

export async function getPopularArticles(limit?: number) {
  const popularArticles = await getCachedPopularArticleRankings();

  return typeof limit === "number"
    ? popularArticles.slice(0, limit)
    : popularArticles;
}

export async function getArticlePopularitySnapshot(
  articleId: string,
): Promise<PopularitySnapshot> {
  const [articles, records] = await Promise.all([
    getArticleCatalog(),
    readPopularityRecords(),
  ]);

  if (!records) {
    return {
      enabled: false,
      tracked: false,
      popularRank: null,
      isPopular: false,
    };
  }

  const rankedArticles = rankArticles(articles, records);
  const match = rankedArticles.find((article) => article.popularityId === articleId);

  return {
    enabled: true,
    tracked: false,
    popularRank: match?.popularRank ?? null,
    isPopular: Boolean(match && match.popularRank <= POPULAR_ARTICLE_LIMIT),
  };
}

export async function trackArticleView(
  articleId: string,
  options: TrackArticleViewOptions = {},
): Promise<PopularitySnapshot> {
  const increment = options.increment ?? true;
  const ipAddress = options.ipAddress ?? null;
  const userAgent = options.userAgent ?? null;

  if (increment) {
    if (!ipAddress) {
      const snapshot = await getArticlePopularitySnapshot(articleId);

      return {
        ...snapshot,
        tracked: false,
      };
    }

    const result = await withRedis(async (client) => {
      const cooldownKey = getCooldownKey(
        articleId,
        getClientFingerprint(ipAddress, userAgent),
      );
      const keys = getPopularityKeys(articleId);
      const incremented = await client.eval(incrementArticleViewScript, {
        keys: [cooldownKey, keys.counter, keys.ranking],
        arguments: [String(VIEW_COOLDOWN_MS), articleId],
      });

      return Number(incremented);
    });

    if (result === null) {
      return {
        enabled: false,
        tracked: false,
        popularRank: null,
        isPopular: false,
      };
    }
    if (result === 0) {
      const snapshot = await getArticlePopularitySnapshot(articleId);

      return {
        ...snapshot,
        tracked: false,
      };
    }
  } else if (!isPopularityEnabled()) {
    return {
      enabled: false,
      tracked: false,
      popularRank: null,
      isPopular: false,
    };
  }

  const snapshot = await getArticlePopularitySnapshot(articleId);

  return {
    ...snapshot,
    tracked: increment && snapshot.enabled,
  };
}

export async function syncArticlePopularity(input: {
  currentId: string;
  previousId: string;
}) {
  if (input.currentId === input.previousId) {
    return true;
  }

  const result = await withRedis(async (client) => {
    const currentKeys = getPopularityKeys(input.currentId);
    const previousKeys = getPopularityKeys(input.previousId);
    const previousValue = await client.get(previousKeys.counter);
    const previousCount = previousValue ? Number(previousValue) : 0;

    if (previousCount <= 0) {
      await client.zRem(currentKeys.ranking, input.previousId);
      await client.del(previousKeys.counter);
      return true;
    }

    const currentValue = await client.get(currentKeys.counter);
    const currentCount = currentValue ? Number(currentValue) : 0;
    const nextCount = currentCount + previousCount;

    await client.set(currentKeys.counter, nextCount);
    await client.zAdd(currentKeys.ranking, [{ value: input.currentId, score: nextCount }]);
    await client.del(previousKeys.counter);
    await client.zRem(previousKeys.ranking, input.previousId);

    return true;
  });

  return result ?? false;
}

export async function seedArticlePopularity(
  counts: SeedCount[],
  dryRun = false,
) {
  const popularityCatalog = await getPopularityCatalog();
  const duplicateIds = new Set<string>();
  const seenIds = new Set<string>();

  for (const { articleId, viewCount } of counts) {
    if (seenIds.has(articleId)) {
      duplicateIds.add(articleId);
    }

    seenIds.add(articleId);

    if (!Number.isInteger(viewCount) || viewCount <= 0) {
      throw new Error(`Invalid view count for ${articleId}: ${viewCount}`);
    }
  }

  if (duplicateIds.size > 0) {
    throw new Error(`Duplicate article ids: ${[...duplicateIds].join(", ")}`);
  }

  for (const { articleId } of counts) {
    if (!popularityCatalog.has(articleId)) {
      throw new Error(`Unknown article id: ${articleId}`);
    }
  }

  if (dryRun) {
    return {
      inserted: counts.length,
      skipped: 0,
    };
  }

  const result = await withRedis(async (client) => {
    const multi = client.multi();

    for (const { articleId, viewCount } of counts) {
      const keys = getPopularityKeys(articleId);
      multi.set(keys.counter, viewCount);
      multi.zAdd(keys.ranking, [{ value: articleId, score: viewCount }]);
    }

    await multi.exec();

    return {
      inserted: counts.length,
      skipped: 0,
    };
  });

  if (!result) {
    throw new Error("REDIS_URL is not configured or Redis is unavailable.");
  }

  return result;
}
