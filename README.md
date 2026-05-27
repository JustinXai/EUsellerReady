# EUReadySeller MVP Foundation Report

**Date:** May 24, 2026
**Version:** 0.1.0
**Site:** https://eureadyseller.com

---

## 1. Project Summary

EUReadySeller is a Phase 1 MVP static SEO and lead-generation site built with Astro + TypeScript. The site helps ecommerce sellers (Shopify, Amazon, Etsy, WooCommerce, DTC brands) identify EU compliance topics to review before selling physical products to EU consumers. Phase 1 covers GPSR, EU Responsible Person, and EPR packaging topics. No login, payment, database, or backend is included.

---

## 2. Files Created / Changed

### Config
- `package.json` — Astro 4.x, TypeScript, all build/validate scripts
- `astro.config.mjs` — static output, site URL
- `tsconfig.json` — strict TypeScript

### Data Layer (`src/data/`)
- `site.ts` — Site-wide configuration (name, URL, CTA, disclaimer, brand description)
- `routes.ts` — All 7 registered routes with SEO metadata, priority, changefreq, sitemap/llms flags
- `navigation.ts` — Nav items, footer link sections
- `officialSources.ts` — GPSR, EPR, EU RP official source references
- `bannedClaims.ts` — 13 banned compliance phrases + safe phrase whitelist
- `faq.ts` — 5 FAQ sets (homepage, checklist, GPSR, EU RP, EPR, quotes, checker) × 5 questions each
- `checkerRules.ts` — Interactive checker answer logic, topic catalog, computeTopics()

### Lib (`src/lib/`)
- `seo.ts` — buildSEOMeta() utility
- `schema.ts` — JSON-LD builders: WebSite, WebPage, FAQPage, SoftwareApplication, BreadcrumbList
- `slug.ts` — slugify(), titleToSlug(), parseSlug()
- `route-utils.ts` — getCanonical(), isValidInternalLink(), getRelatedPages()

### Components (`src/components/`)
- `Layout.astro` — Base layout with slot
- `Header.astro` — Sticky nav with mobile hamburger
- `Footer.astro` — Multi-column footer with disclaimer
- `SEOHead.astro` — Title, meta, canonical, OG, Twitter card, JSON-LD injection
- `CTABox.astro` — Primary/secondary CTA button
- `FAQBlock.astro` — Expandable FAQ accordion (details/summary)
- `AISummary.astro` — AI-readable summary block (green)
- `DisclaimerBlock.astro` — Fixed disclaimer block (yellow)
- `OfficialSources.astro` — Official sources list with external links
- `LeadForm.astro` — Static lead form with mailto fallback + form backend notice
- `PageHeader.astro` — Gradient page header with H1 + subheading
- `GuideCard.astro` — Guide/article card grid

### Styles (`src/styles/`)
- `global.css` — Mobile-first CSS, typography, hero, quick-answer, clusters, checklists, CTA sections, responsive utilities

### Pages (`src/pages/`)
- `index.astro` — Homepage with hero, quick answer, clusters, guide cards, FAQ, disclaimer
- `eu-seller-compliance-checklist.astro` — Full checklist with GPSR, EU RP, EPR sections, mistakes, CTA
- `gpsr-compliance-for-shopify.astro` — GPSR guide with checklist, mistakes, sources, FAQ, CTA
- `eu-responsible-person-service.astro` — EU RP service guide with checklist, mistakes, sources, FAQ, CTA
- `epr-compliance-for-shopify.astro` — EPR guide with packaging checklist, mistakes, sources, FAQ, CTA
- `request-eu-compliance-quotes.astro` — Lead form page with topics, FAQ, disclaimer
- `tools/eu-seller-compliance-checker.astro` — 8-question interactive checker with result cards

### Scripts (`scripts/`)
- `generate-sitemap.mjs` — Generates `public/sitemap.xml`
- `generate-robots.mjs` — Generates `public/robots.txt`
- `generate-llms.mjs` — Generates `public/llms.txt`
- `validate-routes.mjs` — Checks page existence, sitemap coverage, llms coverage
- `validate-seo.mjs` — Checks title/desc/H1 uniqueness, canonical correctness
- `validate-claims.mjs` — Scans for 13 banned compliance phrases
- `validate-links.mjs` — Validates all internal hrefs
- `validate-schema.mjs` — Validates JSON-LD presence and FAQPage mainEntity
- `build-report.mjs` — Outputs comprehensive build/SEO/claim summary report

