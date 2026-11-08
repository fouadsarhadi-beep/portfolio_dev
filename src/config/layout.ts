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

/** Width of the band as a share of the viewport: 0.8. */
export const SHELL_BAND = 1 - 2 * PAGE_INSET;

/** The floor's slice of the viewport width in the expanded view: 0.36. */
export const DETAIL_FLOOR_BAND = SHELL_BAND * DETAIL_FLOOR_SHARE;

/** Where the floor is centred across the viewport in the expanded view: 0.28. */
export const DETAIL_FLOOR_CENTRE = PAGE_INSET + DETAIL_FLOOR_BAND / 2;