# Agent Notes

## 2026-03-10

- Created this file because the repository instructions require checking and updating it during each session.
- Confirmed the repo had no explicit policy making installed skills mandatory by trigger; updated `AGENTS.md` to add that guidance.
- `AGENT_NOTES.md` was missing, so future sessions should read this file before implementing changes.
- Built the first full editorial version of `Sui géneris` with a typed MDX content layer, category archives, and long-form article templates.
- `next-mdx-remote` plus `gray-matter` worked cleanly for local MDX content in the App Router without needing a heavier CMS setup.
- `next/font/google` was a bad fit for this restricted environment because build-time font fetching failed; local editorial font stacks are the safer default here.
- The default Turbopack production build failed in the sandbox because PostCSS could not spawn the required process, while `next build --webpack` completed successfully.
- MDX custom components should not blindly wrap `children` in block tags like `<p>` because MDX often already passes paragraph nodes, which creates invalid nested markup and hydration errors.
- For typography experiments, self-hosted font packages worked well: `@fontsource/playfair-display` for display headings and `geist/font/sans` for body/UI text kept the build local and reproducible.
- Geist needs tighter line-height than the earlier serif reading system, especially in large homepage/editorial copy blocks; reducing leading and adding slight negative tracking produces a denser, cleaner rhythm.
- The top of the landing page should distinguish clearly between content and framing: one explicit featured article, separate latest-reading links, and a small explanatory intro work better than pseudo-editorial text blocks that look like content but are not clickable.
- When the global page background is lightened, article-card fills must be rebalanced too; otherwise old warm-tinted card backgrounds look unintentionally orangey against the new page tone.
- User preference: do not run a full production build after every small change. For routine UI/copy/style tweaks, prefer lighter validation (for example lint only, or no validation if the change is trivial) and reserve full builds for riskier structural changes.
- Removing a specific editorial phrase from the header was a trivial copy-only change; no broader validation was necessary beyond confirming the source string location first.
- The current background works best when panels and cards shift cooler and slightly denser than the page; neutral stone-paper surfaces separate the typography more cleanly than translucent peach tones.
- Correction from user: the stone-paper experiment overshot. The preferred direction is simpler white cards against the existing page background.
- For header rhythm tweaks, reduce spacing by adjusting the shared header padding first; that is safer than changing page-level section spacing across routes.
- In fully clickable editorial cards, explicit CTA text can be redundant; removing it keeps the layout quieter when affordance is already clear.
- Reading time should stay on the article page, not on navigation cards or homepage listings; those surfaces read better when category alone handles the metadata cue.
- The `Lecturas recientes` header works better without supporting body copy; the grid itself already explains the section.
- Homepage container sections need one shared label treatment; using a slightly larger, bolder version of the `Historia destacada` eyebrow keeps section framing consistent without competing with the article titles.
- The shared container label can carry more authority than the default eyebrow; a bigger size and heavier weight improve hierarchy for panel-level headings.
- The `Últimas lecturas` container reads cleaner with just the section label; the helper sentence and divider were adding noise without adding navigation value.
- Container labels can be retitled without structural changes; keep the presentation stable when the user is only refining editorial framing.
- When a side column must align its first and last cards with a neighboring featured block, use a full-height flex column with `justify-between` rather than a simple stacked grid.
- The featured article category label reads better inside the card above the title than beside the container heading; that keeps metadata attached to content rather than to layout chrome.
- The `Últimos ensayos` section does not need a second display title under the container label; the extra heading only duplicates meaning and weakens the hierarchy.
- Once a section is reduced to a single container label, the divider under it often becomes unnecessary visual chrome and can be removed.
- On article pages, the `Etiquetas` sidebar box is expendable when tags are already present near the header; repeating them in the aside adds clutter without improving navigation.
- On article pages, aligning the sidebar box with the first media block requires removing the header divider gap and clearing the top margin on the first content element.
- For MDX media and pull quotes, first-element top alignment is more reliable when the components themselves use `first:mt-0`, because utility margins can override generic global resets.
- `Lectura guiada` should only exist if it is driven by real article headings; making it sticky and anchor-linked turns it from boilerplate into useful reading navigation.
- The article text column should use the full available width of its content track; narrow `max-width` limits make paragraphs break too early and visually misalign with full-width images and pull quotes.
- Landing-page surface hierarchy should stay simple: outer containers on `--panel`, nested navigation cards on `--card-surface-strong`.
- The sticky `Lectura guiada` box reads more crisply as a white utility card than as a muted surface.
- If a surface must read unmistakably white, use `bg-white` directly instead of a near-white theme token.
- Same rule for landing-page inner cards: when the user wants obvious white, use `bg-white` directly on the nested cards instead of a token.
- Theme consistency rule: page background stays unchanged, all outer editorial containers use `--panel`, and all nested media/utility/cards inside those containers should resolve to pure white.
- Article image captions read better as normal body-support text than as uppercase UI labels; avoid tracked all-caps for descriptive captions.
- Matching two white card types sometimes requires matching shadow treatment too, not just background color.
- The same applies on the landing page: if inner cards are meant to belong to the same white-card family as article media/utilities, give them the same shadow token.
- Category-style container cards below the homepage hero read cleaner without divider lines under their headings.
- For small directional link cues like `Ver archivo`, a compact Radix arrow works well and stays visually consistent with the rest of the UI.
- The lower homepage container cards can share one framing label when category-specific kickers feel too noisy; `Estilo destacado` works as a neutral common label.
- Pull quotes do not need large vertical isolation in this layout; tighter outer margins keep the reading flow denser and more controlled.
- For article quotes, a better balance is to keep the display face but reduce its size rather than switching the quote to body typography.
- Pull quotes can share the same accent color as the `Lectura guiada` label when they should read as highlighted editorial emphasis rather than as body text.
- The current quote scale works better smaller than `2rem`; reducing it improves continuity with the surrounding article rhythm while preserving the display face.
- After reduction, the quote scale still benefits from a slight step back up; `1.7rem` is a better balance here than `1.6rem`.
- Pull-quote cards fit this system better with square corners; the rounded shape felt too ornamental relative to the rest of the editorial surfaces.
- For pull quotes, a small Radix quote icon in the top-left creates a cleaner cue than relying on the text styling alone; keep the quote text below it.
- Article metadata above the title should stay minimal; date and reading time are enough, with a bullet separator for rhythm.
- Spanish copy quality needs a full-repo pass when accents are missing; the errors were spread across MDX frontmatter, headings, captions, and body paragraphs rather than isolated to one article.
- When adjusting editorial chronology, preserve the existing article order unless the user asks for a different ranking; here the dates were normalized to weekly intervals ending on March 10, 2026.
- Header whitespace under the logo is controlled by the shared header bottom padding; setting it to zero is the cleanest way to collapse that gap globally.
- The homepage recent-content section can be framed more broadly as `Últimas historias` when `ensayos` feels too narrow.
- Landing-page sub-cards benefit from a consistent `Leer más` footer using the same directional arrow language as `Ver archivo`.
- For row consistency on landing-page cards, make each card a full-height flex column and push the footer to the bottom; otherwise the text blocks feel optically misaligned even when the image sizes match.
- For article teaser sub-cards, do not make the whole card clickable when the user wants more precise affordances; restrict navigation to the title and `Leer más`.
- The same precise-link rule should apply to the featured homepage sub-card: image and card shell stay passive, while the title and `Leer más` carry navigation.
- Small brand-adjacent header copy like `Textiles con biografía` can take a semibold weight without needing any broader layout change.
- The logo tagline looks better centered to the logo lockup with tighter tracking; wide all-caps spacing was pushing it off-balance.
- For a stronger page break, the logo lockup can sit centered with a simple black divider line directly beneath the shared header.
- The perceived logo misalignment came from asymmetric transparent padding inside `logo.png`; adding a tiny image-level horizontal offset (`-0.6%`) produces true visual centering while preserving layout centering.
- Header dividers should use `var(--line)` to stay visually aligned with container card borders instead of introducing a separate black rule.
- For navigation expansion, keeping the header as a server component works well because it can derive menu destinations from the content model while delegating only the interactive dropdown behavior to a small client component.
- In the current IA, `Archivo` is redundant if it only repeats category browsing; keep header navigation focused on distinct intents such as taxonomy (`Explorar`) and editorial groupings (`Lecturas`).
- Title-system note: once the site has a few strong headline shapes, avoid slipping back into repeated `X: Y` or `de X a Y` constructions; headline variety is part of the editorial identity, not just copy polish.
- The same applies to `<subject> y ...` headlines: once they recur, they stop feeling like real titles and start reading like a formula.
- For menswear review requests, the strongest critiques should separate factual overstatement from merely vague prose: verify career chronology and stated influence, then judge whether the article teaches through garment, cloth, or silhouette detail.

