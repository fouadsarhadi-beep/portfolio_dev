# T29 — Hover movement and information card

Spec: user brief 2026-11-05 (T28-T32 redesign batch). Implemented 2026-11-06.

## What was done
- Hover info card fully replaced (ui/preview.ts + .layer-card styles in hud.css): fixed deliberate spot on the right edge of the stage, in the vertical band the nav pills never occupy at any scroll step (verified numerically for steps 0-5: zero rect intersections). Shows number, title, short explanation and a thin accent rule. No slab-following, no "View work" link, no thick outlines or hard offset shadows. aria-hidden (nav buttons carry semantics); data-show drives a 0.18s fade/rise.
- Card is the visual seed for the T30 expanded card (same surface/border/radius/accent-rule tokens, same right-anchor habit; documented in DESIGN.md HUD style).
- Hover movement: verified the existing state-derived rule already matches the brief (gap above -> up; closed -> right; first floor up once scrolled; top floor right before scroll). No index guessing; positions rewritten by state.apply each frame, offsets added by pick (no accumulation).
- Neutral hover edge highlight (pick.ts): pastel per-floor edge color removed from the scene (T28 family kept intact); dim-others kept.
- Keyboard (keyboard.ts): tabbing out of the layer nav clears the card (no stuck state); focus-shows-card preserved via layer:select; Escape clears.
- Mobile (390px, touch): first tap selects and shows the card docked above the label zone; second tap opens; tap elsewhere dismisses; no horizontal overflow. Reduced motion: card falls back to a plain fade.

## Verified
- npm run check: PASS.
- Movement probes (world positions via window.__scene): A) scroll 0 hover floor 0 -> x/z nudge right, y unchanged. B) step 3 hover exposed floor 3 -> y +0.303, x/z unchanged. C) step 1 hover docked floor 0 -> y +0.303. D) step 3 hover closed floor 5 -> right nudge. All reversible and eased.
- Overlap probe: card rect vs all six nav button rects at steps 0-5 while the exposed floor is hovered: 0 intersections everywhere.
- Card content/behavior: shows correct layer, hides on leave/open/close/Escape/tab-away; touch flow verified; no pageerrors.
- Screenshots: shots/_t29-hover-top.png, _t29-hover-step2.png, _t29-hover-exposed.png, _t29-hover-lower.png, _t29-mobile-tap.png (light theme; dark theme card uses same tokens, verified in T32 sweep).

## Known limits
- On narrow mobile the docked card can cover the lowest slab labels while shown; tap elsewhere dismisses. Deep mobile pass belongs to T32.
- The card shows layer.short only; T30 adds the richer expanded layout.
