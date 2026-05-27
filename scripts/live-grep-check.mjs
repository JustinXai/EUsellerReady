#!/usr/bin/env node
/**
 * live-grep-check.mjs
 * 
 * Fetches a live URL and checks if a phrase is present or absent.
 * Used to verify live site content after deployments.
 * 
 * Usage:
 *   npm run live:grep -- /path/ "phrase" --must
 *   npm run live:grep -- /path/ "phrase" --must-not
 * 
 * Exit codes:
 *   0 - Check passed (phrase present for --must, absent for --must-not)
 *   1 - Check failed
 */

const SITE_URL = process.env.SITE_URL || 'https://eureadyseller.com';

// Parse arguments
const args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Usage: npm run live:grep -- <path> "<phrase>" --must|--must-not');
  console.error('Example: npm run live:grep -- /gpsr-general-guide/ "GPSR Guide" --must');
  process.exit(1);
}

const [path, phrase, mode] = args;

if (mode !== '--must' && mode !== '--must-not') {
  console.error(`Invalid mode: ${mode}`);
  console.error('Use --must or --must-not');
  process.exit(1);
}

const mustHave = mode === '--must';

async function fetchLive(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'EUReadySeller-QA-Check/1.0',
      'Accept': 'text/html,*/*',
    },
  });
  return response.text();
}

async function main() {
  const url = `${SITE_URL}${path}`;
  
  console.log(`\n🔍 Live Grep Check`);
  console.log(`   URL: ${url}`);
  console.log(`   Phrase: "${phrase}"`);
  console.log(`   Mode: ${mustHave ? 'MUST be present' : 'MUST NOT be present'}`);
  console.log('─'.repeat(60));
  
  try {
    const content = await fetchLive(url);
    const found = content.includes(phrase);
    
    if (mustHave) {
      // --must: phrase MUST be present
      if (found) {
        console.log(`✅ PASS: Phrase found in live content`);
        console.log('─'.repeat(60));
        process.exit(0);
      } else {
        console.log(`❌ FAIL: Phrase NOT found in live content`);
        console.log(`   Expected: "${phrase}"`);
        console.log(`   This means the live site does not contain the expected phrase.`);
        console.log('─'.repeat(60));
        process.exit(1);
      }
    } else {
      // --must-not: phrase MUST NOT be present
      if (found) {
        console.log(`❌ FAIL: Phrase found in live content (should NOT be present)`);
        console.log(`   Found: "${phrase}"`);
        console.log(`   This means the live site still contains the old/bad phrase.`);
        console.log('─'.repeat(60));
        process.exit(1);
      } else {
        console.log(`✅ PASS: Phrase NOT found in live content (as expected)`);
        console.log('─'.repeat(60));
        process.exit(0);
      }
    }
  } catch (error) {
    console.error(`\n❌ ERROR: Failed to fetch live content`);
    console.error(`   URL: ${url}`);
    console.error(`   Error: ${error.message}`);
    console.log('─'.repeat(60));
    process.exit(1);
  }
}

main();
