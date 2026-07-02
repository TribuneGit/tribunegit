'use strict';
const crypto = require('crypto');
const https  = require('https');

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
  } catch { return null; }
}

function httpsRequest(method, url, body, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const opts = {
      hostname: u.hostname, path: u.pathname + u.search, method,
      headers: { ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}), ...headers }
    };
    const req = https.request(opts, res => { let raw = ''; res.on('data', c => raw += c); res.on('end', () => resolve({ status: res.statusCode, body: raw })); });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };

  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token || !verifyJWT(token, process.env.BCH_PORTAL_JWT_SECRET || '')) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { request_id, action } = body;
  if (!request_id || !['approve', 'reject'].includes(action)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'request_id and action (approve|reject) required' }) };
  }

  const SUPA_URL = process.env.SUPABASE_TABULARIUM_URL;
  const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const headers = { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY, 'Content-Type': 'application/json' };

  // Fetch current record
  const getRes = await httpsRequest('GET', `${SUPA_URL}/rest/v1/tabularium_files?checksum=eq.${request_id}&select=content`, null, { ...headers, 'Accept': 'application/json' });
  if (getRes.status !== 200) return { statusCode: 502, body: JSON.stringify({ error: 'Tabularium fetch failed' }) };
  const rows = JSON.parse(getRes.body);
  if (!rows.length) return { statusCode: 404, body: JSON.stringify({ error: 'Request not found' }) };

  const record = JSON.parse(rows[0].content);

  if (action === 'approve') {
    record.status = 'reviewed';
    record.reviewed_at = new Date().toISOString();
  } else {
    record.status = 'pending';
    record.updated_at = new Date().toISOString();
    record.praecon_result = null;
    record.reviewed_at = null;
  }

  await httpsRequest('PATCH', `${SUPA_URL}/rest/v1/tabularium_files?checksum=eq.${request_id}`,
    { content: JSON.stringify(record) },
    { ...headers, 'Prefer': 'return=minimal' }
  );

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, status: record.status })
  };
};
