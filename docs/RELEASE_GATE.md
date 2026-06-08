# EUReadySeller Release Gate Checklist

Use this checklist for every sprint.

## Before editing
- Confirm the task belongs in the current roadmap.
- Confirm the repo identity is EUReadySeller only.
- Check for prior incidents that might affect wording or release behavior.

## During editing
- Keep scope focused.
- Prefer one page or one guardrail change per sprint.
- Use cautious, educational language.
- Keep canonical URLs trailing slash.

## Before commit
- Run the applicable validation scripts.
- Fix hard claim failures before committing.
- Do not commit if the working tree contains unrelated or risky files.

## Before deployment
- Ensure the branch is committed and pushed to `origin/main`.
- Ensure `npm run cf:build` passes locally before pushing.
- Cloudflare Pages builds automatically from Git integration on push to `main`.
- Do NOT use `npm run deploy:server` for routine production releases (old server is rollback-only).

## Message API release checks (provider intake form)
After any change to `functions/api/messages.ts` or D1 schema:
- [ ] `POST https://eureadyseller.com/api/messages` returns 200 with `{"ok":true,"id":"..."}` (harmless test data only).
- [ ] `GET https://eureadyseller.com/api/messages` returns JSON 405 (not homepage HTML).
- [ ] `OPTIONS` preflight does not block browser submission from `/request-eu-compliance-quotes/`.
- [ ] New test record appears in D1 (`MESSAGE_DB`), not in old server `messages.jsonl`.
- [ ] D1 binding `MESSAGE_DB` and secret `MESSAGE_IP_HASH_SALT` configured in Pages dashboard.

## After deployment
- Run `npm run external:smoke` — targets `https://eureadyseller.com`.
- Verify apex live checks via public curl:
  - HTTP 200 on root and key pages.
  - Non-slash URLs redirect to trailing slash (308).
  - `sitemap.xml`, `robots.txt`, `llms.txt` present.
  - Canonical on key pages points to `https://eureadyseller.com/` (not `pages.dev`).
  - No contamination (no RutaAPI, LinkAI, SellerFixHub, ExtensionFixes, `lucide-register.de`).
- Confirm sitemap and llms coverage for changed/new URLs.
- Submit `https://eureadyseller.com/sitemap.xml` to GSC only after live checks pass.

## Cloudflare Pages Deployment Checks
Cloudflare Pages is the production deployment target as of 2026-06-03 (see `docs/CLOUDFLARE_PAGES_MIGRATION.md`).

### Pre-push (local)
- [ ] Run `npm run cf:build` locally — must pass.
- [ ] Run `git diff -- src/pages` — must be empty (no page content changes).

### After Git push (cloudflare.com dashboard)
Cloudflare Pages builds automatically from Git integration on push to `main`.

### After Cloudflare Pages build succeeds
- [ ] Verify `https://eusellerready.pages.dev` (preview) via public curl:
  - [ ] Root and key pages return HTTP 200.
  - [ ] Non-slash URLs return 308 redirect to trailing slash.
  - [ ] `sitemap.xml`, `robots.txt`, `llms.txt` return 200.
  - [ ] `_headers` served correctly (security headers present).
  - [ ] No contamination (wrong domains, wrong content).
  - [ ] Canonical on key pages points to `https://eureadyseller.com/` not `pages.dev`.

### Custom domain live checks (apex — https://eureadyseller.com)
- [ ] Test `https://eureadyseller.com/` — HTTP 200.
- [ ] Test key pages: Germany EPR, France EPR, GPSR Amazon, EU RP Service — all 200.
- [ ] Non-slash URL on apex redirects to trailing slash.
- [ ] `sitemap.xml` contains all 22 routes.
- [ ] `robots.txt` has correct Sitemap directive.
- [ ] Run `npm run external:smoke` — must PASS.
- [ ] Check GSC for 404s or canonical errors.

### GSC submission
- [ ] Submit `https://eureadyseller.com/sitemap.xml` to GSC **only after** all live checks pass.
- [ ] Monitor GSC for 1–2 weeks post-release.

### Rule of evidence
Public curl output always wins over local checks. Do not mark a release complete until custom domain live checks pass.

### Old server status
The old VPS/Caddy server at `/opt/eureadyseller/` must remain online for **3–7 days** as rollback target. Do not decommission it during this window.

## Final exit criteria
- Final status must be `GSC_READY` or `NEEDS_FIX`.
