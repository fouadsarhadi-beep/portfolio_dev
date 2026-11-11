# DESIGN: style and geometry rules

Look (T28 redesign): a restrained architectural diorama. One warm plaster-and-wood material family across the whole tower; floors are distinguished by typography, numbering, icons and room contents, never by side colors. Think crafted architectural model with soft light, not a toy. Real 3D with real light and shadow does the work; do not fake it with flat colors.

## Palette (src/config/palette.ts is the only place for hex)
| Key | Hex | Use |
|-----|-----|-----|
| bg | #F8F9EF | page background (near-white, faint green-yellow cast) |
| bgGlow | #FEFFF8 | lighter glow behind the stack |
| surface | #FFFFFF | cards, panels |
| ink | #3D4339 | text (never pure black) |
| inkSoft | #6B7566 | secondary text |
| line | #E3E6D6 | borders |
| slab | #EAE0CB | unified slab body (warm clay plaster; both themes register it) |
| slabShade | #CFC1A3 | slab trims, bottom band, inset panels |
| underGlow | #D8C9A3 | restrained glow beneath the floating tower |
| butter | #F5C64F | layer accent: content (DOM labels/cards only) |
| lilac | #B9A8EE | layer accent: translation (DOM only) |
| peach | #F9A87B | layer accent: seo (DOM only) |
| rose | #F29AB0 | layer accent: web-design-development (DOM only) |
| blue | #8FBDE8 | room accent: web-design-development |
| sage | #AECB9F | layer accent: cms (DOM only) |
| steel | #A9B8CC | layer accent: infrastructure (DOM only) |
| wall | #F4F2EA | room back walls |
| wallShade | #E6E3D8 | right-hand wall |
| wood | #EFC98F | slab deck floors and room floors (plank texture) |
| white | #FBFBF6 | props, slab badges |
| graphite | #59606B | icons, engraved numbers, small details |
| glow | #BFE3FF | screens |
| ledGreen / ledAmber / ledRed | #7BE0A4 / #FFC857 / #FF8A80 | status lights |
Export helpers `lighten(hex, k)` and `darken(hex, k)`. Colors in the scene come from tokens only.
Layer accents (butter, lilac, ...) are a DOM concern: layer-nav pills, hover card, detail card. Slab sides never carry them (T28: no per-floor color identity).
Each room uses at most 6 colors: its layer color, wall, wood, white, graphite and one accent from the table.

## Dual theme (approved design, implemented in T17/T18)

The site ships two themes: light (this table, the original) and dark. Both palettes live in
`src/config/palette.ts`; CSS exposes them as variables in `src/styles/tokens.css` under
`:root` (light) and `[data-theme='dark']`. The user's choice persists in localStorage and
falls back to `prefers-color-scheme`. The 3D scene reads the active theme through a
material role registry (docs/WIRING.md), so a theme switch updates materials, lights and
canvas textures in place without rebuilding the scene.

Dark starting values (contrast-checked on real surfaces in T17; tower tones are derived from the light ones with `darken()` in `src/config/palette.ts`, so the dark building is the same material under less light — the plaster/wood textures in `src/scene/stack/plaster.ts` pick their fleck direction from the base luminance, and the key light warms up in the dark):

| Token | Starting value |
|---|---|
| bg | #090B0E |
| bgDeep | #060709 |
| surface | #11151A |
| surfaceAlt | #171D23 |
| elevated | #202831 |
| line | #303943 |
| ink | #E7E9E8 |
| inkSoft | #A1A9AE |
| inkMuted | #737D85 |
| accent | #9AAEB4 |
| accent2 | #B69B76 |
| highlight | #D1D8D5 |

Layer accents must stay distinguishable in both themes; dark variants are validated in T17.

## Type (local fonts through Fontsource)
- Display: Fredoka Variable, weights 600 to 700. Headings, layer numbers, HUD labels.
- Body: DM Sans Variable, 400 and 600.
- Scale (px): 12, 14, 16, 20, 28, 44, 72, 120. Layer numbers use 120 and up. Body lines stay under 68 characters.
- If a font package fails to install, choose another open-license pair and record it in docs/PROGRESS.md.
- Reserve `--font-display-alt` and `--font-body-alt` in tokens.css for the later Persian fonts.