## 2026-03-13

- For menswear review requests, the strongest editorial feedback distinguishes clearly between factual error and historical compression; concise findings with quoted passage references are more useful than broad prose notes.

## 2026-03-13

- For menswear review tasks, the strongest output comes from separating factual exposure from editorial thinness: some claims are not outright wrong, but they are compressed enough that they weaken trust and educational value.
- On denim topics, a quick check against primary or near-primary sources such as Levi's history material and Kurabo's company history is enough to flag when copy overstates mining, compresses chronology, or treats Japanese reproduction culture as a single undifferentiated move.

## 2026-03-14

- When generating a large article batch in parallel, preserve a single explicit publication-date schedule and reconcile it after the worker wave finishes; missing one file is less risky than silently leaving duplicate dates in the sequence.
- The site needs one global chronological archive route separate from category browsing; otherwise older stories become effectively undiscoverable once they fall off the homepage.
- Some recent article-image failures came from brittle Unsplash URL assumptions. Prefer direct `images.unsplash.com` URLs with stable IDs over looser Unsplash page or download links, which have been the source of several broken images.
- For educational fabric pieces in Spanish, avoid leaving core textile categories in English when a natural Spanish term exists; proper names like Supima or FoxFibre can stay, but the explanatory language should remain fully Spanish.
- On western and rodeo pieces, avoid flattening every trouser with room for a boot into a theatrical campana; often the more precise description is a recta or semi-recta pierna with enough apertura for bota.
- On brand-origin garments, the strongest menswear writing attributes contested origin stories to the brand or other named sources instead of presenting lore as courtroom fact.
- For cross-site editorial improvement passes, the safest gains come from adding one concrete historical or material qualifier at a time; small precision edits preserve cadence better than "improving" by rewriting whole paragraphs.
- When adding a second editorial taxonomy to the articles, keep it separate from the thematic `category`; a dedicated `storyType` frontmatter field avoids overloading the existing content model and leaves the UI free to adopt it later.
- When a second navigation axis is introduced, keep the existing thematic menu intact and add a separate entrypoint for the editorial taxonomy; in this site, `Estilos` and `Explorar` should stay distinct because they answer different browsing questions.
- For Vercel Analytics in an App Router project, the minimal integration is enough: install `@vercel/analytics` and mount `<Analytics />` once in `app/layout.tsx` so every route is covered without extra client plumbing.
- Short editorial labels work better in this header/home system than noun-heavy ones: removing repeated uses of `historias` made the navigation and section framing cleaner without changing information scent.
- For the story-type taxonomy, plural group labels read better in navigation than singular ones; `Iconos` is clearer as a browsing bucket than `Icono`.
- On the `/explorar/[slug]` pages, long descriptive copy in the container header should not be width-capped if the design intent is a single-line editorial subhead; `max-w-*` utilities were the actual cause of wrapping there.

