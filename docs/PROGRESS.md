# PROGRESS

Current task: T29 (redesign hover interactions and preview)

## Handoff note (max 8 lines, rewrite each session)
Redesign batch T28-T32 in progress (user brief 2026-11-05). T28 done: unified plaster/wood slab family (roles slab/slabShade/underGlow in ThemeColors + tokens.css), floating tower (STACK_BASE_Y 1.35, no platform/ground), rebuilt stage environment (contact shadow + underGlow halo + under light, shapes removed), collision dust (stack/dust.ts pool), poster regenerated. verify-stack PASS, check PASS, both themes shot.
T29 next: hover movement states (top floor right pre-scroll; exposed floor up; first floor included) + full redesign of the right-side hover info card (no "View work" link), component shared with T30's expanded card. Files: pick.ts, preview.ts, bus, Hero/hud.css.
Gotchas: a stale dev server may hold 4321 — run `URL=http://localhost:4322/ npm run shots`; verify-stack takes URL env too. Astro dev toolbar disabled (screenshot leak). Number textures redraw on theme change (icons.ts returns {tex, redraw}).
Git policy: one commit per task, exact messages "T28: refine tower materials and environment" etc.; never push.
Next: T29, then T30 (detached floor 50/50), T31 (page-wide language), T32 (responsive + QA).

## How to run
- Open a terminal in the portfolio-kit folder (the one with package.json): `cd "C:\Users\ASUS\OneDrive - sternx.de\Desktop\personal\homepage\GLM 5.3_2\portfolio-kit"`
- `npm install` (once, or after package.json changes)
- `npm run dev` — serves http://localhost:4321/ with live reload
- `npm run build` — static build into dist/; `npm run preview` — serves the build
- `npm run check` — TypeScript strict + repo guardrails (also regenerates docs/MAP.md)
- `node scripts/verify-stack.mjs` — motion checks (dev server must be running)
- `npm run shots` — screenshots into shots/ (dev server must be running)

## Needs (changes requested outside a task's files)
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
| T28 | Tower materials, positioning and environment (redesign batch) | done, verified |
  Unified plaster/wood slab family, floating tower + contact shadow/under-glow environment, collision dust, full-width shadow fix, poster regenerated, shots tooling fixed (stage selector, dark/slam passes, dev toolbar off). Card: docs/tasks/T28-tower-materials-environment.md. |

## Blocked
(none)

## Not verified yet
- Focused-canvas pixels (WebGL context loss under swiftshader; logic verified numerically).
- Landing squash/jolt/prop-punch pixels (single-frame effects under software rendering; rings verified, code implemented per docs/MOTION.md).
- Whoosh wall-clock and trackpad/real-touch-drag on real hardware.