## Geometry constants (src/config/tuning.ts)
```ts
export const FOOTPRINT = 6;            // slab width and depth, world units
export const SLAB_T = 1.8;             // slab thickness
export const WALL_H = SLAB_T;          // wall height equals slab thickness (locked)
export const WALL_THICK = 0.14;
export const CORNER_R = 0.14;
export const LIFT = FOOTPRINT + SLAB_T + 0.4; // 8.2: how far a lifted layer rises
export const STACK_BASE_Y = 1.35;      // T28: the whole tower floats this high (see below)
```
Why these numbers
- Closed stack: each layer's floor sits SLAB_T above the floor below. A lower room's walls then fill exactly the volume of the slab above it, so the stack reads as seven equal chunky plates. When the layer above lifts, the walls appear where that slab's side used to be.
- Projected slab (isometric, camera at (1,1,1) direction): width = FOOTPRINT x 1.414 = 8.49, height = (FOOTPRINT + SLAB_T) x 0.8165 = 6.37. Ratio 10 : 7.5. Keep it between 10:7 and 10:8.
- LIFT: the lifted slab's front-bottom edge must clear the lower room's back-wall top as seen by the camera. That needs floor-to-floor spacing of at least 2 x SLAB_T + FOOTPRINT. Closed spacing is SLAB_T, so LIFT = FOOTPRINT + SLAB_T (+0.4 margin). Verify with a screenshot: the whole floor and every prop of the exposed room must be visible.
- Props never exceed WALL_H x 0.95 in height, so they never touch the slab above during transitions.

## Camera
Orthographic. Position = target + (1,1,1) x 30. Looks at target. Visible faces: top, +x (right face), +z (left face). Back walls sit on the -x and -z sides. Never rotate the camera or the stack.
Framing: the frustum is shifted down by `CAM_FRAME_OFFSET_Y` (22% of the visible height, ≈200px at 900px tall), which draws the whole scene that much higher on screen so the opening view sits above the fold. The hero copy sits at the top of the left column (T39), so the lift only frames the tower.
Base zoom (T39/T54, user sketch; resized 2026-11-11 so the whole tower is 15% smaller): the tower renders at `OVERVIEW_BASE_ZOOM` = 1.19 (1.11 low tier) on wide cells, and otherwise fills 72% of its cell's width — a constant margin on each side, so the air around the tower never changes as the viewport shrinks. `overviewFitZoom` (focus-pose.ts) computes that fit; boot re-fits it on resize. `--tower-w` (tokens.css) mirrors the width.

## Slab (scene/stack/slab.ts) — T28 unified family, T54 craft finish
- Body: rounded box FOOTPRINT x SLAB_T x FOOTPRINT, radius CORNER_R, 4 segments. One shared geometry.
- Material: warm clay plaster (`slab` role, roughness 0.62, metalness 0.03) with a procedural plaster texture (`scene/stack/plaster.ts`: seeded speckles and brushed strokes on a near-white base, so the role color shows through and a theme switch redraws it in place). Identical on all six floors.
- Top: warm oak deck (plank texture, same file) inset 0.18 from the edge, with a quiet `slabShade` rim around it.
- Right face (+x): inset `slabShade` panel and a round plaster badge (diameter 0.9 x SLAB_T) with the layer icon in graphite. Icon comes from the config path, drawn to a CanvasTexture.
- Left face (+z): the layer number engraved in theme ink (light floors get dark ink, dark floors light ink; the CanvasTexture redraws on theme change). Registration crosses in graphite in two corners.
- Thin `slabShade` band along the four bottom edges.
- Floors are told apart by number, icon, layer-nav row and room contents, never by side color.
- Transparency is part of a material's identity, not a fade flag: the number engraving, the icon decal and the room AO strips are canvas textures with transparent backgrounds. Nothing may force `transparent = false` on them, because alpha blending off renders the empty pixels of those canvases black (src/scene/focus.ts).

