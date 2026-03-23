import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { ArticleToc } from "@/components/article-toc";
import { ArticleViewTracker } from "@/components/article-view-tracker";
import {
  createArticleTrackingToken,
  type PopularitySnapshot,
} from "@/lib/article-popularity";
import {
  formatDate,
  getAllArticles,
  getArticleBySlug,
  getCategoryFromSlug,
  getRelatedArticles,
} from "@/lib/content";
import {
  createPageMetadata,
  getAbsoluteUrl,
  getArticleUrl,
  getCategoryUrl,
  siteLanguage,
  siteName,
} from "@/lib/site-metadata";

export const dynamic = "force-static";
export const dynamicParams = false;

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const articles = await getAllArticles();

  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {};
  }

  return {
    ...createPageMetadata({
      title: article.metadata.title,
      description: article.metadata.excerpt,
      path: `/articulos/${article.metadata.slug}`,
      images: [article.metadata.heroImage],
      keywords: [
        ...article.metadata.tags,
        article.metadata.storyType,
        article.metadata.categoryLabel ?? "",
      ].filter(Boolean),
      openGraphType: "article",
      publishedTime: article.metadata.publishedAt,
    }),
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.metadata);
  const trackingToken = createArticleTrackingToken(article.metadata.popularityId);
  const articleUrl = getArticleUrl(article.metadata.slug);
  const category = article.metadata.category
    ? getCategoryFromSlug(article.metadata.category)
    : null;
  const breadcrumbItems = [
    {
      position: 1,
      name: siteName,
      item: getAbsoluteUrl("/"),
    },
    ...(category
      ? [
          {
            position: 2,
            name: category.label,
            item: getCategoryUrl(category.slug),
          },
        ]
      : []),
    {
      position: category ? 3 : 2,
      name: article.metadata.title,
      item: articleUrl,
    },
  ];
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.metadata.title,
      description: article.metadata.excerpt,
      image: [getAbsoluteUrl(article.metadata.heroImage)],
      datePublished: article.metadata.publishedAt,
      dateModified: article.metadata.publishedAt,
      inLanguage: siteLanguage,
      mainEntityOfPage: articleUrl,
      articleSection: article.metadata.categoryLabel ?? article.metadata.storyType,
      keywords: article.metadata.tags,
      author: {
        "@type": "Organization",
        name: siteName,
        url: getAbsoluteUrl("/"),
      },
      publisher: {
        "@type": "Organization",
        name: siteName,
        url: getAbsoluteUrl("/"),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems.map((item) => ({
        "@type": "ListItem",
        position: item.position,
        name: item.name,
        item: item.item,
      })),
    },
  ];
  const popularitySnapshot: PopularitySnapshot = trackingToken
    ? {
        enabled: true,
        tracked: false,
        popularRank: null,
        isPopular: false,
      }
    : {
        enabled: false,
        tracked: false,
        popularRank: null,
        isPopular: false,
      };

  return (
    <main className="pb-16 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="panel px-5 py-6 md:px-8 md:py-8">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            <span className="font-sans">{formatDate(article.metadata.publishedAt)}</span>
            <span aria-hidden="true" className="font-sans text-[var(--accent)]">
              •
            </span>
            <span className="font-sans">{article.metadata.readTime}</span>
            <ArticleViewTracker
              articleId={article.metadata.popularityId}
              trackingToken={trackingToken}
              initialSnapshot={popularitySnapshot}
            />
          </div>
          <h1 className="mt-5 max-w-5xl font-display text-[3.6rem] leading-[0.9] tracking-[-0.06em] text-balance md:text-[5.8rem]">
            {article.metadata.title}
          </h1>
          <p className="mt-5 max-w-3xl text-xl leading-[1.46] tracking-[-0.013em] text-[var(--muted)]">
            {article.metadata.excerpt}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {article.metadata.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <article className="article-body">{article.content}</article>
          <aside className="space-y-6">
            <ArticleToc sections={article.sections} />
          </aside>
        </div>
      </section>

      <section className="mt-8 panel p-5 md:p-6">
        <div className="mb-6 flex items-end justify-between gap-4 border-b border-[var(--line)] pb-4">
          <div>
            <p className="eyebrow">Lecturas relacionadas</p>
            <h2 className="mt-2 font-display text-5xl leading-none tracking-[-0.05em]">
              Sigue el hilo ...
            </h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {relatedArticles.map((relatedArticle) => (
            <ArticleCard
              key={relatedArticle.slug}
              article={relatedArticle}
              variant="compact"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
