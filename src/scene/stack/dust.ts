/** @module scene/stack/dust: pooled pixel dust along the two front faces at touchdown (T28). @see docs/MOTION.md (Slam), src/scene/stack/landing.ts */
import * as THREE from 'three';
import { FOOTPRINT } from '@/config/tuning';

const PUFFS = 3;         // pooled systems; slams can overlap during multi-step drops
const PARTICLES = 190;   // per puff: a few hundred pixels read as dust, a ring does not
const LIFE = 0.62;       // seconds: brief dispersion, then the pixels thin out
const EDGE = FOOTPRINT / 2; // the +x and +z faces are the two the camera sees

interface Particle { x: number; y: number; z: number; vx: number; vy: number; vz: number; size: number }

/**
 * Dust on the two front faces only. The camera sits at (1,1,1), so the faces it
 * sees are +x and +z; dust spawns along their bottom edges and drifts outward
 * from the slab, never behind it. Pixels shrink as they fade, so the cloud
 * breaks up instead of reading as one soft blob.
 */
export interface DustPuffs {
  /** Spawns one puff centred at (x, y, z); no-op under reduced motion. */
  puff(x: number, y: number, z: number): void;
  /** Advances all live puffs; call once per frame with the frame dt. */
  update(dt: number): void;
  dispose(): void;
}

export function createDustPuffs(parent: THREE.Object3D, color: string): DustPuffs {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
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
        // Alternate the two front edges: +z face, then +x face.
        const onZ = i % 2 === 0;
        const along = (Math.random() * 2 - 1) * EDGE;
        const out = 0.9 + Math.random() * 0.35;
        const kick = 0.35 + Math.random() * 0.55;
        slot.parts.push({
          x: x + (onZ ? along : EDGE * out),
          y: y + Math.random() * 0.06,
          z: z + (onZ ? EDGE * out : along),
          vx: (onZ ? (Math.random() * 2 - 1) * 0.35 : 0.9 + Math.random() * 0.9),
          vy: 0.35 + Math.random() * 0.6,
          vz: (onZ ? 0.9 + Math.random() * 0.9 : (Math.random() * 2 - 1) * 0.35),
          size: (0.045 + Math.random() * 0.055) * kick,
        });
      }
      slot.t = 0;
      slot.live = true;
      slot.mesh.visible = true;
    },

    update(dt) {
      let anyLive = false;
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
        anyLive = true;
        const step = Math.min(dt, 0.05);
        // Pixels thin out as the puff ages, so the cloud breaks up from the edges.
        const shrink = 1 - k;
        for (let i = 0; i < PARTICLES; i++) {
          const q = slot.parts[i];
          q.x += q.vx * step;
          q.y += q.vy * step;
          q.z += q.vz * step;
          q.vx *= 0.93;
          q.vz *= 0.93;
          q.vy = q.vy * 0.94 - 0.35 * step; // slight settle, no bounce
          const s = Math.max(q.size * shrink, 0.0001);
          tmpM.makeScale(s, s, s).setPosition(q.x, q.y, q.z);
          slot.mesh.setMatrixAt(i, tmpM);
        }
        slot.mesh.instanceMatrix.needsUpdate = true;
      }
      if (!anyLive) mat.opacity = 0.85;
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
