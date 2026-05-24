/**
 * validate-links.mjs
 * Checks that all internal hrefs starting with / resolve to actual pages.
 * Ignores: mailto:, #, https://, http:// external links.
 */
import { readdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');

let exitCode = 0;

function log(type, msg) {
  const prefix = type === 'ERROR' ? '✗' : '✓';
  console.log(`${prefix} [LINKS] ${msg}`);
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

// Build a set of valid internal paths from dist/
// Astro format='directory' generates /eu-seller-compliance-checklist/index.html
// for the route /eu-seller-compliance-checklist/
function buildValidPaths() {
  const paths = new Set(['/']);
  for (const file of findHtmlFiles(distDir)) {
    const rel = file.replace(distDir, '').replace(/\\/g, '/').replace(/\.html$/, '');
    // Astro directory format: /eu-seller-compliance-checklist/index -> /eu-seller-compliance-checklist/
    const dirPath = rel.endsWith('/index') ? rel.slice(0, -6) + '/' :
                    rel.endsWith('/index/') ? rel.slice(0, -7) + '/' :
                    rel;
    paths.add(dirPath);
    if (dirPath !== '/' && !dirPath.endsWith('/')) {
      paths.add(dirPath + '/');
    }
  }
  return paths;
}

const validPaths = buildValidPaths();

log('INFO', `Valid internal paths: ${validPaths.size}`);

const htmlFiles = findHtmlFiles(distDir);
let totalErrors = 0;

for (const file of htmlFiles) {
  const content = readFileSync(file, 'utf-8');
  const relativePath = file.replace(distDir, '').replace(/\\/g, '/');

  // Find all href="..." values
  const hrefs = [...content.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

  for (const href of hrefs) {
    // Skip external, mailto, anchor, and generated asset paths
    if (
      href.startsWith('mailto:') ||
      href.startsWith('#') ||
      href.startsWith('https://') ||
      href.startsWith('http://') ||
      href.startsWith('tel:') ||
      href.startsWith('//') ||
      // Astro-generated asset paths (always valid)
      href.startsWith('/_astro/') ||
      href.startsWith('/_pagefind/') ||
      // Skip bare filenames (e.g., favicon.ico referenced as href="favicon.ico")
      !href.startsWith('/') && !href.includes('/')
    ) {
      continue;
    }

    // Skip empty
    if (!href || href === '/') continue;

    // Normalize
    let normalized = href.startsWith('/') ? href : '/' + href;
    normalized = normalized.split('#')[0].split('?')[0];

    // Allow exact or with trailing slash
    const isValid =
      validPaths.has(normalized) ||
      validPaths.has(normalized.replace(/\/$/, '')) ||
      validPaths.has(normalized + '/');

    if (!isValid) {
      log('ERROR', `${relativePath}: broken internal link "${href}"`);
      totalErrors++;
    }
  }
}

if (totalErrors === 0) {
  log('OK', `All internal links valid (scanned ${htmlFiles.length} files)`);
}

process.exit(exitCode);