## Light and render
- ACESFilmic tone mapping, exposure 1.05 (1.12 dark), sRGB output.
- Environment: RoomEnvironment through PMREM, intensity 0.5 (0.45 dark). No downloaded HDRI.
- HemisphereLight sky follows bgGlow, ground follows the floor tone, intensity 0.7 (0.52 dark).
- Key light: DirectionalLight from the top-left-front, warm white (in the dark it takes a warm tint derived from the slab tone), intensity 2.2 (1.65 dark), soft shadows (PCFShadowMap, radius 4, bias -0.0004), shadow camera 16 world units wide for self-shadowing across the raised tower.
- Fill light: weak cool DirectionalLight from the right, no shadows (0.3 / 0.3 dark).
- Under light (T28): dim PointLight in `underGlow` beneath the floating tower; lifts the undersides.
- Contact shadow (T28): soft radial-gradient plane 11x11 at y = -0.12 under the tower (opacity 0.3 light / 0.5 dark); a larger faint `underGlow` halo sits deeper. No platform, no ground plane, no hard shadow edges to clip.
- Ambient occlusion by hand: a dark gradient strip (opacity 0.08 to 0.1) along the base of both back walls and under big props.

## Prop quality rules (this is what separates "game" from "toy")
- Every prop uses at least two materials and a bevel of at least 0.03.
- Every prop touches the floor or a surface and has a soft contact shadow.
- Add one small secondary detail to each major prop (a cable, a label, a screen glint).
- No pure black, no pure white, no flat unlit colors.
- Screens use CanvasTexture and update at 12 fps at most.
- Repeated elements (books, LEDs, floor tiles, cables) use InstancedMesh.

## Environment around the stack (T28, dressed up in T55)
The tower floats (STACK_BASE_Y = 1.35) above a soft radial contact shadow, an `underGlow` halo and a dim under light; it reads as deliberately suspended, not misplaced. No platform, no ground plane. The page frames the stage with a faint warm radial glow (`.stage-sticky::before`, tokens-driven) and the existing vignette. 18 to 36 slow dust particles (instanced, opacity 0.35) drift around the tower, plus three thin graphite orbit rings and 5 to 8 small `slabShade` plates on slow paths (`scene/stage-decor.ts`) — quiet set dressing, never competing with the tower. Keep it calm.

## HUD and UI style (T29/T30/T31 system, T50 island header)
One surface language across the whole page. Implemented in `tokens.css` (`--shadow-card`, `--shadow-lift`), `sections.css`, `hud.css`, `picker.css`:
- Surfaces: `--surface`, a 1px `--line` border, radius 14px (`--radius-m`) for cards/tiles/panels or a pill for controls, one soft two-layer shadow (`--shadow-card`; `--shadow-lift` on hover). No 2px ink outlines, no hard offset shadows, no 10px colored side bars — all removed in T31.
- Header (T50, from the header sample): a floating glass island pill fixed at the top centre (max 1080px), holding brand, nav, language toggle, availability and theme toggle. Below 1024px it collapses to a hamburger circle; opening it expands the pill and drops the nav as a card underneath. The island's measured height feeds `--hud-offset` for anchor offsets.
- First-visit pickers (`ui/picker.ts`, `styles/picker.css`): the page sits blurred under 20% black, with two large rounded-square pills — language (En /فا), then view mode (Interactive / Simple). Saved choices skip them; the header language button flips the locale live.
- Controls: `.btn` is one solid ink pill with `--bg` text and a soft shadow; it lifts 1px on hover. Layer pills (`.layer-nav button`) are surface pills with a hairline border that lift 1px and deepen their border on hover; in the five-part stage they are leveled with their floors every frame (`ui/nav-level.ts`). The theme toggle follows the same rule. Chips are 1px hairlines with `--ink-soft` text, weight 500.
- Color: the only per-layer echo is a 2px accent rule or a small number tint (hover card, expanded card, About panels, no-WebGL cards, work pages). Floors are told apart by number, title and icon; the HUD progress bar is neutral (`--line` → `--ink`).
- Type: display font for headings, no oversized decorative numerals (the work page number is a 14px kicker with an accent rule). Section headings carry a 28x2 hairline rule above them. Persian (`html[lang='fa']`) switches to Vazirmatn through the `--font-*-fa` slots.
- Focus: the global 3px ink focus ring stays; hover states never rely on color alone.
- Dark theme uses the same rules through tokens; nothing in the system is hard-coded to a theme.