## 2026-03-15

- Start every session in this repo by reading both `AGENTS.md` and `AGENT_NOTES.md`; the notes file carries real implementation constraints that are not obvious from the code alone.
- For codebase orientation, `lib/content.ts` is the highest-leverage entry point because it defines the editorial taxonomies, frontmatter contract, MDX compilation, sorting, related-content logic, and the helper APIs every route consumes.
- The app is intentionally mostly server-rendered. Keep client boundaries narrow unless interaction truly requires them; right now the meaningful client islands are the Radix navigation menu and the article table of contents.
- In this Next.js 16 codebase, dynamic route `params` are already modeled as `Promise<{ slug: string }>` and awaited inside pages and metadata. Follow that existing pattern unless the framework contract changes.
- For popularity features in this MDX-driven site, prefer a stable article identity such as `popularityId` over full URL keys; route slugs are presentation and can change without needing to move ranking state.
- For popularity backfills, keep the import data keyed by stable article identity and seed Redis via an explicit one-off script rather than encoding manual counts directly inside runtime code paths.
- For manual popularity imports, reject duplicate article IDs at parse time; silent last-write-wins behavior is too risky for editorial seed data.
- The initial editorial seed dataset for popularity has been chosen and documented in `temp/popular-posts-prd.md`; treat that file as the source of truth when generating the first Redis backfill script.
- For this repo, standalone CLI scripts should not import the full `lib/content.ts` runtime because that drags the MDX/Next compilation graph into plain Node execution; frontmatter-only validation scripts are safer and easier to run.
- Popularity cooldowns should be consumed only after a successful Redis write, not during request preflight, otherwise transient storage failures can suppress valid later reads.
- Enforce `popularityId` presence and uniqueness inside the content loader itself; catching identity mistakes while reading MDX is safer than discovering them later in the Redis layer.
- Popularity writes now rely on three production invariants together: a configured canonical origin (`SITE_URL`), a signed tracking token (`POPULARITY_TRACKING_SECRET`), and a Redis-backed cooldown keyed by article plus client fingerprint.
- Public popularity APIs should never expose raw counts when the UI only needs booleans and ranks; keep exact counts server-side for ranking and archives only.
- For this site’s performance profile, the highest-leverage optimization was replacing runtime directory scans and frontmatter parsing with a generated manifest that precomputes article catalogs, section headings, featured/latest slices, taxonomy buckets, and related-article fallback resolution at build time.
- Generated manifest data should be treated as readonly in the runtime facade. Using `as const` in the generated file is useful, but the consumer types must accept readonly arrays or the production TypeScript pass will fail.
- Article pages can stay fully static even with signed popularity tracking if the token is a stable HMAC of article identity rather than a timestamped per-request value; expiring tokens embedded in prerendered HTML will go stale after deploy.
- Popularity-backed routes should fail fast when Redis is unavailable during prerender. A short Redis connect timeout plus no reconnect loop keeps `/` and `/populares` build-safe and preserves the fallback UI instead of stalling static generation.
- If `package.json` wires `predev` or `prebuild` to the manifest generator, make sure `scripts/generate-content-manifest.ts` is actually present in the checkout; otherwise local startup fails immediately with `ERR_MODULE_NOT_FOUND`.
- After the manifest refactor, the static/dynamic split is cleaner: article, category, story-type, archive, and index routes can be explicitly static, while only the tracking API remains request-dynamic and the popularity shelves revalidate on a short interval.
- Route model recap: `/` is a composed homepage from `getHomePageContent()` plus optional popularity rankings, `/lecturas` is the chronological archive, `/categorias/[slug]` is thematic browsing, `/explorar` and `/explorar/[slug]` are editorial-taxonomy browsing, and `/articulos/[slug]` stays static while delegating view tracking to the API.
- Shell reminder: quote bracketed Next.js route paths in terminal commands (`'app/articulos/[slug]/page.tsx'`) because unquoted zsh globbing will fail before the file read even runs.
- The current style taxonomy can support uncategorized editorial pieces if `category` is made optional end-to-end in the manifest/runtime layer; when doing that, cards and homepage metadata rows need to suppress the style separator instead of rendering an empty bullet.
- For borderline mid-century sportswear pieces like the McGregor Drizzler, `Ivy` is the stronger primary style bucket than `Elevated Casual` in this repo’s current taxonomy.
- Orientation recap from this session: the fastest way to understand the app is `scripts/generate-content-manifest.ts` -> `lib/content-manifest.generated.ts` -> `lib/content.ts` -> route files in `app/`; that path explains how MDX frontmatter becomes static pages and archive slices.
- `README.md` is still the default Create Next App scaffold and does not describe the current editorial architecture, build step, or Redis-backed popularity feature, so rely on repo code and notes instead of the README when orienting quickly.

