# ==========================================
# STAGE 1: Base - Khởi tạo environment chung
# ==========================================
FROM node:22-alpine AS base

RUN apk add --no-cache openssl libc6-compat tini

WORKDIR /app

# ==========================================
# STAGE 2: Dependencies - Cài đặt node_modules & Prisma
# ==========================================
FROM base AS deps

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

RUN npx prisma generate

# ==========================================
# STAGE 3: Builder - Biên dịch NestJS TypeScript & Prune Rác
# ==========================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

ENV NODE_ENV=production

RUN npm run build

RUN find dist -name "*.map" -type f -delete

RUN npm prune --omit=dev --ignore-scripts

RUN rm -rf node_modules/@prisma/engines \
    && rm -rf node_modules/prisma \
    && find node_modules -type f -name "*.o" -delete \
    && find node_modules -type f -name "*.a" -delete \
    && find node_modules -type f -name "*.mk" -delete

# ==========================================
# STAGE 4: Production Runner (Siêu nhẹ ~180MB)
# ==========================================
FROM node:22-alpine AS runner

RUN apk add --no-cache openssl libc6-compat tini

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

LABEL maintainer="Senior Software Engineer & DevOps Architect" \
      version="1.0" \
      description="Production Docker Image for Atlas ERP NestJS Backend"

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs -G nodejs \
    && mkdir -p /app/uploads \
    && chown -R nestjs:nodejs /app

COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/src/main.js"]