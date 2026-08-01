# @apps/server

Backend built with [Hono](https://hono.dev) on `Bun.serve()`.

## Scripts

```bash
bun run dev       # hot-reload mode (bun --hot)
bun run start     # production
bun run build     # compile to dist/ (target: bun)
bun run typecheck # tsc --noEmit
```

## Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Hello World |

## Dependencies

- `hono` — web framework (version pinned via root catalog)
- `@arc/shared` — shared utilities from the monorepo
