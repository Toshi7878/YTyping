# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm check        # Biome lint + format check (runs in pre-commit hook)
pnpm check:fix    # Auto-fix Biome issues
pnpm typecheck    # Type check via tsgo (@typescript/native-preview)

# Database (local Supabase)
pnpm db:start     # Start local Supabase
pnpm db:stop      # Stop local Supabase
pnpm db:push      # Push schema to DB
pnpm db:generate  # Generate migration files
pnpm db:reset     # Reset local DB
pnpm db:seed      # Seed local DB
pnpm studio       # Drizzle Studio
```

No test suite exists.

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
| `(menus)/...` | Static/menu pages |

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

New procedures go in `src/server/api/routers/`. Export from `src/server/api/root.ts`.

### State Management (Jotai)

Typing and IME pages use isolated Jotai stores created with `createStore()` (not the global default store). Use `store.get()` / `store.set()` for imperative access outside React components.

### IME Typing Mode Userscript API

`src/app/(typing)/ime/_feature/user-script.tsx` exposes `window.__ytyping_ime` for external userscript access. Functions intended for external consumption must be added to the `ytypingIme` getter object in that file. Business logic lives in the respective feature files (e.g., `result-dialog.tsx`), not in `user-script.tsx`.

### Database (Drizzle ORM + PostgreSQL)

`src/server/drizzle/client.ts` exports `db`. Schema is split by domain under `src/server/drizzle/schema/` and re-exported from `src/server/drizzle/schema.ts`. Local development uses Supabase (`pnpm db:start`).

### Auth (better-auth)

Configured in `src/auth/server.ts`. OAuth via Google and Discord. Emails are stored as MD5 hashes. Users set their own name after registration — providers do not supply it. Session is accessed via `getSession()` (cached per request) in server contexts, or via tRPC context `ctx.session`.

### Environment Variables

All env vars are validated via `@t3-oss/env-nextjs` in `src/env.ts`. **Never use `process.env` directly** — Biome will error (`noProcessEnv`). Import `env` from `@/env` instead. Server-only env vars are enforced with `import "server-only"`.

## Biome Rules to Know

- **`noDefaultExport`** is an error everywhere except `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`
- **`useFilenamingConvention`** enforces `kebab-case` for all filenames
- **`noProcessEnv`** — use `@/env` instead
- **`noCommonJs`** — ESM only
- Line ending: **CRLF** (enforced by formatter)
- `biome.json` references schema `2.2.4` but installed version is `2.4.11` — this is intentional