## Expanded floor view (T30; `ui/detail.ts`, `styles/hud.css`)
One component, two states: the hover card grows into the expanded card (same surface, hairline border, radius, small number kicker, accent rule), so the click transition reads as a change of size and position, not a different panel.
- Desktop: `.detail-view` is the same shell band as the page (10% margin each side, `src/styles/layout.css`), split 45 / 55 (`45fr 55fr`, so the gap comes out of the shared space). The detached 3D floor owns the first share: 36% of the viewport, centred at 28%, both derived in `src/config/layout.ts` and read by the camera too. the camera framing lift is neutralised, the target sits on the floor's own Y (no up-bias), and the floor travels half the width minus half its column (0.22 of the visible width) to screen-left. The zoom is capped so the floor always fits its share at any aspect ratio. The right 55% is a single container: `.dv-card`, square (`aspect-ratio: 1`, as tall as its row allows, centred in the column) and scrolling inside itself, so the explanatory text and the work tiles share one scroll (`overscroll-behavior: contain`, stable scrollbar gutter). Its last block, `.dv-samples`, sits below a hairline rule: a 3 x 3 grid of small work tiles. A tile (`.dv-sample`) is a 16:10 card: accent-tinted glyph box, title, two-line blurb. Tiles are capped at nine per page (`SAMPLE_PAGE`, `src/config/detail.ts`); a floor with more gets the slider pager (`.dv-pager`), which fetches `/work/<id>/samples/<page>.json` (a static route, one file per page per layer) so paging never reloads the page. Sample tags stay in config for the work pages but are not rendered in the tiles.
- Card content order: back control, number kicker, title, short line, intro, "What I do" as a two-column hairline list, Toolkit as small pills. No colored side tabs, no badges, no links out.
- Mobile (max-width 860px): the panel becomes one scrollable column with 44svh reserved at the top for the floor (the camera frames it there), then the card, then the tiles (two across, and the card drops its square aspect). A gradient fades the reserved band into `--bg` so text stays readable without covering the room.
- While open, the layer pills, hero copy and hover card are hidden (`[data-detail='true']` on `.stage-sticky`), so nothing competes with the expanded composition.

## Document reader (src/ui/doc-viewer.ts, styles/doc.css)
Every sample points at a document. `Sample.doc` keys into `src/config/documents.ts` (short entries: sheets, brief notes) or `src/config/articles.ts` (long-form articles); the reader resolves `ARTICLES` first. `kind` is `pdf`, `doc` or `sheet`, and the body is one of three things: `html` (authored markup, inserted as written), `text` (plain prose, escaped) or `rows` (sheet, first row is the header). All three render as text, because that is what they hold: no PDF plugin, no `iframe`, no library, and it works offline in both themes. Length is not bounded: an article of a few thousand words scrolls in the reader.
- Opening: a tile with a document is a real `button` (`aria-haspopup="dialog"`); a tile without one stays a plain `article` and does nothing. Click opens `.doc-backdrop` (fixed, z-index 60, above the HUD) with `.doc-view`: kind chip, title, meta, body, close.
- Body, by kind: `sheet` renders a real `<table>` (quiet uppercase header, tabular numerals); `text` renders paragraphs; `html` renders as authored. Prose and sheet cells are escaped, authored HTML is trusted repo content and goes in as written.
- Long-form scale (`html` bodies), all on the site tokens: `h2` `--fs-20` display 600, `h3` `--fs-16` display 600, `h4` 12px uppercase 700, `strong` 650, `em` italic, `a` accent underline, `ul`/`ol` with quiet markers, `blockquote` on a 2px accent rule, `code` on a hairline chip, `hr`, `figure`/`figcaption`, `img` capped at 100%. A `.doc-lead` opening paragraph sits a step larger at `--fs-16`. Prose blocks are capped to a 68ch measure so long articles stay readable; tables keep the full width.
- Close: the round × button, the footer button, a click on the backdrop, or Escape. Escape closes the reader first: `detail.ts` routes its dialog's `onEscape` through `closeDocument()`, and closing the detail view closes the reader too.
- Focus: focus moves to the close button on open and returns to the tile on close. Tab stays inside the reader.
- `doc.src` is empty for now. When a real file exists, the footer shows "Open the original file" and links to it, so the reader always has an exit to the source document.

