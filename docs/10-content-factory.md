# EUReadySeller Content Factory

**Date:** May 25, 2026

---

## 1. Overview

The Content Factory is a structured system for planning, creating, and maintaining pages on EUReadySeller. It ensures consistency across all pages by enforcing:

- **SEO rules** — unique titles, meta descriptions, H1s, canonicals, JSON-LD
- **GEO/AI rules** — AI summaries, llms.txt coverage, safe language
- **Content structure** — required sections per template, FAQs, official sources, disclaimers, CTAs
- **Deployment safety** — no hardcoded page lists, source of truth in routes.ts/contentRoadmap.ts
- **Claim safety** — no guaranteed compliance, required disclaimer, safe language only

---

## 2. Core Data Files

### src/data/contentTaxonomy.ts

Defines all valid taxonomy values used across the Content Factory:

- **Content Categories** (CONTENT_CATEGORIES): home, platform-guide, platform_compliance, service, decision-guide, checklist, checklist_template, tool, quote-request, country_epr, regulation_explainer, service_provider_matching, blog
- **Topic Tags** (TOPIC_TAGS): gpsr, eu-responsible-person, epr, amazon, shopify, etsy, woocommerce, decision, checklist, product-safety, labelling, traceability, incident-reporting
- **User Segments** (USER_SEGMENTS): target audience groupings
- **Funnel Stages** (FUNNEL_STAGES): awareness, consideration, decision, retention
- **Official Source Topics** (OFFICIAL_SOURCE_TOPICS): source group identifiers

### src/data/pageTemplates.ts

Defines page templates with their required blocks, CTA placement, and SEO attributes. Templates: homeTemplate, platformGuideTemplate, decisionGuideTemplate, checklistTemplate, serviceTemplate, toolTemplate, quoteRequestTemplate, countryEprTemplate, explainerTemplate, servicePageTemplate, gpsrChecklistTemplate.

### src/data/contentRoadmap.ts

The master content plan. Every page must exist here with correct metadata before creation. Fields: status (live/planned/archived), categoryId, templateId, priority, primaryKeyword, secondaryKeywords, longTailQuestions, monetizationPath, officialSourceTopics, requiredInternalLinks.

### src/data/officialSources.ts

Grouped official source references by topic. Each group contains title, url, and description.

---

## 3. Page Factory Workflow

### Step 1: Plan the page

Add a "planned" item to src/data/contentRoadmap.ts. Fill in all required metadata fields: path, status (planned), categoryId, templateId, primaryKeyword, secondaryKeywords, longTailQuestions, monetizationPath, officialSourceTopics, requiredInternalLinks.

### Step 2: Scaffold the page

npm run page:create -- <slug>

This reads contentRoadmap.ts and pageTemplates.ts, then generates src/pages/<slug>.astro with all required section blocks as TODO placeholders.

### Step 3: Fill the page

Replace TODO placeholders with researched, compliance-safe content. Follow the rules in .cursor/rules/eureadyseller-content.mdc.

### Step 4: Register the route

Add to src/data/routes.ts with all required fields: path, title, description, h1, category, priority, changefreq, includeInSitemap, includeInLlms, lastmod, aiSummary.

### Step 5: Change status to live

Change roadmap status from "planned" to "live".

### Step 6: Verify

npm run verify

All 13 validation checks must pass before committing.

### Step 7: Commit and deploy

git add . && git commit -m "Add <page name>" && git push origin main
/opt/eureadyseller/deploy.sh

---

## 4. Validation Scripts

- validate:content-roadmap — Roadmap vs routes consistency, required fields, internal links
- validate:page-template — All required sections from template present in page
- validate:official-sources — Source topics not empty, topics have sources, page has Official Sources section
- validate:no-hardcoded-pages — No hardcoded page arrays in generator/validation scripts
- validate:routes — Page existence, sitemap coverage, llms coverage
- validate:seo — Title, description, H1 uniqueness and completeness
- validate:claims — No banned compliance claims
- validate:links — All internal links valid
- validate:schema — JSON-LD parseable, FAQPage has mainEntity
- validate:robots — robots.txt policy correctness
- validate:artifacts — dist/robots.txt, sitemap, llms.txt correctness

---

## 5. What Cursor Must Never Do

- Create a page not in contentRoadmap.ts
- Hardcode page lists in generator or validation scripts
- Bypass routes.ts by creating pages without routes
- Skip the Official Sources section
- Skip the Disclaimer
- Skip the CTA
- Skip npm run verify
- Use unsafe compliance claims (guaranteed compliance, certified, avoid all fines, etc.)
- Deploy without running npm run verify first
- Edit files in /opt/eureadyseller/current/ or /opt/eureadyseller/releases/*/

---

## 6. Current Content Roadmap

### Live Pages (11)

- / (homeTemplate, P0)
- /eu-seller-compliance-checklist/ (checklistTemplate, P1)
- /gpsr-compliance-for-shopify/ (platformGuideTemplate, P1)
- /gpsr-compliance-for-amazon-sellers/ (platformGuideTemplate, P1)
- /gpsr-compliance-for-etsy-sellers/ (platformGuideTemplate, P1)
- /eu-responsible-person-service/ (serviceTemplate, P1)
- /do-i-need-an-eu-responsible-person/ (decisionGuideTemplate, P1)
- /epr-compliance-for-shopify/ (platformGuideTemplate, P2)
- /epr-compliance-for-amazon-sellers/ (platformGuideTemplate, P0)
- /request-eu-compliance-quotes/ (quoteRequestTemplate, P1)
- /tools/eu-seller-compliance-checker/ (toolTemplate, P0)

### Planned Pages (9)

- /gpsr-compliance-for-woocommerce-sellers/ (platformGuideTemplate, P2)
- /gpsr-general-guide/ (platformGuideTemplate, P2)
- /epr-general-guide/ (platformGuideTemplate, P3)
- /gpsr-compliance-for-dtc-brands/ (platformGuideTemplate, P2)
- /germany-epr-packaging-registration/ (countryEprTemplate, P0)
- /france-epr-packaging-registration/ (countryEprTemplate, P1)
- /epr-packaging-vs-weee-vs-batteries/ (explainerTemplate, P1)
- /eu-compliance-provider-directory/ (servicePageTemplate, P1)
- /gpsr-product-safety-information-checklist/ (gpsrChecklistTemplate, P1)
