# Appearance & theming

TREK's look is driven by **design tokens** (CSS custom properties) so a single
per-user config can re-skin the whole app — color scheme, accent, transparency,
text size, density — without touching component code. New pages get this for
free **if they follow the contract below**.

## How it works

- The per-user config is one validated blob (`AppearanceConfig` in
  `@trek/shared`), stored under the `appearance` settings key.
- `applyAppearance()` (`src/theme/applyAppearance.ts`) is the **only** code that
  writes styling to the DOM: it toggles `.dark`, sets `data-scheme` /
  `data-no-transparency` / `data-density` / `data-reduce-motion` on `<html>`,
  and writes the custom-accent + type-scale CSS variables.
- A render-blocking `public/theme-boot.js` replays a cached snapshot before
  first paint to avoid FOUC (external classic script — the prod CSP blocks
  inline scripts).
- Schemes are data: swatch metadata in `src/theme/schemes.ts`, token values in
  the `[data-scheme="…"]` blocks in `src/index.css`.

## Special themes

A special theme (today `halloween`) is a scheme on the same `data-scheme` axis,
so it needs no applier of its own. Three things set it apart, all keyed to
`APPEARANCE_SPECIAL_SCHEMES` in `@trek/shared`:

- **Always dark.** `applyAppearance()` and the boot script force `.dark` while
  one is on; the color-mode control in settings is dimmed with a hint.
- **Palette** in `src/theme/special/<id>.tokens.css`, loaded eagerly next to
  `index.css` so first paint is right. It overrides surfaces, text and the
  feature palettes (`.trek-dash`, `--vg-*`, `--journal-*`, mobile `--m-*`).
- **Decor** in `src/theme/special/<id>/`, a lazy chunk that `SpecialThemeLayer`
  mounts while the scheme is on `<html>` (read through `useActiveScheme`, never
  from the config). It respects reduced motion and transparency off, and never
  draws over a map: the Atlas gets none, the trip planner dresses only its side
  panels. Figures are pre-rendered 3D sprite sheets; the mascot plays its own
  `-<id>-` clips.

## Token taxonomy

| Purpose | Token / utility |
| --- | --- |
| Surfaces | `--bg-primary/secondary/tertiary/elevated/card/input/hover/selected` · `bg-surface*` |
| Text | `--text-primary/secondary/muted/faint` · `text-content*` |
| Borders | `--border-primary/secondary/faint` · `border-edge*` |
| Accent | `--accent` (fill) · `--accent-text` (on fill) · `--accent-on` (on surface) · `--accent-hover` · `--accent-subtle` · `bg-accent` / `text-accent-on` / `bg-accent-subtle` |
| Status | `--success/-soft`, `--danger/-soft`, `--warning/-soft`, `--info/-soft` · `bg-danger-soft text-danger` etc. |
| Elevation | `--shadow-sm/md/lg/card/elevated/modal/dropdown/popover` · `shadow-modal` etc. |
| Overlay / inverse | `--overlay` · `--bg-inverse` / `--text-inverse` · `bg-inverse text-inverse-text` |
| Type tiers | `text-title` / `text-subtitle` / `text-body` / `text-caption` (scale with the user's per-tier multipliers) |

## Layering

Fixed and sticky surfaces read their stacking order from one scale in
`src/index.css`, so two of them cannot end up in the wrong order by accident.

| Token | Value | For |
| --- | --- | --- |
| `--z-bar` | 60 | `BottomNav`, page-bound sticky bars |
| `--z-decor-ambient` | 190 | a special theme's sky, over the content and under the navbar (only while one is on) |
| `--z-nav` | 200 | the desktop navbar |
| `--z-decor` | 9000 | a special theme's webs and spiders, over the navbar and under its menus (only while one is on) |
| `--z-modal` | 10000 | `shared/Modal`, `ConfirmDialog` |
| `--z-overlay` | 99990 | page-owned full-screen overlays |
| `--z-notice` | 99998 | app-wide system and release notices |
| `--z-toast` | 100000 | toasts, tooltips, context menus |

A new fixed surface docks onto the step it belongs to (`z-[var(--z-modal)]` as a
class, `z-index: var(--z-modal)` in CSS) instead of inventing a number. Older
files still carry literal values; the steps are far enough apart that those keep
their current position until the file gets converted.

## The contract (enforced by `npm run theme:lint`)

1. **Surfaces/text/borders** use the semantic utilities (`bg-surface*`,
   `text-content*`, `border-edge*`) or `var(--token)` — never raw
   `bg-slate-*` / `text-gray-*` / `bg-white`.
2. **The primary/"black" action look** uses `bg-accent` + `text-accent-text`
   (+ `ring-accent`) — never `bg-slate-900` / `bg-black` / `bg-indigo-*`. This
   is what lets a user's accent reach new surfaces automatically.
3. **Semantic text size** uses the tier utilities `text-title/subtitle/body/caption`
   — never an inline `fontSize: <px>`, never raw `text-sm`/`text-xs` or arbitrary `text-[13px]` to *mean* a tier.
4. **Translucent/blurred** surfaces consume an alpha/glass token
   (`--bg-elevated`, `--tooltip-bg`, `--glass-*`) or a `backdrop-blur` utility,
   so transparency-off can neutralize them centrally — never inline `rgba()`
   backgrounds or `backdrop-filter` in JSX.
5. **Components never read `AppearanceConfig` to compute styles.** Only
   `applyAppearance` reads the config and writes tokens; components read tokens.
   Dark state is read off the `.dark` class, never duplicated into React state.
6. **New appearance dimensions** are added to `AppearanceConfig` +
   `applyAppearance` + `schemes.ts` — never a second applier or a parallel token
   family. New feature palettes derive their accent from `var(--accent)`.

### Allowed to stay inline / literal

Genuinely dynamic values (data-driven colors like `cat.color`, computed
geometry/transforms/sizes), and the surfaces CSS variables can't reach: injected
map popup/marker HTML, Mapbox/MapLibre paint, and the standalone `@react-pdf`
documents. Mark intentional exceptions with a `theme-lint-disable` line comment.

The markers are counted per file against `client/scripts/theme-disable-baseline.json`,
like `rtl-lint-disable` in `lint:rtl`, so an exception is a decision a reviewer
sees rather than a way around the check. `--update` only lowers that file: a new
marker for a surface the tokens really cannot reach is added by raising (or
adding) its file's entry by hand in the same change, where review can see it.
