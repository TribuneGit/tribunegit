'use strict';
const crypto = require('crypto');

// HS256 JWT helpers
function signJWT(payload, secret) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body   = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig    = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const password    = String(body.password || '');
  const correctPw   = process.env.BCH_PORTAL_PASSWORD || '';
  const jwtSecret   = process.env.BCH_PORTAL_JWT_SECRET || '';

  // Constant-time comparison
  let match = false;
  try {
    const a = Buffer.from(password.padEnd(Math.max(password.length, correctPw.length)));
    const b = Buffer.from(correctPw.padEnd(Math.max(password.length, correctPw.length)));
    match = crypto.timingSafeEqual(a, b) && password.length === correctPw.length;
  } catch {
    match = false;
  }

  if (!match) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid password' })
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = { iat: now, exp: now + 86400, sub: 'bch_portal' };
  const token = signJWT(payload, jwtSecret);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, expires_in: 86400 })
  };
};
