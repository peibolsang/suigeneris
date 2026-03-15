import { ArrowRightIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { CategoryFeature } from "@/components/category-feature";
import { getPopularArticles } from "@/lib/article-popularity";
import {
  getArticlesByCategory,
  getFeaturedArticle,
  getLatestArticles,
  categories,
} from "@/lib/content";

export default async function Home() {
  const [featuredArticle, latestArticles, popularArticles, categoryRows] =
    await Promise.all([
      getFeaturedArticle(),
      getLatestArticles(4),
      getPopularArticles(3),
      Promise.all(
        categories.map(async (category) => ({
          category,
          articles: await getArticlesByCategory(category.slug, 2),
        })),
      ),
    ]);
  const leadArticles = latestArticles
    .filter((article) => article.slug !== featuredArticle.slug)
    .slice(0, 3);
  const fallbackPopularArticles = leadArticles.filter(
    (article) =>
      article.slug !== featuredArticle.slug &&
      !popularArticles.some((popularArticle) => popularArticle.slug === article.slug),
  );
  const displayPopularArticles = [
    ...popularArticles,
    ...fallbackPopularArticles,
  ].slice(0, 3);

  return (
    <main className="pb-12 pt-6">
      <section
        id="historia-destacada"
        className="grid gap-6 lg:grid-cols-[1.28fr_0.82fr]"
      >
        <article className="panel overflow-hidden p-5 md:p-6">
          <div className="mb-4">
            <p className="container-label">Destacada</p>
          </div>
          <article className="group overflow-hidden border border-[var(--line)] bg-white shadow-[var(--shadow)]">
            <div className="relative m-3 aspect-[16/10] overflow-hidden">
              <Image
                src={featuredArticle.heroImage}
                alt={featuredArticle.heroAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover sepia-[0.12] transition duration-700 group-hover:scale-[1.02]"
              />
            </div>
            <div className="px-5 pb-5 md:px-6 md:pb-6">
              <div className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.24em] text-[var(--muted)]">
                <span>{featuredArticle.publishedLabel}</span>
                <span aria-hidden="true">•</span>
                <span className="font-sans text-[var(--accent)]">
                  {featuredArticle.categoryLabel}
                </span>
              </div>
              <Link
                href={`/articulos/${featuredArticle.slug}`}
                className="mt-3 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
              >
                <h1 className="max-w-4xl font-display text-[3.3rem] leading-[0.9] tracking-[-0.06em] text-balance transition-colors group-hover:text-[var(--accent)] sm:text-[4.6rem]">
                  {featuredArticle.title}
                </h1>
              </Link>
              <p className="mt-4 max-w-3xl text-[1.08rem] leading-[1.52] tracking-[-0.012em] text-[var(--muted)]">
                {featuredArticle.excerpt}
              </p>
              <Link
                href={`/articulos/${featuredArticle.slug}`}
                className="mt-5 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.24em] text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
              >
                Leer más
                <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </article>
        </article>

        <aside className="grid gap-6">
          <section
            id="articulos-populares"
            className="panel flex h-full flex-col p-5 md:p-6"
          >
            <div>
              <h2 className="container-label">Lo + popular</h2>
            </div>
            <div className="mt-5 flex flex-1 flex-col justify-between gap-4">
              {displayPopularArticles.map((article) => (
                <article
                  key={article.slug}
                  className="group border border-[var(--line)] bg-white p-4 shadow-[var(--shadow)] transition-colors hover:border-[var(--line-strong)] hover:bg-white"
                >
                  <div className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.22em] text-[var(--muted)]">
                    {"popularRank" in article ? (
                      <>
                        <span className="font-sans text-[var(--accent)]">
                          Popular #{article.popularRank}
                        </span>
                        <span aria-hidden="true">•</span>
                      </>
                    ) : null}
                    <span>{article.publishedLabel}</span>
                    <span aria-hidden="true">•</span>
                    <span className="font-sans text-[var(--accent)]">
                      {article.categoryLabel}
                    </span>
                  </div>
                  <Link
                    href={`/articulos/${article.slug}`}
                    className="mt-3 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--accent)]"
                  >
                    <h3 className="font-display text-[2.2rem] leading-[0.94] tracking-[-0.045em] transition-colors group-hover:text-[var(--accent)]">
                      {article.title}
                    </h3>
                  </Link>
                  <p className="mt-3 max-w-xl text-base leading-[1.5] tracking-[-0.01em] text-[var(--muted)]">
                    {article.excerpt}
                  </p>
                  <Link
                    href={`/articulos/${article.slug}`}
                    className="mt-4 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.24em] text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--accent)]"
                  >
                    Leer más
                    <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <section id="ultimas-historias" className="story-grid mt-8 panel p-5 md:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="container-label">Lo último</p>
          <Link
            href="/lecturas"
            className="inline-flex items-center gap-2 self-start font-sans text-xs uppercase tracking-[0.24em] text-[var(--accent)] transition-colors hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--accent)]"
          >
            Ver todo
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {latestArticles.map((article, index) => (
            <ArticleCard
              key={article.slug}
              article={article}
              priority={index === 0}
              variant="stacked"
            />
          ))}
        </div>
      </section>

      <section id="archivo-tematico" className="mt-8 grid gap-6">
        {categoryRows.map(({ category, articles }) => (
          <CategoryFeature
            key={category.slug}
            category={category}
            articles={articles}
          />
        ))}
      </section>
    </main>
  );
}