### Deployment Files
- `Dockerfile` — Multi-stage: node:20-alpine build → alpine+caddy production
- `Caddyfile` — Static file server with gzip/zstd, security headers, cache rules, www redirect
- `docker-compose.yml` — `eureadyseller-web` service with healthcheck
- `.gitignore` — node_modules, dist, .env, etc.
- `.env.example` — Template for environment variables

### Documentation (`docs/`)
- `00-current-state.md` — Current MVP state and what was built
- `01-decisions.md` — Key architectural and design decisions
- `02-risks.md` — Known risks and limitations
- `03-content-plan.md` — Phase 1 summary and Phase 2 content roadmap
- `04-deployment.md` — Server deployment guide
- `05-provider-outreach.md` — Provider outreach strategy
- `09-ai-handoff.md` — AI/LLM handoff notes

### Root
- `README.md` — Full developer guide: local dev, validation, GitHub push, server deploy, rollback

---

## 3. Page List

| # | Path | Title | Category | Priority |
|---|------|-------|----------|----------|
| 1 | `/` | EUReadySeller - Know What Your Store Needs Before Selling to the EU | home | 1.0 |
| 2 | `/eu-seller-compliance-checklist/` | EU Seller Compliance Checklist for Ecommerce Sellers | checklist | 0.9 |
| 3 | `/gpsr-compliance-for-shopify/` | GPSR Compliance for Shopify Sellers | platform-guide | 0.8 |
| 4 | `/eu-responsible-person-service/` | EU Responsible Person Service for Ecommerce Sellers | service | 0.8 |
| 5 | `/epr-compliance-for-shopify/` | EPR Compliance for Shopify Sellers | platform-guide | 0.8 |
| 6 | `/request-eu-compliance-quotes/` | Request EU Compliance Provider Quotes | quote-request | 0.7 |
| 7 | `/tools/eu-seller-compliance-checker/` | EU Seller Compliance Checker | tool | 0.9 |

---

## 4. Tool Implementation Summary

**Tool:** EU Seller Compliance Checker (`/tools/eu-seller-compliance-checker/`)

**Type:** Client-side interactive JavaScript scoping tool

**Questions (8):**
1. Business location (EU / UK / US / Canada / China / Other non-EU)
2. Selling platform (Shopify / Amazon / Etsy / WooCommerce / Custom / Multiple)
3. Product category (General goods / Apparel / Electronics / Toys / Cosmetics / Batteries / Home goods / Other)
4. Physical goods to EU consumers? (Yes / No / Not sure)
5. Uses product packaging? (Yes / No / Not sure)
6. Already has EU Responsible Person? (Yes / No / Not sure)
7. Sells in Germany or France? (Germany / France / Both / Neither / Not sure)
8. Sells digital/ecommerce services to EU? (Yes / No / Not sure)

**Result logic:**
- Physical goods = Yes → GPSR topic
- Non-EU location + no EU RP → EU Responsible Person topic
- Packaging + physical goods → EPR packaging topic (with Germany/France variant)
- Digital services = Yes → EAA accessibility (related topic)

**Output per topic:**
- Topic name + icon
- Why it may be relevant (1-2 sentences)
- What to prepare (5 bullet points)
- Suggested next step
- Link to related guide

**Safety:** All results use "Likely topics to review" framing. No compliance determination.

---

## 5. SEO Implementation Summary

**Per-page requirements implemented:**
- ✅ Unique `<title>` per page
- ✅ Unique `<meta name="description">` per page
- ✅ Unique `<h1>` per page
- ✅ `<link rel="canonical">` pointing to `https://eureadyseller.com[path]/`
- ✅ Open Graph tags (og:title, og:description, og:url, og:site_name, og:locale)
- ✅ Twitter Card (`summary_large_image`)
- ✅ All pages static-generated

**JSON-LD per page type:**
- Homepage: `WebSite` + `WebPage` + `FAQPage`
- Content pages: `WebPage` + `FAQPage`
- Tool page: `WebPage` + `WebApplication` + `FAQPage`

**AI-readable summary block** on every page (green banner labeled "AI-readable summary")

**SEO scripts:**
- `validate-seo.mjs` — checks emptiness, uniqueness, canonical correctness

