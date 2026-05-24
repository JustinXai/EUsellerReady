/**
 * validate-claims.mjs
 * Scans dist/ for dangerous compliance claim phrases.
 * Phrases that cause FAIL:
 *   guaranteed compliance, certified compliance, fully compliant,
 *   become compliant instantly, legal advice, we are lawyers,
 *   official EU certified, EU-approved service, compliant by using this tool,
 *   this tool determines compliance, we guarantee your products are compliant,
 *   avoid all fines, legally required in every case
 *
 * Allowed: "not legal advice" (safe phrase)
 */
import { readdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');

const BANNED = [
  'guaranteed compliance',
  'certified compliance',
  'fully compliant',
  'become compliant instantly',
  'legal advice',
  'we are lawyers',
  'official EU certified',
  'EU-approved service',
  'compliant by using this tool',
  'this tool determines compliance',
  'we guarantee your products are compliant',
  'avoid all fines',
  'legally required in every case',
];

let exitCode = 0;

function log(type, msg) {
  const prefix = type === 'FAIL' ? '✗' : '✓';
  console.log(`${prefix} [CLAIMS] ${msg}`);
  if (type === 'FAIL') exitCode = 1;
}

function findFiles(dir, ext, results = []) {
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        findFiles(resolve(dir, entry.name), ext, results);
      } else if (entry.name.endsWith(ext)) {
        results.push(resolve(dir, entry.name));
      }
    }
  } catch (e) { /* ignore */ }
  return results;
}

const htmlFiles = findFiles(distDir, '.html');
const srcFiles = findFiles(resolve(rootDir, 'src'), '.astro');

log('INFO', `Scanning ${htmlFiles.length} built files and ${srcFiles.length} source files...`);

const allFiles = [...htmlFiles, ...srcFiles];
let totalViolations = 0;

for (const file of allFiles) {
  const content = readFileSync(file, 'utf-8').toLowerCase();
  const relativePath = file.replace(rootDir, '').replace(/\\/g, '/');

  for (const phrase of BANNED) {
    // Special case: "legal advice" is banned BUT these are safe:
    //   "not legal advice" / "n't legal advice" (disclaimer negation)
    //   "providing legal advice" (negative context)
    //   "is this legal advice?" (FAQ question form)
    if (phrase === 'legal advice') {
      const plainContent = content.replace(/<[^>]+>/g, ' ');
      let idx = plainContent.indexOf('legal advice');
      while (idx !== -1) {
        // Check the sentence containing "legal advice" for negation
        const window = plainContent.slice(Math.max(0, idx - 100), idx + 'legal advice'.length + 100).toLowerCase();
        // Safe if any of these negation/non-claim patterns are in the sentence
        const isNegated =
          window.includes('not legal advice') ||
          window.includes("n't legal advice") ||
          window.includes('providing legal advice') ||
          window.includes('offering legal advice') ||
          window.includes('is this legal advice') ||
          window.includes('what is legal advice') ||
          window.includes('does eu ready seller provide legal advice') ||
          window.includes('does this provide legal advice') ||
          // "it does not provide legal advice" — check for "not" near "legal advice"
          (/not\s+[^.]{0,60}legal advice/).test(window) ||
          (/doesn't\s+[^.]{0,60}legal advice/).test(window) ||
          (/never\s+[^.]{0,60}legal advice/).test(window);
        if (!isNegated) {
          log('FAIL', `${relativePath}: banned phrase "legal advice" (context: "...${plainContent.slice(Math.max(0, idx - 20), idx + 25)}...")`);
          totalViolations++;
        }
        idx = plainContent.indexOf('legal advice', idx + 1);
      }
      continue;
    }

    if (content.includes(phrase)) {
      log('FAIL', `${relativePath}: banned phrase "${phrase}"`);
      totalViolations++;
    }
  }
}

if (totalViolations === 0) {
  log('PASS', `No dangerous compliance claims found (scanned ${allFiles.length} files)`);
} else {
  log('FAIL', `Found ${totalViolations} violation(s) across ${allFiles.length} files`);
}

process.exit(exitCode);
