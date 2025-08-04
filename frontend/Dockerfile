# Frontend Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /root

# Copy all package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY frontend/package*.json ./frontend/

# Install all dependencies
RUN npm ci

# Build shared module first
FROM base AS shared-builder
WORKDIR /root
COPY --from=deps /root/node_modules ./node_modules
COPY shared ./shared
WORKDIR /root/shared
RUN npm run build

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /root/frontend
COPY --from=deps /root/node_modules ../node_modules
COPY --from=deps /root/package-lock.json ../package-lock.json
COPY --from=shared-builder /root/shared ../shared
COPY frontend ./

# Create public directory if it doesn't exist
RUN mkdir -p public

# Build frontend
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /root/frontend/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /root/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /root/frontend/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]