# PRD: Popular Articles for Sui géneris

## Summary

Implement a Redis-backed popularity system for `Sui géneris` so the homepage `Lo + popular` panel reflects real article views instead of recent editorial picks.

The system should:

- count views only for article detail pages
- rank articles by lifetime views
- power the homepage `Lo + popular` shelf from real counts
- optionally expose `Popular #n` metadata on article pages
- preserve counts when article slugs change
- degrade safely when Redis is unavailable

This PRD is specific to the current `Sui géneris` codebase:

- local MDX articles in `content/articles`
- canonical article routes at `/articulos/[slug]`
- editorial featured story already handled separately on the homepage
- `POPULARITY_NAMESPACE=suigeneris`

## Current Site Behavior

### Homepage

- The homepage already has a visual slot labeled `Lo + popular` in [app/page.tsx](/Users/pablo/Development/workspace/suigeneris/app/page.tsx).
- That shelf is currently not popularity-driven.
- It renders the latest non-featured articles from the local content layer.
- The featured article remains editorial and should stay independent from popularity logic.

### Article Pages

- Article pages are statically generated from MDX and rendered at `/articulos/[slug]`.
- There is currently no article-view tracking endpoint.
- There is currently no popularity badge or rank metadata on the article page.

### Analytics

- The app already includes Vercel Web Analytics in [app/layout.tsx](/Users/pablo/Development/workspace/suigeneris/app/layout.tsx).
- That integration is useful for dashboards and observability.
- It should not be treated as the render-time source of truth for the homepage popularity shelf.

## Problem

The current `Lo + popular` label promises reader momentum, but the implementation is just a recent-articles list.

The site needs a lightweight popularity layer that:

- turns real article page visits into a ranking signal
- keeps the content model simple
- avoids counting homepage traffic or prefetches as reads
- fits the mostly server-rendered architecture already in the repo

## Goals

- Track views for article detail pages only.
- Rank articles by lifetime view count.
- Fill the homepage `Lo + popular` shelf with the top 3 ranked articles.
- Exclude articles with `0` views from the popular shelf.
- Preserve popularity across slug changes.
- Keep the homepage read-only with respect to popularity storage.
- Allow local development to exercise the feature without polluting counts.
- Keep the rest of the site working if Redis is unavailable.

## Non-Goals

- Unique-visitor analytics
- Time-windowed popularity such as "this week"
- Popularity by category, tag, or story type
- Exact public view counts in the UI
- Perfect bot detection
- Distributed rate limiting across many server instances
- Replacing Vercel Analytics

## Product Decisions

### 1. Homepage UX

- Keep the existing homepage layout.
- Do not introduce a `Featured` / `Popular` toggle.
- The left-side featured story remains editorial.
- The right-side `Lo + popular` panel becomes the dynamic popularity shelf.
- The shelf shows at most 3 articles in backend ranking order.
- If fewer than 3 articles have non-zero views, fill the remainder with the current recent-article fallback.

### 2. Article Page UX

- Popularity is secondary to the editorial reading experience.
- Phase 1 only requires the homepage shelf.
- Phase 2 may add a small `Popular #n` badge on article pages when the article is currently in the top set.
- Exact counts should not be shown publicly.

### 3. Identity Model

- Do not use the full URL as the primary stored identity.
- Use a stable article identifier from frontmatter instead.
- Recommended field: `popularityId`.
- Slug-based routing remains unchanged.

Reason:

- this site owns its content files directly
- slugs may change over time
- domain names and route prefixes are not the real identity of an article

Fallback if we do not want a new frontmatter field immediately:

- use the current `slug` as the Redis member
- add `previousSlugs?: string[]` later if slug migration becomes necessary

Preferred direction:

- add `popularityId` and keep it immutable once assigned

## Technical Architecture

### Storage Model

Use Redis with two data structures:

1. Per-article counter key

```text
site:suigeneris:article:views:<articleId>
```

2. Global ranking sorted set

```text
site:suigeneris:article:views:ranking
```

- member: `articleId`
- score: integer lifetime view count

Environment variable:

```text
POPULARITY_NAMESPACE=suigeneris
```

