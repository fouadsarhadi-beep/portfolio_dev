# PROGRESS

Current task: T20 — room-by-room visual refinement

## Handoff note (max 8 lines, rewrite each session)
T14 done: all specs now describe the approved six-layer architecture (content, translation, seo, web-design-development, cms, infrastructure; 5 scroll steps) and the dual-theme system (light + dark, palettes in palette.ts, tokens.css [data-theme='dark'], scene role registry per docs/DESIGN.md). Code still has seven layers until T15/T16 — docs describe the approved target.
T13 verified earlier (check, build, visual: t13-pills.png).
Git policy (user, 2026-11-05): commit after EVERY task; commits are the revert points. Do not push unless asked.
Known issues: docs/QA.md "partially verified" rows; WebGL context loss under swiftshader (environment) — re-verify visuals on a real GPU.
How to run: see "How to run" below; npm install inside portfolio-kit, then npm run dev (localhost:4321).

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
- Redesign approved (2026-11-05, user brief): seven layers -> six (design + frontend merge into web-design-development), dual theme. Docs updated in T14; code follows in T15/T16; theme in T17/T18.

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
| T15 | Merge design + frontend rooms | todo |
| T16 | Complete six-layer migration | todo |
| T17 | Theme foundations (CSS + persistence + toggle) | todo |
| T18 | Live 3D theme switching | todo |
| T19 | QA: six layers + both themes | todo |

## Blocked
(none)

## Not verified yet
- T08/T12: focused-canvas pixels (WebGL context loss under swiftshader; all logic verified numerically).
- Landing squash/jolt/prop-punch pixels (single-frame effects under software rendering; rings verified, code implemented per docs/MOTION.md).
- Whoosh wall-clock and trackpad/real-touch-drag on real hardware.
