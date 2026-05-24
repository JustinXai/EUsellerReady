/**
 * build-report.mjs
 * Outputs a comprehensive build and validation summary report.
 */
import { readdirSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');

const SITE_URL = 'https://eureadyseller.com';

function findFiles(dir, ext) {
  const results = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        results.push(...findFiles(resolve(dir, entry.name), ext));
      } else if (entry.name.endsWith(ext)) {
        results.push(resolve(dir, entry.name));
      }
    }
  } catch (e) { /* ignore */ }
  return results;
}

console.log('\n========================================');
console.log('  EUReadySeller MVP Build Report');
console.log('========================================\n');

// 1. Routes count
let routeCount = 0;
try {
  const content = readFileSync(resolve(rootDir, 'src/data/routes.ts'), 'utf-8');
  routeCount = (content.match(/path:\s*['"]/g) || []).length;
} catch (e) { /* ignore */ }
console.log(`📁 Registered routes:    ${routeCount}`);

// 2. Pages found
const htmlFiles = findFiles(distDir, '.html');
const cssFiles = findFiles(distDir, '.css');
const jsFiles = findFiles(distDir, '.js');
console.log(`📄 HTML pages:          ${htmlFiles.length}`);
console.log(`🎨 CSS files:           ${cssFiles.length}`);
console.log(`⚡ JS files:            ${jsFiles.length}`);

// 3. Sitemap
let sitemapUrls = 0;
try {
  const sitemap = readFileSync(resolve(rootDir, 'public/sitemap.xml'), 'utf-8');
  sitemapUrls = (sitemap.match(/<loc>/g) || []).length;
} catch (e) { /* ignore */ }
console.log(`🗺️  Sitemap URLs:        ${sitemapUrls}`);

// 4. Robots.txt
const hasRobots = existsSync(resolve(rootDir, 'public/robots.txt'));
console.log(`🤖 robots.txt:           ${hasRobots ? '✅ generated' : '❌ missing'}`);

// 5. llms.txt
const hasLlms = existsSync(resolve(rootDir, 'public/llms.txt'));
if (hasLlms) {
  try {
    const llms = readFileSync(resolve(rootDir, 'public/llms.txt'), 'utf-8');
    const sections = llms.split(/^## /m).length - 1;
    const pageSummaries = (llms.match(/^## /gm) || []).length;
    console.log(`📋 llms.txt sections:   ${sections}`);
  } catch (e) { /* ignore */ }
}
console.log(`📋 llms.txt:             ${hasLlms ? '✅ generated' : '❌ missing'}`);

// 6. SEO check summary
let emptyTitles = 0, emptyDescs = 0, emptyH1s = 0, duplicateTitles = 0;
const titleMap = new Map(), descMap = new Map(), h1Map = new Map();

for (const file of htmlFiles) {
  const content = readFileSync(file, 'utf-8');
  const t = (content.match(/<title[^>]*>([^<]+)<\/title>/i) || ['', ''])[1].trim();
  const d = (content.match(/<meta name="description" content="([^"]+)"/i) || ['', ''])[1].trim();
  const h = (content.match(/<h1[^>]*>([^<]+)<\/h1>/i) || ['', ''])[1].trim();

  if (!t) emptyTitles++;
  if (!d) emptyDescs++;
  if (!h) emptyH1s++;
  if (t) { titleMap.set(t, (titleMap.get(t) || 0) + 1); if (titleMap.get(t) > 1) duplicateTitles++; }
  if (d) descMap.set(d, (descMap.get(d) || 0) + 1);
  if (h) h1Map.set(h, (h1Map.get(h) || 0) + 1);
}

console.log(`\n🔍 SEO Summary:`);
console.log(`   Empty titles:         ${emptyTitles}`);
console.log(`   Empty descriptions:   ${emptyDescs}`);
console.log(`   Empty H1s:            ${emptyH1s}`);
console.log(`   Duplicate titles:     ${duplicateTitles}`);

// 7. Schema summary
let schemaCount = 0, faqSchemas = 0;
for (const file of htmlFiles) {
  const content = readFileSync(file, 'utf-8');
  schemaCount += (content.match(/application\/ld\+json/g) || []).length;
  faqSchemas += (content.match(/"@type":\s*"FAQPage"/g) || []).length;
}
console.log(`\n📊 JSON-LD blocks:      ${schemaCount}`);
console.log(`   FAQPage schemas:      ${faqSchemas}`);

// 8. Claim safety
const BANNED = [
  'guaranteed compliance', 'certified compliance', 'fully compliant',
  'become compliant instantly', 'we are lawyers', 'official EU certified',
  'EU-approved service', 'compliant by using this tool',
  'this tool determines compliance', 'we guarantee your products are compliant',
  'avoid all fines', 'legally required in every case',
];

let violations = 0;
for (const file of [...htmlFiles, ...findFiles(resolve(rootDir, 'src'), '.astro')]) {
  const content = readFileSync(file, 'utf-8').toLowerCase();
  for (const phrase of BANNED) {
    if (phrase !== 'legal advice' && content.includes(phrase)) {
      violations++;
    }
  }
}

console.log(`\n⚖️  Claim safety:         ${violations === 0 ? '✅ No violations' : `❌ ${violations} violation(s)`}`);

// 9. File size
let totalSize = 0;
for (const file of [...htmlFiles, ...cssFiles, ...jsFiles]) {
  try { totalSize += readFileSync(file).byteLength; } catch (e) { /* ignore */ }
}
console.log(`\n💾 Total output size:    ${(totalSize / 1024).toFixed(1)} KB`);

// 10. Next recommended
console.log(`\n📌 Next recommended steps:`);
console.log(`   1. Submit sitemap to Google Search Console`);
console.log(`   2. Create Google Analytics / Search Console account`);
console.log(`   3. Add structured data testing to CI pipeline`);
console.log(`   4. Prepare Phase 2 content (EAA, PPWR, WEEE, CE marking)`);
console.log(`   5. Set up GitHub Actions for automated deploys`);
console.log(`   6. Connect lead form to email service or CRM`);
console.log(`\n========================================\n`);
