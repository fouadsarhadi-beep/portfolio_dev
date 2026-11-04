/** @module scene/stack/landing: touchdown effects: squash, shadow pulse, impact ring, camera jolt, prop punch. @see docs/MOTION.md (Slam), src/scene/stack/motion.ts */
import { gsap } from 'gsap';
import * as THREE from 'three';
import { SLAB_T, FOOTPRINT } from '@/config/tuning';
import { PALETTE, darken } from '@/config/palette';
import { prefersReducedMotion } from '@/lib/reduced-motion';

const JOLT_AMP = 0.08;
const JOLT_DECAY = 8;
const JOLT_FREQ = 40;
const JOLT_DURATION = 0.35;

export interface Landing {
  onLand(slab: THREE.Object3D, room: THREE.Group | undefined, slabBaseY: number): void;
  update(time: number): void;
  jolt(): number;
}

export function createLanding(groundMat: THREE.ShadowMaterial | null): Landing {
  let joltStart = -1;
  let lastTime = 0;
  const rings: THREE.Mesh[] = [];

  return {
    onLand(slab, room, slabBaseY) {
      if (prefersReducedMotion()) return;

      // 1. Squash: 0.96 for 0.07s, rebound 1.01, settle to 1 over 0.12s.
      gsap.timeline()
        .to(slab.scale, { y: 0.96, duration: 0.07, ease: 'power1.in' })
        .to(slab.scale, { y: 1.01, duration: 0.03 })
        .to(slab.scale, { y: 1, duration: 0.12, ease: 'power1.out' });

      // 2. Shadow pulse: +0.12 for 0.25s.
      if (groundMat) {
        const base = groundMat.opacity;
        gsap.timeline()
          .to(groundMat, { opacity: Math.min(0.5, base + 0.12), duration: 0.125 })
          .to(groundMat, { opacity: base, duration: 0.125 });
      }

      // 3. Impact ring at the slab footprint.
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(FOOTPRINT / 2 - 0.45, FOOTPRINT / 2 - 0.25, 48),
        new THREE.MeshBasicMaterial({ color: darken(PALETTE.graphite, 0.1), transparent: true, opacity: 0.5, depthWrite: false }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = slabBaseY - SLAB_T / 2 + 0.02;
      slab.parent?.add(ring);
      rings.push(ring);
      gsap.to(ring.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.35, ease: 'power1.out' });
      gsap.to(ring.material as THREE.MeshBasicMaterial, {
        opacity: 0,
        duration: 0.35,
        ease: 'power1.out',
        onComplete: () => {
          ring.removeFromParent();
          ring.geometry.dispose();
          (ring.material as THREE.MeshBasicMaterial).dispose();
          const i = rings.indexOf(ring);
          if (i >= 0) rings.splice(i, 1);
        },
      });

      // 4. Camera jolt (adds to target Y only).
      joltStart = lastTime;

      // 5. Props in the landed room punch 1.03 then settle to 1 over 0.2s.
      if (room) {
        room.userData.punch = 1.03;
        gsap.to(room.userData, { punch: 1, duration: 0.2, ease: 'power1.out' });
      }
    },

    update(time: number) {
      lastTime = time;
    },

    jolt() {
      if (joltStart < 0) return 0;
      const t = lastTime - joltStart;
      if (t > JOLT_DURATION) return 0;
      return JOLT_AMP * Math.exp(-t * JOLT_DECAY) * Math.sin(t * JOLT_FREQ);
    },
  };
}
