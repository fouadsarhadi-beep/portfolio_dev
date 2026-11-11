/** @module config/tuning: geometry, scroll step, camera and render tuning constants. @see docs/DESIGN.md, docs/MOTION.md, src/config/types.ts */
import type { Vec3 } from './types';

// Geometry (locked, see docs/DESIGN.md)
export const FOOTPRINT = 6;            // slab width and depth, world units
export const SLAB_T = 2.34;            // slab thickness; wall height equals it (1.8 x 1.3, +30% on 2026-11-11)
export const WALL_H = SLAB_T;
export const WALL_THICK = 0.14;
// Sharp corners: the slabs read as cut stone, not rounded plastic (user review).
export const CORNER_R = 0;
export const LIFT = FOOTPRINT + SLAB_T + 0.4; // 8.74: how far a lifted layer rises

// Floating tower (T28): the whole stack is suspended this high above the
// soft contact shadow; no platform, no ground plane. See docs/DESIGN.md.
// Derived from the slab so a thicker slab never eats the clearance under the
// tower: the bottom slab's underside stays 0.45 above CONTACT_Y (stage.ts).
export const STACK_BASE_Y = SLAB_T / 2 + 0.45; // 1.62

// Room shell dimensions, derived here so the deck, the two back walls and every
// wall-mounted prop agree (rooms/shell.ts and the room layouts all read these;
// docs/ROOMS.md Rules). A room does not own its shell geometry, so the numbers
// live with the other geometry constants instead of inside a room folder.
/** Half the wood deck's width: the deck is inset from the slab edge (a tray rim). */
export const FLOOR_HALF = FOOTPRINT / 2 - 0.26;
/**
 * Center of a back wall. The wall's OUTER face sits exactly on the slab's edge
 * (FOOTPRINT/2), so the room box stands on the slab's rim, flush with the
 * floor's two back edges (user review 2026-11-11).
 */
export const WALL_CENTER = FOOTPRINT / 2 - WALL_THICK / 2;
/** Inner face of a back wall; wall-mounted props hang against this. */
export const WALL_FACE = WALL_CENTER - WALL_THICK / 2;
/** A back wall spans the slab's full width. */
export const WALL_LEN = FOOTPRINT;

// Scroll mapping (docs/MOTION.md)
export const STEP_VH = 80;             // one scroll step, in svh units

// Camera: orthographic, direction locked at (1,1,1). Never rotate camera or stack.
export const CAM_DIR: Vec3 = { x: 1, y: 1, z: 1 };
export const CAM_DISTANCE = 30;
export const CAM_TARGET_OFFSET_Y = 0.9;                  // above the exposed floor
export const CAM_VIEW_HEIGHT = LIFT + 3 * SLAB_T + 4;    // 19.76
export const CAM_DAMP_LAMBDA = 6;                        // target Y damping

// Framing (user review 2026-11-06): the opening view sat low, leaving a tall
// empty band above the tower. The whole view is drawn this much higher.
// Expressed as a share of the visible height so the composition holds at any
// viewport. (T39 moved the hero copy to the top of the left column, so the
// CSS --hero-lift mirror is gone; the camera offset stays.)
export const CAM_FRAME_OFFSET_Y = CAM_VIEW_HEIGHT * 0.22; // ≈ 200px at 900px tall

// End of the scroll (user review 2026-11-07, sharpened 2026-11-11): after the
// last floor opens, one more step pulls the camera right back and spreads the
// six floors into an exploded column (the hamburger ad), so every room reads at
// once. The step itself stays on the last layer.
export const OVERVIEW_STEPS = 1;
export const OVERVIEW_ZOOM = 0.5;
// Extra air between floors in the overview. It has to clear a room's back walls
// (WALL_H = SLAB_T = 2.34) or the exploded floors would clip the slab above them.
export const OVERVIEW_GAP = 2.6;

// Base view zoom (user sketch 2026-11-08, resized four times: 15%, 10%, 10%,
// then the camera zoomed out 10% from the tower): the tower renders this much
// bigger than the raw frustum fit, so the 50% stage column carries the stack.
// Mirrors --tower-w in tokens.css; capped per cell by overviewFitZoom
// (src/scene/focus-pose.ts) so the silhouette never bleeds out of its column.
export const OVERVIEW_BASE_ZOOM = 0.86; // 0.96 x 0.9
// The low tier keeps its own, smaller zoom: fewer pixels, wider safety margin.
export const LOW_TIER_BASE_ZOOM = 0.81; // 0.9 x 0.9

// Render
export const EXPOSURE = 1.05;
export const MAX_PIXEL_RATIO = 1.75;
export const SHADOW_MAP_DESKTOP = 2048;
export const SHADOW_MAP_MOBILE = 1024;
