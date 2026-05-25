/**
 * validate-robots.mjs
 * Validates dist/robots.txt policy.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');

let exitCode = 0;

function log(type, msg) {
  const prefix = type === 'ERROR' ? 'x' : type === 'WARN' ? '!' : 'o';
  console.log(prefix + ' ' + msg);
  if (type === 'ERROR') exitCode = 1;
}

if (!existsSync(distDir)) {
  log('ERROR', 'dist/ directory not found. Run "npm run build" first.');
  process.exit(1);
}

const robotsPath = resolve(distDir, 'robots.txt');
if (!existsSync(robotsPath)) {
  log('ERROR', 'dist/robots.txt not found. Run "npm run build" first.');
  process.exit(1);
}

const content = readFileSync(robotsPath, 'utf-8');
const lines = content.split('\n').map(l => l.trim());

log('INFO', '[ROBOTS] Validating robots.txt policy...');

const hasUserAgentAll = lines.some(l => /^User-agent:\s*\*\s*$/.test(l));
const hasAllowAll = lines.some(l => /^Allow:\s*\/$/.test(l));
const hasSitemap = lines.some(l => /^Sitemap:/i.test(l));
const hasDisallowAll = lines.some(l => /^Disallow:\s*\/$/.test(l));

const blockedBots = ['GPTBot', 'ChatGPT-User', 'CCBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];
const foundBlocked = blockedBots.filter(bot => content.includes('User-agent: ' + bot));

if (hasUserAgentAll) log('OK', 'Has "User-agent: *" directive');
else log('ERROR', 'Missing "User-agent: *" directive');

if (hasAllowAll) log('OK', 'Has "Allow: /" directive');
else log('ERROR', 'Missing "Allow: /" directive');

if (hasSitemap) log('OK', 'Has Sitemap directive');
else log('ERROR', 'Missing Sitemap directive');

if (hasDisallowAll) log('ERROR', 'Has "Disallow: /" - blocks all crawlers!');
else log('OK', 'No "Disallow: /" found');

if (foundBlocked.length > 0) {
  for (const bot of foundBlocked) log('ERROR', 'Found blocked bot: ' + bot);
} else {
  log('OK', 'No AI training bot blocks found');
}

console.log('');
if (exitCode === 0) {
  console.log('PASS: robots.txt validation passed');
} else {
  console.log('FAIL: robots.txt validation failed');
}

process.exit(exitCode);
