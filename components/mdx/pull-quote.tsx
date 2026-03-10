import { QuoteIcon } from "@radix-ui/react-icons";
import type { ReactNode } from "react";

type PullQuoteProps = {
  children: ReactNode;
};

export function PullQuote({ children }: PullQuoteProps) {
  return (
    <blockquote className="mb-4 mt-4 grid gap-4 border border-[var(--line)] bg-white px-6 py-8 shadow-[var(--shadow)] first:mt-0 [&_p]:max-w-none [&_p]:font-display [&_p]:text-[1.7rem] [&_p]:leading-[1.02] [&_p]:tracking-[-0.042em] [&_p]:text-[var(--accent)]">
      <QuoteIcon
        aria-hidden="true"
        className="h-5 w-5 text-[var(--accent)]"
      />
      {children}
    </blockquote>
  );
}
