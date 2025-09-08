FROM node:20.18.0-slim AS base
WORKDIR /app

# ---- deps layer: copy all workspace package.json files so cache busts when any of them change
FROM base AS deps
COPY package.json package-lock.json turbo.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/server/package.json ./apps/server/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN npm install --production=false

# ---- build layer: now copy the rest and build
FROM base AS build
COPY --from=deps /app /app
COPY . .
RUN npm run build

# ---- runtime
FROM base AS runtime
ENV NODE_ENV=production
# If server is the deploy target, set workdir and start there
WORKDIR /app/apps/server
COPY --from=build /app /app
EXPOSE 3001
CMD ["npm","start"]
