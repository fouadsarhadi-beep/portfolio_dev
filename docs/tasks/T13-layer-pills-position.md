# T13 — Move layer-name pills clear of the stack

## Goal
Move the DOM layer-name pills farther to the right so they sit visibly outside the 3D pillar rather than appearing behind it. Preserve their alignment with the corresponding slabs and keep them within the viewport where possible.

## Files
- `src/scene/stack/labels.ts`
- `src/scene/api.ts`
- `src/scene/stack/pick.ts`
- `src/sections/Hero.astro`
- `src/styles/hud.css`
- `docs/PROGRESS.md`

## Done when
- [ ] Pills are positioned to the right of the projected slab edge with a clear gap.
- [ ] Pills remain attached to their corresponding slabs while scrolling/lifting.
- [ ] Responsive behavior and viewport-edge handling remain intact.
- [ ] `npm run check` passes.
- [ ] Production build passes, if dependencies/runtime are available.
- [x] `docs/PROGRESS.md` records the change and verification status.

## Verification notes
- `node scripts/check.mjs`: passed (80 source files; existing line-count warnings remain).
- TypeScript syntax transpilation for both changed files: passed.
- `git diff --check`: passed.
- `npm run check`: blocked by absent installed type packages and Astro config.
- `npm run build`: blocked because Astro is not installed in this workspace.
- Visual/browser verification: pending; package installation and compatible Node runtime bootstrap timed out.

> Superseded by T39 (2026-11-09): labels.ts and layer-rect.ts were deleted; the nav is a static column menu (no slab pinning, no clamp).
