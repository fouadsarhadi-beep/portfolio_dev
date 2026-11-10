# T40 — Responsive pass for scaled and smaller viewports

Spec: user brief 2026-11-10 (a 13-inch laptop at 150% Windows scaling is about a 1280x720 CSS viewport; the layouts must stay readable and free of overlap there). Implemented 2026-11-11.

## What was done
- **The right column is one flex stack now.** The floor info panel and the layer nav were two independent boxes (one absolutely positioned, one a grid item) in the same 15% column, so on a short viewport they met: the panel's bottom crossed the nav's first button at 1280x720. `Hero.astro` wraps the nav in `.stage-side`; the panel is prepended into that column by `ui/preview.ts`; the column stacks them (panel on top, nav docked to the end edge). They cannot overlap at any height, and the panel shrinks and scrolls inside itself when the column is short.
- **The panel is sized from its column, not from the viewport.** `width: min(320px, calc(15vw - var(--page-gap)))` gave 166px at exactly 1280 and 320px at 1279 (a 154px jump across a 1px boundary). The panel now fills its cell (200px at 1280).
- **The stage's side cells keep a readable minimum** (`minmax(200px, 15fr)`): at 1280 they were 182px, too narrow for the guide, the copy, the panel and the nav. Below 1024px the stage drops to one cell (it used to drop at 1279, where the nav became a row of full-band-wide pills and shared a cell with the hero copy). The nav is now a horizontal strip there.
- **The expanded floor is framed in its own column again.** Since T38/T39 the canvas lives in the tower's middle cell, but `focus-pose.ts` still assumed a full-viewport canvas: the floor was drawn at 0.475 of the intended size and parked against the card (188px wide instead of 386px at 1280). While a floor is expanded the canvas now fills the window (`data-detail-canvas`), and the pose is computed from the CSS grid's own first column (`config/layout.ts`: the band, minus the shared gap, times 45%). The floor sits centred in its column with air on both sides.
- **The mobile floor fits its reserved strip** instead of running into the card: the zoom now comes from the strip's height and the page's width, and the bias from the strip's middle. One `--detail-band` token replaces the three different band numbers (38/44/46svh, then 40svh).
- **The expanded card clears the HUD** (`padding-block-start: calc(var(--hud-offset, var(--hud-h)) + 12px)`) and the work tiles stop clipping their blurb below 1024px (two across, no fixed ratio).
- **The HUD nav reflows at 900px, not 760px**: it needs about 220px and its cell was already too narrow at 860px. It also wraps now, so it can never spill into the status cell.
- **The scroll rail** no longer runs its title into the panel (the panel names the floor) and steps aside entirely while a floor is expanded.
- **The work pages join the band** (`.work` had a `wrap` class no stylesheet defined, so they ran edge to edge), the About diagram's rules run the full column again, the auto-fit grids keep their column width on the last row, and `body { overflow-x: clip }` stops any overflow from shifting the whole band.

## Verification (honest split)
Automated, in this session:
- `npm run check`: PASS (104 files, 0 errors, 0 warnings).
- `npm run build`: PASS (8 pages). `npm run smoke`: PASS (26/26).
- `npm run layout` (new, `scripts/layout.mjs`): PASS (87 checks). It reads the source CSS and the scene constants, computes the box model of every band at 1920/1600/1440/1366/1280/1152/1024/900/820/768/600/480/390, and fails when two pieces would overlap or leave the viewport. At 1280x720: side cells 200px, panel and nav 13px to spare, floor 386px inside a 449px column with 57px of air to the card.

Not verified (no browser is reachable from the agent sandbox; Chrome and Edge both refuse to start here):
- Pixels. The composition, the reflow and the camera framing are code- and arithmetic-verified only. The user's live pass at 1280x720 (150% scaling), 1920x1080 and a phone covers the visual side.

## Files
`src/sections/Hero.astro`, `src/ui/preview.ts`, `src/styles/hud.css`, `src/styles/layout.css`, `src/styles/sections.css`, `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/ladder.css`, `src/styles/doc.css`, `src/pages/404.astro`, `src/pages/work/[layer].astro`, `src/config/layout.ts`, `src/scene/focus.ts`, `src/scene/focus-pose.ts`, `src/scene/focus-marks.ts` (new), `scripts/layout.mjs` (new), `package.json`, `docs/DESIGN.md`, `docs/MOTION.md`, `docs/PROGRESS.md`.

## Notes
- The desktop composition at 1920 is unchanged: the side cells are 274px there (the 200px minimum does not bind), the tower keeps zoom 1.4, and the nav and panel keep their places.
- The panel loses its intro paragraph below an 800px window height (the count, the title and the short line still name the floor; the expanded card holds the full text).
- `scripts/layout.mjs` fails loudly when a source pattern it reads changes, so it cannot drift into checking the wrong numbers.
