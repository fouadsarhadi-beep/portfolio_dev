/** @module scene/focus: the selected floor leaves the stack and moves to the left half, the rest fades. @see docs/MOTION.md (Detail view), src/ui/detail.ts, src/scene/loop.ts */
import { gsap } from 'gsap';
import * as THREE from 'three';
import type { Object3D, OrthographicCamera } from 'three';
import { CAM_DIR, CAM_DISTANCE, CAM_VIEW_HEIGHT } from '@/config/tuning';
import { prefersReducedMotion } from '@/lib/reduced-motion';

const DUR_OPEN = 0.5;
const DUR_CLOSE = 0.42;
const ZOOM_DESKTOP = 1.45;
const ZOOM_MOBILE = 1.35;
// Screen-left in world space; screen-right is (SQRT1_2, 0, -SQRT1_2) (src/scene/stack/pick.ts).
const VIEW_LEFT = { x: -Math.SQRT1_2, z: Math.SQRT1_2 };
const LEFT_SHARE = 0.21;      // how far the floor travels, as a share of the visible width
const UP_BIAS_DESKTOP = 0.05; // lift the floor into the centre of the left half
const UP_BIAS_MOBILE = 0.16;  // lift it into the top band on mobile
const FADE_RATE = 1 / 0.25;   // full fade in 0.25s (docs/MOTION.md Detail view)

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

  // Per-slab material lists so the other floors can fade out of the composition.
  const matsBySlab = slabs.map((slab) => {
    const set = new Set<THREE.Material>();
    slab.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && Array.isArray(mesh.material)) mesh.material.forEach((m) => set.add(m));
      else if (mesh.isMesh) set.add(mesh.material as THREE.Material);
    });
    return [...set];
  });
  // Fade state driven per frame by update(dt): a persistent value, not a
  // transient tween, so slow frames can never skip or restore it.
  const fade = slabs.map(() => 1);
  const fadeTarget = slabs.map(() => 1);
  // Full fade in 0.25s (docs/MOTION.md Detail view); the constant lives above.

  function setOpacity(slabIndex: number, o: number): void {
    for (const m of matsBySlab[slabIndex]) {
      m.opacity = o;
      m.transparent = o < 1;
    }
  }

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

      // Visible world box at the detail zoom, used to place the floor in the left half.
      const zoom = mobile ? ZOOM_MOBILE : ZOOM_DESKTOP;
      const effH = CAM_VIEW_HEIGHT / zoom;
      const aspect = (camera.right - camera.left) / (camera.top - camera.bottom);
      const shift = mobile ? 0 : effH * aspect * LEFT_SHARE;
      const bias = effH * (mobile ? UP_BIAS_MOBILE : UP_BIAS_DESKTOP);

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
      for (let i = 0; i < slabs.length; i++) {
        if (i === idx) continue;
        fadeTarget[i] = 0;
      }
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
      for (let i = 0; i < slabs.length; i++) fadeTarget[i] = 1;
    },

    active(): boolean {
      return state !== 'off';
    },

    applyDetach(list: Object3D[]): void {
      if (!detached || state === 'closing') return;
      const slab = list.find((s) => s === detached);
      if (!slab) return;
      // Only the screen-x travel; y stays the stack's height so the room keeps its framing.
      slab.position.x = detach.x;
      slab.position.z = detach.z;
    },

    /** Advances the per-frame fade toward its target; robust at any frame rate. */
    update(dt: number): void {
      const step = FADE_RATE * Math.min(Math.max(dt, 0), 0.1);
      for (let i = 0; i < slabs.length; i++) {
        if (fade[i] === fadeTarget[i]) continue;
        if (fade[i] < fadeTarget[i]) fade[i] = Math.min(fadeTarget[i], fade[i] + step);
        else fade[i] = Math.max(fadeTarget[i], fade[i] - step);
        setOpacity(i, fade[i]);
      }
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
