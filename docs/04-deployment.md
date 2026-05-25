# 04 - Deployment Guide

## Prerequisites

- Docker installed on the server (or Caddy static file serving)
- Docker Compose installed (optional)
- Domain `eureadyseller.com` pointed to server IP (A record)
- Port 80 and 443 open on the server firewall
- SSH access to the server

---

## One-Command Deploy (Recommended)

After pushing code to `origin/main`, SSH into the server and run:

```bash
/opt/eureadyseller/deploy.sh
```

It automatically:
1. Checks git working tree is clean
2. Confirms all local commits are pushed to origin/main
3. Pulls latest from origin/main
4. Runs `npm run verify` (local quality gate)
5. **Waits for GitHub Quality Gate** to pass
6. Creates a timestamped release under `/opt/eureadyseller/releases/`
7. Switches the `current` symlink to the new release
8. Reloads Caddy
9. Restarts Message API if installed
10. Runs server-side smoke tests (curl + `npm run external:smoke`)
11. Optionally triggers GitHub-hosted external smoke

### Skip GitHub CI Wait

If GitHub Actions is slow or down, skip the CI wait:

```bash
SKIP_GITHUB_CI_WAIT=1 /opt/eureadyseller/deploy.sh
```

### Trigger GitHub-Hosted External Smoke

Requires `GITHUB_TOKEN` in `/opt/eureadyseller/deploy.env`:

```bash
RUN_GITHUB_EXTERNAL_SMOKE=1 /opt/eureadyseller/deploy.sh
```

---

## Standard Deployment Workflow

### Step 1: Make changes locally

```bash
# Edit code, add pages, update content
```

### Step 2: Run local verification

```bash
npm install
npm run verify
```

### Step 3: Commit and push

```bash
git add .
git commit -m "description of changes"
git push origin main
```

### Step 4: Wait for GitHub Quality Gate

GitHub Actions runs `npm run verify` automatically. Monitor at:

```
https://github.com/JustinXai/EUsellerReady/actions
```

### Step 5: Deploy on server

```bash
ssh your-server
/opt/eureadyseller/deploy.sh
```

The `deploy.sh` script waits for the GitHub Quality Gate to turn green before deploying.

---

## Automated Checks

`deploy.sh` runs these automated checks:

| Check | Tool | Blocks Deploy? |
|-------|------|----------------|
| Working tree clean | `git status --porcelain` | Yes |
| Commits pushed | `git rev-parse` comparison | Yes |
| Local quality gate | `npm run verify` (includes `validate:artifacts`) | Yes |
| GitHub Quality Gate | `npm run ci:wait` (GitHub API) | Yes |
| Artifact consistency | `validate:artifacts` (robots/sitemap/llms) | Yes |
| HTTP smoke tests | `curl -I` | Yes |
| External smoke | `npm run external:smoke` | Yes (auto-rollback) |
| GitHub external smoke | `npm run external:github` | No (optional) |

---

## If Deployment Fails

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Working tree is dirty` | Uncommitted server changes | `git add . && git commit && git push` |
| `Local branch has commits not pushed` | Unpushed server commits | `git push origin main` |
| `Local branch is behind origin` | origin/main has new commits | `git pull --ff-only` |
| `GitHub Quality Gate failed` | CI checks failing | Fix failing checks, push again |
| `External smoke failed` | Site serving wrong content | Check `current` symlink, Caddy config |
| `Timed out waiting for GitHub CI` | GitHub Actions slow | `SKIP_GITHUB_CI_WAIT=1 /opt/eureadyseller/deploy.sh` |

---

## Server-Side Script Setup

On the server:

```bash
# Copy deploy script from repo
sudo cp /opt/eureadyseller/repo/scripts/deploy.sh.template /opt/eureadyseller/deploy.sh
sudo chmod +x /opt/eureadyseller/deploy.sh

# Optional: create deploy.env for GitHub integration
sudo nano /opt/eureadyseller/deploy.env
# Add: GITHUB_TOKEN=ghp_your_token_here
```

---

## Environment Variables

Create `/opt/eureadyseller/deploy.env` on the server (optional):

```bash
# GitHub Personal Access Token (required only for GitHub external smoke trigger)
GITHUB_TOKEN=

