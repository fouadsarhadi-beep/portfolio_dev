# T24 Scene lifecycle and performance refinement

Goal: the polished 3D environment stays efficient and maintainable.
Read first: AGENTS.md (Performance), docs/DESIGN.md (Light and render).
Files: src/scene/scene-theme.ts, renderer.ts, boot.ts, loop.ts, lights.ts, stage.ts as needed.
Scope: material/geometry/texture lifecycle, theme-switch resource management (no duplicate resources or leaks), animation loops, event listeners, resize handling, render cost, shadow/light cost, pixel ratio, texture sizes, repeated calculations, mobile complexity. Avoid architecture rewrites.
Done when:
- Theme switching causes no resource growth (program/material counts stable).
- No duplicated loops or listeners.
- Scene init and disposal predictable.
- Rendering reasonable; behavior unchanged.
Do not touch: rooms/, ui/, sections/.
