# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
bun run dev          # run all apps + services in watch mode
bun run start        # run all apps + services in production mode
bun run test         # run tests across all packages
bun test             # run tests in current directory
bun test <file>      # run a single test file
bun run lint         # check with biome
bun run lint:fix     # auto-fix with biome
docker compose up    # postgres + redis + crawler engine (port 1337)
```

## Architecture

Bun-native monorepo using built-in workspaces — no Turborepo or other build orchestration.

```
apps/
  client/    → @apps/client      (Next.js frontend, port 1001)
  admin/     → @apps/admin       (internal control panel, port 1002)
  server/    → @apps/server      (Hono backend)
services/
  crawler/   → @services/crawler (crawl engine, port 1337)
packages/
  shared/        → @eros/shared        (shared code)
  ui/            → @eros/ui            (components, providers, styles)
  crawler-core/  → @eros/crawler-core  (SOLID interfaces, URL utils, retry, errors)
```

Workspace packages are referenced via path aliases defined in the root `tsconfig.json`:
- `@eros/shared` → `packages/shared/index.ts`
- `@eros/crawler-core` → `packages/crawler-core/src/index.ts`
- `@eros/ui/*` → `packages/ui/src/components/*.tsx`
- `@eros/ui/providers/*` → `packages/ui/src/providers/*.tsx`
- `@eros/ui/utils` → `packages/ui/src/lib/utils.ts`
- `@eros/ui/globals.css` → `packages/ui/src/styles/globals.css`

Each app and package extends the root `tsconfig.json`. Tests live alongside source files as `*.test.ts`. Only `packages/` has a `test` script; apps use integration/e2e tests when needed.

## Bun-first conventions

Always use Bun APIs — never reach for Node/npm equivalents:

- `bun <file>` not `node` / `ts-node`
- `bun test` not jest / vitest
- `bun build` not webpack / esbuild / vite
- `bunx` not npx
- `Bun.serve()` for HTTP (supports WebSockets, HTTPS, routes) — not express
- `bun:sqlite` for SQLite — not better-sqlite3
- `Bun.sql` for Postgres — not pg / postgres.js
- `Bun.redis` for Redis — not ioredis
- `Bun.file` for file I/O — not fs.readFile / writeFile
- `Bun.$\`cmd\`` for shell commands — not execa
- `WebSocket` built-in — not ws
- Bun auto-loads `.env` — never use dotenv

## Frontend

`apps/client` uses Next.js 16 with Turbopack. UI components and styles live in `@eros/ui` and are imported directly into the app. Add new shadcn components by running `bun run add <component>` from inside `packages/ui`.

## Crawl engine

`services/crawler` is a centralized crawl engine: HTTP API (Hono) on port 1337 + BullMQ workers in the same process. Source-specific crawlers are plugins implementing `CrawlerHandler` from `@eros/crawler-core` and registered in `src/index.ts`.

Layered around DI: `Fetcher`, `QueueAdapter`, `CrawlStore`, `DedupStore`, `ProxyProvider`, `Logger` are interfaces in `@eros/crawler-core`; concrete implementations live in `services/crawler/src/infra/` (Postgres / Redis / BullMQ / native fetch). Composition root: `src/engine/composition.ts`.

Local dev: `docker compose up postgres redis -d && cd services/crawler && bun run db:generate && bun run db:migrate && bun run dev`. Full stack: `docker compose up`.
