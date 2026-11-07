/** @module scene/focus: the selected floor leaves the stack into the left 45% column, the rest fades. @see docs/MOTION.md (Detail view), src/ui/detail.ts, src/scene/focus-pose.ts, src/scene/focus-shade.ts */
import { gsap } from 'gsap';
import * as THREE from 'three';
import type { Object3D, OrthographicCamera } from 'three';
import { CAM_DIR, CAM_DISTANCE, CAM_FRAME_OFFSET_Y } from '@/config/tuning';
import { tweenFraming, tweenShift, stageShift, setShiftDetached } from './camera';
import { createShade } from './focus-shade';
import { detailPose, VIEW_LEFT } from './focus-pose';
import { prefersReducedMotion } from '@/lib/reduced-motion';

const DUR_OPEN = 0.5;
const DUR_CLOSE = 0.42;

export interface Focus {
  open(id: string): void;
  close(): void;
  active(): boolean;
  /** Adds the detach offset to the selected slab after state/pick wrote base positions. */
  applyDetach(slabs: Object3D[]): void;
  update(dt: number): void;
  updateCamera(dt: number): void;
}

export function createFocus(opts: {
  camera: OrthographicCamera;
  slabs: Object3D[];
  canvasWrap: HTMLElement;
  getFollowY: () => number;
  isMobile: () => boolean;
}): Focus {
  const { camera, slabs, canvasWrap } = opts;
  const want = { x: 0, y: 0, z: 0 };
  let state: 'off' | 'on' | 'closing' = 'off';
  let activeIdx = -1;
  // The floor is not re-parented: it keeps its slot in the stack and receives an
  // offset every frame, so slab/room association and the restore path stay intact.
  const detach = new THREE.Vector3();
  let detached: Object3D | null = null;

  // The other floors fade out of the composition while one is expanded.
  const shade = createShade(slabs);

  function roomOf(slab: Object3D): THREE.Group | undefined {
    return slab.children.find((c) => String(c.name).startsWith('room-')) as THREE.Group | undefined;
  }

  /** The layer pills and the hover card leave the frame while a floor is expanded. */
  function markDetail(on: boolean): void {
    const host = document.querySelector<HTMLElement>('.stage-sticky');
    if (!host) return;
    if (on) host.dataset.detail = 'true';
    else delete host.dataset.detail;
  }

  return {
    open(id: string): void {
      if (state !== 'off') return;
      const idx = slabs.findIndex((s) => s.userData.layerId === id);
      if (idx < 0) return;
      state = 'on';
      activeIdx = idx;
      const reduced = prefersReducedMotion();
      const dur = reduced ? 0.2 : DUR_OPEN;
      const slab = slabs[idx];
      const x0 = slab.position.x;
      const y0 = slab.position.y;
      const z0 = slab.position.z;
      const mobile = opts.isMobile();
      const aspect = (camera.right - camera.left) / (camera.top - camera.bottom);
      const { zoom, shift, bias } = detailPose(aspect, mobile);

      // Whoosh from wherever the follow camera left the target, never a jump.
      want.x = 0;
      want.z = 0;
      want.y = typeof camera.userData.targetY === 'number' ? camera.userData.targetY : y0;
      camera.userData.targetY = y0;
      gsap.to(want, { y: y0 - bias, duration: dur, ease: 'expo.out', overwrite: true });
      gsap.to(camera, {
        zoom,
        duration: dur,
        ease: 'expo.out',
        overwrite: true,
        onUpdate: () => camera.updateProjectionMatrix(),
      });

      // The hero lift is a fixed pixel offset, so at this zoom it would push the
      // floor into the ceiling. The detail view owns the framing instead.
      tweenFraming(camera, 0, dur, 'expo.out');

      // The stage shift puts the tower at its cell's start edge, where the pills
      // want it. A floor is framed against the whole viewport, so it releases.
      setShiftDetached(camera, true);
      tweenShift(camera, 0, dur, 'expo.out');

      // Detach: the selected floor travels to the left half while the tower stays put.
      detached = slab;
      detach.set(x0, y0, z0);
      gsap.to(detach, {
        x: x0 + VIEW_LEFT.x * shift,
        z: z0 + VIEW_LEFT.z * shift,
        duration: dur,
        ease: 'expo.out',
        overwrite: true,
      });

      if (!reduced) {
        const blur = { b: 0 };
        gsap.timeline()
          .to(blur, { b: 3, duration: dur * 0.4, ease: 'power1.out', onUpdate: () => { canvasWrap.style.filter = `blur(${blur.b}px)`; } })
          .to(blur, { b: 0, duration: dur * 0.6, ease: 'power1.in', onUpdate: () => { canvasWrap.style.filter = `blur(${blur.b}px)`; } });
      }

      // Other slabs fade to opacity 0 in 0.25s; the selected room shows at e = 1.
      shade.only(idx);
      const room = roomOf(slab);
      if (room) room.userData.forceExpose = true;
      markDetail(true);
    },

    close(): void {
      if (state !== 'on') return;
      state = 'closing';
      const reduced = prefersReducedMotion();
      const dur = reduced ? 0.2 : DUR_CLOSE;
      canvasWrap.style.filter = '';
      gsap.to(detach, { x: 0, y: 0, z: 0, duration: dur, ease: 'power2.inOut', overwrite: true });
      gsap.to(camera, {
        zoom: 1,
        duration: dur,
        ease: 'power2.inOut',
        overwrite: true,
        onUpdate: () => camera.updateProjectionMatrix(),
      });
      // Hand the framing back to the hero lift as the floor returns to the stack.
      tweenFraming(camera, CAM_FRAME_OFFSET_Y, dur, 'power2.inOut');
      // ...and the sideways shift back to the stage's own, for the pills.
      tweenShift(camera, stageShift(camera), dur, 'power2.inOut', () =>
        setShiftDetached(camera, false),
      );
      gsap.to(want, {
        x: 0, y: opts.getFollowY(), z: 0,
        duration: dur,
        ease: 'power2.inOut',
        overwrite: true,
        onComplete: () => {
          camera.userData.targetY = want.y; // smooth handoff back to the follow camera
          detached = null;
          detach.set(0, 0, 0);
          state = 'off';
        },
      });
      if (activeIdx >= 0) {
        const room = roomOf(slabs[activeIdx]);
        if (room) room.userData.forceExpose = false;
      }
      activeIdx = -1;
      markDetail(false);
      // Every floor returns to the scene at once; the material fade does the rest.
      shade.all();
    },

    active(): boolean {
      return state !== 'off';
    },

    applyDetach(list: Object3D[]): void {
      // Keep applying while closing too: the detach tween eases the offset back
      // to 0, and pick has already rewritten the base x/z this frame.
      if (!detached) return;
      const slab = list.find((s) => s === detached);
      if (!slab) return;
      // Only the screen-x travel; y stays the stack's height so the room keeps its framing.
      slab.position.x = detach.x;
      slab.position.z = detach.z;
    },

    /** Advances the per-frame fade toward its target; robust at any frame rate. */
    update(dt: number): void {
      shade.update(dt, state === 'on', activeIdx);
    },

    updateCamera(): void {
      if (state === 'off') return;
      camera.position.set(
        want.x + CAM_DIR.x * CAM_DISTANCE,
        want.y + CAM_DIR.y * CAM_DISTANCE,
        want.z + CAM_DIR.z * CAM_DISTANCE,
      );
      camera.lookAt(want.x, want.y, want.z);
      camera.updateMatrixWorld();
    },
  };
}
