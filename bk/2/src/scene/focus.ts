/** @module scene/focus: camera whoosh onto one layer, blur, fade of the other slabs. @see docs/MOTION.md (Detail view), src/ui/detail.ts, src/scene/loop.ts */
import { gsap } from 'gsap';
import * as THREE from 'three';
import type { Object3D, OrthographicCamera } from 'three';
import { CAM_DIR, CAM_DISTANCE, CAM_VIEW_HEIGHT } from '@/config/tuning';
import { prefersReducedMotion } from '@/lib/reduced-motion';

const DUR_OPEN = 0.5;
const DUR_CLOSE = 0.45;
const ZOOM = 1.5;

export interface Focus {
  open(id: string): void;
  close(): void;
  active(): boolean;
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

  // Per-slab material lists and fade proxies so other slabs can fade out.
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
  const FADE_RATE = 1 / 0.25; // full fade in 0.25s (docs/MOTION.md Detail view)

  function setOpacity(slabIndex: number, o: number): void {
    for (const m of matsBySlab[slabIndex]) {
      m.opacity = o;
      m.transparent = o < 1;
    }
  }

  function roomOf(slab: Object3D): THREE.Group | undefined {
    return slab.children.find((c) => String(c.name).startsWith('room-')) as THREE.Group | undefined;
  }

  return {
    open(id: string): void {
      if (state !== 'off') return;
      const idx = slabs.findIndex((s) => s.userData.layerId === id);
      if (idx < 0) return;
      state = 'on';
      const reduced = prefersReducedMotion();
      const dur = reduced ? 0.2 : DUR_OPEN;
      const slab = slabs[idx];
      const slabY = slab.position.y;
      const effH = CAM_VIEW_HEIGHT / ZOOM;
      const aspect = (camera.right - camera.left) / (camera.top - camera.bottom);
      const mobile = opts.isMobile();

      // Desktop: slab ends in the left third. Mobile: in the top third.
      if (mobile) {
        want.x = 0;
        want.z = 0;
        want.y = slabY - effH / 6;
      } else {
        const shift = (effH * aspect) / 3;
        want.x = shift * Math.SQRT1_2;
        want.z = -shift * Math.SQRT1_2;
        want.y = slabY;
      }
      camera.userData.targetY = slabY;
      gsap.to(want, { x: want.x, y: want.y, z: want.z, duration: dur, ease: 'expo.out', overwrite: true });
      gsap.to(camera, {
        zoom: ZOOM,
        duration: dur,
        ease: 'expo.out',
        overwrite: true,
        onUpdate: () => camera.updateProjectionMatrix(),
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
      activeIdx = idx;
    },

    close(): void {
      if (state !== 'on') return;
      state = 'closing';
      const reduced = prefersReducedMotion();
      const dur = reduced ? 0.2 : DUR_CLOSE;
      canvasWrap.style.filter = '';
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
          state = 'off';
        },
      });
      if (activeIdx >= 0) {
        const room = roomOf(slabs[activeIdx]);
        if (room) room.userData.forceExpose = false;
      }
      activeIdx = -1;
      for (let i = 0; i < slabs.length; i++) fadeTarget[i] = 1;
    },

    active(): boolean {
      return state !== 'off';
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
