/** @module scene/rooms/infrastructure/anim: idle loops of the server facility. @see docs/ROOMS.md (7 infrastructure), docs/MOTION.md (Idle animation) */
import * as THREE from 'three';
import { PALETTE, lighten, darken } from '@/config/palette';
import { makeCanvasTexture } from '../props/screen.ts';
import type { InfraHandles } from './layout';

/** Scrolling graph for the network panel screen. */
export function drawGraph(c: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  c.fillStyle = PALETTE.graphite;
  c.fillRect(0, 0, w, h);
  c.strokeStyle = PALETTE.glow;
  c.lineWidth = 3;
  c.beginPath();
  const shift = (t * 40) % 20;
  for (let x = -shift; x < w; x += 20) {
    const y = h * 0.5 - Math.abs(Math.sin(x * 0.05 + t * 2)) * h * 0.35;
    if (x === -shift) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.stroke();
}

export interface Anim {
  update(time: number, dt: number, exposure: number): void;
  dispose(): void;
}

export function createAnim(handles: InfraHandles): Anim {
  const graphClock = { t: 0 };
  const ledClock = { t: 0 };
  const on = new THREE.Color(PALETTE.glow);
  const off = new THREE.Color(darken(PALETTE.graphite, 0.2));
  const dim = new THREE.Color(lighten(PALETTE.graphite, 0.3));
  const m = new THREE.Matrix4();

  return {
    update(time, dt, _exposure) {
      // 1. LEDs blink in different patterns per row (<=12 fps updates).
      ledClock.t += dt;
      if (ledClock.t > 0.3) {
        ledClock.t = 0;
        handles.ledMeshes.forEach((mesh, mi) => {
          const count = mesh.count;
          for (let i = 0; i < count; i++) {
            const phase = Math.sin(time * (3 + mi) + i * 1.3 + mi * 2);
            mesh.setColorAt(i, phase > 0 ? on : mi === 0 ? off : dim);
          }
          if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
          void m;
        });
      }

      // 2. The network panel graph scrolls (<=12 fps redraw).
      graphClock.t += dt;
      if (graphClock.t > 0.45) {
        graphClock.t = 0;
        const c = (handles.graphTex.image as HTMLCanvasElement).getContext('2d');
        if (c) {
          drawGraph(c, 256, 128, time);
          handles.graphTex.needsUpdate = true;
        }
      }

      // 3. Cooling fans spin.
      handles.fans.forEach((fan, i) => {
        const blades = fan.getObjectByName('blades');
        if (blades) blades.rotation.y += dt * (5 - i);
      });

      // 4. Cable status lights pulse.
      handles.statusLights.forEach((led, i) => {
        const mat = led.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.4 + 0.7 * Math.max(0, Math.sin(time * 2.6 - i * 1.2));
      });

      // 5. Ambient light shifts slightly.
      handles.ambient.intensity = 0.22 + Math.sin(time * 0.7) * 0.06;
    },
    dispose() {
      // No per-instance GPU resources yet; T12 revisits disposal.
    },
  };
}

/** Warning decal texture for the racks. */
export function warnTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(64, 80, (c) => {
    c.fillStyle = PALETTE.ledAmber;
    c.beginPath();
    c.moveTo(32, 6);
    c.lineTo(58, 72);
    c.lineTo(6, 72);
    c.closePath();
    c.fill();
    c.fillStyle = PALETTE.graphite;
    c.font = '600 44px sans-serif';
    c.textAlign = 'center';
    c.fillText('!', 32, 62);
  });
}

/** Network panel: rack board with patch cables and the graph screen. */
export function makeNetworkPanel(x: number, y: number, z: number, graphTex: THREE.CanvasTexture): THREE.Group {
  const group = new THREE.Group();
  group.name = 'networkPanel';
  const rack = new THREE.MeshStandardMaterial({ color: darken(PALETTE.steel, 0.35), roughness: 0.6, metalness: 0.2 });
  group.add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.03), rack));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.26), new THREE.MeshBasicMaterial({ map: graphTex }));
  screen.position.set(-0.2, 0.08, 0.02);
  group.add(screen);
  const cols = [PALETTE.glow, lighten(PALETTE.steel, 0.4), PALETTE.white];
  for (let i = 0; i < 3; i++) {
    const cable = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.34, 0.008), new THREE.MeshBasicMaterial({ color: cols[i] }));
    cable.position.set(0.18 + i * 0.09, -0.08, 0.02);
    cable.rotation.z = 0.12 * (i - 1);
    group.add(cable);
  }
  group.position.set(x, y, z);
  return group;
}
