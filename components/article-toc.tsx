"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ArticleSection = {
  id: string;
  title: string;
  level: 2 | 3;
};

type ArticleTocProps = {
  sections: readonly ArticleSection[];
};

export function ArticleToc({ sections }: ArticleTocProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    if (sections.length === 0) {
      return;
    }

    const updateActiveId = () => {
      const scrollOffset = 160;
      let nextActiveId = sections[0].id;

      for (const section of sections) {
        const element = document.getElementById(section.id);

        if (element && element.getBoundingClientRect().top <= scrollOffset) {
          nextActiveId = section.id;
        }
      }

      setActiveId(nextActiveId);
    };

    updateActiveId();
    window.addEventListener("scroll", updateActiveId, { passive: true });
    window.addEventListener("hashchange", updateActiveId);

    return () => {
      window.removeEventListener("scroll", updateActiveId);
      window.removeEventListener("hashchange", updateActiveId);
    };
  }, [sections]);

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="xl:sticky xl:top-8">
      <div className="border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)]">
        <p className="eyebrow">Lectura guiada</p>
        <nav aria-label="Lectura guiada" className="mt-4">
          <ol className="grid gap-2">
            {sections.map((section) => {
              const isActive = section.id === activeId;

              return (
                <li key={section.id}>
                  <Link
                    href={`#${section.id}`}
                    className={`block border-l-2 py-1 pl-4 text-base leading-[1.45] tracking-[-0.01em] transition-colors ${
                      isActive
                        ? "border-[var(--accent)] text-[var(--foreground)]"
                        : "border-transparent text-[var(--muted)] hover:border-[var(--accent-soft)] hover:text-[var(--foreground)]"
                    } ${section.level === 3 ? "ml-3" : ""}`}
                  >
                    {section.title}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
