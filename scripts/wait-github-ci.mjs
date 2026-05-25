/**
 * wait-github-ci.mjs
 * Waits for a GitHub Actions workflow run to complete (success or failure).
 * Uses Node 20 built-in fetch — no npm dependencies needed.
 *
 * Usage: node scripts/wait-github-ci.mjs
 *   or:  npm run ci:wait
 *
 * Environment variables:
 *   GITHUB_REPOSITORY          — repo slug (default: JustinXai/EUsellerReady)
 *   GITHUB_SHA                 — commit SHA to watch (default: git rev-parse HEAD)
 *   GITHUB_CI_WORKFLOW_NAME    — workflow run name to match (default: EUReadySeller Quality Gate)
 *   GITHUB_CI_TIMEOUT_SECONDS  — max wait time (default: 600)
 *   GITHUB_CI_POLL_SECONDS     — poll interval (default: 10)
 *   GITHUB_TOKEN               — optional, raises API rate limit
 */

const REPO        = process.env.GITHUB_REPOSITORY            || 'JustinXai/EUsellerReady';
const WORKFLOW    = process.env.GITHUB_CI_WORKFLOW_NAME       || 'EUReadySeller Quality Gate';
const TIMEOUT_SEC = parseInt(process.env.GITHUB_CI_TIMEOUT_SECONDS  || '600', 10);
const POLL_SEC    = parseInt(process.env.GITHUB_CI_POLL_SECONDS     || '10',  10);
const TOKEN       = process.env.GITHUB_TOKEN                  || '';
const API_BASE    = `https://api.github.com/repos/${REPO}`;

// Resolve SHA
async function getCurrentSha() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  const { execSync } = await import('child_process');
  return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
}

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
        throw new Error('GitHub API rate limit exceeded. Set GITHUB_TOKEN to increase quota.');
      }
    }
    if (res.status === 404) {
      throw new Error(`GitHub API resource not found (404): ${url}. Check GITHUB_REPOSITORY.`);
    }
    if (!res.ok && res.status !== 200 && res.status !== 201) {
      throw new Error(`GitHub API error ${res.status}: ${url}`);
    }
    return res;
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

async function findWorkflowRun(sha) {
  const url = `${API_BASE}/actions/runs?head_sha=${sha}&per_page=20`;
  const res = await githubFetch(url);
  const data = await res.json();

  if (!data.workflow_runs || data.workflow_runs.length === 0) return null;

  // Find the first run whose workflow name matches
  return data.workflow_runs.find(run => run.name === WORKFLOW) || null;
}

function poll(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForConclusion(sha) {
  const startedAt = Date.now();
  const deadline  = startedAt + TIMEOUT_SEC * 1000;

  log('WAIT', `Waiting for workflow "${WORKFLOW}" on ${REPO}@${sha.slice(0, 7)}`);
  log('INFO', `Timeout: ${TIMEOUT_SEC}s | Poll interval: ${POLL_SEC}s`);

  while (Date.now() < deadline) {
    try {
      const run = await findWorkflowRun(sha);

      if (!run) {
        log('WAIT', `No matching workflow run found yet for commit ${sha.slice(0, 7)}`);
      } else {
        log('WAIT', `Run status: ${run.status} | conclusion: ${run.conclusion ?? 'pending'}`);
        log('WAIT', `URL: ${run.html_url}`);

        if (run.status === 'completed') {
          if (run.conclusion === 'success') {
            log('PASS', `GitHub Quality Gate passed`);
            log('INFO', `URL: ${run.html_url}`);
            return { success: true, url: run.html_url };
          }

          const failureConclusions = ['failure', 'cancelled', 'timed_out', 'action_required', 'startup_failure'];
          if (failureConclusions.includes(run.conclusion)) {
            log('FAIL', `GitHub Quality Gate failed — conclusion: ${run.conclusion}`);
            log('FAIL', `URL: ${run.html_url}`);
            return { success: false, url: run.html_url, conclusion: run.conclusion };
          }
        }
      }
    } catch (e) {
      log('WARN', `API error: ${e.message}`);
    }

    const remaining = Math.round((deadline - Date.now()) / 1000);
    if (remaining <= 0) break;
    const sleepMs = Math.min(POLL_SEC * 1000, remaining * 1000);
    await poll(sleepMs);
  }

  // Timeout
  const elapsed = Math.round((Date.now() - startedAt) / 1000);
  log('FAIL', `Timed out after ${elapsed}s waiting for GitHub Quality Gate`);
  log('INFO', `Repo: ${REPO} | Commit: ${sha.slice(0, 7)} | Workflow: ${WORKFLOW}`);
  log('INFO', `Check manually: https://github.com/${REPO}/actions`);
  return { success: false, url: null, conclusion: 'timed_out' };
}

async function main() {
  console.log('');
  console.log('==> Waiting for GitHub Actions');
  console.log(`Repo:     ${REPO}`);
  console.log(`Workflow: ${WORKFLOW}`);
  console.log('');

  const sha = await getCurrentSha();
  console.log(`Commit:   ${sha.slice(0, 7)} (${sha})`);
  console.log('');

  const result = await waitForConclusion(sha);

  if (result.success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main().catch(e => {
  console.error('[ERROR]', e.message);
  process.exit(1);
});
