/** @module config/layout: the page shell proportions, read by both the CSS bands and the camera that frames a floor inside one. @see src/styles/tokens.css (--page-inset), src/styles/layout.css, src/scene/focus-pose.ts */

/* One grid for the whole page: a margin each side, so the grid lives in the
   middle band, and that band is three flexible cells. The stage (T39, user
   sketch 2026-11-08) composes the same band as 15fr 50fr 15fr -- of the band,
   so with the two shared gaps on top each cell lands at about 14.25% / 47.5% /
   14.25% of the viewport; the tower's cell is the middle one, and the right
   margin carries the scroll ladder. The expanded floor view is the band split
   in two: the floor keeps a share, the card takes the rest.
   tokens.css mirrors these numbers as --page-inset and --shell-cols; the camera
   that must place the floor inside its share imports them, so the two cannot
   drift. (One documented exception: layout.css tightens --page-inset to 6vw
   below 600px; the camera keeps 0.1, which only matters for lateral shifts the
   mobile detail view does not use.) */
export const PAGE_INSET = 0.1;

/* Three flexible cells inside the band (--shell-cols in tokens.css). The stage
   narrows the outer two to the guide/copy and nav columns (layout.css, 15fr). */
export const SHELL_COLS = 3;

/* The floor's share of the band in the expanded view; the card takes the rest.
   The matching CSS split is 45fr 55fr in src/styles/hud.css (.detail-view). */
export const DETAIL_FLOOR_SHARE = 0.45;

/* The strip the expanded floor reserves at the top of a small screen. Mirrors
   --detail-band in src/styles/tokens.css. */
export const DETAIL_MOBILE_BAND = 0.44;

/** The breakpoint where the expanded view switches to the mobile column.
 *  Mirrors the media queries in src/styles/hud.css (max-width: 860px) and
 *  src/styles/sections.css; the scene reads it for its mobile test (boot.ts). */
export const DETAIL_BREAKPOINT = 860;

/** Width of the band as a share of the viewport: 0.8. */
export const SHELL_BAND = 1 - 2 * PAGE_INSET;

/**
 * The gap between the shell's cells: clamp(12px, 2vw, 40px) in tokens.css.
 * The camera needs it because the grid splits what is left after the gap.
 */
export function pageGapPx(viewportW: number): number {
  return Math.min(Math.max(viewportW * 0.02, 12), 40);
}

/**
 * The expanded view's floor column: the band, minus the shared gap, times the
 * floor's share. This is the box the CSS grid gives the floor and the box the
 * camera frames it in, so the two cannot drift.
 */
export function detailColumnPx(viewportW: number): number {
  const band = viewportW * SHELL_BAND;
  return (band - pageGapPx(viewportW)) * DETAIL_FLOOR_SHARE;
}

/** Where that column is centred, measured from the viewport's left edge. */
export function detailColumnCentrePx(viewportW: number): number {
  return viewportW * PAGE_INSET + detailColumnPx(viewportW) / 2;
}