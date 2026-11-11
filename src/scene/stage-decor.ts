/** @module scene/stage-decor: the quiet props around the tower (T55): three thin orbit rings and a ring of drifting plates, all neutral and slow. @see src/scene/stage.ts, docs/DESIGN.md (Environment) */
import * as THREE from 'three';
import { PALETTE } from '@/config/palette';
import { registerColor, registerValue } from './scene-theme';

export interface Decor {
  group: THREE.Group;
  /** Advances rings and plates; the caller gates this on reduced motion. */
  update(time: number): void;
}

/** Thin neutral rings around the tower, like orbital guides; very quiet. */
function addRings(group: THREE.Group): THREE.Mesh[] {
  const mat = new THREE.MeshBasicMaterial({
    color: PALETTE.graphite,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  });
  registerColor((c) => c.graphite, mat.color);
  registerValue((_c, name) => { mat.opacity = name === 'dark' ? 0.22 : 0.16; });
  const rings: THREE.Mesh[] = [];
  const defs = [
    { r: 5.4, tube: 0.022, tilt: 0.42, speed: 0.05 },
    { r: 6.6, tube: 0.018, tilt: -0.3, speed: -0.035 },
    { r: 7.8, tube: 0.015, tilt: 0.62, speed: 0.022 },
  ];
  for (const d of defs) {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(d.r, d.tube, 8, 96), mat);
    mesh.userData.speed = d.speed;
    mesh.userData.tilt = d.tilt;
    mesh.rotation.x = d.tilt;
    mesh.name = 'orbit-ring';
    rings.push(mesh);
    group.add(mesh);
  }
  return rings;
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
  const rings = addRings(group);
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
      for (let i = 0; i < rings.length; i++) {
        rings[i].rotation.y = time * rings[i].userData.speed;
        rings[i].rotation.x = rings[i].userData.tilt + Math.sin(time * 0.3 + i) * 0.05;
      }
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
