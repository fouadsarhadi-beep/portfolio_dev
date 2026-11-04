/** @module scene/rooms/frontend: the development workspace on layer 5. @see docs/ROOMS.md (5 frontend), README.md (in this folder) */
import * as THREE from 'three';
import type { RoomBuilder } from '@/config/types';
import { buildShell } from '../shell.ts';
import { buildLayout, type FrontendHandles } from './layout';
import { createAnim } from './anim';

export const build: RoomBuilder = (ctx) => {
  const group = new THREE.Group();
  group.name = 'room-frontend';

  group.add(buildShell(ctx));
  const handles = buildLayout(ctx, group);
  const anim = createAnim(handles);

  return {
    group,
    update: anim.update,
    dispose: anim.dispose,
  };
};
