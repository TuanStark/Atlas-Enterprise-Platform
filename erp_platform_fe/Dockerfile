# ==========================================
# STAGE 1: Base & Dependencies
# ==========================================
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci

# ==========================================
# STAGE 2: Builder (Compile Vite React App)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV NODE_ENV=production

RUN npm run build

# ==========================================
# STAGE 3: Production Runner (Nginx Non-Root ~25MB)
# ==========================================
FROM nginxinc/nginx-unprivileged:1.27-alpine-slim AS runner

LABEL maintainer="Senior Software Engineer & DevOps Architect" \
      version="1.0" \
      description="Production Docker Image for Atlas ERP React Frontend"

USER root
RUN rm -rf /usr/share/nginx/html/*
USER 101

COPY <<-'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 8080;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires 0;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /healthz {
        access_log off;
        default_type text/plain;
        return 200 "OK";
    }
}
EOF

COPY --from=builder --chown=101:101 /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
