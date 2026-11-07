# PROGRESS

Current task: T31 (unify portfolio visual language)

## Handoff note (max 8 lines, rewrite each session)
Redesign batch T28-T32 complete: T28 8140bc1, T29 697c68b, T30 4345d8a, T31 a09f73c, T32 (see git log). All local, nothing pushed.
Result: unified plaster/wood floating tower + contact shadow/under-glow, right-side hover card, detached floor in a 45/55 expanded composition (floor left, card right) with a sample strip, one page-wide surface system, responsive passes at 860/480 plus a measured HUD offset.
Verified in-session: npm run check, npm run build, and T30 numeric probes (detach/fade/zoom/URL/focus/scroll, desktop + 390px geometry). Everything visual, touch and reduced-motion is left to the user's live pass.
Open questions for the user: taste on the new surface language; whether the 860px single-column expanded view should move to 900px; whether mobile pills should keep hugging the slabs.
Gotchas: labels.ts pins pills absolutely (the CSS mobile dock is a no-scene fallback only); `--hud-h` is the bar minimum, never feed the measurement into it; number textures redraw on theme change.
Next (postponed by the user): day/night theme redesign, explanatory onboarding popups.

## How to run
- Open a terminal in the portfolio-kit folder (the one with package.json): `cd "C:\Users\ASUS\OneDrive - sternx.de\Desktop\personal\homepage\GLM 5.3_2\portfolio-kit"`
- `npm install` (once, or after package.json changes)
- `npm run dev` — serves http://localhost:4321/ with live reload
- `npm run build` — static build into dist/; `npm run preview` — serves the build
- `npm run check` — TypeScript strict + repo guardrails (also regenerates docs/MAP.md)

## Needs (changes requested outside a task's files)
- Batch after the material fixes (user review 2026-11-06), one commit each: pixel dust on the two front faces; the last floor holds and the camera pulls back over three extra steps (LAYER_STEPS 5 + OVERVIEW_STEPS 3 = the 8 in tokens.css); a layered surface system (gradient cards, inset highlight, glass header, drawn grid, DM Sans display face, tighter tracking); a scroll ladder replaces the header step indicator; side guides explain the floors and caption the current one; rooms drop generic furniture and foreground one skill icon each; then all twenty council ideas (council_ideas.txt in the parent folder) - deep link, keyboard shortcuts, 404, robots+sitemap, reader progress, social cards, copy email, reduced data, skip link, structured data, live region, slow-connection shimmer, print styles, reading copy, line-cap warning, reduced-motion overview, Persian scaffold, favicons, smoke suite.
- Guardrails now warn (not fail) when a source file passes 200 lines: focus.ts (271) and pick.ts (203) are the known offenders, both worth a split.
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

## Blocked
(none)

## Not verified yet
- Focused-canvas pixels (WebGL context loss under swiftshader; logic verified numerically).
- Landing squash/jolt/prop-punch pixels (single-frame effects under software rendering; rings verified, code implemented per docs/MOTION.md).
- Whoosh wall-clock and trackpad/real-touch-drag on real hardware.
