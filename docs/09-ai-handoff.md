# 09 - AI/LLM Handoff Notes

## For AI Agents and Automated Systems

This section documents important conventions for any AI system that needs to understand, extend, or maintain this codebase.

## Site Architecture

- **Framework:** Astro 4.x with TypeScript
- **Output:** Fully static HTML — no server-side rendering
- **JavaScript:** Minimal; only used for the interactive compliance checker
- **Styling:** Plain CSS with CSS custom properties; no CSS-in-JS, no Tailwind
- **Data:** All data is static TypeScript/JS files; no API calls at runtime

## Critical Brand Safety Rules

### NEVER write these phrases anywhere in the codebase:
- "guaranteed compliance"
- "certified compliance"
- "fully compliant"
- "become compliant instantly"
- "legal advice"
- "we are lawyers"
- "official EU certified"
- "EU-approved service"
- "compliant by using this tool"
- "this tool determines compliance"
- "we guarantee your products are compliant"
- "avoid all fines"
- "legally required in every case"

### ALWAYS include these elements on every content page:
1. `<h1>` — unique per page
2. `<meta name="description">` — unique per page
3. `<link rel="canonical">` — pointing to `https://eureadyseller.com[path]/`
4. AI-readable summary block (green banner)
5. FAQ section with FAQPage JSON-LD schema
6. Disclaimer block
7. CTA (at least one)
8. Official sources section (2-4 sources)

### Allowed safe phrases:
- "educational information"
- "topics to review"
- "may apply"
- "likely relevant"
- "sellers may need to prepare"
- "not legal advice"
- "this tool does not determine compliance"
- "consult a qualified compliance provider"

## Checker Tool Logic

The compliance checker in `src/pages/tools/eu-seller-compliance-checker.astro` uses a hardcoded `TOPIC_DATA` object and a `computeResults()` function in inline `<script>`. Key rules:

- Physical goods = Yes → always show GPSR
- Non-EU location + no existing EU RP → show EU Responsible Person
- Packaging + physical goods → show EPR packaging (or Germany/France variant)
- Digital services = Yes → show EAA as related/future topic
- NEVER show "you are compliant" or "you are not compliant"

## Validation Scripts

| Script | What it checks | Exit code |
|--------|---------------|-----------|
| `validate-routes.mjs` | Pages exist, sitemap/llms coverage | 1 on failure |
| `validate-seo.mjs` | Title/desc/H1 uniqueness, canonical | 1 on failure |
| `validate-claims.mjs` | Banned phrase scanning | 1 on failure |
| `validate-links.mjs` | Internal href validity | 1 on failure |
| `validate-schema.mjs` | JSON-LD parseability, FAQPage mainEntity | 0/1 |
| `build-report.mjs` | Summary report (informational) | 0 always |

Run all: `npm run verify`

## Adding New Pages

1. Create `src/pages/[slug].astro`
2. Add entry to `src/data/routes.ts`
3. Import necessary components and data
4. Follow the 8 required page elements (see above)
5. Add FAQ to `src/data/faq.ts`
6. Rebuild: `npm run build`

## Adding New Compliance Topics

1. Add to `src/data/checkerRules.ts` topic catalog
2. Add to `TOPIC_DATA` object in checker tool `<script>`
3. Add guide page (optional)
4. Add FAQ to `src/data/faq.ts`
5. Update official sources if new regulation

## Important File Locations

- Site config: `src/data/site.ts`
- Routes registry: `src/data/routes.ts`
- Banned claims: `src/data/bannedClaims.ts`
- Official sources: `src/data/officialSources.ts`
- All components: `src/components/`
- All pages: `src/pages/`
- All scripts: `scripts/`

## Canonical URL Pattern

```
https://eureadyseller.com{path}/
```
- Root: `https://eureadyseller.com/`
- Subpages: `https://eureadyseller.com/eu-seller-compliance-checklist/`
- Tools: `https://eureadyseller.com/tools/eu-seller-compliance-checker/`

## JSON-LD Pattern

All pages include `WebPage` schema + `FAQPage` schema.
Tool page adds `WebApplication` schema.
Homepage adds `WebSite` schema.

See `src/lib/schema.ts` for all schema builders.

## Phase 2 Priorities

1. Lead form backend (Resend/SendGrid)
2. Google Analytics 4 + Search Console
3. GitHub Actions CI/CD
4. GitHub Actions with schema testing in pipeline
5. Provider matching infrastructure