---

## 6. JSON-LD Implementation Summary

| Schema Type | Used On | Key Fields |
|------------|---------|-----------|
| WebSite | Homepage | name, url, description, publisher, potentialAction |
| WebPage | All pages | name, description, headline, url, publisher |
| FAQPage | All pages | mainEntity[].name + acceptedAnswer.text |
| WebApplication | Tool page | name, description, url, applicationCategory, offers |

- All JSON-LD injected via `<script type="application/ld+json">`
- `validate-schema.mjs` checks all JSON-LD is parseable and FAQPage has mainEntity

---

## 7. Sitemap / robots.txt / llms.txt Status

**sitemap.xml** — Generated at `public/sitemap.xml`
- All 7 pages included with correct priority and changefreq
- Lastmod set to 2026-05-24
- Valid XML sitemap format

**robots.txt** — Generated at `public/robots.txt`
- Allows all crawlers
- Blocks GPTBot, ChatGPT-User, CCBot
- Points to sitemap.xml

**llms.txt** — Generated at `public/llms.txt`
- Site name, purpose, core audience
- Core topics (GPSR, EU RP, EPR)
- All 7 page summaries
- Tool page description
- Full compliance disclaimer

---

## 8. Claim-Safety Validation Result

**Banned phrases checked (13):**
- guaranteed compliance
- certified compliance
- fully compliant
- become compliant instantly
- legal advice (context-sensitive: "not legal advice" is allowed)
- we are lawyers
- official EU certified
- EU-approved service
- compliant by using this tool
- this tool determines compliance
- we guarantee your products are compliant
- avoid all fines
- legally required in every case

**Status:** All pages use safe language. "not legal advice" appears in disclaimer and is permitted. No violations detected.

---

## 9. Local Commands to Run

```bash
# Install dependencies
npm install

# Local development
npm run dev

# Full production build + generation
npm run build

# Run all validations
npm run verify

# Individual validation steps
npm run validate:routes
npm run validate:seo
npm run validate:claims
npm run validate:links
npm run validate:schema
npm run report

# Preview production build
npm run preview

# Generate files individually
npm run generate:sitemap
npm run generate:robots
npm run generate:llms
```

---

## 10. GitHub Push Commands

```bash
# Initialize git (if not already initialized)
git init

# Set remote origin
git remote add origin git@github.com:JustinXai/EUsellerReady.git
# If remote already exists:
git remote -v
git remote set-url origin git@github.com:JustinXai/EUsellerReady.git

# Create main branch
git branch -M main

# Stage all files
git add .

# Commit
git commit -m "Initial EUReadySeller MVP"

# Push to GitHub
git push -u origin main
```

---

## 11. Server Deployment Commands

### Option A: Docker (recommended)

```bash
# Build the Docker image locally
docker build -t eureadyseller:latest .

# Run with docker-compose
docker-compose up -d

# Check logs
docker logs -f eureadyseller-web

# Restart
docker-compose restart eureadyseller-web

# Rollback (keep previous image tag)
docker tag eureadyseller:latest eureadyseller:previous
docker pull eureadyseller:previous
docker-compose stop
docker tag eureadyseller:previous eureadyseller:latest
docker-compose up -d
```

### Option B: CI/CD with GitHub Actions

Push to `main` branch triggers:
1. `npm ci`
2. `npm run verify`
3. `docker build -t eureadyseller:$GITHUB_SHA .`
4. Push image to registry
5. SSH to server and `docker-compose pull && docker-compose up -d`

### Server requirements
- Docker + Docker Compose installed
- Port 80 and 443 open
- DNS A record pointing to server IP

---

## 12. Known Limitations

1. **Lead form has no backend** — Form shows mailto fallback and "backend coming soon" notice. No database, no email service, no CRM.
2. **No analytics** — No Google Analytics, Search Console, or tracking pixels configured.
3. **No CI/CD pipeline** — GitHub Actions workflow not yet created.
4. **No image optimization** — No image processing pipeline or CDN.
5. **Static sitemap generation** — sitemap.xml is generated at build time; needs rebuilding if pages are added.
6. **No A/B testing** — No experimentation framework.
7. **English only** — No i18n or localization support.
8. **No dark mode** — Single color scheme only.
9. **FAQ data duplication** — FAQ arrays are duplicated across pages; could be consolidated.
10. **Interactive checker** — Client-side JS only; no server-side persistence or result sharing.

