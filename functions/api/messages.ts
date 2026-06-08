/**
 * EUReadySeller Message API — Cloudflare Pages Function
 * POST /api/messages — provider intake form submissions (D1)
 */

interface Env {
  MESSAGE_DB: D1Database;
  MESSAGE_IP_HASH_SALT?: string;
}

type LeadPayload = {
  email?: string;
  name?: string | null;
  location?: string | null;
  platform?: string | null;
  productCategory?: string | null;
  countries?: string[] | string;
  topics?: string[] | string;
  situation?: string | null;
  message?: string;
  page?: string;
  website?: string;
};

const VALID_PLATFORMS = new Set([
  'shopify', 'amazon', 'etsy', 'woocommerce', 'custom-store', 'multiple-platforms', 'not-sure',
]);
const VALID_COUNTRIES = new Set(['germany', 'france', 'spain', 'italy', 'netherlands', 'other']);
const VALID_TOPICS = new Set([
  'gpsr', 'eu-responsible-person', 'epr-packaging', 'weee', 'batteries', 'marketplace-warning', 'not-sure',
]);
const VALID_SITUATIONS = new Set([
  'planning-eu-launch', 'already-selling-eu', 'marketplace-warning', 'need-provider-quotes', 'not-sure',
]);
const VALID_LOCATIONS = new Set(['us', 'uk', 'china', 'canada', 'other-non-eu', 'eu']);

const ALLOWED_ORIGINS = new Set([
  'https://eureadyseller.com',
  'https://www.eureadyseller.com',
  'https://eusellerready.pages.dev',
]);

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  origin: string | null,
): Response {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const corsOrigin = resolveCorsOrigin(origin);
  if (corsOrigin) {
    headers.set('Access-Control-Allow-Origin', corsOrigin);
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    headers.set('Vary', 'Origin');
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function resolveCorsOrigin(origin: string | null): string | null {
  if (!origin) return null;
  return ALLOWED_ORIGINS.has(origin) ? origin : null;
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashWithSalt(value: string, salt: string | undefined): Promise<string> {
  if (!value || !salt) return 'unknown';
  return sha256Hex(value + salt);
}

function normalizeArray(value: string[] | string | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function validatePayload(data: LeadPayload): string[] {
  const errors: string[] = [];

  if (!data.email || !data.email.includes('@')) {
    errors.push('Valid email is required');
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  }

  const countries = normalizeArray(data.countries);
  if (data.countries !== undefined && !Array.isArray(data.countries) && typeof data.countries !== 'string') {
    errors.push('countries must be an array');
  } else {
    const invalidCountries = countries.filter((c) => !VALID_COUNTRIES.has(c));
    if (invalidCountries.length > 0) {
      errors.push(`Invalid countries: ${invalidCountries.join(', ')}`);
    }
  }

  const topics = normalizeArray(data.topics);
  if (data.topics !== undefined && !Array.isArray(data.topics) && typeof data.topics !== 'string') {
    errors.push('topics must be an array');
  } else {
    const invalidTopics = topics.filter((t) => !VALID_TOPICS.has(t));
    if (invalidTopics.length > 0) {
      errors.push(`Invalid topics: ${invalidTopics.join(', ')}`);
    }
  }

  if (data.platform && !VALID_PLATFORMS.has(data.platform)) {
    errors.push(`Invalid platform: ${data.platform}`);
  }

  if (data.location && !VALID_LOCATIONS.has(data.location)) {
    errors.push(`Invalid location: ${data.location}`);
  }

  if (data.situation && !VALID_SITUATIONS.has(data.situation)) {
    errors.push(`Invalid situation: ${data.situation}`);
  }

  return errors;
}

function clientIp(request: Request): string {
  const cfConnecting = request.headers.get('CF-Connecting-IP');
  if (cfConnecting) return cfConnecting.trim();
  const forwarded = request.headers.get('X-Forwarded-For');
  if (forwarded) return forwarded.split(',')[0].trim();
  return '';
}

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  const origin = request.headers.get('Origin');
  const corsOrigin = resolveCorsOrigin(origin);
  if (!corsOrigin) {
    return new Response(null, { status: 204 });
  }
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    },
  });
};

export const onRequestGet: PagesFunction<Env> = async ({ request }) => {
  const origin = request.headers.get('Origin');
  return jsonResponse(
    { ok: false, error: 'Method not allowed. Use POST to submit provider intake messages.' },
    405,
    origin,
  );
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get('Origin');

  try {
    let body: LeadPayload;
    try {
      body = await request.json() as LeadPayload;
    } catch {
      return jsonResponse({ ok: false, error: 'Invalid JSON payload' }, 400, origin);
    }

    if (body.website && body.website.trim().length > 0) {
      return jsonResponse({ ok: true, id: 'blocked' }, 200, origin);
    }

    const errors = validatePayload(body);
    if (errors.length > 0) {
      return jsonResponse(
        { ok: false, error: 'Validation failed', details: errors },
        400,
        origin,
      );
    }

    if (!env.MESSAGE_DB) {
      return jsonResponse(
        { ok: false, error: 'Message storage is not configured' },
        500,
        origin,
      );
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const countries = normalizeArray(body.countries);
    const topics = normalizeArray(body.topics);
    const userAgent = request.headers.get('User-Agent') || '';
    const ipHash = await hashWithSalt(clientIp(request), env.MESSAGE_IP_HASH_SALT);
    const userAgentHash = await hashWithSalt(userAgent, env.MESSAGE_IP_HASH_SALT);

    const record = {
      id,
      createdAt,
      email: body.email!.trim().toLowerCase(),
      name: body.name ? body.name.trim() : null,
      location: body.location || null,
      platform: body.platform || null,
      countries,
      topics,
      situation: body.situation || null,
      productCategory: body.productCategory ? body.productCategory.trim() : null,
      message: body.message!.trim(),
      page: body.page || '/request-eu-compliance-quotes/',
    };

    await env.MESSAGE_DB.prepare(
      `INSERT INTO messages (
        id, created_at, email, name, location, platform, product_category,
        target_countries, compliance_topics, situation, message, source_page,
        user_agent_hash, ip_hash, status, raw_payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        createdAt,
        record.email,
        record.name,
        record.location,
        record.platform,
        record.productCategory,
        JSON.stringify(countries),
        JSON.stringify(topics),
        record.situation,
        record.message,
        record.page,
        userAgentHash,
        ipHash,
        'new',
        JSON.stringify(body),
      )
      .run();

    return jsonResponse({ ok: true, id }, 200, origin);
  } catch {
    return jsonResponse({ ok: false, error: 'Internal server error' }, 500, origin);
  }
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin');
  return jsonResponse(
    { ok: false, error: 'Method not allowed' },
    405,
    origin,
  );
};
