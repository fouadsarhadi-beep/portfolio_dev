# T03 Scene foundation
Goal: an orthographic isometric scene renders a platform and a test cube, without touching scroll.
Read first: AGENTS.md, docs/DESIGN.md (Camera, Light and render, Environment), docs/WIRING.md.
Files: src/scene/boot.ts, renderer.ts, camera.ts, lights.ts, stage.ts, src/lib/ticker.ts, quality.ts, reduced-motion.ts, bus.ts, src/scene/api.ts (stub).
Steps
1. boot.ts: dynamic import after first paint. Detect WebGL. On failure, keep the poster and the DOM content, log once, stop.
2. renderer.ts: cap pixel ratio at 1.75 (1.25 on mobile), shadows on, tone mapping per DESIGN.md. Resize with ResizeObserver.
3. camera.ts: orthographic, position = target + (1,1,1) x 30.
4. lights.ts and stage.ts per DESIGN.md. A test cube sits on the platform.
5. ticker.ts: one rAF loop, pauses when offscreen (IntersectionObserver) or the tab is hidden.
6. quality.ts: `tier` high or low by screen width and `hardwareConcurrency`.
Done when
- The canvas shows the platform and cube, no console errors.
- Mouse wheel, trackpad and touch drag scroll the page while the pointer is over the canvas. Test it. Canvas has `touch-action: pan-y`.
Do not touch: sections/, rooms/.
