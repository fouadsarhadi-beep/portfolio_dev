# T09 Remaining rooms (run once per room: a translation, b seo, c design, d frontend, e cms, f infrastructure)
Goal: one finished room per run.
Read first: AGENTS.md, docs/ROOMS.md (Rules and the one room you are building), src/scene/rooms/content/README.md.
Files: create src/scene/rooms/<id>/index.ts, layout.ts, anim.ts, README.md. Edit rooms/index.ts (one line). Add new props only to rooms/props/ and export them in props/index.ts.
Steps
1. Copy the structure of rooms/content/. Do not import from it.
2. Build the room from ROOMS.md with the layer color from config.
3. Reuse props from the kit. Add a prop to the kit only when two rooms need it.
Done when
- 35 or more meshes, four or more idle loops, no prop above WALL_H x 0.95, at most 6 colors.
- `npm run shots` reviewed. List three defects and fix them.
- `npm run check` shows no cross-room import.
Do not touch: other rooms' folders, stack/, ui/.
