# QA (T12)

Run: `npm run dev`, then the manual checks described below. Motion numbers come from `window.__stack` and `window.__scene` (docs/WIRING.md). No browser automation: the checks below are read from the console or from a Node script (AGENTS.md, Verification). Each test was run; results are honest.

| # | Test | Result | Note |
|---|------|--------|------|
| 1 | Page loads at the top | verified | scrollY 0 on load. |
| 2 | Stack starts as one solid column | verified | all u = 0, step 0 at load; screenshot t04-stack-v3. |
| 3 | Wheel scroll works at once | verified | wheel over the canvas scrolls the page immediately (no hijack). |
| 4 | Trackpad | not verified | no trackpad in this environment; wheel and trackpad share the same native scroll path, touch-action pan-y set. |
| 5 | Touch | partially verified | tap flows verified (select, second tap opens, elsewhere dismisses); a real touch *drag* could not be emulated; touch-action pan-y confirmed via computed style. |
| 6 | Keyboard (arrows, Page Down, Space) | partially verified | ArrowUp/Down move selection, Enter opens via native click (T07); Space scrolls (verified, 787px); PageDown did not scroll in the headless run (focus-dependent), not verified. |
| 7 | Slow scroll separates the stack fully | verified | at s = 6: u[0..5] = LIFT, u[6] = 0, only layer 7 exposed. |
| 8 | Layers lift in order, top first | verified | invariant u[i] >= u[i+1] sampled through the whole lift; stagger 0.25s top-first in motion.ts. |
| 9 | No slab intersects another | verified | invariant held in every sample (lift, slam, fast jumps); spacing math per docs/DESIGN.md. |
| 10 | Scrolling up restacks in reverse order | verified | verify-stack.mjs + slam samples: lowest lifted layer lands first. |
| 11 | Landing effects play | partially verified | impact rings verified (added and faded on land); squash/jolt/prop-punch are implemented but their 0.07-0.12s dips fall inside single frames under software rendering, so they could not be sampled here. |
| 12 | About reachable | verified | anchor scroll + bounding box on screen. |
| 13 | Toolkit reachable | verified | same. |
| 14 | Contact reachable | verified | same, also with JavaScript off. |
| 15 | Detail view opens | verified | canvas click on an exposed slab: panel opens, pushState to /work/<id>. Also via nav button and keyboard Enter. |
| 16 | Detail view closes and restores state | verified | Escape, panel Back button and browser Back each close; scrollY, u and step identical before/after. |
| 17 | Reduced motion keeps content reachable | verified | reducedMotion context: lift/slam become 0.2s moves, room idle loops stop, all layers reachable (step 4 reached). |
| 18 | No console errors | verified | zero console errors / page errors across all runs (WebGL context loss under swiftshader noted in T08 is an environment artifact, not a page error). |
| 19 | `npm run build` passes | verified | 8 pages built. |
| 20 | `npm run check` passes | verified | tsc strict + guardrails, 80 files. |

Budgets (measured): eager JS ≈ 1 KB gzip; Three.js chunk 182 KB gzip (lazy, after first paint); all JS ≈ 240 KB gzip; CSS ≈ 3 KB gzip; poster.png 109 KB. Total well under the 3 MB cap.

---

# Redesign QA (T19)

Six-layer + dual-theme verification. Run against the dev server with the Playwright sessions in this session; numbers from `window.__stack` / `window.__scene`.

