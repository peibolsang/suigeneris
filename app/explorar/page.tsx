import type { Metadata } from "next";
import { StoryTypeRow } from "@/components/story-type-row";
import { getAllArticles, storyTypes } from "@/lib/content";

export const metadata: Metadata = {
  title: "Explorar",
  description:
    "Un mapa del archivo por tipo de historia: lo básico, historia, variantes, iconos, cómo llevarlo y opinión.",
};

export default async function ExplorePage() {
  const articles = await getAllArticles();
  const storyTypeSummaries = storyTypes.map((storyType) => ({
    ...storyType,
    articleCount: articles.filter((article) => article.storyType === storyType.label)
      .length,
  }));

  return (
    <main className="pb-12 pt-8">
      <section className="panel p-6 md:p-8">
        <div className="max-w-4xl">
          <p className="container-label">Explorar</p>
          <p className="mt-3 max-w-3xl text-lg leading-[1.65] tracking-[-0.01em] text-[var(--muted)]">
            Una entrada al archivo por tipo editorial. Aquí las historias se
            ordenan por la clase de lectura que proponen: puertas de entrada,
            genealogías, variantes, iconos, criterios de uso y tesis.
          </p>
        </div>

        <div className="mt-8 border-t border-[var(--line)]" />

        <div className="mt-5">
          {storyTypeSummaries.map((storyType) => (
            <StoryTypeRow
              key={storyType.slug}
              label={storyType.label}
              description={storyType.description}
              href={`/explorar/${storyType.slug}`}
              articleCount={storyType.articleCount}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
