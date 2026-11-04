# QA (T12)

Run: `npm run dev`, then the Playwright sessions described below. Motion numbers come from `window.__stack` and `window.__scene` (docs/WIRING.md). Each test was run; results are honest.

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
