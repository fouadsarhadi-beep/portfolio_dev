# Copying this room (template)

1. `mkdir src/scene/rooms/<id>` and copy `index.ts`, `layout.ts`, `anim.ts` from `rooms/content/`.
2. Rename the `@module` lines to `<id>`, the group name, and swap the prop calls in `layout.ts` for your room's props (docs/ROOMS.md is the spec per room).
3. Keep the four rules: props only from `../props/index.ts`, max 6 color families, props under WALL_H x 0.95, at least 4 idle loops in `anim.ts`.
4. Register the builder in `src/scene/rooms/index.ts`. Nothing else changes (docs/WIRING.md).
