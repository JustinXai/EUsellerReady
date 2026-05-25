/**
 * external-smoke.mjs
 * Deployment smoke test — checks the LIVE site (https://eureadyseller.com).
 * Uses Node 20 built-in fetch (no npm dependencies needed).
 *
 * Dynamically reads all includeInSitemap and includeInLlms routes from routes.ts.
 *
 * Run: npm run external:smoke
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const BASE_URL = 'https://eureadyseller.com';

// --- Parse routes from routes.ts ---
function parseRoutes() {
  const content = readFileSync(resolve(rootDir, 'src/data/routes.ts'), 'utf-8');
  const pathMatches = [...content.matchAll(/path:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
  const titleMatches = [...content.matchAll(/h1:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
  const sitemapMatches = [...content.matchAll(/includeInSitemap:\s*(true|false)/g)].map((m) => m[1] === 'true');
  const llmsMatches = [...content.matchAll(/includeInLlms:\s*(true|false)/g)].map((m) => m[1] === 'true');
  return pathMatches.map((path, i) => ({
    path,
    h1: titleMatches[i] ?? '',
    includeInSitemap: sitemapMatches[i] ?? true,
    includeInLlms: llmsMatches[i] ?? true,
  }));
}

const routes = parseRoutes();
const sitemapRoutes = routes.filter((r) => r.includeInSitemap);
const llmsRoutes = routes.filter((r) => r.includeInLlms);

let exitCode = 0;

function log(type, msg) {
  const prefix = type === 'ERROR' ? 'x' : type === 'WARN' ? '!' : 'o';
  console.log(prefix + ' ' + msg);
  if (type === 'ERROR') exitCode = 1;
}

async function fetchText(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'EUReadySeller-smoke-test/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    return { ok: res.ok, status: res.status, text: await res.text() };
  } catch (e) {
    return { ok: false, status: 0, text: '', error: e.message };
  }
}

async function check() {
  console.log('[SMOKE] External deployment smoke test\n');
  console.log(`Routes: ${routes.length} total | ${sitemapRoutes.length} in sitemap | ${llmsRoutes.length} in llms\n`);

  // --- HTTP 200 checks for all sitemap routes ---
  log('INFO', '--- HTTP status checks (all includeInSitemap routes) ---');
  for (const route of sitemapRoutes) {
    const url = `${BASE_URL}${route.path}`;
    const result = await fetchText(url);
    if (result.ok) {
      log('OK', `HTTP ${result.status} - ${url}`);
    } else {
      log('ERROR', `HTTP ${result.status} - ${url} ${result.error ?? ''}`);
    }
  }

  // --- Robots.txt checks ---
  console.log('');
  log('INFO', '--- robots.txt content checks ---');
  const robotsResult = await fetchText(`${BASE_URL}/robots.txt`);
  if (robotsResult.ok) {
    const r = robotsResult.text;
    if (r.includes('Disallow: /')) {
      log('ERROR', 'robots.txt contains "Disallow: /" — blocks all crawlers!');
    } else {
      log('OK', 'robots.txt does not block all crawlers');
    }
    for (const bot of ['GPTBot', 'ChatGPT-User', 'CCBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
      if (r.includes(bot)) {
        log('ERROR', `robots.txt blocks ${bot}`);
      } else {
        log('OK', `robots.txt does not block ${bot}`);
      }
    }
    if (!r.includes('Allow: /')) {
      log('ERROR', 'robots.txt missing "Allow: /"');
    } else {
      log('OK', 'robots.txt has "Allow: /"');
    }
    if (!r.includes('Sitemap:')) {
      log('WARN', 'robots.txt missing Sitemap directive');
    } else {
      log('OK', 'robots.txt has Sitemap directive');
    }
  } else {
    log('ERROR', 'Could not fetch robots.txt');
  }

  // --- LLMs.txt checks (all includeInLlms routes) ---
  console.log('');
  log('INFO', '--- llms.txt coverage checks (all includeInLlms routes) ---');
  const llmsResult = await fetchText(`${BASE_URL}/llms.txt`);
  if (llmsResult.ok) {
    const l = llmsResult.text;
    for (const route of llmsRoutes) {
      if (l.includes(route.path)) {
        log('OK', `llms.txt contains ${route.path}`);
      } else {
        log('ERROR', `llms.txt MISSING ${route.path}`);
      }
    }
  } else {
    log('ERROR', 'Could not fetch llms.txt');
  }

  // --- Sitemap checks (all includeInSitemap routes) ---
  console.log('');
  log('INFO', '--- sitemap.xml coverage checks (all includeInSitemap routes) ---');
  const sitemapResult = await fetchText(`${BASE_URL}/sitemap.xml`);
  if (sitemapResult.ok) {
    const s = sitemapResult.text;
    for (const route of sitemapRoutes) {
      if (s.includes(route.path)) {
        log('OK', `sitemap.xml contains ${route.path}`);
      } else {
        log('ERROR', `sitemap.xml MISSING ${route.path}`);
      }
    }
  } else {
    log('ERROR', 'Could not fetch sitemap.xml');
  }

  // --- Page H1 checks (all sitemap routes) ---
  console.log('');
  log('INFO', '--- Page H1 checks (all includeInSitemap routes) ---');
  for (const route of sitemapRoutes) {
    if (!route.h1) continue;
    const url = `${BASE_URL}${route.path}`;
    const result = await fetchText(url);
    if (result.ok) {
      if (result.text.includes(route.h1)) {
        log('OK', `${route.path} has correct H1`);
      } else {
        log('ERROR', `${route.path} MISSING expected H1: "${route.h1}"`);
      }
    } else {
      log('ERROR', `${route.path} page not accessible for H1 check`);
    }
  }

  // --- Page structural checks (spot-check homepage) ---
  console.log('');
  log('INFO', '--- Homepage structural checks ---');
  const homeResult = await fetchText(`${BASE_URL}/`);
  if (homeResult.ok) {
    const h = homeResult.text;
    const checks = [
      { pattern: /<h1/i, name: 'H1 element' },
      { pattern: /<link[^>]+rel=["']canonical["'][^>]*>/i, name: 'canonical link' },
      { pattern: /<script[^>]+type=["']application\/ld\+json["'][^>]*>/i, name: 'JSON-LD script' },
      { pattern: /AI-?readable summary|aiSummary/i, name: 'AI Summary text' },
      { pattern: /not legal advice|Compliance Disclaimer|disclaimer/i, name: 'Disclaimer text' },
      { pattern: /CTA|call.?to.?action|button|submit/i, name: 'CTA element' },
    ];
    for (const { pattern, name } of checks) {
      if (pattern.test(h)) {
        log('OK', `Homepage has ${name}`);
      } else {
        log('WARN', `Homepage MISSING ${name}`);
      }
    }
  } else {
    log('ERROR', 'Could not fetch homepage for structural checks');
  }

  console.log('');
  if (exitCode === 0) {
    console.log('PASS: All external smoke checks passed');
  } else {
    console.log('FAIL: Some external smoke checks failed');
  }

  process.exit(exitCode);
}

check();
