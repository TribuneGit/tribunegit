# tribuneinc.com — Full URL Map

**Repo:** TribuneGit/tribunegit · **Host:** Cloudflare Workers (static assets)  
**Pattern:** Every canonical page lives at `/path/` (folder with `index.html`). Most pages have two MD mirrors: one at the root level (`/path.md`) and one inside the folder (`/path/index.md`). Both serve identical content — the root-level `.md` is the primary AI-readable mirror; the `index.md` is the secondary in-folder copy.

---

## Logic

| Type | Example | Purpose |
|------|---------|---------|
| Canonical page | `tribuneinc.com/behavioral-health/` | Live HTML page, indexed by Google |
| Root MD mirror | `tribuneinc.com/behavioral-health.md` | AI/LLM readable plain-text mirror, served directly from repo root |
| Folder MD mirror | `tribuneinc.com/behavioral-health/index.md` | Secondary in-folder MD copy, same content |
| Redirect alias | `tribuneinc.com/bh/` | Short URL, meta-refresh to canonical (not indexed) |
| Special files | `robots.txt`, `sitemap.xml` | Crawler control and index |

---

## Special Files

```
https://tribuneinc.com/robots.txt        — allows all crawlers, no disallow rules
https://tribuneinc.com/sitemap.xml       — canonical URLs only (no aliases, no .md)
https://tribuneinc.com/404.html          — custom 404 error page
```

---

## Core Pages

```
https://tribuneinc.com/                          — Homepage: what Tribune is + all 8 builds + CTA
https://tribuneinc.com/index.md                  — Homepage MD mirror

https://tribuneinc.com/about/                    — About: founders, mission, company background
https://tribuneinc.com/about.md                  — About root MD mirror
https://tribuneinc.com/about/index.md            — About folder MD mirror

https://tribuneinc.com/functions/                — Functions: 8 builds mapped to job descriptions
https://tribuneinc.com/functions.md              — Functions root MD mirror
https://tribuneinc.com/functions/index.md        — Functions folder MD mirror

https://tribuneinc.com/reach-out/                — Contact: free 30-min discovery call form
https://tribuneinc.com/reach-out.md              — Reach-out root MD mirror
https://tribuneinc.com/reach-out/index.md        — Reach-out folder MD mirror
https://tribuneinc.com/reach-out/thanks/         — Thank-you page after form submission (no MD mirror)

https://tribuneinc.com/legal/                    — Legal: terms, disclaimers
https://tribuneinc.com/legal.md                  — Legal root MD mirror
https://tribuneinc.com/legal/index.md            — Legal folder MD mirror

https://tribuneinc.com/us/west-palm-beach/       — Location page: West Palm Beach, FL
https://tribuneinc.com/us/west-palm-beach.md     — Location root MD mirror
https://tribuneinc.com/us/west-palm-beach/index.md — Location folder MD mirror
```

---

## Builds (8 agents)

```
https://tribuneinc.com/builds/                           — Builds index: all 8 agents listed
https://tribuneinc.com/builds.md                         — Builds root MD mirror
https://tribuneinc.com/builds/index.md                   — Builds folder MD mirror

https://tribuneinc.com/builds/the-recovery-agent/        — Recover denied/unpaid revenue
https://tribuneinc.com/builds/the-recovery-agent.md      — Root MD mirror
https://tribuneinc.com/builds/the-recovery-agent/index.md — Folder MD mirror

https://tribuneinc.com/builds/the-intake-agent/          — Handle incoming paperwork/referrals
https://tribuneinc.com/builds/the-intake-agent.md        — Root MD mirror
https://tribuneinc.com/builds/the-intake-agent/index.md  — Folder MD mirror

https://tribuneinc.com/builds/the-signal-agent/          — Watch accounts, brief on signals
https://tribuneinc.com/builds/the-signal-agent.md        — Root MD mirror
https://tribuneinc.com/builds/the-signal-agent/index.md  — Folder MD mirror

https://tribuneinc.com/builds/the-ledger-agent/          — Bookkeeping and reconciliation
https://tribuneinc.com/builds/the-ledger-agent.md        — Root MD mirror
https://tribuneinc.com/builds/the-ledger-agent/index.md  — Folder MD mirror

https://tribuneinc.com/builds/the-sentinel/              — Guard deadlines, licenses, renewals
https://tribuneinc.com/builds/the-sentinel.md            — Root MD mirror
https://tribuneinc.com/builds/the-sentinel/index.md      — Folder MD mirror

https://tribuneinc.com/builds/the-producer/              — Assemble recurring reports/deliverables
https://tribuneinc.com/builds/the-producer.md            — Root MD mirror
https://tribuneinc.com/builds/the-producer/index.md      — Folder MD mirror

https://tribuneinc.com/builds/the-sales-agent/           — Keep pipeline moving, follow-ups
https://tribuneinc.com/builds/the-sales-agent.md         — Root MD mirror
https://tribuneinc.com/builds/the-sales-agent/index.md   — Folder MD mirror

https://tribuneinc.com/builds/the-marketing-agent/       — Content, social, email, PR
https://tribuneinc.com/builds/the-marketing-agent.md     — Root MD mirror
https://tribuneinc.com/builds/the-marketing-agent/index.md — Folder MD mirror
```

