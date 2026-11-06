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
| slab | #EDE9DE | unified slab body (T28; both themes register it) |
| slabShade | #D9D4C6 | slab trims, bottom band, inset panels |
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
| wood | #F0D5A8 | slab deck floors and room floors |
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

Dark starting values (to be contrast-checked on real surfaces in T17):

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
Framing: the frustum is shifted down by `CAM_FRAME_OFFSET_Y` (22% of the visible height, ≈200px at 900px tall), which draws the whole scene that much higher on screen so the opening view sits above the fold. The hero copy mirrors the same lift through `--hero-lift` in src/styles/sections.css.

## Slab (scene/stack/slab.ts) — T28 unified family
- Body: rounded box FOOTPRINT x SLAB_T x FOOTPRINT, radius CORNER_R, 4 segments. One shared geometry.
- Material: warm plaster (`slab` role, roughness 0.55, metalness 0.04). Identical on all six floors.
- Top: warm wood deck inset 0.18 from the edge, with a quiet `slabShade` rim around it.
- Right face (+x): inset `slabShade` panel and a round plaster badge (diameter 0.9 x SLAB_T) with the layer icon in graphite. Icon comes from the config path, drawn to a CanvasTexture.
- Left face (+z): the layer number engraved in theme ink (light floors get dark ink, dark floors light ink; the CanvasTexture redraws on theme change). Registration crosses in graphite in two corners.
- Thin `slabShade` band along the four bottom edges.
- Floors are told apart by number, icon, layer-nav pill and room contents, never by side color.

## Light and render
- ACESFilmic tone mapping, exposure 1.05, sRGB output.
- Environment: RoomEnvironment through PMREM, intensity 0.5 (0.38 dark). No downloaded HDRI.
- HemisphereLight sky follows bgGlow, ground follows the floor tone, intensity 0.7 (0.45 dark).
- Key light: DirectionalLight from the top-left-front, warm white, intensity 2.2 (1.5 dark), soft shadows (PCFShadowMap, radius 4, bias -0.0004), shadow camera 16 world units wide for self-shadowing across the raised tower.
- Fill light: weak cool DirectionalLight from the right, no shadows.
- Under light (T28): dim PointLight in `underGlow` beneath the floating tower; lifts the undersides.
- Contact shadow (T28): soft radial-gradient plane 11x11 at y = -0.12 under the tower (opacity 0.3 light / 0.42 dark); a larger faint `underGlow` halo sits deeper. No platform, no ground plane, no hard shadow edges to clip.
- Ambient occlusion by hand: a dark gradient strip (opacity 0.08 to 0.1) along the base of both back walls and under big props.

## Prop quality rules (this is what separates "game" from "toy")
- Every prop uses at least two materials and a bevel of at least 0.03.
- Every prop touches the floor or a surface and has a soft contact shadow.
- Add one small secondary detail to each major prop (a cable, a label, a screen glint).
- No pure black, no pure white, no flat unlit colors.
- Screens use CanvasTexture and update at 12 fps at most.
- Repeated elements (books, LEDs, floor tiles, cables) use InstancedMesh.

## Environment around the stack (T28)
The tower floats (STACK_BASE_Y = 1.35) above a soft radial contact shadow, an `underGlow` halo and a dim under light; it reads as deliberately suspended, not misplaced. No platform, no ground plane. The page frames the stage with a faint warm radial glow (`.stage-sticky::before`, tokens-driven) and the existing vignette. 18 to 36 slow dust particles (instanced, opacity 0.35) drift around the tower; floating colored shapes were removed. Keep it calm; the environment never competes with the tower.

