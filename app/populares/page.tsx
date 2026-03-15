import type { Metadata } from "next";
import { ArchiveStoryRow } from "@/components/archive-story-row";
import { getPopularArticles } from "@/lib/article-popularity";

export const metadata: Metadata = {
  title: "Lo + popular",
  description:
    "Las lecturas más visitadas de Sui géneris, ordenadas por popularidad real.",
};

export default async function PopularArticlesPage() {
  const popularArticles = await getPopularArticles();

  return (
    <main className="pb-12 pt-8">
      <section className="panel p-6 md:p-8">
        <div className="max-w-4xl">
          <p className="container-label">Lo + popular</p>
          <p className="mt-3 max-w-3xl text-lg leading-[1.65] tracking-[-0.01em] text-[var(--muted)]">
            Los artículos que más han gustado a los lectores. Aquí las piezas se muestran
            según su popularidad actual, no por cronología editorial.
          </p>
        </div>

        <div className="mt-8 border-t border-[var(--line)]" />

        <div className="mt-5">
          {popularArticles.length > 0 ? (
            popularArticles.map((article, index) => (
              <ArchiveStoryRow
                key={article.slug}
                article={article}
                priority={index < 2}
              />
            ))
          ) : (
            <p className="py-5 text-[1.04rem] leading-[1.6] tracking-[-0.01em] text-[var(--muted)]">
              Todavía no hay suficientes lecturas registradas para construir
              este archivo.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
