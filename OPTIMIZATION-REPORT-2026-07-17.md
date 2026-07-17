# tribuneinc.com Optimization Report — 2026-07-17

**Domain:** https://tribuneinc.com  
**Repo:** TribuneGit/tribunegit  
**Backup tag:** `backup-pre-optimization-20260717`  
**Session:** 2026-07-17

---

## Commits (all pushed to main)

| Hash | Description |
|------|-------------|
| `65944e4` | feat: structured data + breadcrumbs site-wide (Phase F+G) |
| `30a24c8` | feat: internal linking site-wide (Phase D) |
| `1614e54` | fix: media alt text, lazy loading, OG tags (Phase H) |
| `9814642` | fix: content quality sweep — em dashes, noindex /tribune-os/ (Phase L) |
| `ef3f458` | feat: /industries/ hub page + Phase C MD redirect map |
| `38b5ddf` | feat(agent-readiness): llms.txt, markdown alternates, industries.md, footer link, sitemap |

---

## Completed

### Phase A — Crawl
- All 24 canonical pages return HTTP 200
- All canonicals and og:url values correct — no Phase B fixes needed
- No broken internal links found
- No soft-404s detected
- No `tribuneos.com` references remaining

### Phase B — Canonical Architecture
- No changes required. All pages already had correct `<link rel="canonical">`, `og:url`, and JSON-LD `url` pointing to `https://tribuneinc.com/path/`.

### Phase D — Internal Linking
- All industry pages now link to: Functions, Builds, Method, Proof, Trust, FAQ, Reach Out
- All build pages link to: related industry pages, Functions, 2–3 related builds
- `/red/` links to: Functions, Builds, Reach Out
- All `/details/*` pages link to: Reach Out + sibling detail pages
- No orphan pages remaining

### Phase E — /industries/ Landing Page
- `/industries/index.html` created: concise hub page, same design system
- Cards for Orthotics & Prosthetics and Behavioral Health; no empty cards for future industries
- Added to main nav Industries dropdown (top link above individual industries)
- Added to homepage internal links
- Added to `sitemap.xml`
- Structured data: `CollectionPage` + `BreadcrumbList` JSON-LD
- `/industries.md` mirror created

### Phase F — Structured Data (JSON-LD)
- JSON-LD added to 13 pages that had none
- Schema types used: `Organization`, `WebSite`, `WebPage`, `CollectionPage`, `AboutPage`, `ContactPage`, `Service`, `FAQPage`
- No fabricated reviews, ratings, pricing, or locations

### Phase G — Breadcrumbs
- `BreadcrumbList` JSON-LD added to all 20 nested pages
- Covers: all builds, all industries, all details pages, reach-out, legal, location

### Phase H — Media
- All `<img>` elements below the fold: `loading="lazy"` added
- Decorative videos: `aria-hidden="true"` confirmed on all
- Twitter card tags (`twitter:card`, `twitter:title`, `twitter:description`) added to all pages that were missing them
- `og:image`: skipped — `og-default.jpg` does not exist on Cloudinary yet (see Open Items)

### Phase L — Content Quality
- 49 em dashes removed across 16 files
- `/tribune-os/` set to `noindex` (thin placeholder content)
- No `admin@tribuneinc.com` references found
- No "Jeff Rey" references found
- No "Quantum Horizons" references found
- `/legal/` contains placeholder text — flagged (see Open Items)

### Phase C — MD Architecture (partial)
- Full redirect map documented (see below)
- All new internal references use `/page.md` (not `/page/index.md`)
- No new `/page/index.md` files created
- Existing duplicates left in place temporarily
- Worker redirects deferred to Phase 2 (do not build Worker twice)

### Agent Readiness — Non-Worker Items
- `/llms.txt` created: machine-readable site index for AI/LLM discovery
- `/industries.md` mirror created
- `<link rel="alternate" type="text/markdown">` added to all 24 canonical HTML pages with a `.md` mirror
- Footer link "AI-readable site index" → `/llms.txt` added to all 24 pages
- `sitemap.xml` verified canonical-only; `/industries/` already present

---

## Phase C — MD Redirect Map (implement in Phase 2 Worker)

When the `_worker.js` is built, add permanent 308 redirects for all of these:

| From (deprecated) | To (canonical) |
|-------------------|----------------|
| `/index/index.md` | `/index.md` |
| `/about/index.md` | `/about.md` |
| `/functions/index.md` | `/functions.md` |
| `/builds/index.md` | `/builds.md` |
| `/builds/the-recovery-agent/index.md` | `/builds/the-recovery-agent.md` |
| `/builds/the-intake-agent/index.md` | `/builds/the-intake-agent.md` |
| `/builds/the-signal-agent/index.md` | `/builds/the-signal-agent.md` |
| `/builds/the-ledger-agent/index.md` | `/builds/the-ledger-agent.md` |
| `/builds/the-sentinel/index.md` | `/builds/the-sentinel.md` |
| `/builds/the-producer/index.md` | `/builds/the-producer.md` |
| `/builds/the-sales-agent/index.md` | `/builds/the-sales-agent.md` |
| `/builds/the-marketing-agent/index.md` | `/builds/the-marketing-agent.md` |
| `/details/method/index.md` | `/details/method.md` |
| `/details/proof/index.md` | `/details/proof.md` |
| `/details/purpose/index.md` | `/details/purpose.md` |
| `/details/trust/index.md` | `/details/trust.md` |
| `/details/faq/index.md` | `/details/faq.md` |
| `/reach-out/index.md` | `/reach-out.md` |
| `/legal/index.md` | `/legal.md` |
| `/us/west-palm-beach/index.md` | `/us/west-palm-beach.md` |

