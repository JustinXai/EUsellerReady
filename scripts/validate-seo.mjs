/**
 * validate-seo.mjs
 * Checks:
 * - title not empty
 * - description not empty
 * - H1 not empty
 * - title not duplicate
 * - description not duplicate
 * - H1 not duplicate
 * - canonical uses https://eureadyseller.com
 * - no localhost canonical
 */
import { readdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');

let exitCode = 0;

function log(type, msg) {
  const prefix = type === 'ERROR' ? '✗' : type === 'WARN' ? '⚠' : '✓';
  console.log(`${prefix} [SEO] ${msg}`);
  if (type === 'ERROR') exitCode = 1;
}

function findHtmlFiles(dir, results = []) {
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.endsWith('.html')) {
        results.push(resolve(dir, entry.name));
      } else if (entry.isDirectory()) {
        findHtmlFiles(resolve(dir, entry.name), results);
      }
    }
  } catch (e) { /* ignore */ }
  return results;
}

const htmlFiles = findHtmlFiles(distDir);

log('INFO', `Checking ${htmlFiles.length} HTML files...`);

const titles = new Map();
const descriptions = new Map();
const h1s = new Map();
const canonicals = new Map();

for (const file of htmlFiles) {
  const content = readFileSync(file, 'utf-8');
  const relativePath = file.replace(distDir, '').replace(/\\/g, '/');

  // Title
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  if (!title) {
    log('ERROR', `${relativePath}: <title> is empty or missing`);
  } else {
    if (titles.has(title)) {
      titles.get(title).push(relativePath);
    } else {
      titles.set(title, [relativePath]);
    }
  }

  // Description
  const descMatch = content.match(/<meta name="description" content="([^"]+)"/i);
  const description = descMatch ? descMatch[1].trim() : '';
  if (!description) {
    log('ERROR', `${relativePath}: meta description is empty or missing`);
  } else {
    if (descriptions.has(description)) {
      descriptions.get(description).push(relativePath);
    } else {
      descriptions.set(description, [relativePath]);
    }
  }

  // H1
  const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const h1 = h1Match ? h1Match[1].trim() : '';
  if (!h1) {
    log('ERROR', `${relativePath}: <h1> is empty or missing`);
  } else {
    if (h1s.has(h1)) {
      h1s.get(h1).push(relativePath);
    } else {
      h1s.set(h1, [relativePath]);
    }
  }

  // Canonical
  const canonicalMatch = content.match(/<link rel="canonical" href="([^"]+)"/i);
  const canonical = canonicalMatch ? canonicalMatch[1].trim() : '';
  if (!canonical) {
    log('WARN', `${relativePath}: canonical link is missing`);
  } else {
    if (canonical.includes('localhost')) {
      log('ERROR', `${relativePath}: canonical contains localhost: ${canonical}`);
    }
    if (!canonical.startsWith('https://eureadyseller.com')) {
      log('WARN', `${relativePath}: canonical does not start with https://eureadyseller.com: ${canonical}`);
    }
  }
}

// Duplicate checks
for (const [title, files] of titles) {
  if (files.length > 1) {
    log('ERROR', `Duplicate title "${title}" found in: ${files.join(', ')}`);
  }
}

for (const [desc, files] of descriptions) {
  if (files.length > 1) {
    log('ERROR', `Duplicate description found in: ${files.join(', ')}`);
  }
}

for (const [h1, files] of h1s) {
  if (files.length > 1) {
    log('ERROR', `Duplicate H1 "${h1}" found in: ${files.join(', ')}`);
  }
}

if (exitCode === 0) {
  log('OK', 'All SEO checks passed');
}

process.exit(exitCode);
