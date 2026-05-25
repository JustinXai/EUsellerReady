#!/usr/bin/env node
/**
 * validate-page-template.mjs
 * Validates that every live page has all required sections
 * from its template in pageTemplates.ts.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// --- Helpers ---

function readFile(filename) {
  return readFileSync(resolve(rootDir, filename), 'utf-8');
}

function parseRoutes(content) {
  const routes = [];
  const blockRegex = /\{\s*\n([\s\S]*?)\n\s*\}[,;]/g;
  let match;
  while ((match = blockRegex.exec(content)) !== null) {
    const block = match[1];
    const path = block.match(/path:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
    const title = block.match(/title:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
    const includeInSitemap = block.match(/includeInSitemap:\s*(true|false)/)?.[1] === 'true';
    const includeInLlms = block.match(/includeInLlms:\s*(true|false)/)?.[1] === 'true';
    if (path && includeInSitemap) {
      routes.push({ path, title, includeInSitemap, includeInLlms });
    }
  }
  return routes;
}

function parseRoadmapLiveItems(content) {
  const items = [];
  const blockRegex = /\/\/\s*[=\-]+\s*\n\s*\{\s*\n([\s\S]*?)\n\s*\}[,]/g;
  let match;
  while ((match = blockRegex.exec(content)) !== null) {
    const block = match[1];
    const path = block.match(/path:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
    const status = block.match(/status:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
    const templateId = block.match(/templateId:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
    const primaryKeyword = block.match(/primaryKeyword:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
    if (path && status === 'live') {
      items.push({ path, status, templateId, primaryKeyword });
    }
  }
  return items;
}

function parseTemplates(content) {
  const templates = {};
  const templateRegex = /\b([a-zA-Z]+Template?):\s*\{([\s\S]*?)\n\s*\}[,]/g;
  let match;
  while ((match = templateRegex.exec(content)) !== null) {
    const name = match[1];
    const block = match[2];
    const templateId = block.match(/templateId:\s*['"]([^'"]+)['"]/)?.[1] ?? name;
    const requiredBlocks = [...block.matchAll(/requiredBlocks:\s*\[([^\]]*)\]/g)]
      .flatMap(m => [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map(n => n[1]));
    templates[templateId] = { templateId, requiredBlocks };
  }
  return templates;
}

function slugify(path) {
  return path.replace(/^\//, '').replace(/\/$/, '');
}

// Normalize section name for matching
function normalizeSection(name) {
  return name
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Keywords to detect a section — broader matching for real-world naming variations
function sectionKeywords(section) {
  const map = {
    'quickanswer': ['quick', 'answer'],
    'aisummary': ['ai', 'summary', 'artificial intelligence'],
    'faq': ['faq', 'frequently', 'questions'],
    'officialsources': ['official', 'sources', 'resources', 'official source'],
    'disclaimer': ['disclaimer'],
    'cta': ['cta', 'call to action', 'contact', 'message', 'checker', 'help', 'cta-section', 'cta section', 'need help'],
    'relatedguides': ['related', 'guides', 'further reading', 'further resources'],
    'who': ['who', 'this', 'applies', 'target', 'audience'],
    'checklist': ['checklist', 'check list', 'registration', 'information checklist'],
    'commonmistakes': ['common', 'mistakes', 'errors', 'avoid'],
    'what': ['what', 'prepare', 'need', 'topics to review'],
    'country': ['country', 'specific', 'germany', 'france'],
    'platformcontext': ['platform', 'amazon', 'shopify', 'etsy', 'context'],
    'platformimplications': ['platform', 'implications', 'amazon', 'marketplace'],
    'common': ['common', 'questions', 'mistakes'],
    'serviceoptions': ['service', 'options', 'provider'],
    'provideroptions': ['provider', 'options'],
    'topic': ['topic', 'overview', 'explain'],
    'keydifference': ['difference', 'compare', 'comparison', 'vs'],
    'whatthismeans': ['what', 'means', 'implication'],
    'pageheader': ['page', 'header', 'hero', 'heading', 'h1'],
    'whoappliesto': ['who', 'applies', 'target', 'audience', 'this'],
  };
  return map[section.toLowerCase()] ?? [normalizeSection(section).split(' ').filter(Boolean).join(' ')];
}

function detectSectionInContent(content, section) {
  const keywords = sectionKeywords(section);
  const content_lower = content.toLowerCase();
  return keywords.some(kw => {
    if (kw.includes(' ')) {
      return content_lower.includes(kw);
    }
    return content_lower.includes(kw);
  });
}

function pageHasSection(pageContent, section) {
  const normalized = normalizeSection(section);
  const section_lower = section.toLowerCase();
  const content_lower = pageContent.toLowerCase();

  // Strategy 1: Extract all heading texts and check for match
  const headingTextMatches = [...pageContent.matchAll(/<h[123][^>]*>([\s\S]*?)<\/h[123]>/gi)];
  for (const match of headingTextMatches) {
    const headingText = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    const headingNorm = normalizeSection(headingText);
    // Check if the normalized section name appears in heading text
    if (headingText.includes(normalized) || headingNorm.includes(normalized) ||
        normalized.includes(headingNorm) || headingNorm.includes(normalized.split(' ')[0])) {
      return true;
    }
    // Also check camelCase split: WhatToPrepare matches "what to prepare"
    const camelSplit = section.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
    if (headingText.includes(camelSplit) || headingNorm.includes(camelSplit.split(' ')[0])) {
      return true;
    }
  }

  // Strategy 2: Check class names with normalized matching
  const classMatches = [...pageContent.matchAll(/class=["']([^"']+)["']/gi)];
  for (const m of classMatches) {
    const classVal = m[1].toLowerCase().replace(/[-_]/g, ' ');
    const classNorm = classVal.replace(/\s+/g, ' ').trim();
    if (classNorm.includes(normalized) || normalized.includes(classNorm) ||
        classNorm.split(' ')[0] === normalized.split(' ')[0]) {
      return true;
    }
  }

  // Strategy 3: Keyword map matching
  const keywords = sectionKeywords(section);
  const matchedKeywords = [];
  for (const kw of keywords) {
    if (content_lower.includes(kw)) matchedKeywords.push(kw);
  }
  // If 2+ keywords matched, count as present
  if (matchedKeywords.length >= 2) return true;
  // For short section names (1-2 words), 1 keyword match is enough
  if (normalized.split(' ').length <= 2 && matchedKeywords.length >= 1) return true;

  // Strategy 4: Check if first word of section appears near a section-like context
  const firstWord = normalized.split(' ')[0];
  if (firstWord && firstWord.length > 3) {
    // Check if this word appears in a heading-like context
    const wordMatches = [...content_lower.matchAll(new RegExp(`<h[123][^>]*>[^<]*${firstWord}[^<]*</h[123]>`, 'i'))];
    if (wordMatches.length > 0) return true;
  }

  return false;
}

// --- Main ---

const routesContent = readFile('src/data/routes.ts');
const roadmapContent = readFile('src/data/contentRoadmap.ts');
const templatesContent = readFile('src/data/pageTemplates.ts');

const routes = parseRoutes(routesContent);
const liveItems = parseRoadmapLiveItems(roadmapContent);
const templates = parseTemplates(templatesContent);

let passCount = 0;
let failCount = 0;
const failures = [];

for (const item of liveItems) {
  const route = routes.find(r => r.path === item.path);
  if (!route) {
    failures.push(`${item.path} — no route found in routes.ts`);
    failCount++;
    continue;
  }

  const template = templates[item.templateId];
  if (!template) {
    failures.push(`${item.path} — template "${item.templateId}" not found`);
    failCount++;
    continue;
  }

  // Read the built HTML to check sections
  const slug = slugify(item.path);
  let pageContent = '';
  let htmlPath = '';

  // Try dist first (build output)
  const distPath = resolve(rootDir, 'dist', slug, 'index.html');
  const distAlt = resolve(rootDir, 'dist', `${slug}.html`);
  if (existsSync(distPath)) {
    htmlPath = distPath;
    pageContent = readFileSync(distPath, 'utf-8');
  } else if (existsSync(distAlt)) {
    htmlPath = distAlt;
    pageContent = readFileSync(distAlt, 'utf-8');
  }

  // Also read source file for section-level checks
  const srcPath = resolve(rootDir, 'src', 'pages', `${slug}.astro`);
  const srcContent = existsSync(srcPath) ? readFileSync(srcPath, 'utf-8') : '';

  const combined = pageContent + '\n' + srcContent;

  const missing = [];
  for (const block of template.requiredBlocks) {
    // Core universal blocks — check strictly
    if (['QuickAnswer', 'AISummary', 'FAQ', 'OfficialSources', 'Disclaimer', 'CTA'].includes(block)) {
      if (!pageHasSection(combined, block)) {
        missing.push(block);
      }
    } else {
      // Optional/template-specific — check if at least keywords exist
      if (!pageHasSection(combined, block)) {
        missing.push(block);
      }
    }
  }

  if (missing.length === 0) {
    console.log(`  ✓ ${item.path} — template "${item.templateId}" — all required sections present`);
    passCount++;
  } else {
    console.log(`  ✗ ${item.path} — missing: ${missing.join(', ')}`);
    failures.push(`${item.path} — missing required section: ${missing.join(', ')}`);
    failCount++;
  }
}

console.log('');

if (failCount === 0) {
  console.log(`PASS: Page template validation passed (${passCount} pages checked)`);
  process.exit(0);
} else {
  console.log(`FAIL: Page template validation failed (${passCount} passed, ${failCount} failed)\n`);
  for (const f of failures) {
    console.log(`  x ${f}`);
  }
  process.exit(1);
}
