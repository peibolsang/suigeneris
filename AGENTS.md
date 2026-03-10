# Repository Guidelines

## Project Structure & Module Organization
This repository is a small Next.js 16 app using the App Router. Route files live in `app/`: `layout.tsx` defines the shared shell, `page.tsx` is the home route, and `globals.css` holds global Tailwind v4 styles and theme variables. Static assets live in `public/`. Root configuration files include `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, and `postcss.config.mjs`.

Use the `@/*` TypeScript path alias for imports from the repository root when it improves readability. Keep new route segments under `app/<segment>/page.tsx` and place route-specific helpers or components near the route that uses them.

## Coding Style & Naming Conventions
Use TypeScript and React function components. Follow the existing style: 2-space indentation, double quotes, and semicolons. Name React components in `PascalCase`, helpers in `camelCase`, and keep route files in Next.js conventions such as `page.tsx` and `layout.tsx`.

Prefer Tailwind utility classes in JSX for component styling and reserve `app/globals.css` for global tokens, resets, and theme-level rules. Keep imports ordered simply: external packages first, then local modules, then styles.

## Testing Guidelines
There is no dedicated test framework configured yet. Until one is added, treat `npm run lint` as the required validation steps for every change. If you introduce tests, use `*.test.ts` or `*.test.tsx` naming and keep them next to the code they verify.

## Commit & Pull Request Guidelines
The current history only contains the initial scaffold commit, so use short, imperative commit messages such as `Add landing page hero`. Keep commits focused on one change. PRs should include a clear summary, note any configuration or dependency changes, link related issues, and attach screenshots for UI updates. Include the commands you ran to validate the change.

## IMPORTANT: Self-Improvement

- Build a markdown file (@AGENT_NOTES.md) where you log what goes right, what goes wrong, what I corrected, what worked and what didn't. It's kind of scratchpad to take notes on yourself during every session.
- Check these evolving notes in @AGENT_NOTES.md as an input of your implementation.

## Installed Skills Policy

The following installed skills are mandatory and must be invoked when the task matches their purpose:

- `frontend-design` (`https://skills.sh/anthropics/skills/frontend-design`): Trigger this when building, redesigning, styling, or beautifying any frontend UI such as pages, landing pages, components, dashboards, or other visual web interfaces.
- `vercel-react-best-practices` (`https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices`): Trigger this whenever writing, reviewing, refactoring, or optimizing React or Next.js code, including work on components, routes, data fetching, rendering, bundle size, or performance.
- `web-design-guidelines` (`https://skills.sh/vercel-labs/agent-skills/web-design-guidelines`): Trigger this for UI, UX, accessibility, or design-quality reviews and audits, including requests to review an interface, check best practices, or assess compliance with web interface guidelines.

If more than one of these skills applies, invoke the minimal relevant combination. For example, use `frontend-design` plus `vercel-react-best-practices` when implementing a new Next.js UI, and use `web-design-guidelines` when the task is specifically a design or accessibility review.