## 2026-03-22

- Current orientation snapshot: the live checkout is a manifest-driven editorial Next.js 16 app with 26 MDX articles, five thematic categories, and six story-type buckets powering both navigation and archive routes.
- The homepage composition currently comes from `getHomePageContent()` plus `getPopularArticles(3)`: one featured story, a latest grid, category sections, and a popularity shelf that falls back to recent stories when Redis-backed rankings are unavailable.
- The client surface is still intentionally narrow: the Radix navigation menu, the scroll-aware article table of contents, and the article-view tracker are the main islands; the rest of the app remains server-rendered.
- Repo-health note: `npm run lint` passed on this checkout, but the worktree already had unrelated modifications in `AGENT_NOTES.md`, `content/articles/chore-coat-workwear-fundacional.mdx`, and `lib/content-manifest.generated.ts`, so treat the tree as intentionally dirty when making future edits.
- Scroll-performance fix: the main jank came from the combination of a fixed fullscreen grain layer using `mix-blend-mode` and large translucent `.panel` containers using `backdrop-filter`. Keeping the grain baked into the page background and making panels visually opaque preserved the look while removing the heaviest per-frame compositing cost.
- Article-page follow-up: replacing the TOC's unthrottled `scroll` listener plus repeated `getBoundingClientRect()` calls with `IntersectionObserver` removed the remaining scroll-linked main-thread work on article pages.
- Additional scroll-performance gains came from removing CSS image filters like `sepia(...)`, narrowing `transition-all` to the specific properties that actually animate, and enabling `content-visibility` on long archive rows so offscreen stories do less rendering work.
- Research session note: Yellowstone costume reporting was strongest when anchored in Johnetta Boone interviews plus Gear Patrol/Vogue coverage; Rip’s Filson jacket and Kayce’s Freenote Cloth Riders Jacket are both well-supported, while on-screen tailoring/speculation should be labeled as such instead of treated as definitive fact.
- Editorial-content note: for new MDX pieces in this repo, matching the site’s existing Spanish editorial voice is usually the safer choice even when the prompt arrives in English; only switch the publication language if the user explicitly asks for it.
- Review workflow note: for editorial fact-checks, splitting agent work into three lanes worked well: one source-verification pass, one material/cultural framing pass, and one prose-only editorial critique. That combination caught overbroad thesis language faster than a single generic review.
- Cultural-accuracy note: in Yellowstone coverage, do not flatten Indigenous references into “Navajo” or generic Southwestern shorthand without explicit sourcing; the safer framing is Indigenous-informed or tribe-specific only when a source actually identifies it.

