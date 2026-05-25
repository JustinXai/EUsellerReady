/**
 * external-smoke.mjs
 * Deployment smoke test — checks the LIVE site (https://eureadyseller.com).
 * Uses Node 20 built-in fetch (no npm dependencies needed).
 *
 * Run: npm run external:smoke
 */
const BASE_URL = 'https://eureadyseller.com';

let exitCode = 0;

function log(type, msg) {
  const prefix = type === 'ERROR' ? 'x' : type === 'WARN' ? '!' : 'o';
  console.log(prefix + ' ' + msg);
  if (type === 'ERROR') exitCode = 1;
}

async function fetchText(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'EUReadySeller-smoke-test/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    return { ok: res.ok, status: res.status, text: await res.text() };
  } catch (e) {
    return { ok: false, status: 0, text: '', error: e.message };
  }
}

async function check() {
  console.log('[SMOKE] External deployment smoke test\n');

  // --- URLs to check ---
  const urls = [
    { url: `${BASE_URL}/`, label: 'Homepage' },
    { url: `${BASE_URL}/gpsr-compliance-for-amazon-sellers/`, label: 'Amazon GPSR page' },
    { url: `${BASE_URL}/do-i-need-an-eu-responsible-person/`, label: 'EU RP Decision page' },
    { url: `${BASE_URL}/sitemap.xml`, label: 'Sitemap XML' },
    { url: `${BASE_URL}/robots.txt`, label: 'Robots.txt' },
    { url: `${BASE_URL}/llms.txt`, label: 'LLMs.txt' },
  ];

  for (const { url, label } of urls) {
    const result = await fetchText(url);
    if (result.ok) {
      log('OK', `${label}: HTTP ${result.status} - ${url}`);
    } else {
      log('ERROR', `${label}: HTTP ${result.status} - ${url} ${result.error ?? ''}`);
    }
  }

  console.log('');

  // --- Robots.txt checks ---
  log('INFO', '--- robots.txt content checks ---');
  const robotsResult = await fetchText(`${BASE_URL}/robots.txt`);
  if (robotsResult.ok) {
    const r = robotsResult.text;
    if (r.includes('Disallow: /')) {
      log('ERROR', 'robots.txt contains "Disallow: /" — blocks all crawlers!');
    } else {
      log('OK', 'robots.txt does not block all crawlers');
    }
    if (r.includes('GPTBot')) {
      log('ERROR', 'robots.txt blocks GPTBot');
    } else {
      log('OK', 'robots.txt does not block GPTBot');
    }
    if (r.includes('ChatGPT-User')) {
      log('ERROR', 'robots.txt blocks ChatGPT-User');
    } else {
      log('OK', 'robots.txt does not block ChatGPT-User');
    }
    if (r.includes('CCBot')) {
      log('ERROR', 'robots.txt blocks CCBot');
    } else {
      log('OK', 'robots.txt does not block CCBot');
    }
    if (!r.includes('Allow: /')) {
      log('ERROR', 'robots.txt missing "Allow: /"');
    } else {
      log('OK', 'robots.txt has "Allow: /"');
    }
    if (!r.includes('Sitemap:')) {
      log('WARN', 'robots.txt missing Sitemap directive');
    } else {
      log('OK', 'robots.txt has Sitemap directive');
    }
  } else {
    log('ERROR', 'Could not fetch robots.txt');
  }

  console.log('');

  // --- LLMs.txt checks ---
  log('INFO', '--- llms.txt content checks ---');
  const llmsResult = await fetchText(`${BASE_URL}/llms.txt`);
  if (llmsResult.ok) {
    const l = llmsResult.text;
    if (l.includes('/gpsr-compliance-for-amazon-sellers/')) {
      log('OK', 'llms.txt contains Amazon GPSR page');
    } else {
      log('ERROR', 'llms.txt MISSING Amazon GPSR page');
    }
    if (l.includes('/do-i-need-an-eu-responsible-person/')) {
      log('OK', 'llms.txt contains EU RP Decision page');
    } else {
      log('ERROR', 'llms.txt MISSING EU RP Decision page');
    }
  } else {
    log('ERROR', 'Could not fetch llms.txt');
  }

  console.log('');

  // --- Sitemap checks ---
  log('INFO', '--- sitemap.xml content checks ---');
  const sitemapResult = await fetchText(`${BASE_URL}/sitemap.xml`);
  if (sitemapResult.ok) {
    const s = sitemapResult.text;
    if (s.includes('/gpsr-compliance-for-amazon-sellers/')) {
      log('OK', 'sitemap.xml contains Amazon GPSR page');
    } else {
      log('ERROR', 'sitemap.xml MISSING Amazon GPSR page');
    }
    if (s.includes('/do-i-need-an-eu-responsible-person/')) {
      log('OK', 'sitemap.xml contains EU RP Decision page');
    } else {
      log('ERROR', 'sitemap.xml MISSING EU RP Decision page');
    }
  } else {
    log('ERROR', 'Could not fetch sitemap.xml');
  }

  console.log('');

  // --- Page H1 checks ---
  log('INFO', '--- Page H1 checks ---');
  const amazonResult = await fetchText(`${BASE_URL}/gpsr-compliance-for-amazon-sellers/`);
  if (amazonResult.ok) {
    if (amazonResult.text.includes('GPSR Compliance for Amazon Sellers')) {
      log('OK', 'Amazon GPSR page has correct H1');
    } else {
      log('ERROR', 'Amazon GPSR page MISSING expected H1 text');
    }
  }

  const rpResult = await fetchText(`${BASE_URL}/do-i-need-an-eu-responsible-person/`);
  if (rpResult.ok) {
    if (rpResult.text.includes('Do I Need an EU Responsible Person')) {
      log('OK', 'EU RP Decision page has correct H1');
    } else {
      log('ERROR', 'EU RP Decision page MISSING expected H1 text');
    }
  }

  console.log('');
  if (exitCode === 0) {
    console.log('PASS: All external smoke checks passed');
  } else {
    console.log('FAIL: Some external smoke checks failed');
  }

  process.exit(exitCode);
}

check();