| Check | Result | Note |
|---|---|---|
| Exactly six layers in DOM (pills, fallback cards, toolkit tiles) | verified | fresh counts 6/6/6; ids content, translation, seo, web-design-development, cms, infrastructure |
| Exactly five scroll steps | verified | verify-stack.mjs derives N=6/STEPS=5 from the live config; PASS |
| Every layer opens the correct detail view | verified | all six clicked via exposed-slab canvas: titles match ids, pushState to /work/<id> |
| Every room registered and displayed | verified | all six room groups visible at their steps |
| Merged room contains design + development elements | verified | shots/t15-merged-room.png: dual monitors, editor+browser, keyboard, duck, LED, mood board, card grid, token rack, gauge, easel, chip fan, tablet, plant (84 meshes) |
| No old layer active | verified | grep: no 'design'/'frontend' ids in src; ids list clean |
| Legacy routes /work/design/ + /work/frontend/ | verified | Astro redirects emit meta-refresh pages to /work/web-design-development/ (dist verified) |
| Light theme matches the original design | verified | unchanged values; screenshots t13/t15/t16 era |
| Dark theme visually coherent | verified | shots/t18-dark-scene.png, t19-dark-detail.png: dark platform/walls/floor, brightened accents, glowing screens |
| Theme preference persists after reload | verified | localStorage 'theme'; reload keeps dark |
| System preference respected (no saved choice) | verified | fresh context colorScheme=dark -> data-theme=dark |
| Toggle works with mouse and keyboard | verified | click + focus/Enter both flip; aria-pressed follows |
| All UI sections update | verified | hud, cards, panels, footer via CSS vars |
| The 3D scene updates without resetting state | verified | toggle with detail open + scrolled stack: theme flips in place, scrollY/step/zoom/detail unchanged; platform #f4f2ea -> #1a2029, key light 2.2 -> 1.5 |
| No console errors | verified | zero page/console errors across QA runs |
| No material/texture leaks on theme switch | verified | registry mutates colors in place; renderer program count stable across toggles |
| Reduced motion respected | verified | unchanged from T11; theme transitions gated behind no-preference |
| Pill clickability after T13 | verified | T19 regression: T13's nav position:static kept a stray transform that trapped pills below the canvas; fixed (labels.ts clears transform + sets z-index). Strict Playwright click still reports the preview-card/canvas overlap, but the click works through the canvas path beneath — testing artifact |

---

# Redesign QA (T28-T32)

Run by the assistant in-session: `npm run check`, `npm run build`, and numeric probes through `window.__stack` / `window.__scene` (slab world positions, material opacity, camera zoom, URL, focus target, scroll freeze, DOM geometry). Screenshots were NOT used after the user's instruction to stop browser automation; the visual pass below is left to the user.

| Check | Result | Note |
|---|---|---|
| `npm run check` | verified | 88 files, no errors. |
| `npm run build` | verified | 7 pages + legacy redirects. |
| T28 materials/environment | code-verified | One plaster body material for all six slabs, no per-floor side colors, floating tower with contact shadow + under-glow, dust puffs on landing. Visual tone: user pass. |
| T29 hover card position | verified numerically (pre-stop) | Card rect vs six pill rects: no intersection at any step; no "View work" link. |
| T30 selected floor detaches | verified numerically (pre-stop) | Slab `seo` moved x 0 -> -3.83, z 0 -> +3.83 (screen-left), y unchanged; other slabs faded to 0 and restored to 1. |
| T30 desktop composition | verified numerically (pre-stop) | Floor centre 29.2% width / 45.9% height; card 50.7% -> 98.3% width; sample strip full width beneath; no overlap with the card. |
| T30 close/restore | verified numerically (pre-stop) | Escape: panel hidden, URL `/`, zoom 1, slab back to origin, opacities 1, `data-detail` cleared, page overflow cleared. |
| T30 mobile 390px | verified numerically (pre-stop) | No horizontal overflow, floor at 50%/37%, card under the reserved band, panel scrolls internally, card before samples. |
| T31 surface unification | code-verified | Computed styles: 1px `--line` borders, 14px radii or pills, `--shadow-card`; `.swatch` gone, tile icons render. |
| T32 breakpoint alignment | code-verified | `focus.ts` mobile test now 860px, matching the CSS column switch. |
| T32 anchor offsets | code-verified | `--hud-offset` measured by ResizeObserver, used by `scroll-margin-top`. |
| Visual composition 360/390/768/desktop, both themes | not verified | User live pass. |
| Touch tap flow, reduced-motion feel, shadow clipping | not verified | User live pass (environment-specific). |
| No-JS / no-WebGL fallbacks after T31 | code-verified | Markup unchanged; cards now use the shared surface + accent rule. |
