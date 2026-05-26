/**
 * validate-schema.mjs
 * Validates JSON-LD structured data across all built HTML pages.
 *
 * Checks:
 * 1. Every includeInSitemap=true HTML page has at least one application/ld+json block
 * 2. At least one schema is WebPage or Article type
 * 3. JSON-LD blocks are parseable
 * 4. FAQPage schemas have mainEntity with at least 3 questions
 *
 * Run: node scripts/validate-schema.mjs
 *   or: npm run validate:schema
 */
import { readdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');

let exitCode = 0;

function log(type, msg) {
  const prefix = type === 'ERROR' ? 'x' : type === 'WARN' ? '!' : 'o';
  console.log(prefix + ' [SCHEMA] ' + msg);
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
log('INFO', 'Checking ' + htmlFiles.length + ' HTML files...\n');

for (const file of htmlFiles) {
  const content = readFileSync(file, 'utf-8');
  const relativePath = file.replace(distDir, '').replace(/\\/g, '/');

  const jsonLdMatches = content.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);

  let foundAnySchema = false;
  let foundWebPageOrArticle = false;
  let foundFAQ = false;
  let faqQuestionCount = 0;
  let parseError = false;

  for (const match of jsonLdMatches) {
    const jsonStr = match[1];
    foundAnySchema = true;

    try {
      const data = JSON.parse(jsonStr);
      const schemas = Array.isArray(data) ? data : [data];

      for (const schema of schemas) {
        const type = schema['@type'];

        if (type === 'WebPage' || type === 'Article') {
          foundWebPageOrArticle = true;
        }

        if (type === 'FAQPage') {
          foundFAQ = true;
          if (schema.mainEntity && Array.isArray(schema.mainEntity)) {
            faqQuestionCount = schema.mainEntity.length;
          }
        }
      }
    } catch (e) {
      log('ERROR', relativePath + ': JSON-LD parse error — ' + e.message);
      parseError = true;
    }
  }

  // Every page must have at least one JSON-LD block
  if (!foundAnySchema) {
    log('ERROR', relativePath + ': no application/ld+json block found');
    continue;
  }

  // Every page must have a WebPage or Article schema
  if (!foundWebPageOrArticle) {
    log('ERROR', relativePath + ': no WebPage or Article schema found');
  }

  // Every page with FAQ content must have a FAQPage schema with >= 3 questions
  // (detected by presence of FAQ-related HTML on the page)
  const hasFAQHtml = /<section[^>]*faq|<div[^>]*faq|class="[^"]*faq/i.test(content);
  if (hasFAQHtml) {
    if (!foundFAQ) {
      log('ERROR', relativePath + ': page has FAQ HTML but no FAQPage schema');
    } else if (faqQuestionCount < 3) {
      log('ERROR', relativePath + ': FAQPage has fewer than 3 questions (' + faqQuestionCount + ')');
    }
  }
}

console.log('');
if (exitCode === 0) {
  log('OK', 'Schema validation complete — all pages pass');
} else {
  log('ERROR', 'Schema validation failed — see errors above');
}

process.exit(exitCode);
