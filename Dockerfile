# Base image
FROM node:20-slim AS base
WORKDIR /app

# ---- bring in source needed for server build
COPY packages/shared ./packages/shared
COPY apps/server/package.json ./apps/server/package.json
COPY apps/server/tsconfig.json ./apps/server/tsconfig.json
COPY apps/server/src ./apps/server/src

# ---- build shared first (so file: link has dist + types)
RUN npm install --prefix ./packages/shared --include=dev || true
RUN npm run build --prefix ./packages/shared || true

# ---- now install server (will resolve file:../../packages/shared and use built dist)
RUN npm install --prefix ./apps/server --include=dev

# ---- build server
RUN npm run build --prefix ./apps/server

# ---- runtime
FROM node:20-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app/apps/server
COPY --from=base /app/apps/server/node_modules ./node_modules
COPY --from=base /app/apps/server/dist ./dist
EXPOSE 3001
CMD ["node","dist/index.js"]