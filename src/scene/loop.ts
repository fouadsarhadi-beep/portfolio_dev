/** @module scene/loop: the per-frame update: state, pick, labels, camera follow, rooms, render. @see src/scene/boot.ts, docs/MOTION.md (Camera), src/lib/ticker.ts */
import { LIFT, OVERVIEW_ZOOM, SLAB_T } from '@/config/tuning';
import { ticker } from '@/lib/ticker';
import { prefersReducedMotion } from '@/lib/reduced-motion';
import { followCamera } from './camera';
import type { Focus } from './focus';
import type { OrthographicCamera, Scene, WebGLRenderer } from 'three';
import type { StackState } from './stack/state';
import type { Landing } from './stack/landing';
import type { Pick } from './stack/pick';
import type { LabelParts } from './stack/labels';
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
  labels: LabelParts;
  focus: Focus;
  stage: Stage;
}

/**
 * Starts the single per-frame update. The camera target follows the exposed
 * layer floor + 0.9, damped (docs/MOTION.md Camera); the landing jolt adds to
 * the lookAt target only.
 */
export function startLoop(parts: LoopParts): () => void {
  const wantY = (): number => parts.state.restY[parts.state.step] + SLAB_T / 2 + 0.9;
  // Middle of the fully fanned column: the top slab is lifted, the bottom is not.
  const overviewY = (): number => {
    const rest = parts.state.restY;
    return (rest[0] + LIFT + SLAB_T + rest[rest.length - 1]) / 2;
  };
  const baseZoom = parts.camera.zoom; // tier zoom from boot (1, or 1.3 on the low tier)
  parts.camera.userData.targetY = wantY(); // start settled, no fly-in

  return ticker.add((time, dt) => {
    parts.state.sync();
    parts.state.apply(parts.stack.slabs, parts.stack.rooms);
    parts.pick.update(dt, time);
    // The expanded floor receives its leftward offset after the base positions are written.
    parts.focus.applyDetach(parts.stack.slabs);
    parts.labels.update();
    parts.landing.update(time);

    // While the detail view is focused, the focus module drives the camera.
    parts.focus.update(dt);
    if (parts.focus.active()) {
      parts.focus.updateCamera(dt);
    } else {
      // The overview blends the follow target toward the middle of the fanned
      // column and pulls the camera back, so all six floors read at once.
      const o = parts.state.overview;
      const target = wantY() + (overviewY() - wantY()) * o;
      const t = followCamera(parts.camera, target, dt);
      parts.camera.lookAt(0, t + parts.landing.jolt(), 0);
      const zoom = baseZoom * (1 + (OVERVIEW_ZOOM - 1) * o);
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
