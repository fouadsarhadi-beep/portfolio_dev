# PROGRESS

Current task: none. The 2026-11-07 review batch and the layout-shell pass are committed; the live visual, touch and reduced-motion pass sits with the user.

## Handoff note (max 8 lines, rewrite each session)
State: the page sits on one shell grid (10% margin each side, three flexible cells). Committed on main, nothing pushed.
Landed: `src/config/layout.ts` holds the proportions (PAGE_INSET 0.1, DETAIL_FLOOR_SHARE 0.45, derived band and centre); `src/styles/layout.css` holds the recipe (.shell, .shell-inset, .stage-grid). The HUD row is identity/nav/status cells (two rows below 760px); the stage is the default view grid (canvas full-bleed, guides in the top band, pills in the end cell, hero copy in the bottom band); sections, footer and 404 sit on the band; the expanded floor view is the second grid on the same band, and `focus-pose.ts` now derives zoom and shift from layout.ts instead of a hardcoded 0.45.
Verified in-session 2026-11-07: npm run check (0 errors, 0 warnings, 105 files), npm run build (8 pages), npm run smoke (26 of 26). No browser: the geometry is proved by arithmetic (band 0.800, floor share 0.360 of the viewport, centre 0.280, floor right edge 0.460 meets the card edge 0.460) and by a source-reading script over each band rule and dist/.
Result: header, guides, hero, sections and footer share one left and one right edge at every width; the old hand-tuned clamp insets, .wrap and --content-max are gone.
Open questions for the user: 10% is generous on a laptop (144px at 1440), and the camera ignores the shell gap, so the floor can sit ~9px left of its cell centre; say if either should change.
Gotchas: the detail grid is 45fr 55fr, not three cells, because the camera frames the floor in that share; the shell keeps three cells at every width and only tightens the margin (6vw) below 600px; .layer-card and .detail-view stay absolutely positioned on purpose (JS appends them to .stage-sticky).
Next: the user live pass, then git push.
## How to run
- Open a terminal in the portfolio-kit folder (the one with package.json): `cd "C:\Users\ASUS\Desktop\personal\homepage\GLM 5.3_2\portfolio-kit"`
- `npm install` (once, or after package.json changes)
- `npm run dev` — serves http://localhost:4321/ with live reload
- `npm run build` — static build into dist/
- `npm run preview` — serves the built dist/ on http://localhost:4321 (port pinned 2026-11-07). If it says "Another astro preview server is already running", run `npx astro preview stop` (or add `--force`): the lock lives in `.astro/preview.json` and outlives a crashed session.
- `npm run check` — TypeScript strict + repo guardrails (also regenerates docs/MAP.md)
- `npm run smoke` — 26 checks over dist/ (run `npm run build` first); `npm run map` — regenerates docs/MAP.md only
- The folder left OneDrive on 2026-11-07; any `OneDrive - sternx.de` path in older notes is stale.

