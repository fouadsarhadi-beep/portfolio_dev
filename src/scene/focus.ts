/** @module scene/focus: the selected floor leaves the stack into the left 45% column, the rest fades. @see docs/MOTION.md (Detail view), src/ui/detail.ts, src/scene/loop.ts */
import { gsap } from 'gsap';
import * as THREE from 'three';
import type { Object3D, OrthographicCamera } from 'three';
import { CAM_DIR, CAM_DISTANCE, CAM_VIEW_HEIGHT, CAM_FRAME_OFFSET_Y, FOOTPRINT } from '@/config/tuning';
import { applyFraming } from './camera';
import { prefersReducedMotion } from '@/lib/reduced-motion';

const DUR_OPEN = 0.5;
const DUR_CLOSE = 0.42;
const ZOOM_DESKTOP = 1.45;
const ZOOM_MOBILE = 1.35;
// Screen-left in world space; screen-right is (SQRT1_2, 0, -SQRT1_2) (src/scene/stack/pick.ts).
const VIEW_LEFT = { x: -Math.SQRT1_2, z: Math.SQRT1_2 };
const LEFT_COL = 0.45;        // the floor owns this share of the width; the card owns the rest
const COL_FILL = 0.86;        // the floor fills most of, not all of, its column
const FLOOR_W = FOOTPRINT * Math.SQRT2; // 8.49: projected slab width in the isometric view
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
  // Which materials ship transparent (the number engraving, the icon decal, the
  // AO strips). They must stay transparent: alpha blending off renders the empty
  // pixels of their canvas textures black, which blacks out a whole slab face.
  const baseTransparent = matsBySlab.map((list) => list.map((m) => m.transparent));
  // Fade state driven per frame by update(dt): a persistent value, not a
  // transient tween, so slow frames can never skip or restore it.
  const fade = slabs.map(() => 1);
  const fadeTarget = slabs.map(() => 1);
  // Full fade in 0.25s (docs/MOTION.md Detail view); the constant lives above.

  /** The framing offset currently applied: the hero lift, or a value mid-tween. */
  function currentOffset(): number {
    return typeof camera.userData.frameOffset === 'number' ? camera.userData.frameOffset : CAM_FRAME_OFFSET_Y;
  }

  /** Eases the frustum framing offset to `to`; the floor stays put in view space. */
  function tweenFraming(to: number, duration: number, ease: string): void {
    const framing = { off: currentOffset() };
    gsap.to(framing, {
      off: to,
      duration,
      ease,
      overwrite: true,
      onUpdate: () => applyFraming(camera, framing.off),
    });
  }

  /** A floor faded to nothing leaves the scene; restored the moment it returns. */
  const hidden = slabs.map(() => false);

  function setHidden(i: number, on: boolean): void {
    if (hidden[i] === on) return;
    hidden[i] = on;
    slabs[i].visible = !on;
  }

  function setOpacity(slabIndex: number, o: number): void {
    const list = matsBySlab[slabIndex];
    const wasTransparent = baseTransparent[slabIndex];
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      m.opacity = o;
      // Restore the material's own transparency, never force it off: the
      // engraving and decal materials are transparent by design.
      m.transparent = o < 1 || wasTransparent[i];
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

      // Visible world box at the detail zoom. The desktop zoom is capped so the
      // floor always fits its 45% column, whatever the aspect ratio.
      const aspect = (camera.right - camera.left) / (camera.top - camera.bottom);
      const fit = (CAM_VIEW_HEIGHT * aspect * LEFT_COL * COL_FILL) / FLOOR_W;
      const zoom = mobile ? ZOOM_MOBILE : Math.min(ZOOM_DESKTOP, fit);
      const effH = CAM_VIEW_HEIGHT / zoom;
      // Travel needed to put the floor's centre in the middle of the left column.
      const shift = mobile ? 0 : effH * aspect * (0.5 - LEFT_COL / 2);
      const bias = mobile ? effH * UP_BIAS_MOBILE : 0; // 0 = vertically centred

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
      tweenFraming(0, dur, 'expo.out');

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
      // Hand the framing back to the hero lift as the floor returns to the stack.
      tweenFraming(CAM_FRAME_OFFSET_Y, dur, 'power2.inOut');
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
      for (let i = 0; i < slabs.length; i++) {
        fadeTarget[i] = 1;
        setHidden(i, false);
      }
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
      const step = FADE_RATE * Math.min(Math.max(dt, 0), 0.1);
      for (let i = 0; i < slabs.length; i++) {
        if (fade[i] !== fadeTarget[i]) {
          if (fade[i] < fadeTarget[i]) fade[i] = Math.min(fadeTarget[i], fade[i] + step);
          else fade[i] = Math.max(fadeTarget[i], fade[i] - step);
          setOpacity(i, fade[i]);
        }
        // Invisible geometry still casts shadows and writes depth, so a floor
        // that has faded to nothing is taken out of the scene outright.
        setHidden(i, state === 'on' && i !== activeIdx && fade[i] === 0);
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
