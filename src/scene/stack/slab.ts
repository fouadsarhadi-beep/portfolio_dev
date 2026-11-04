/** @module scene/stack/slab: builds one chunky slab per LayerConfig. @see docs/DESIGN.md (Slab), src/scene/stack/stack.ts, src/scene/stack/icons.ts */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { FOOTPRINT, SLAB_T, CORNER_R } from '@/config/tuning';
import { PALETTE, lighten, darken } from '@/config/palette';
import type { LayerConfig } from '@/config/types';
import { makeIconTexture, makeNumberTexture } from './icons';
import { registerMaterial } from '../scene-theme';

const HALF = FOOTPRINT / 2;
const TOP = SLAB_T / 2;
const FLAT = HALF - CORNER_R; // body side faces are flat within this bound

// One shared body geometry: all slabs have the same dimensions.
let bodyGeo: RoundedBoxGeometry | null = null;
function getBodyGeo(): RoundedBoxGeometry {
  if (!bodyGeo) bodyGeo = new RoundedBoxGeometry(FOOTPRINT, SLAB_T, FOOTPRINT, 4, CORNER_R);
  return bodyGeo;
}

export function makeSlab(layer: LayerConfig): THREE.Group {
  const group = new THREE.Group();
  group.name = `slab-${layer.id}`;
  const color = PALETTE[layer.color as keyof typeof PALETTE];
  const accent = (c: { layerAccents: Record<string, string> }) => c.layerAccents[layer.id];

  const body = new THREE.Mesh(getBodyGeo(), bodyMaterial(color));
  registerMaterial(accent, body.material as THREE.MeshStandardMaterial);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  addTop(group, layer.id, color);
  addBottomBand(group, layer.id, color);
  addRightBadge(group, layer, color);
  addLeftNumber(group, layer, color);

  return group;
}

function bodyMaterial(color: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0 });
}

/** Inset floor with a lightened rim running around it. */
function addTop(group: THREE.Group, accentId: string, color: string): void {
  const floorGeo = new THREE.BoxGeometry((FLAT - 0.12) * 2, 0.04, (FLAT - 0.12) * 2);
  const floorMat = new THREE.MeshStandardMaterial({ color: lighten(color, 0.06), roughness: 0.65, metalness: 0 });
  registerMaterial((c) => c.layerAccents[accentId], floorMat, (hex) => lighten(hex, 0.06));
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = TOP + 0.015;
  floor.receiveShadow = true;
  group.add(floor);

  const rimMat = new THREE.MeshStandardMaterial({ color: lighten(color, 0.12), roughness: 0.6, metalness: 0 });
  registerMaterial((c) => c.layerAccents[accentId], rimMat, (hex) => lighten(hex, 0.12));
  const long = new THREE.BoxGeometry((FLAT - 0.12) * 2, 0.04, 0.12);
  const deep = new THREE.BoxGeometry(0.12, 0.04, (FLAT - 0.12) * 2);
  for (const side of [-1, 1]) {
    const rimZ = new THREE.Mesh(long, rimMat);
    rimZ.position.set(0, TOP + 0.02, side * (FLAT - 0.06));
    group.add(rimZ);
    const rimX = new THREE.Mesh(deep, rimMat);
    rimX.position.set(side * (FLAT - 0.06), TOP + 0.02, 0);
    group.add(rimX);
  }
}

/** Darker band along the four bottom edges. */
function addBottomBand(group: THREE.Group, accentId: string, color: string): void {
  const mat = new THREE.MeshStandardMaterial({ color: darken(color, 0.15), roughness: 0.7, metalness: 0 });
  registerMaterial((c) => c.layerAccents[accentId], mat, (hex) => darken(hex, 0.15));
  const alongZ = new THREE.BoxGeometry(FLAT * 2, 0.12, 0.05);
  const alongX = new THREE.BoxGeometry(0.05, 0.12, FLAT * 2);
  for (const side of [-1, 1]) {
    const bandZ = new THREE.Mesh(alongZ, mat);
    bandZ.position.set(0, -TOP + 0.06, side * (HALF + 0.008));
    group.add(bandZ);
    const bandX = new THREE.Mesh(alongX, mat);
    bandX.position.set(side * (HALF + 0.008), -TOP + 0.06, 0);
    group.add(bandX);
  }
}

/** Inset panel and round white badge with the layer icon on the +x face. */
function addRightBadge(group: THREE.Group, layer: LayerConfig, color: string): void {
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, SLAB_T - 0.5, FOOTPRINT - 1.4),
    new THREE.MeshStandardMaterial({ color: darken(color, 0.08), roughness: 0.6, metalness: 0 }),
  );
  registerMaterial((c) => c.layerAccents[layer.id], panel.material as THREE.MeshStandardMaterial, (hex) => darken(hex, 0.08));
  panel.position.set(HALF + 0.03, 0, 0);
  group.add(panel);

  const badgeGeo = new THREE.CylinderGeometry(0.81, 0.81, 0.06, 48);
  const badge = new THREE.Mesh(
    badgeGeo,
    new THREE.MeshStandardMaterial({ color: PALETTE.white, roughness: 0.5, metalness: 0 }),
  );
  badge.rotation.z = Math.PI / 2;
  badge.position.set(HALF + 0.09, 0, 0);
  group.add(badge);

  const iconTex = makeIconTexture(layer.icon, PALETTE.ink);
  const icon = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 1.1),
    new THREE.MeshBasicMaterial({ map: iconTex, transparent: true }),
  );
  icon.rotation.y = Math.PI / 2;
  icon.position.set(HALF + 0.125, 0, 0);
  group.add(icon);
}

/** The layer number, engraved look, plus registration crosses, on the +z face. */
function addLeftNumber(group: THREE.Group, layer: LayerConfig, color: string): void {
  const tex = makeNumberTexture(layer.number, FLAT * 2, SLAB_T - 0.28, {
    main: darken(color, 0.28),
    highlight: lighten(color, 0.22),
    cross: PALETTE.graphite,
  });
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(FLAT * 2, SLAB_T - 0.28),
    new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.85, metalness: 0 }),
  );
  face.position.set(0, 0, HALF + 0.004);
  group.add(face);
}
