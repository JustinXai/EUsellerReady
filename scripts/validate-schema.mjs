/**
 * validate-schema.mjs
 * Checks:
 * 1. Each HTML page contains application/ld+json
 * 2. JSON-LD is parseable
 * 3. FAQPage JSON has mainEntity
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
  console.log(`${prefix} [SCHEMA] ${msg}`);
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

for (const file of htmlFiles) {
  const content = readFileSync(file, 'utf-8');
  const relativePath = file.replace(distDir, '').replace(/\\/g, '/');

  // Find all JSON-LD blocks
  const jsonLdMatches = content.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);

  let foundSchema = false;
  let foundFAQ = false;

  for (const match of jsonLdMatches) {
    const jsonStr = match[1];
    foundSchema = true;

    try {
      const data = JSON.parse(jsonStr);
      const schemas = Array.isArray(data) ? data : [data];

      for (const schema of schemas) {
        const type = schema['@type'];

        // Validate FAQPage has mainEntity
        if (type === 'FAQPage') {
          if (!schema.mainEntity || !Array.isArray(schema.mainEntity) || schema.mainEntity.length === 0) {
            log('ERROR', `${relativePath}: FAQPage schema missing mainEntity`);
          } else {
            foundFAQ = true;
          }
        }

        // Validate required fields for WebPage
        if (type === 'WebPage') {
          if (!schema.url) {
            log('WARN', `${relativePath}: WebPage schema missing url`);
          }
          if (!schema.name) {
            log('WARN', `${relativePath}: WebPage schema missing name`);
          }
        }

        // Validate required fields for WebSite
        if (type === 'WebSite') {
          if (!schema.name) {
            log('WARN', `${relativePath}: WebSite schema missing name`);
          }
          if (!schema.url) {
            log('WARN', `${relativePath}: WebSite schema missing url`);
          }
        }

        // Validate SoftwareApplication
        if (type === 'SoftwareApplication' || type === 'WebApplication') {
          if (!schema.name) {
            log('WARN', `${relativePath}: SoftwareApplication schema missing name`);
          }
        }
      }
    } catch (e) {
      log('ERROR', `${relativePath}: JSON-LD parse error — ${e.message}`);
    }
  }

  if (!foundSchema) {
    log('WARN', `${relativePath}: no JSON-LD schema found`);
  }
}

if (exitCode === 0) {
  log('OK', 'Schema validation complete');
}

process.exit(exitCode);
