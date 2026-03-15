import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { contentManifest } from "@/lib/content-manifest.generated";
import {
  categories,
  getCategoryBySlug,
  getStoryTypeByLabel,
  getStoryTypeBySlug,
  storyTypes,
  type Category,
  type CategorySlug,
  type StoryType,
  type StoryTypeSlug,
} from "@/lib/content-taxonomy";

export { categories, storyTypes };
export type { Category, CategorySlug, StoryType, StoryTypeSlug };

export type ArticleSection = {
  id: string;
  title: string;
  level: 2 | 3;
};

export type ArticleCatalogEntry = {
  slug: string;
  popularityId: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  publishedLabel: string;
  category: CategorySlug | null;
  categoryLabel: string | null;
  storyType: StoryType;
  heroImage: string;
  heroAlt: string;
  featured: boolean;
};

export type ArticleSummary = ArticleCatalogEntry & {
  readTime: string;
  tags: readonly string[];
  relatedSlugs: readonly string[];
};

type ArticleManifestEntry = ArticleSummary & {
  sections: readonly ArticleSection[];
  resolvedRelatedSlugs: readonly string[];
  sourcePath: string;
};

export type ArticleEntry = {
  metadata: ArticleSummary;
  content: React.ReactNode;
  sections: readonly ArticleSection[];
};

type ManifestShape = {
  allArticleSlugs: readonly string[];
  latestArticleSlugs: readonly string[];
  featuredArticleSlug: string | null;
  articleBySlug: Record<string, ArticleManifestEntry>;
  articleByPopularityId: Record<string, string>;
  articlesByCategory: Record<string, readonly string[]>;
  articlesByStoryType: Record<string, readonly string[]>;
};

const manifest = contentManifest as unknown as ManifestShape;

function toArticleCatalogEntry(article: ArticleManifestEntry): ArticleCatalogEntry {
  return {
    slug: article.slug,
    popularityId: article.popularityId,
    title: article.title,
    excerpt: article.excerpt,
    publishedAt: article.publishedAt,
    publishedLabel: article.publishedLabel,
  category: article.category,
  categoryLabel: article.categoryLabel,
    storyType: article.storyType,
    heroImage: article.heroImage,
    heroAlt: article.heroAlt,
    featured: article.featured,
  };
}

const articleEntriesBySlug = Object.fromEntries(
  Object.entries(manifest.articleBySlug).map(([slug, article]) => [
    slug,
    article as ArticleManifestEntry,
  ]),
) as Record<string, ArticleManifestEntry>;

const allArticleEntries = manifest.allArticleSlugs.map((slug) => {
  const article = articleEntriesBySlug[slug];

  if (!article) {
    throw new Error(`Unknown article slug in content manifest: ${slug}`);
  }

  return article;
});

const articleCatalog = allArticleEntries.map(toArticleCatalogEntry);
const articleCatalogBySlug = Object.fromEntries(
  articleCatalog.map((article) => [article.slug, article]),
) as Record<string, ArticleCatalogEntry>;
const articleCatalogByPopularityId = Object.fromEntries(
  Object.entries(manifest.articleByPopularityId).map(([popularityId, slug]) => [
    popularityId,
    articleCatalogBySlug[slug],
  ]),
) as Record<string, ArticleCatalogEntry>;
const latestArticleCatalog = manifest.latestArticleSlugs.map((slug) => {
  const article = articleCatalogBySlug[slug];

  if (!article) {
    throw new Error(`Unknown latest article slug in content manifest: ${slug}`);
  }

  return article;
});
const articlesByCategory = Object.fromEntries(
  categories.map((category) => [
    category.slug,
    (manifest.articlesByCategory[category.slug] ?? []).map((slug) => {
      const article = articleCatalogBySlug[slug];

      if (!article) {
        throw new Error(`Unknown category article slug in content manifest: ${slug}`);
      }

      return article;
    }),
  ]),
) as Record<CategorySlug, ArticleCatalogEntry[]>;
const articlesByStoryType = Object.fromEntries(
  storyTypes.map((storyType) => [
    storyType.label,
    (manifest.articlesByStoryType[storyType.label] ?? []).map((slug) => {
      const article = articleCatalogBySlug[slug];

      if (!article) {
        throw new Error(`Unknown story type article slug in content manifest: ${slug}`);
      }

      return article;
    }),
  ]),
) as Record<StoryType, ArticleCatalogEntry[]>;

