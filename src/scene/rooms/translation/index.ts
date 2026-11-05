/** @module scene/rooms/translation: the language studio on layer 2. @see docs/ROOMS.md (2 translation), README.md (in this folder) */
import * as THREE from 'three';
import type { RoomBuilder } from '@/config/types';
import { buildShell, disposeObject } from '../shell.ts';
import { buildLayout } from './layout';
import { createAnim } from './anim';

export const build: RoomBuilder = (ctx) => {
  const group = new THREE.Group();
  group.name = 'room-translation';

  group.add(buildShell(ctx));
  const handles = buildLayout(ctx, group);
  const anim = createAnim(group, handles);

  return {
    group,
    update: anim.update,
    dispose() {
      anim.dispose();
      disposeObject(group);
    },
  };
};
