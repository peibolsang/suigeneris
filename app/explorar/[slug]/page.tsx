import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveStoryRow } from "@/components/archive-story-row";
import {
  getArticlesByStoryType,
  getStoryTypeFromSlug,
  storyTypes,
} from "@/lib/content";

export const dynamic = "force-static";
export const dynamicParams = false;

type StoryTypePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return storyTypes.map((storyType) => ({
    slug: storyType.slug,
  }));
}

export async function generateMetadata({
  params,
}: StoryTypePageProps): Promise<Metadata> {
  const { slug } = await params;
  const storyType = getStoryTypeFromSlug(slug);

  if (!storyType) {
    return {};
  }

  return {
    title: storyType.label,
    description: storyType.description,
  };
}

export default async function StoryTypePage({ params }: StoryTypePageProps) {
  const { slug } = await params;
  const storyType = getStoryTypeFromSlug(slug);

  if (!storyType) {
    notFound();
  }

  const articles = await getArticlesByStoryType(storyType.label);

  return (
    <main className="pb-12 pt-8">
      <section className="panel p-6 md:p-8">
        <div className="max-w-4xl">
          <p className="container-label whitespace-nowrap text-[0.86rem] tracking-[0.18em] sm:text-[0.92rem] sm:tracking-[0.22em] md:text-[0.96rem] md:tracking-[0.28em]">
            {storyType.label}
          </p>
          <p className="mt-3 max-w-none whitespace-nowrap text-lg leading-[1.65] tracking-[-0.01em] text-[var(--muted)]">
            {storyType.description}
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