The effective keys should always be derived from `POPULARITY_NAMESPACE`, not hardcoded string literals spread across the app.

### Source of Truth

- Redis is the source of truth for popularity ranking.
- The MDX content layer remains the source of truth for article metadata.
- The homepage joins Redis ranking data with local article summaries from [lib/content.ts](/Users/pablo/Development/workspace/suigeneris/lib/content.ts).

### Read Tracking Flow

1. A reader opens `/articulos/[slug]`.
2. A small client component posts a tracking request after mount.
3. The API validates the article identity.
4. The API increments the Redis counter unless local-dev or abuse rules skip the write.
5. The API returns a lightweight popularity snapshot.

### Homepage Read Flow

1. The homepage loads article summaries from the local content layer.
2. The homepage reads the current top-ranked article IDs from Redis.
3. The homepage maps those IDs back to article summaries.
4. The homepage renders up to 3 popular articles without writing anything to Redis.

## Data Model Changes

### Frontmatter

Add an immutable popularity field to article frontmatter:

```yaml
popularityId: "aaron-levine-elegancia-casual"
```

Requirements:

- unique across all articles
- required for all published articles
- immutable after introduction
- defaults to the current slug during the migration/backfill phase

Optional future field for slug migration support:

```yaml
previousSlugs:
  - "aaron-levine-club-monaco"
```

### Content Layer

Update [lib/content.ts](/Users/pablo/Development/workspace/suigeneris/lib/content.ts) so article summaries expose:

- `slug`
- `title`
- `publishedAt`
- `excerpt`
- `heroImage`
- `heroAlt`
- `category`
- `categoryLabel`
- `popularityId`

## Backend Components

### `lib/article-popularity.ts`

Core responsibilities:

- build Redis keys from `POPULARITY_NAMESPACE`
- validate tracked article identities
- increment article views
- read the current popularity snapshot for one article
- read the top popular articles for the homepage
- migrate popularity when article identity changes

Recommended exports:

- `getPopularityNamespace()`
- `trackArticleView(articleId)`
- `getArticlePopularitySnapshot(articleId)`
- `getPopularArticleIds(limit?)`
- `getPopularArticles(articles, limit?)`
- `syncArticlePopularity({ currentId, previousId })`

### `lib/content.ts`

Responsibilities to extend:

- parse `popularityId` from frontmatter
- expose a lightweight popularity catalog keyed by `popularityId`
- provide article metadata needed to map ranked IDs back into UI cards

### `app/api/article-views/route.ts`

This is the write-side tracking endpoint.

Responsibilities:

- accept JSON input with `articleId`
- reject malformed payloads
- validate the `articleId` against the local article catalog
- apply same-origin and bot filtering
- apply a cooldown rule
- increment or skip increment depending on environment rules
- return the current popularity snapshot

## API Contract

### Request

```http
POST /api/article-views
Content-Type: application/json
```

```json
{
  "articleId": "aaron-levine-elegancia-casual"
}
```

### Success Response

```json
{
  "enabled": true,
  "tracked": true,
  "popularRank": 2,
  "isPopular": true
}
```

Notes:

- `tracked: false` can happen when the request is intentionally not counted.
- `popularRank` is `null` when the article is outside the current popular set.
- `readCount` is intentionally omitted from the public contract for now.

### Disabled Response

```json
{
  "enabled": false
}
```

## Ranking Rules

Canonical ranking order:

1. lifetime views descending
2. published date descending
3. title ascending
4. slug ascending

This shared ranking path must be used by:

- homepage popular ordering
- optional article-page `Popular #n`

Without one canonical tie-breaker path, the homepage order and article badge can disagree.

## Request Hardening

Use pragmatic controls, not a heavy anti-abuse system.

### Same-Origin Checks

- In production, only count requests that appear to come from the same site context.
- Check `origin` and `referer` when present.
- Use `sec-fetch-site` as an additional hint when available.

### Bot Filtering

- Skip obvious bots and headless agents based on `user-agent`.

### Cooldown

- Throttle repeated views in-memory per `IP + articleId`.
- Initial cooldown window: 30 minutes.

