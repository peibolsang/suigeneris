import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { createClient } from "redis";

type SeedCount = {
  articleId: string;
  viewCount: number;
};

type ArticleCatalogEntry = {
  articleId: string;
  slug: string;
  title: string;
};

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

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

async function loadLocalEnv() {
  const envFilePath = path.join(process.cwd(), ".env.local");

  try {
    const source = await fs.readFile(envFilePath, "utf8");

    for (const rawLine of source.split(/\r?\n/)) {
      const line = rawLine.trim();

      if (!line || line.startsWith("#")) {
        continue;
      }

      const separatorIndex = line.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");

      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

function getPopularityNamespace() {
  return process.env.POPULARITY_NAMESPACE?.trim() || "suigeneris";
}

function getPopularityKeys(articleId: string) {
  const prefix = `site:${getPopularityNamespace()}:article:views`;

  return {
    counter: `${prefix}:${articleId}`,
    ranking: `${prefix}:ranking`,
  };
}

async function readArticleCatalog() {
  const contentDirectory = path.join(process.cwd(), "content", "articles");
  const files = await fs.readdir(contentDirectory);
  const catalog = new Map<string, ArticleCatalogEntry>();

  for (const file of files) {
    if (!file.endsWith(".mdx")) {
      continue;
    }

    const source = await fs.readFile(path.join(contentDirectory, file), "utf8");
    const { data } = matter(source);
    const articleId =
      typeof data.popularityId === "string" ? data.popularityId.trim() : "";
    const slug = typeof data.slug === "string" ? data.slug.trim() : file.replace(/\.mdx$/, "");
    const title = typeof data.title === "string" ? data.title.trim() : slug;

    if (!articleId) {
      throw new Error(`Missing popularityId in ${file}`);
    }

    if (catalog.has(articleId)) {
      throw new Error(`Duplicate popularityId in content: ${articleId}`);
    }

    catalog.set(articleId, {
      articleId,
      slug,
      title,
    });
  }

  return catalog;
}

async function validateSeedCounts(counts: SeedCount[]) {
  const catalog = await readArticleCatalog();
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

    if (!catalog.has(articleId)) {
      throw new Error(`Unknown articleId: ${articleId}`);
    }
  }

  if (duplicateIds.size > 0) {
    throw new Error(`Duplicate article ids: ${[...duplicateIds].join(", ")}`);
  }

  return catalog;
}

async function seedPopularity(counts: SeedCount[], dryRun: boolean) {
  const catalog = await validateSeedCounts(counts);

  if (dryRun) {
    return {
      namespace: getPopularityNamespace(),
      dryRun: true,
      inserted: counts.length,
      articles: counts.map(({ articleId, viewCount }) => ({
        articleId,
        viewCount,
        title: catalog.get(articleId)?.title ?? articleId,
      })),
    };
  }

  const url = process.env.REDIS_URL?.trim();

  if (!url) {
    throw new Error("REDIS_URL is not configured.");
  }

  const client = createClient({ url });
  client.on("error", () => {});

  try {
    await client.connect();

    const multi = client.multi();

    for (const { articleId, viewCount } of counts) {
      const keys = getPopularityKeys(articleId);
      multi.set(keys.counter, viewCount);
      multi.zAdd(keys.ranking, [{ value: articleId, score: viewCount }]);
    }

    await multi.exec();

    return {
      namespace: getPopularityNamespace(),
      dryRun: false,
      inserted: counts.length,
    };
  } finally {
    if (client.isOpen) {
      await client.quit();
    }
  }
}

async function main() {
  await loadLocalEnv();
  const result = await seedPopularity(seedCounts, hasFlag("--dry-run"));
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error.";
  console.error(message);
  process.exitCode = 1;
});
