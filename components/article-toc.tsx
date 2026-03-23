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

    const sectionIds = new Set(sections.map((section) => section.id));
    const headingElements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (headingElements.length === 0) {
      return;
    }

    const updateFromHash = () => {
      const hashId = window.location.hash.replace(/^#/, "");

      if (!sectionIds.has(hashId)) {
        return;
      }

      setActiveId((currentId) => (currentId === hashId ? currentId : hashId));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) =>
              left.boundingClientRect.top - right.boundingClientRect.top,
          );

        const nextActiveId = visibleEntries[0]?.target.id;

        if (!nextActiveId) {
          return;
        }

        setActiveId((currentId) =>
          currentId === nextActiveId ? currentId : nextActiveId,
        );
      },
      {
        rootMargin: "-140px 0px -55% 0px",
        threshold: 0,
      },
    );

    headingElements.forEach((element) => observer.observe(element));
    updateFromHash();
    window.addEventListener("hashchange", updateFromHash);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", updateFromHash);
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
