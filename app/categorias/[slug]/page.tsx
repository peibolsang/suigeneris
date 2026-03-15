import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import {
  categories,
  getArticlesByCategory,
  getCategoryFromSlug,
} from "@/lib/content";

export const dynamic = "force-static";
export const dynamicParams = false;

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryFromSlug(slug);

  if (!category) {
    return {};
  }

  return {
    title: category.label,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryFromSlug(slug);

  if (!category) {
    notFound();
  }

  const articles = await getArticlesByCategory(category.slug);

  return (
    <main className="pb-12 pt-8">
      <section className="panel p-6 md:p-8">
        <div className="grid gap-6 border-b border-[var(--line)] pb-6 lg:grid-cols-[0.7fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow">{category.kicker}</p>
            <h1 className="mt-3 font-display text-[4.2rem] leading-none tracking-[-0.06em]">
              {category.label}
            </h1>
          </div>
          <p className="max-w-3xl text-lg leading-8 text-[var(--muted)]">
            {category.description}
          </p>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article, index) => (
            <ArticleCard
              key={article.slug}
              article={article}
              priority={index === 0}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
