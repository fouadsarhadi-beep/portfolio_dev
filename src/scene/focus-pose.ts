/** @module scene/focus-pose: pose maths for the tower's zoom and the detail view: the base zoom, the (zeroed) column shift and the vertical bias that put one floor in the band's floor share. @see src/scene/focus.ts, src/config/layout.ts, src/config/tuning.ts */
import { CAM_VIEW_HEIGHT, FOOTPRINT, OVERVIEW_BASE_ZOOM, SLAB_T } from '@/config/tuning';
import { DETAIL_MOBILE_BAND, detailColumnCentrePx, detailColumnPx } from '@/config/layout';

const ZOOM_DESKTOP = 1.45;
const ZOOM_MOBILE = 1.35;
const COL_FILL = 0.86;        // the floor fills most of, not all of, its share
const FLOOR_W = FOOTPRINT * Math.SQRT2; // 8.49: projected slab width in the isometric view
const FLOOR_H = (FOOTPRINT + SLAB_T) * 0.8165; // 6.81: projected slab height with its walls
const TOWER_FILL = 0.53;      // share of its cell's width the tower fills (three size cuts + one 10% camera zoom-out, air around it)

/**
 * T39: the floor pills left the stage cell for their own column, so the tower
 * sits centred in its cell. The shift stays in the camera's contract (the detail
 * view neutralises it and restores it on close), but it is always 0 px now.
 */
export function stageShiftPx(): number {
  return 0;
}

/**
 * The base overview zoom for a cell. The tower always fills TOWER_FILL of its
 * cell's width, so the air around it is constant at every viewport: the tower
 * never shrinks below that share when the screen gets smaller, and on large
 * screens it is capped at OVERVIEW_BASE_ZOOM so it does not grow without bound.
 * Pure maths, no scene access; boot applies it and re-fits it on resize.
 */
export function overviewFitZoom(cellW: number, cellH: number): number {
  const fit = (TOWER_FILL * cellW * CAM_VIEW_HEIGHT) / (cellH * FLOOR_W);
  return Math.min(OVERVIEW_BASE_ZOOM, fit);
}

// Screen-left in world space; screen-right is (SQRT1_2, 0, -SQRT1_2) (src/scene/stack/pick.ts).
export const VIEW_LEFT = { x: -Math.SQRT1_2, z: Math.SQRT1_2 };

export interface DetailPose {
  /** Camera zoom for the detail view. */
  zoom: number;
  /** Sideways travel that centres the floor in the left column. */
  shift: number;
  /** Vertical travel that lifts the floor into the top band on mobile. */
  bias: number;
}

/**
 * Pose for one floor in the expanded view. The canvas fills the window while a
 * floor is open (src/styles/hud.css), so the box it draws in is the viewport
 * and the CSS grid's floor column can be measured inside it.
 */
export function detailPose(canvasW: number, canvasH: number, mobile: boolean): DetailPose {
  if (mobile) {
    // The floor lives in the strip reserved at the top (--detail-band): it has
    // to fit that strip's height and the page's width, whichever is tighter.
    const band = canvasH * DETAIL_MOBILE_BAND;
    const fitW = (COL_FILL * canvasW * CAM_VIEW_HEIGHT) / (FLOOR_W * canvasH);
    const fitH = (COL_FILL * band * CAM_VIEW_HEIGHT) / (FLOOR_H * canvasH);
    const zoom = Math.min(ZOOM_MOBILE, fitW, fitH);
    // Lift the floor into the middle of that strip.
    const bias = ((0.5 - DETAIL_MOBILE_BAND / 2) * CAM_VIEW_HEIGHT) / zoom;
    return { zoom, shift: 0, bias };
  }
  // The floor owns the detail grid's first column: the page band, minus the
  // shared gap, times the floor's share (src/config/layout.ts).
  const column = detailColumnPx(canvasW);
  const centre = detailColumnCentrePx(canvasW);
  const fit = (COL_FILL * column * CAM_VIEW_HEIGHT) / (FLOOR_W * canvasH);
  const zoom = Math.min(ZOOM_DESKTOP, fit);
  // Travel: from the middle of the canvas to the middle of that column.
  const shift = ((canvasW / 2 - centre) * CAM_VIEW_HEIGHT) / (canvasH * zoom);
  return { zoom, shift, bias: 0 };
}