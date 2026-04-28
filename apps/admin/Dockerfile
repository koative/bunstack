FROM oven/bun:1-alpine AS base
WORKDIR /app

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

FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock bunfig.toml tsconfig.json ./
COPY packages ./packages
COPY apps/admin ./apps/admin
RUN bun --filter @apps/admin build

FROM base AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=1002
ENV HOSTNAME=0.0.0.0

COPY --from=build /app/apps/admin/.next/standalone ./
COPY --from=build /app/apps/admin/.next/static ./apps/admin/.next/static

EXPOSE 1002
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:1002/ || exit 1

CMD ["bun", "apps/admin/server.js"]
