# T10 Environment and polish
Goal: the stack lives in a world, and the page sections match the same art direction.
Read first: AGENTS.md, docs/DESIGN.md (Environment, HUD and UI style, Sections).
Files: src/scene/stage.ts (particles, floating shapes, vignette), src/sections/*.astro (visuals), src/styles/*.css.
Steps
1. Particles (instanced), three to five floating shapes with parallax, platform ring markings.
2. HUD: segmented progress bar, availability dot, hover states. About, Toolkit and Contact get their compositions from DESIGN.md.
3. Keep the stack the one memorable thing. Remove any decoration that competes with it.
Done when
- Screenshots at three scroll positions show a coherent scene. Sections below the hero match the stack's colors and shapes.
Do not touch: rooms/, stack/state.ts, motion.ts.