## Needs (changes requested outside a task's files)
- Layout shell (user request 2026-11-07): the whole page is one three-column grid inset 10% each side, with the grid in the middle 80%, and a second grid for the expanded floor view. Delivered: layout.ts + layout.css, every band moved onto the shell, camera derived from the same constants. Recorded in docs/DESIGN.md (Layout) and AGENTS.md (hard rules).
- Review batch (user review 2026-11-07, six items, one commit each): dust colour, exploded overview, ladder position, "Simple view" guide link, room iconography, 200-line cap. All delivered; the handoff note above lists them, docs/ROOMS.md carries the rug-glyph rule and docs/MOTION.md the overview explosion.
- Batch after the material fixes (user review 2026-11-06): delivered, one commit each, in T35-T36 (see the table). Pixel dust on the two front faces (8df65c2); the last floor holds and the camera pulls back over three extra steps, LAYER_STEPS 5 + OVERVIEW_STEPS 3 = the 8 in tokens.css (62f9cd7); a layered surface system with gradient cards, inset highlight, glass header, drawn grid, DM Sans display face and tighter tracking (0e4ae3c); a scroll ladder replacing the header step indicator (b02c0f3); side guides that explain the floors and caption the current one (431cc76); rooms that drop generic furniture and foreground one skill icon each (e41cf89); then all twenty council ideas from council_ideas.txt (parent folder, outside the repo) across 928a2c6..a770a3b. Nothing in this batch is left to build; only the user's live pass remains.
- Guardrails warn (not fail) when a source file passes 200 lines. The cap stayed (user review 2026-11-07: keep it, it earns its place), so the two known offenders are split: `focus.ts` keeps the state machine and delegates pose maths to `focus-pose.ts` and the floor fade to `focus-shade.ts`; `pick.ts` projects labels through `stack/layer-rect.ts`. The warning stays armed for the next file that grows.
- Line cap refined (user review 2026-11-07, item 3): 200 lines is a target, not a wall. Split along a functional seam (data and config, pure maths, DOM, wiring), never into arbitrary halves. When a cohesive unit is clearer whole, its header carries `@cap-exempt: <reason>` and the guardrail prints `OK cap-exempt` instead of warning; verified with a 207-line probe file. The checker never fails on length.
- Tooling notes (user review 2026-11-07, items 1 and 2): `npm run preview` is pinned to port 4321; a preview server left running on 4399 (`.astro/preview.json`, 17:22) was blocking every later start until `astro preview stop` cleared it. The VS Code Problems list runs the editor's bundled compiler, not the workspace `typescript@7.0.2` that `npm run check` and `astro build` use, so syntax errors it reports after files change on disk outside the editor are stale: "TypeScript: Restart TS Server". The real one it flagged (`hud.css` line-clamp) now defines the standard property beside the `-webkit-` prefix.
- Two material bugs behind the "black floor" report (user review 2026-11-06), independent of each other: (1) `pick.ts` snapshotted each slab body color at boot and rewrote it on every hover, so a theme switch was undone by the next pointer move, leaving all six floors dark in light mode. It now derives the color from the theme role (slab.ts stores it in `userData.role`, scene-theme.ts exposes `currentTheme()`) and repaints on `theme:change` as well. (2) `focus.ts` forced `transparent = false` on every material it restored; the number engraving, icon decal and AO strips are canvas textures with transparent backgrounds, and alpha off renders those empty pixels black, so floors that had faded showed a black left face after the detail view closed (the clicked floor, which never faded, stayed correct). `focus.ts` now remembers build-time transparency and restores it.
- Long-form documents (user review 2026-11-06): the reader now takes authored `html` bodies (headings, lists, emphasis, tables, code, rules) as well as short prose and sheet rows, so real samples can run to a few thousand words. `doc.css` gained the full long-form scale on site tokens plus a 68ch reading measure. The long bodies live in the new `src/config/articles.ts` (documents.ts stays short; the reader resolves ARTICLES first). Two placeholders converted: content-1 is a 932-word article with 9 h2, 5 h3, 4 ol, 2 ul, a table, 2 blockquotes and a link; content-2 a structured 124-word note. The other 20 documents stay short until real samples land.
- Document reader (user review 2026-11-06): every sample now carries `doc`, a key into the new `src/config/documents.ts` (kind pdf/doc/sheet, prose or sheet rows). New `src/ui/doc-viewer.ts` opens a text reader over the detail view (kinds rendered with the site tokens, sheets as real tables, escaped text, focus in and out, Tab contained), `src/styles/doc.css` styles it, and `Base.astro` loads it. Tiles with a document are buttons that open it; Escape closes the reader first (detail.ts routes onEscape through closeDocument). All 22 samples have placeholder document text; `doc.src` is empty until real files exist, and the reader then offers the original.
- Detail container (user review 2026-11-06, second pass): the explanatory text and the work tiles are one container now (`.dv-card`, samples inside it under a hairline rule), and that card scrolls internally (overscroll-behavior: contain, scrollbar-gutter: stable) so a taller text block and three rows of tiles never push past the frame. Tiles shrank to 16:10 with a 26px glyph. Content carries twelve samples on purpose (9 + 3) so the pager and the page-2 fetch (`/work/content/samples/1.json`) can be seen; the other layers keep two each.
- Detail layout (user review 2026-11-06): the card is now square (aspect-ratio 1, sized by its row) and the sample works moved out of the full-width strip into their own block under it in the right column: a 3-column grid of 4:3 tiles (accent glyph + title + two-line blurb), nine per page (`config/detail.ts` SAMPLE_PAGE). More than nine gets the slider pager, which fetches a static per-page route (`src/pages/work/[id]/samples/[page].json.ts`, one file per layer per page) instead of reloading. Samples name a glyph in `config/sample-icons.ts`; without one the tile falls back to the layer icon. Sample tags are no longer rendered in tiles. Every layer currently has two samples, so the pager stays hidden until you add more.
- Click-a-floor behaviour (user review 2026-11-06): the six rooms shared one material kit (stack.ts created it once), so focus.ts fading "the other" floors wrote opacity 0 onto materials the selected room also used - the kept floor lost its walls and props. stack.ts now builds one kit per room, and focus.ts takes fully faded floors out of the scene (visible = false) after the 0.25s fade, restoring all of them on close before the fade back. Faded geometry used to keep casting shadows and writing depth.
- Detail view re-framed (user review 2026-11-06): the hero framing lift (CAM_FRAME_OFFSET_Y) is absolute pixels, so at the 1.45 detail zoom it pushed the clicked floor to the ceiling. focus.ts now neutralises the lift (camera.applyFraming tween), centres the floor on its own Y, centres it in the left 45% column, and caps the zoom so the floor fits that column at any aspect ratio; hud.css `.detail-view` is `45fr 55fr`. Predicted placement, desktop 1425x900: centre 22.5% / 50%, span 3.1-41.8% (was 29% / 14%, span to 51%).
- Poster removed (user review 2026-11-06): poster.png was a 1280x801 screenshot of the old stage, so it painted the previous version's header, h1 and copy as a ghost layer over the live scene while the canvas loaded. Removed the `<img>` (Hero.astro), `.poster` rules (hud.css 203-212, sections.css not(.js) and no-webgl blocks), the boot.ts fade, and public/poster.png. no-webgl now relies on the stack-fallback cards alone. Regenerate a scene-only render if the loading state needs an image back.
- Framing fix (user review 2026-11-06): the opening view left a tall empty band above the tower and the hero copy sat low. Added `CAM_FRAME_OFFSET_Y` (tuning.ts) applied in camera.ts resizeCamera, and `--hero-lift` in sections.css (all three breakpoints). Both are 22% of the visible height, ≈200px at 900px tall. docs/DESIGN.md (Camera) updated.
- T03: index.astro gained `<script> import '@/main';</script>`.
- T04: stage.ts edits (removed test cube, fixed ring y).
- T05: boot.ts runs room idle loops per tick.
- T07: created src/scene/loop.ts and src/main.ts.
- T08: state.ts (forceExpose), slab.ts (per-slab badge material), loop.ts, preview.ts, main.ts.
- T09: props/monitor.ts screen named 'screen'; props/keyboard.ts added to the kit.
- T10: loop.ts (stage.update hook), boot.ts, renderer.ts (PCFShadowMap), Hud.astro (progress fill script).
- T11: stage.ts (tier dust count), boot.ts (all-dynamic scene imports, mobile zoom, no-webgl fallback), loop.ts (reduced-motion gate), Hero.astro (poster.png), main.ts (lazy ui init), sections.css (no-webgl layout).
- External (user + another assistant, 2026-11-04): git init with GitHub remote fouadsarhadi-beep/portfolio_dev, baseline commit including bk/1 and bk/2 backups, and T13 (labels.ts pill clamp). Verified 2026-11-05: check, build, visual pill check pass.
- Redesign approved (2026-11-05, user brief): seven layers -> six (design + frontend merge into web-design-development), dual theme. Implemented across T14-T19.
- T15: kit grew — props/keyboard.ts instanced; new kit props duck, gauge, easel, chipFan, moodBoard, cardGrid, tokenRack (rooms/web-design-development consumes them).

