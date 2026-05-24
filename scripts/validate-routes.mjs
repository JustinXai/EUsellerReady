/**
 * validate-routes.mjs
 * Checks:
 * 1. All registered routes exist as actual pages
 * 2. All includeInSitemap routes are in sitemap.xml
 * 3. All includeInLlms routes are in llms.txt
 */
import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const SITE_URL = 'https://eureadyseller.com';

let exitCode = 0;

function log(type, msg) {
  const prefix = type === 'ERROR' ? '✗' : type === 'WARN' ? '⚠' : '✓';
  console.log(`${prefix} ${msg}`);
  if (type === 'ERROR') exitCode = 1;
}

// --- Parse routes from routes.ts ---
let routes;
try {
  const content = readFileSync(resolve(rootDir, 'src/data/routes.ts'), 'utf-8');
  const pathMatches = [...content.matchAll(/path:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
  const titleMatches = [...content.matchAll(/title:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
  const sitemapMatches = [...content.matchAll(/includeInSitemap:\s*(true|false)/g)].map((m) => m[1] === 'true');
  const llmsMatches = [...content.matchAll(/includeInLlms:\s*(true|false)/g)].map((m) => m[1] === 'true');

  routes = pathMatches.map((path, i) => ({
    path,
    title: titleMatches[i] ?? '',
    includeInSitemap: sitemapMatches[i] ?? true,
    includeInLlms: llmsMatches[i] ?? true,
  }));
} catch (e) {
  log('ERROR', `Failed to read routes.ts: ${e.message}`);
  process.exit(1);
}

// --- Find actual page files ---
function findPages(dir, base = '') {
  const pages = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        pages.push(...findPages(resolve(dir, entry.name), `${base}/${entry.name}`));
      } else if (entry.name.endsWith('.astro') && entry.name !== '404.astro') {
        const pagePath = entry.name === 'index.astro'
          ? `${base}/`
          : `${base}/${entry.name.replace('.astro', '/')}`;
        pages.push(pagePath);
      }
    }
  } catch (e) {
    // ignore
  }
  return pages;
}

const actualPages = findPages(resolve(rootDir, 'src/pages'));

// --- Check 1: Registered routes exist as pages ---
log('INFO', '--- Route existence check ---');
for (const route of routes) {
  const normalized = route.path.replace(/\/$/, '');
  const expectedPaths = [
    route.path,
    `${route.path}/`,
    route.path === '/' ? '/index.html' : `${normalized}.html`,
  ];

  const exists = actualPages.some((p) => {
    const pn = p.replace(/\/$/, '');
    return pn === normalized || pn === route.path.replace(/\/$/, '') || p === route.path;
  });

  if (!exists) {
    log('ERROR', `Route "${route.path}" registered but no page found. Expected in: src/pages${route.path === '/' ? '/index.astro' : route.path.replace(/\/$/, '') + '.astro'}`);
  } else {
    log('OK', `Route "${route.path}" — page exists`);
  }
}

// --- Check 2: Sitemap coverage ---
log('INFO', '--- Sitemap coverage check ---');
let sitemapUrls = [];
try {
  const sitemap = readFileSync(resolve(rootDir, 'public/sitemap.xml'), 'utf-8');
  sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE_URL, ''));
} catch (e) {
  log('WARN', 'sitemap.xml not found — run build first');
}

for (const route of routes) {
  if (!route.includeInSitemap) continue;
  const inSitemap = sitemapUrls.some((u) => {
    const uNorm = u.replace(/\/$/, '');
    const rNorm = route.path.replace(/\/$/, '');
    return uNorm === rNorm || u === route.path;
  });
  if (!inSitemap && sitemapUrls.length > 0) {
    log('ERROR', `Route "${route.path}" has includeInSitemap=true but not found in sitemap.xml`);
  } else if (inSitemap) {
    log('OK', `Route "${route.path}" in sitemap.xml`);
  }
}

// --- Check 3: llms.txt coverage ---
log('INFO', '--- llms.txt coverage check ---');
let llmsUrls = [];
try {
  const llms = readFileSync(resolve(rootDir, 'public/llms.txt'), 'utf-8');
  llmsUrls = [...llms.matchAll(/https:\/\/eureadyseller\.com[^ \n]+/g)].map((m) => m[0].replace('https://eureadyseller.com', '').split(' ')[0]);
} catch (e) {
  log('WARN', 'llms.txt not found — run build first');
}

for (const route of routes) {
  if (!route.includeInLlms) continue;
  const pathKey = route.path.replace(/\/$/, '');
  const inLlms = llmsUrls.some((u) => u.replace(/\/$/, '') === pathKey) ||
    (route.path === '/' && llmsUrls.length > 0);
  if (!inLlms && llmsUrls.length > 0) {
    log('WARN', `Route "${route.path}" has includeInLlms=true but not found in llms.txt`);
  }
}

log('INFO', `--- Total: ${routes.length} routes registered, ${actualPages.length} pages found ---`);
process.exit(exitCode);
