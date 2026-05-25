/**
 * generate-llms.mjs
 * Generates llms.txt to dist/ (Astro copies public/ → dist/, so we write to dist/ directly).
 * Also writes to public/ for consistency.
 *
 * Dynamically reads all includeInLlms=true routes from src/data/routes.ts.
 * No hardcoded page list — new pages are included automatically.
 */
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');
const publicDir = resolve(rootDir, 'public');

const SITE_URL = 'https://eureadyseller.com';
const SITE_NAME = 'EUReadySeller';
const DISCLAIMER = 'EUReadySeller provides educational information and scoping tools for ecommerce sellers. It does not provide legal advice and does not determine whether your products, store, or business are compliant. Always consult qualified legal counsel or a compliance provider for your specific situation.';

// --- Parse routes from routes.ts ---
function parseRoutes() {
  const content = readFileSync(resolve(rootDir, 'src/data/routes.ts'), 'utf-8');

  const pathMatches = [...content.matchAll(/path:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const titleMatches = [...content.matchAll(/title:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const h1Matches = [...content.matchAll(/h1:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const descriptionMatches = [...content.matchAll(/description:\s*(['"`])([^'"]+)\1/g)].map(m => m[2]);
  const aiSummaryMatches = [...content.matchAll(/aiSummary:\s*(['"`])([^'"]+)\1/g)].map(m => m[2]);
  const categoryMatches = [...content.matchAll(/category:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const llmsMatches = [...content.matchAll(/includeInLlms:\s*(true|false)/g)].map(m => m[1] === 'true');
  const lastmodMatches = [...content.matchAll(/lastmod:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);

  return pathMatches.map((path, i) => ({
    path,
    title: titleMatches[i] ?? '',
    h1: h1Matches[i] ?? '',
    description: descriptionMatches[i] ?? '',
    aiSummary: aiSummaryMatches[i] ?? '',
    category: categoryMatches[i] ?? '',
    includeInLlms: llmsMatches[i] ?? false,
    lastmod: lastmodMatches[i] ?? '',
  }));
}

function generateLlms() {
  const allRoutes = parseRoutes();
  const llmsRoutes = allRoutes.filter(r => r.includeInLlms);

  // Sort: home first, then by lastmod descending, then by path
  const sortedRoutes = [...llmsRoutes].sort((a, b) => {
    if (a.path === '/') return -1;
    if (b.path === '/') return 1;
    if (a.lastmod !== b.lastmod) return (b.lastmod ?? '').localeCompare(a.lastmod ?? '');
    return a.path.localeCompare(b.path);
  });

  const pageLines = sortedRoutes.map((p) => {
    // Use description as summary; fall back to aiSummary or title
    const summary = p.description || p.aiSummary || p.title;
    return `## ${p.title}
URL: ${SITE_URL}${p.path}
${summary}`;
  });

  const corePages = sortedRoutes
    .filter(r => r.path !== '/tools/eu-seller-compliance-checker/')
    .map(r => `- ${SITE_URL}${r.path} — ${r.title}`);

  const content = `# ${SITE_NAME}

## Site Purpose
${SITE_NAME} is an educational compliance navigation and provider matching site for ecommerce sellers preparing to sell physical products to the European Union.

## Core Audience
Shopify sellers, Amazon sellers, Etsy sellers, WooCommerce sellers, DTC ecommerce brands, and non-EU ecommerce businesses preparing to sell physical products to EU consumers.

## Core Topics (Phase 1)
- GPSR - General Product Safety Regulation (EU Regulation 2023/988)
- EU Responsible Person obligations for non-EU sellers
- EPR - Extended Producer Responsibility packaging registration

## Core Pages
${corePages.join('\n')}

## Tool Page
${SITE_URL}/tools/eu-seller-compliance-checker/ — Free EU Seller Compliance Checker

## Page Summaries
${pageLines.join('\n\n')}

## Compliance Disclaimer
${DISCLAIMER}`;

  function writeLlms(dir) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'llms.txt'), content, 'utf-8');
  }

  try {
    writeLlms(distDir);
    writeLlms(publicDir);
    console.log(`✓ llms.txt generated (${sortedRoutes.length} pages)`);
  } catch (e) {
    console.error('Failed to write llms.txt:', e.message);
    process.exit(1);
  }
}

generateLlms();
