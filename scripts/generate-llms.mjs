/**
 * generate-llms.mjs
 * Generates llms.txt to dist/ (Astro copies public/ → dist/, so we write to dist/ directly).
 * Also writes to public/ for consistency.
 * Hardcoded page list — update when new live pages are added.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');
const publicDir = resolve(rootDir, 'public');

const SITE_URL = 'https://eureadyseller.com';
const SITE_NAME = 'EUReadySeller';
const DISCLAIMER = 'EUReadySeller provides educational information and scoping tools for ecommerce sellers. It does not provide legal advice and does not determine whether your products, store, or business are compliant. Always consult qualified legal counsel or a compliance provider for your specific situation.';

const pages = [
  {
    path: '/',
    title: 'EUReadySeller - Know What Your Store Needs Before Selling to the EU',
    summary: 'Homepage. EUReadySeller helps ecommerce sellers identify EU compliance topics to review before selling physical products to EU consumers. Covers GPSR, EU Responsible Person and EPR packaging topics. Includes free compliance checker.',
  },
  {
    path: '/eu-seller-compliance-checklist/',
    title: 'EU Seller Compliance Checklist for Ecommerce Sellers',
    summary: 'Practical compliance checklist covering GPSR, EU Responsible Person and EPR packaging topics. Includes GPSR checklist, EU RP checklist and EPR packaging checklist sections with common mistakes to avoid.',
  },
  {
    path: '/gpsr-compliance-for-shopify/',
    title: 'GPSR Compliance for Shopify Sellers',
    summary: 'GPSR guide for Shopify sellers. Covers General Product Safety Regulation obligations, EU Responsible Person requirements, product documentation and traceability under EU Regulation 2023/988.',
  },
  {
    path: '/gpsr-compliance-for-amazon-sellers/',
    title: 'GPSR Compliance for Amazon Sellers',
    summary: 'GPSR guide for Amazon sellers. Covers EU Responsible Person requirements, product safety information topics, and Amazon listing fields to review before selling to EU consumers.',
  },
  {
    path: '/gpsr-compliance-for-etsy-sellers/',
    title: 'GPSR Compliance for Etsy Sellers',
    summary: 'GPSR guide for Etsy sellers. Covers product safety information topics, EU Responsible Person requirements, manufacturer details and Etsy listing or shop information areas to review before selling to EU consumers.',
  },
  {
    path: '/do-i-need-an-eu-responsible-person/',
    title: 'Do I Need an EU Responsible Person?',
    summary: 'Decision guide to help ecommerce sellers understand when EU Responsible Person topics may apply. Covers factors affecting applicability, example scenarios, and decision factors for non-EU sellers preparing to sell to EU consumers.',
  },
  {
    path: '/eu-responsible-person-service/',
    title: 'EU Responsible Person Service for Ecommerce Sellers',
    summary: 'Explains EU Responsible Person role under GPSR. Describes when non-EU sellers may need one, what documentation to prepare, and how to request service quotes from providers.',
  },
  {
    path: '/epr-compliance-for-shopify/',
    title: 'EPR Compliance for Shopify Sellers',
    summary: 'Extended Producer Responsibility packaging guide for Shopify sellers. Covers Germany LUCID registration, France EPR schemes, reporting obligations and platform verification.',
  },
  {
    path: '/request-eu-compliance-quotes/',
    title: 'Request EU Compliance Provider Quotes',
    summary: 'Lead form page for requesting quotes from EU compliance service providers. Covers GPSR, EU Responsible Person and EPR packaging topics. Free service, no login required.',
  },
  {
    path: '/tools/eu-seller-compliance-checker/',
    title: 'EU Seller Compliance Checker',
    summary: 'Free educational scoping tool. Asks 8 questions about business location, platform, product type and target EU markets to suggest GPSR, EU Responsible Person and EPR packaging topics to review. Not a compliance determination.',
  },
];

function generateLlms() {
  const pageLines = pages.map(
    (p) => `## ${p.title}
URL: ${SITE_URL}${p.path}
${p.summary}`
  );

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
${pages.map((p) => `- ${SITE_URL}${p.path} — ${p.title}`).join('\n')}

## Tool Page
${SITE_URL}/tools/eu-seller-compliance-checker/ — Free EU Seller Compliance Checker

## Page Summaries
${pageLines.join('\n\n')}

## Compliance Disclaimer
${DISCLAIMER}
`;

  function writeLlms(dir) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'llms.txt'), content, 'utf-8');
  }

  try {
    writeLlms(distDir);
    writeLlms(publicDir);
    console.log(`✓ llms.txt generated (${pages.length} pages)`);
  } catch (e) {
    console.error('Failed to write llms.txt:', e.message);
    process.exit(1);
  }
}

generateLlms();
