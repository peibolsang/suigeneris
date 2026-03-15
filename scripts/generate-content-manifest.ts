import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import {
  categories,
  getCategoryBySlug,
  isCategorySlug,
  isStoryType,
  storyTypes,
  type CategorySlug,
  type StoryType,
} from "../lib/content-taxonomy";
import { slugify } from "../lib/slugify";

type ArticleSection = {
  id: string;
  title: string;
  level: 2 | 3;
};

type ArticleManifestEntry = {
  slug: string;
  popularityId: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  publishedLabel: string;
  readTime: string;
  category: CategorySlug | null;
  categoryLabel: string | null;
  storyType: StoryType;
  tags: string[];
  heroImage: string;
  heroAlt: string;
  relatedSlugs: string[];
  resolvedRelatedSlugs: string[];
  featured: boolean;
  sections: ArticleSection[];
  sourcePath: string;
};

type ArticleFrontmatter = {
  title?: unknown;
  slug?: unknown;
  popularityId?: unknown;
  excerpt?: unknown;
  publishedAt?: unknown;
  readTime?: unknown;
  category?: unknown;
  storyType?: unknown;
  tags?: unknown;
  heroImage?: unknown;
  heroAlt?: unknown;
  relatedSlugs?: unknown;
  featured?: unknown;
};

const contentDirectory = path.join(process.cwd(), "content", "articles");
const outputPath = path.join(
  process.cwd(),
  "lib",
  "content-manifest.generated.ts",
);

