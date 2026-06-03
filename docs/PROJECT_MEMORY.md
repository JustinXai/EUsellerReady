# EUReadySeller Project Memory

EUReadySeller is an educational compliance guidance site for ecommerce sellers preparing to sell into the EU market.

## Current live pages count
The site currently has 22 live pages/routes.

## Current known GSC winners
- `/germany-epr-packaging-registration/`
- `/france-epr-packaging-registration/`
- `/eu-compliance-provider-directory/`
- `/epr-packaging-vs-weee-vs-batteries/`
- `/epr-compliance-for-amazon-sellers/`
- `/gpsr-compliance-for-amazon-sellers/`
- `/eu-responsible-person-service/`

## Latest Semrush direction
- P0: EU Responsible Person Service completed
- P1: WEEE Registration Germany next
- P2: EU Batteries Regulation for Sellers later

## Operating notes
- Use GSC and Semrush signals to choose the next sprint.
- Do not repeatedly edit pages that are already growing unless new data supports it.
- Keep public page URLs canonical with trailing slashes.
- Validate the live public site after deployment rather than relying only on local output.

## Deployment — Cloudflare Pages (PRODUCTION, LIVE)
As of 2026-06-03, the production site is served by **Cloudflare Pages**, not the old VPS/Caddy server.

### Active deployment targets
| Target | URL | Notes |
|---|---|---|
| Cloudflare Pages project | `https://eusellerready.pages.dev` | Preview / staging |
| Custom domain (apex, canonical) | `https://eureadyseller.com` | Production |
| Custom domain (www) | `https://www.eureadyseller.com` | Serves same content |
| www redirect | `http://www.eureadyseller.com/` → `https://www.eureadyseller.com/` | Cloudflare enforced |

### Cloudflare Pages project settings
| Setting | Value |
|---|---|
| Project name | `eusellerready` |
| Production branch | `main` |
| Build command | `npm run cf:build` |
| Build output directory | `dist` |
| Root directory | `/` (repo root) |

### Release deployment workflow (Cloudflare Pages era)
1. Make content changes, commit to `main`.
2. Push to `origin/main`.
3. Cloudflare Pages triggers automatically from Git integration.
4. Verify `https://eusellerready.pages.dev` (preview) — use curl checks from release gate.
5. Once preview verified, custom domain `eureadyseller.com` updates automatically.
6. Run `npm run external:smoke` (targets `https://eureadyseller.com`).
7. Monitor GSC for 404s or canonical errors.
8. Submit sitemap to GSC only after live checks pass.

### Old server — rollback only
- Old VPS/Caddy server (`/opt/eureadyseller/`) must remain online for **3–7 days** as rollback target.
- Do NOT use `deploy.sh` as a normal deployment path after cutover.
- If rollback is needed: revert DNS in Cloudflare dashboard, redeploy via `ssh euready "/opt/eureadyseller/deploy.sh"` only as emergency recovery.

### Old deploy.sh (deprecated for production)
`npm run deploy:server` in `package.json` must not be used for routine production releases. It is retained for emergency rollback only.
