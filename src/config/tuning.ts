/** @module config/tuning: geometry, scroll step, camera and render tuning constants. @see docs/DESIGN.md, docs/MOTION.md, src/config/types.ts */
import type { Vec3 } from './types';

// Geometry (locked, see docs/DESIGN.md)
export const FOOTPRINT = 6;            // slab width and depth, world units
export const SLAB_T = 1.8;             // slab thickness; wall height equals it
export const WALL_H = SLAB_T;
export const WALL_THICK = 0.14;
export const CORNER_R = 0.14;
export const LIFT = FOOTPRINT + SLAB_T + 0.4; // 8.2: how far a lifted layer rises

// Floating tower (T28): the whole stack is suspended this high above the
// soft contact shadow; no platform, no ground plane. See docs/DESIGN.md.
export const STACK_BASE_Y = 1.35;

// Scroll mapping (docs/MOTION.md)
export const STEP_VH = 80;             // one scroll step, in svh units

// Camera: orthographic, direction locked at (1,1,1). Never rotate camera or stack.
export const CAM_DIR: Vec3 = { x: 1, y: 1, z: 1 };
export const CAM_DISTANCE = 30;
export const CAM_TARGET_OFFSET_Y = 0.9;                  // above the exposed floor
export const CAM_VIEW_HEIGHT = LIFT + 3 * SLAB_T + 4;    // 17.6
export const CAM_DAMP_LAMBDA = 6;                        // target Y damping

// Framing (user review 2026-11-06): the opening view sat low, leaving a tall
// empty band above the tower. The whole view is drawn this much higher.
// Expressed as a share of the visible height so the composition holds at any
// viewport. (T39 moved the hero copy to the top of the left column, so the
// CSS --hero-lift mirror is gone; the camera offset stays.)
export const CAM_FRAME_OFFSET_Y = CAM_VIEW_HEIGHT * 0.22; // ≈ 200px at 900px tall

// End of the scroll (user review 2026-11-07): after the last floor opens, two
// more steps pull the camera right back and spread the six floors into an
// exploded column (the hamburger ad), so every room reads at once. The step
// itself stays on the last layer.
export const OVERVIEW_STEPS = 2;
export const OVERVIEW_ZOOM = 0.5;
// Extra air between floors in the overview. It has to clear a room's back walls
// (WALL_H = 1.8) or the exploded floors would clip the slab above them.
export const OVERVIEW_GAP = 2.2;

// Base view zoom (user sketch 2026-11-08): the tower renders this much bigger
// than the raw frustum fit, so the 50% stage column carries a taller stack.
// Mirrors --tower-w in tokens.css; capped per cell by overviewFitZoom
// (src/scene/focus-pose.ts) so the silhouette never bleeds out of its column.
export const OVERVIEW_BASE_ZOOM = 1.4;
// The low tier keeps its own, smaller zoom: fewer pixels, wider safety margin.
export const LOW_TIER_BASE_ZOOM = 1.3;

// Render
export const EXPOSURE = 1.05;
export const MAX_PIXEL_RATIO = 1.75;
export const SHADOW_MAP_DESKTOP = 2048;
export const SHADOW_MAP_MOBILE = 1024;
