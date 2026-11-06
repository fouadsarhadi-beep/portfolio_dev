# T32 — Responsive refinement and final QA

Spec: user brief 2026-11-05 (T28-T32 redesign batch). Implemented 2026-11-06.
Per the user's instruction for this session, the browser/visual pass is left to the user: this task is code review + targeted fixes + documentation, and no automated screenshots or Playwright runs were used.

## What was done
- Camera/layout breakpoint mismatch fixed: `scene/focus.ts` framed the expanded floor with a 760px "mobile" test while the expanded CSS column switches at 860px, so a 761-860px viewport got desktop framing inside a mobile column. `boot.ts` now passes `(max-width: 860px)`.
- HUD height is measured: `Hud.astro` publishes `--hud-offset` (ResizeObserver + initial sync) and `base.css` uses it in `[id] { scroll-margin-top }`. Before this, the wrapped mobile HUD (~100px) was still offset by 56px, so `#about/#toolkit/#contact` links landed under the sticky bar. The measured value is a separate variable on purpose: `--hud-h` feeds the bar's own `min-height`, so writing the measurement into it would grow the bar forever.
- Small-phone pass (`max-width: 480px`) in both stylesheets: section padding 56px, tighter about grid, 16/18px card and tile padding, 24px contact panel, hero copy narrowed to the viewport (inset-inline-end 16px, bottom 72px, sub 14px), smaller work-page padding, 8px socials gap; HUD row/nav gaps tightened; expanded view padding 12px, reserved floor band 40svh, card padding 16px, hairline list gap 0.
- Reduced motion: the layer-nav/hero-copy fade when a floor expands is disabled (no transition).
- Documented that the mobile pill-dock rules only apply when JS has not pinned the pills to the slabs (labels.ts pins them once the scene boots); no behaviour change.
- No new features, no theme redesign, no onboarding popups.

## QA status (honest split)
Automated, in this session:
- `npm run check`: PASS (88 files). `npm run build`: PASS (7 pages, static + 6 work routes + legacy redirects).
- Grep checks: no `2px solid var(--ink)`, `--hard-offset`, 10px colored side bars or `.swatch` left in `src`; the only `prerender`/redirect output is unchanged.
- T30 numeric probes (run before the user's stop-testing instruction): detach offset, fade-out/restore, zoom, URL push/back, focus target, scroll freeze, desktop card at 50.7%/47.6% width, mobile 390px with no horizontal overflow and internal panel scrolling.

Left to the user's live pass (see the handoff checklist in the session report):
- Visual composition at 360/390/768/desktop, both themes.
- Hover card vs layer pills overlap on real hardware, touch tap flow, reduced-motion feel.
- Shadow/canvas clipping at window edges, work routes and no-JS/no-WebGL fallbacks.
- Any taste call on the new surface language (T31).

## Notes
- The T32 commit hash cannot be written into this file by the same commit; it is reported in the session handoff and visible in `git log`.
- Next task after this batch: none scheduled. Day/night theme redesign and explanatory onboarding popups are explicitly postponed by the user.