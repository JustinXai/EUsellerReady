# 02 - Risks and Known Issues

## High Priority

### Lead form has no backend
- The lead form at `/request-eu-compliance-quotes/` only opens a mailto link. No provider matching, no CRM, no email delivery.
- **Impact:** Cannot collect leads without manual follow-up.
- **Mitigation:** Add Resend / SendGrid / HubSpot integration in Phase 2.

### No analytics or Search Console
- No visibility into traffic, rankings, or crawl errors.
- **Impact:** Cannot measure SEO performance or find indexation issues.
- **Mitigation:** Add Google Analytics 4 + Search Console in Phase 2.

### No CI/CD pipeline
- Manual `npm run build && docker build && docker-compose up` deployment.
- **Impact:** Human error risk, slow deployment process.
- **Mitigation:** Add GitHub Actions in Phase 2.

## Medium Priority

### Checker tool has no result persistence
- Users cannot save or share their compliance results.
- **Impact:** Limited engagement value.
- **Mitigation:** Consider adding email-your-results in Phase 2.

### Single language (English only)
- No i18n, no translations.
- **Impact:** Limited to English-speaking sellers.
- **Mitigation:** Consider adding German / French translations if EU market traction warrants.

### FAQ content duplication
- Same FAQ sets defined in multiple files.
- **Impact:** Harder to update FAQs consistently.
- **Mitigation:** Extract to `src/data/faq.ts` with named exports and import in pages.

### No image optimization
- No Astro image integration, no CDN, no lazy loading strategy.
- **Impact:** Slower page loads, especially on mobile.
- **Mitigation:** Add `@astrojs/image` and a CDN in Phase 2.

## Low Priority

### Dark mode not implemented
- Single light color scheme only.
- **Impact:** Users who prefer dark mode must use browser override.
- **Mitigation:** Add CSS variables + `prefers-color-scheme` in future iteration.

### No structured data testing in CI
- `validate-schema.mjs` exists but not run as part of automated pipeline.
- **Impact:** Schema errors can reach production.
- **Mitigation:** Add to `npm run verify` in CI.

### robots.txt may block AI training bots
- Current config blocks GPTBot, ChatGPT-User, CCBot.
- **Impact:** AI search engines may not index content.
- **Decision:** Keep blocking to avoid training data scraping; this is a business decision, not a bug.

## False Positive Risk

### validate-claims.mjs regex edge cases
- The "not legal advice" exception regex may have false positives in rare cases.
- **Mitigation:** Manual review of any claim flagged; update regex if needed.
