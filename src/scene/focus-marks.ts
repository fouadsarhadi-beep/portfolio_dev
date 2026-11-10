/** @module scene/focus-marks: the DOM flags the expanded floor sets: the tower chrome leaves the frame, the canvas fills the window so the floor can be framed against the page band, and the rail steps aside. @see src/scene/focus.ts, src/styles/hud.css, src/styles/ladder.css */

/** The stage chrome (nav, hero copy, info panel) leaves the frame. */
export function markDetail(on: boolean): void {
  const host = document.querySelector<HTMLElement>('.stage-sticky');
  if (host) {
    if (on) host.dataset.detail = 'true';
    else delete host.dataset.detail;
  }
  // The scroll rail lives outside the stage, so it needs the flag on the root.
  if (on) document.documentElement.dataset.detail = 'true';
  else delete document.documentElement.dataset.detail;
}

/**
 * The canvas leaves the tower's stage cell and fills the window while a floor
 * owns the frame (src/styles/hud.css). It comes back only after the closing
 * tween has landed, so the floor never jumps between two boxes.
 */
export function markCanvas(on: boolean): void {
  const host = document.querySelector<HTMLElement>('.stage-sticky');
  if (!host) return;
  if (on) host.dataset.detailCanvas = 'true';
  else delete host.dataset.detailCanvas;
}
