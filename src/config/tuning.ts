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

// Render
export const EXPOSURE = 1.05;
export const MAX_PIXEL_RATIO = 1.75;
export const SHADOW_MAP_DESKTOP = 2048;
export const SHADOW_MAP_MOBILE = 1024;