Known limitation:

- this is process-local memory
- it is not a distributed rate limiter

## Local Development Behavior

Environment flag:

```text
LOCAL_DEV=1
```

Truthy values:

- `1`
- `true`
- `yes`
- `on`

Behavior:

- when `LOCAL_DEV` is truthy, tracking returns a snapshot only
- Redis counters are not incremented
- the homepage can still read and render existing popularity data

## Redis Failure Behavior

If Redis is unavailable:

- the tracking endpoint returns `enabled: false`
- the homepage resolves the popular shelf from fallback content
- article pages render normally
- no route should fail just because popularity storage is down

Redis connection handling must not permanently poison the process after one failed attempt. Later requests should retry.

## Caching and Freshness

- The popular shelf does not need sub-second freshness.
- The target is "fresh within a few minutes," not "live on every request."
- Prefer a small server-side cache or revalidation window over expensive uncached Redis reads on every homepage request.
- The homepage must remain read-only with respect to popularity storage.

## Migration and Lifecycle

### Initial Backfill

- Add `popularityId` to every existing article.
- Default each value to the current slug for the initial rollout.
- Backfill zero-state Redis entries only if operationally useful; this is optional because zero-view entries should not appear in ranking anyway.

### Manual Seed Script

Generate a one-off script to seed Redis with initial popularity data for a selected subset of `Sui géneris` articles.

Recommended path:

```text
scripts/seed-popularity.ts
```

Purpose:

- create Redis entries for selected articles before or during rollout
- allow manual import of known view counts provided outside the app
- make the initial `Lo + popular` shelf usable before organic tracking has accumulated enough data

Input shape:

- a checked-in array of `{ articleId, viewCount }` records
- `articleId` must match `popularityId`
- only positive `viewCount` rows should be written
- the generation step may start from a manual comma-separated `articleId=viewCount` list provided by the editor and convert it into the checked-in seed payload

Script responsibilities:

- load the local article popularity catalog from the content layer
- validate that every provided `articleId` exists
- reject duplicate `articleId` entries instead of silently merging them
- write `site:suigeneris:article:views:<articleId>` string keys
- upsert matching members in `site:suigeneris:article:views:ranking`
- avoid writing unknown article IDs
- print a summary of inserted and skipped rows

Suggested behavior:

- use absolute replacement for seeded counts, not incremental adds, because the input is a backfill source of truth
- support a dry-run mode before mutating Redis
- be safe to run more than once for the same input

The manual counts table will be supplied separately and then converted into the script input payload.

Seed data generation requirements:

- parse an editor-provided string in the form `article-a=12,article-b=4,...`
- trim whitespace around commas and values
- coerce counts to integers
- reject negative values, `0`, non-integers, unknown article IDs, and duplicate article IDs
- emit a normalized seed payload that can be copied directly into `scripts/seed-popularity.ts`

Approved initial seed input for `Sui géneris`:

```text
carpenter-chef-painter-fatigue-pierna-recta=2,sashiko-reparacion-textil-y-menswear=1,chore-coat-workwear-fundacional=1,algodon-fibra-larga-origen-calidad=2,denim-japones-y-mito-americano=2,m65-legado-civil=1,aaron-levine-elegancia-casual=2,ivy-ocbd-y-loafers=1,chambray-y-fatiga=2,wrangler-13mwz-icono-vaquero=3,algodon-sarga-denim-canvas-duck-chambray=1,dirty-dozen-relojes-militares-y-menswear=1,sudaderas-crewneck-triangulo-cuello=3,champion-reverse-weave-hoodies=2,cone-mills-white-oak-gustin-deadstock=5,buzz-rickson-atencion-al-detalle=5,camisetas-loopwheeled-merz-whitesville=7,donegal-tweed-neps-y-cultura-textil=2,trucker-jackets-type-1-2-3=7,german-army-trainers=3,tartanes-de-casas-barbour-baracuta-y-otras=1,mcgregor-drizzler-eisenhower=1,n1-deck-jacket-y-version-rll=3,rl67-jacket-importancia-menswear=2,g1-leather-jacket=1,woolrich-arctic-parka-frio-icono-civil=2
```