---

## 14. One-Command Deployment

From the server, a single command handles everything: git checks, build, GitHub CI gate, release creation, Caddy reload, smoke tests, and optional GitHub-hosted external smoke.

```bash
/opt/eureadyseller/deploy.sh
```

**What it does automatically:**

| Step | Action |
|------|--------|
| 1 | Check working tree is clean |
| 2 | Confirm upstream branch exists |
| 3 | Confirm all local commits are pushed to origin/main |
| 4 | Pull latest from origin/main (`git reset --hard origin/main`) |
| 5 | `npm install` |
| 6 | `npm run verify` (local quality gate) |
| 7 | Wait for GitHub Quality Gate to pass (polls GitHub Actions) |
| 8 | Capture previous release path (for rollback) |
| 9 | Create timestamped release directory under `$APP_DIR/releases/` |
| 10 | Copy `dist/` to new release |
| 11 | Switch `current` symlink to new release |
| 12 | `sudo systemctl reload caddy` |
| 13 | Restart `eureadyseller-message-api` if installed |
| 14 | curl smoke tests on 5 key URLs |
| 15 | `npm run external:smoke` (checks live site — **auto-rollback on failure**) |
| 16 | Optionally trigger GitHub-hosted external smoke |

**Skip GitHub CI wait** (e.g., GitHub is down):

```bash
SKIP_GITHUB_CI_WAIT=1 /opt/eureadyseller/deploy.sh
```

---

## Deployment Safety Rules

1. **GitHub origin/main is the only source of truth.**
   Never edit files directly on the server and deploy from there. All changes must go through GitHub.

2. **Server requires a GitHub Deploy Key to push.**
   If you ever need to push from the server, configure a read-only Deploy Key. The `deploy.sh` script never pushes — it only pulls.

3. **External smoke failure triggers automatic rollback.**
   If `npm run external:smoke` fails, `deploy.sh` restores the previous release automatically. The live site is never left broken.

4. **Never deploy unpushed code.**
   The `deploy.sh` script blocks deployment if local branch has commits not pushed to origin/main.

5. **All quality gates must pass before deploying.**
   Do not routinely use `SKIP_GITHUB_CI_WAIT=1` — only in emergencies.

---

## 15. Optional GitHub-Hosted External Smoke

