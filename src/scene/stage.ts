/** @module scene/stage: ground, platform, dust particles and floating shapes around the stack. @see docs/DESIGN.md (Environment around the stack), src/scene/loop.ts, src/scene/scene-theme.ts */
import * as THREE from 'three';
import { PALETTE, lighten, darken } from '@/config/palette';
import { prefersReducedMotion } from '@/lib/reduced-motion';
import { registerMaterial, registerValue } from './scene-theme';

const PLATFORM_R = 4.8;
const PLATFORM_H = 0.5;

export interface Stage {
  group: THREE.Group;
  update(time: number): void;
}

export function createStage(tier: 'high' | 'low'): Stage {
  const DUST_COUNT = tier === 'high' ? 48 : 24; // fewer particles on mobile (docs/DESIGN.md Responsive)
  const group = new THREE.Group();
  group.name = 'stage';

  // Ground plane: shadows only, sits just under the platform.
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.ShadowMaterial({ opacity: 0.18 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -PLATFORM_H;
  ground.receiveShadow = true;
  group.add(ground);

  // Round platform under the stack. Its top surface is y = 0, where the stack rests.
  const platformMat = new THREE.MeshStandardMaterial({ color: PALETTE.wall, roughness: 0.9, metalness: 0 });
  registerMaterial((c) => c.wall, platformMat);
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(PLATFORM_R, PLATFORM_R + 0.15, PLATFORM_H, 64),
    platformMat,
  );
  platform.position.y = -PLATFORM_H / 2;
  platform.receiveShadow = true;
  platform.castShadow = true;
  group.add(platform);

  addRing(group, PLATFORM_R - 0.5);
  addRing(group, PLATFORM_R - 1.9);

  const dust = makeDust(DUST_COUNT);
  group.add(dust.mesh);
  const tmp = {
    m: new THREE.Matrix4(),
    q: new THREE.Quaternion(),
    e: new THREE.Euler(),
    s: new THREE.Vector3(1, 1, 1),
    p: new THREE.Vector3(),
  };
  const shapes = makeShapes();
  shapes.forEach((s) => group.add(s.mesh));

  return {
    group,
    update(time: number) {
      const frozen = prefersReducedMotion();
      // Dust drifts slowly upward and around; no drift under reduced motion.
      if (!frozen) {
        for (let i = 0; i < dust.base.length; i++) {
          const p = dust.base[i];
          const y = ((p.y + time * p.speed) % 16 + 16) % 16;
          const wob = Math.sin(time * 0.6 + p.phase) * 0.15;
          tmp.p.set(p.x + wob, y, p.z - wob);
          tmp.q.setFromEuler(tmp.e.set(0, time * 0.2 + p.phase, 0));
          tmp.m.compose(tmp.p, tmp.q, tmp.s);
          dust.mesh.setMatrixAt(i, tmp.m);
        }
        dust.mesh.instanceMatrix.needsUpdate = true;
        // Floating shapes bob and yaw gently at their own depths (parallax).
        for (const s2 of shapes) {
          s2.mesh.position.y = s2.baseY + Math.sin(time * s2.speed + s2.phase) * 0.25;
          s2.mesh.rotation.y = time * 0.1 + s2.phase;
        }
      }
    },
  };
}

function addRing(group: THREE.Group, radius: number): void {
  const ringMat = new THREE.MeshBasicMaterial({ color: darken(PALETTE.wall, 0.25), transparent: true, opacity: 0.5 });
  registerMaterial((c) => c.wall, ringMat, (hex) => darken(hex, 0.25));
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(radius, radius + 0.08, 64),
    ringMat,
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.002; // platform top surface
  group.add(ring);
}

interface Dust { mesh: THREE.InstancedMesh; base: Array<{ x: number; y: number; z: number; speed: number; phase: number }> }

function makeDust(count: number): Dust {
  const geo = new THREE.SphereGeometry(0.02, 6, 5);
  const mat = new THREE.MeshBasicMaterial({ color: PALETTE.white, transparent: true, opacity: 0.55 });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const base: Dust['base'] = [];
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 4.5 + Math.random() * 3.5;
    base.push({
      x: Math.cos(a) * r,
      y: Math.random() * 16,
      z: Math.sin(a) * r,
      speed: 0.15 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
    });
    const m = new THREE.Matrix4().makeTranslation(base[i].x, base[i].y, base[i].z);
    mesh.setMatrixAt(i, m);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return { mesh, base };
}

interface ShapeSpec { mesh: THREE.Mesh; baseY: number; speed: number; phase: number }

function makeShapes(): ShapeSpec[] {
  // Three to five floating shapes in layer accents at different depths (docs/DESIGN.md).
  const specs: Array<{ role: string; x: number; y: number; z: number; s: number; kind: 'round' | 'square' }> = [
    { role: 'content', x: -7.5, y: 6.5, z: -5.5, s: 0.55, kind: 'round' },
    { role: 'web-design-development', x: 7.8, y: 10.5, z: -6.0, s: 0.42, kind: 'square' },
    { role: 'translation', x: -8.2, y: 13.5, z: 4.5, s: 0.5, kind: 'round' },
    { role: 'cms', x: 8.4, y: 3.5, z: 5.2, s: 0.38, kind: 'square' },
  ];
  return specs.map((sp, i) => {
    const geo = sp.kind === 'round'
      ? new THREE.CylinderGeometry(sp.s, sp.s, sp.s * 0.35, 24)
      : new THREE.BoxGeometry(sp.s * 1.3, sp.s * 0.35, sp.s * 1.3);
    const mat = new THREE.MeshStandardMaterial({ color: PALETTE.butter, roughness: 0.85, metalness: 0 });
    registerMaterial((c) => c.layerAccents[sp.role], mat, (hex) => lighten(hex, 0.25));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(sp.x, sp.y, sp.z);
    mesh.rotation.y = i * 1.1;
    return { mesh, baseY: sp.y, speed: 0.5 + i * 0.13, phase: i * 1.7 };
  });
}
