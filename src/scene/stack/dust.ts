/** @module scene/stack/dust: small pooled dust puffs at floor touchdown points (T28). @see docs/MOTION.md (Slam), src/scene/stack/landing.ts */
import * as THREE from 'three';
import { FOOTPRINT } from '@/config/tuning';

const PUFFS = 3;        // pooled systems; slams can overlap during multi-step drops
const PARTICLES = 16;   // per puff: a small ring burst, not an explosion
const LIFE = 0.5;       // seconds: brief dispersion and fade
const RING_R = FOOTPRINT / 2 - 0.35;

interface Particle { x: number; y: number; z: number; vx: number; vy: number; vz: number }

/**
 * A fixed-size puff: ring of particles around the contact area, drifting
 * outward and up, fading over LIFE. No impact scaling, no debris (T28).
 */
export interface DustPuffs {
  /** Spawns one puff centered at (x, y, z); no-op under reduced motion. */
  puff(x: number, y: number, z: number): void;
  /** Advances all live puffs; call once per frame with the frame dt. */
  update(dt: number): void;
  dispose(): void;
}

export function createDustPuffs(parent: THREE.Object3D, color: string): DustPuffs {
  const geo = new THREE.SphereGeometry(0.055, 6, 5);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 });
  const pool: Array<{ mesh: THREE.InstancedMesh; parts: Particle[]; t: number; live: boolean }> = [];
  const tmpM = new THREE.Matrix4();
  const zero = new THREE.Matrix4().makeScale(0.0001, 0.0001, 0.0001);

  for (let p = 0; p < PUFFS; p++) {
    const mesh = new THREE.InstancedMesh(geo, mat, PARTICLES);
    mesh.frustumCulled = false;
    mesh.visible = false;
    for (let i = 0; i < PARTICLES; i++) mesh.setMatrixAt(i, zero);
    parent.add(mesh);
    pool.push({ mesh, parts: [], t: 0, live: false });
  }
  let next = 0;

  return {
    puff(x, y, z) {
      const slot = pool[next];
      next = (next + 1) % PUFFS;
      slot.parts = [];
      for (let i = 0; i < PARTICLES; i++) {
        const a = (i / PARTICLES) * Math.PI * 2 + Math.random() * 0.5;
        const speed = 0.9 + Math.random() * 0.7;
        slot.parts.push({
          x: x + Math.cos(a) * RING_R,
          y: y + Math.random() * 0.08,
          z: z + Math.sin(a) * RING_R,
          vx: Math.cos(a) * speed,
          vy: 0.5 + Math.random() * 0.5,
          vz: Math.sin(a) * speed,
        });
      }
      slot.t = 0;
      slot.live = true;
      slot.mesh.visible = true;
    },

    update(dt) {
      for (const slot of pool) {
        if (!slot.live) continue;
        slot.t += dt;
        const k = slot.t / LIFE;
        if (k >= 1) {
          slot.live = false;
          slot.mesh.visible = false;
          for (let i = 0; i < PARTICLES; i++) slot.mesh.setMatrixAt(i, zero);
          slot.mesh.instanceMatrix.needsUpdate = true;
          continue;
        }
        const fade = 0.55 * (1 - k); // small, fixed size; only opacity fades
        mat.opacity = fade;
        const step = Math.min(dt, 0.05);
        for (let i = 0; i < PARTICLES; i++) {
          const q = slot.parts[i];
          q.x += q.vx * step;
          q.y += q.vy * step;
          q.z += q.vz * step;
          q.vx *= 0.9;
          q.vz *= 0.9;
          q.vy -= 0.4 * step; // slight settle, no bounce
          tmpM.makeTranslation(q.x, q.y, q.z);
          slot.mesh.setMatrixAt(i, tmpM);
        }
        slot.mesh.instanceMatrix.needsUpdate = true;
      }
      if (!pool.some((s) => s.live)) mat.opacity = 0;
    },

    dispose() {
      for (const slot of pool) {
        slot.mesh.removeFromParent();
        slot.mesh.dispose();
      }
      geo.dispose();
      mat.dispose();
    },
  };
}
