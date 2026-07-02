# Tribune public site (static)

Built from `tribune-website-spec-2026-07-02.md` v1.1 (Brand System v2.0, Daylight adaptation).

## Deploy
1. Push this folder to a GitHub repo (the folder contents at repo root).
2. Netlify: New site from Git, no build command, publish directory = repo root.
   (Or drag-and-drop this folder in the Netlify UI.)
3. The reach-out form uses Netlify Forms (`data-netlify="true"`); it activates automatically
   on deploy. Set a notification email in Netlify: Site settings, Forms, Notifications.
4. Point TribuneOS.com at the site when ready; sitemap/canonicals already use that domain.

## Before public launch (TODO)
- §15 sign-offs with Ryan: Daylight inversion, three dash-free verbatim lines.
- Legal page: terms from counsel. Tribune is US-only; no DE locale exists on this site.
- Proof-band statistics were intentionally left out pending verified public source URLs
  (spec rule: no stat without a source). Add them to the landing page only with sources.
- OG images: generate per-page images (suggested: the soul card rendered per build).
- Photography: replace the type-only pages with imagery per spec §12.4 if desired.

## Premium Frontend Doctrine, applied (static adaptation)
Tier call (FM-5 honesty): this is a marketing site, not a Garden Eight engagement.
What was adopted from the doctrine:
- One signature moment, everything else efficient: the landing hero carries a
  cursor-reactive stone field (Three.js, a locked-stack tool, via a pinned CDN import
  map), loaded only on the landing page, only on fine-pointer screens 900px and up,
  only without reduced-motion, and only after idle. Every other page ships zero JS
  dependencies.
- FM-3: one renderer, module-scope singleton, a context-lost handler falls back to
  the static hero. FM-4: no video backgrounds anywhere.
- Barba.js and Lenis were deliberately skipped: these pages are light, native MPA
  scroll is correct, and FM-2 risk buys nothing here. The View Transitions API
  provides no-flash navigation on supporting browsers at zero dependency cost.
- Mobile receives the simpler experience by policy: the static hero, full content.

### Performance gate (run before every deploy; fail closed)
- first contentful paint < 1500 ms, largest contentful paint < 2500 ms,
  time to interactive < 3500 ms (Lighthouse)
- scroll frame rate 60 fps on a mid-range device, on-device, not emulated
- gzipped JS on the landing page < 250 KB (three.module is ~165 KB gz; passes)
- total first-load transfer < 1.5 MB (currently far under; fonts are the largest item)
- any assert fails: block the deploy, profile the bottleneck, remediate, re-run.

### Upgrade path
If Tribune later wants a true Garden Eight tier site (Vite + TypeScript scaffold, GSAP
choreography, Barba route pairs, shader displacement, a real asset pipeline), follow
the doctrine end to end as a separate engagement; do not bolt it onto this repo.

## Guardrails (already enforced in this build, keep enforcing)
- No client names, no internal agent or system names, no "AI builds AI" framing.
- No em or en dashes anywhere in copy. No banned vocabulary (spec §2).
- Lint before every deploy:
  grep -rwn "Dixon\|Marsden\|Marcus\|Mercury\|OpenClaw\|Lobster\|Nymbl\|Waystar\|Medsender\|Parachute\|Limen\|Kua\|Cursus\|Ollama" .
  grep -rn "\u2014\|\u2013" --include="*.html" .
