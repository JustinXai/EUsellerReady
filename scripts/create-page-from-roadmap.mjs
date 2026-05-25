#!/usr/bin/env node
/**
 * create-page-from-roadmap.mjs
 * Page Factory scaffold generator for EUReadySeller.
 *
 * Usage: npm run page:create -- <slug>
 * Example: npm run page:create -- germany-epr-packaging-registration
 *
 * Prerequisite: The page must exist in src/data/contentRoadmap.ts as status: "planned"
 * before running this script.
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// --- Helpers ---

function readFile(filename) {
  return readFileSync(resolve(rootDir, filename), 'utf-8');
}

function parseRoadmapItems(content) {
  const items = [];
  // Match roadmap item blocks by finding { to }, with level tracking
  // Strategy: find each top-level object from { to },
  let depth = 0;
  let start = -1;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') {
      if (depth === 0) start = i + 1;
      depth++;
    } else if (content[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        const block = content.slice(start, i).trim();
        const path = block.match(/path:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
        if (path) {
          items.push(block);
        }
        start = -1;
      }
    }
  }
  return items;
}

// Parse a raw block string into a structured object
function parseRoadmapBlock(block) {
  const path = block.match(/path:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
  const status = block.match(/status:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
  const categoryId = block.match(/categoryId:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
  const templateId = block.match(/templateId:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
  const primaryKeyword = block.match(/primaryKeyword:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
  const monetizationPath = block.match(/monetizationPath:\s*['"]([^'"]+)['"]/)?.[1] ?? '';

  const parseArray = (field) => {
    // Match multiline array with nested objects/arrays
    const arrMatch = block.match(new RegExp(`${field}:\\s*\\[([\\s\\S]*?)\\]`));
    if (!arrMatch) return [];
    return [...arrMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(n => n[1]);
  };

  return {
    path, status, categoryId, templateId, primaryKeyword, monetizationPath,
    secondaryKeywords: parseArray('secondaryKeywords'),
    longTailQuestions: parseArray('longTailQuestions'),
    requiredInternalLinks: parseArray('requiredInternalLinks'),
    officialSourceTopics: parseArray('officialSourceTopics'),
  };
}

function parseTemplates(content) {
  const templates = {};
  // Match each template entry
  const templateRegex = /\b([a-zA-Z]+Template):\s*\{([\s\S]*?)\n\s*\}[,]/g;
  let match;
  while ((match = templateRegex.exec(content)) !== null) {
    const name = match[1];
    const block = match[2];
    const templateId = block.match(/templateId:\s*['"]([^'"]+)['"]/)?.[1] ?? name;
    const requiredBlocks = block.match(/requiredBlocks:\s*\[([^\]]*)\]/)
      ? [...block.match(/requiredBlocks:\s*\[([^\]]*)\]/)[1].matchAll(/['"]([^'"]+)['"]/g)].map(n => n[1])
      : [];
    const ctaPlacement = block.match(/ctaPlacement:\s*['"]([^'"]+)['"]/)?.[1] ?? 'bottom';

    templates[name] = { templateId, requiredBlocks, ctaPlacement };
    templates[templateId] = { templateId, requiredBlocks, ctaPlacement };
  }
  return templates;
}

function slugifyPath(path) {
  // /epr-compliance-for-amazon-sellers/ -> epr-compliance-for-amazon-sellers
  return path.replace(/^\//, '').replace(/\/$/, '');
}

function buildRelatedGuidesSection(links) {
  if (!links || links.length === 0) return '';

  const lines = links
    .filter(l => l.startsWith('/'))
    .map(l => {
      const label = l.replace(/^\//, '').replace(/\/$/, '').replace(/-/g, ' ').replace(/\//g, ' > ');
      const title = label.split(' > ').pop().trim()
        .replace(/\b\w/g, c => c.toUpperCase());
      return `        <li><a href="${l}">${title}</a></li>`;
    });

  if (lines.length === 0) return '';

  return `
    <div class="related-guides">
      <h2>Related guides</h2>
      <ul>
${lines.join('\n')}
      </ul>
    </div>`;
}

function buildScaffold(item, template) {
  const slug = slugifyPath(item.path);
  const seoTitle = item.primaryKeyword.replace(/\b\w/g, c => c.toUpperCase());
  const metaDesc = item.primaryKeyword + ' for ecommerce sellers reviewing EU compliance topics before selling in European markets.';
  const h1 = item.primaryKeyword.replace(/\b\w/g, c => c.toUpperCase());

  const requiredBlocks = template?.requiredBlocks ?? [];
  const ctaPlacement = template?.ctaPlacement ?? 'bottom';

  // Build FAQ items from longTailQuestions
  const faqItems = item.longTailQuestions.slice(0, 7).map((q, i) => {
    return `  { question: '${q.replace(/'/g, "\\'")}', answer: 'TODO: Fill with researched answer.', },`;
  }).join('\n');

  // Build required sections
  const sectionBlocks = requiredBlocks.map(block => {
    switch (block) {
      case 'PageHeader':
        return `
    <PageHeader
      heading={route.h1}
      subheading="${metaDesc}"
    />`;
      case 'QuickAnswer':
        return `
    <div class="quick-answer">
      <p class="quick-answer-label">Quick Answer</p>
      <p>
        TODO: Write 2-4 sentences answering the searcher's question directly.
        Include the primary keyword and make clear this is educational guidance.
      </p>
    </div>`;
      case 'AISummary':
        return `
    <AISummary summary={route.aiSummary} />`;
      case 'WhoThisAppliesTo':
        return `
    <div class="content-block">
      <h2>Who this applies to</h2>
      <p>
        TODO: Describe the target audience for this page.
        Include platform type, seller location, and product category.
      </p>
    </div>`;
      case 'CountrySpecificTopics':
        return `
    <div class="content-block">
      <h2>Country-specific EPR topics</h2>
      <p>
        TODO: Cover country-specific regulatory requirements and registration topics.
      </p>
      <ul>
        <li>TODO: Add country-specific details</li>
      </ul>
    </div>`;
      case 'PackagingRegistrationChecklist':
        return `
    <div class="content-block">
      <h2>Registration information checklist</h2>
      <p>
        TODO: Provide a checklist of information needed for registration.
      </p>
      <ul class="checklist">
        {${JSON.stringify(item.requiredInternalLinks.slice(0, 5).map(l => l + ' (TODO: item)')).replace(/"/g, '')}.map((item) => (
          <li class="checklist-item">
            <span class="checklist-icon"></span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>`;
      case 'Checklist':
        return `
    <div class="content-block">
      <h2>Checklist</h2>
      <ul class="checklist">
        <li class="checklist-item"><span class="checklist-icon"></span><span>TODO: Add checklist item</span></li>
        <li class="checklist-item"><span class="checklist-icon"></span><span>TODO: Add checklist item</span></li>
        <li class="checklist-item"><span class="checklist-icon"></span><span>TODO: Add checklist item</span></li>
      </ul>
    </div>`;
      case 'CommonMistakes':
        return `
    <div class="content-block">
      <h2>Common mistakes</h2>
      <div class="mistakes-list">
        <div class="mistake-item">
          <svg class="mistake-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <p class="mistake-text">TODO: Add a common mistake with safe compliance language.</p>
        </div>
      </div>
    </div>`;
      case 'TopicOverview':
      case 'KeyDifferences':
      case 'WhatThisMeans':
      case 'CommonQuestions':
        return `
    <div class="content-block">
      <h2>${block.replace(/([A-Z])/g, ' $1').trim()}</h2>
      <p>TODO: Fill with researched, compliance-safe content.</p>
    </div>`;
      case 'OfficialSources':
        return `
    <OfficialSources sources={sources} />`;
      case 'FAQ':
        return `
    <FAQBlock faqs={pageFAQs} />`;
      case 'Disclaimer':
        return `
    <DisclaimerBlock />`;
      case 'CTASection':
      case 'CTA':
        return `
    <div class="cta-section">
      <h2>Need help?</h2>
      <p>Leave a message and a compliance service provider will follow up with you.</p>
      <div class="cta-section-buttons">
        <CTABox text={site.secondaryCtaText} href={site.secondaryCtaHref} variant="ghost" />
        <CTABox text={site.primaryCtaText} href={site.primaryCtaHref} variant="secondary" />
      </div>
    </div>`;
      case 'RelatedGuides':
        return buildRelatedGuidesSection(item.requiredInternalLinks);
      default:
        return `
    <div class="content-block">
      <h2>${block.replace(/([A-Z])/g, ' $1').trim()}</h2>
      <p>TODO: Fill with researched, compliance-safe content.</p>
    </div>`;
    }
  }).join('\n');

  const pageImports = [
    "import Layout from '../components/Layout.astro';",
    "import PageHeader from '../components/PageHeader.astro';",
    "import AISummary from '../components/AISummary.astro';",
    "import FAQBlock from '../components/FAQBlock.astro';",
    "import DisclaimerBlock from '../components/DisclaimerBlock.astro';",
    "import OfficialSources from '../components/OfficialSources.astro';",
    "import CTABox from '../components/CTABox.astro';",
  ];

  const sourceTopicsArg = item.officialSourceTopics.length > 0
    ? `['${item.officialSourceTopics.join("', '")}']`
    : "['general']";

  const faqConst = item.longTailQuestions.length > 0
    ? `
const pageFAQs = [
${faqItems}
];
`
    : '';

  const sitemapKey = item.path === '/' ? '/' : item.path;
  const pageFile = `---
${pageImports.join('\n')}
import { site } from '../data/site';
import { routes } from '../data/routes';
import { getSourcesForTopics } from '../data/officialSources';
${faqConst}

const pagePath = '${item.path}';
const canonical = \\\`\\\${site.siteUrl}${item.path === '/' ? '' : item.path.replace(/\/$/, '')}\\\`;
const route = routes.find((r) => r.path === pagePath) ?? routes.find((r) => r.path === '${item.path}');

const sources = getSourcesForTopics(${sourceTopicsArg});
---

<Layout
  title={route.title}
  description={route.description}
  canonical={canonical}
>
${sectionBlocks}
</Layout>

<style>
  .content-wrapper {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .quick-answer {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-left: 4px solid #0284c7;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border-radius: 0 8px 8px 0;
  }

  .quick-answer-label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #0284c7;
    margin-bottom: 0.5rem;
  }

  .quick-answer p {
    margin: 0;
    color: #1e293b;
    line-height: 1.7;
  }

  .content-block h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 2rem 0 1rem;
    color: #1e293b;
  }

  .content-block p {
    line-height: 1.7;
    margin-bottom: 1rem;
    color: #475569;
  }

  .checklist {
    list-style: none !important;
    padding: 0 !important;
    margin: 1.5rem 0;
  }

  .checklist-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid #e2e8f0;
  }

  .checklist-icon {
    width: 20px;
    height: 20px;
    min-width: 20px;
    background: #22c55e;
    border-radius: 50%;
    position: relative;
    margin-top: 2px;
  }

  .checklist-icon::after {
    content: '';
    position: absolute;
    top: 5px;
    left: 7px;
    width: 5px;
    height: 9px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .mistakes-list {
    margin: 1.5rem 0;
  }

  .mistake-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    background: #fef2f2;
    border-radius: 8px;
    margin-bottom: 0.75rem;
  }

  .mistake-icon {
    color: #ef4444;
    min-width: 18px;
    margin-top: 2px;
  }

  .mistake-text {
    margin: 0;
    color: #991b1b;
    line-height: 1.5;
  }

  .cta-section {
    background: #f8fafc;
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
    margin: 2rem 0;
  }

  .cta-section h2 {
    margin-top: 0;
    color: #1e293b;
  }

  .cta-section p {
    color: #475569;
    margin-bottom: 0;
  }

  .cta-section-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1.5rem;
    flex-wrap: wrap;
  }

  .related-guides {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e2e8f0;
  }

  .related-guides h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: #1e293b;
  }

  .related-guides ul {
    list-style: none;
    padding: 0;
  }

  .related-guides li {
    margin-bottom: 0.5rem;
  }

  .related-guides a {
    color: #0284c7;
    text-decoration: none;
  }

  .related-guides a:hover {
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    .content-wrapper {
      padding: 1.5rem 1rem;
    }

    .cta-section-buttons {
      flex-direction: column;
      align-items: center;
    }
  }
</style>
`;

  return pageFile;
}

// --- Main ---

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: npm run page:create -- <slug>');
  console.error('Example: npm run page:create -- germany-epr-packaging-registration');
  process.exit(1);
}

const slugArg = args[0];

// Parse roadmap and templates
const roadmapContent = readFile('src/data/contentRoadmap.ts');
const templatesContent = readFile('src/data/pageTemplates.ts');

const roadmapItems = parseRoadmapItems(roadmapContent).map(parseRoadmapBlock);
const templates = parseTemplates(templatesContent);

// Find matching item by slug (path match)
const item = roadmapItems.find(i => {
  const itemSlug = slugifyPath(i.path);
  return itemSlug === slugArg || i.path === '/' + slugArg + '/' || i.path === slugArg;
});

if (!item) {
  console.error(`\n  [PAGE FACTORY] Page "${slugArg}" not found in contentRoadmap.ts`);
  console.error('  \n  Add the page as a "planned" item to src/data/contentRoadmap.ts first.');
  console.error('  Required fields: path, status, categoryId, templateId, primaryKeyword,');
  console.error('  secondaryKeywords, longTailQuestions, monetizationPath, officialSourceTopics,');
  console.error('  requiredInternalLinks');
  process.exit(1);
}

if (item.status !== 'planned') {
  console.error(`\n  [PAGE FACTORY] Page "${item.path}" has status "${item.status}".`);
  if (item.status === 'live') {
    console.error('  A live page already exists. Skipping scaffold.');
    process.exit(1);
  }
  console.error('  Only "planned" pages can be scaffolded. Change status to "planned" first.');
  process.exit(1);
}

const template = templates[item.templateId];
if (!template) {
  console.error(`\n  [PAGE FACTORY] Template "${item.templateId}" not found in pageTemplates.ts`);
  process.exit(1);
}

const pageSlug = slugifyPath(item.path);
const outputPath = `src/pages/${pageSlug}.astro`;

if (existsSync(resolve(rootDir, outputPath))) {
  console.error(`\n  [PAGE FACTORY] Page file already exists: ${outputPath}`);
  console.error('  Skipping scaffold. To regenerate, delete the file first.');
  process.exit(1);
}

const scaffold = buildScaffold(item, template);

try {
  writeFileSync(resolve(rootDir, outputPath), scaffold, 'utf-8');
} catch (err) {
  console.error(`\n  [ERROR] Failed to write ${outputPath}: ${err.message}`);
  process.exit(1);
}

console.log(`
  [PAGE FACTORY] Page scaffold created: ${outputPath}

  Category:    ${item.categoryId}
  Template:    ${item.templateId}
  Keyword:     ${item.primaryKeyword}
  Internal links: ${item.requiredInternalLinks.length}

  NEXT STEPS:
  1. Add route to src/data/routes.ts
  2. Fill the TODO sections with researched content
  3. Add FAQ data to src/data/faq.ts
  4. Ensure official sources exist in src/data/officialSources.ts
  5. Change contentRoadmap status from "planned" to "live"
  6. Run: npm run verify
  7. Commit and push
  8. Deploy with: /opt/eureadyseller/deploy.sh
`);
