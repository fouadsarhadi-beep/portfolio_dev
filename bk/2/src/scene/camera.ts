/** @module scene/camera: orthographic camera locked to the (1,1,1) isometric view, with damped follow. @see docs/DESIGN.md (Camera), docs/MOTION.md (Camera), src/config/tuning.ts */
import * as THREE from 'three';
import { CAM_DIR, CAM_DISTANCE, CAM_VIEW_HEIGHT, CAM_DAMP_LAMBDA } from '@/config/tuning';

const NEAR = 0.1;
const FAR = 100;

export function createCamera(width: number, height: number): THREE.OrthographicCamera {
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, NEAR, FAR);
  resizeCamera(camera, width, height);
  // Lock the view direction: position = target + (1,1,1) x distance, target at origin.
  camera.position.set(CAM_DIR.x * CAM_DISTANCE, CAM_DIR.y * CAM_DISTANCE, CAM_DIR.z * CAM_DISTANCE);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  return camera;
}

export function resizeCamera(camera: THREE.OrthographicCamera, width: number, height: number): void {
  const halfH = CAM_VIEW_HEIGHT / 2;
  const halfW = (halfH * Math.max(width, 1)) / Math.max(height, 1);
  camera.left = -halfW;
  camera.right = halfW;
  camera.top = halfH;
  camera.bottom = -halfH;
  camera.updateProjectionMatrix();
}

/**
 * Damped follow: the target Y eases toward wantY (lambda 6). Moves the camera
 * with the target and returns the current target Y. The caller adds the landing
 * jolt to the lookAt target only (docs/MOTION.md Camera).
 */
export function followCamera(camera: THREE.OrthographicCamera, wantY: number, dt: number): number {
  const cur = typeof camera.userData.targetY === 'number' ? camera.userData.targetY : wantY;
  const next = cur + (wantY - cur) * (1 - Math.exp(-CAM_DAMP_LAMBDA * Math.max(dt, 0)));
  camera.userData.targetY = next;
  camera.position.set(CAM_DIR.x * CAM_DISTANCE, next + CAM_DIR.y * CAM_DISTANCE, CAM_DIR.z * CAM_DISTANCE);
  camera.updateMatrixWorld();
  return next;
}