function formatPublishedLabel(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function extractArticleSections(source: string): ArticleSection[] {
  return source
    .split("\n")
    .map((line) => line.match(/^(##|###)\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      id: slugify(match[2].trim()),
      title: match[2].trim(),
      level: match[1].length as 2 | 3,
    }));
}

function normalizeFrontmatter(
  fileSlug: string,
  frontmatter: ArticleFrontmatter,
  sourcePath: string,
  content: string,
): ArticleManifestEntry {
  if (
    typeof frontmatter.title !== "string" ||
    typeof frontmatter.excerpt !== "string" ||
    typeof frontmatter.publishedAt !== "string" ||
    typeof frontmatter.readTime !== "string" ||
    typeof frontmatter.heroImage !== "string" ||
    typeof frontmatter.heroAlt !== "string"
  ) {
    throw new Error(`Missing required frontmatter in ${fileSlug}.mdx`);
  }

  if (
    typeof frontmatter.category !== "undefined" &&
    (typeof frontmatter.category !== "string" || !isCategorySlug(frontmatter.category))
  ) {
    throw new Error(`Invalid category in ${fileSlug}.mdx`);
  }

  if (
    typeof frontmatter.storyType !== "string" ||
    !isStoryType(frontmatter.storyType)
  ) {
    throw new Error(`Invalid storyType in ${fileSlug}.mdx`);
  }

  const slug =
    typeof frontmatter.slug === "string" && frontmatter.slug.trim()
      ? frontmatter.slug.trim()
      : fileSlug;
  const popularityId =
    typeof frontmatter.popularityId === "string" && frontmatter.popularityId.trim()
      ? frontmatter.popularityId.trim()
      : "";

  if (!popularityId) {
    throw new Error(`Missing popularityId in ${fileSlug}.mdx`);
  }

  const category =
    typeof frontmatter.category === "string"
      ? getCategoryBySlug(frontmatter.category)
      : null;

  if (typeof frontmatter.category === "string" && !category) {
    throw new Error(`Unknown category in ${fileSlug}.mdx`);
  }

  const tags = Array.isArray(frontmatter.tags)
    ? frontmatter.tags.filter((tag): tag is string => typeof tag === "string")
    : [];
  const relatedSlugs = Array.isArray(frontmatter.relatedSlugs)
    ? frontmatter.relatedSlugs.filter(
        (relatedSlug): relatedSlug is string => typeof relatedSlug === "string",
      )
    : [];

  return {
    slug,
    popularityId,
    title: frontmatter.title,
    excerpt: frontmatter.excerpt,
    publishedAt: frontmatter.publishedAt,
    publishedLabel: formatPublishedLabel(frontmatter.publishedAt),
    readTime: frontmatter.readTime,
    category: category?.slug ?? null,
    categoryLabel: category?.label ?? null,
    storyType: frontmatter.storyType,
    tags,
    heroImage: frontmatter.heroImage,
    heroAlt: frontmatter.heroAlt,
    relatedSlugs,
    resolvedRelatedSlugs: [],
    featured: Boolean(frontmatter.featured),
    sections: extractArticleSections(content),
    sourcePath,
  };
}

async function buildManifest() {
  const files = await fs.readdir(contentDirectory);
  const entries = await Promise.all(
    files
      .filter((file) => file.endsWith(".mdx"))
      .map(async (file) => {
        const sourcePath = path.posix.join("content", "articles", file);
        const source = await fs.readFile(path.join(process.cwd(), sourcePath), "utf8");
        const { data, content } = matter(source);
        const fileSlug = file.replace(/\.mdx$/, "");

        return normalizeFrontmatter(
          fileSlug,
          data as ArticleFrontmatter,
          sourcePath,
          content,
        );
      }),
  );

  const popularityIds = new Set<string>();

  for (const entry of entries) {
    if (popularityIds.has(entry.popularityId)) {
      throw new Error(`Duplicate popularityId detected: ${entry.popularityId}`);
    }

    popularityIds.add(entry.popularityId);
  }

  const sortedEntries = [...entries].sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  );
  const entryBySlug = new Map(sortedEntries.map((entry) => [entry.slug, entry]));

  for (const entry of sortedEntries) {
    const resolvedRelatedSlugs =
      entry.relatedSlugs.length > 0
        ? entry.relatedSlugs.filter(
            (relatedSlug) => relatedSlug !== entry.slug && entryBySlug.has(relatedSlug),
          )
        : entry.category
          ? sortedEntries
            .filter(
              (candidate) =>
                candidate.slug !== entry.slug &&
                candidate.category === entry.category,
            )
            .slice(0, 3)
            .map((candidate) => candidate.slug)
          : [];

    entry.resolvedRelatedSlugs = resolvedRelatedSlugs;
  }

  const articleBySlug = Object.fromEntries(
    sortedEntries.map((entry) => [entry.slug, entry]),
  );
  const articleByPopularityId = Object.fromEntries(
    sortedEntries.map((entry) => [entry.popularityId, entry.slug]),
  );
  const articlesByCategory = Object.fromEntries(
    categories.map((category) => [
      category.slug,
      sortedEntries
        .filter((entry) => entry.category === category.slug)
        .map((entry) => entry.slug),
    ]),
  );
  const articlesByStoryType = Object.fromEntries(
    storyTypes.map((storyType) => [
      storyType.label,
      sortedEntries
        .filter((entry) => entry.storyType === storyType.label)
        .map((entry) => entry.slug),
    ]),
  );

  return {
    allArticleSlugs: sortedEntries.map((entry) => entry.slug),
    latestArticleSlugs: sortedEntries.slice(0, 4).map((entry) => entry.slug),
    featuredArticleSlug:
      sortedEntries.find((entry) => entry.featured)?.slug ?? sortedEntries[0]?.slug ?? null,
    articleBySlug,
    articleByPopularityId,
    articlesByCategory,
    articlesByStoryType,
  };
}

async function writeManifestFile() {
  const manifest = await buildManifest();
  const fileContents = `// This file is generated by scripts/generate-content-manifest.ts.
// Do not edit it manually.

export const contentManifest = ${JSON.stringify(manifest, null, 2)} as const;
`;

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, fileContents, "utf8");
}

writeManifestFile().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exitCode = 1;
});
