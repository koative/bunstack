FROM oven/bun:1-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
COPY package.json bun.lock bunfig.toml tsconfig.json ./
COPY apps/client/package.json apps/client/
COPY apps/admin/package.json apps/admin/
COPY apps/server/package.json apps/server/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
COPY packages/crawler-core/package.json packages/crawler-core/
COPY services/crawler/package.json services/crawler/
RUN bun install --frozen-lockfile

FROM base AS runtime
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock bunfig.toml tsconfig.json ./
COPY packages ./packages
COPY services/crawler ./services/crawler

WORKDIR /app/services/crawler
EXPOSE 1337
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:1337/health || exit 1

CMD ["bun", "src/index.ts"]
