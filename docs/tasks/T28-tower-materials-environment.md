# T28 — Tower materials, positioning and environment

Spec: user brief 2026-11-05 (T28-T32 redesign batch). Implemented 2026-11-05.

## What was done
- Unified material family (slab.ts): warm plaster `slab` body on all six floors, wood deck tops, `slabShade` trims/bands/panels, plaster badge + graphite icon, engraved numbers in theme ink (CanvasTexture redraws on theme switch). No per-floor side colors; layer accents now live only in DOM (pills, cards).
- Floating tower (tuning.ts, state.ts, stack.ts): `STACK_BASE_Y = 1.35`; platform, rings and ground plane removed.
- Environment (stage.ts): soft radial contact shadow (theme-registered opacity), `underGlow` halo, dim under light, calmer neutral dust (36/18); floating colored shapes removed. CSS: `.stage-sticky::before` warm glow framing.
- Full-width (sections.css, lights.ts): stage was already full-width; the clipped hard ground shadow (ShadowMaterial + shadow camera ±12) is gone, replaced by the radial contact shadow; key shadow camera widened to ±16 for self-shadowing.
- Collision dust (stack/dust.ts new, landing.ts): pooled 3x16 particle ring burst at the contact area on land, fixed size/speed, 0.5s fade, reduced-motion gated; landing pulse retargeted to the contact shadow material.
- poster.png regenerated from the new scene (loading state matches).
- Tooling: shots.mjs stage selector fixed (`#stage` -> `.stage`), dark-theme + slam passes added, Astro dev toolbar disabled (leaked into screenshots).

## Verified
- npm run check: PASS. verify-stack (URL=4322): PASS, all invariants.
- Shots desktop+mobile, light+dark, stops 0-100 + slam frame: unified family reads clean in both themes; bottom floor fully visible at s=5; no clipped shadow edges; no console errors.
- Smoke: hover lift + preview, click -> /work/content/, Escape -> restore, history OK, no pageerrors.
- Dust puff lifecycle probed in-page (opacity 0.55 -> 0 over 0.5s, pooled).

## Known limits
- Dust is deliberately subtle; under swiftshader it reads faint in stills.
- Mobile per-slab labels can cross the hero copy at 390px (pre-existing zoom framing; T32 scope).