## Tasks
| Task | What | Status |
|------|------|--------|
| T00 | Scaffold | done |
| T01 | Config and types | done |
| T02 | Page shell, no 3D | done |
| T03 | Scene foundation | done |
| T04 | Slab and closed stack | done |
| T05 | Room shell, prop kit, Content room | done |
| T06 | Scroll state and motion | done |
| T07 | Camera follow, hover, click from side, keyboard | done |
| T08 | Detail view and whoosh | done |
| T09 | Remaining rooms (one row each below) | done |
| T09a | translation | done |
| T09b | seo | done |
| T09c | design | done |
| T09d | frontend | done |
| T09e | cms | done |
| T09f | infrastructure | done |
| T10 | Environment and polish | done |
| T11 | Responsive, reduced motion, performance, fallbacks | done |
| T12 | QA and report | done |
| T13 | Move layer-name pills clear of the stack (external) | done, verified |
| T14 | Specs: six-layer architecture + dual theme | done |
| T15 | Merge design + frontend rooms | done |
| T16 | Complete six-layer migration | done |
| T17 | Theme foundations (CSS + persistence + toggle) | done |
| T18 | Live 3D theme switching | done |
| T19 | QA: six layers + both themes (+ pill stacking fix) | done |
| T20 | Room-by-room visual refinement | done (3af591e) |
| T21 | Stack animation, camera, and interaction polish | done (23fdcb5) |
| T22 | HUD, detail panels, website section refinement (color-scheme) | done (493ddd8) |
| T23 | Responsive visual refinement | done |
  T23 found + fixed a scene-boot crash on mobile: drawDualPane's pair argument was undefined on the initial canvas draw (introduced by T26 cleanup; default param fixes it). 360px: 0 overflow, zoom 1.3, scene boots, no errors. |