## Layout
One shell for every band. A 10% margin each side leaves the grid in the middle 80%, and that band is three flexible cells (`--shell-cols`); `src/styles/layout.css` holds the recipe and `src/config/layout.ts` the numbers. The HUD row is one item per cell (identity, nav, status).
The stage is the default view and composes the same margins as five parts (T39, user sketch 2026-11-08): 10% margin | 15% stage guide + hero copy | 50% tower | 15% layer nav | 10% margin, whose end margin carries the scroll ladder. Inside the band the columns are `15fr 50fr 15fr`; with the two shared gaps on top each cell lands at about 14.25% / 47.5% / 14.25% of the viewport. The canvas mounts into the middle cell so the frustum is its box; the tower sits centred in the cell. The floor info panel (the merged hover card) sits at the top of the right column, the nav docked at its end edge below it. The expanded floor view is the second grid, on the same band and the same gap. Nothing uses a bespoke sidebar inset.
The right column is one flex stack (`.stage-side`): the floor panel on top, the layer nav docked to the column's end edge. The panel takes what is left and scrolls inside itself, so the two can never meet, whatever the viewport height. The side cells never fall below 200px (`minmax(200px, 15fr)`); below 1024px the stage drops to one cell, the tower takes the band and the nav becomes a horizontal strip along the bottom.

## Sections
- HUD header: floating island pill with name, role, links to Stack, About, Contact, language, availability, theme toggle; below 1024px it collapses to a hamburger circle that opens a dropdown card. Small and distinctive, not a SaaS bar.
- Hero: full-width stack stage (no max-width wrapper) in the five-part composition; the left column carries the stage guide and the hero copy, the middle the tower, the right the layer nav and floor hover card.
- About: bento grid on the shell band (statement, a stacked-bar diagram of the six layers, three panels).
- Contact: an end-of-level panel with a big heading, a contact form, social links and availability.
- Footer: compact.
- Simple build: `/simple/` (chosen in the first-visit mode popup) replaces the 3D stage with a 2x3 grid of floor tiles; clicking one opens the same expanded card without the 3D floor (`html.simple` makes the detail view full-width).

## Responsive
Minimum width 360px. Breakpoints: 1100px hides the stage guide and the hero copy takes over its top inset; 1024px is where the stage drops from its five-part composition to one cell and the layer nav becomes a horizontal strip along the stage's bottom edge; 900px reflows the HUD to two rows; 860px switches the expanded view and About to one column; 760px hides the HUD progress bar and docks the floor info panel as a bottom sheet; 600px tightens the page margin to 6vw; 480px tightens small-phone rhythm. The shell keeps its three cells at every width.
- The stage's side cells never fall below 200px; below that the stage is one cell. The floor panel drops its intro paragraph under an 800px window height, and the nav tightens under 900px.
- Mobile keeps its own camera framing (zoomed in on the exposed room), shadow map 1024, pixel ratio 1.25, fewer particles.
- The expanded view is a deliberate vertical composition (floor on top, card, samples), never a squeezed 50/50 split. `focus.ts` uses the same 860px breakpoint as the CSS, and `focus-pose.ts` takes the floor share from `src/config/layout.ts` so the camera and the grid cannot drift.
- While a floor is expanded the canvas leaves the tower's stage cell and fills the window, so the floor is framed against the page band (the detail grid's first column) instead of against the tower's cell.
- The sticky HUD reflows to two rows on narrow screens (below 900px); `Hud.astro` publishes its measured height as `--hud-offset`, and anchor `scroll-margin-top` uses it, so section links never land under the bar. `--hud-h` (56px) stays the row minimum and must not be fed from the measurement (feedback loop).
- Small phones tighten section padding (56px), card padding, HUD gaps and the hero copy position; no element is allowed to exceed the viewport width. `body { overflow-x: clip }` is the last guard against a sideways scroll.
