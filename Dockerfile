FROM node:20-slim AS build
WORKDIR /app

# Copy lockfile for npm ci
COPY package-lock.json ./
# shared first
COPY packages/shared ./packages/shared
RUN npm ci --prefix ./packages/shared --include=dev || npm install --prefix ./packages/shared --include=dev
RUN npm run build --prefix ./packages/shared

# server
COPY apps/server/package-lock.json ./apps/server/package-lock.json
COPY apps/server/package.json ./apps/server/package.json
COPY apps/server/tsconfig.json ./apps/server/tsconfig.json
COPY apps/server/src ./apps/server/src
RUN npm ci --prefix ./apps/server --include=dev || npm install --prefix ./apps/server --include=dev
RUN npm run build --prefix ./apps/server

# runtime
FROM node:20-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app/apps/server
COPY --from=build /app/apps/server/node_modules ./node_modules
COPY --from=build /app/apps/server/dist ./dist
EXPOSE 3000
CMD ["node","dist/index.js"]