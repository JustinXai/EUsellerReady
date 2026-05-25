/**
 * trigger-github-external-smoke.mjs
 * After deployment, optionally triggers the GitHub-hosted external smoke workflow
 * and waits for its result. Uses Node 20 built-in fetch — no npm dependencies.
 *
 * Usage: node scripts/trigger-github-external-smoke.mjs
 *   or:  npm run external:github
 *
 * Environment variables:
 *   GITHUB_TOKEN                          — required to trigger workflow_dispatch
 *   GITHUB_REPOSITORY                     — repo slug (default: JustinXai/EUsellerReady)
 *   GITHUB_EXTERNAL_SMOKE_WORKFLOW       — workflow file name (default: external-smoke.yml)
 *   GITHUB_EXTERNAL_SMOKE_REF            — branch/ref to run (default: main)
 *   SITE_URL                              — site URL passed as workflow input (default: https://eureadyseller.com)
 *   GITHUB_EXTERNAL_SMOKE_TIMEOUT_SECONDS — max wait time (default: 600)
 *   GITHUB_EXTERNAL_SMOKE_POLL_SECONDS    — poll interval (default: 10)
 *
 * If GITHUB_TOKEN is not set, the script outputs a warning and exits 0
 * so it never blocks deployment.
 */

const REPO        = process.env.GITHUB_REPOSITORY                     || 'JustinXai/EUsellerReady';
const WORKFLOW    = process.env.GITHUB_EXTERNAL_SMOKE_WORKFLOW         || 'external-smoke.yml';
const REF         = process.env.GITHUB_EXTERNAL_SMOKE_REF              || 'main';
const SITE_URL    = process.env.SITE_URL                               || 'https://eureadyseller.com';
const TIMEOUT_SEC = parseInt(process.env.GITHUB_EXTERNAL_SMOKE_TIMEOUT_SECONDS || '600', 10);
const POLL_SEC    = parseInt(process.env.GITHUB_EXTERNAL_SMOKE_POLL_SECONDS  || '10',  10);
const TOKEN       = process.env.GITHUB_TOKEN                            || '';
const API_BASE    = `https://api.github.com/repos/${REPO}`;

function log(prefix, msg) {
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`[${ts}] [${prefix}] ${msg}`);
}

async function githubFetch(url, options = {}) {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'EUReadySeller-Deploy',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeout);

    if (res.status === 403) {
      const body = await res.text();
      if (body.includes('rate limit') || res.headers.get('x-ratelimit-remaining') === '0') {
        throw new Error('GitHub API rate limit exceeded. Set GITHUB_TOKEN.');
      }
    }
    if (res.status === 404) {
      throw new Error(`GitHub API resource not found (404): ${url}`);
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`GitHub API error ${res.status}: ${body || url}`);
    }
    return res;
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

function poll(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Trigger workflow_dispatch via GitHub API.
 */
async function triggerWorkflow() {
  const url = `${API_BASE}/actions/workflows/${WORKFLOW}/dispatches`;
  log('INFO', `Triggering workflow_dispatch: ${WORKFLOW} on ${REF}`);
  log('INFO', `Input: site_url=${SITE_URL}`);

  const res = await githubFetch(url, {
    method: 'POST',
    body: JSON.stringify({
      ref: REF,
      inputs: {
        site_url: { value: SITE_URL },
      },
    }),
  });

  // 204 No Content means success
  if (res.status === 204 || res.ok) {
    log('OK', 'Workflow dispatch triggered successfully');
    return true;
  }
  throw new Error(`Unexpected response status: ${res.status}`);
}

/**
 * Find the most recent workflow_dispatch run for this workflow/branch.
 */
async function findLatestDispatchRun() {
  const url = `${API_BASE}/actions/workflows/${WORKFLOW}/runs?branch=${REF}&event=workflow_dispatch&per_page=10`;
  const res = await githubFetch(url);
  const data = await res.json();

  if (!data.workflow_runs || data.workflow_runs.length === 0) return null;

  // Return the newest run
  return data.workflow_runs[0];
}

/**
 * Wait for a run to complete and return its conclusion.
 */
async function waitForRun(runId) {
  const startedAt = Date.now();
  const deadline  = startedAt + TIMEOUT_SEC * 1000;

  log('WAIT', `Monitoring workflow run ID ${runId}`);
  log('INFO', `Timeout: ${TIMEOUT_SEC}s | Poll interval: ${POLL_SEC}s`);

  while (Date.now() < deadline) {
    try {
      const res = await githubFetch(`${API_BASE}/actions/runs/${runId}`);
      const run = await res.json();

      log('WAIT', `Run ${runId}: status=${run.status} conclusion=${run.conclusion ?? 'pending'}`);
      log('WAIT', `URL: ${run.html_url}`);

      if (run.status === 'completed') {
        return run;
      }
    } catch (e) {
      log('WARN', `API error while monitoring run: ${e.message}`);
    }

    const remaining = Math.round((deadline - Date.now()) / 1000);
    if (remaining <= 0) break;
    const sleepMs = Math.min(POLL_SEC * 1000, remaining * 1000);
    await poll(sleepMs);
  }

  // Timeout
  const elapsed = Math.round((Date.now() - startedAt) / 1000);
  log('FAIL', `Timed out after ${elapsed}s waiting for workflow run ${runId}`);
  log('INFO', `Check manually: https://github.com/${REPO}/actions`);
  return { status: 'completed', conclusion: 'timed_out', html_url: `https://github.com/${REPO}/actions` };
}

async function main() {
  console.log('');
  console.log('==> GitHub-Hosted External Smoke');

  if (!TOKEN) {
    log('WARN', 'GITHUB_TOKEN not set; skipping GitHub-hosted external smoke.');
    log('INFO', 'To enable: set GITHUB_TOKEN in /opt/eureadyseller/deploy.env');
    log('INFO', 'Or run: RUN_GITHUB_EXTERNAL_SMOKE=1 /opt/eureadyseller/deploy.sh');
    process.exit(0);
    return;
  }

  try {
    // Step 1: Trigger workflow_dispatch
    await triggerWorkflow();

    // Step 2: Wait a moment for the run to appear in the API
    log('WAIT', 'Waiting for workflow run to appear...');
    await poll(5000);

    // Step 3: Find the latest dispatch run
    const run = await findLatestDispatchRun();
    if (!run) {
      log('FAIL', 'Could not find workflow_dispatch run after triggering. Check workflow permissions.');
      process.exit(1);
      return;
    }

    log('OK', `Found run ID ${run.id} at ${run.html_url}`);

    // Step 4: Wait for completion
    const result = await waitForRun(run.id);

    // Step 5: Report
    if (result.conclusion === 'success') {
      log('PASS', 'GitHub-hosted external smoke passed');
      log('INFO', `URL: ${result.html_url}`);
      process.exit(0);
    } else {
      log('FAIL', `GitHub-hosted external smoke failed — conclusion: ${result.conclusion}`);
      log('FAIL', `URL: ${result.html_url}`);
      process.exit(1);
    }
  } catch (e) {
    log('FAIL', `GitHub external smoke error: ${e.message}`);
    process.exit(1);
  }
}

main().catch(e => {
  console.error('[ERROR]', e.message);
  process.exit(1);
});
