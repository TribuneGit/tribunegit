/**
 * Tribune Inc. Cloudflare Worker
 * Handles: 301 redirects, HTTP Link headers (agent discovery),
 *          Markdown content-type + X-Robots-Tag, www → apex redirect,
 *          server-side password gates for /techstack/ and /partnership/
 */

// Alias → canonical 301 redirects
const REDIRECTS = new Map([
  ["/op/",  "https://tribuneinc.com/orthotics-and-prosthetics/"],
  ["/bh/",  "https://tribuneinc.com/behavioral-health/"],
  ["/os/",  "https://tribuneinc.com/tribune-os/"],
]);

// www → apex
const WWW_REDIRECT = "https://tribuneinc.com";

// HTML page → root-level .md mirror map
const MARKDOWN_MAP = new Map([
  ["/",                                    "/index.md"],
  ["/about/",                              "/about.md"],
  ["/functions/",                          "/functions.md"],
  ["/builds/",                             "/builds.md"],
  ["/builds/the-recovery-agent/",          "/builds/the-recovery-agent.md"],
  ["/builds/the-intake-agent/",            "/builds/the-intake-agent.md"],
  ["/builds/the-signal-agent/",            "/builds/the-signal-agent.md"],
  ["/builds/the-ledger-agent/",            "/builds/the-ledger-agent.md"],
  ["/builds/the-sentinel/",               "/builds/the-sentinel.md"],
  ["/builds/the-producer/",               "/builds/the-producer.md"],
  ["/builds/the-sales-agent/",            "/builds/the-sales-agent.md"],
  ["/builds/the-marketing-agent/",        "/builds/the-marketing-agent.md"],
  ["/orthotics-and-prosthetics/",          "/orthotics-and-prosthetics.md"],
  ["/behavioral-health/",                  "/behavioral-health.md"],
  ["/industries/",                         "/industries.md"],
  ["/red/",                                "/red.md"],
  ["/tribune-os/",                         null], // placeholder — no md mirror
  ["/details/method/",                     "/details/method.md"],
  ["/details/proof/",                      "/details/proof.md"],
  ["/details/purpose/",                    "/details/purpose.md"],
  ["/details/trust/",                      "/details/trust.md"],
  ["/details/faq/",                        "/details/faq.md"],
  ["/reach-out/",                          "/reach-out.md"],
  ["/legal/",                              "/legal.md"],
  ["/us/west-palm-beach/",                 "/us/west-palm-beach.md"],
]);

