'use strict';
const crypto = require('crypto');
const https  = require('https');

// ----------------------------------------------------------------
// JWT verify
// ----------------------------------------------------------------
function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [h, b, s] = parts;
    const expected = crypto.createHmac('sha256', secret).update(`${h}.${b}`).digest('base64url');
    if (s !== expected) return null;
    const payload = JSON.parse(Buffer.from(b, 'base64url').toString());
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------
// Main handler
// ----------------------------------------------------------------
exports.handler = async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Auth
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const jwtSecret = process.env.BCH_PORTAL_JWT_SECRET || '';
  if (!token || !verifyJWT(token, jwtSecret)) {
    return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const SUPABASE_URL = process.env.SUPABASE_TABULARIUM_URL;
  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Query Tabularium for bch_portal category, last 30
  const queryUrl = `${SUPABASE_URL}/rest/v1/tabularium_files?category=eq.bch_portal&order=created_at.desc&limit=30`;

  let rows = [];
  try {
    await new Promise((resolve, reject) => {
      const u = new URL(queryUrl);
      const opts = {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'GET',
        headers: {
          'apikey':        SERVICE_KEY,
          'Authorization': 'Bearer ' + SERVICE_KEY,
          'Content-Type':  'application/json'
        }
      };
      const req = https.request(opts, res => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => {
          try {
            rows = JSON.parse(raw);
            if (!Array.isArray(rows)) rows = [];
          } catch { rows = []; }
          resolve();
        });
      });
      req.on('error', reject);
      req.end();
    });
  } catch (err) {
    console.error('Tabularium query failed:', err.message);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: [] })
    };
  }

  // Parse each record and build summary
  const requests = rows.map(row => {
    let record = {};
    try { record = JSON.parse(row.content || '{}'); } catch {}

    const desc = record.description || record.placement || '';
    return {
      id:                  record.id || row.id || '',
      status:              record.status || 'pending',
      classification:      record.classification || 'unknown',
      description_preview: desc.slice(0, 120),
      description:          desc,
      created_at:          record.created_at || row.created_at || null,
      reviewed_at:         record.reviewed_at || null
    };
  }).filter(r => r.id);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests })
  };
};
