# T08 Detail view and whoosh
Goal: opening a layer whooshes the camera in and shows its content.
Read first: AGENTS.md, docs/MOTION.md (Detail view, Reduced motion), docs/WIRING.md (Routes).
Files: src/scene/focus.ts, src/ui/detail.ts, src/ui/dialog.ts, src/styles/hud.css (panel styles), edit api.ts.
Steps
1. focus.ts: `focusLayer(id)` and `releaseFocus()` with the 0.5s expo.out whoosh, blur, fade of other slabs.
2. detail.ts: right-side panel (below on mobile) built from LayerConfig. Staggered entrance. pushState and popstate.
3. ui/dialog.ts: dialog semantics, focus in and return.
4. Scroll handling exactly as in MOTION.md: freeze, remember, restore, recompute step.
Done when
- Open, close with Back, Escape and browser Back. After each, scroll position and stack state match what they were.
- The whoosh feels fast: under 0.55s. State the measured duration.
Do not touch: rooms/.
