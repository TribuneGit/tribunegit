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
// HTTPS helpers
// ----------------------------------------------------------------
function httpsRequest(method, url, body, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const contentLength = data ? Buffer.byteLength(data) : 0;
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers: {
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': contentLength } : {}),
        ...headers
      }
    };
    const req = https.request(opts, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve({ status: res.statusCode, body: raw }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// Multipart form data POST for Cloudinary
function cloudinaryUpload(cloudName, base64Data, mimeType, fileName, apiKey, signature, timestamp, folder) {
  return new Promise((resolve, reject) => {
    const boundary = `----BCHUpload${Date.now()}`;
    const fileBuffer = Buffer.from(base64Data, 'base64');

    const parts = [
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`,
      fileBuffer,
      `\r\n--${boundary}\r\nContent-Disposition: form-data; name="api_key"\r\n\r\n${apiKey}`,
      `\r\n--${boundary}\r\nContent-Disposition: form-data; name="timestamp"\r\n\r\n${timestamp}`,
      `\r\n--${boundary}\r\nContent-Disposition: form-data; name="signature"\r\n\r\n${signature}`,
      `\r\n--${boundary}\r\nContent-Disposition: form-data; name="folder"\r\n\r\n${folder}`,
      `\r\n--${boundary}--\r\n`
    ];

    const bodyBuffers = parts.map(p => Buffer.isBuffer(p) ? p : Buffer.from(p));
    const bodyBuf = Buffer.concat(bodyBuffers);

    const opts = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${cloudName}/auto/upload`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuf.length
      }
    };
    const req = https.request(opts, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve({ status: res.statusCode, body: raw }));
    });
    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
}

// ----------------------------------------------------------------
// Tabularium store
// ----------------------------------------------------------------
async function storeInTabularium(record) {
  const SUPABASE_URL = process.env.SUPABASE_TABULARIUM_URL;
  const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return httpsRequest(
    'POST',
    `${SUPABASE_URL}/rest/v1/tabularium_files`,
    {
      path:        record.path,
      content:     JSON.stringify(record),
      checksum:    record.id,
      version:     1,
      instance_id: 'bch-portal',
      category:    'bch_portal'
    },
    {
      'apikey':        SERVICE_KEY,
      'Authorization': 'Bearer ' + SERVICE_KEY,
      'Prefer':        'return=minimal'
    }
  );
}

// ----------------------------------------------------------------
// Main handler
// ----------------------------------------------------------------
exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Auth
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const jwtSecret = process.env.BCH_PORTAL_JWT_SECRET || '';
  if (!token || !verifyJWT(token, jwtSecret)) {
    return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const files     = Array.isArray(body.files) ? body.files : [];
  const placement = String(body.placement || '').trim();

  if (files.length === 0) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'No files provided' }) };
  }
  if (files.length > 10) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Max 10 files per upload' }) };
  }

  // Cloudinary config
  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '[CLOUDINARY_CLOUD_NAME]';
  const API_KEY    = process.env.CLOUDINARY_BCH_KEY;
  const API_SECRET = process.env.CLOUDINARY_BCH_SECRET;
  const folder     = 'bch-portal';

  const cloudinaryUrls = [];

  for (const file of files) {
    if (!file.name || !file.data) continue;
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const strToSign = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
      const signature = crypto.createHash('sha1').update(strToSign).digest('hex');
      const mimeType  = file.type || 'application/octet-stream';

      const res = await cloudinaryUpload(CLOUD_NAME, file.data, mimeType, file.name, API_KEY, signature, timestamp, folder);
      if (res.status === 200) {
        const parsed = JSON.parse(res.body);
        cloudinaryUrls.push(parsed.secure_url || parsed.url || '');
      } else {
        console.error('Cloudinary upload failed for', file.name, res.status, res.body.slice(0, 200));
        cloudinaryUrls.push(null);
      }
    } catch (err) {
      console.error('Cloudinary error for', file.name, err.message);
      cloudinaryUrls.push(null);
    }
  }

  // Store in Tabularium
  const id   = crypto.randomUUID();
  const path = `bch_portal/uploads/${id}.json`;
  const record = {
    id, path, status: 'pending', classification: 'upload',
    description: placement || `${files.length} file(s) uploaded`,
    files: files.map((f, i) => ({ name: f.name, type: f.type, cloudinary_url: cloudinaryUrls[i] || null })),
    placement,
    cloudinary_urls: cloudinaryUrls,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    jeff_notified: false, praecon_session: null, praecon_result: null
  };

  try {
    await storeInTabularium(record);
  } catch (err) {
    console.error('Tabularium store failed:', err.message);
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, request_id: id, cloudinary_urls: cloudinaryUrls })
  };
};
