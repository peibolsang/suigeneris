"use client";

import { startTransition, useEffect, useRef, useState } from "react";

type PopularitySnapshot = {
  enabled: boolean;
  tracked: boolean;
  popularRank: number | null;
  isPopular: boolean;
};

type ArticleViewTrackerProps = {
  articleId: string;
  trackingToken: string | null;
  initialSnapshot: PopularitySnapshot;
};

export function ArticleViewTracker({
  articleId,
  trackingToken,
  initialSnapshot,
}: ArticleViewTrackerProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) {
      return;
    }

    if (!trackingToken) {
      return;
    }

    hasTrackedRef.current = true;

    const controller = new AbortController();

    async function trackArticleView() {
      try {
        const response = await fetch("/api/article-views", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ articleId, token: trackingToken }),
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const nextSnapshot = (await response.json()) as PopularitySnapshot;

        startTransition(() => {
          setSnapshot(nextSnapshot);
        });
      } catch {}
    }

    void trackArticleView();

    return () => {
      controller.abort();
    };
  }, [articleId, trackingToken]);

  if (!snapshot.enabled || !snapshot.isPopular || snapshot.popularRank === null) {
    return null;
  }

  return (
    <>
      <span aria-hidden="true" className="font-sans text-[var(--accent)]">
        •
      </span>
      <span className="font-sans text-[var(--accent)]">
        Popular #{snapshot.popularRank}
      </span>
    </>
  );
}