Normalized seed payload to embed in `scripts/seed-popularity.ts`:

```ts
const seedCounts = [
  { articleId: "carpenter-chef-painter-fatigue-pierna-recta", viewCount: 2 },
  { articleId: "sashiko-reparacion-textil-y-menswear", viewCount: 1 },
  { articleId: "chore-coat-workwear-fundacional", viewCount: 1 },
  { articleId: "algodon-fibra-larga-origen-calidad", viewCount: 2 },
  { articleId: "denim-japones-y-mito-americano", viewCount: 2 },
  { articleId: "m65-legado-civil", viewCount: 1 },
  { articleId: "aaron-levine-elegancia-casual", viewCount: 2 },
  { articleId: "ivy-ocbd-y-loafers", viewCount: 1 },
  { articleId: "chambray-y-fatiga", viewCount: 2 },
  { articleId: "wrangler-13mwz-icono-vaquero", viewCount: 3 },
  { articleId: "algodon-sarga-denim-canvas-duck-chambray", viewCount: 1 },
  { articleId: "dirty-dozen-relojes-militares-y-menswear", viewCount: 1 },
  { articleId: "sudaderas-crewneck-triangulo-cuello", viewCount: 3 },
  { articleId: "champion-reverse-weave-hoodies", viewCount: 2 },
  { articleId: "cone-mills-white-oak-gustin-deadstock", viewCount: 5 },
  { articleId: "buzz-rickson-atencion-al-detalle", viewCount: 5 },
  { articleId: "camisetas-loopwheeled-merz-whitesville", viewCount: 7 },
  { articleId: "donegal-tweed-neps-y-cultura-textil", viewCount: 2 },
  { articleId: "trucker-jackets-type-1-2-3", viewCount: 7 },
  { articleId: "german-army-trainers", viewCount: 3 },
  { articleId: "tartanes-de-casas-barbour-baracuta-y-otras", viewCount: 1 },
  { articleId: "mcgregor-drizzler-eisenhower", viewCount: 1 },
  { articleId: "n1-deck-jacket-y-version-rll", viewCount: 3 },
  { articleId: "rl67-jacket-importancia-menswear", viewCount: 2 },
  { articleId: "g1-leather-jacket", viewCount: 1 },
  { articleId: "woolrich-arctic-parka-frio-icono-civil", viewCount: 2 },
] as const;
```

### Slug Change

If an article slug changes but `popularityId` stays the same:

- no popularity migration is needed
- routing changes do not affect ranking state

If article identity itself changes and `popularityId` must be replaced:

- call `syncArticlePopularity({ currentId, previousId })`
- merge the old count into the new member
- remove the stale ranking member and counter key

## Acceptance Criteria

- Opening an article page increments its Redis-backed count unless `LOCAL_DEV` is truthy.
- The homepage `Lo + popular` shelf shows up to 3 ranked articles with views greater than zero.
- The homepage does not write to Redis.
- If no articles have any views yet, the shelf falls back to the current recent-article behavior.
- A one-off seed script can create initial Redis counts for selected articles using `POPULARITY_NAMESPACE=suigeneris`.
- Redis outages do not break the rest of the site.
- Repeated rapid requests for the same article from the same IP do not increment indefinitely inside the cooldown window.
- Slug changes do not lose popularity state when `popularityId` remains stable.

## Implementation Notes for This Repo

- Keep the homepage panel structure in [app/page.tsx](/Users/pablo/Development/workspace/suigeneris/app/page.tsx); only swap its data source.
- Add the tracking client component only on article pages in [app/articulos/[slug]/page.tsx](/Users/pablo/Development/workspace/suigeneris/app/articulos/[slug]/page.tsx).
- Keep the rest of the app server-rendered; do not widen the client boundary unnecessarily.
- Prefer direct integration with the existing local MDX content model instead of building a separate article database.

## Future Improvements

- rolling-window rankings such as 7-day popularity
- distributed cooldown in Redis
- editorial allow/block lists for popularity inclusion
- internal admin view for current counts and ranks
- optional article-page `Popular #n` badge once the homepage shelf is established
