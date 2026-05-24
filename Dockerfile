# EUReadySeller Dockerfile
# Multi-stage build for static Astro site served with Caddy

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Build and validate
RUN npm run build

# Production stage
FROM alpine:3.19

RUN apk add --no-cache caddy

# Copy built static files
COPY --from=builder /app/dist /srv

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Caddy serves on port 80
EXPOSE 80 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
