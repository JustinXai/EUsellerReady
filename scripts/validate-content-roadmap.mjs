/**
 * validate-content-roadmap.mjs
 * Validates that contentRoadmap.ts is consistent with routes.ts and
 * that each roadmap item meets Content Factory minimum requirements.
 *
 * Checks:
 * - Each routes.ts page (includeInSitemap=true) is in contentRoadmap as 'live'
 * - Each 'live' roadmap item has a corresponding routes.ts route
 * - Each 'planned' roadmap item path does not conflict with live
 * - All live/planned items have valid categoryId, templateId, primaryKeyword,
 *   secondaryKeywords (>= 3), longTailQuestions (>= 2), monetizationPath,
 *   officialSourceTopics, requiredInternalLinks
 * - All requiredInternalLinks point to live or planned known paths
 *
 * Run: npm run validate:content-roadmap
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// --- Parse routes.ts ---
function parseRoutes() {
  const content = readFileSync(resolve(rootDir, 'src/data/routes.ts'), 'utf-8');
  const pathMatches = [...content.matchAll(/path:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const sitemapMatches = [...content.matchAll(/includeInSitemap:\s*(true|false)/g)].map(m => m[1] === 'true');
  const categoryMatches = [...content.matchAll(/category:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const titleMatches = [...content.matchAll(/title:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);

  return pathMatches.map((path, i) => ({
    path,
    includeInSitemap: sitemapMatches[i] ?? false,
    category: categoryMatches[i] ?? '',
    title: titleMatches[i] ?? '',
  }));
}

// --- Parse contentRoadmap.ts ---
function parseRoadmap() {
  const content = readFileSync(resolve(rootDir, 'src/data/contentRoadmap.ts'), 'utf-8');

  // Extract each item block
  const itemBlocks = [...content.matchAll(
    /\{\s*path:\s*['"]([^'"]+)['"]\s*,\s*status:\s*['"]([^'"]+)['"]/g
  )].map(m => ({
    path: m[1],
    status: m[2],
    startIndex: m.index,
  }));

  const items = [];
  for (let i = 0; i < itemBlocks.length; i++) {
    const start = itemBlocks[i].startIndex;
    const end = itemBlocks[i + 1]?.startIndex ?? content.length;
    const block = content.slice(start, end);

    const path = itemBlocks[i].path;
    const status = itemBlocks[i].status;

    const primaryKeyword = block.match(/primaryKeyword:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
    const secondaryKeywords = [...block.matchAll(/secondaryKeywords:\s*\[\s*([^;]+)\]/g)]
      .flatMap(m => [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map(n => n[1]));
    const longTailQuestions = [...block.matchAll(/longTailQuestions:\s*\[\s*([^;]+)\]/g)]
      .flatMap(m => [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map(n => n[1]));
    const categoryId = block.match(/categoryId:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
    const templateId = block.match(/templateId:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
    const monetizationPath = block.match(/monetizationPath:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
    const officialSourceTopics = [...block.matchAll(/officialSourceTopics:\s*\[\s*([^;]+)\]/g)]
      .flatMap(m => [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map(n => n[1]));
    const requiredInternalLinks = [...block.matchAll(/requiredInternalLinks:\s*\[\s*([^;]+)\]/g)]
      .flatMap(m => [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map(n => n[1]));

    items.push({
      path, status, primaryKeyword, secondaryKeywords, longTailQuestions,
      categoryId, templateId, monetizationPath, officialSourceTopics, requiredInternalLinks,
    });
  }
  return items;
}

// --- Parse pageTemplates.ts ---
function parseTemplates() {
  const content = readFileSync(resolve(rootDir, 'src/data/pageTemplates.ts'), 'utf-8');
  return [...content.matchAll(/templateId:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
}

// --- Parse contentTaxonomy.ts ---
function parseCategories() {
  const content = readFileSync(resolve(rootDir, 'src/data/contentTaxonomy.ts'), 'utf-8');
  return [...content.matchAll(/HOME:\s*['"]([^'"]+)['"]|PLATFORM_GUIDE:\s*['"]([^'"]+)['"]|SERVICE:\s*['"]([^'"]+)['"]|DECISION_GUIDE:\s*['"]([^'"]+)['"]|CHECKLIST:\s*['"]([^'"]+)['"]|TOOL:\s*['"]([^'"]+)['"]|QUOTE_REQUEST:\s*['"]([^'"]+)['"]/g)]
    .flatMap(m => m.slice(1).filter(Boolean));
}

function validate() {
  const routes = parseRoutes();
  const roadmap = parseRoadmap();
  const validTemplateIds = parseTemplates();
  const validCategoryIds = parseCategories();

  const sitemapRoutes = routes.filter(r => r.includeInSitemap);
  const liveItems = roadmap.filter(r => r.status === 'live');
  const plannedItems = roadmap.filter(r => r.status === 'planned');
  const allRoadmapPaths = new Set(roadmap.map(r => r.path));

  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;

  function log(type, msg) {
    const prefix = type === 'ERROR' ? 'x' : type === 'WARN' ? '!' : 'o';
    console.log(prefix + ' ' + msg);
    if (type === 'ERROR') failCount++;
    if (type === 'WARN') warnCount++;
    if (type === 'OK') passCount++;
  }

  console.log('o [ROADMAP] Validating contentRoadmap.ts consistency\n');

  // --- 1. Route consistency checks ---
  log('INFO', '--- Route <-> Roadmap consistency ---');
  for (const route of sitemapRoutes) {
    const item = roadmap.find(r => r.path === route.path);
    if (!item) {
      log('ERROR', `Route "${route.path}" is in routes.ts (sitemap) but NOT in contentRoadmap`);
    } else if (item.status !== 'live') {
      log('ERROR', `Route "${route.path}" is in routes.ts (sitemap) but roadmap status is "${item.status}" (should be "live")`);
    } else {
      log('OK', `Route "${route.path}" — live in both routes.ts and contentRoadmap`);
    }
  }

  for (const item of liveItems) {
    const route = routes.find(r => r.path === item.path);
    if (!route) {
      log('ERROR', `Roadmap item "${item.path}" is "live" in contentRoadmap but NOT in routes.ts`);
    } else if (!route.includeInSitemap) {
      log('ERROR', `Roadmap item "${item.path}" is "live" but includeInSitemap=false in routes.ts`);
    } else {
      log('OK', `Roadmap item "${item.path}" — synced`);
    }
  }

  // --- 2. Planned no conflict with live ---
  log('INFO', '\no --- Planned vs Live path conflicts ---');
  const livePaths = new Set(liveItems.map(i => i.path));
  for (const item of plannedItems) {
    if (livePaths.has(item.path)) {
      log('ERROR', `Planned item "${item.path}" conflicts with a live item of the same path`);
    } else {
      log('OK', `Planned item "${item.path}" — no live conflict`);
    }
  }

  // --- 3. All roadmap items field validation ---
  log('INFO', '\no --- Roadmap field requirements ---');
  const allItems = [...liveItems, ...plannedItems];
  for (const item of allItems) {
    if (!item.categoryId) {
      log('ERROR', `Roadmap item "${item.path}" — missing categoryId`);
    } else if (!validCategoryIds.includes(item.categoryId)) {
      log('ERROR', `Roadmap item "${item.path}" — invalid categoryId "${item.categoryId}"`);
    } else {
      log('OK', `"${item.path}" — categoryId: ${item.categoryId}`);
    }

    if (!item.templateId) {
      log('ERROR', `Roadmap item "${item.path}" — missing templateId`);
    } else if (!validTemplateIds.includes(item.templateId)) {
      log('ERROR', `Roadmap item "${item.path}" — invalid templateId "${item.templateId}"`);
    } else {
      log('OK', `"${item.path}" — templateId: ${item.templateId}`);
    }

    if (!item.primaryKeyword) {
      log('ERROR', `Roadmap item "${item.path}" — missing primaryKeyword`);
    } else {
      log('OK', `"${item.path}" — primaryKeyword: "${item.primaryKeyword}"`);
    }

    if (item.secondaryKeywords.length < 3) {
      log('ERROR', `Roadmap item "${item.path}" — secondaryKeywords has ${item.secondaryKeywords.length} (minimum 3 required)`);
    } else {
      log('OK', `"${item.path}" — secondaryKeywords: ${item.secondaryKeywords.length} ✓`);
    }

    if (item.longTailQuestions.length < 2) {
      log('ERROR', `Roadmap item "${item.path}" — longTailQuestions has ${item.longTailQuestions.length} (minimum 2 required)`);
    } else {
      log('OK', `"${item.path}" — longTailQuestions: ${item.longTailQuestions.length} ✓`);
    }

    if (!item.monetizationPath) {
      log('ERROR', `Roadmap item "${item.path}" — missing monetizationPath`);
    } else {
      log('OK', `"${item.path}" — monetizationPath: ${item.monetizationPath}`);
    }

    if (item.officialSourceTopics.length === 0) {
      log('ERROR', `Roadmap item "${item.path}" — missing officialSourceTopics`);
    } else {
      log('OK', `"${item.path}" — officialSourceTopics: ${item.officialSourceTopics.length} ✓`);
    }

    if (item.requiredInternalLinks.length === 0) {
      log('ERROR', `Roadmap item "${item.path}" — missing requiredInternalLinks`);
    } else {
      log('OK', `"${item.path}" — requiredInternalLinks: ${item.requiredInternalLinks.length} ✓`);
    }
  }

  // --- 4. Internal link validity ---
  log('INFO', '\no --- Internal link validation ---');
  for (const item of allItems) {
    let linkOk = 0;
    let linkFail = 0;
    for (const link of item.requiredInternalLinks) {
      // Skip anchor text (non-path strings — e.g. "GPSR guide for Shopify sellers")
      if (!link.startsWith('/')) {
        linkOk++;
        continue;
      }
      if (allRoadmapPaths.has(link)) {
        linkOk++;
      } else {
        log('WARN', `Roadmap item "${item.path}" — requiredInternalLinks includes "${link}" which is NOT in contentRoadmap`);
        linkFail++;
      }
    }
    if (linkFail === 0 && linkOk > 0) {
      log('OK', `"${item.path}" — all ${linkOk} internal links are valid`);
    }
  }

  // --- Summary ---
  console.log('\n========================================');
  console.log(`  Content Roadmap Validation Summary`);
  console.log('========================================');
  console.log(`  Live pages:      ${liveItems.length}`);
  console.log(`  Planned pages:   ${plannedItems.length}`);
  console.log(`  Routes (sitemap): ${sitemapRoutes.length}`);
  console.log(`  Pass:            ${passCount}`);
  console.log(`  Warn:            ${warnCount}`);
  console.log(`  Fail:            ${failCount}`);
  console.log('========================================\n');

  if (failCount > 0) {
    console.log('FAIL: Content roadmap validation failed');
    process.exit(1);
  } else {
    console.log('PASS: Content roadmap validation passed');
    process.exit(0);
  }
}

validate();
