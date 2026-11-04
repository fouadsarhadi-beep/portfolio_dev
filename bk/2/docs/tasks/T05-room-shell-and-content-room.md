# T05 Room shell, prop kit, Content room (the golden example)
Goal: the top layer carries a finished room. Every other room will copy its structure.
Read first: AGENTS.md, docs/DESIGN.md (Prop quality rules, Light), docs/ROOMS.md (Rules, 1 content), docs/WIRING.md (RoomBuilder).
Files: src/scene/rooms/shell.ts, props/*.ts and props/index.ts, rooms/index.ts, rooms/content/index.ts, layout.ts, anim.ts, README.md (10 lines: how to copy this room). Edit stack.ts to mount rooms.
Steps
1. shell.ts: wood floor with tile pattern (instanced), two thick back walls with the AO strips, a lighter top cap on the walls.
2. props/: desk, chair, monitor (canvas screen), laptop, plant, lamp, shelf with instanced books, rug, mug, paper sheets, wall frame, corkboard, window. Each follows the prop quality rules.
3. content/: build the room from ROOMS.md. anim.ts holds the five idle loops.
4. The room group scale.y follows exposure (MOTION.md State). Layer 0 is always exposed.
Done when
- The Content room is visible on the top slab with 35 or more meshes and four or more idle loops.
- No prop is taller than WALL_H x 0.95.
- `npm run shots` reviewed: the room reads as a lit dollhouse, not flat shapes. List three defects you see and fix them before you finish.
Do not touch: ui/, sections/.
