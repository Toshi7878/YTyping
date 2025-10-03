# Repository Guidelines

This repository is a Next.js 15 + TypeScript app using tRPC, Drizzle ORM, and pnpm. Keep changes focused and consistent with the existing structure.

## Project Structure & Module Organization
- `src/app`: Next.js App Router pages, layouts, and route groups (e.g., `src/app/(typing)/...`).
- `src/components/ui`: Reusable UI components.
- `src/server/api`: tRPC routers and API entry (`src/server/api/root.ts`).
- `src/server/drizzle`: DB schema, client, and validators; SQL snapshots in `drizzle/`.
- `src/lib` and `src/utils`: Shared hooks, helpers, queries/mutations, and feature logic.
- `public/`: Static assets (`public/wav`, `public/favicons`); docs images live under `src/public/images`.
- Config: `next.config.mjs`, `drizzle.config.ts`, `biome.json`, `tsconfig.json`.

## Build, Test, and Development Commands
- `pnpm dev`: Start local dev server.
- `pnpm build`: Production build. `pnpm start`: Run built app.
- `pnpm check`: Run Biome for lint/format checks. `pnpm check:fix`: Auto-fix.
- `pnpm typecheck`: TypeScript type check.
- Database: `pnpm db:migrate` (apply), `pnpm db:generate` (generate), `pnpm studio` (Drizzle Studio), `pnpm db:reset` (force push).

## Coding Style & Naming Conventions
- TypeScript + React 19. Prefer functional components and hooks.
- Use Biome; run `pnpm check:fix` before pushing.
- Indentation: 2 spaces. Files: kebab-case (e.g., `result-list.queries.ts`). Components: PascalCase. Vars/functions: camelCase. Constants: UPPER_SNAKE_CASE.
- Prefer named exports; use default exports only where Next.js requires.

## Testing Guidelines
- No unit test suite is configured yet. If adding tests:
  - Place unit tests alongside modules as `*.test.ts` or in `__tests__/`.
  - For e2e, prefer Playwright and place specs under `e2e/`.
  - Ensure `pnpm typecheck` and `pnpm check` pass in CI locally before PRs.

## Commit & Pull Request Guidelines
- Keep commits scoped and descriptive. Recommended: Conventional Commits (e.g., `feat(ui): add dual range slider`).
- PRs must include: clear description, linked issues, screenshots for UI, migration notes when touching `drizzle/`.
- Before opening a PR: run `pnpm check`, `pnpm typecheck`, build (`pnpm build`), and apply needed DB migrations.

## Security & Configuration
- Use `.env.local` for secrets; access via `src/env.ts`. Do not commit env files.
- Validate DB changes with `drizzle-kit` and keep schema/types in sync.

## Agent-Specific Notes
- Keep changes minimal and consistent with existing patterns. Do not add licenses or global reformatting. Follow this guide for file names and structure.

