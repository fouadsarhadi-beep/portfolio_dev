/** @module scene/stack/landing: touchdown effects: squash, shadow pulse, impact ring, dust puff, camera jolt, prop punch. @see docs/MOTION.md (Slam), src/scene/stack/motion.ts, src/scene/stack/dust.ts */
import { gsap } from 'gsap';
import * as THREE from 'three';
import { SLAB_T, FOOTPRINT } from '@/config/tuning';
import { PALETTE, darken } from '@/config/palette';
import { prefersReducedMotion } from '@/lib/reduced-motion';
import type { DustPuffs } from './dust';

const JOLT_AMP = 0.08;
const JOLT_DECAY = 8;
const JOLT_FREQ = 40;
const JOLT_DURATION = 0.35;

/** The contact-shadow material under the floating tower (opacity pulse). */
export interface PulseMat { opacity: number }

export interface Landing {
  onLand(slab: THREE.Object3D, room: THREE.Group | undefined, slabBaseY: number): void;
  update(time: number): void;
  jolt(): number;
}

export function createLanding(pulseMat: PulseMat | null, puffs: DustPuffs | null): Landing {
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

      // 2. Contact-shadow pulse: +0.12 for 0.25s.
      if (pulseMat) {
        const base = pulseMat.opacity;
        gsap.timeline()
          .to(pulseMat, { opacity: Math.min(0.6, base + 0.12), duration: 0.125 })
          .to(pulseMat, { opacity: base, duration: 0.125 });
      }

      // 3. Impact ring at the slab footprint, neutral tone (unified family).
      const ringColor = darken(PALETTE.graphite, 0.1);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(FOOTPRINT / 2 - 0.45, FOOTPRINT / 2 - 0.25, 48),
        new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.5, depthWrite: false }),
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

      // 3b. Small dust puff around the contact area (fixed size, brief fade).
      puffs?.puff(slab.position.x, slabBaseY - SLAB_T / 2 + 0.06, slab.position.z);

      // 4. Camera jolt (adds to target Y only).
      joltStart = lastTime;

      // 5. Props in the landed room punch 1.03 then settle to 1 over 0.2s.
      if (room) {
        room.userData.punch = 1.03;
        gsap.to(room.userData, { punch: 1, duration: 0.2, ease: 'power1.out' });
      }
    },

    update(time: number) {
      // Advance the pooled dust puffs with the wall-clock delta of this tick.
      if (puffs) puffs.update(Math.min(Math.max(time - lastTime, 0), 0.1));
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
