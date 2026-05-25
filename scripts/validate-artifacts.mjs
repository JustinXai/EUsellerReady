/**
 * validate-artifacts.mjs
 * Validates dist/robots.txt, dist/sitemap.xml, and dist/llms.txt
 * are consistent, complete, and policy-correct.
 *
 * Run: node scripts/validate-artifacts.mjs
 *   or: npm run validate:artifacts
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');
const SITE_URL = 'https://eureadyseller.com';

let exitCode = 0;

function log(type, msg) {
  const prefix = type === 'ERROR' ? 'x' : type === 'WARN' ? '!' : 'o';
  console.log(prefix + ' ' + msg);
  if (type === 'ERROR') exitCode = 1;
}

// --- Check dist exists ---
if (!existsSync(distDir)) {
  log('ERROR', 'dist/ directory not found. Run "npm run build" first.');
  process.exit(1);
}

// --- Parse routes from routes.ts ---
function parseRoutes() {
  const content = readFileSync(resolve(rootDir, 'src/data/routes.ts'), 'utf-8');
  const pathMatches = [...content.matchAll(/path:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
  const sitemapMatches = [...content.matchAll(/includeInSitemap:\s*(true|false)/g)].map((m) => m[1] === 'true');
  const llmsMatches = [...content.matchAll(/includeInLlms:\s*(true|false)/g)].map((m) => m[1] === 'true');
  return pathMatches.map((path, i) => ({
    path,
    includeInSitemap: sitemapMatches[i] ?? true,
    includeInLlms: llmsMatches[i] ?? true,
  }));
}

const routes = parseRoutes();
const sitemapRoutes = routes.filter((r) => r.includeInSitemap);
const llmsRoutes = routes.filter((r) => r.includeInLlms);

log('INFO', '[ARTIFACTS] Validating build artifacts...\n');

// --- robots.txt checks ---
log('INFO', '--- robots.txt checks ---');
const robotsPath = resolve(distDir, 'robots.txt');
if (!existsSync(robotsPath)) {
  log('ERROR', 'dist/robots.txt not found');
} else {
  const robotsContent = readFileSync(robotsPath, 'utf-8');
  const robotsLines = robotsContent.split('\n').map((l) => l.trim());

  const hasUserAgentAll = robotsLines.some((l) => /^User-agent:\s*\*\s*$/.test(l));
  const hasAllowAll = robotsLines.some((l) => /^Allow:\s*\/$/.test(l));
  const hasSitemap = robotsLines.some((l) => /^Sitemap:/i.test(l));
  const hasDisallowAll = robotsLines.some((l) => /^Disallow:\s*\/$/.test(l));

  const blockedBots = ['GPTBot', 'ChatGPT-User', 'CCBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];
  const foundBlocked = blockedBots.filter((bot) => robotsContent.includes('User-agent: ' + bot));

  if (hasUserAgentAll) log('OK', 'Has "User-agent: *"');
  else log('ERROR', 'Missing "User-agent: *"');

  if (hasAllowAll) log('OK', 'Has "Allow: /"');
  else log('ERROR', 'Missing "Allow: /"');

  if (hasSitemap) log('OK', 'Has Sitemap directive');
  else log('ERROR', 'Missing Sitemap directive');

  if (hasDisallowAll) log('ERROR', 'Has "Disallow: /" — blocks all crawlers!');
  else log('OK', 'No "Disallow: /" found');

  if (foundBlocked.length > 0) {
    for (const bot of foundBlocked) log('ERROR', 'Found blocked bot: ' + bot);
  } else {
    log('OK', 'No AI training bot blocks found');
  }
}

// --- sitemap.xml checks ---
log('INFO', '\n--- sitemap.xml checks ---');
const sitemapPath = resolve(distDir, 'sitemap.xml');
if (!existsSync(sitemapPath)) {
  log('ERROR', 'dist/sitemap.xml not found');
} else {
  const sitemapContent = readFileSync(sitemapPath, 'utf-8');
  const sitemapUrls = [...sitemapContent.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replace(SITE_URL, '')
  );

  log('INFO', `Found ${sitemapUrls.length} URL(s) in sitemap.xml`);
  log('INFO', `Expected ${sitemapRoutes.length} URL(s) (includeInSitemap=true)`);

  if (sitemapUrls.length === sitemapRoutes.length) {
    log('OK', `URL count matches expected (${sitemapUrls.length})`);
  } else {
    log('ERROR', `URL count mismatch: sitemap has ${sitemapUrls.length}, expected ${sitemapRoutes.length}`);
  }

  // Check each expected route is present
  for (const route of sitemapRoutes) {
    const normalized = route.path.replace(/\/$/, '');
    const found = sitemapUrls.some((u) => {
      const uNorm = u.replace(/\/$/, '');
      return uNorm === normalized || u === route.path;
    });
    if (found) {
      log('OK', `Route "${route.path}" in sitemap.xml`);
    } else {
      log('ERROR', `Route "${route.path}" has includeInSitemap=true but NOT in sitemap.xml`);
    }
  }

  // Check sitemap doesn't include non-sitemap routes
  for (const url of sitemapUrls) {
    const route = routes.find((r) => {
      const rn = r.path.replace(/\/$/, '');
      const un = url.replace(/\/$/, '');
      return rn === un || r.path === url;
    });
    if (route && !route.includeInSitemap) {
      log('WARN', `Route "${route.path}" has includeInSitemap=false but found in sitemap.xml`);
    }
  }
}

// --- llms.txt checks ---
log('INFO', '\n--- llms.txt checks ---');
const llmsPath = resolve(distDir, 'llms.txt');
if (!existsSync(llmsPath)) {
  log('ERROR', 'dist/llms.txt not found');
} else {
  const llmsContent = readFileSync(llmsPath, 'utf-8');
  const llmsUrls = [
    ...llmsContent.matchAll(/https:\/\/eureadyseller\.com([^ \n#\)]+)/g),
  ].map((m) => m[1].split(' ')[0]);

  log('INFO', `Found ${llmsUrls.length} URL(s) in llms.txt`);
  log('INFO', `Expected ${llmsRoutes.length} URL(s) (includeInLlms=true)`);

  // Check each expected route is present
  for (const route of llmsRoutes) {
    const pathKey = route.path.replace(/\/$/, '');
    const found = llmsUrls.some((u) => u.replace(/\/$/, '') === pathKey);
    if (found) {
      log('OK', `Route "${route.path}" in llms.txt`);
    } else {
      log('ERROR', `Route "${route.path}" has includeInLlms=true but NOT in llms.txt`);
    }
  }

  // Check llms.txt has required sections
  if (llmsContent.includes('## Site Purpose')) log('OK', 'llms.txt has Site Purpose section');
  else log('WARN', 'llms.txt missing Site Purpose section');

  if (llmsContent.includes('## Compliance Disclaimer') || llmsContent.includes('Disclaimer')) {
    log('OK', 'llms.txt has Disclaimer section');
  } else {
    log('WARN', 'llms.txt missing Disclaimer section');
  }
}

// --- Final verdict ---
console.log('\n' + (exitCode === 0 ? 'PASS: Artifact validation passed' : 'FAIL: Artifact validation failed'));
process.exit(exitCode);
