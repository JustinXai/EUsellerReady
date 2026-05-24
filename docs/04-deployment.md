# 04 - Deployment Guide

## Prerequisites

- Docker installed on the server
- Docker Compose installed
- Domain `eureadyseller.com` pointed to server IP (A record)
- Port 80 and 443 open on the server firewall
- SSH access to the server

## Local Build → Server Deploy Workflow

### Step 1: Build locally
```bash
npm install
npm run verify
npm run build
```

### Step 2: Transfer to server
```bash
# Option A: rsync (recommended for incremental updates)
rsync -avz --delete dist/ user@your-server:/srv/

# Option B: git push + SSH deploy script
git push origin main
# (GitHub Actions handles build + rsync to server)
```

### Step 3: Deploy with Docker
```bash
ssh user@your-server

# Pull latest image or copy new dist
docker build -t eureadyseller:latest .
docker-compose down
docker-compose up -d

# Check status
docker logs -f eureadyseller-web
docker-compose ps
```

### Step 4: Verify
```bash
curl -I https://eureadyseller.com
curl https://eureadyseller.com/sitemap.xml | head -20
```

## GitHub Actions CI/CD (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install and verify
        run: |
          npm ci
          npm run verify

      - name: Build
        run: npm run build

      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            rsync -avz --delete dist/ /srv/
            docker build -t eureadyseller:${{ github.sha }} .
            docker tag eureadyseller:${{ github.sha }} eureadyseller:latest
            docker-compose down || true
            docker-compose up -d
```

## Rollback Procedure

```bash
# Find previous image tag
docker images | grep eureadyseller

# Tag and deploy previous version
docker tag eureadyseller:previous eureadyseller:latest
docker-compose down
docker-compose up -d

# If rsync deployment, restore from git
git log --oneline -10
git checkout <previous-commit-hash>
npm run build
rsync -avz dist/ user@your-server:/srv/
```

## Common Errors

### "port is already allocated"
```bash
docker-compose down
docker-compose up -d
```

### "certificate has expired" (Caddy)
```bash
docker exec eureadyseller-web caddy --config /etc/caddy/Caddyfile --adapter caddyfile
# Caddy auto-renews; wait 1-2 minutes
```

### Build fails with "Cannot find module"
```bash
npm ci --legacy-peer-deps
npm run build
```

### 502 Bad Gateway
```bash
docker logs eureadyseller-web
# Check if dist files are mounted correctly
docker exec eureadyseller-web ls /srv
```

## DNS Setup

```
A record: eureadyseller.com → YOUR_SERVER_IP
A record: www.eureadyseller.com → YOUR_SERVER_IP (redirects to main)
```

## Environment Variables

Create `.env` on server:
```
PUBLIC_SITE_URL=https://eureadyseller.com
PUBLIC_SITE_NAME=EUReadySeller
CONTACT_EMAIL=hello@eureadyseller.com
```
