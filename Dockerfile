FROM node:20-slim AS build
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Build shared package first
COPY packages/shared ./packages/shared
WORKDIR /app/packages/shared
RUN npm ci --include=dev || npm install --include=dev
RUN npm run build

# Build server package
WORKDIR /app
COPY apps/server/package.json ./apps/server/package.json
COPY apps/server/tsconfig.json ./apps/server/tsconfig.json
COPY apps/server/src ./apps/server/src
WORKDIR /app/apps/server
RUN npm ci --include=dev || npm install --include=dev
RUN npm run build

# Runtime stage
FROM node:20-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Copy built shared package
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json

# Copy built server
COPY --from=build /app/apps/server/dist ./apps/server/dist
COPY --from=build /app/apps/server/package.json ./apps/server/package.json
COPY --from=build /app/apps/server/node_modules ./apps/server/node_modules

# Set working directory to server
WORKDIR /app/apps/server

EXPOSE 3000
CMD ["node", "dist/index.js"]