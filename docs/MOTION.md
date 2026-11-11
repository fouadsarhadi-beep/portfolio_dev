# MOTION: scroll, lift, slam, camera, interaction

Layers are indexed 0 (top) to N-1 (bottom). N = 6. LAYER_STEPS = N - 1 = 5 open one floor each; OVERVIEW_STEPS = 4 more steps past the sixth floor, so the scroll range is STEPS = 9.

## Scroll mapping
- `#stage` height = 100svh + STEPS x STEP_VH (STEP_VH = 20svh, a quarter of the original 80). Total about 280svh.
- Its child is `position: sticky; top: 0; height: 100svh` and holds the canvas, the stage columns and the HUD.
- progress s = (scrollY - stageTop) / STEP_PX, where STEP_PX = 0.2 x innerHeight (STEP_VH and STEP_PX_FACTOR must agree). Clamp to 0..STEPS.
- Wanted step m uses hysteresis so edges do not flicker: open to m+1 when s >= m + 0.2 (early, so the stack starts separating on the first scroll and the sixth floor lands lower and centred). Close to m-1 when s < m - 1 + 0.1. The step only ever runs 0..LAYER_STEPS.
- Step m means layers 0..m-1 are lifted. Layer m is exposed. Layers below it stay closed.
- Past the last floor the step holds and `overview` ramps 0 to 1 over OVERVIEW_RAMP = 1 step (quick), then HOLDS at 1 for the remaining OVERVIEW_STEPS - 1 steps, so the six separated slabs stay on screen for a few slow scrolls: of the 4 steps past floor 6, the first snaps to the exploded view and the next ones just scroll slowly past it; the 5th scroll past the sixth floor leaves the stage and moves normally into the sections below. During the ramp every layer's height blends from the opened stack to `spreadY`, an evenly gapped column (SLAB_T + OVERVIEW_GAP apart), every room opens (e ramps up on a cubic so walls never poke through the slab above), and the camera target follows the middle of the spread column. The zoom pulls back to `overviewStopZoom` (src/scene/focus-pose.ts): computed from the exploded column's real height with 10% empty space on top and bottom, so the separated tower is completely visible with an acceptable margin on both ends at any slab size. The floors read as the exploded hamburger-ad stack: one room per band, air between them.
- Triggered, not scrubbed: a step change starts timed tweens. Scroll never drives the tween position directly.

## State (src/scene/stack/state.ts)
- `restY[i] = STACK_BASE_Y + (N - 1 - i) x SLAB_T` (T28: the whole tower floats, so the bottom floor clears the contact shadow).
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
2. Contact-shadow pulse: the soft shadow under the tower dips opacity +0.12 for 0.25s (T28: no ground plane).
3. Impact ring: a flat neutral ring at the slab footprint, scale 1 to 1.25, opacity 0.5 to 0, 0.35s.
4. Dust puff (T28): a small ring of 16 pooled particles around the contact area, drifting outward and up, fading over 0.5s. Fixed size and speed, no impact scaling, no debris; distinct from the slow ambient dust. Pool of 3 systems, reused round-robin.
5. Camera jolt: amplitude 0.08 world units, damped sine, 0.35s.
6. Props in the landed room scale 1.03 then 1 over 0.2s.
Restacking must feel quicker and harder than separating.

## Camera
- Orthographic (see DESIGN.md). Target Y follows the exposed layer: `floorY[m] + 0.9`, damped (lambda 6); the last floor uses `+ 0.1` so it sits centred instead of high. View height = LIFT + 3 x SLAB_T + 4. Tune both in tuning.ts by screenshot until the exposed room is fully visible with the lifted stack docked at the top of the frame.
- The jolt adds to target Y only.

## Pick, hover, touch (scene/stack/pick.ts, ui/preview.ts)
- Every slab is a raycast target at all times, including while closed. Its side faces are the click surface.
- The layer nav is a vertical menu in the right column (T39), leveled with its floors: every frame each slab's screen position is projected through the camera and its pill is placed at that height (`ui/nav-level.ts`, min-gap spreading so stacked floors stay readable). Its rows mark the current floor (`aria-current`) and clicking one opens that floor. Below 1024px the stage is one cell and the nav is a horizontal strip along its bottom edge.
- Hover movement is derived from stack state, never from a layer index: a slab with a gap above it (exposed floor, or a lifted floor docked at the top, including the first floor once scrolled) moves up 0.35 within its gap; a closed floor below the exposed one nudges 0.25 out along the view-right direction. Before any scroll the top floor therefore nudges right. Movement eases (damped), is reversible and never accumulates: state.apply writes base positions each frame, pick adds the offsets.
- Other slabs lose 6 percent lightness. An animated neutral edge highlight runs along the hovered slab (no per-floor color in the scene).
- The floor hover card (T29 card) is a `.layer-card` at the top of the right column, 100px off the scroll rail. It is not always on: it appears only while a floor is hovered or keyboard-selected and names that floor (ui/preview.ts). It never follows the slab and has no "View work" control (clicking the floor opens the detail view). Its surface, radius, hairline border and accent rule are the visual seed for the T30 expanded card.
- Touch: first tap selects and shows the floor's info in the card. A second tap on the same layer opens the detail view. A tap elsewhere dismisses.
- Keyboard: layer-nav buttons are in the Tab order; focusing one shows that floor's card. ArrowUp and ArrowDown move the selection. Enter opens. Escape and Tabbing out of the nav hide the card. Focus returns to the originating button.

