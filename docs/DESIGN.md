# DESIGN: style and geometry rules

Look: a premium indie game diorama. Bright, colorful, calm around one memorable object (the stack). Think crafted miniature with soft light, not a template and not a toy. Real 3D with real light and shadow does the work; do not fake it with flat colors.

## Palette (src/config/palette.ts is the only place for hex)
| Key | Hex | Use |
|-----|-----|-----|
| bg | #F8F9EF | page background (near-white, faint green-yellow cast) |
| bgGlow | #FEFFF8 | lighter glow behind the stack |
| surface | #FFFFFF | cards, panels |
| ink | #3D4339 | text (never pure black) |
| inkSoft | #6B7566 | secondary text |
| line | #E3E6D6 | borders |
| butter | #F5C64F | layer: content |
| lilac | #B9A8EE | layer: translation |
| peach | #F9A87B | layer: seo |
| rose | #F29AB0 | layer: design |
| blue | #8FBDE8 | layer: frontend |
| sage | #AECB9F | layer: cms |
| steel | #A9B8CC | layer: infrastructure |
| wall | #F4F2EA | room back walls |
| wallShade | #E6E3D8 | right-hand wall |
| wood | #F0D5A8 | room floors |
| white | #FBFBF6 | props |
| graphite | #59606B | small details only, never a slab or a wall |
| glow | #BFE3FF | screens |
| ledGreen / ledAmber / ledRed | #7BE0A4 / #FFC857 / #FF8A80 | status lights |
Export helpers `lighten(hex, k)` and `darken(hex, k)`. Colors in the scene come from tokens only.
Each room uses at most 6 colors: its layer color, wall, wood, white, graphite and one accent from the table.

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
```
Why these numbers
- Closed stack: each layer's floor sits SLAB_T above the floor below. A lower room's walls then fill exactly the volume of the slab above it, so the stack reads as seven equal chunky plates. When the layer above lifts, the walls appear where that slab's side used to be.
- Projected slab (isometric, camera at (1,1,1) direction): width = FOOTPRINT x 1.414 = 8.49, height = (FOOTPRINT + SLAB_T) x 0.8165 = 6.37. Ratio 10 : 7.5. Keep it between 10:7 and 10:8.
- LIFT: the lifted slab's front-bottom edge must clear the lower room's back-wall top as seen by the camera. That needs floor-to-floor spacing of at least 2 x SLAB_T + FOOTPRINT. Closed spacing is SLAB_T, so LIFT = FOOTPRINT + SLAB_T (+0.4 margin). Verify with a screenshot: the whole floor and every prop of the exposed room must be visible.
- Props never exceed WALL_H x 0.95 in height, so they never touch the slab above during transitions.

## Camera
Orthographic. Position = target + (1,1,1) x 30. Looks at target. Visible faces: top, +x (right face), +z (left face). Back walls sit on the -x and -z sides. Never rotate the camera or the stack.

## Slab (scene/stack/slab.ts)
- Body: rounded box FOOTPRINT x SLAB_T x FOOTPRINT, radius CORNER_R, 4 segments.
- Top: floor inset 0.18 from the edge. A rim in the layer color, lightened 12 percent, runs around it.
- Right face (+x): inset panel and a round white badge (diameter 0.9 x SLAB_T) with the layer icon. Icon comes from the config path, drawn to a CanvasTexture.
- Left face (+z): the layer number engraved large, a darker tone of the layer color. Registration crosses in two corners.
- Thin lighter trim along the top perimeter. A darker band along the bottom edge.
- Material: MeshStandardMaterial, roughness 0.6, metalness 0.

## Light and render
- ACESFilmic tone mapping, exposure 1.05, sRGB output.
- Environment: RoomEnvironment through PMREM, intensity 0.5. No downloaded HDRI.
- HemisphereLight sky #FFFFFF, ground #F0EBD8, intensity 0.7.
- Key light: DirectionalLight from the top-left-front, warm white, intensity 2.2, soft shadows (PCFSoftShadowMap, radius 4, bias -0.0004).
- Fill light: weak cool DirectionalLight from the right, no shadows.
- Ground: ShadowMaterial plane, opacity 0.18, under a round platform.
- Ambient occlusion by hand: a dark gradient strip (opacity 0.08 to 0.1) along the base of both back walls and under big props.

## Prop quality rules (this is what separates "game" from "toy")
- Every prop uses at least two materials and a bevel of at least 0.03.
- Every prop touches the floor or a surface and has a soft contact shadow.
- Add one small secondary detail to each major prop (a cable, a label, a screen glint).
- No pure black, no pure white, no flat unlit colors.
- Screens use CanvasTexture and update at 12 fps at most.
- Repeated elements (books, LEDs, floor tiles, cables) use InstancedMesh.

## Environment around the stack
Round platform under the stack, with thin ring markings. CSS background: radial gradient from bgGlow in the center to bg at the edges. 40 to 60 slow dust particles (instanced). Three to five floating shapes in palette colors at different depths for parallax. A faint vignette. Keep it calm.

## HUD and UI style
Rounded 14 to 20px corners. Chunky pill buttons: 2px ink border, a hard 4px offset shadow in the layer color. Numeric badges. A pulsing green availability dot. Scroll progress is a bar of seven segments, one per layer. No glassmorphism. Cards are white with a colored side tab.

## Sections
- HUD header: name, role, links to Stack, Toolkit, About, Contact, availability, progress bar. Small and distinctive, not a SaaS bar.
- Hero: stack stage plus spatial labels and layer numbers.
- About: two columns. Left: a short statement and a small diagram of the seven layers. Right: three color panels.
- Toolkit: seven tiles, one per layer, each with number, color swatch and tool chips.
- Contact: an end-of-level panel with a big heading, a mailto button, social links and availability.
- Footer: compact.

## Responsive
Minimum width 360px. Mobile gets its own camera framing (zoomed in on the exposed room), shadow map 1024, pixel ratio 1.25, fewer particles. Detail view stacks vertically: room on top, text below.
