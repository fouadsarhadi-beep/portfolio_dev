/** @module scene/rooms/content/anim: the five idle loops of the writing studio. @see docs/ROOMS.md (1 content), docs/MOTION.md (Idle animation) */
import * as THREE from 'three';

export interface Anim {
  update(time: number, dt: number, exposure: number): void;
  dispose(): void;
}

interface PlaneState { cx: number; cy: number; cz: number; rx: number; rz: number }

export function createAnim(room: THREE.Group): Anim {
  const lampShade = room.getObjectByName('lampShade') as THREE.Mesh | undefined;
  const lampLight = room.getObjectByName('lampLight') as THREE.PointLight | undefined;
  const leaves = room.getObjectByName('leaves');
  const topSheet = room.getObjectByName('topSheet');
  const sheetBaseY = topSheet?.position.y ?? 0;
  const notes: THREE.Object3D[] = [];
  for (let i = 0; i < 6; i++) {
    const note = room.getObjectByName(`note-${i}`);
    if (note) {
      notes.push(note);
      (note as THREE.Mesh).userData.baseRz = note.rotation.z;
    }
  }
  const plane = room.getObjectByName('paperPlane');
  const flight: PlaneState = { cx: 0.3, cy: 1.32, cz: 0.15, rx: 1.5, rz: 1.0 };

  return {
    update(time, _dt, _exposure) {
      // 1. Paper plane flies a loop with a slight bank.
      if (plane) {
        const a = time * 0.7;
        plane.position.set(
          flight.cx + Math.cos(a) * flight.rx,
          flight.cy + Math.sin(time * 1.4) * 0.08,
          flight.cz + Math.sin(a) * flight.rz,
        );
        plane.rotation.y = -a;
        plane.rotation.z = Math.cos(a) * 0.25;
      }

      // 2. Lamp glow pulses.
      const glow = 0.55 + Math.sin(time * 2.4) * 0.25;
      if (lampShade) {
        const mat = lampShade.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = glow;
      }
      if (lampLight) lampLight.intensity = 0.4 + glow * 0.45;

      // 3. Plant sways.
      if (leaves) {
        leaves.rotation.z = Math.sin(time * 1.3) * 0.06;
        leaves.rotation.x = Math.cos(time * 0.9) * 0.03;
      }

      // 4. Top paper sheet lifts and settles.
      if (topSheet) {
        topSheet.position.y = sheetBaseY + Math.sin(time * 0.8) ** 2 * 0.035;
      }

      // 5. Pinned notes flutter.
      notes.forEach((note, i) => {
        const base = (note as THREE.Mesh).userData.baseRz as number;
        note.rotation.z = base + Math.sin(time * 2.6 + i * 1.1) * 0.05;
        note.position.z = 0.03 + Math.sin(time * 3.1 + i) * 0.004;
      });
    },
    dispose() {
      // No per-instance GPU resources yet; T12 revisits disposal.
    },
  };
}
