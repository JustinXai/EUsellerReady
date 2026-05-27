# Historical QA Prevention Checklist

**Date:** May 27, 2026
**Purpose:** Prevent recurring failures from "local passes but live site broken" patterns

---

## 1. Common Historical Failure Modes

These failure modes have caused issues in the past and must be checked before any deployment:

| Failure Mode | Symptom | Root Cause |
|-------------|---------|-----------|
| `npm run verify` passes but live HTML still has old phrases | Live site contains outdated or incorrect text | Cache (Cloudflare/browser/CDN), dist/ not deployed, incomplete build |
| External smoke passes but does not check exact changed text | Smoke test passes but key phrase missing | Smoke test only checks HTTP 200, not content |
| Claim safety warnings pass but wording remains too absolute | Banned phrases slip through validation | Regex patterns miss edge cases, content not re-checked after edits |
| sitemap / llms / robots mismatch | SEO artifacts out of sync with routes | Routes added but `includeInSitemap` or `includeInLlms` not set |
| Cloudflare or browser cache makes old HTML appear | Fresh deploy shows stale content | CDN cache not purged, cache-bust URLs not used |
| Visual refresh affects readability | CSS changes break text contrast or layout | No manual browser check after style changes |
| Cursor reports done without live grep evidence | "Done" claimed without verifying live content | Over-reliance on local build, no curl verification |

---

## 2. Required Checks by Task Type

### A. New Page

Always run these checks after adding a new page:

```bash
# 1. Build and verify locally
npm run verify

# 2. External smoke test
npm run external:smoke

# 3. Live HTTP check
curl -s -o /dev/null -w "%{http_code}" https://eureadyseller.com/new-page/

# 4. Live H1 grep
curl -s https://eureadyseller.com/new-page/ | grep -o "<h1[^>]*>.*</h1>"

# 5. Sitemap verification
curl -s https://eureadyseller.com/sitemap.xml | grep "new-page"

# 6. LLMs.txt verification
curl -s https://eureadyseller.com/llms.txt | grep "new-page"

# 7. JSON-LD verification
curl -s https://eureadyseller.com/new-page/ | grep -i "application/ld+json"

# 8. GSC URL submit (manual)
# Submit https://eureadyseller.com/new-page/ to Google Search Console
```

### B. Claim Wording Changes

Always verify old phrases are removed and new phrases are present:

```bash
# 1. Check source for old phrase (should be gone)
grep -r "old bad phrase" src/

# 2. Check dist for old phrase (should be gone)
grep -r "old bad phrase" dist/

# 3. Check live site for old phrase (must be gone)
curl -s https://eureadyseller.com/changed-page/ | grep -i "old bad phrase" && echo "FAIL: Old phrase still present" || echo "PASS: Old phrase removed"

# 4. Check live site for new phrase (must be present)
curl -s https://eureadyseller.com/changed-page/ | grep "new required phrase" || echo "FAIL: New phrase missing"

# 5. Validate claims
npm run validate:claims

# 6. External smoke
npm run external:smoke
```

### C. Visual/UI Changes

Always verify no regressions:

```bash
# 1. Verify no unintended changes to H1/title/meta
npm run validate:seo

# 2. Verify no route changes
npm run validate:routes

# 3. Full verification
npm run verify

# 4. External smoke
npm run external:smoke

# 5. Manual browser checks (required for visual changes)
# - Homepage on desktop
# - Homepage on mobile (verify no horizontal scroll)
# - Representative long-form page (e.g., /gpsr-compliance-for-shopify/)
# - Check text contrast ratios
# - Check font readability at various zoom levels
```

### D. Artifact Changes

Always verify SEO artifacts are in sync:

```bash
# 1. Check robots.txt - no AI crawler blocks (should allow crawlers)
curl -s https://eureadyseller.com/robots.txt | grep -i "GPTBot\|ChatGPT-User\|CCBot\|Disallow: /"
# If output contains these, review if intentional

# 2. Verify sitemap includes all includeInSitemap routes
curl -s https://eureadyseller.com/sitemap.xml | grep "route-slug"

# 3. Verify llms.txt includes all includeInLlms routes
curl -s https://eureadyseller.com/llms.txt | grep "route-slug"

# 4. Cache-bust check if mismatch detected
curl -s "https://eureadyseller.com/sitemap.xml?$(date +%s)" | head -20

# 5. Validate artifacts
npm run validate:artifacts
```

### E. Form/API Changes

Always verify form functionality:

```bash
# 1. Valid submit test (with test data)
curl -X POST https://eureadyseller.com/api/form \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","topic":"gpsr"}'

# 2. Missing required fields test
curl -X POST https://eureadyseller.com/api/form \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
# Should return validation error

# 3. Honeypot test (if honeypot field is filled, should reject)
curl -X POST https://eureadyseller.com/api/form \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","hp_field":"bot detected"}'
# Should return error or ignore silently

# 4. JSONL write check
# Verify data/sumbissions.jsonl has new entry after valid submit

# 5. No sensitive data collection expansion
# Review form payload - no PII beyond email without consent notice
```

