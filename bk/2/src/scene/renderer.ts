/** @module scene/renderer: transparent WebGL renderer with capped pixel ratio and soft shadows. @see docs/DESIGN.md (Light and render), src/scene/boot.ts */
import * as THREE from 'three';
import { EXPOSURE, MAX_PIXEL_RATIO, SHADOW_MAP_DESKTOP, SHADOW_MAP_MOBILE } from '@/config/tuning';
import type { QualityTier } from '@/lib/quality';

export function createRenderer(mount: HTMLElement, tier: QualityTier): THREE.WebGLRenderer {
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  // The canvas must not block vertical scroll (AGENTS hard rule).
  canvas.style.touchAction = 'pan-y';
  canvas.style.display = 'block';
  mount.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const ratioCap = tier === 'high' ? MAX_PIXEL_RATIO : 1.25;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, ratioCap));
  renderer.setSize(mount.clientWidth, mount.clientHeight, false);

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = EXPOSURE;

  renderer.shadowMap.enabled = true;
  // three r187 removed PCFSoftShadowMap; PCFShadowMap is the soft option now.
  renderer.shadowMap.type = THREE.PCFShadowMap;

  return renderer;
}

export function shadowMapSize(tier: QualityTier): number {
  return tier === 'high' ? SHADOW_MAP_DESKTOP : SHADOW_MAP_MOBILE;
}
