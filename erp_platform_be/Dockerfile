# STAGE 1: Dependencies (Install all dependencies & generate Prisma client)
FROM node:20-alpine AS deps

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

RUN npx prisma generate

# STAGE 2: Builder (Compile NestJS TypeScript to JavaScript)
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN npm run build

RUN npm ci --production

# STAGE 3: Production Runner (Non-root, Security-hardened Runtime)
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

LABEL maintainer="Senior Software Engineer & DevOps Architect" \
      version="1.0" \
      description="Production Docker Image for Atlas ERP NestJS Backend"

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

CMD ["node", "dist/main.js"]