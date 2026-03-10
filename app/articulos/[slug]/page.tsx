import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { ArticleToc } from "@/components/article-toc";
import {
  formatDate,
  getAllArticles,
  getArticleBySlug,
  getRelatedArticles,
} from "@/lib/content";

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
    title: article.metadata.title,
    description: article.metadata.excerpt,
    openGraph: {
      title: article.metadata.title,
      description: article.metadata.excerpt,
      images: [article.metadata.heroImage],
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.metadata);

  return (
    <main className="pb-16 pt-8">
      <section className="panel px-5 py-6 md:px-8 md:py-8">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            <span className="font-sans">{formatDate(article.metadata.publishedAt)}</span>
            <span aria-hidden="true" className="font-sans text-[var(--accent)]">
              •
            </span>
            <span className="font-sans">{article.metadata.readTime}</span>
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
              Seguir el hilo
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
