# Backend Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /root

# Copy all package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/

# Install all dependencies
RUN npm ci

# Build shared module
FROM base AS shared-builder
WORKDIR /root
COPY --from=deps /root/node_modules ./node_modules
COPY shared ./shared
WORKDIR /root/shared
RUN npm run build

# Build backend
FROM base AS builder
WORKDIR /root/backend
COPY --from=deps /root/node_modules ../node_modules
COPY --from=deps /root/package-lock.json ../package-lock.json
COPY --from=shared-builder /root/shared/dist ../shared/dist
COPY --from=shared-builder /root/shared/package.json ../shared/package.json
COPY backend ./

# Build application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create non-root user
RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nestjs /root/backend/dist ./dist
COPY --from=builder --chown=nestjs:nestjs /root/backend/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nestjs /root/backend/package*.json ./

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main"]