# Base image
FROM node:20-slim AS base
WORKDIR /app

# --- deps: copy only what the server needs (server + local packages)
# copy shared/ui packages FIRST because server's package.json uses "file:" links
COPY packages/shared ./packages/shared
COPY packages/ui ./packages/ui

# copy server sources and manifests
COPY apps/server/package.json ./apps/server/package.json
COPY apps/server/tsconfig.json ./apps/server/tsconfig.json
COPY apps/server/src ./apps/server/src

# install server deps (includes dev deps for tsc)
RUN npm install --prefix ./apps/server --include=dev

# build server
RUN npm run build --prefix ./apps/server

# --- runtime
FROM node:20-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app/apps/server
# bring built server and node_modules only
COPY --from=base /app/apps/server/node_modules ./node_modules
COPY --from=base /app/apps/server/dist ./dist
# if you read any runtime assets/config from src or public, copy them here too as needed
EXPOSE 3001
CMD ["npm","start"]