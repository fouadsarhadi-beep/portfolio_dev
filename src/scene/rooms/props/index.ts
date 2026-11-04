/** @module scene/rooms/props/index: the shared prop kit; rooms import props only through here. @see docs/WIRING.md (How to add a prop) */
import type { PropKit } from '@/config/types';
import { makeDesk } from './desk';
import { makeChair } from './chair';
import { makeMonitor } from './monitor';
import { makeLaptop } from './laptop';
import { makePlant } from './plant';
import { makeLamp } from './lamp';
import { makeShelf } from './shelf';
import { makeRug } from './rug';
import { makeMug } from './mug';
import { makePapers } from './papers';
import { makeWallFrame } from './frame';
import { makeCorkboard } from './corkboard';
import { makeWindow } from './window';
import { makeKeyboard } from './keyboard';
import { makeDuck } from './duck';
import { makeGauge } from './gauge';
import { makeEasel } from './easel';
import { makeChipFan } from './chipfan';
import { makeMoodBoard } from './moodboard';
import { makeCardGrid } from './cardgrid';
import { makeTokenRack } from './tokenrack';

export {
  makeDesk, makeChair, makeMonitor, makeLaptop, makePlant, makeLamp,
  makeShelf, makeRug, makeMug, makePapers, makeWallFrame, makeCorkboard, makeWindow, makeKeyboard,
  makeDuck, makeGauge, makeEasel, makeChipFan, makeMoodBoard, makeCardGrid, makeTokenRack,
};

export const PROPS: PropKit = {
  desk: makeDesk,
  chair: makeChair,
  monitor: makeMonitor,
  laptop: makeLaptop,
  plant: makePlant,
  lamp: makeLamp,
  shelf: makeShelf,
  rug: makeRug,
  mug: makeMug,
  papers: makePapers,
  frame: makeWallFrame,
  corkboard: makeCorkboard,
  window: makeWindow,
  keyboard: makeKeyboard,
  duck: makeDuck,
  gauge: makeGauge,
  easel: makeEasel,
  chipFan: makeChipFan,
  moodBoard: makeMoodBoard,
  cardGrid: makeCardGrid,
  tokenRack: makeTokenRack,
};
