/** @module scene/rooms/design: the design studio on layer 4. @see docs/ROOMS.md (4 design), README.md (in this folder) */
import * as THREE from 'three';
import type { RoomBuilder } from '@/config/types';
import { buildShell } from '../shell.ts';
import { buildLayout, type DesignHandles } from './layout';
import { createAnim } from './anim';

export const build: RoomBuilder = (ctx) => {
  const group = new THREE.Group();
  group.name = 'room-design';

  group.add(buildShell(ctx));
  const handles = buildLayout(ctx, group);
  const anim = createAnim(handles);

  return {
    group,
    update: anim.update,
    dispose: anim.dispose,
  };
};
