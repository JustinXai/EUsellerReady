# EUReadySeller: Cloudflare Pages Migration Guide

> **Status:** PREPARATION ONLY — Do not switch DNS or cut over yet.

## Current Deployment Model

| Element | Detail |
|---|---|
| Hosting | VPS/VM at `/opt/eureadyseller/` |
| Web server | Caddy (handles HTTPS, redirects, serving) |
| Deploy script | `/opt/eureadyseller/deploy.sh` (git pull → npm install → build → quality gate → symlink → Caddy reload → smoke) |
| Domain | eureadyseller.com |
| Traffic | 100% on current server |

## Target Deployment Model

| Element | Detail |
|---|---|
| Hosting | Cloudflare Pages (Git integration) |
| Framework preset | Astro (static) |
| Production branch | `main` |
| Build command | `npm run cf:build` |
| Build output directory | `dist/` |
| Domain | eureadyseller.com (via Cloudflare DNS, proxied after cutover) |
| Preview URL | `https://eureadyseller.pages.dev` |

## Required Cloudflare Pages Settings

| Setting | Value |
|---|---|
| Project name | `eureadyseller` (or similar) |
| Production branch | `main` |
| Build command | `npm run cf:build` |
| Build output directory | `dist` |
| Root directory | `/` (repo root) |
| Environment variables | None required (static build, no server secrets) |

## Pre-Cutover Checklist

- [ ] Cloudflare Pages project created and linked to `main`
- [ ] `npm run cf:build` passes in Cloudflare CI
- [ ] `https://eureadyseller.pages.dev` verified:
  - [ ] HTTP 200 on root
  - [ ] HTTP 200 on trailing-slash canonical URLs
  - [ ] sitemap.xml present and correct
  - [ ] robots.txt present
  - [ ] llms.txt present
  - [ ] `_headers` served correctly (if added)
  - [ ] Non-slash → trailing-slash redirect behavior confirmed
  - [ ] H1, title, canonical on key pages
  - [ ] No cross-project contamination
  - [ ] No `lucide-register.de` or wrong domain references
- [ ] Old server kept online for rollback
- [ ] Cloudflare DNS zone verified and ready to proxy

## Pages.dev Preview Verification Commands

Run these on the preview URL before DNS cutover:

```bash
# Root
curl -sI https://eureadyseller.pages.dev/

# Trailing-slash canonical
curl -sI https://eureadyseller.pages.dev/gpsr-compliance-for-amazon-sellers/

# Non-slash redirect (should return 301/302 → trailing slash)
curl -sI -o /dev/null -w "%{http_code} -> %{redirect_url}" https://eureadyseller.pages.dev/gpsr-compliance-for-amazon-sellers

# Sitemap
curl -sI https://eureadyseller.pages.dev/sitemap.xml

# Robots
curl -sI https://eureadyseller.pages.dev/robots.txt

# llms.txt
curl -sI https://eureadyseller.pages.dev/llms.txt

# HTTP → HTTPS on root (Cloudflare enforces this automatically for custom domains)
curl -sI -o /dev/null -w "%{http_code}" http://eureadyseller.pages.dev/

# Key page smoke
curl -sI https://eureadyseller.pages.dev/eu-responsible-person-service/
curl -sI https://eureadyseller.pages.dev/germany-epr-packaging-registration/
curl -sI https://eureadyseller.pages.dev/france-epr-packaging-registration/

# Confirm no contamination on pages.dev (must not exist)
curl -sI https://eureadyseller.pages.dev/lucide-register.de/
```

## Custom Domain Cutover Checklist

After preview is verified clean, in the Cloudflare Pages dashboard:

- [ ] Add custom domain: `eureadyseller.com`
- [ ] Cloudflare will provision HTTPS automatically (Universal SSL)
- [ ] Set Cloudflare DNS record to **Proxied** (orange cloud), not DNS-only
- [ ] Wait for SSL certificate to provision (usually 1–5 minutes)
- [ ] Test `https://eureadyseller.com/` — must return 200 with correct content
- [ ] Test `https://eureadyseller.com/germany-epr-packaging-registration/` — 200
- [ ] Test `https://eureadyseller.com/france-epr-packaging-registration/` — 200
- [ ] Test `https://eureadyseller.com/gpsr-compliance-for-amazon-sellers/` — 200
- [ ] Test non-slash redirect on custom domain: `curl -sI -o /dev/null -w "%{http_code}" https://eureadyseller.com/germany-epr-packaging-registration` → should be 301/302
- [ ] Test sitemap: `https://eureadyseller.com/sitemap.xml`
- [ ] Confirm `https://eureadyseller.com` still hits old server (TTL not expired yet)
- [ ] Once confirmed Cloudflare is serving correctly, update DNS TTL to a low value
- [ ] After 24h, old server can be safely decommissioned (see rollback plan)

## Rollback Plan

If Cloudflare Pages causes issues after cutover:

1. In Cloudflare DNS, set `eureadyseller.com` A/AAAA record back to the old server IP (or CNAME back to old server hostname).
2. Set DNS back to **DNS-only** (grey cloud) temporarily if HTTPS breaks.
3. Old server remains online for **3–7 days** after cutover as a precaution.
4. Redeploy on old server if needed: `ssh euready "/opt/eureadyseller/deploy.sh"` from the existing deployment.
5. After rollback, investigate the Cloudflare Pages issue and re-verify before attempting cutover again.

## Post-Cutover GSC Checks

After DNS has propagated (48–72 hours):

- [ ] Submit `https://eureadyseller.com/sitemap.xml` to Google Search Console
- [ ] Check GSC for any sudden 404s or canonical errors
- [ ] Monitor impressions/clicks for 1–2 weeks
- [ ] If performance drops, compare with old server baseline and investigate

## Cloudflare Pages-Specific Notes

### Static output compatibility
- Astro `output: "static"` confirmed — fully compatible with Cloudflare Pages
- No SSR dependencies
- No server-side environment variables required
- No Caddy-specific rewrite rules needed

### Security headers via `_headers`
`public/_headers` is copied into `dist/` at build time. Add it to the repo so Cloudflare Pages serves it automatically at the edge.

### Trailing-slash redirect behavior
Cloudflare Pages serves static files with directory-style URLs. By default, `/germany-epr-packaging-registration` may serve the file at `/germany-epr-packaging-registration/index.html` as a 200 (not a redirect). If strict redirect behavior is needed, add redirect rules to `public/_redirects`.

### What NOT to do during migration
- Do not remove the old server until Cloudflare is verified
- Do not switch DNS until preview URL is verified clean
- Do not disable HTTPS on Cloudflare Pages
- Do not use Cloudflare Pages `dev` branch for production

## Keeping Old Server Online After Cutover

| Period | Action |
|---|---|
| 0–24 hours after cutover | Keep old server online, monitor traffic |
| 24–72 hours | Reduce old server capacity if comfortable |
| 3–7 days | Old server can be stopped after GSC stabilises |
| 7+ days | Old server can be decommissioned entirely |
