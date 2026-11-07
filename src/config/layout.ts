/** @module config/layout: the page shell proportions, read by both the CSS bands and the camera that frames a floor inside one. @see src/styles/tokens.css (--page-inset), src/styles/layout.css, src/scene/focus-pose.ts */

/* One grid for the whole page: a margin each side, so the grid lives in the
   middle band, and that band is three flexible cells. The expanded floor view is
   the same band split in two: the floor keeps a share, the card takes the rest.
   tokens.css mirrors these numbers as --page-inset and --shell-cols; the camera
   that must place the floor inside its share imports them, so the two cannot drift. */
export const PAGE_INSET = 0.1;

/* Three flexible cells inside the band (--shell-cols in tokens.css). */
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