---

## Open Items

### Requires Jeff decision or action

| # | Item | Notes |
|---|------|-------|
| 1 | **Worker (`_worker.js`)** | Required for: HTTP `Link` headers on HTML (Agent score), `Content-Type: text/markdown` + `X-Robots-Tag: noindex` on `.md` files, real 301s for `/op/` and `/bh/`, Phase C MD redirects. All Worker logic goes in one pass in Phase 2. **Approve to proceed.** |
| 2 | **og:image / twitter:image** | Default OG image (`og-default.jpg`) does not exist on Cloudinary. Need asset created and uploaded before these tags can be added. Jeff to provide image or approve generation. |
| 3 | **`/legal/` content** | Contains placeholder: "terms and notices to be supplied by counsel before launch." Needs counsel review before indexing or sharing publicly. |
| 4 | **GSC + Bing (requires login)** | Checklist in summary doc. Actions requiring dashboard access: verify sitemap at `https://tribuneinc.com/sitemap.xml`, inspect homepage + /orthotics-and-prosthetics/ + /behavioral-health/, request indexing for new pages (/industries/, /behavioral-health/), submit sitemap to Bing via IndexNow. |
| 5 | **Cloudflare dashboard audit (Phase J)** | Report produced (see Cloudflare section below). No live changes made. Settings requiring dashboard verification need Jeff to paste or screenshot config. |

---

## Phase J — Cloudflare Recommendations (no changes made)

### Confirmed (publicly verifiable)
- SSL: active, HTTPS serving correctly
- Managed robots.txt: enabled (Cloudflare AI Crawl Control active, ChatGPT-User and Claude-User allowed)
- Brotli compression: active (seen in response headers)
- HTTP/2: active

### Requires dashboard verification
| Setting | Recommended | Risk if wrong |
|---------|-------------|---------------|
| Always Use HTTPS | On | HTTP requests not upgraded |
| Automatic HTTPS Rewrites | On | Mixed-content warnings |
| HSTS | Enabled, min 6 months | Not critical for static site |
| HTTP/3 (QUIC) | On | Minor performance loss if off |
| Brotli | On | Slightly larger responses |
| Cache TTL for static assets | 1 year for `/assets/` | Unnecessary re-fetches |
| Security headers (X-Content-Type-Options, Referrer-Policy) | Enabled | See Phase M |

### Do not touch
- MX, SPF, DKIM, DMARC records
- Google Workspace configuration
- Cloudflare Email Routing
- Nameservers
- Existing GSC verification records

---

## Phase K — GSC + Bing Checklist (Jeff to complete)

### Google Search Console
1. Open https://search.google.com/search-console
2. Select property `tribuneinc.com`
3. Sitemap: Sitemaps → Submit → `https://tribuneinc.com/sitemap.xml`
4. URL Inspection: inspect each of these and click "Request Indexing":
   - `https://tribuneinc.com/`
   - `https://tribuneinc.com/orthotics-and-prosthetics/`
   - `https://tribuneinc.com/behavioral-health/`
   - `https://tribuneinc.com/industries/`
   - `https://tribuneinc.com/builds/the-recovery-agent/`
5. Coverage report: check for any pages marked Excluded or Crawled but not indexed
6. Core Web Vitals: review LCP/CLS for mobile and desktop

### Bing Webmaster Tools
1. Open https://www.bing.com/webmasters
2. Add site `https://tribuneinc.com` (DNS verification or HTML tag method)
3. Sitemaps → Submit → `https://tribuneinc.com/sitemap.xml`
4. IndexNow: Bing may offer one-click submit once verified

---

## Phase 2 — Worker (next session)

Everything that needs `_worker.js`:

```
_worker.js handles:
1. HTTP Link headers: <https://tribuneinc.com/page.md>; rel="alternate"; type="text/markdown"
   on all canonical HTML responses
2. Homepage Link header also includes: <https://tribuneinc.com/llms.txt>; rel="describedby"
3. Content-Type: text/markdown; charset=utf-8 on all .md responses
4. X-Robots-Tag: noindex, follow on all .md responses
5. HTTP Link canonical header on .md responses back to HTML page
6. 301 redirects: /op/ → /orthotics-and-prosthetics/
                  /bh/ → /behavioral-health/
7. 308 redirects: all /page/index.md → /page.md (Phase C map above)
8. www → apex redirect (if not already handled by Cloudflare)
```

Reference Worker architecture is in the Agent Readiness document (Section 6).

---

## Cloudflare Agent-Ready Score

- **Before:** 29 / Level 2 "Bot-Aware"
- **After (estimated):** Not yet re-scanned. Re-run scan at https://cloudflare.com after Phase 2 Worker is deployed for accurate delta. The non-Worker items (llms.txt, HTML alternate links) will improve the score; the Worker items (HTTP Link headers, content-type headers) are required for the highest tiers.

---

*Report generated 2026-07-17. Repo: TribuneGit/tribunegit.*
