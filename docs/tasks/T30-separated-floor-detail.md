# T30 — Detached floor and expanded detail experience

Spec: user brief 2026-11-05 (T28-T32 redesign batch). Implemented 2026-11-06.

## What was done
- The selected floor physically leaves the tower (`scene/focus.ts`): the slab travels 0.21 of the visible width along the view-left axis while the camera centres on it. It is not re-parented and not duplicated: `state.apply` + `pick` keep writing base positions, `focus.applyDetach` (called from `loop.ts` right after `pick.update`) writes the x/z offset each frame. The slab keeps its room child throughout select/detach/close.
- Camera: zoom x1.45 desktop / x1.35 mobile, 0.5s `expo.out`; the target starts at the current follow height, so the whoosh never jumps. Mobile moves the floor to the top band instead of the left half. Close eases the offset and the camera back in 0.42s.
- The rest of the tower fades to opacity 0 in 0.25s (existing per-slab material fade, now also covers the rooms). The layer pills, hero copy and hover card are hidden while expanded (`[data-detail]` on `.stage-sticky`).
- Expanded layout (`ui/detail.ts`, `hud.css`): `.detail-view` is a stage-wide grid — floor left half, `.dv-card` right half, `.dv-samples` strip across the full width beneath. The card is the T29 hover card grown up: same surface, hairline border, radius, number kicker and accent rule; content is back control, kicker, title, short line, intro, "What I do" hairline list, Toolkit pills. The old narrow column, `.dp-*` styles, `.cap-list`/`.chip` reuse and hard offset shadow are gone.
- Sample work: compact `.dv-sample` cards (title, one-line blurb, slash-separated tags) from the existing `LAYERS[].samples` data. No links, no invented content.
- Transition: whoosh + detach 0.5s, card rises 22px/0.42s with a 0.08s delay, strip cards follow with a 0.05s stagger; close fades the card in 0.24s while the tower returns. Reduced motion: 0.2s moves, no blur, no translation.
- Picking is paused while expanded (`pick.setEnabled(false)` via the scene api focus/release), so no hover state survives behind the card. History, Escape, focus trap/restore, scroll freeze and restoration, direct `/work/<id>/` routes and the no-WebGL/no-JS fallbacks are unchanged.
- Guardrail change (user request): the 200-line cap in `scripts/check.mjs` is removed; long files may stay cohesive instead of being split.

## Verified (numbers from the running build, headless Chromium)
- Open via a nav button: slab `seo` x 0 -> -3.83, z 0 -> +3.83 (screen-left), y unchanged at 6.75; `cms` opacity 1 -> 0; zoom 1 -> 1.45; URL `/work/seo/`; `data-detail="true"`; focus on the back control; page overflow hidden; stack `u` untouched.
- Desktop geometry: floor centre at 29.2% width / 45.9% height; card starts at 50.7% width and is 47.6% wide; sample strip 96.5% wide at 91% height; card bottom 75% < strip top 91% (no overlap); hero copy hidden.
- Mobile 390x844: no horizontal overflow (scrollWidth 390); floor centred at 50% width / 37% height; card top 474px (reserved band 371px under a 102px HUD); panel scrolls internally (1232px content); card before samples; zoom 1.35; no lateral detach.
- Close (Escape): panel hidden, URL back to `/`, zoom 1, slab x/z back to 0, other slabs opacity 1, `data-detail` removed, overflow cleared.
- `npm run check`: PASS (88 files). `npm run build`: PASS (7 pages).

## Known limits
- The floor is offset, not re-parented. That keeps the architecture intact but means the offset must be written every frame (documented in MOTION.md); a future re-parent would need its own restore path.
- Deep responsive tuning (360/390/768/desktop sweeps, dark theme, sample strip on short viewports) belongs to T32.