# PROGRESS

Current task: T20 — room-by-room visual refinement

## Handoff note (max 8 lines, rewrite each session)
Redesign T13-T19 all done and committed (git log: T14 docs, T15 merge c4c537b, T16 migration 881eeca, T17 theme foundations e92aea4, T18 3D theming cf25cb6, T19 QA fab3a5c).
Six layers: content, translation, seo, web-design-development, cms, infrastructure; 5 scroll steps. Legacy routes /work/design + /work/frontend redirect. Dual theme: CSS data-theme + scene role registry (scene-theme.ts); verified live (shots t17-dark, t18-dark-scene, t19-dark-detail). verify-stack derives N/STEPS from config (PASS). QA: docs/QA.md redesign section.
T19 QA caught a real regression: T13 left transform:translateY(-50%) on .layer-nav, trapping the pills below the canvas (unclickable). Fixed in labels.ts (clear transform + z-index 4).
Git policy (user): commit after EVERY task; do not push unless asked.
Gotchas: labels transform fix must stay; draw fns live in anim.ts when layout hits the 200-line cap; screens are self-lit and intentionally identical in both themes; WebGL context loss under swiftshader is environmental.
Next: T20 room-by-room visual refinement (all six rooms, both themes, intended camera angle), then T21-T27 (cards in docs/tasks/).

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
| T20 | Room-by-room visual refinement | todo |
| T21 | Stack animation, camera, and interaction polish | todo |
| T22 | HUD, detail panels, and website section refinement | todo |
| T23 | Responsive visual refinement | todo |
| T24 | Scene lifecycle and performance refinement | todo |
| T25 | Loading, fallback, and asset refinement | todo |
| T26 | Code cleanup and production preparation | todo |
| T27 | Final visual consistency and release-readiness pass | todo |

## Blocked
(none)

## Not verified yet
- Focused-canvas pixels (WebGL context loss under swiftshader; logic verified numerically).
- Landing squash/jolt/prop-punch pixels (single-frame effects under software rendering; rings verified, code implemented per docs/MOTION.md).
- Whoosh wall-clock and trackpad/real-touch-drag on real hardware.
