#!/usr/bin/env node
/**
 * validate-no-hardcoded-pages.mjs
 * Checks that generator and validation scripts do not contain hardcoded
 * page lists. All page references must come from routes.ts or contentRoadmap.ts.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const TARGET_FILES = [
  'scripts/generate-llms.mjs',
  'scripts/generate-sitemap.mjs',
  'scripts/external-smoke.mjs',
  'scripts/validate-routes.mjs',
  'scripts/validate-artifacts.mjs',
];

function readFile(filename) {
  return readFileSync(resolve(rootDir, filename), 'utf-8');
}

// Check if a line reads from routes or roadmap
function isSourceOfTruth(line) {
  return /readFileSync.*routes\.ts|readFileSync.*contentRoadmap|import.*from.*routes\.ts|import.*from.*contentRoadmap|for.*of\s+routes|for.*const.*of\s+routes|routes\.map|routes\.filter|routes\.reduce|routes\.forEach|routes\.push|routes\.find|\.path\s*===/.test(line);
}

// Check if line is a local accumulator (e.g. const pages = [])
function isAccumulatorDecl(line, nextLines) {
  if (!/const\s+[a-z_$][a-z0-9_$]*\s*=\s*\[\s*\]\s*;/.test(line)) return false;
  // Check if next ~10 lines have .push on the same variable
  const varName = line.match(/const\s+([a-z_$][a-z0-9_$]*)/)?.[1];
  if (!varName) return false;
  return nextLines.some(l => new RegExp(`${varName}\\.push\\s*\\(`).test(l));
}

// Detect truly hardcoded path arrays (not built from routes)
function hasHardcodedPaths(line) {
  // Match: ['/foo/', '/bar/', '/baz/'] or similar with 4+ entries
  if (/\[\s*(\/[^"'\s,]+[^"'\s]*\s*,?\s*){4,}\]/.test(line)) return true;
  return false;
}

function checkFile(filepath) {
  const content = readFile(filepath);
  const lines = content.split('\n');
  const issues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;
    const nextLines = lines.slice(i + 1, Math.min(lines.length, i + 10));

    // Skip source-of-truth lines
    if (isSourceOfTruth(line)) continue;

    // Skip local accumulators (const pages = [])
    if (isAccumulatorDecl(line, nextLines)) continue;

    // Check for hardcoded path arrays
    if (hasHardcodedPaths(line)) {
      issues.push({
        line: lineNum,
        text: line.slice(0, 100),
        message: 'Found hardcoded URL/path array — use routes.ts or contentRoadmap.ts instead',
      });
    }
  }

  return issues;
}

let totalFailures = 0;

console.log('o [NO-HARDCODED] Checking generator and validation scripts...\n');

for (const file of TARGET_FILES) {
  try {
    const issues = checkFile(file);
    if (issues.length === 0) {
      console.log(`  ✓ ${file} — no hardcoded page lists found`);
    } else {
      for (const issue of issues) {
        console.log(`  ✗ ${file}:${issue.line} — ${issue.message}`);
        console.log(`      Line ${issue.line}: ${issue.text}`);
      }
      totalFailures += issues.length;
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`  — ${file} — file not found (skipped)`);
    } else {
      console.log(`  ✗ ${file} — error reading file: ${err.message}`);
      totalFailures++;
    }
  }
}

console.log('');

if (totalFailures === 0) {
  console.log('PASS: No hardcoded page lists found in generator/validation scripts');
  process.exit(0);
} else {
  console.log(`FAIL: Found ${totalFailures} hardcoded page list(s) — use routes.ts or contentRoadmap.ts as source of truth`);
  process.exit(1);
}