## HUD and UI style (T29/T30/T31 system)
One surface language across the whole page. Implemented in `tokens.css` (`--shadow-card`, `--shadow-lift`), `sections.css`, `hud.css`:
- Surfaces: `--surface`, a 1px `--line` border, radius 14px (`--radius-m`) for cards/tiles/panels or a pill for controls, one soft two-layer shadow (`--shadow-card`; `--shadow-lift` on hover). No 2px ink outlines, no hard offset shadows, no 10px colored side bars — all removed in T31.
- Controls: `.btn` is one solid ink pill with `--bg` text and a soft shadow; it lifts 1px on hover. Layer pills (`.layer-nav button`) are surface pills with a hairline border that lift 1px and deepen their border on hover. The theme toggle follows the same rule. Chips are 1px hairlines with `--ink-soft` text, weight 500.
- Color: the only per-layer echo is a 2px accent rule or a small number tint (hover card, expanded card, About panels, no-WebGL cards, work pages). Floors are told apart by number, title and icon — the Toolkit swatch was replaced by the layer icon; the HUD progress bar is neutral (`--line` → `--ink`).
- Type: display font for headings, no oversized decorative numerals (the work page number is a 14px kicker with an accent rule). Section headings carry a 28x2 hairline rule above them.
- Focus: the global 3px ink focus ring stays; hover states never rely on color alone.
- Dark theme uses the same rules through tokens; nothing in the system is hard-coded to a theme.

## Expanded floor view (T30; `ui/detail.ts`, `styles/hud.css`)
One component, two states: the hover card grows into the expanded card (same surface, hairline border, radius, small number kicker, accent rule), so the click transition reads as a change of size and position, not a different panel.
- Desktop: `.detail-view` is a stage-wide grid, two rows and a 45 / 55 column split (`45fr 55fr`, so the gap comes out of the shared space). The detached 3D floor owns the left 45% and is centred in it: the camera framing lift is neutralised, the target sits on the floor's own Y (no up-bias), and the floor travels half the width minus half its column (0.275 of the visible width) to screen-left. The zoom is capped so the floor always fits that column at any aspect ratio. `.dv-card` fills the right 55%, vertically centred, scrollable if needed; the compact sample strip (`.dv-samples`, small cards with title, one-line blurb, slash-separated tags) spans the full width beneath both.
- Card content order: back control, number kicker, title, short line, intro, "What I do" as a two-column hairline list, Toolkit as small pills. No colored side tabs, no badges, no links out.
- Mobile (max-width 860px): the panel becomes one scrollable column with 44svh reserved at the top for the floor (the camera frames it there), then the card, then the samples. A gradient fades the reserved band into `--bg` so text stays readable without covering the room.
- While open, the layer pills, hero copy and hover card are hidden (`[data-detail='true']` on `.stage-sticky`), so nothing competes with the expanded composition.

## Sections
- HUD header: name, role, links to Stack, Toolkit, About, Contact, availability, progress bar. Small and distinctive, not a SaaS bar.
- Hero: full-width stack stage (no max-width wrapper) plus spatial labels and layer numbers. The canvas spans the window so shadows and glow never clip at a container edge.
- About: two columns. Left: a short statement and a small diagram of the six layers. Right: three color panels.
- Toolkit: seven tiles, one per layer, each with number, color swatch and tool chips.
- Contact: an end-of-level panel with a big heading, a mailto button, social links and availability.
- Footer: compact.

## Responsive
Minimum width 360px. Breakpoints: 860px switches the expanded view and About to one column; 480px tightens small-phone rhythm; 760px hides the HUD progress bar and docks the hover card (and keeps a usable no-scene pill row).
- Mobile keeps its own camera framing (zoomed in on the exposed room), shadow map 1024, pixel ratio 1.25, fewer particles.
- The expanded view is a deliberate vertical composition (floor on top, card, samples), never a squeezed 50/50 split. `focus.ts` uses the same 860px breakpoint as the CSS.
- The sticky HUD wraps on narrow screens; `Hud.astro` publishes its measured height as `--hud-offset`, and anchor `scroll-margin-top` uses it, so section links never land under the bar. `--hud-h` (56px) stays the row minimum and must not be fed from the measurement (feedback loop).
- Small phones tighten section padding (56px), card padding, HUD gaps and the hero copy position; no element is allowed to exceed the viewport width.
