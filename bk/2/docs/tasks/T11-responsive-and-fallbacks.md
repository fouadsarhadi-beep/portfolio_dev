# T11 Responsive, reduced motion, performance, fallbacks
Goal: it works on a 360px phone, with reduced motion, without WebGL and without JavaScript.
Read first: AGENTS.md (Hard rules), docs/DESIGN.md (Responsive), docs/MOTION.md (Reduced motion).
Files: src/lib/quality.ts, reduced-motion.ts, src/scene/camera.ts, src/scene/boot.ts, public/poster.png, src/styles/*.css.
Steps
1. Mobile camera framing and low quality tier (shadow 1024, pixel ratio 1.25, fewer particles).
2. Reduced motion per MOTION.md.
3. Poster: render the closed stack once, save as public/poster.png, show it until the canvas is ready and as the WebGL fallback.
4. Budgets: initial JavaScript at most 250 KB gzip before the Three.js chunk. Total transfer at most 3 MB. Report measured numbers.
Done when
- 360px layout has no horizontal scroll. Reduced-motion mode keeps every layer reachable.
- With WebGL disabled, the poster and all content show. With JavaScript off, all content shows.
Do not touch: rooms/.