| T24 | Scene lifecycle and performance (room disposal, allocation hoists) | done (94a2dd6) |
| T25 | Loading/fallback (canvas fade-in, poster fade-out) | done (4a74e76) |
| T26 | Code cleanup and production preparation | done (fc1169c) |
  T26 cleanup also fixed: translation screen swap never advanced (pair argument dropped). |
| T27 | Final visual consistency and release-readiness pass | done |
  Final sweep (shots/final-*.png): desktop light+dark heroes coherent, mobile dark HUD/copy correct with poster as loading state. Remaining limitations documented in "Not verified yet" + mobile dark shows the light captured poster until the scene is ready (by design; a dark poster could be captured later). |
| T28 | Tower materials, positioning and environment (redesign batch) | done, verified (8140bc1) |
  Unified plaster/wood slab family, floating tower + contact shadow/under-glow environment, collision dust, full-width shadow fix, poster regenerated, shots tooling fixed (stage selector, dark/slam passes, dev toolbar off). Card: docs/tasks/T28-tower-materials-environment.md. |
| T29 | Redesign hover interactions and preview (redesign batch) | done, verified |
  Right-edge .layer-card hover card (no link, zero pill overlap steps 0-5, mobile docked variant), neutral hover edge, tab-away clearing; movement rule verified for first/exposed/lower floors. Card: docs/tasks/T29-hover-card.md. |
| T30 | Detached floor and expanded detail experience (redesign batch) | done, verified (4345d8a) |
  Selected slab leaves the tower to the left half (offset, never re-parented), rest of the tower fades, stage-wide 50/50 grid (floor left, card right) with a compact sample strip beneath, card is the T29 hover card grown up, mobile vertical composition, picking paused while expanded. Card: docs/tasks/T30-separated-floor-detail.md. |