async function readArticleBodySource(sourcePath: string) {
  const source = await fs.readFile(path.join(process.cwd(), sourcePath), "utf8");

  return matter(source).content;
}

export const getAllArticles = cache(async (): Promise<ArticleCatalogEntry[]> => articleCatalog);

export const getFeaturedArticle = cache(async () => {
  const fallbackArticle = articleCatalog[0];

  if (!fallbackArticle) {
    throw new Error("Content manifest contains no articles.");
  }

  if (!manifest.featuredArticleSlug) {
    return fallbackArticle;
  }

  return articleCatalogBySlug[manifest.featuredArticleSlug] ?? fallbackArticle;
});

export const getFeaturedArticleSlug = cache(
  async () => manifest.featuredArticleSlug ?? articleCatalog[0]?.slug ?? null,
);

export const getLatestArticles = cache(
  async (limit = 4): Promise<ArticleCatalogEntry[]> => latestArticleCatalog.slice(0, limit),
);

export const getArticlesByCategory = cache(
  async (categorySlug: CategorySlug, limit?: number) => {
    const matches = articlesByCategory[categorySlug] ?? [];

    return typeof limit === "number" ? matches.slice(0, limit) : matches;
  },
);

export const getArticlesByStoryType = cache(
  async (storyType: StoryType, limit?: number) => {
    const matches = articlesByStoryType[storyType] ?? [];

    return typeof limit === "number" ? matches.slice(0, limit) : matches;
  },
);

export const getArticleBySlug = cache(
  async (slug: string): Promise<ArticleEntry | null> => {
    const article = articleEntriesBySlug[slug];

    if (!article) {
      return null;
    }

    try {
      const source = await readArticleBodySource(article.sourcePath);
      const { content } = await compileMDX({
        source,
        components: mdxComponents,
        options: {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      });

      return {
        metadata: article,
        content,
        sections: article.sections,
      };
    } catch {
      return null;
    }
  },
);

export const getArticleByPopularityId = cache(
  async (popularityId: string): Promise<ArticleCatalogEntry | null> =>
    articleCatalogByPopularityId[popularityId] ?? null,
);

export const getArticleCatalog = cache(
  async (): Promise<ArticleCatalogEntry[]> => articleCatalog,
);

export const getStoryTypeSummaries = cache(async () =>
  storyTypes.map((storyType) => ({
    ...storyType,
    articleCount: (manifest.articlesByStoryType[storyType.label] ?? []).length,
  })),
);

export const getHomePageContent = cache(async () => {
  const featuredArticle = await getFeaturedArticle();
  const latestArticles = await getLatestArticles(4);
  const leadArticles =
    featuredArticle === null
      ? latestArticles.slice(0, 3)
      : latestArticles
          .filter((article) => article.slug !== featuredArticle.slug)
          .slice(0, 3);
  const categoryRows = categories.map((category) => ({
    category,
    articles: (articlesByCategory[category.slug] ?? []).slice(0, 2),
  }));

  return {
    featuredArticle,
    latestArticles,
    leadArticles,
    categoryRows,
  };
});

export async function getRelatedArticles(article: Pick<ArticleSummary, "slug">) {
  const manifestArticle = articleEntriesBySlug[article.slug];

  if (!manifestArticle) {
    return [];
  }

  return manifestArticle.resolvedRelatedSlugs
    .map((slug) => articleCatalogBySlug[slug] ?? null)
    .filter((candidate): candidate is ArticleCatalogEntry => Boolean(candidate));
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function getCategoryFromSlug(slug: string) {
  if (!(categories as readonly Category[]).some((category) => category.slug === slug)) {
    return null;
  }

  return getCategoryBySlug(slug as CategorySlug);
}

export function getStoryTypeFromSlug(slug: string) {
  return getStoryTypeBySlug(slug);
}

export function getStoryTypeFromLabel(storyTypeLabel: StoryType) {
  return getStoryTypeByLabel(storyTypeLabel);
}
