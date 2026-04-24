# arcstack

A Bun-native monorepo template using built-in workspaces — no Turborepo or other build orchestration.

## Structure

```
apps/
  client/   → @apps/client   (frontend)
  server/   → @apps/server   (backend)
packages/
  shared/   → @arc/shared  (shared code)
  ui/       → @arc/ui       (components & styles)
```

## Getting Started

```bash
bun install
bun run dev       # run all apps in watch mode (parallel)
```

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Run all apps in watch mode |
| `bun run start` | Run all apps in production mode |
| `bun run build` | Build all apps |
| `bun run typecheck` | Type-check all workspaces |
| `bun run lint` | Lint with Biome |
| `bun run lint:fix` | Auto-fix with Biome |
| `bun run test` | Run tests in `packages/` |
| `bun run create app <name>` | Scaffold a new app |
| `bun run create shared <name>` | Scaffold a new package |

## Add Dependencies

```bash
# Root (dev tooling)
bun add -d <package>

# Specific workspace
bun add --filter @apps/server <package>
bun add --filter @apps/client <package>
bun add --filter @arc/shared <package>
```

## Conventions

- Bun APIs only — no Node/npm equivalents (see `CLAUDE.md` for the full list)
- Tests live alongside source as `*.test.ts` and are run with `bun test`
- Linting via [Biome](https://biomejs.dev)
- Path aliases: `@arc/*` and `@apps/*` resolve via root `tsconfig.json`