| T31 | Unify portfolio visual language (redesign batch) | done, code-verified (a09f73c) |
  Shared surface system across HUD, pills, buttons, chips, About panels/diagram, Toolkit tiles (icon replaces swatch), Contact, footer, work pages: 1px hairlines, 14px radii, two soft shadow tokens, accent rule as the only per-floor color, neutral progress bar, no oversized numerals. Card: docs/tasks/T31-visual-language.md. |
| T32 | Refine responsive layouts and complete QA (redesign batch) | done, code-verified; live pass by user |
  Camera/CSS breakpoint aligned at 860px, measured HUD height for anchor offsets, 480px small-phone pass, reduced-motion guard on the detail chrome fade. check + build pass; visual/touch/reduced-motion pass handed to the user (no automated screenshots this session). Card: docs/tasks/T32-responsive-qa.md. |
| T33 | Detail view and document reader refinements | done, code-verified (e1301c0..f79943c) |
  Square card with a 3-column tile grid and slider pager, one scrollable container with smaller tiles, twelve content samples so the pager and the per-page JSON fetch are visible, a text reader for pdf/doc/sheet samples, and authored long-form html bodies with a 68ch measure in `config/articles.ts`. Cards: docs/tasks/T30-separated-floor-detail.md plus the Needs notes above.
| T34 | Black-floor material fix | done, code-verified (c8983d2) |
  Hover repaint and fade restore no longer black out floor faces: `pick.ts` derives slab colour from the theme role, `focus.ts` remembers build-time transparency. Both bugs are described in Needs.
| T35 | Interface batch from the user review | done, code-verified (8df65c2..e41cf89) |
  Pixel dust on the two front faces, hold the last floor then pull back for the six-floor overview, layered surface system, scroll ladder, side guides, one skill icon per room.
| T36 | Council round, all twenty ideas | done, code-verified (928a2c6..a770a3b) |
  Idea 1 (system theme on first visit) was already in place and only verified. Then deep link, keyboard shortcuts, 404, robots+sitemap, reading progress, per-floor social cards, copy email, reduced data, skip link, structured data, live region, slow-connection shimmer, print styles, per-room reading copy, line-cap warning, reduced-motion overview, Persian dictionary with an RTL switch, theme-aware favicons, smoke suite. `npm run smoke` runs 26 checks over dist/.
| T37 | Docs sync after the folder move | done (this commit) |
  The run path in How to run no longer points at OneDrive, T33-T37 are recorded, and the handoff note is rewritten. check (0 errors, 2 warnings), build (8 pages) and smoke (26 of 26) re-run clean on 2026-11-07.
| T38 | Layout shell: one grid for the page and one for the expanded floor | done, code-verified (this commit) |
  Three flexible cells inside a 10% margin each side; HUD, stage, sections, footer and 404 on the band; absent the old wrap/clamp insets; second grid 45/55 on the same band with the camera derived from `src/config/layout.ts`. check (0 warnings), build (8 pages), smoke (26/26) and an arithmetic + source-reading verification. Card: none (direct user request; recorded in DESIGN Layout and AGENTS hard rules).

## Blocked
(none)

## Not verified yet
- Focused-canvas pixels (WebGL context loss under swiftshader; logic verified numerically).
- Landing squash/jolt/prop-punch pixels (single-frame effects under software rendering; rings verified, code implemented per docs/MOTION.md).
- Whoosh wall-clock and trackpad/real-touch-drag on real hardware.
- Council round visuals (social card render, print sheet, slow-connection shimmer, reading progress, RTL layout) are build- and smoke-verified only; the user's live pass covers them.

## 2026-11-08 — the stage is a real 3-column grid
The canvas mounts into the stage middle cell (sized to the tower + pill room, tokens.css --stage-mid), and the camera shifts the tower to that cell start edge (stageShiftPx in scene/focus-pose.ts), so the floor pills get the leftover width and cannot reach a text cell. Guides and hero copy are capped to their own cells. The hover card is inside the band: the 10% margins hold the ladder alone. Wide viewports (over 1279px and wider than square) get the three cells; below that the stage is one cell and the guides are hidden.

