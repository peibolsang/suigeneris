import { ArrowRightIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import type { ArticleCatalogEntry } from "@/lib/content";

type ArchiveStoryRowProps = {
  article: ArticleCatalogEntry;
  priority?: boolean;
};

export function ArchiveStoryRow({
  article,
  priority = false,
}: ArchiveStoryRowProps) {
  const hasCategory = Boolean(article.categoryLabel);

  return (
    <article className="archive-row group grid gap-5 py-5 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
      <div className="relative aspect-[1.28/0.86] overflow-hidden bg-white">
        <Image
          src={article.heroImage}
          alt={article.heroAlt}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 34vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-3 font-sans text-[0.72rem] uppercase tracking-[0.22em] text-[var(--muted)]">
          <span>{article.publishedLabel}</span>
          {hasCategory ? (
            <>
              <span aria-hidden="true">•</span>
              <span className="text-[var(--accent)]">{article.categoryLabel}</span>
            </>
          ) : null}
        </div>

        <Link
          href={`/articulos/${article.slug}`}
          className="mt-3 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          <h2 className="font-display text-[2.4rem] leading-[0.96] tracking-[-0.045em] text-balance transition-colors group-hover:text-[var(--accent)] sm:text-[2.85rem]">
            {article.title}
          </h2>
        </Link>

        <p className="mt-4 max-w-3xl text-[1.04rem] leading-[1.6] tracking-[-0.01em] text-[var(--muted)]">
          {article.excerpt}
        </p>

        <Link
          href={`/articulos/${article.slug}`}
          className="mt-5 inline-flex items-center gap-2 self-start font-sans text-xs uppercase tracking-[0.24em] text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          Leer más
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