## Detail view (ui/detail.ts, scene/focus.ts)
The expanded layout switches to the mobile column at 860px, and `focus.ts` uses the same breakpoint for its framing, so the camera and the CSS never disagree.
Open (about 0.9s total):
1. Camera whoosh onto the selected floor, 0.5s, `expo.out`. Zoom x1.45 desktop, x1.35 mobile. The camera target starts at its current follow height, so there is no jump.
2. Detach: the selected slab travels to the floor share of the page band (0.22 of the visible width along the view-left axis, `expo.out`, same 0.5s) while the tower stays in place. It is not re-parented: `state.apply` and `pick` write base positions, then `focus.applyDetach` writes the x/z offset every frame, so slab/room association and the restore path stay intact. On mobile the floor travels to the top band instead (no lateral move).
3. During the whoosh: a brief blur on the canvas wrapper (0 to 3px to 0). Skip it for reduced motion.
4. Other slabs and their rooms fade to opacity 0 in 0.25s and then leave the scene (`visible = false`: invisible geometry would still cast shadows and write depth). The selected room shows at e = 1. Every room owns its own material kit, so the fade never touches the floor it keeps (src/scene/stack/stack.ts). The layer nav, hero copy, stage guide and info panel leave the frame (`[data-detail]` on the stage).
5. The card enters on the right half (0.42s, rises 22px, `power3.out`, 0.08s delay), then the sample strip (heading 0.3s, cards 0.34s, 0.05s stagger). Surface, radius, border and accent rule match the T29 hover card, so it reads as the same component in a second state.
Close: 0.42s reverse. The card fades out in 0.24s while the camera whooshes back and the floor returns to its slot; back button, Escape and browser Back all close it.
- pushState to `/work/<id>` on open and back on close.
- While open: `document.documentElement.style.overflow = 'hidden'`. Remember scrollY. On close, restore it and recompute the step from scrollY. The state never gets stuck.
- Picking is paused while a floor is expanded (`pick.setEnabled(false)`), so no hover state survives behind the card.
- Dialog semantics: role="dialog", aria-modal, focus moves to the back button on open and returns to the originating control on close.

### Where the floor is framed (T40)
The floor is framed against the page band, not against the tower's stage cell. While a floor is expanded the canvas leaves the cell and fills the window (`data-detail-canvas` on `.stage-sticky`), so the camera's box is the viewport and the CSS grid's first column can be measured inside it:
- Desktop: the column is the band (80% of the viewport), minus the shared gap, times 45% (`config/layout.ts`). The floor fills 86% of that column and sits centred in it; the zoom and the travel are computed from the same numbers, so the floor keeps air on both sides and clear of the card.
- Mobile (860px): the floor lives in the reserved strip at the top (`--detail-band`, 44svh). The zoom fits the strip's height and the page's width, whichever is tighter, and the vertical bias lifts it into the middle of the strip.
- The canvas goes back into the stage cell only after the closing tween has landed, so the floor never jumps between two boxes. The tower keeps its size across the change.

## Idle animation
One ticker (lib/ticker.ts) gives `time` and `dt`. Rooms animate through `update(time, dt, exposure)`. Pause when offscreen or the tab is hidden. Each room has at least four distinct loops (see ROOMS.md).

## Reduced motion
Under `prefers-reduced-motion`: lift and drop become 0.2s fades or short moves, no squash, ring, dust puff, jolt, blur or particles, ambient dust and idle loops stop except a slow LED blink. Every layer stays reachable and readable.

## Debug and verification
`window.__stack = { step, overview, u, e, restY, spreadY, ids }` refreshed each frame. Checks that need no eyes:
- At s = 0: all u are 0, only layer 0 has e = 1.
- At s = STEPS: u[0..N-2] equal LIFT, u[N-1] is 0, and every layer has e near 1 (overview opens them all).
- When overview reaches 1: slab i sits at spreadY[i], one even gap between floors.
- During any motion: u[i] >= u[i+1] always.
