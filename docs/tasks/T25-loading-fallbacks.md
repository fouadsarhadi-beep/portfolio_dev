# T25 Loading, fallback, and asset refinement

Goal: the experience feels complete from the first paint, including when rendering fails.
Read first: AGENTS.md (Load Three.js after first paint; fallbacks), docs/DESIGN.md.
Files: src/sections/Hero.astro, src/styles/*.css, src/scene/boot.ts, public/poster.png as needed.
Scope: initial loading state, transition to the live scene, layout stability, font/image loading, asset sizes, WebGL availability path, failure fallback. Avoid sudden appearances and layout shifts; keep the fallback coherent with the visual identity without duplicating the experience.
Done when:
- Loading feels deliberate; no disruptive layout changes.
- Assets reasonably sized.
- Page usable when WebGL fails; fallback matches the visual identity.
Do not touch: rooms/, ui/.
