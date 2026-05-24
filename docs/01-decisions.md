# 01 - Key Decisions

## Technology Choices

### Astro over Next.js / Gatsby
- **Reason:** Astro's static-first output aligns with Phase 1 requirements. No server-side rendering overhead, faster build times, smaller JS bundles.
- **Trade-off:** Less ecosystem for dynamic features; handled by plain JS in checker tool.

### Plain CSS over Tailwind
- **Reason:** Simpler setup, no PostCSS config, easier to audit for banned phrases, faster build.
- **Trade-off:** More verbose CSS; acceptable for a small site.

### Static generation over SSG + API routes
- **Reason:** Phase 1 requires no backend. Full static allows CDN hosting.
- **Trade-off:** Lead form cannot submit to a database without a separate service.

### JSON-LD over RDFa / Microdata
- **Reason:** JSON-LD is the W3C-recommended format, easier to generate programmatically, widely supported by Google.
- **Trade-off:** Requires `<script>` injection; handled via `schema.ts` utility.

## Content Decisions

### FAQ duplication
- Each page has its own FAQ array rather than a shared store.
- **Trade-off:** Duplication across files; acceptable for 7 pages. Future: extract to JSON.
- **Reason:** Simpler build pipeline, no runtime data fetching needed.

### Checker tool as pure client-side JS
- No API calls, no server-side processing.
- **Trade-off:** Results cannot be shared or saved; fine for Phase 1 scoping tool.
- **Reason:** No backend, no database.

### mailto fallback for lead form
- No database; mailto opens email client.
- **Trade-off:** Lower conversion; acceptable for MVP.
- **Reason:** Avoids backend complexity.

## SEO Decisions

### llms.txt generated at build
- Static text file summarizing all pages.
- **Trade-off:** Must regenerate on content changes.
- **Reason:** AI search engines (Perplexity, OpenAI Search) use this format.

### validate-claims.mjs with context sensitivity
- "legal advice" banned but "not legal advice" allowed.
- **Trade-off:** Regex-based; some edge cases possible.
- **Reason:** Critical for compliance language safety.

## Deployment Decisions

### Caddy over Nginx
- **Reason:** Single-file Caddyfile vs. Nginx config; automatic HTTPS; simpler for Docker.
- **Trade-off:** Less battle-tested than Nginx at scale.

### Docker multi-stage build
- Builder stage uses Node 20, production uses alpine + Caddy.
- **Reason:** Smaller production image, no Node runtime needed in production.
