# MD Redirect Map — Phase C Documentation

**Status:** Phase 1 of 2  
**Rule:** Canonical MD URL = `/page.md` (not `/page/index.md`)  
**Worker (Phase 2):** Will implement 301 redirects + HTTP Link headers in one pass. Do NOT build during Phase 1.  
**Phase 1 scope:** Document redirect map; enforce no new `/page/index.md` files; leave existing duplicates in place.

---

## Redirect Map (Phase 2 Worker will implement these 301s)

| From (secondary, to redirect) | To (canonical MD) |
|-------------------------------|-------------------|
| `https://tribuneinc.com/about/index.md` | `https://tribuneinc.com/about.md` |
| `https://tribuneinc.com/builds/index.md` | `https://tribuneinc.com/builds.md` |
| `https://tribuneinc.com/builds/the-recovery-agent/index.md` | `https://tribuneinc.com/builds/the-recovery-agent.md` |
| `https://tribuneinc.com/builds/the-intake-agent/index.md` | `https://tribuneinc.com/builds/the-intake-agent.md` |
| `https://tribuneinc.com/builds/the-signal-agent/index.md` | `https://tribuneinc.com/builds/the-signal-agent.md` |
| `https://tribuneinc.com/builds/the-ledger-agent/index.md` | `https://tribuneinc.com/builds/the-ledger-agent.md` |
| `https://tribuneinc.com/builds/the-sentinel/index.md` | `https://tribuneinc.com/builds/the-sentinel.md` |
| `https://tribuneinc.com/builds/the-producer/index.md` | `https://tribuneinc.com/builds/the-producer.md` |
| `https://tribuneinc.com/builds/the-sales-agent/index.md` | `https://tribuneinc.com/builds/the-sales-agent.md` |
| `https://tribuneinc.com/builds/the-marketing-agent/index.md` | `https://tribuneinc.com/builds/the-marketing-agent.md` |
| `https://tribuneinc.com/details/method/index.md` | `https://tribuneinc.com/details/method.md` |
| `https://tribuneinc.com/details/proof/index.md` | `https://tribuneinc.com/details/proof.md` |
| `https://tribuneinc.com/details/purpose/index.md` | `https://tribuneinc.com/details/purpose.md` |
| `https://tribuneinc.com/details/trust/index.md` | `https://tribuneinc.com/details/trust.md` |
| `https://tribuneinc.com/details/faq/index.md` | `https://tribuneinc.com/details/faq.md` |
| `https://tribuneinc.com/functions/index.md` | `https://tribuneinc.com/functions.md` |
| `https://tribuneinc.com/legal/index.md` | `https://tribuneinc.com/legal.md` |
| `https://tribuneinc.com/reach-out/index.md` | `https://tribuneinc.com/reach-out.md` |
| `https://tribuneinc.com/us/west-palm-beach/index.md` | `https://tribuneinc.com/us/west-palm-beach.md` |
| `https://tribuneinc.com/index.md` | `https://tribuneinc.com/index.md` *(root — already canonical)* |

**Total:** 19 redirects to implement in Phase 2 Worker.

---

## Canonical MD File Inventory (all exist as of 2026-07-17)

| Page | Canonical MD |
|------|-------------|
| Homepage | `/index.md` |
| About | `/about.md` |
| Functions | `/functions.md` |
| Builds index | `/builds.md` |
| The Recovery Agent | `/builds/the-recovery-agent.md` |
| The Intake Agent | `/builds/the-intake-agent.md` |
| The Signal Agent | `/builds/the-signal-agent.md` |
| The Ledger Agent | `/builds/the-ledger-agent.md` |
| The Sentinel | `/builds/the-sentinel.md` |
| The Producer | `/builds/the-producer.md` |
| The Sales Agent | `/builds/the-sales-agent.md` |
| The Marketing Agent | `/builds/the-marketing-agent.md` |
| Orthotics & Prosthetics | `/orthotics-and-prosthetics.md` |
| Behavioral Health | `/behavioral-health.md` |
| Red Discovery | `/red.md` |
| Industries (NEW — Phase E) | `/industries.md` *(to be created)* |
| Details: Method | `/details/method.md` |
| Details: Proof | `/details/proof.md` |
| Details: Purpose | `/details/purpose.md` |
| Details: Trust | `/details/trust.md` |
| Details: FAQ | `/details/faq.md` |
| Reach Out | `/reach-out.md` |
| Legal | `/legal.md` |
| West Palm Beach | `/us/west-palm-beach.md` |
| Tribune OS | *(no MD mirror — placeholder page, noindexed)* |

---

## Phase 1 Rules (Effective Immediately)

1. **Never create `/page/index.md` as a new file.** All new MD mirrors go to `/page.md`.
2. **Never link to `/page/index.md` in any HTML or MD content.** Always link to `/page.md`.
3. Existing `*/index.md` files remain in place until Phase 2 Worker implements 301s.
4. `URL-MAP.md` updated to reflect canonical MD pattern.

---

## Phase 2 Notes (Future Worker)

The Cloudflare Worker will:
- 301 redirect all `/page/index.md` → `/page.md`
- Add `Link: <https://tribuneinc.com/path/>; rel="canonical"` HTTP header to all `.md` responses
- Handle in same Worker that manages `/op/`, `/bh/`, `/os/` aliases
- Deploy as single atomic change with full redirect + header pass

*Authored: 2026-07-17 Praecon*
