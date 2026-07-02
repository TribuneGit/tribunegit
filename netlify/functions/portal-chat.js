'use strict';
const crypto = require('crypto');
const https  = require('https');

// ----------------------------------------------------------------
// LOCKED MODEL — DO NOT CHANGE, DO NOT ENV-VAR, DO NOT DOWNGRADE
// This model classifies [PROVIDER NAME]'s requests and generates implementation
// notes that the Praecon executes directly on the live website.
// A weaker model = wrong classification = unwanted site changes.
// claude-sonnet-4-6 is the MINIMUM acceptable model for this function.
// ----------------------------------------------------------------
const PORTAL_MODEL = 'claude-sonnet-4-6';

// ----------------------------------------------------------------
// JWT helpers (HS256, no external deps)
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
// HTTPS helpers (GET / POST / PATCH — no external deps)
// ----------------------------------------------------------------
function httpsRequest(method, url, body, headers) {
  return new Promise((resolve, reject) => {
    const u    = new URL(url);
    const data = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const opts = {
      hostname: u.hostname,
      path:     u.pathname + u.search,
      method,
      headers: {
        ...(data ? {
          'Content-Type':   'application/json',
          'Content-Length': Buffer.byteLength(data)
        } : {}),
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

const httpsPost  = (url, body, hdrs) => httpsRequest('POST',  url, body, hdrs);
const httpsGet   = (url, hdrs)       => httpsRequest('GET',   url, null, hdrs);
const httpsPatch = (url, body, hdrs) => httpsRequest('PATCH', url, body, hdrs);

// ----------------------------------------------------------------
// Tabularium helpers
// ----------------------------------------------------------------
function tabHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    'apikey':        key,
    'Authorization': 'Bearer ' + key,
    'Content-Type':  'application/json'
  };
}

async function storeInTabularium(record) {
  const url = `${process.env.SUPABASE_TABULARIUM_URL}/rest/v1/tabularium_files`;
  return httpsPost(url, {
    path:        record.path,
    content:     JSON.stringify(record),
    checksum:    record.id,
    version:     1,
    instance_id: 'bch-portal',
    category:    'bch_portal'
  }, { ...tabHeaders(), 'Prefer': 'return=minimal' });
}

// Fetch all pending / held_for_jeff requests from Tabularium for this portal instance.
async function fetchPendingRequests() {
  const url = `${process.env.SUPABASE_TABULARIUM_URL}/rest/v1/tabularium_files` +
    `?instance_id=eq.bch-portal&category=eq.bch_portal&select=checksum,content`;
  try {
    const res = await httpsGet(url, { ...tabHeaders(), 'Accept': 'application/json' });
    if (res.status !== 200) return [];
    return JSON.parse(res.body)
      .map(r => { try { return JSON.parse(r.content); } catch { return null; } })
      .filter(r => r && (r.status === 'pending' || r.status === 'held_for_jeff'));
  } catch (err) {
    console.error('fetchPendingRequests error:', err.message);
    return [];
  }
}

// Patch a list of records to a new status in Tabularium.
async function updateRequestsStatus(ids, status) {
  const baseUrl = `${process.env.SUPABASE_TABULARIUM_URL}/rest/v1/tabularium_files`;
  await Promise.allSettled(ids.map(async id => {
    try {
      const getRes = await httpsGet(
        `${baseUrl}?checksum=eq.${id}&select=content`,
        { ...tabHeaders(), 'Accept': 'application/json' }
      );
      if (getRes.status !== 200) return;
      const rows = JSON.parse(getRes.body);
      if (!rows.length) return;
      const record = JSON.parse(rows[0].content);
      record.status     = status;
      record.updated_at = new Date().toISOString();
      await httpsPatch(
        `${baseUrl}?checksum=eq.${id}`,
        { content: JSON.stringify(record) },
        { ...tabHeaders(), 'Prefer': 'return=minimal' }
      );
    } catch (err) {
      console.error(`updateRequestsStatus(${id}) error:`, err.message);
    }
  }));
}

// ----------------------------------------------------------------
// Telegram notify — two modes
// ----------------------------------------------------------------

// Approval mode: major design change — Jeff must act.
async function notifyTelegramApproval(message, requestId) {
  const BOT_TOKEN    = process.env.TELEGRAM_BOT_TOKEN;
  const JEFF_CHAT_ID = process.env.TELEGRAM_JEFF_CHAT_ID || '749925523';
  try {
    await httpsPost(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id:    JEFF_CHAT_ID,
        text:       `🏥 *[COMPANY] Portal — Major Design Request*\n\n[PROVIDER NAME] asked:\n"${message.slice(0, 200)}"\n\nRequest ID: ${requestId}\n\nReply here to approve or decline.`,
        parse_mode: 'Markdown'
      },
      {}
    );
  } catch (err) {
    console.error('Telegram approval notify failed:', err.message);
  }
}

// FYI mode: minor changes auto-deployed — no action needed from Jeff.
async function notifyTelegramFYI(descriptions) {
  const BOT_TOKEN    = process.env.TELEGRAM_BOT_TOKEN;
  const JEFF_CHAT_ID = process.env.TELEGRAM_JEFF_CHAT_ID || '749925523';
  const count = descriptions.length;
  const list  = descriptions.map(d => `• ${String(d).slice(0, 120)}`).join('\n');
  try {
    await httpsPost(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: JEFF_CHAT_ID,
        text:    `🏥 [COMPANY] Portal — [PROVIDER NAME] deployed ${count} change${count !== 1 ? 's' : ''} (automatic)\n\n${list}\n\nNo action needed.`,
        parse_mode: 'Markdown'
      },
      {}
    );
  } catch (err) {
    console.error('Telegram FYI notify failed:', err.message);
  }
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function isMinorClassification(c) {
  return c === 'minor_content' || c === 'minor_layout';
}

// Detect "implement / go ahead / deploy / apply / proceed" intent from [PROVIDER NAME].
function isImplementIntent(msg) {
  return /\bimplement\b/i.test(msg);
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
  const token      = authHeader.replace(/^Bearer\s+/i, '');
  const jwtSecret  = process.env.BCH_PORTAL_JWT_SECRET || '';
  if (!token || !verifyJWT(token, jwtSecret)) {
    return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const message      = String(body.message || '').trim();
  const conversation = Array.isArray(body.conversation) ? body.conversation : [];

  if (!message) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Message required' }) };
  }
  if (message.length > 500) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Message too long (max 500 chars)' }) };
  }

  // ----------------------------------------------------------------
  // "Implement" intent — check the Tabularium queue and batch-deploy.
  // This runs BEFORE the OpenAI call so we can short-circuit when the
  // queue has actionable items and [PROVIDER NAME] is explicitly asking to deploy.
  // ----------------------------------------------------------------
  if (isImplementIntent(message)) {
    const pending = await fetchPendingRequests();

    if (pending.length > 0) {
      const minorPending = pending.filter(r => isMinorClassification(r.classification) && r.status === 'pending');
      const majorPending = pending.filter(r => r.status === 'held_for_jeff');

      // Auto-deploy all queued minor changes
      if (minorPending.length > 0) {
        await updateRequestsStatus(minorPending.map(r => r.id), 'deploying');
      }

      let queueReply;
      if (minorPending.length > 0) {
        queueReply = `Deploying ${minorPending.length} change${minorPending.length !== 1 ? 's' : ''} now! 🚀 Changes may take up to 1 hour to appear on the site. If a change hasn't been implemented after 2 hours, please reach out to Jeff. If you let Jeff know when you're working on the website, he can adjust the update rate and you'll see changes faster.`;
      } else if (majorPending.length > 0) {
        queueReply = `That structural change is still pending review — you'll hear back once it's been approved.`;
      }

      if (queueReply) {
        return {
          statusCode: 200,
          headers:    { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reply:          queueReply,
            queued:         minorPending.length > 0,
            deploying:      minorPending.length > 0,
            classification: 'implement_batch'
          })
        };
      }
    }
    // No pending items — fall through to OpenAI so it can respond naturally.
  }

  // ----------------------------------------------------------------
  // Anthropic chat
  // ----------------------------------------------------------------
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  const systemPrompt = `You are the [COMPANY NAME] Website Assistant — a concierge AI that helps [PROVIDER NAME] manage their website at [DOMAIN].

The site also has staging URLs: [STAGING URL] and [DOMAIN] — these are ALL the same site.

Your ONLY job is to help with website content updates, image swaps, text edits, and layout refinements for [COMPANY NAME].

STRICT RULES:
1. out_of_scope means ONLY requests completely unrelated to their website — coding help, general knowledge, recipes, other businesses, etc. Do NOT use out_of_scope for website requests.
2. Never answer coding questions, general knowledge, or anything unrelated to their website.
3. If unclear which page or section: ask ONE clarifying question.
4. You must classify every user message at the END of your JSON response.

CLASSIFICATION RULES — use these strictly:
- minor_content: ANY text change, copy edits, bio updates, [FAQ] changes, image swaps, logo swaps, heading/subheading text, contact details, phone numbers, prices — always auto-implement
- minor_layout: colors (any element, any page), font sizes/weights, spacing, padding, borders, background colors, element visibility, button text (not placement), icon changes — always auto-implement
- major_design: removing entire sections, reordering/moving sections, adding new pages, changing navigation structure, changing button placement or hierarchy, redesigning page layouts — these need approval, tell [PROVIDER NAME]: "That one's a bigger structural change — I've flagged it for Jeff to review!"
- out_of_scope: ONLY requests completely unrelated to their website (e.g. "write me a poem", "what's the weather", "help me with Excel")
- clarifying: you genuinely need more info — use sparingly

GOLDEN RULE: Color = minor. Text = minor. Image = minor. Only use major_design when something structural is being moved, removed, or added to the page skeleton.

NAV LINK COLOR SYSTEM — critical for correct implementation_notes:
The site header = the navigation bar at the top of every page (logo + menu links). It is NOT a hero or banner section.
The nav uses CSS classes to show page status. No class = black (approved). ready-review = green. no-content = red.
When [PROVIDER NAME] asks to change a nav link color: interpret the direction LITERALLY. 'Change to black' = make it black. 'Change to green' = make it green. Never reverse or second-guess the direction.
When [PROVIDER NAME] asks to change a nav link TO BLACK: the fix is REMOVING the ready-review/no-content class.
Correct implementation_notes for nav-to-black: "Remove ready-review class from [link text] in partials/nav.html, then sed all .html files: find . -name '*.html' -not -path './.git/*' | xargs sed -i 's/class=\"mega-slink ready-review\" href=\"/services/X.html\"/class=\"mega-slink\" href=\"/services/X.html\"/g' and mobile nav equivalent"

When [PROVIDER NAME] says she's done or asks to deploy, remind her: 'Just type **Implement** when you\'re ready and I\'ll deploy everything at once. Batching changes saves on build costs and keeps the site stable.'

Always respond in this exact JSON format — raw JSON only, no markdown fences, no code blocks, no surrounding text:
{
  "reply": "your conversational reply to [PROVIDER NAME]",
  "classification": "minor_content|minor_layout|major_design|out_of_scope|clarifying",
  "ready_to_implement": true|false,
  "implementation_notes": "brief notes for the Praecon if ready_to_implement is true, else null"
}`;

  let aiRaw, aiParsed;
  try {
    const aiRes = await httpsPost(
      'https://api.anthropic.com/v1/messages',
      {
        model:      PORTAL_MODEL, // locked — see top of file
        max_tokens: 1024,
        system:     systemPrompt,
        messages:   [...conversation.slice(-18), { role: 'user', content: message }]
      },
      {
        'x-api-key':         ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      }
    );
    const aiBody = JSON.parse(aiRes.body);
    aiRaw = aiBody.content?.[0]?.text || '';
  } catch (err) {
    console.error('Anthropic error:', err.message);
    return {
      statusCode: 200,
      headers:    { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: "I'm having trouble connecting right now. Please try again in a moment.", queued: false })
    };
  }

  // Parse AI JSON — robust extraction: find first { to last } regardless of fences or surrounding text
  try {
    const start = aiRaw.indexOf('{');
    const end   = aiRaw.lastIndexOf('}');
    if (start === -1 || end === -1 || end < start) throw new Error('no json block found');
    aiParsed = JSON.parse(aiRaw.slice(start, end + 1));
  } catch {
    // Genuine parse failure — show a friendly recovery message, never raw model output
    aiParsed = { reply: "Sorry, I had a hiccup processing that. Could you rephrase or try again?", classification: 'clarifying', ready_to_implement: false, implementation_notes: null };
  }

  const aiReply             = String(aiParsed.reply || 'I did not understand that. Could you rephrase?');
  const classification      = String(aiParsed.classification || 'clarifying');
  const readyToImplement    = Boolean(aiParsed.ready_to_implement);
  const implementationNotes = aiParsed.implementation_notes || null;

  let queued     = false;
  let deploying  = false;
  let finalReply = aiReply;

  // ----------------------------------------------------------------
  // Routing logic
  // ----------------------------------------------------------------
  if (classification === 'out_of_scope' || classification === 'clarifying') {
    // Do NOT store — just reply.

  } else if (classification === 'major_design') {
    // Hold for Jeff approval + notify (approval required).
    const id   = crypto.randomUUID();
    const path = `bch_portal/requests/${id}.json`;
    const record = {
      id, path, status: 'held_for_jeff', classification,
      description: message,
      conversation: [...conversation, { role: 'user', content: message }, { role: 'assistant', content: aiReply }],
      implementation_notes: implementationNotes,
      created_at:    new Date().toISOString(),
      updated_at:    new Date().toISOString(),
      jeff_notified: true, praecon_session: null, praecon_result: null
    };
    await storeInTabularium(record);
    await notifyTelegramApproval(message, id);
    queued = true;

  } else if (isMinorClassification(classification) && readyToImplement) {
    // Minor change — auto-deploy immediately, FYI to Jeff (no approval needed).
    const id   = crypto.randomUUID();
    const path = `bch_portal/requests/${id}.json`;
    const record = {
      id, path, status: 'pending', classification,
      description: message,
      conversation: [...conversation, { role: 'user', content: message }, { role: 'assistant', content: aiReply }],
      implementation_notes: implementationNotes,
      created_at:    new Date().toISOString(),
      updated_at:    new Date().toISOString(),
      jeff_notified: false, praecon_session: null, praecon_result: null
    };
    await storeInTabularium(record);
    queued     = true;
    deploying  = true;
    finalReply = "Got it — queued! ✅ Anything else to update? Type **Implement** when you're ready and I'll deploy everything at once.";

  } else if (readyToImplement) {
    // Fallback: non-minor classification with ready_to_implement — queue as pending.
    const id   = crypto.randomUUID();
    const path = `bch_portal/requests/${id}.json`;
    const record = {
      id, path, status: 'pending', classification,
      description: message,
      conversation: [...conversation, { role: 'user', content: message }, { role: 'assistant', content: aiReply }],
      implementation_notes: implementationNotes,
      created_at:    new Date().toISOString(),
      updated_at:    new Date().toISOString(),
      jeff_notified: false, praecon_session: null, praecon_result: null
    };
    await storeInTabularium(record);
    queued = true;
  }

  return {
    statusCode: 200,
    headers:    { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reply: finalReply, queued, deploying, classification })
  };
};
