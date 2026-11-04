# PROGRESS

Current task: T13 — Move layer-name pills clear of the stack

## Handoff note (max 8 lines, rewrite each session)
T11 done: mobile zoom 1.3 + 24 dust particles on low tier, room idle loops freeze under reduced motion, poster.png captured from the real scene into public/ and used until canvas ready + as the WebGL fallback (html.no-webgl keeps it and shows DOM cards), all scene imports in boot are dynamic so the eager JS chunk is ~1 KB gzip (three 182 KB gzip is lazy).
T12 done: docs/QA.md lists all 20 tests with results. 17 verified, 3 partially/not (trackpad, real touch drag, PageDown-in-headless; landing squash is single-frame under software rendering — rings verified). Original build + check passed.
T13 implementation: labels now anchor to each slab's projected outer-right corner, with a 20px gap and a stage-width clamp. Structural check and TypeScript syntax transpilation pass; full npm check/build and visual verification are blocked by missing dependencies in this workspace (install/runtime bootstrap timed out).
Final state: Astro 7 + TS strict + vanilla Three.js + GSAP; seven rooms on seven slabs; scroll-triggered lift/slam; camera follow, hover, pick, keyboard; detail view with whoosh; responsive; fallbacks.
Known issues: see docs/QA.md "partially verified" rows; WebGL context loss under swiftshader (environment) — re-verify visuals on real GPU; T13 label placement still needs a browser visual check.
How to run: npm install, npm run dev (localhost:4321), npm run build, npm run check, node scripts/verify-stack.mjs (dev server up), npm run shots.

## Needs (changes requested outside a task's files)
- Add `shots/` to .gitignore (T00 file, never listed by a card).
- T03: index.astro gained `<script> import '@/main';</script>`.
- T04: stage.ts edits (removed test cube, fixed ring y).
- T05: boot.ts runs room idle loops per tick.
- T07: created src/scene/loop.ts and src/main.ts.
- T08: state.ts (forceExpose), slab.ts (per-slab badge material), loop.ts, preview.ts, main.ts.
- T09: props/monitor.ts screen named 'screen'; props/keyboard.ts added to the kit.
- T10: loop.ts (stage.update hook), boot.ts, renderer.ts (PCFShadowMap), Hud.astro (progress fill script).
- T11: stage.ts (tier dust count), boot.ts (all-dynamic scene imports, mobile zoom, no-webgl fallback), loop.ts (reduced-motion gate), Hero.astro (poster.png), main.ts (lazy ui init), sections.css (no-webgl layout).

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
| T13 | Move layer-name pills clear of the stack | in progress |

## Blocked
(none)

## Not verified yet
- T08/T12: focused-canvas pixels (WebGL context loss under swiftshader; all logic verified numerically).
- Landing squash/jolt/prop-punch pixels (single-frame effects under software rendering; rings verified, code implemented per docs/MOTION.md).
- Whoosh wall-clock and trackpad/real-touch-drag on real hardware.
