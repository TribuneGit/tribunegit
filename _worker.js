/**
 * Tribune Inc. Cloudflare Worker
 * Handles: 301 redirects, HTTP Link headers (agent discovery),
 *          Markdown content-type + X-Robots-Tag, www → apex redirect
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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
