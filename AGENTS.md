# EUReadySeller Agent Onboarding

## Project identity
EUReadySeller is the public site at eureadyseller.com (Cloudflare Pages, production). It provides educational EU ecommerce compliance guidance and should never be treated as another project or domain.

## Current architecture
- Astro site with content pages in `src/pages/`
- Route metadata in `src/data/routes.ts`
- Content Factory metadata in `src/data/contentRoadmap.ts`
- FAQ data in `src/data/faq.ts`
- Official source mappings in `src/data/officialSources.ts`
- Validation scripts in `scripts/`
- Provider intake API: `functions/api/messages.ts` (Cloudflare Pages Function + D1 `MESSAGE_DB`)

## Deployment — Cloudflare Pages (production, live)
As of 2026-06-03, production is served by Cloudflare Pages, not the old VPS/Caddy server.

### Release workflow
1. Make content changes, commit to `main`, push to `origin/main`.
2. Cloudflare Pages builds automatically from Git integration.
3. Verify `https://eusellerready.pages.dev` via public curl (release gate checks).
4. Once preview verified, custom domain `https://eureadyseller.com` updates automatically.
5. Run `npm run external:smoke` (targets `https://eureadyseller.com`).
6. Monitor GSC for 404s or canonical errors.
7. Submit sitemap to GSC only after live checks pass.

### Old server (rollback only)
- Old VPS/Caddy server at `/opt/eureadyseller/` remains online until message API migration is verified on Cloudflare.
- `eureadyseller-message-api.service` is rollback/data-reference only after D1 migration.
- Do NOT use `npm run deploy:server` for routine production releases.
- Use `ssh ruta2back "/opt/eureadyseller/deploy.sh"` only for emergency rollback recovery.
- Backup `/opt/eureadyseller/data/messages.jsonl` before decommission.

## Release gate
Before finishing a change, run `npm run cf:build`, confirm live public behavior via curl checks on the apex domain, and ensure the final status is `GSC_READY` or `NEEDS_FIX`.

## Content Factory workflow
- Add or update roadmap metadata first
- Scaffold only if the page belongs in the roadmap
- Keep canonical trailing slashes
- Maintain sitemap and llms.txt inclusion
- Use cautious compliance wording

## Current roadmap
- Current EPR pages are growing and should not be repeatedly edited unless GSC data supports it.
- Next content candidate: `/weee-registration-germany/`
- Later candidate: `/eu-batteries-regulation-for-sellers/`
- One focused page per sprint

## Final report format
Always include:
- files created
- files modified
- whether production content changed
- validation result
- how future sessions should use the rules
- final status
