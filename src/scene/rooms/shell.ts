/** @module scene/rooms/shell: room floor, back walls, AO strips and the shared material kit. @see docs/ROOMS.md (Rules), docs/DESIGN.md, src/scene/rooms/props/screen.ts, src/scene/scene-theme.ts */
import * as THREE from 'three';
import { FOOTPRINT, WALL_H, WALL_THICK } from '@/config/tuning';
import { PALETTE, lighten, darken } from '@/config/palette';
import type { MaterialKit } from '@/config/types';
import { makeGradientTexture } from './props/screen';
import { registerMaterial } from '../scene-theme';

const FLOOR_HALF = FOOTPRINT / 2 - 0.26; // room floor inset from the slab edge

/** Disposes a room's geometries and texture maps. Shared kit materials and
 *  theme-registered materials survive (they belong to the scene, not the room). */
export function disposeObject(group: THREE.Group): void {
  group.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      const std = m as THREE.MeshStandardMaterial;
      if (std.map) std.map.dispose();
    }
  });
}

export function createMaterialKit(): MaterialKit {
  const std = (o: THREE.MeshStandardMaterialParameters): THREE.MeshStandardMaterial =>
    new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0, ...o });
  const kit: MaterialKit = {
    wall: std({ color: PALETTE.wall, roughness: 0.95 }),
    wallShade: std({ color: PALETTE.wallShade, roughness: 0.95 }),
    wood: std({ color: PALETTE.wood, roughness: 0.8 }),
    woodDark: std({ color: darken(PALETTE.wood, 0.2), roughness: 0.8 }),
    white: std({ color: PALETTE.white, roughness: 0.6 }),
    graphite: std({ color: PALETTE.graphite, roughness: 0.5 }),
    glow: std({ color: PALETTE.glow, roughness: 0.3 }),
    sage: std({ color: PALETTE.sage, roughness: 0.7 }),
  };
  // Every kit material follows its semantic role, so all rooms theme at once.
  registerMaterial((c) => c.wall, kit.wall as THREE.MeshStandardMaterial);
  registerMaterial((c) => c.wallShade, kit.wallShade as THREE.MeshStandardMaterial);
  registerMaterial((c) => c.wood, kit.wood as THREE.MeshStandardMaterial);
  registerMaterial((c) => c.woodDark, kit.woodDark as THREE.MeshStandardMaterial, (hex) => darken(hex, 0.2));
  registerMaterial((c) => c.white, kit.white as THREE.MeshStandardMaterial);
  registerMaterial((c) => c.graphite, kit.graphite as THREE.MeshStandardMaterial);
  registerMaterial((c) => c.glow, kit.glow as THREE.MeshStandardMaterial);
  registerMaterial((c) => c.layerAccents.cms, kit.sage as THREE.MeshStandardMaterial);
  return kit;
}

/** Wood floor with instanced tile pattern, two back walls (-x, -z) with caps and AO strips. */
export function buildShell(ctx: { mat: MaterialKit }): THREE.Group {
  const group = new THREE.Group();
  group.name = 'shell';

  // Floor base plate.
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(FLOOR_HALF * 2, 0.02, FLOOR_HALF * 2),
    ctx.mat.woodDark,
  );
  base.position.y = 0.01;
  base.receiveShadow = true;
  group.add(base);

  // Tile pattern: one InstancedMesh, 8 x 8 tiles with alternating shades.
  const tileGeo = new THREE.BoxGeometry(0.66, 0.02, 0.66);
  const tileMat = new THREE.MeshStandardMaterial({ color: PALETTE.wood, roughness: 0.75, metalness: 0 });
  const tiles = new THREE.InstancedMesh(tileGeo, tileMat, 64);
  const m = new THREE.Matrix4();
  const cLight = new THREE.Color(lighten(PALETTE.wood, 0.1));
  const cBase = new THREE.Color(PALETTE.wood);
  let i = 0;
  for (let gx = 0; gx < 8; gx++) {
    for (let gz = 0; gz < 8; gz++) {
      const x = -FLOOR_HALF + 0.36 + gx * ((FLOOR_HALF * 2 - 0.72) / 7);
      const z = -FLOOR_HALF + 0.36 + gz * ((FLOOR_HALF * 2 - 0.72) / 7);
      m.makeTranslation(x, 0.03, z);
      tiles.setMatrixAt(i, m);
      tiles.setColorAt(i, (gx + gz) % 2 === 0 ? cBase : cLight);
      i++;
    }
  }
  tiles.receiveShadow = true;
  group.add(tiles);

  addWall(group, ctx, 'x');
  addWall(group, ctx, 'z');
  addAoStrip(group, 'x');
  addAoStrip(group, 'z');
  return group;
}

function addWall(group: THREE.Group, ctx: { mat: MaterialKit }, axis: 'x' | 'z'): void {
  const inner = FLOOR_HALF - WALL_THICK;
  const len = FLOOR_HALF * 2;
  const capMat = ctx.mat.white;
  if (axis === 'x') {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(WALL_THICK, WALL_H, len), ctx.mat.wall);
    wall.position.set(-inner, WALL_H / 2, 0);
    setWallShadows(wall);
    group.add(wall);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(WALL_THICK + 0.05, 0.05, len + 0.05), capMat);
    cap.position.set(-inner, WALL_H + 0.02, 0);
    group.add(cap);
  } else {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(len, WALL_H, WALL_THICK), ctx.mat.wallShade);
    wall.position.set(0, WALL_H / 2, -inner);
    setWallShadows(wall);
    group.add(wall);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(len + 0.05, 0.05, WALL_THICK + 0.05), capMat);
    cap.position.set(0, WALL_H + 0.02, -inner);
    group.add(cap);
  }
}

function setWallShadows(wall: THREE.Mesh): void {
  wall.castShadow = true;
  wall.receiveShadow = true;
}

/** Dark gradient strip along the base of one back wall (hand-made AO). */
function addAoStrip(group: THREE.Group, axis: 'x' | 'z'): void {
  const tex = makeGradientTexture(128, 32, 'to-right');
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.09, depthWrite: false });
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(WALL_H, 0.34), mat);
  strip.rotation.x = -Math.PI / 2;
  const at = FLOOR_HALF - WALL_THICK - 0.17;
  if (axis === 'x') {
    strip.rotation.z = Math.PI / 2;
    strip.position.set(-at + 0.17, 0.045, 0);
  } else {
    strip.position.set(0, 0.045, -at + 0.17);
    strip.rotation.z = 0;
  }
  group.add(strip);
}
