# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
bun run dev          # run all apps in watch mode (parallel)
bun run start        # run all apps in production mode
bun run test         # run tests across all packages
bun test             # run tests in current directory
bun test <file>      # run a single test file
bun run lint         # check with biome
bun run lint:fix     # auto-fix with biome
```

## Architecture

Bun-native monorepo using built-in workspaces — no Turborepo or other build orchestration.

```
apps/
  client/   → @apps/client   (Next.js frontend)
  server/   → @apps/server   (Hono backend)
packages/
  shared/   → @arc/shared    (shared code consumed by both apps)
  ui/       → @arc/ui        (components, providers, styles)
```

Workspace packages are referenced via path aliases defined in the root `tsconfig.json`:
- `@arc/shared` → `packages/shared/index.ts`
- `@arc/ui/*` → `packages/ui/src/components/*.tsx`
- `@arc/ui/providers/*` → `packages/ui/src/providers/*.tsx`
- `@arc/ui/utils` → `packages/ui/src/lib/utils.ts`
- `@arc/ui/globals.css` → `packages/ui/src/styles/globals.css`

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

`apps/client` uses Next.js 16 with Turbopack. UI components and styles live in `@arc/ui` and are imported directly into the app. Add new shadcn components by running `bun run add <component>` from inside `packages/ui`.
