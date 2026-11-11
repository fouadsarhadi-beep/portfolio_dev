/** @module scene/loop: the per-frame update: state, pick, camera follow, rooms, render. @see src/scene/boot.ts, docs/MOTION.md (Camera), src/lib/ticker.ts */
import { CAM_FRAME_OFFSET_Y, LIFT, SLAB_T, WALL_H } from '@/config/tuning';
import { ticker } from '@/lib/ticker';
import { prefersReducedMotion } from '@/lib/reduced-motion';
import { followCamera, baseZoomOf } from './camera';
import { overviewStopZoom } from './focus-pose';
import type { Focus } from './focus';
import type { OrthographicCamera, Scene, WebGLRenderer } from 'three';
import type { StackState } from './stack/state';
import type { Landing } from './stack/landing';
import type { Pick } from './stack/pick';
import type { Stack } from './stack/stack';
import type { Stage } from './stage';

export interface LoopParts {
  renderer: WebGLRenderer;
  camera: OrthographicCamera;
  scene: Scene;
  stack: Stack;
  state: StackState;
  landing: Landing;
  pick: Pick;
  focus: Focus;
  stage: Stage;
}

/**
 * Starts the single per-frame update. The camera target follows the exposed
 * layer floor + 0.9, damped (docs/MOTION.md Camera); the landing jolt adds to
 * the lookAt target only.
 */
export function startLoop(parts: LoopParts): () => void {
  // The exposed floor's frame sits this far above the slab; the bottom floor
  // gets a smaller lift so it does not ride high on the screen (user review).
  const wantY = (): number => {
    const st = parts.state;
    const last = st.restY.length - 1;
    const off = st.step >= last ? 0.1 : 0.9;
    return st.restY[st.step] + SLAB_T / 2 + off;
  };
  // Middle of the fully exploded column at the current overview. At overview 0
  // this is the empty-point average (top lifted, bottom seated); as the column
  // expands it follows the spread heights, so the six floors stay centred.
  const overviewY = (): number => {
    const st = parts.state;
    const k = st.overview;
    const top = st.restY[0] + LIFT + SLAB_T;
    const bottom = st.restY[st.restY.length - 1];
    const flat = (top + bottom) / 2;
    // Centre of the exploded column, rooms and their walls included.
    const last = st.spreadY.length - 1;
    const spreadTop = st.spreadY[0] + SLAB_T / 2 + WALL_H;
    const spreadBottom = st.spreadY[last] - SLAB_T / 2;
    const mid = (spreadTop + spreadBottom) / 2;
    return flat + (mid - flat) * k;
  };
  parts.camera.userData.targetY = wantY(); // start settled, no fly-in

  return ticker.add((time, dt) => {
    parts.state.sync();
    parts.state.apply(parts.stack.slabs, parts.stack.rooms);
    parts.pick.update(dt, time);
    // The expanded floor receives its leftward offset after the base positions are written.
    parts.focus.applyDetach(parts.stack.slabs);
    parts.landing.update(time);

    // While the detail view is focused, the focus module drives the camera.
    parts.focus.update(dt);
    if (parts.focus.active()) {
      parts.focus.updateCamera(dt);
    } else {
      // The overview blends the follow target toward the middle of the exploded
      // column and pulls the camera back, so all six floors read at once.
      // The stop zoom is computed from the exploded column's real height with
      // 10% air top and bottom (overviewStopZoom), so the separated tower is
      // fully visible at an acceptable margin on both ends, never too small.
      // Reduced motion cuts between the two framings instead of gliding.
      const raw = parts.state.overview;
      const o = prefersReducedMotion() ? Math.round(raw) : raw;
      const base = baseZoomOf(parts.camera);
      const stop = overviewStopZoom(parts.state.restY.length);
      const zoom = base + (stop - base) * o;
      // The hero framing offset is a fixed pixel push that the zoom converts to
      // world units, so it covers more screen as the camera pulls back. Add it
      // back to the target at full overview, or the column would sit off centre
      // and the top room would clip the frustum.
      const push = (CAM_FRAME_OFFSET_Y / zoom) * o;
      const target = wantY() + (overviewY() - wantY()) * o + push;
      const t = followCamera(parts.camera, target, dt);
      parts.camera.lookAt(0, t + parts.landing.jolt(), 0);
      if (Math.abs(parts.camera.zoom - zoom) > 0.0005) {
        parts.camera.zoom = zoom;
        parts.camera.updateProjectionMatrix();
      }
    }

    // Under prefers-reduced-motion the room idle loops stop entirely
    // (docs/MOTION.md Reduced motion); layers stay reachable and readable.
    if (!prefersReducedMotion()) {
      for (const room of parts.stack.rooms) room.update(time, dt, parts.state.e[room.layerIndex]);
    }
    parts.stage.update(time);

    parts.state.publish();
    parts.renderer.render(parts.scene, parts.camera);
  });
}
