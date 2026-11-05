/** @module scene/stage: the environment around the floating tower (T28): contact shadow, under-glow, under-light, ambient dust. @see docs/DESIGN.md (Environment), src/scene/loop.ts, src/scene/scene-theme.ts */
import * as THREE from 'three';
import { PALETTE, darken } from '@/config/palette';
import { prefersReducedMotion } from '@/lib/reduced-motion';
import { registerColor, registerLight, registerValue } from './scene-theme';

/** World y of the soft shadow plane under the floating tower (slab bottom = STACK_BASE_Y - SLAB_T/2). */
export const CONTACT_Y = -0.12;

export interface Stage {
  group: THREE.Group;
  update(time: number): void;
}

export function createStage(tier: 'high' | 'low'): Stage {
  const DUST_COUNT = tier === 'high' ? 36 : 18; // calmer dust (T28); fewer on mobile
  const group = new THREE.Group();
  group.name = 'stage';

  addContactShadow(group);
  addUnderGlow(group);
  addUnderLight(group);

  const dust = makeDust(DUST_COUNT);
  group.add(dust.mesh);
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
      const frozen = prefersReducedMotion();
      if (frozen) return;
      // Dust drifts slowly upward and around the tower.
      for (let i = 0; i < dust.base.length; i++) {
        const p = dust.base[i];
        const y = ((p.y + time * p.speed) % 15 + 15) % 15;
        const wob = Math.sin(time * 0.6 + p.phase) * 0.15;
        tmp.p.set(p.x + wob, y, p.z - wob);
        tmp.q.setFromEuler(tmp.e.set(0, time * 0.2 + p.phase, 0));
        tmp.m.compose(tmp.p, tmp.q, tmp.s);
        dust.mesh.setMatrixAt(i, tmp.m);
      }
      dust.mesh.instanceMatrix.needsUpdate = true;
    },
  };
}

/** One shared radial-gradient texture (white core fading to transparent alpha). */
let radialTex: THREE.CanvasTexture | null = null;
function getRadialTexture(): THREE.CanvasTexture {
  if (radialTex) return radialTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.4)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  radialTex = new THREE.CanvasTexture(canvas);
  radialTex.colorSpace = THREE.SRGBColorSpace;
  return radialTex;
}

/** Soft shadow pool beneath the floating tower; named for the landing pulse. */
function addContactShadow(group: THREE.Group): void {
  const mat = new THREE.MeshBasicMaterial({
    color: darken(PALETTE.ink, 0.55),
    map: getRadialTexture(),
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  });
  registerValue((c, name) => {
    mat.opacity = name === 'dark' ? 0.42 : 0.3;
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(11, 11), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = CONTACT_Y;
  mesh.name = 'contact-shadow';
  mesh.renderOrder = -1;
  group.add(mesh);
}

/** Faint warm halo a little deeper down: depth without a floor. */
function addUnderGlow(group: THREE.Group): void {
  const mat = new THREE.MeshBasicMaterial({
    color: PALETTE.underGlow,
    map: getRadialTexture(),
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  registerColor((c) => c.underGlow, mat.color);
  registerValue((_c, name) => {
    mat.opacity = name === 'dark' ? 0.5 : 0.4;
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = CONTACT_Y - 0.55;
  mesh.renderOrder = -2;
  group.add(mesh);
}

/** Restrained light from beneath the tower: lifts the undersides, establishes depth. */
function addUnderLight(group: THREE.Group): void {
  const light = new THREE.PointLight(PALETTE.underGlow, 14, 16, 2);
  light.position.set(0, CONTACT_Y + 0.35, 0);
  registerLight(light, (c) => c.underGlow, { light: 14, dark: 20 });
  group.add(light);
}

interface Dust { mesh: THREE.InstancedMesh; base: Array<{ x: number; y: number; z: number; speed: number; phase: number }> }

function makeDust(count: number): Dust {
  const geo = new THREE.SphereGeometry(0.02, 6, 5);
  const mat = new THREE.MeshBasicMaterial({ color: PALETTE.white, transparent: true, opacity: 0.35 });
  registerColor((c) => c.white, mat.color);
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const base: Dust['base'] = [];
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 5 + Math.random() * 4.5;
    base.push({
      x: Math.cos(a) * r,
      y: Math.random() * 15,
      z: Math.sin(a) * r,
      speed: 0.12 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
    });
    const m = new THREE.Matrix4().makeTranslation(base[i].x, base[i].y, base[i].z);
    mesh.setMatrixAt(i, m);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return { mesh, base };
}