## 2026-03-23

- Updated the installed `menswear-panel` skill so substantive menswear editorial tasks now explicitly require delegated web-research lanes when sub-agents are available, instead of relying only on baseline model knowledge.
- The revised research guidance keeps primary and authoritative sources as the factual backbone while allowing specialist magazines, enthusiast forums, retailer archives, and credible expert X/Twitter accounts to supplement context and contemporary discourse.
- Added explicit anti-LLM prose rules to the skill: avoid templated transitions, padded symmetry, repetitive contrast structures, and generic filler; prefer asymmetry, concrete observation, and edited rhythm.
- Added another menswear-panel prose rule from user preference: avoid overusing colons in normal sentences as a device for emphasis or pseudo-structure.
- Added a second rhythm rule from user preference: avoid abusing full stops in stacked short sentences, because that stop-start cadence breaks readability; the target is varied, musical sentence flow rather than clipped pseudo-emphasis.
- Editorial repair workflow that worked well in this session: fix high- and medium-severity factual issues first, then do a separate prose-only pass to de-scaffold colon-heavy or over-signposted sentences without reopening the factual architecture.
- Concrete factual corrections made this session included product-history uncertainty (McGregor Drizzler / James Dean), split chronology issues (Wrangler 11MWZ vs 13MWZ, Champion Reverse Weave patents), lineage clarification (G-1 via AN-J-3 / AN-J-3A), taxonomy cleanup (GAT genealogy), and tighter textile terminology (Pima as ELS, duck vs canvas, V-insert caution in sweatshirt copy).
- The prose cleanup worked best as targeted sentence surgery rather than full rewrites: breaking colon-led setup/payoff lines into shorter assertions kept the editorial voice while making the articles read less templated or model-shaped.
- Follow-up prose lesson from the same session: after reducing colon abuse, the next weak pattern was overly chopped full-stop rhythm. The better fix was usually to fuse two or three adjacent short assertions into one sentence with internal movement, then keep a shorter sentence only when it genuinely sharpened the paragraph.
- Yellowstone-specific correction: in Season 3, Episode 6, Mia asks whether Rip's jacket is a Filson during the riding scene, but Rip does not confirm the brand; the article should frame that moment as an in-show association, not as brand confirmation from Rip himself.
- Validation note: `npm run lint` still passes after broad MDX editorial edits, so lint remains a practical lightweight check for article revisions in this repo.
- SEO and agent-surface implementation note: keep canonical metadata out of the root layout and set it per route instead; putting the homepage canonical in `app/layout.tsx` risks leaking `/` as the canonical for child pages.
- The current SEO baseline is now: per-route canonicals via shared metadata helpers, article JSON-LD plus breadcrumbs on article pages, `WebSite` JSON-LD in the root layout, and static discovery surfaces at `/sitemap.xml`, `/robots.txt`, `/feed.xml`, `/llms.txt`, and `/articles.json`.
- For agent-facing discovery, the most useful low-friction addition was enriching `/articles.json` with top-level site/resource pointers and per-article taxonomy/image URLs, rather than trying to expose full article bodies in a second machine format.
- Deployment correction: the current public site origin is `https://suigeneris-one.vercel.app`, so the fallback `siteOrigin` in `lib/site-metadata.ts` should match that URL whenever env overrides are absent.
