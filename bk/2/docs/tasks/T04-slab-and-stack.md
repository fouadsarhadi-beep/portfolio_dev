# T04 Slab and closed stack
Goal: seven chunky slabs form one aligned column. This is the first time the stack appears.
Read first: AGENTS.md, docs/DESIGN.md (Geometry constants, Slab, Light and render), src/config/tuning.ts, layers.ts.
Files: src/scene/stack/slab.ts, stack.ts, icons.ts (icon path to CanvasTexture), edit src/scene/boot.ts.
Steps
1. slab.ts: `makeSlab(layer): THREE.Group` per DESIGN.md Slab. Icon on +x face, number on +z face.
2. stack.ts: builds all slabs from config. Layer i at y = (N-1-i) x SLAB_T. No x/z offsets, no rotation.
3. Mount it in boot.ts. Frame the camera on the whole column.
Done when
- Seven slabs form a single column with no gaps or overlaps.
- Measured projected width : height of one slab is between 10:7 and 10:8. Measure with a bounding-box projection or a screenshot.
- Slab sides show the icon and the number. Run `npm run shots` and critique: edges soft, light from the top-left, shadow under the stack.
Do not touch: rooms/, ui/, sections/.