---

## Industries

```
https://tribuneinc.com/orthotics-and-prosthetics/        — O&P vertical: denial recovery focus
https://tribuneinc.com/orthotics-and-prosthetics.md      — O&P root MD mirror (canonical)

https://tribuneinc.com/behavioral-health/                — BH vertical: auth + denial + parity law
https://tribuneinc.com/behavioral-health.md              — BH root MD mirror

https://tribuneinc.com/red/                              — Red Discovery: personalized overview for Red Nucleus contact
https://tribuneinc.com/red.md                            — Red MD mirror
```

---

## Details

```
https://tribuneinc.com/details/method/                   — How Tribune builds (methodology)
https://tribuneinc.com/details/method.md                 — Method root MD mirror
https://tribuneinc.com/details/method/index.md           — Method folder MD mirror

https://tribuneinc.com/details/proof/                    — Proof: market validation, data points
https://tribuneinc.com/details/proof.md                  — Proof root MD mirror
https://tribuneinc.com/details/proof/index.md            — Proof folder MD mirror

https://tribuneinc.com/details/purpose/                  — Doctrine: Light, Soul & Purpose
https://tribuneinc.com/details/purpose.md                — Purpose root MD mirror
https://tribuneinc.com/details/purpose/index.md          — Purpose folder MD mirror

https://tribuneinc.com/details/trust/                    — Trust & compliance (HIPAA, 42 CFR Part 2, data)
https://tribuneinc.com/details/trust.md                  — Trust root MD mirror
https://tribuneinc.com/details/trust/index.md            — Trust folder MD mirror

https://tribuneinc.com/details/faq/                      — FAQ
https://tribuneinc.com/details/faq.md                    — FAQ root MD mirror
https://tribuneinc.com/details/faq/index.md              — FAQ folder MD mirror
```

---

## Redirect Aliases (short URLs, not indexed)

```
https://tribuneinc.com/op/    — meta-refresh → /orthotics-and-prosthetics/
https://tribuneinc.com/bh/    — meta-refresh → /behavioral-health/
https://tribuneinc.com/os/    — meta-refresh → /tribune-os/
```

---

## Reserved Placeholders

```
https://tribuneinc.com/tribune-os/   — Tribune OS placeholder page (not yet live/content TBD)
```

---

## Notes

- **op.md** (`tribuneinc.com/op.md`) exists at repo root as a legacy file alongside the canonical `orthotics-and-prosthetics.md`. Both are accessible; canonical is `/orthotics-and-prosthetics.md`.
- **No www** — apex domain only (`tribuneinc.com`, not `www.tribuneinc.com`).
- **Canonical rule** — every page's `<link rel=canonical>`, `og:url`, and JSON-LD `url` points to `https://tribuneinc.com/path/`. Never `tribuneos.com` (old mistake, now fixed).
- **MD mirrors** — kept in sync manually. HTML is source of truth; MD is updated when HTML changes.
- **Cloudflare deployment** — push to `main` branch → auto-deploy within ~60s.