# Override defaults (all have sensible defaults)
GITHUB_REPOSITORY=JustinXai/EUsellerReady
GITHUB_CI_WORKFLOW_NAME=EUReadySeller Quality Gate
GITHUB_EXTERNAL_SMOKE_WORKFLOW=external-smoke.yml
SITE_URL=https://eureadyseller.com
```

**Important:** `deploy.env` is gitignored. Never commit real tokens to Git.

---

## Rollback Procedure

The deploy script **automatically rolls back** on external smoke failure. If the live site checks fail after deployment, the `current` symlink is restored to the previous release automatically.

For manual rollback:

```bash
# List all releases (most recent first)
ls -lt /opt/eureadyseller/releases/

# Switch back to a previous release
RELEASE_ID="20260524-120000"
sudo ln -sfn "/opt/eureadyseller/releases/$RELEASE_ID" /opt/eureadyseller/current
sudo systemctl reload caddy

# Verify
curl -I https://eureadyseller.com
```

---

## Deployment Safety Rules

1. **GitHub origin/main is the only source of truth.**
   Never edit files directly on the server and deploy from there. All changes must go through GitHub: edit locally → push to origin/main → run `deploy.sh`.

2. **Server requires a GitHub Deploy Key to push.**
   If you ever need to push from the server (e.g., emergency hotfix), configure a read-only Deploy Key. The `deploy.sh` script never pushes — it only pulls.

3. **External smoke failure triggers automatic rollback.**
   If `npm run external:smoke` fails after deployment, `deploy.sh` restores the previous release automatically. The live site is never left in a broken state.

4. **Never deploy unpushed code.**
   The `deploy.sh` script blocks deployment if the local branch has commits not pushed to origin/main. Always push first, then deploy.

5. **All quality gates must pass before deploying.**
   `deploy.sh` runs `npm run verify` and waits for the GitHub Quality Gate. Do not bypass these checks. Do not use `SKIP_GITHUB_CI_WAIT=1` routinely — only in emergencies.

---

## Directory Layout

```
/opt/eureadyseller/
├── repo/              # Git clone of the repository
│   ├── scripts/
│   │   └── deploy.sh.template  # Template (in Git)
│   ├── dist/          # Built static files
│   └── node_modules/
├── releases/          # Timestamped releases
│   ├── 20260524-120000/
│   └── 20260525-080000/
├── current -> /opt/eureadyseller/releases/20260525-080000  # Symlink
├── deploy.sh         # Executable deploy script (copied from template)
└── deploy.env        # Environment variables (NOT in Git)
```

---

## GitHub Actions CI/CD

A GitHub Actions workflow should be configured as the **Quality Gate**:

`.github/workflows/quality-gate.yml` (or similar):

```yaml
name: EUReadySeller Quality Gate

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run verify
```

The `deploy.sh` script on the server polls this workflow run and waits for it to pass before deploying.

---

## GitHub External Smoke Workflow

`.github/workflows/external-smoke.yml` runs external smoke tests from GitHub's infrastructure:

- **workflow_dispatch** — triggered manually or by `deploy.sh`
- **schedule** — runs daily at 06:00 UTC
- Does NOT auto-trigger on push (only on `workflow_dispatch` and `schedule`)

---

## DNS Setup

```
A record: eureadyseller.com → YOUR_SERVER_IP
A record: www.eureadyseller.com → YOUR_SERVER_IP (redirects to main)
```

---

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
# Check current symlink
readlink /opt/eureadyseller/current

# Check release directory has files
ls /opt/eureadyseller/current/

# Check Caddy is serving correct directory
sudo cat /etc/caddy/Caddyfile
```

### GitHub API rate limit exceeded
```bash
# Add GITHUB_TOKEN to deploy.env
# Or skip CI wait temporarily
SKIP_GITHUB_CI_WAIT=1 /opt/eureadyseller/deploy.sh
```

---

## Legacy: Manual Deploy (without deploy.sh)

If `deploy.sh` is unavailable:

```bash
cd /opt/eureadyseller/repo
git fetch origin
git reset --hard origin/main
npm install
npm run verify
RELEASE_ID=$(date +%Y%m%d-%H%M%S)
mkdir -p /opt/eureadyseller/releases/$RELEASE_ID
cp -r dist/* /opt/eureadyseller/releases/$RELEASE_ID/
ln -sfn /opt/eureadyseller/releases/$RELEASE_ID /opt/eureadyseller/current
sudo systemctl reload caddy
npm run external:smoke
```
