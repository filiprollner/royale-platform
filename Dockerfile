# --- base
FROM node:20-slim AS base
WORKDIR /app

# --- deps: copy workspace manifests so layer invalidates when any package.json changes
FROM base AS deps
COPY package.json turbo.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/server/package.json ./apps/server/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/ui/package.json ./packages/ui/package.json
# install all workspaces (no lockfile needed)
RUN npm install --workspaces --include=dev

# --- build
FROM base AS build
COPY --from=deps /app /app
# copy the rest of the source
COPY . .
# build all packages via turborepo
RUN npx turbo run build

# --- runtime (server)
FROM node:20-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app/apps/server
COPY --from=build /app /app
EXPOSE 3001
CMD ["npm","start"]