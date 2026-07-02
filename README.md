# Tribune Inc. Website

**Design base:** website-v1-template-empty (BCH layout, fully stripped)
**Color system:** Horizon Space — white background, crimson `#c41e3a` buttons, purple `#6b2aa8` accent
**Content source:** Fable 5 MD spec (in progress — content will be dropped in as files arrive)

## Stack
- Static HTML, CSS (design tokens in `css/styles.css`), vanilla JS
- Data-driven service pages via `node build.js`
- Netlify deployment

## Color tokens (`:root` in `css/styles.css`)
| Token | Value | Role |
|-------|-------|------|
| `--teal` | `#c41e3a` | Primary / buttons |
| `--teal-dark` | `#a8192f` | Button hover |
| `--crimson` | `#c41e3a` | Alias |
| `--crimson-hover` | `#a8192f` | Alias hover |
| `--orange` / `--purple` | `#6b2aa8` | Accent |
| `--bg` | `#ffffff` | Background |

## Content drop-in
When Fable 5 MD spec is ready:
1. Edit `data/services/*.json` for service content
2. Edit `partials/nav.html` and `partials/footer.html` for company details
3. Run `node build.js` to regenerate service pages
4. Replace all `[PLACEHOLDER]` values with real copy

## Design overrides Fable 5
Layout, structure, color system, and component patterns come from this template.
Fable 5 spec drives **content only** (copy, services, messaging, CTAs).
