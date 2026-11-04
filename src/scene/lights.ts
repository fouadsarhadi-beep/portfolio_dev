/** @module scene/lights: hemisphere, warm key with soft shadows, weak cool fill. @see docs/DESIGN.md (Light and render), src/scene/renderer.ts */
import * as THREE from 'three';
import { PALETTE, lighten } from '@/config/palette';
import type { QualityTier } from '@/lib/quality';
import { shadowMapSize } from './renderer';

export function createLights(tier: QualityTier): THREE.Light[] {
  // Hemisphere: sky near-white, ground a light warm tone from the palette.
  const hemi = new THREE.HemisphereLight(PALETTE.bgGlow, lighten(PALETTE.wood, 0.45), 0.7);

  // Key light from the top-left-front of the screen; casts the soft shadows.
  const key = new THREE.DirectionalLight(PALETTE.bgGlow, 2.2);
  key.position.set(-6, 14, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(shadowMapSize(tier), shadowMapSize(tier));
  key.shadow.radius = 4;
  key.shadow.bias = -0.0004;
  key.shadow.camera.left = -12;
  key.shadow.camera.right = 12;
  key.shadow.camera.top = 12;
  key.shadow.camera.bottom = -12;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 60;

  // Weak cool fill from the right, no shadows.
  const fill = new THREE.DirectionalLight(PALETTE.glow, 0.3);
  fill.position.set(14, 4, -4);

  return [hemi, key, fill];
}
