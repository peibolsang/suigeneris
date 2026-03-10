import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { slugify } from "@/lib/slugify";

const contentDirectory = path.join(process.cwd(), "content", "articles");

export const categories = [
  {
    slug: "workwear",
    label: "Workwear",
    navLabel: "Workwear",
    kicker: "Origen utilitario",
    description:
      "Chaquetas de faena, denim, botas, chambray y el imaginario industrial que todavía estructura buena parte del menswear.",
  },
  {
    slug: "vintage-americana",
    label: "Vintage Americana",
    navLabel: "Americana",
    kicker: "Archivo americano",
    description:
      "De la iconografía del Oeste al denim japonés, una lectura del mito americano y sus reinterpretaciones contemporáneas.",
  },
  {
    slug: "military-heritage",
    label: "Military Heritage",
    navLabel: "Militaria",
    kicker: "Rastro militar",
    description:
      "Prendas nacidas para la función que acabaron definiendo códigos de estilo civil: parkas, chinos, flight jackets y más.",
  },
  {
    slug: "elevated-casual",
    label: "Elevated Casual",
    navLabel: "Elevated Casual",
    kicker: "Casual afinado",
    description:
      "El terreno donde conviven Aaron Levine, el sportswear civilizado y una noción más madura de la ropa cotidiana.",
  },
  {
    slug: "ivy",
    label: "Ivy",
    navLabel: "Ivy",
    kicker: "Tradición colegial",
    description:
      "Soft tailoring, mocasines, oxford cloth y el largo viaje de un uniforme universitario convertido en lenguaje global.",
  },
] as const;

export type Category = (typeof categories)[number];
export type CategorySlug = Category["slug"];

type ArticleFrontmatter = {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  readTime: string;
  category: CategorySlug;
  tags: string[];
  heroImage: string;
  heroAlt: string;
  relatedSlugs: string[];
  featured?: boolean;
};

export type ArticleSummary = ArticleFrontmatter & {
  categoryLabel: string;
};

export type ArticleEntry = {
  metadata: ArticleSummary;
  content: React.ReactNode;
  sections: ArticleSection[];
};

export type ArticleSection = {
  id: string;
  title: string;
  level: 2 | 3;
};

function isCategorySlug(value: string): value is CategorySlug {
  return categories.some((category) => category.slug === value);
}

function getCategory(slug: CategorySlug) {
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    throw new Error(`Unknown category slug: ${slug}`);
  }

  return category;
}

function normalizeFrontmatter(
  source: Partial<ArticleFrontmatter>,
  fileSlug: string,
): ArticleSummary {
  if (!source.title || !source.excerpt || !source.publishedAt || !source.readTime) {
    throw new Error(`Missing required frontmatter in ${fileSlug}.mdx`);
  }

  if (!source.category || !isCategorySlug(source.category)) {
    throw new Error(`Invalid category in ${fileSlug}.mdx`);
  }

  if (!source.heroImage || !source.heroAlt) {
    throw new Error(`Missing hero image fields in ${fileSlug}.mdx`);
  }

  const slug = source.slug ?? fileSlug;
  const category = getCategory(source.category);

  return {
    title: source.title,
    slug,
    excerpt: source.excerpt,
    publishedAt: source.publishedAt,
    readTime: source.readTime,
    category: source.category,
    tags: source.tags ?? [],
    heroImage: source.heroImage,
    heroAlt: source.heroAlt,
    relatedSlugs: source.relatedSlugs ?? [],
    featured: source.featured ?? false,
    categoryLabel: category.label,
  };
}

async function readSource(slug: string) {
  return fs.readFile(path.join(contentDirectory, `${slug}.mdx`), "utf8");
}

function extractArticleSections(source: string): ArticleSection[] {
  const { content } = matter(source);

  return content
    .split("\n")
    .map((line) => line.match(/^(##|###)\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      id: slugify(match[2].trim()),
      title: match[2].trim(),
      level: match[1].length as 2 | 3,
    }));
}

export const getAllArticles = cache(async (): Promise<ArticleSummary[]> => {
  const files = await fs.readdir(contentDirectory);

  const articles = await Promise.all(
    files
      .filter((file) => file.endsWith(".mdx"))
      .map(async (file) => {
        const slug = file.replace(/\.mdx$/, "");
        const source = await readSource(slug);
        const { data } = matter(source);

        return normalizeFrontmatter(data as Partial<ArticleFrontmatter>, slug);
      }),
  );

  return articles.sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  );
});

export const getFeaturedArticle = cache(async () => {
  const articles = await getAllArticles();

  return articles.find((article) => article.featured) ?? articles[0];
});

export const getLatestArticles = cache(async (limit = 4) => {
  const articles = await getAllArticles();

  return articles.slice(0, limit);
});

export const getArticlesByCategory = cache(
  async (categorySlug: CategorySlug, limit?: number) => {
    const articles = await getAllArticles();
    const matches = articles.filter((article) => article.category === categorySlug);

    return typeof limit === "number" ? matches.slice(0, limit) : matches;
  },
);

export const getArticleBySlug = cache(
  async (slug: string): Promise<ArticleEntry | null> => {
    try {
      const source = await readSource(slug);
      const sections = extractArticleSections(source);
      const { content, frontmatter } = await compileMDX<Partial<ArticleFrontmatter>>({
        source,
        components: mdxComponents,
        options: {
          parseFrontmatter: true,
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      });

      return {
        metadata: normalizeFrontmatter(frontmatter, slug),
        content,
        sections,
      };
    } catch {
      return null;
    }
  },
);

export async function getRelatedArticles(article: ArticleSummary) {
  const articles = await getAllArticles();

  const explicitRelated = article.relatedSlugs
    .map((slug) => articles.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is ArticleSummary => Boolean(candidate));

  if (explicitRelated.length > 0) {
    return explicitRelated;
  }

  return articles
    .filter(
      (candidate) =>
        candidate.slug !== article.slug && candidate.category === article.category,
    )
    .slice(0, 3);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function getCategoryFromSlug(slug: string) {
  if (!isCategorySlug(slug)) {
    return null;
  }

  return getCategory(slug);
}
