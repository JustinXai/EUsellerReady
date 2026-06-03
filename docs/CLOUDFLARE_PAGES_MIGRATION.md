# EUReadySeller: Cloudflare Pages Migration Guide

> **Status:** COMPLETE — Production is live on Cloudflare Pages. Migration references preserved for rollback planning and future agents.

## Current Deployment Model

| Element | Detail |
|---|---|
| Hosting | Cloudflare Pages (Git integration) |
| Project name | `eusellerready` |
| Production branch | `main` |
| Build command | `npm run cf:build` |
| Build output directory | `dist/` |
| Custom domains | `https://eureadyseller.com` (canonical), `https://www.eureadyseller.com` |
| www behavior | Serves same content (Cloudflare Pages default) |
| HTTPS | Cloudflare Universal SSL (automatic) |
| HTTP → HTTPS | 301 redirect (Cloudflare enforced) |
| Non-slash → slash | 308 redirect (Cloudflare Pages default) |
| Preview URL | `https://eusellerready.pages.dev` |
| Old server | Retained for rollback only (3–7 days post-cutover) |

## Old Server (Rollback Only — Do Not Use for Production Releases)

| Element | Detail |
|---|---|
| Location | `/opt/eureadyseller/` on VPS |
| Web server | Caddy |
| Normal production use | **Deprecated** — do not use `npm run deploy:server` for releases |
| Rollback use | Emergency recovery only |
| Decommission window | 3–7 days after Cloudflare Pages cutover verified |

## Cloudflare Pages Project Settings

| Setting | Value |
|---|---|
| Project name | `eusellerready` |
| Production branch | `main` |
| Build command | `npm run cf:build` |
| Build output directory | `dist` |
| Root directory | `/` (repo root) |
| Environment variables | None required (static build, no server secrets) |

## Migration Verification Results (2026-06-03)

All checks passed on 2026-06-03:

| Check | Result |
|---|---|
| Preview URL `pages.dev` | ✅ 200 on root, sitemap, robots, llms, all 5 key pages |
| Custom domain `eureadyseller.com` | ✅ 200 on root, sitemap, robots, llms, all 5 key pages |
| www subdomain | ✅ 200 on `https://www.eureadyseller.com/` |
| HTTP → HTTPS redirect | ✅ 301 on `http://eureadyseller.com/` and `http://www.eureadyseller.com/` |
| Non-slash → slash | ✅ 308 redirect on Germany EPR, France EPR, EU RP Service |
| Canonical URLs | ✅ All canonicals point to `https://eureadyseller.com/` (not `pages.dev`) |
| sitemap.xml content | ✅ Contains EU RP Service URL and all 22 routes |
| robots.txt | ✅ Has `Sitemap: https://eureadyseller.com/sitemap.xml` |
| llms.txt | ✅ Contains EU RP Service URL and all 22 routes |
| Contamination check | ✅ Zero matches for RutaAPI, LinkAI, SellerFixHub, ExtensionFixes, lucide-register.de |
| `external:smoke` | ✅ PASS — 22/22 HTTP 200, H1 verified, sitemap 22/22, llms 22/22, structural checks pass |

## Pre-Cutover Checklist (Reference — Migration Complete)

- [x] Cloudflare Pages project created and linked to `main`
- [x] `npm run cf:build` passes in Cloudflare CI
- [x] `https://eusellerready.pages.dev` verified
- [x] Old server kept online for rollback
- [x] Custom domain DNS cutover performed
- [x] All live checks passed on custom domain

## Pages.dev Preview Verification Commands (Reference)

Run these on the preview URL to verify before DNS cutover:

```bash
# Root
curl -sI https://eusellerready.pages.dev/

# Trailing-slash canonical
curl -sI https://eusellerready.pages.dev/gpsr-compliance-for-amazon-sellers/

# Non-slash redirect (should return 308 → trailing slash)
curl -sI https://eusellerready.pages.dev/germany-epr-packaging-registration

# Sitemap
curl -sI https://eusellerready.pages.dev/sitemap.xml

# Robots
curl -sI https://eusellerready.pages.dev/robots.txt

# llms.txt
curl -sI https://eusellerready.pages.dev/llms.txt

# Key page smoke
curl -sI https://eusellerready.pages.dev/eu-responsible-person-service/
curl -sI https://eusellerready.pages.dev/germany-epr-packaging-registration/
curl -sI https://eusellerready.pages.dev/france-epr-packaging-registration/

# Confirm no contamination on pages.dev (must not exist)
curl -sI https://eusellerready.pages.dev/lucide-register.de/
```

## Custom Domain Cutover Checklist (Reference — Cutover Complete)

- [x] Add custom domain: `eureadyseller.com` in Cloudflare Pages dashboard
- [x] SSL certificate provisioned (Cloudflare Universal SSL)
- [x] DNS record set to **Proxied** (orange cloud)
- [x] `https://eureadyseller.com/` returns HTTP 200 with correct content
- [x] Key pages tested: Germany EPR, France EPR, GPSR Amazon, EU RP Service — all 200
- [x] Non-slash redirect confirmed on custom domain
- [x] sitemap, robots, llms all return 200 on custom domain
- [x] `external:smoke` PASS on production

## Post-Cutover GSC Checks

- [ ] Submit `https://eureadyseller.com/sitemap.xml` to Google Search Console (if not already submitted)
- [ ] Check GSC for any sudden 404s or canonical errors
- [ ] Monitor impressions/clicks for 1–2 weeks
- [ ] If performance drops, compare with old server baseline and investigate

## Rollback Plan

If Cloudflare Pages causes issues after cutover:

1. In Cloudflare DNS, set `eureadyseller.com` A/AAAA record back to the old server IP (or CNAME back to old server hostname).
2. Set DNS back to **DNS-only** (grey cloud) temporarily if HTTPS breaks.
3. Old server remains online for **3–7 days** after cutover as a precaution.
4. Redeploy on old server if needed: `ssh euready "/opt/eureadyseller/deploy.sh"` — only for emergency recovery.
5. After rollback, investigate the Cloudflare Pages issue and re-verify before attempting cutover again.

## Cloudflare Pages-Specific Notes

### Static output compatibility
- Astro `output: "static"` confirmed — fully compatible with Cloudflare Pages
- No SSR dependencies
- No server-side environment variables required
- No Caddy-specific rewrite rules needed

### Security headers via `_headers`
`public/_headers` is copied into `dist/` at build time. Cloudflare Pages serves it automatically at the edge.

### Trailing-slash redirect behavior
Cloudflare Pages enforces non-slash → slash redirects via 308 by default. No `public/_redirects` file needed.

### What NOT to do
- Do not remove the old server until GSC is stable (3–7 days)
- Do not disable HTTPS on Cloudflare Pages
- Do not use Cloudflare Pages `dev` branch for production
- Do not use `npm run deploy:server` for routine production releases

## Keeping Old Server Online After Cutover

| Period | Action |
|---|---|
| 0–24 hours after cutover | Keep old server online, monitor traffic |
| 24–72 hours | Reduce old server capacity if comfortable |
| 3–7 days | Old server can be stopped after GSC stabilises |
| 7+ days | Old server can be decommissioned entirely |
