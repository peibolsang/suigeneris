import { ArrowRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";

type StoryTypeRowProps = {
  label: string;
  description: string;
  href: string;
  articleCount: number;
};

export function StoryTypeRow({
  label,
  description,
  href,
  articleCount,
}: StoryTypeRowProps) {
  const countLabel = `${articleCount} ${articleCount === 1 ? "historia" : "historias"}`;

  return (
    <article className="archive-row grid gap-5 py-5 lg:grid-cols-[minmax(180px,0.38fr)_minmax(0,1fr)] lg:gap-8">
      <div className="flex items-start justify-between gap-4 border border-[var(--line)] bg-white p-5">
        <div>
          <p className="font-sans text-[0.72rem] uppercase tracking-[0.22em] text-[var(--muted)]">
            Tipo editorial
          </p>
          <p className="mt-3 font-display text-[2rem] leading-[0.95] tracking-[-0.04em]">
            {label}
          </p>
        </div>
        <p className="pt-1 font-sans text-[0.72rem] uppercase tracking-[0.2em] text-[var(--accent)]">
          {countLabel}
        </p>
      </div>

      <div className="flex flex-col justify-center">
        <p className="max-w-3xl text-[1.04rem] leading-[1.6] tracking-[-0.01em] text-[var(--muted)]">
          {description}
        </p>

        <Link
          href={href}
          className="mt-5 inline-flex items-center gap-2 self-start border border-[var(--line)] bg-white px-4 py-3 font-sans text-xs uppercase tracking-[0.2em] text-[var(--foreground)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          Ver historias
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
