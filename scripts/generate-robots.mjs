/**
 * generate-robots.mjs
 * Generates robots.txt to dist/ (Astro copies public/ → dist/, so we write to dist/ directly).
 * Also writes to public/ for consistency.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');
const publicDir = resolve(rootDir, 'public');

const SITE_URL = 'https://eureadyseller.com';

function generateRobots() {
  const content = `# robots.txt for EUReadySeller
# https://eureadyseller.com
# Policy: Allow all search and AI crawlers to access public educational content.

User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

  function writeRobots(dir) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'robots.txt'), content, 'utf-8');
  }

  try {
    writeRobots(distDir);
    writeRobots(publicDir);
    console.log('✓ robots.txt generated');
  } catch (e) {
    console.error('Failed to write robots.txt:', e.message);
    process.exit(1);
  }
}

generateRobots();
