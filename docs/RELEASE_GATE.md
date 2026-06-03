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
- Ensure the branch is committed and pushed.
- Ensure validation has passed.
- Deploy only through the approved deployment script when deployment is required.

## After deployment
- Run public live verification with cache-busting.
- Confirm HTTP 200, title/H1, canonical, required phrases, and forbidden phrase absence.
- Confirm sitemap.xml and llms.txt inclusion for changed/new URLs.

## Cloudflare Pages Deployment Checks
When deploying to Cloudflare Pages (see `docs/CLOUDFLARE_PAGES_MIGRATION.md`):

### Before DNS cutover
- [ ] Run `npm run cf:build` locally and confirm it passes.
- [ ] Verify the `pages.dev` preview URL via public curl.
- [ ] Confirm trailing-slash canonical URLs return HTTP 200.
- [ ] Confirm non-slash URLs redirect to trailing-slash (if strict redirect is required).
- [ ] Confirm `sitemap.xml`, `robots.txt`, `llms.txt` are present.
- [ ] Confirm `_headers` is served correctly at the preview URL.
- [ ] Confirm no contamination on `pages.dev` (wrong domains, wrong content).

### Custom domain cutover
- [ ] Add custom domain in Cloudflare Pages dashboard.
- [ ] Wait for SSL certificate to provision.
- [ ] Test `https://eureadyseller.com/` — must return 200 with correct content.
- [ ] Test key pages: Germany EPR, France EPR, GPSR Amazon, EU RP Service.
- [ ] Test non-slash redirect on custom domain.
- [ ] Monitor GSC for 404s or canonical errors after cutover.

### Rule of evidence
Public curl output always wins over local checks. Do not mark Cloudflare Pages migration complete until custom domain live checks pass.

## Final exit criteria
- Final status must be `GSC_READY` or `NEEDS_FIX`.
