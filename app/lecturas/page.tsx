import type { Metadata } from "next";
import { ArchiveStoryRow } from "@/components/archive-story-row";
import { getAllArticles } from "@/lib/content";
import { createPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-static";

export const metadata: Metadata = createPageMetadata({
  title: "Lecturas",
  description:
    "Todo el archivo de Sui géneris reunido en orden cronológico, de lo más reciente a lo más antiguo.",
  path: "/lecturas",
});

export default async function ReadingsPage() {
  const articles = await getAllArticles();

  return (
    <main className="pb-12 pt-8">
      <section className="panel p-6 md:p-8">
        <div className="max-w-4xl">
          <p className="container-label">Todo</p>
          <p className="mt-3 max-w-3xl text-lg leading-[1.65] tracking-[-0.01em] text-[var(--muted)]">
            Un archivo cronológico para recorrer el sitio completo sin pasar por
            categorías. Las piezas más recientes aparecen primero, seguidas por
            el resto del archivo editorial.
          </p>
        </div>

        <div className="mt-8 border-t border-[var(--line)]" />

        <div className="mt-5">
          {articles.map((article, index) => (
            <ArchiveStoryRow
              key={article.slug}
              article={article}
              priority={index < 2}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
