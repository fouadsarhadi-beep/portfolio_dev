/** @module scene/rooms/infrastructure: the server facility on the bottom layer. @see docs/ROOMS.md (7 infrastructure), README.md (in this folder) */
import * as THREE from 'three';
import type { RoomBuilder } from '@/config/types';
import { buildShell, disposeObject } from '../shell.ts';
import { buildLayout, type InfraHandles } from './layout';
import { createAnim } from './anim';

export const build: RoomBuilder = (ctx) => {
  const group = new THREE.Group();
  group.name = 'room-infrastructure';

  group.add(buildShell(ctx));
  const handles = buildLayout(ctx, group);
  const anim = createAnim(handles);

  return {
    group,
    update: anim.update,
    dispose() {
      anim.dispose();
      disposeObject(group);
    },
  };
};
