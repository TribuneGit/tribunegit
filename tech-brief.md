# tech-brief.md
<!-- PROTOCOL: tech-brief v1.0 | APPEND-ONLY | DO NOT EDIT EXISTING ENTRIES -->
<!-- LEDGER: tech-brief-ledger.json | CHAIN-VERIFIED -->
<!-- REPO: tribune-inc-website | CREATED: 2026-08-25T18:43:50Z | BY: praecon@openclaw -->

## Project: tribune-inc-website

| Field | Value |
|-------|-------|
| Repository | `tribune-inc-website` |
| Created | `2026-08-25T18:43:50Z` |
| Created by | `praecon@openclaw` |
| Protocol version | `1.0` |
| Entry count | (see tech-brief-ledger.json) |

---

## Audit Log


<!-- ENTRY::BEGIN::e001 -->
### [TASK] Partnership page revision v2

| Field | Value |
|-------|-------|
| Entry ID | `e001` |
| Timestamp | `2026-08-25T18:43:50Z` |
| Author | `praecon@openclaw` |
| Session | `manual` |
| Hash | `sha256:ed73c475be2c57fad5c2441dfe6b848d57e0040ec23a95bd0165ad53adb4d9e2` |
| Prev Hash | `genesis` |

Layering in Stan/Ryan revision brief: reduced content ~20-30%, Month1/2/3 technical roadmap replacing generic 4-phase roadmap, em-dash removal, consolidated decision sections.
<!-- ENTRY::END::e001 -->

<!-- ENTRY::BEGIN::e002 -->
### [COMPLETE] Partnership page revision v2 complete

| Field | Value |
|-------|-------|
| Entry ID | `e002` |
| Timestamp | `2026-08-25T18:55:05Z` |
| Author | `praecon@openclaw` |
| Session | `manual` |
| Hash | `sha256:976c36c0c8f8f8639e8d2301215a755955bb685d7d35ecdf50726a75e86c394a` |
| Prev Hash | `sha256:36d744105fb40d32b46c962b2783fcd22901aaf5aa26f1e198619bd5b3518a76` |

Commit 86f9227 pushed to origin main. Edited partnership/index.html and assets/partnership.css only (left unrelated in-progress _worker.js/milestones rename in working tree untouched). Changes: (A) hero eyebrow removed, subhead shortened to 'Partnership & Development Roadmap'; (B) Two Forms of Capital intro rewritten, Stan bullet list trimmed 8->7 items; (C) Development Funding pt-sub rewritten around ~2-month core + optional 3rd month; (D) Without Dedicated Development Funding paragraph shortened; (E) Flexible Decision Components section (stack-cards + toggle-grid + evidence-line) deleted entirely; (F) Commercial Endgame renamed 'Where This Could Go', Exit card renamed 'Strategic Acquisition', endgame-note rewritten; (G) 60-90 Day Roadmap phase grid replaced with new Month 1 (See+Act: perception/execution track cards, mono-block visuals, milestone completion cards, not-yet list, id=month-1), Hands+Brain visual section, Month 2 (Understand+Decide: method comparison table+legend, restraint callout, evolution mono-blocks, example system decision visual, closed-loop milestone, id=month-2), Independent Risk Controller section (approved/blocked mono-block visuals + principle callout), Month 3 (Test+Prove: bullet list, validation ladder visual with status markers, milestone questions list, id=month-3), plus a fixed sticky month-rail nav (desktop only, IntersectionObserver-driven active state) added before closing scripts; (H) final Decisions section replaced with 3-card 'What We Need to Decide Now' (Partnership/Development/Start) + evolve-note + extended closing line. New CSS added: --violet/--violet-deep/--violet-tint tokens plus track-card, mono-block, milestone-block/complete-grid/notyet-list, bh-grid (brain+hands), method-table/legend, restraint-callout, risk-grid/risk-checks, ladder, month-rail, decision-grid.three, evolve-note, closing-follow rules -- all reusing existing card/grid/mono vocabulary. Sections I-IX (Preserve Original Agreement, Three Investments, Ownership Structure, IP Model, Territory Board, Market Principle, Right of First Opportunity, Future Tribune Inc. Alignment) left untouched. Em/en dash grep across all three files = 0/0/0. Line counts: partnership/index.html=870, assets/partnership.css=452, assets/partnership.js=123 (js untouched, no diff needed).
<!-- ENTRY::END::e002 -->
