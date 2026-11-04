/** @module scene/rooms/props/laptop: open laptop with keyboard and glow screen. @see src/scene/rooms/props/screen.ts, src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE, lighten } from '@/config/palette';
import type { PropFactory } from '@/config/types';
import { drawCodeScreen, makeCanvasTexture } from './screen';

export const makeLaptop: PropFactory = (_ctx, opts) => {
  const group = new THREE.Group();
  group.name = 'laptop';
  const draw = opts?.draw as ((c: CanvasRenderingContext2D, w: number, h: number) => void) | undefined;
  const bodyMat = new THREE.MeshStandardMaterial({ color: lighten(PALETTE.graphite, 0.15), roughness: 0.5, metalness: 0.1 });

  const base = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.035, 0.4, 2, 0.03), bodyMat);
  base.position.y = 0.018;
  base.castShadow = true;
  group.add(base);

  // Keyboard deck: dark inset with a tiny space bar detail.
  const deck = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.012, 0.3, 1, 0.02), new THREE.MeshStandardMaterial({
    color: PALETTE.graphite, roughness: 0.6, metalness: 0,
  }));
  deck.position.set(0, 0.038, 0.02);
  group.add(deck);

  const lid = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.4, 0.025, 2, 0.03), bodyMat);
  lid.position.set(0, 0.22, -0.19);
  lid.rotation.x = -0.45;
  lid.castShadow = true;
  group.add(lid);

  const tex = makeCanvasTexture(384, 256, (c) => (draw ?? drawCodeScreen)(c, 384, 256));
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.52, 0.34),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  screen.position.set(0, 0.229, -0.17);
  screen.rotation.x = -0.45;
  group.add(screen);

  return group;
};
