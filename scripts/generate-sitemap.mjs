/**
 * generate-sitemap.mjs
 * Generates sitemap.xml to dist/ (Astro copies public/ → dist/, so we write to dist/ directly).
 * Also writes to public/ for consistency.
 * Reads from src/data/routes.ts via static parsing.
 */
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');
const publicDir = resolve(rootDir, 'public');
const SITE_URL = 'https://eureadyseller.com';

function parseRoutesFromFile() {
  const content = readFileSync(resolve(rootDir, 'src/data/routes.ts'), 'utf-8');

  const pathMatches = [...content.matchAll(/path:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const lastmodMatches = [...content.matchAll(/lastmod:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const priorityMatches = [...content.matchAll(/priority:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const changefreqMatches = [...content.matchAll(/changefreq:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const sitemapMatches = [...content.matchAll(/includeInSitemap:\s*(true|false)/g)].map(m => m[1] === 'true');

  return pathMatches.map((path, i) => ({
    path,
    lastmod: lastmodMatches[i] ?? '2026-05-24',
    priority: priorityMatches[i] ?? '0.8',
    changefreq: changefreqMatches[i] ?? 'monthly',
    includeInSitemap: sitemapMatches[i] ?? true,
  }));
}

function generateSitemap() {
  const routeData = parseRoutesFromFile();
  const now = new Date().toISOString().split('T')[0];

  const urlEntries = routeData
    .filter(r => r.includeInSitemap)
    .map(r => {
      const loc = `${SITE_URL}${r.path}`;
      const lastmod = r.lastmod ?? now;
      const priority = r.priority ?? '0.8';
      const changefreq = r.changefreq ?? 'monthly';
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>
`;

  function writeSitemap(dir) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'sitemap.xml'), xml, 'utf-8');
  }

  try {
    writeSitemap(distDir);
    writeSitemap(publicDir);
    console.log(`✓ sitemap.xml generated with ${urlEntries.length} URLs`);
  } catch (e) {
    console.error('Failed to write sitemap.xml:', e.message);
    process.exit(1);
  }
}

generateSitemap();
