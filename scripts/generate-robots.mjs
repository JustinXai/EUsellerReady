/**
 * generate-robots.mjs
 * Generates public/robots.txt
 */
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const publicDir = resolve(rootDir, 'public');

const SITE_URL = 'https://eureadyseller.com';

function generateRobots() {
  const content = `# robots.txt for EUReadySeller
# https://eureadyseller.com

User-agent: *
Allow: /

# Block AI training bots
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

  try {
    mkdirSync(publicDir, { recursive: true });
    writeFileSync(resolve(publicDir, 'robots.txt'), content, 'utf-8');
    console.log('✓ robots.txt generated');
  } catch (e) {
    console.error('Failed to write robots.txt:', e.message);
    process.exit(1);
  }
}

generateRobots();
