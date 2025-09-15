# Repository Guidelines

## Project Structure & Module Organization
- App Router: `src/app/` (routes, colocated UI and feature code)
- Server & API: `src/server/` (tRPC in `api/`, Drizzle in `drizzle/`)
- UI Components: `src/components/` (shared UI in `ui/`, feature bits in `shared/`)
- Utilities & Hooks: `src/utils/` (`queries/`, `mutations/`, `hooks/`)
- Types: `src/types/`
- Config: `next.config.js`, `tsconfig.json`, `eslint.config.mjs`, `drizzle.config.ts`
- Path alias: `@/*` maps to `src/*`

## Build, Test, and Development Commands
- `pnpm dev` — Start Next.js dev server (Turbopack)
- `pnpm build` — Production build
- `pnpm start` — Start built server
- `pnpm lint` / `pnpm lint:fix` — Lint (and auto‑fix) via ESLint
- `pnpm typecheck` — Run TypeScript without emit
- Database (Drizzle, uses `.env.local`):
  - `pnpm db:migrate` — Push schema to DB
  - `pnpm db:generate` — Generate SQL migrations
  - `pnpm db:reset` — Force re‑push (destructive)
  - `pnpm studio` — Open Drizzle Studio

## Coding Style & Naming Conventions
- Language: TypeScript (`strict: true`), React 19, Next.js 15 App Router
- Formatting: Prettier (+ Tailwind plugin). Indentation 2 spaces; no semicolons preference follows Prettier
- Linting: ESLint (flat config). Run `pnpm lint:fix` before PRs
- Files: React components `PascalCase.tsx`; hooks `useSomething.ts`; route files lower‑case in `src/app`
- Modules: tRPC routers `src/server/api/routers/*Router.ts`; Drizzle schema in `src/server/drizzle/`

## Testing Guidelines
- No formal test framework configured. Prefer small, testable modules and manual QA via `pnpm dev`
- If adding tests, colocate under `src/__tests__/` or `*.test.ts(x)` next to code; keep tests deterministic

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- Scope changes narrowly; one topic per commit
- PRs must include: clear description, rationale, screenshots/GIFs for UI, and steps to verify
- Link issues with `Closes #123` when applicable

## Security & Configuration Tips
- Required env (see `src/env.ts`): auth provider keys, `DATABASE_URL`, `DIRECT_URL`, Supabase public keys, Sudachi/Yahoo API keys, etc
- Store secrets in `.env.local`; never commit them. DB commands load via `dotenv -e .env.local`
- `next.config.js` has `reactStrictMode: false`; avoid side effects in React components

## Agent‑Specific Notes
- Prefer `pnpm` (workspace present). Use `@/` imports. Keep patches minimal and localized
- When editing, follow existing folder conventions and naming patterns above
