FROM node:20-slim AS base
WORKDIR /app

# ---- deps layer: copy all workspace package.json files so cache busts when any of them change
FROM base AS deps
COPY package.json pnpm-lock.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/server/package.json ./apps/server/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN corepack enable && pnpm install --frozen-lockfile

# ---- build layer: now copy the rest and build
FROM base AS build
COPY --from=deps /app /app
COPY . .
RUN corepack enable && pnpm run build

# ---- runtime
FROM node:20-slim AS runtime
ENV NODE_ENV=production
# If server is the deploy target, set workdir and start there
WORKDIR /app/apps/server
COPY --from=build /app /app
EXPOSE 3001
CMD ["pnpm","start"]
