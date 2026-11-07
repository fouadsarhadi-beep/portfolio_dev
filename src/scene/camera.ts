/** @module scene/camera: orthographic camera locked to the (1,1,1) isometric view, with damped follow and the framing-offset tween. @see docs/DESIGN.md (Camera), docs/MOTION.md (Camera), src/config/tuning.ts */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { CAM_DIR, CAM_DISTANCE, CAM_VIEW_HEIGHT, CAM_DAMP_LAMBDA, CAM_FRAME_OFFSET_Y } from '@/config/tuning';

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

/**
 * Sets the vertical framing offset and rebuilds the frustum. The offset keeps
 * the lift in pixels at any zoom, so the detail view has to neutralise it
 * rather than inherit it (src/scene/focus.ts).
 */
export function applyFraming(camera: THREE.OrthographicCamera, offsetY: number): void {
  const halfH = CAM_VIEW_HEIGHT / 2;
  camera.userData.frameOffset = offsetY;
  camera.top = halfH - offsetY;
  camera.bottom = -halfH - offsetY;
  camera.updateProjectionMatrix();
}

export function resizeCamera(camera: THREE.OrthographicCamera, width: number, height: number): void {
  const halfH = CAM_VIEW_HEIGHT / 2;
  const halfW = (halfH * Math.max(width, 1)) / Math.max(height, 1);
  camera.left = -halfW;
  camera.right = halfW;
  // Re-apply whatever offset is current: the hero lift, or the value the detail
  // view tweened to while it owns the framing.
  const offset =
    typeof camera.userData.frameOffset === 'number' ? camera.userData.frameOffset : CAM_FRAME_OFFSET_Y;
  applyFraming(camera, offset);
}

/** The framing offset currently applied: the hero lift, or a value mid-tween. */
export function currentFrameOffset(camera: THREE.OrthographicCamera): number {
  return typeof camera.userData.frameOffset === 'number' ? camera.userData.frameOffset : CAM_FRAME_OFFSET_Y;
}

/** Eases the frustum framing offset to `to`; the scene stays put in view space. */
export function tweenFraming(
  camera: THREE.OrthographicCamera,
  to: number,
  duration: number,
  ease: string,
): void {
  const framing = { off: currentFrameOffset(camera) };
  gsap.to(framing, {
    off: to,
    duration,
    ease,
    overwrite: true,
    onUpdate: () => applyFraming(camera, framing.off),
  });
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
