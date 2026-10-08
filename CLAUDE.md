# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (:3000)
pnpm build        # Production build
pnpm check        # Biome lint + format check (pre-commit hook and CI run this)
pnpm check:fix    # Auto-fix Biome issues
pnpm typecheck    # `next typegen && tsc` (typedRoutes needs typegen first)
pnpm test         # vitest run
npx vitest run path/to/file.test.ts   # single test file (add `-t "name"` for one case)

# Database (local Supabase, requires Docker)
pnpm db:start     # Start local Supabase
pnpm db:status    # Print the keys to put in .env
pnpm db:stop
pnpm db:push      # Push Drizzle schema to DB
pnpm db:generate  # Generate migration files
pnpm db:reset
pnpm db:seed
pnpm studio       # Drizzle Studio

# One-off maintenance scripts (run through tsx)
pnpm pp:recalculate   # Recalculate every user's PP
pnpm tags:normalize
```

First-time setup is in `README.md` (copy `.env.example` → `.env`, `pnpm db:start`, fill the Supabase keys, `pnpm db:push && pnpm db:seed`).

Tests are sparse (currently one file under `src/app/(typing)/type/_feature/`). CI (`.github/workflows/ci.yml`) runs Biome and the type check on PRs to `main`/`dev`; it does not run vitest.

## Toolchain constraints

- **Node 24.x only** (`engines` and `.nvmrc`). Vercel cannot select newer Node, so do not bump Node or `@types/node` past 24.x.
- **TypeScript 7 (native Go compiler)**. The `typescript` package has no JS API; `tsc` is the Go binary. Next.js 16.4+ copes with this — older Next versions failed `next build` at the "Running TypeScript" step.
- `tsx` is still needed for scripts: they import via the `@/` alias, which Node's built-in type stripping does not resolve.
- Path alias `@/*` → `src/*`. tsconfig has `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`.

## Pre-commit

Husky runs `pnpm check` on every commit. Biome format violations fail the hook even if shown with `i` (info) prefix — they still exit code 1. Always run `pnpm check:fix` before committing.

## Architecture

### Routing (Next.js App Router)

| Route | Purpose |
|---|---|
| `(home)/` | Map listing |
| `(typing)/type/[id]` | Standard typing game |
| `(typing)/ime/[id]` | IME mode (Japanese input method) |
| `edit/[id]`, `edit/(new)` | Map editor |
| `user/[id]` | User profile |
| `rankings/performance` | PP ranking |
| `timeline/` | Activity timeline |
| `(admin)/`, `banned/`, `maintenance/` | Admin / ban notice / maintenance mode (`NEXT_PUBLIC_MAINTENANCE_MODE`) |
| `(menus)/...` | Static/menu pages |

Route-specific code lives in a `_feature` / `_components` folder next to the route. Cross-route domain code is in `src/shared/` (map, result, user, morph); generic UI is in `src/ui/`.

### API Layer (tRPC 11 + React Query)

Three separate route handlers with distinct purposes:

- `/api/trpc/[trpc]` → `appRouter` — standard tRPC for client components
- `/api/[...openapi]` → `openApiRouter` — public REST (CORS enabled)
- `/api/internal/[...openapi]` → `appRouter` — internal REST (same-origin only)

**Server-side usage** (`src/trpc/server.tsx`): `caller` for direct calls in RSC, `trpc` + `prefetch` for TanStack Query prefetching, `HydrateClient` to stream dehydrated state to the client.

**Client-side usage** (`src/trpc/provider.tsx`): `useTRPC()` hook inside `TRPCReactProvider`. Uses `httpBatchStreamLink`.

### tRPC Procedures (`src/server/api/trpc.ts`)

- `publicProcedure` — no auth required
- `protectedProcedure` — requires session (throws string error, not `TRPCError`, if unauthenticated)
- Both have a global rate limit: **60 requests / 60 seconds** via Upstash Redis. Rate limit is skipped if `KV_REST_API_URL` / `KV_REST_API_TOKEN` env vars are absent. Keyed by `user:{id}` (logged in) or `ip:{ip}` (anonymous).

New procedures go in `src/server/api/routers/`. Export from `src/server/api/root.ts`. External-service clients (R2/S3 storage, Supabase, Google AI, YouTube, Vercel API) are in `src/server/api/lib/`.

### State Management (Jotai)

Typing and IME pages use isolated Jotai stores created with `createStore()` (not the global default store). Use `store.get()` / `store.set()` for imperative access outside React components. App-wide settings under `src/store/` (e.g. `user-options.ts`) are the exception: they use `getDefaultStore()` and expose hooks plus imperative setters.

The typing engines come from the external packages `lyrics-typing-engine` and `lyrics-ime-typing-engine`.

### IME Typing Mode Userscript API

`src/app/(typing)/ime/_feature/user-script.tsx` exposes `window.__ytyping_ime` for external userscript access. Functions intended for external consumption must be added to the `ytypingIme` getter object in that file. Business logic lives in the respective feature files (e.g., `result-dialog.tsx`), not in `user-script.tsx`. The standard mode has the equivalent `type/_feature/user-script.ts`. `pnpm types:build` bundles the public typings via `dts-bundle-generator`.

### Database (Drizzle ORM + PostgreSQL)

`src/server/drizzle/client.ts` exports `db`. Schema is split by domain under `src/server/drizzle/schema/` and re-exported from `src/server/drizzle/schema.ts`. Local development uses Supabase (`pnpm db:start`); map and replay JSON files live in Supabase Storage locally and R2 in production.

### Auth (better-auth)

Configured in `src/auth/server.ts`. OAuth via Google and Discord. Emails are stored as MD5 hashes. Users set their own name after registration — providers do not supply it. Session is accessed via `getSession()` (cached per request) in server contexts, or via tRPC context `ctx.session`. The signing secret is `env.AUTH_SECRET`, passed explicitly to `betterAuth` (required on Vercel, defaults locally).

### UI

- Components in `src/ui/` are shadcn-style wrappers over **Base UI** (`@base-ui/react`); Radix was removed. Use `render` (not `asChild`) and `data-open` / `data-closed` / `data-checked` style selectors. Do not render links through `Button`; apply `buttonVariants()` to the `<Link>`. `.migration/*.md` records the per-component decisions and pitfalls (e.g. `Select` needs an `items` prop to show labels).
- Tables use **TanStack Table v9**: `src/ui/table/data-table.tsx` registers features explicitly via `tableFeatures({...})` and `useTable`. Type columns with `DataTableColumnDef<T>`; if a column needs sorting/filtering/etc., register that feature there first. Per-column `meta` supports `cellClassName`, `headerClassName`, `onClick`.
- Styling is Tailwind CSS 4 (`src/theme/globals.css`); React Compiler is enabled.

### Environment Variables

All env vars are validated via `@t3-oss/env-nextjs` in `src/env.ts`. **Never use `process.env` directly** — Biome will error (`noProcessEnv`). Import `env` from `@/env` instead. Server-only env vars are enforced with `import "server-only"`. Many vars are required only on Vercel/production and optional locally.

## Biome Rules to Know

- **`noDefaultExport`** is an error everywhere except `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` (and `next.config.ts`)
- **`useFilenamingConvention`** enforces `kebab-case` for all filenames
- **`noProcessEnv`** — use `@/env` instead
- **`noCommonJs`** — ESM only
- Line ending: **LF** (enforced by formatter)
- `biome.json`'s `$schema` version must match the installed `@biomejs/biome` version in `package.json`, or editor tooling will flag valid options (e.g. `css.parser.tailwindDirectives`) as errors