// /page/index.md → /page.md permanent redirects (Phase C)
function getMdRedirect(pathname) {
  if (!pathname.endsWith("/index.md")) return null;
  const base = pathname.slice(0, -"index.md".length); // e.g. /about/
  const rootMd = base.slice(0, -1) + ".md";           // e.g. /about.md
  // Only redirect if there's a known root .md (avoid redirecting unknown paths)
  for (const [, md] of MARKDOWN_MAP) {
    if (md === rootMd) return rootMd;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Password gate(s) — /techstack/ and /partnership/
// Server-side, edge-enforced. Content is never returned to the client
// unless a valid signed session cookie is present. Password itself is
// never sent in cleartext over a GET; it is submitted via POST from the
// gate form and never stored — only a time-windowed HMAC token is issued.
//
// Each gate is defined by a config object below. Every gate has its own
// password, HMAC secret, and cookie name, so they are fully independent —
// a leaked/rotated secret or cookie for one gate has zero effect on the
// other.
// ---------------------------------------------------------------------------
const GATE_TTL_DAYS = 7;

const GATE_TECHSTACK = {
  pathPrefix: "/techstack",
  password: "Make!MoreMoney26",
  secret: "tribune-techstack-gate-v1-9f3a7c2e5b",
  cookie: "__Secure-tt_gate",
  cookiePath: "/techstack",
  formAction: "/techstack/",
  heading: "Tribune Trading AI — Technical Overview",
  subtext: "This document is restricted to invited reviewers. Enter the access password to continue.",
};

const GATE_PARTNERSHIP = {
  pathPrefix: "/partnership",
  password: "Make!MoreMoney26",
  secret: "tribune-partnership-gate-v1-8k2m4p9x1q",
  cookie: "__Secure-tt_partner_gate",
  cookiePath: "/partnership",
  formAction: "/partnership/",
  heading: "Partnership — Restricted Access",
  subtext: "This document is restricted to invited reviewers. Enter the access password to continue.",
};

const GATE_MILESTONE = {
  pathPrefix: "/milestone",
  password: "Make!MoreMoney26",
  secret: "tribune-milestone-gate-v1-3r6t9y2u5i",
  cookie: "__Secure-tt_milestone_gate",
  cookiePath: "/milestone",
  formAction: "/milestone/",
  heading: "Development Roadmap — Restricted Access",
  subtext: "This document is restricted to invited reviewers. Enter the access password to continue.",
};

const GATES = [GATE_TECHSTACK, GATE_PARTNERSHIP, GATE_MILESTONE];

function currentWeekNumber() {
  // Rotates the valid token weekly so a leaked cookie expires on its own.
  return Math.floor(Date.now() / (GATE_TTL_DAYS * 24 * 60 * 60 * 1000));
}

async function hmacSign(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function issueGateToken(gate) {
  const week = currentWeekNumber();
  const sig = await hmacSign(`${gate.pathPrefix}:${week}`, gate.secret);
  return `${week}.${sig}`;
}

async function verifyGateToken(gate, token) {
  if (!token || !token.includes(".")) return false;
  const [weekStr, sig] = token.split(".");
  const week = Number(weekStr);
  if (!Number.isFinite(week)) return false;
  // accept current or previous week (grace period across the rotation boundary)
  for (const w of [currentWeekNumber(), currentWeekNumber() - 1]) {
    if (w !== week) continue;
    const expected = await hmacSign(`${gate.pathPrefix}:${w}`, gate.secret);
    if (timingSafeEqual(expected, sig)) return true;
  }
  return false;
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function gatePage(gate, { error } = {}) {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Restricted — Tribune Inc.</title>
<meta name="robots" content="noindex, nofollow">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--daylight:#FFFFFF;--marble:#EFEBE2;--obsidian:#0A0B12;--basalt:#16141F;--ash:#8C8896;
--tyrian:#7A1A5C;--tyrian-deep:#4E0E3C;--line:rgba(10,11,18,.12);--line-strong:rgba(10,11,18,.24);
--radius:10px;--display:'Archivo',sans-serif;--body:'Inter',sans-serif;--mono:'JetBrains Mono',monospace;}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--obsidian);color:var(--marble);font-family:var(--body);min-height:100vh;
display:flex;align-items:center;justify-content:center;padding:24px}
.card{max-width:420px;width:100%;background:var(--daylight);color:var(--basalt);border-radius:16px;
padding:44px 38px;box-shadow:0 30px 80px -30px rgba(0,0,0,.6)}
.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.28em;text-transform:uppercase;
color:var(--ash);border-left:3px solid var(--tyrian);padding-left:10px;margin-bottom:18px;display:inline-block}
h1{font-family:var(--display);font-weight:800;font-size:22px;color:var(--obsidian);margin-bottom:10px}
p.sub{font-size:14px;color:var(--ash);margin-bottom:26px;line-height:1.5}
label{display:block;font-family:var(--display);font-weight:600;font-size:13px;color:var(--obsidian);margin-bottom:8px}
input[type=password]{width:100%;font-size:16px;padding:12px 14px;border:1px solid var(--line-strong);
border-radius:8px;background:#fff;color:var(--basalt);margin-bottom:16px}
button{width:100%;font-family:var(--display);font-weight:700;font-size:15px;padding:13px;
border:none;border-radius:8px;background:var(--tyrian);color:var(--marble);cursor:pointer}
button:hover{background:var(--tyrian-deep)}
.err{background:#FBEAEA;border:1px solid #E24B4A;color:#9A2323;font-size:13px;padding:10px 12px;
border-radius:8px;margin-bottom:16px}
</style></head>
<body>
<div class="card">
  <span class="eyebrow">Confidential</span>
  <h1>${gate.heading}</h1>
  <p class="sub">${gate.subtext}</p>
  ${error ? '<div class="err">Incorrect password. Try again.</div>' : ''}
  <form method="POST" action="${gate.formAction}">
    <label for="pw">Password</label>
    <input type="password" id="pw" name="password" autofocus required>
    <button type="submit">Enter</button>
  </form>
</div>
</body></html>`;
}

async function handleGate(gate, request, url) {
  // POST = password submission
  if (request.method === "POST") {
    const form = await request.formData();
    const submitted = (form.get("password") || "").toString();
    if (timingSafeEqual(submitted, gate.password)) {
      const token = await issueGateToken(gate);
      const headers = new Headers({ "Location": url.pathname, "Content-Type": "text/plain" });
      headers.append(
        "Set-Cookie",
        `${gate.cookie}=${encodeURIComponent(token)}; Path=${gate.cookiePath}; HttpOnly; Secure; SameSite=Lax; Max-Age=${GATE_TTL_DAYS * 24 * 60 * 60}`
      );
      headers.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
      return new Response(null, { status: 303, headers });
    }
    return new Response(gatePage(gate, { error: true }), {
      status: 401,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "private, no-store, no-cache, must-revalidate"
      }
    });
  }

  // GET = check cookie
  const token = getCookie(request, gate.cookie);
  const valid = await verifyGateToken(gate, token);
  if (valid) return null; // pass through to normal handling

  return new Response(gatePage(gate), {
    status: 401,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "private, no-store, no-cache, must-revalidate"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // -1. Force HTTPS site-wide. Browsers silently refuse to set/send
    //     __Secure-prefixed cookies (used by the /techstack gate) over
    //     plain HTTP, which otherwise causes an invisible, unexplained
    //     login loop plus a genuine "not secure" browser warning.
    if (url.protocol === "http:") {
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    // 0. Password gate for /techstack, /partnership (and any sub-paths)
    const matchedGate = GATES.find(
      (gate) => url.pathname === gate.pathPrefix || url.pathname.startsWith(gate.pathPrefix + "/")
    );
    if (matchedGate) {
      const gateResponse = await handleGate(matchedGate, request, url);
      if (gateResponse) return gateResponse;
      // else: authorized, fall through to normal asset serving below,
      // but never let the CDN or browser cache this path publicly —
      // caching ignores the auth cookie and can leak content or serve
      // a stale gate page regardless of login state.
      const assetResponse = await env.ASSETS.fetch(request);
      const headers = new Headers(assetResponse.headers);
      headers.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
      headers.set("Vary", "Cookie");
      headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
      return new Response(assetResponse.body, { status: assetResponse.status, headers });
    }

    // 1. www → apex
    if (url.hostname === "www.tribuneinc.com") {
      return Response.redirect(WWW_REDIRECT + url.pathname + url.search, 301);
    }

    // 2. Alias 301 redirects
    const redirect = REDIRECTS.get(url.pathname);
    if (redirect) {
      return Response.redirect(redirect, 301);
    }

    // 3. /page/index.md → /page.md (Phase C)
    if (url.pathname.endsWith("/index.md")) {
      const target = getMdRedirect(url.pathname);
      if (target) {
        return Response.redirect("https://" + url.hostname + target, 308);
      }
    }

    // 4. Fetch from static assets
    const response = await env.ASSETS.fetch(request);

    // 5. .md files: correct content-type + noindex
    if (url.pathname.endsWith(".md") && response.status === 200) {
      const headers = new Headers(response.headers);
      headers.set("Content-Type", "text/markdown; charset=utf-8");
      headers.set("X-Robots-Tag", "noindex, follow");
      // Canonical Link back to HTML page
      const htmlPath = url.pathname.replace(/\.md$/, "/").replace(/^\/builds\/([^/]+)\.md$/, "/builds/$1/");
      headers.set("Link", `<https://tribuneinc.com${htmlPath}>; rel="canonical"`);
      return new Response(response.body, { status: 200, headers });
    }

    // 6. HTML pages: add HTTP Link header for Markdown alternate
    if (response.status === 200) {
      const ct = response.headers.get("Content-Type") || "";
      if (ct.includes("text/html")) {
        const mdPath = MARKDOWN_MAP.get(url.pathname);
        if (mdPath) {
          const headers = new Headers(response.headers);
          const links = [
            `<https://tribuneinc.com${mdPath}>; rel="alternate"; type="text/markdown"`,
          ];
          if (url.pathname === "/") {
            links.push(`<https://tribuneinc.com/llms.txt>; rel="describedby"; type="text/plain"`);
          }
          headers.set("Link", links.join(", "));
          return new Response(response.body, { status: 200, headers });
        }
      }
    }

    return response;
  },
};
