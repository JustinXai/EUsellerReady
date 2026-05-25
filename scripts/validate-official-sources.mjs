#!/usr/bin/env node
/**
 * validate-official-sources.mjs
 * Validates that every live page has:
 * 1. officialSourceTopics not empty in contentRoadmap
 * 2. All topic IDs have corresponding sources in officialSources.ts
 * 3. Page HTML contains an Official Sources section
 * 4. No obviously low-quality sources
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

function readFile(filename) {
  return readFileSync(resolve(rootDir, filename), 'utf-8');
}

function parseRoadmapLiveItems(content) {
  const items = [];
  const blockRegex = /\/\/\s*[=\-]+\s*\n\s*\{\s*\n([\s\S]*?)\n\s*\}[,]/g;
  let match;
  while ((match = blockRegex.exec(content)) !== null) {
    const block = match[1];
    const path = block.match(/path:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
    const status = block.match(/status:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
    const primaryKeyword = block.match(/primaryKeyword:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
    const officialSourceTopics = [...block.matchAll(/officialSourceTopics:\s*\[([^\]]*)\]/g)]
      .flatMap(m => [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map(n => n[1]));
    if (path && status === 'live') {
      items.push({ path, status, primaryKeyword, officialSourceTopics });
    }
  }
  return items;
}

function parseOfficialSources(content) {
  const sources = {};
  // Match each source group: 'topic': [ ... ]
  const groupRegex = /['"]?([a-zA-Z0-9]+)['"]?\s*:\s*\[([^\]]*)\]/g;
  let match;
  while ((match = groupRegex.exec(content)) !== null) {
    const topic = match[1];
    const itemsStr = match[2];
    const urls = [...itemsStr.matchAll(/url:\s*['"]([^'"]+)['"]/g)].map(n => n[1]);
    sources[topic] = urls;
  }
  return sources;
}

function slugify(path) {
  return path.replace(/^\//, '').replace(/\/$/, '');
}

// Detect Official Sources section in page content
function hasOfficialSourcesSection(content) {
  const patterns = [
    /official[\s-]?sources/i,
    /official[\s-]?resources/i,
    /further[\s-]?resources/i,
    /official[\s-]?links/i,
    /sources[\s-]?and[\s-]?resources/i,
  ];
  // Check heading text
  if (/<h[123][^>]*>[\s\S]*?(official|source|resource)[^\n<]{0,100}<\/h[123]>/i.test(content)) return true;
  // Check class names
  if (/\bclass=["'][^"']*(?:official|source|resource)[^"']*["']/i.test(content)) return true;
  // Check section text
  for (const p of patterns) {
    if (p.test(content)) return true;
  }
  return false;
}

// Detect low-quality sources
function hasLowQualitySource(url) {
  const lowQualityPatterns = [
    /reddit\.com/i,
    /medium\.com/i,
    /\.forum\./i,
    /stackoverflow\.com/i,
    /quora\.com/i,
    /facebook\.com/i,
    /twitter\.com/i,
    /instagram\.com/i,
    /youtube\.com/i,
    /tiktok\.com/i,
    /pinterest\.com/i,
    /blogspot\.com/i,
    /wordpress\.com/i,
    /substack\.com/i,
    /wix\.com/i,
    /squarespace\.com/i,
    /weebly\.com/i,
  ];
  // Allow common blog platforms that might be quality
  const questionableDomains = [
    'law firm blog',
    'random blog',
    'personal site',
  ];

  for (const p of lowQualityPatterns) {
    if (p.test(url)) return true;
  }

  return false;
}

// Detect platform official sources
function isPlatformOfficial(url, platform) {
  const platformDomains = {
    amazon: /amazon\.(com|co\.uk|de|fr|it|es|com\.au)/i,
    shopify: /shopify\.(com|ca|uk)/i,
    etsy: /etsy\.(com|com\.uk)/i,
    woocommerce: /woocommerce\.(com|com\.au)/i,
    caddy: /caddyserver\.com/i,
  };
  const domainMatcher = platformDomains[platform?.toLowerCase()];
  if (!domainMatcher) return false;
  return domainMatcher.test(url);
}

// Detect EU/official domain
function isEUDomain(url) {
  return /ec\.europa\.eu|eur-lex\.europa\.eu|single-market-economy\.ec\.europa|europa\.eu|gov\.(de|fr|es|it|nl|be|at|pl|se|dk|fi|ie|pt|gr|cz|hu|ro|bg|hr|sk|si|lt|lv|ee|lu|mt|cy)|bmuv\.de|ademe\.fr|lucid\.verpackungsregister/i.test(url);
}

function checkPageSources(pageContent, pagePath, topics, allSources) {
  const errors = [];

  // 1. Check official sources section exists
  if (!hasOfficialSourcesSection(pageContent)) {
    errors.push('Missing Official Sources section');
  }

  // 2. Check for low-quality source URLs if present
  const urlMatches = [...pageContent.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
  for (const url of urlMatches) {
    if (url.startsWith('http') && hasLowQualitySource(url)) {
      // Don't fail on every link — only flag if it's in an official sources context
      const contextStart = Math.max(0, pageContent.indexOf(url) - 200);
      const context = pageContent.slice(contextStart, contextStart + 400);
      if (/official|source|resource/i.test(context)) {
        errors.push(`Low-quality source URL detected in sources context: ${url.slice(0, 60)}`);
      }
    }
  }

  return errors;
}

// --- Main ---

const roadmapContent = readFile('src/data/contentRoadmap.ts');
const sourcesContent = readFile('src/data/officialSources.ts');

const liveItems = parseRoadmapLiveItems(roadmapContent);
const allSources = parseOfficialSources(sourcesContent);

let passCount = 0;
let failCount = 0;
const allFailures = [];

console.log('o [OFFICIAL SOURCES] Validating official source topics and page sections...\n');

for (const item of liveItems) {
  const slug = slugify(item.path);

  // 1. Check officialSourceTopics is not empty
  if (!item.officialSourceTopics || item.officialSourceTopics.length === 0) {
    console.log(`  ✗ ${item.path} — officialSourceTopics is empty in contentRoadmap`);
    allFailures.push(`${item.path} — officialSourceTopics is empty`);
    failCount++;
    continue;
  }

  // 2. Check each topic has sources
  const missingTopics = [];
  for (const topic of item.officialSourceTopics) {
    const topicSources = allSources[topic];
    if (!topicSources || topicSources.length === 0) {
      missingTopics.push(topic);
    }
  }

  if (missingTopics.length > 0) {
    console.log(`  ✗ ${item.path} — missing source groups: ${missingTopics.join(', ')}`);
    allFailures.push(`${item.path} — missing source groups: ${missingTopics.join(', ')}`);
    failCount++;
    continue;
  }

  // 3. Check page HTML has Official Sources section
  const distPath = resolve(rootDir, 'dist', slug, 'index.html');
  const srcPath = resolve(rootDir, 'src', 'pages', `${slug}.astro`);
  let pageContent = '';

  if (existsSync(distPath)) {
    pageContent = readFileSync(distPath, 'utf-8');
  } else if (existsSync(srcPath)) {
    pageContent = readFileSync(srcPath, 'utf-8');
  }

  const sectionErrors = checkPageSources(pageContent, item.path, item.officialSourceTopics, allSources);

  if (sectionErrors.length === 0) {
    console.log(`  ✓ ${item.path} — officialSourceTopics: ${item.officialSourceTopics.join(', ')} — sources verified`);
    passCount++;
  } else {
    for (const err of sectionErrors) {
      console.log(`  ✗ ${item.path} — ${err}`);
      allFailures.push(`${item.path} — ${err}`);
    }
    failCount++;
  }
}

console.log('');

if (failCount === 0) {
  console.log(`PASS: Official sources validation passed (${passCount} pages checked)`);
  process.exit(0);
} else {
  console.log(`FAIL: Official sources validation failed (${passCount} passed, ${failCount} failed)\n`);
  for (const f of allFailures) {
    console.log(`  x ${f}`);
  }
  console.log('\n  To add missing source groups, edit src/data/officialSources.ts');
  process.exit(1);
}
