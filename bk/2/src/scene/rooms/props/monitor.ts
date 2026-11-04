/** @module scene/rooms/props/monitor: desk monitor with a drawn canvas screen. @see src/scene/rooms/props/screen.ts, src/scene/rooms/props/index.ts */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE, lighten } from '@/config/palette';
import type { PropFactory } from '@/config/types';
import { drawCodeScreen, makeCanvasTexture } from './screen';

export const makeMonitor: PropFactory = (ctx, opts) => {
  const group = new THREE.Group();
  group.name = 'monitor';
  const draw = opts?.draw as ((c: CanvasRenderingContext2D, w: number, h: number) => void) | undefined;

  const frameMat = new THREE.MeshStandardMaterial({ color: lighten(PALETTE.graphite, 0.1), roughness: 0.5, metalness: 0 });
  const w = 0.95;
  const h = 0.6;

  const panel = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.05, 2, 0.03), frameMat);
  panel.position.y = h / 2 + 0.14;
  panel.castShadow = true;
  group.add(panel);

  const tex = makeCanvasTexture(512, 320, (c) => (draw ?? drawCodeScreen)(c, 512, 320));
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(w - 0.08, h - 0.08),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  screen.name = 'screen';
  screen.position.set(0, h / 2 + 0.14, 0.028);
  group.add(screen);

  const foot = new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.04, 0.26, 2, 0.03), frameMat);
  foot.position.y = 0.02;
  foot.castShadow = true;
  group.add(foot);

  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, 0.06), frameMat);
  neck.position.y = 0.1;
  neck.castShadow = true;
  group.add(neck);

  return group;
};
