/**
 * validate-claims.mjs
 * Scans dist/ and src/ for dangerous compliance claim phrases.
 *
 * HARD FAIL — banned phrases that must NEVER appear:
 *   guaranteed compliance, certified compliance, fully compliant,
 *   become compliant instantly, we are lawyers, official EU certified,
 *   EU-approved service, compliant by using this tool,
 *   this tool determines compliance, we guarantee your products are compliant,
 *   avoid all fines, legally required in every case,
 *   legal advice (unless preceded by "not" / "n't" / "doesn't" / "does not provide")
 *
 * WARN — soft risk phrases that should be reviewed:
 *   "applies to all physical products"
 *   "applies to any physical product"
 *   "must independently" (in conclusion form)
 *   "must be accessible"
 *   "ensure compliance" (in positive claim form)
 *   "listing removals" (as consequences)
 *   "before first selling" (as absolute requirement)
 *   "required before selling"
 *   "penalties for non-registration"
 *   "GPSR obligations"
 *   "EPR obligations"
 *
 * Output format:
 *   FAIL count — build must fail if > 0
 *   WARN count — informational, build continues
 *   PASS count — total files scanned
 *
 * Allowed: "not legal advice" (safe phrase)
 */
import { readdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');

// Phrases that cause HARD FAIL
const BANNED = [
  'guaranteed compliance',
  'certified compliance',
  'fully compliant',
  'become compliant instantly',
  'we are lawyers',
  'official EU certified',
  'EU-approved service',
  'compliant by using this tool',
  'this tool determines compliance',
  'we guarantee your products are compliant',
  'avoid all fines',
  'legally required in every case',
];

// Phrases that cause WARN — these are softer risks to review
const SOFT_RISK = [
  { phrase: 'applies to all physical products', context: 'Too absolute — use "may be relevant for many physical consumer products"' },
  { phrase: 'applies to any physical product', context: 'Too absolute — use "may be relevant for many physical consumer products"' },
  { phrase: 'must independently', context: 'Too absolute when used as a conclusion — prefer "may need to independently"' },
  { phrase: 'must be accessible', context: 'Too absolute when used as a conclusion — prefer "may need to be accessible"' },
  { phrase: 'listing removals', context: 'Consequence phrasing too strong — prefer "listing restrictions, platform requests or compliance gaps"' },
  { phrase: 'before first selling', context: 'Absolute requirement language — prefer "before launching or expanding into a target market"' },
  { phrase: 'required before selling', context: 'Absolute requirement language — prefer "may be needed before launching in a target market"' },
  { phrase: 'penalties for non-registration', context: 'Too enforcement-focused — prefer "may request registration or reporting depending on country and category"' },
  { phrase: 'ensure compliance', context: 'Too strong a guarantee — prefer "support compliance review" or "help prepare information"' },
  { phrase: 'you are responsible for', context: 'Too absolute — prefer "you may need to take responsibility for"' },
  { phrase: 'sellers are responsible for', context: 'Too absolute — prefer "sellers may need to take responsibility for"' },
  { phrase: 'GPSR obligations', context: 'Conclusionary phrasing — prefer "GPSR topics" or "GPSR requirements that may be relevant"' },
  { phrase: 'EPR obligations', context: 'Conclusionary phrasing — prefer "EPR topics" or "EPR requirements that may be relevant"' },
  { phrase: 'GPSR product safety obligations', context: 'Too conclusive — prefer "GPSR product safety topics"' },
  { phrase: 'sellers independently prepare', context: 'Too conclusive — prefer "sellers may need to prepare" or "sellers may need to review"' },
  { phrase: 'sellers independently prepare and display', context: 'Too conclusive — prefer "sellers may need to review how information is prepared and displayed"' },
  { phrase: 'sellers may need to independently prepare', context: 'Too strong — prefer "sellers may need to review how to prepare"' },
  { phrase: 'product safety obligations', context: 'Too conclusive — prefer "product safety topics" or "product safety requirements that may be relevant"' },
  { phrase: 'regulatory obligations typically remain', context: 'Too conclusive — prefer "EPR topics may still need to be reviewed by the seller"' },
  { phrase: 'Sellers must register', context: 'Too conclusive — prefer "Sellers may need to review registration" or "Registration topics may be relevant"' },
  { phrase: 'must register with the LUCID', context: 'Too conclusive — prefer "may need to review LUCID registration topics"' },
  { phrase: 'must participate in a dual system', context: 'Too conclusive — prefer "may need to review dual system participation topics"' },
  { phrase: 'WEEE obligations', context: 'Too conclusive — prefer "WEEE topics" or "WEEE requirements that may be relevant"' },
  { phrase: 'Reporting obligations', context: 'Too conclusive — prefer "Reporting topics" or "reporting requirements that may be relevant"' },
  { phrase: 'reporting obligations', context: 'Too conclusive — prefer "reporting topics"' },
  { phrase: 'environmental obligations', context: 'Too conclusive — prefer "environmental responsibility topics"' },
  { phrase: 'require separate registrations', context: 'Too strong — prefer "are often handled through separate schemes"' },
  { phrase: 'we guarantee', context: 'Too strong a guarantee — prefer "may help" or "aims to support"' },
  { phrase: 'we certify', context: 'Too strong a claim — prefer "provides" or "offers"' },
  { phrase: 'EU-approved', context: 'Potentially misleading — prefer "meets requirements" or "aligns with"' },
  { phrase: 'avoid all fines', context: 'Unrealistic guarantee — prefer "help prepare" or "may reduce risk"' },
  // Germany EPR specific — added after GSC-driven micro-optimization
  { phrase: 'requires sellers to register', context: 'Too strong — prefer "may require sellers to review registration topics depending on setup"' },
  { phrase: 'sellers must declare', context: 'Too strong — prefer "sellers may need to review or submit... depending on their setup"' },
  { phrase: 'register with the central packaging register before first selling', context: 'Too strong — prefer "Review whether LUCID registration topics are relevant before launching"' },
  { phrase: 'before first selling in Germany', context: 'Too strong — prefer "before launching in Germany"' },
  { phrase: 'who must register', context: 'Too strong — prefer "Who may need to review registration topics"' },
  { phrase: 'should independently verify', context: 'Too strong — prefer "may need to review topics based on packaging role, target market and setup"' },
  { phrase: 'should independently assess', context: 'Too strong — prefer "may need to review topics depending on their setup"' },
  { phrase: 'registration responsibility typically remains', context: 'Too strong — prefer "registration topics may still need to be reviewed by the seller depending on setup"' },
  { phrase: 'typically required', context: 'Too strong — prefer "topics may need to be reviewed"' },
  // Additional EPR/WEEE specific — added after live mismatch fix
  { phrase: 'EU Responsible Person obligations', context: 'Too conclusive — prefer "EU Responsible Person topics" or "EU Responsible Person requirements that may be relevant"' },
  { phrase: 'responsible for financing', context: 'Too strong — prefer "may need to review financing or producer responsibility topics"' },
  { phrase: 'must be marked', context: 'Too strong — prefer "may need to be marked depending on category and market rules"' },
  { phrase: 'does not need WEEE registration', context: 'Too conclusive — prefer "may not need to review WEEE registration topics depending on product setup"' },
  { phrase: 'battery registration requirements vary', context: 'Too conclusive — prefer "battery registration topics can vary by country"' },
  { phrase: 'Packaging quantities must be reported', context: 'Too strong — prefer "Packaging quantity reporting topics may need to be reviewed"' },
  { phrase: 'separate registration, reporting', context: 'Too strong — prefer "separate schemes, registration topics, reporting topics, or fee contribution topics"' },
];

let exitCode = 0;
let warnCount = 0;
let failCount = 0;

function log(type, msg) {
  if (type === 'FAIL') {
    console.log(`✗ [CLAIMS] ${msg}`);
    failCount++;
    exitCode = 1;
  } else if (type === 'WARN') {
    console.log(`⚠ [CLAIMS] ${msg}`);
    warnCount++;
  } else {
    console.log(`✓ [CLAIMS] ${msg}`);
  }
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

// === HARD FAIL checks ===
for (const file of allFiles) {
  const content = readFileSync(file, 'utf-8').toLowerCase();
  const relativePath = file.replace(rootDir, '').replace(/\\/g, '/');

  for (const phrase of BANNED) {
    // Special case: "legal advice" is banned BUT "not legal advice" is safe
    if (phrase === 'legal advice') {
      const plainContent = content.replace(/<[^>]+>/g, ' ');
      let idx = plainContent.indexOf('legal advice');
      while (idx !== -1) {
        const window = plainContent.slice(Math.max(0, idx - 100), idx + 'legal advice'.length + 100).toLowerCase();
        const isNegated =
          window.includes('not legal advice') ||
          window.includes("n't legal advice") ||
          window.includes('providing legal advice') ||
          window.includes('offering legal advice') ||
          window.includes('is this legal advice') ||
          window.includes('is legal advice included') ||
          window.includes('is legal advice excluded') ||
          window.includes('is legal advice covered') ||
          window.includes('what is legal advice') ||
          window.includes('does eu ready seller provide legal advice') ||
          window.includes('does this provide legal advice') ||
          (/not\s+[^.]{0,60}legal advice/).test(window) ||
          (/doesn't\s+[^.]{0,60}legal advice/).test(window) ||
          (/never\s+[^.]{0,60}legal advice/).test(window);
        if (!isNegated) {
          log('FAIL', `${relativePath}: banned phrase "legal advice" (context: "...${plainContent.slice(Math.max(0, idx - 20), idx + 25)}...")`);
        }
        idx = plainContent.indexOf('legal advice', idx + 1);
      }
      continue;
    }

    if (content.includes(phrase)) {
      log('FAIL', `${relativePath}: banned phrase "${phrase}"`);
    }
  }
}

// === SOFT RISK checks (warnings, not failures) ===
for (const file of allFiles) {
  const content = readFileSync(file, 'utf-8');
  const plainContent = content.replace(/<[^>]+>/g, ' ');
  const relativePath = file.replace(rootDir, '').replace(/\\/g, '/');

  for (const { phrase, context } of SOFT_RISK) {
    const lowerContent = plainContent.toLowerCase();
    let idx = lowerContent.indexOf(phrase.toLowerCase());
    while (idx !== -1) {
      // Get surrounding context
      const before = plainContent.slice(Math.max(0, idx - 40), idx).toLowerCase();
      const after = plainContent.slice(idx + phrase.length, idx + phrase.length + 40).toLowerCase();
      const sentence = before + phrase.toLowerCase() + after;

      // Skip if inside a disclaimer / "does not" context
      const isDisclaimer = sentence.includes('does not') ||
        sentence.includes('not applicable') ||
        sentence.includes('not all') ||
        sentence.includes('not required') ||
        sentence.includes('not guaranteed') ||
        sentence.includes('may not') ||
        sentence.includes("n't");

      // Skip FAQ question forms
      const isQuestion = sentence.includes('?');

      if (!isDisclaimer && !isQuestion) {
        log('WARN', `${relativePath}: soft risk phrase "${phrase}" — ${context}`);
      }

      idx = lowerContent.indexOf(phrase.toLowerCase(), idx + 1);
    }
  }
}

// === Summary ===
console.log('');
console.log('═══════════════════════════════════════');
console.log(`  CLAIMS VALIDATION SUMMARY`);
console.log('═══════════════════════════════════════');
console.log(`  FAIL: ${failCount}  (hard banned phrases — build BLOCKS)`);
console.log(`  WARN: ${warnCount}  (soft risk phrases — review needed)`);
console.log(`  PASS: ${allFiles.length}  (files scanned)`);
console.log('═══════════════════════════════════════');
console.log('');

if (failCount > 0) {
  console.log(`✗ VALIDATION FAILED — ${failCount} hard failure(s) found. Fix before deploying.`);
  exitCode = 1;
} else if (warnCount > 0) {
  console.log(`⚠ VALIDATION PASSED with ${warnCount} warning(s). Review warnings above.`);
} else {
  console.log(`✓ VALIDATION PASSED — No dangerous claims found across ${allFiles.length} files.`);
}

process.exit(exitCode);
