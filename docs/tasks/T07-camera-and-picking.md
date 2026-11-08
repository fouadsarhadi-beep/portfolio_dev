# T07 Camera follow, hover, click from the side, keyboard
Goal: the camera follows the exposed room. Every slab can be hovered and clicked at any time.
Read first: AGENTS.md, docs/MOTION.md (Camera, Pick hover touch), docs/WIRING.md (api and bus).
Files: src/scene/camera.ts (follow), src/scene/stack/pick.ts, labels.ts, src/scene/api.ts, src/ui/preview.ts, keyboard.ts, src/lib/bus.ts (events).
Steps
1. Camera target follows the exposed layer (damped). Tune view height by screenshot.
2. pick.ts: raycast against slab bodies. Hover lift, edge highlight, dim others 6 percent.
3. labels.ts: position each layer-nav button from `getLayerRect(id)`.
4. preview.ts: preview card (number, title, short line, "View work"). Touch: first tap previews, second opens.
5. keyboard.ts: Tab, ArrowUp, ArrowDown, Enter, Escape, focus return.
Done when
- While closed, hovering the side of any slab previews it. While open, the same.
- Touch behavior and keyboard behavior work as in MOTION.md. List which you tested.
Do not touch: rooms/.

> Superseded by T39 (2026-11-09): the slab-pinned labels system was removed; the layer nav is a static column menu and preview.ts owns the always-on floor info panel.