---

## 3. Required Live Grep Examples

These commands verify live site content. Always run at least one before marking a task complete.

### Check robots.txt for AI crawler blocks

```bash
curl -s https://eureadyseller.com/robots.txt | grep -i "GPTBot\|ChatGPT-User\|CCBot\|Disallow: /" && echo "BAD" || echo "OK"
```

### Check sitemap includes a route

```bash
curl -s https://eureadyseller.com/sitemap.xml | grep "changed-slug"
```

### Check llms.txt includes a route

```bash
curl -s https://eureadyseller.com/llms.txt | grep "changed-slug"
```

### Check page has required phrase

```bash
curl -s https://eureadyseller.com/changed-url/ | grep "required phrase"
```

### Check page does NOT have old phrase

```bash
curl -s https://eureadyseller.com/changed-url/ | grep -i "old bad phrase" && echo "BAD" || echo "OK"
```

### Using live:grep script

```bash
# Must have phrase
npm run live:grep -- /gpsr-general-guide/ "GPSR Guide for Ecommerce Sellers" --must

# Must NOT have phrase
npm run live:grep -- /gpsr-general-guide/ "THIS_SHOULD_NOT_EXIST_123" --must-not
```

---

## 4. GSC Data Interpretation Rules

When reviewing Google Search Console data:

| Rule | Explanation |
|------|-------------|
| **Do not pivot SEO strategy from fewer than 10 impressions** | Low data is not representative of true performance |
| **Record query, page, country, date** | Always document the full context of any observation |
| **Act only after repeated impressions or clear query cluster** | Single data points are noise, not signal |
| **Low impressions are signal, not proof** | They indicate the page is indexed but not ranking well - investigate, don't panic |
| **Wait 4+ weeks before judging new page performance** | Indexing and ranking take time |
| **Compare to similar pages, not all pages** | Brand queries vs. informational queries have different baselines |

---

## 5. Why `npm run verify` Is Not Enough

`npm run verify` runs these local checks:

- `npm run build` (generates dist/)
- `validate:routes` (checks routes.ts vs dist/)
- `validate:seo` (checks H1/title/meta in dist/)
- `validate:claims` (scans dist/ for banned phrases)
- `validate:links` (checks internal hrefs in dist/)
- `validate:schema` (checks JSON-LD in dist/)
- `validate:robots` (checks robots.txt patterns)
- `validate:content-roadmap` (checks roadmap status)
- `validate:page-template` (checks page sections)
- `validate:official-sources` (checks source links)
- `validate:no-hardcoded-pages` (checks no hardcoded page lists)
- `validate:artifacts` (checks sitemap/llms/robots consistency)

**It does NOT check:**

1. **Live site content** - dist/ may differ from what's actually deployed
2. **Cache behavior** - Cloudflare or browser may serve stale content
3. **GSC data** - Search performance is not validated
4. **Manual readability** - Visual inspection is not automated
5. **Cross-browser behavior** - Only static HTML is validated

**Always supplement `npm run verify` with:**

- Live curl checks for changed pages
- Browser manual check for UI changes
- GSC review for SEO-sensitive changes

---

## 6. Quick Reference: Which Checks to Run

| Change Type | Minimum Required Checks |
|------------|----------------------|
| New page added | verify + live curl H1 + sitemap + llms + GSC submit |
| Content text changed | verify + live curl grep old phrase + live curl grep new phrase |
| Claim wording fixed | verify + live curl grep + validate:claims review |
| CSS/UI refresh | verify + external:smoke + manual browser check |
| Route renamed | verify + live curl old URL + live curl new URL + sitemap + llms |
| Form/API change | verify + valid submit test + missing fields test + honeypot test |
| SEO artifact change | verify + live curl artifacts + validate:artifacts |

---

## 7. Pre-Deploy Checklist

Before running `/opt/eureadyseller/deploy.sh`:

- [ ] `npm run verify` passes locally
- [ ] All changed pages verified via `npm run live:grep` or curl
- [ ] No old phrases present (grep verification)
- [ ] New phrases present (grep verification)
- [ ] sitemap.xml includes all new routes
- [ ] llms.txt includes all new routes
- [ ] robots.txt reflects intended crawler policy
- [ ] GSC URL inspection updated for new/changed pages
- [ ] Manual browser check completed for UI changes
- [ ] All commits pushed to origin/main

---

## 8. Related Documents

- `docs/10-content-factory.md` - Content creation process
- `docs/09-ai-handoff.md` - AI/LLM handoff notes
- `docs/04-deployment.md` - Deployment procedures
- `.cursor/rules/eureadyseller-claims.mdc` - Claim safety rules
