/**
 * EUReadySeller Message API
 * 
 * Handles form submissions from the provider intake form.
 * Saves structured data to JSONL for later analysis.
 * 
 * Fields:
 *   - id: UUID
 *   - createdAt: ISO timestamp
 *   - email: contact email (required)
 *   - name: optional name
 *   - location: business location (us, uk, china, canada, eu, other-non-eu)
 *   - platform: selling platform (shopify, amazon, etsy, woocommerce, custom-store, multiple-platforms)
 *   - countries: target EU countries array
 *   - topics: compliance topics array (gpsr, eu-responsible-person, epr-packaging, weee, batteries, marketplace-warning, not-sure)
 *   - situation: current situation
 *   - productCategory: product category description
 *   - message: free-form message (required)
 *   - page: source page path
 *   - referer: referer header
 *   - userAgent: user agent string
 *   - ipHash: hashed IP (not raw IP)
 */

import { createServer } from 'http';
import { readFileSync, appendFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';

const HOST = process.env.MESSAGE_API_HOST || '127.0.0.1';
const PORT = parseInt(process.env.MESSAGE_API_PORT || '8787', 10);
const ALLOWED_ORIGIN = process.env.MESSAGE_ALLOWED_ORIGIN || '*';
const STORE_PATH = process.env.MESSAGE_STORE_PATH || '/opt/eureadyseller/data/messages.jsonl';
const IP_HASH_SALT = process.env.MESSAGE_IP_HASH_SALT || '';

// Valid values
const VALID_PLATFORMS = ['shopify', 'amazon', 'etsy', 'woocommerce', 'custom-store', 'multiple-platforms', 'not-sure'];
const VALID_COUNTRIES = ['germany', 'france', 'spain', 'italy', 'netherlands', 'other'];
const VALID_TOPICS = ['gpsr', 'eu-responsible-person', 'epr-packaging', 'weee', 'batteries', 'marketplace-warning', 'not-sure'];
const VALID_SITUATIONS = ['planning-eu-launch', 'already-selling-eu', 'marketplace-warning', 'need-provider-quotes', 'not-sure'];
const VALID_LOCATIONS = ['us', 'uk', 'china', 'canada', 'other-non-eu', 'eu'];

function hashIP(ip) {
  if (!ip || !IP_HASH_SALT) return 'unknown';
  return createHash('sha256').update(ip + IP_HASH_SALT).digest('hex');
}

function validatePayload(data) {
  const errors = [];
  
  // Email is required
  if (!data.email || !data.email.includes('@')) {
    errors.push('Valid email is required');
  }
  
  // Message is required
  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  }
  
  // Validate optional arrays
  if (data.countries) {
    if (!Array.isArray(data.countries)) {
      errors.push('countries must be an array');
    } else {
      const invalidCountries = data.countries.filter(c => !VALID_COUNTRIES.includes(c));
      if (invalidCountries.length > 0) {
        errors.push(`Invalid countries: ${invalidCountries.join(', ')}`);
      }
    }
  }
  
  if (data.topics) {
    if (!Array.isArray(data.topics)) {
      errors.push('topics must be an array');
    } else {
      const invalidTopics = data.topics.filter(t => !VALID_TOPICS.includes(t));
      if (invalidTopics.length > 0) {
        errors.push(`Invalid topics: ${invalidTopics.join(', ')}`);
      }
    }
  }
  
  // Validate single values
  if (data.platform && !VALID_PLATFORMS.includes(data.platform)) {
    errors.push(`Invalid platform: ${data.platform}`);
  }
  
  if (data.location && !VALID_LOCATIONS.includes(data.location)) {
    errors.push(`Invalid location: ${data.location}`);
  }
  
  if (data.situation && !VALID_SITUATIONS.includes(data.situation)) {
    errors.push(`Invalid situation: ${data.situation}`);
  }
  
  return errors;
}

function saveMessage(message) {
  const line = JSON.stringify(message) + '\n';
  appendFileSync(STORE_PATH, line, 'utf8');
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        // Try URL encoded
        const params = new URLSearchParams(body);
        const obj = {};
        for (const [key, value] of params) {
          // Handle arrays from checkboxes
          if (obj[key]) {
            if (Array.isArray(obj[key])) {
              obj[key].push(value);
            } else {
              obj[key] = [obj[key], value];
            }
          } else {
            obj[key] = value;
          }
        }
        resolve(obj);
      }
    });
    req.on('error', reject);
  });
}

const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }
  
  try {
    const body = await parseBody(req);
    
    // Honeypot check - if website field has value, silently accept but don't save
    if (body.website && body.website.trim().length > 0) {
      console.log('[spam] Honeypot triggered - message not saved');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, id: 'blocked' }));
      return;
    }
    
    // Validate
    const errors = validatePayload(body);
    if (errors.length > 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Validation failed', details: errors }));
      return;
    }
    
    // Get client IP (from proxy headers if available)
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
    
    // Build message object
    const message = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      email: body.email.trim().toLowerCase(),
      name: body.name ? body.name.trim() : null,
      location: body.location || null,
      platform: body.platform || null,
      countries: Array.isArray(body.countries) ? body.countries : (body.countries ? [body.countries] : []),
      topics: Array.isArray(body.topics) ? body.topics : (body.topics ? [body.topics] : []),
      situation: body.situation || null,
      productCategory: body.productCategory ? body.productCategory.trim() : null,
      message: body.message.trim(),
      page: body.page || '/request-eu-compliance-quotes/',
      referer: req.headers.referer || '',
      userAgent: req.headers['user-agent'] || '',
      ipHash: hashIP(ip),
    };
    
    // Save
    saveMessage(message);
    console.log('[saved] id=' + message.id + ' email=' + message.email + ' platform=' + (message.platform || 'none'));
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, id: message.id }));
    
  } catch (error) {
    console.error('[error]', error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(PORT, HOST, () => {
  console.log('[start] EUReadySeller Message API');
  console.log('[start] Listening on ' + HOST + ':' + PORT);
  console.log('[start] Store path: ' + STORE_PATH);
  console.log('[start] Allowed origin: ' + ALLOWED_ORIGIN);
});
