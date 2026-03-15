import { ArrowRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import type { ArticleCatalogEntry, Category } from "@/lib/content";

type CategoryFeatureProps = {
  category: Category;
  articles: ArticleCatalogEntry[];
};

export function CategoryFeature({
  category,
  articles,
}: CategoryFeatureProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="panel p-5 md:p-6">
      <div className="mb-6 grid gap-4 lg:grid-cols-[0.6fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow">Estilo destacado</p>
          <h2 className="mt-2 font-display text-5xl leading-none tracking-[-0.05em]">
            {category.label}
          </h2>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <p className="max-w-2xl text-base leading-[1.5] tracking-[-0.01em] text-[var(--muted)]">
            {category.description}
          </p>
          <Link
            href={`/categorias/${category.slug}`}
            className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.24em] text-[var(--accent)] transition-colors hover:text-[var(--foreground)]"
          >
            Ver archivo
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard
            key={article.slug}
            article={article}
            variant={articles.length === 1 ? "stacked" : "compact"}
          />
        ))}
      </div>
    </section>
  );
}
