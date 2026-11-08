/** @module scene/focus-pose: pose maths for the tower's zoom and the detail view: the base zoom, the (zeroed) column shift and the vertical bias that put one floor in the band's floor share. @see src/scene/focus.ts, src/config/layout.ts, src/config/tuning.ts */
import { CAM_VIEW_HEIGHT, FOOTPRINT, OVERVIEW_BASE_ZOOM } from '@/config/tuning';
import { DETAIL_FLOOR_BAND, DETAIL_FLOOR_CENTRE } from '@/config/layout';

const ZOOM_DESKTOP = 1.45;
const ZOOM_MOBILE = 1.35;
const COL_FILL = 0.86;        // the floor fills most of, not all of, its share
const FLOOR_W = FOOTPRINT * Math.SQRT2; // 8.49: projected slab width in the isometric view
const UP_BIAS_MOBILE = 0.16;  // lift it into the top band on mobile
const TOWER_FILL = 0.94;      // share of its cell's width the tower may fill

/**
 * T39: the floor pills left the stage cell for their own column, so the tower
 * sits centred in its cell. The shift stays in the camera's contract (the detail
 * view neutralises it and restores it on close), but it is always 0 px now.
 */
export function stageShiftPx(): number {
  return 0;
}

/**
 * The base overview zoom for a cell: OVERVIEW_BASE_ZOOM, capped so the tower's
 * projected silhouette keeps 6% air to the cell's edges at any box shape. The
 * floor of 1 keeps near-square desktop boxes at the pre-T39 size rather than
 * shrinking below it (an aspect sliver around 1.0-1.05 may still touch the cell
 * edges; accepted, the canvas clips it cleanly). Pure maths, no scene access;
 * boot applies it and re-fits it on resize.
 */
export function overviewFitZoom(cellW: number, cellH: number): number {
  const fit = (TOWER_FILL * cellW * CAM_VIEW_HEIGHT) / (cellH * FLOOR_W);
  return Math.min(OVERVIEW_BASE_ZOOM, Math.max(fit, 1));
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

/** Pose for one floor at the given viewport aspect. Pure maths, no scene access. */
export function detailPose(aspect: number, mobile: boolean): DetailPose {
  // Visible world box at the detail zoom. The desktop zoom is capped so the
  // floor always fits the share of the page band the detail grid gives it.
  const fit = (CAM_VIEW_HEIGHT * aspect * DETAIL_FLOOR_BAND * COL_FILL) / FLOOR_W;
  const zoom = mobile ? ZOOM_MOBILE : Math.min(ZOOM_DESKTOP, fit);
  const effH = CAM_VIEW_HEIGHT / zoom;
  const shift = mobile ? 0 : effH * aspect * (0.5 - DETAIL_FLOOR_CENTRE);
  const bias = mobile ? effH * UP_BIAS_MOBILE : 0; // 0 = vertically centred
  return { zoom, shift, bias };
}