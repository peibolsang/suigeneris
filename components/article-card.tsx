import { ArrowRightIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import type { ArticleCatalogEntry } from "@/lib/content";

type ArticleCardProps = {
  article: ArticleCatalogEntry;
  priority?: boolean;
  variant?: "featured" | "stacked" | "compact";
};

export function ArticleCard({
  article,
  priority = false,
  variant = "stacked",
}: ArticleCardProps) {
  if (variant === "featured") {
    return (
      <article className="group">
        <Link href={`/articulos/${article.slug}`} className="block">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={article.heroImage}
              alt={article.heroAlt}
              fill
              priority={priority}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover sepia-[0.14] transition duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(18,12,7,0.78)] via-transparent to-[rgba(255,250,244,0.06)]" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-[rgba(255,245,235,0.96)] sm:p-6">
              <p className="font-sans text-[0.72rem] uppercase tracking-[0.28em] text-[rgba(255,221,194,0.8)]">
                {article.categoryLabel}
              </p>
              <h2 className="mt-3 max-w-2xl font-display text-5xl leading-[0.88] tracking-[-0.05em] text-balance sm:text-6xl">
                {article.title}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-[1.48] tracking-[-0.01em] text-[rgba(255,239,227,0.86)]">
                {article.excerpt}
              </p>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group flex h-full flex-col gap-4 border border-[var(--line)] bg-white p-4 shadow-[var(--shadow)] transition-all hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:bg-white">
        <div className="relative aspect-[1.2/1] overflow-hidden">
          <Image
            src={article.heroImage}
            alt={article.heroAlt}
            fill
            sizes="(max-width: 768px) 100vw, 24vw"
            className="object-cover sepia-[0.18] transition duration-500 group-hover:scale-[1.04]"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <p className="font-sans text-[0.72rem] uppercase tracking-[0.24em] text-[var(--muted)]">
            <span>{article.publishedLabel}</span>
            <span aria-hidden="true" className="mx-2 text-[var(--muted)]">
              •
            </span>
            <span className="text-[var(--accent)]">{article.categoryLabel}</span>
          </p>
          <Link
            href={`/articulos/${article.slug}`}
            className="mt-2 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--accent)]"
          >
            <h3 className="font-display text-3xl leading-none tracking-[-0.04em] transition-colors group-hover:text-[var(--accent)]">
              {article.title}
            </h3>
          </Link>
          <p className="mt-3 text-base leading-[1.5] tracking-[-0.01em] text-[var(--muted)]">
            {article.excerpt}
          </p>
          <Link
            href={`/articulos/${article.slug}`}
            className="mt-auto inline-flex items-center gap-2 pt-4 font-sans text-xs uppercase tracking-[0.24em] text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--accent)]"
          >
            Leer más
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col gap-4 border border-[var(--line)] bg-white p-4 shadow-[var(--shadow)] transition-all hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:bg-white">
      <div className="relative block aspect-[1.06/1] overflow-hidden">
        <Image
          src={article.heroImage}
          alt={article.heroAlt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover sepia-[0.18] transition duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.22em] text-[var(--muted)]">
        <span>{article.publishedLabel}</span>
        <span aria-hidden="true">•</span>
        <span className="font-sans text-[var(--accent)]">{article.categoryLabel}</span>
      </div>
      <div className="flex flex-1 flex-col">
        <Link
          href={`/articulos/${article.slug}`}
          className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--accent)]"
        >
          <h3 className="font-display text-[2.1rem] leading-[0.94] tracking-[-0.045em] transition-colors group-hover:text-[var(--accent)]">
            {article.title}
          </h3>
        </Link>
        <p className="mt-3 text-base leading-[1.5] tracking-[-0.01em] text-[var(--muted)]">
          {article.excerpt}
        </p>
        <Link
          href={`/articulos/${article.slug}`}
          className="mt-auto inline-flex items-center gap-2 pt-4 font-sans text-xs uppercase tracking-[0.24em] text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--accent)]"
        >
          Leer más
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
