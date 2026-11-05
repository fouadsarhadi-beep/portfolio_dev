/** @module scene/lights: hemisphere, warm key with soft shadows, weak cool fill. @see docs/DESIGN.md (Light and render), src/scene/renderer.ts, src/scene/scene-theme.ts */
import * as THREE from 'three';
import { PALETTE, lighten } from '@/config/palette';
import type { QualityTier } from '@/lib/quality';
import { shadowMapSize } from './renderer';
import { registerLight } from './scene-theme';

export function createLights(tier: QualityTier): THREE.Light[] {
  // Hemisphere: sky follows the background glow, ground follows the floor tone.
  const hemi = new THREE.HemisphereLight(PALETTE.bgGlow, lighten(PALETTE.wood, 0.45), 0.7);
  registerLight(hemi, (c) => c.bgGlow, { light: 0.7, dark: 0.45 });

  // Key light from the top-left-front of the screen; casts the soft shadows.
  const key = new THREE.DirectionalLight(PALETTE.bgGlow, 2.2);
  key.position.set(-6, 14, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(shadowMapSize(tier), shadowMapSize(tier));
  key.shadow.radius = 4;
  key.shadow.bias = -0.0004;
  key.shadow.camera.left = -16;
  key.shadow.camera.right = 16;
  key.shadow.camera.top = 16;
  key.shadow.camera.bottom = -16;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 60;
  registerLight(key, (c) => c.bgGlow, { light: 2.2, dark: 1.5 });

  // Weak cool fill from the right, no shadows.
  const fill = new THREE.DirectionalLight(PALETTE.glow, 0.3);
  fill.position.set(14, 4, -4);
  registerLight(fill, (c) => c.glow, { light: 0.3, dark: 0.22 });

  return [hemi, key, fill];
}
