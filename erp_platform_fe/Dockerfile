# ==============================================================================
# STAGE 1: Builder (Compile React/Vite TypeScript to static assets)
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
RUN npm run build

# ==============================================================================
# STAGE 2: Production Nginx Server (Standalone Self-Contained Image)
# ==============================================================================
FROM nginx:1.27-alpine-slim AS runner

LABEL maintainer="Senior Software Engineer & DevOps Architect" \
      version="1.0" \
      description="Production Docker Image for Atlas ERP React Frontend"

# Clean up default Nginx website files
RUN rm -rf /usr/share/nginx/html/*

# Inline-generate Nginx SPA configuration directly inside Dockerfile
RUN cat << 'EOF' > /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Performance: Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # Security Headers (OWASP Best Practices)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Caching cho static assets (/assets/*.js, *.css, *.png)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA Client-Side Routing Fallback (React Router / Vite)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Healthcheck endpoint cho Kubernetes Liveness/Readiness Probes
    location /healthz {
        access_log off;
        default_type text/plain;
        return 200 "OK";
    }
}
EOF

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
