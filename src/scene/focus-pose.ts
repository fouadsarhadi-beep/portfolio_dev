/** @module scene/focus-pose: detail-view pose maths: the zoom, column shift and vertical bias that put one floor in the band's floor share. @see src/scene/focus.ts, src/config/layout.ts */
import { CAM_VIEW_HEIGHT, FOOTPRINT } from '@/config/tuning';
import { DETAIL_FLOOR_BAND, DETAIL_FLOOR_CENTRE } from '@/config/layout';

const ZOOM_DESKTOP = 1.45;
const ZOOM_MOBILE = 1.35;
const COL_FILL = 0.86;        // the floor fills most of, not all of, its share
const FLOOR_W = FOOTPRINT * Math.SQRT2; // 8.49: projected slab width in the isometric view
const UP_BIAS_MOBILE = 0.16;  // lift it into the top band on mobile
const STAGE_EDGE_GAP = 6;     // px between the tower and its cell's start edge

/**
 * How far to shift the tower from the centre of its cell, in px, so it hugs the
 * cell's start edge and leaves the leftover width (the floor pills) on the end
 * side. The camera is height-driven, so the tower's projected width is fixed by
 * the height; the cell's width is the leftover.
 */
export function stageShiftPx(cellW: number, cellH: number): number {
  const towerPx = (FLOOR_W * cellH) / CAM_VIEW_HEIGHT;
  const air = Math.max(0, cellW - towerPx);
  return Math.max(0, air / 2 - STAGE_EDGE_GAP);
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