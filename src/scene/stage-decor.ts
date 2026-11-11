/** @module scene/stage-decor: the quiet props around the tower (T55): a ring of drifting plates (the orbit rings were removed on user review). @see src/scene/stage.ts, docs/DESIGN.md (Environment) */
import * as THREE from 'three';
import { PALETTE } from '@/config/palette';
import { registerColor } from './scene-theme';

export interface Decor {
  group: THREE.Group;
  /** Advances the plates; the caller gates this on reduced motion. */
  update(time: number): void;
}

interface OrbitBase { a0: number; r: number; y: number; speed: number; phase: number }

/** Small plates drifting around the tower on slow paths. */
function addOrbiters(group: THREE.Group, count: number): { mesh: THREE.InstancedMesh; base: OrbitBase[] } {
  const geo = new THREE.BoxGeometry(0.34, 0.03, 0.34);
  const mat = new THREE.MeshStandardMaterial({
    color: PALETTE.slabShade,
    roughness: 0.55,
    metalness: 0.05,
    transparent: true,
    opacity: 0.85,
  });
  registerColor((c) => c.slabShade, mat.color);
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.name = 'orbit-plates';
  const base: OrbitBase[] = [];
  for (let i = 0; i < count; i++) {
    base.push({
      a0: Math.random() * Math.PI * 2,
      r: 4.6 + Math.random() * 3.6,
      y: -1 + Math.random() * 13,
      speed: (Math.random() > 0.5 ? 1 : -1) * (0.03 + Math.random() * 0.05),
      phase: Math.random() * Math.PI * 2,
    });
  }
  mesh.instanceMatrix.needsUpdate = true;
  group.add(mesh);
  return { mesh, base };
}

export function createDecor(count: number): Decor {
  const group = new THREE.Group();
  group.name = 'stage-decor';
  const orbit = addOrbiters(group, count);
  const tmp = {
    m: new THREE.Matrix4(),
    q: new THREE.Quaternion(),
    e: new THREE.Euler(),
    s: new THREE.Vector3(1, 1, 1),
    p: new THREE.Vector3(),
  };

  return {
    group,
    update(time: number) {
      for (let i = 0; i < orbit.base.length; i++) {
        const p = orbit.base[i];
        const a = p.a0 + time * p.speed;
        tmp.p.set(Math.cos(a) * p.r, p.y + Math.sin(time * 0.5 + p.phase) * 0.3, Math.sin(a) * p.r);
        tmp.q.setFromEuler(tmp.e.set(0, a * 1.5, p.phase));
        tmp.m.compose(tmp.p, tmp.q, tmp.s);
        orbit.mesh.setMatrixAt(i, tmp.m);
      }
      orbit.mesh.instanceMatrix.needsUpdate = true;
    },
  };
}
