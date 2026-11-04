# MOTION: scroll, lift, slam, camera, interaction

Layers are indexed 0 (top) to N-1 (bottom). N = 6, STEPS = N - 1 = 5.

## Scroll mapping
- `#stage` height = 100svh + STEPS x STEP_VH (STEP_VH = 80svh). Total about 500svh.
- Its child is `position: sticky; top: 0; height: 100svh` and holds the canvas, labels and HUD.
- progress s = (scrollY - stageTop) / STEP_PX, where STEP_PX = 0.8 x innerHeight. Clamp to 0..STEPS.
- Wanted step m uses hysteresis so edges do not flicker: open to m+1 when s >= m + 0.35. Close to m-1 when s < m - 1 + 0.15.
- Step m means layers 0..m-1 are lifted. Layer m is exposed. Layers below it stay closed.
- Triggered, not scrubbed: a step change starts timed tweens. Scroll never drives the tween position directly.

## State (src/scene/stack/state.ts)
- `restY[i] = (N - 1 - i) x SLAB_T`.
- `u[i]` is the lift of layer i, from 0 to LIFT. It is a plain number array, the single source of truth.
- Each frame: `position.y = restY[i] + u[i]`. Transforms are derived from state. Never accumulate transforms.
- Exposure `e[i] = i == 0 ? 1 : clamp((u[i-1] - u[i]) / LIFT, 0, 1)`.
- Room group scale.y = easeOut(e). Hidden when e < 0.02. Props rise from the floor as the gap opens.
- Hard invariant, enforced after every tween update: `u[i] >= u[i+1]` for all i. A layer is never lower than the layer under it. This prevents any intersection.

## Lift (scrolling down)
Layer m-1 lifts to LIFT. Duration 1.1s, `power2.inOut` (slow start). Because every lifted layer sits exactly LIFT above its rest, the lifted layer lands directly under the previous lifted one. A jump of several steps staggers layers 0.25s apart, top first.

## Slam (scrolling up)
Lifted layers drop. Duration 0.42s, `power4.in` (accelerating). The lowest lifted layer starts first; each layer above starts 0.07s later. On touching down:
1. Squash: scale.y 0.96 for 0.07s, rebound 1.01, settle to 1 (0.12s).
2. Shadow pulse: contact shadow opacity +0.12 for 0.25s.
3. Impact ring: a flat ring at the slab footprint, scale 1 to 1.25, opacity 0.5 to 0, 0.35s.
4. Camera jolt: amplitude 0.08 world units, damped sine, 0.35s.
5. Props in the landed room scale 1.03 then 1 over 0.2s.
Restacking must feel quicker and harder than separating.

## Camera
- Orthographic (see DESIGN.md). Target Y follows the exposed layer: `floorY[m] + 0.9`, damped (lambda 6). View height = LIFT + 3 x SLAB_T + 4. Tune both in tuning.ts by screenshot until the exposed room is fully visible with the lifted stack docked at the top of the frame.
- The jolt adds to target Y only.

## Pick, hover, touch (scene/stack/pick.ts, labels.ts)
- Every slab is a raycast target at all times, including while closed. Its side faces are the click surface.
- Each slab also has a DOM label button, positioned from `getLayerRect(id)`, aligned to the slab's right face. Labels and slabs behave the same.
- Hover (desktop): slab lifts 0.35 within its gap (when closed: nudges 0.25 out along the view-right direction). Other slabs lose 6 percent lightness. An animated edge highlight runs along the hovered slab. A preview card appears: number, title, short line, "View work".
- Touch: first tap selects and shows the preview. A second tap on the same layer opens the detail view. A tap elsewhere dismisses.
- Keyboard: layer-nav buttons are in the Tab order. ArrowUp and ArrowDown move the selection. Enter opens. Escape closes the preview or detail. Focus returns to the originating button.

## Detail view (ui/detail.ts, scene/focus.ts)
Open (0.9s total):
1. Camera whoosh onto the layer, 0.5s, `expo.out`. Zoom x1.5. The slab ends in the left third of the screen (desktop) or the top third (mobile).
2. During the whoosh: a brief blur on the canvas wrapper (0 to 3px to 0). Skip it for reduced motion.
3. Other slabs fade to opacity 0 in 0.25s. The selected room shows at e = 1.
4. Panel enters on the right (below on mobile). Title, intro, two sample cards, capabilities, tags enter with 0.06s stagger, `power3.out`, rising 24px.
Close: reverse in 0.45s. Back button, Escape and browser Back all close it.
- pushState to `/work/<id>` on open and back on close.
- While open: `document.documentElement.style.overflow = 'hidden'`. Remember scrollY. On close, restore it and recompute the step from scrollY. The state never gets stuck.
- Dialog semantics: role="dialog", aria-modal, focus moves in on open and returns on close.

## Idle animation
One ticker (lib/ticker.ts) gives `time` and `dt`. Rooms animate through `update(time, dt, exposure)`. Pause when offscreen or the tab is hidden. Each room has at least four distinct loops (see ROOMS.md).

## Reduced motion
Under `prefers-reduced-motion`: lift and drop become 0.2s fades or short moves, no squash, ring, jolt, blur or particles, idle loops stop except a slow LED blink. Every layer stays reachable and readable.

## Debug and verification
`window.__stack = { step, u, e, restY, ids }` refreshed each frame. Checks that need no eyes:
- At s = 0: all u are 0, only layer 0 has e = 1.
- At s = STEPS: u[0..N-2] equal LIFT, u[N-1] is 0, only the last layer has e = 1.
- During any motion: u[i] >= u[i+1] always.