By default, `deploy.sh` runs `external:smoke` from the server. To also trigger a GitHub Actions external smoke workflow (runs from GitHub's infrastructure, simulating a real user):

1. Create `/opt/eureadyseller/deploy.env` on the server:

```bash
sudo nano /opt/eureadyseller/deploy.env
```

2. Add your GitHub Personal Access Token:

```bash
GITHUB_TOKEN=ghp_your_token_here
```

3. Run deploy with the flag:

```bash
RUN_GITHUB_EXTERNAL_SMOKE=1 /opt/eureadyseller/deploy.sh
```

**Token requirements:**
- `Actions: read/write` — needed for `workflow_dispatch`
- `Contents: read` — for higher API rate limits
- `Metadata: read` — always included

**Security:** The token stays only on the server (`/opt/eureadyseller/deploy.env`). It is gitignored and never committed to the repository.

---

## 16. GitHub CI Token Requirements

If you only need `deploy.sh` to **wait** for the GitHub Quality Gate:

- **Public repo:** No token needed for read-only API access (60 req/hr limit).
- **Private repo or rate limited:** Set `GITHUB_TOKEN` in `deploy.env`.

If you also need `deploy.sh` to **trigger** GitHub-hosted external smoke:

- **Token required.** See Section 15 above.

---

## 17. Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `GITHUB_REPOSITORY` | `JustinXai/EUsellerReady` | GitHub repo slug |
| `GITHUB_CI_WORKFLOW_NAME` | `EUReadySeller Quality Gate` | Workflow name to wait for |
| `GITHUB_EXTERNAL_SMOKE_WORKFLOW` | `external-smoke.yml` | Workflow file for GitHub external smoke |
| `SITE_URL` | `https://eureadyseller.com` | Live site URL |
| `SKIP_GITHUB_CI_WAIT` | `0` | Set to `1` to skip CI wait |
| `RUN_GITHUB_EXTERNAL_SMOKE` | `0` | Set to `1` to trigger GitHub external smoke |
| `GITHUB_TOKEN` | _(empty)_ | GitHub PAT (optional for CI wait, required for trigger) |
| `GITHUB_CI_TIMEOUT_SECONDS` | `600` | Max wait time for CI gate (seconds) |
| `GITHUB_EXTERNAL_SMOKE_TIMEOUT_SECONDS` | `600` | Max wait time for GitHub external smoke (seconds) |

See `deploy.env.example` for the full template.

---

## 18. Server-Side Script Setup

On the server, copy the deploy script template to the right location:

```bash
sudo cp /opt/eureadyseller/repo/scripts/deploy.sh.template /opt/eureadyseller/deploy.sh
sudo chmod +x /opt/eureadyseller/deploy.sh
```

Optional: create `deploy.env` for GitHub integration:

```bash
sudo nano /opt/eureadyseller/deploy.env
# Add GITHUB_TOKEN=ghp_your_token if needed
```

---

## 19. Rollback

If a deploy fails or the site breaks:

```bash
# List releases (oldest last)
ls -lt /opt/eureadyseller/releases/

# Switch back to a previous release
RELEASE_ID="20260524-120000"
sudo ln -sfn "/opt/eureadyseller/releases/$RELEASE_ID" /opt/eureadyseller/current
sudo systemctl reload caddy
```

---

## 20. Common Deployment Failures

| Error | Cause | Fix |
|-------|-------|-----|
| `Working tree is dirty` | Uncommitted changes on server | `git add . && git commit` or `git stash` |
| `Local branch has commits not pushed` | Server has unpushed commits | `git push origin main` before deploying |
| `Local branch is behind origin` | origin/main has new commits | `git pull --ff-only` |
| `GitHub Quality Gate failed` | CI checks failing on GitHub | Fix the failing checks, push again |
| `External smoke failed` | Site serving wrong content or missing files | `current` symlink auto-restored to previous release. Check `current` symlink, verify Caddy config |
| `Caddy reload failed` | Caddy misconfigured | `sudo journalctl -u caddy -n 50` |
| `Message API restart failed` | Service misconfigured | `sudo journalctl -u eureadyseller-message-api -n 50` |

---

## 21. GitHub Token Security

- **Never commit `deploy.env`** — it is in `.gitignore`
- **Never put a real token in Git** — not in GitHub Actions secrets (unless intentional), not in any committed file
- **Token location:** Server-only file at `/opt/eureadyseller/deploy.env`
- **Token scope:** Minimal — only `Actions: read/write` and `Contents: read` needed

---

## 22. New npm Scripts Added

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run ci:wait` | `node scripts/wait-github-ci.mjs` | Wait for GitHub Quality Gate |
| `npm run external:github` | `node scripts/trigger-github-external-smoke.mjs` | Trigger GitHub external smoke workflow |
| `npm run validate:artifacts` | `node scripts/validate-artifacts.mjs` | Validate dist/robots.txt, sitemap.xml, llms.txt |

`ci:wait` and `external:github` are NOT part of `verify`. They are deployment-time tools.
`validate:artifacts` IS part of `verify` — it checks the built artifacts are correct.

---

## 23. Monitoring & Observability

After a deploy, check the live site:

```bash
# Check HTTP status of key pages
curl -s -o /dev/null -w "%{http_code}" https://eureadyseller.com
curl -s -o /dev/null -w "%{http_code}" https://eureadyseller.com/sitemap.xml

# Check Caddy logs
sudo journalctl -u caddy -n 20 --no-pager

# Check Message API
curl http://127.0.0.1:8787/health

# View current release
readlink /opt/eureadyseller/current

# List all releases
ls -lt /opt/eureadyseller/releases/
```

---

## 24. Known Limitations (Updated)

1. **Lead form has no backend** — Form shows mailto fallback and "backend coming soon" notice. No database, no email service, no CRM.
2. **No analytics** — No Google Analytics, Search Console, or tracking pixels configured.
3. **No image optimization** — No image processing pipeline or CDN.
4. **Static sitemap generation** — sitemap.xml is generated at build time; needs rebuilding if pages are added.
5. **No A/B testing** — No experimentation framework.
6. **English only** — No i18n or localization support.
7. **No dark mode** — Single color scheme only.
8. **FAQ data duplication** — FAQ arrays are duplicated across pages; could be consolidated.
9. **Interactive checker** — Client-side JS only; no server-side persistence or result sharing.
10. **GitHub API rate limit** — Without `GITHUB_TOKEN`, CI wait polls at 60 req/hr. Fine for occasional deploys; consider token for heavy use.

---

## 25. Page Factory

EUReadySeller uses a **Page Factory** system to ensure every new page is created consistently with SEO, GEO, Content Factory, and deployment rules.

### Page Factory Commands

```bash
# Scaffold a new page from the roadmap
npm run page:create -- <slug>

# Example
npm run page:create -- germany-epr-packaging-registration
```

### Page Factory Validation

```bash
# Validate page template sections (required sections from pageTemplates.ts)
npm run validate:page-template

# Check no hardcoded page lists in scripts
npm run validate:no-hardcoded-pages

# Check official source topics and page sections
npm run validate:official-sources
```

### How to Add a New Page

1. Add a `planned` item to `src/data/contentRoadmap.ts`
2. Run `npm run page:create -- <slug>` to scaffold the page
3. Fill in the TODO sections with researched content
4. Add FAQ data to `src/data/faq.ts`
5. Ensure official sources exist in `src/data/officialSources.ts`
6. Add the route to `src/data/routes.ts`
7. Change contentRoadmap status from `"planned"` to `"live"`
8. Run `npm run verify`
9. Commit and push
10. Deploy with `/opt/eureadyseller/deploy.sh`

### Cursor Rules

The `.cursor/rules/` directory contains AI agent rules that prevent common mistakes:

- `.cursor/rules/eureadyseller-content.mdc` — Content Factory rules (roadmap-first, required sections, safe language)
- `.cursor/rules/eureadyseller-deploy.mdc` — Deployment safety rules (never edit current/, use deploy.sh)
- `.cursor/rules/eureadyseller-claims.mdc` — Claim safety rules (no guaranteed compliance, required disclaimer)

---

## 27. Historical QA Prevention

This project maintains a Historical QA Prevention Checklist to prevent recurring failures from "local passes but live site broken" patterns.

### Key Principles

| Principle | Explanation |
|-----------|-------------|
| `npm run verify` is not enough | Local build passes but live site may differ due to cache or deployment issues |
| Changed pages need live grep | After any content change, verify the live site with `npm run live:grep` |
| Artifacts need live curl | sitemap.xml, llms.txt, robots.txt should be verified live, not just in dist/ |
| GSC small data should not trigger strategy pivots | Fewer than 10 impressions is noise, not signal |

### Live Grep Commands

```bash
# Verify phrase is present (must)
npm run live:grep -- /gpsr-general-guide/ "GPSR Guide for Ecommerce Sellers" --must

# Verify phrase is absent (must-not)
npm run live:grep -- /gpsr-general-guide/ "old bad phrase" --must-not
```

### Manual Curl Commands

```bash
# Check robots.txt for AI crawler blocks
curl -s https://eureadyseller.com/robots.txt | grep -i "GPTBot\|ChatGPT-User\|CCBot\|Disallow: /" && echo "BAD" || echo "OK"

# Check sitemap includes route
curl -s https://eureadyseller.com/sitemap.xml | grep "route-slug"

# Check llms.txt includes route
curl -s https://eureadyseller.com/llms.txt | grep "route-slug"

# Check page does NOT have old phrase
curl -s https://eureadyseller.com/changed-url/ | grep -i "old bad phrase" && echo "BAD" || echo "OK"
```

### When to Use Each Check

| Change Type | Required Checks |
|------------|----------------|
| New page | verify + live curl H1 + sitemap + llms + GSC submit |
| Content change | verify + live grep old phrase + live grep new phrase |
| Claim wording | verify + live grep + validate:claims review |
| CSS/UI | verify + external:smoke + manual browser check |
| Route rename | verify + live curl old URL + live curl new URL + sitemap + llms |

### Full Checklist

See `docs/11-historical-qa-prevention.md` for the complete Historical QA Prevention Checklist including:

- Common historical failure modes
- Required checks by task type (A-E)
- Required live grep examples
- GSC data interpretation rules
- Pre-deploy checklist

---

## 28. Next Recommended Prompt

> "Add Google Analytics 4 integration, create a Google Search Console verification meta tag, and set up an uptime monitoring cron job on the server."
