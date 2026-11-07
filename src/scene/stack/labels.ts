/** @module scene/stack/labels: pins each layer-nav button to its slab's right face via getLayerRect. @see docs/MOTION.md (Pick, hover, touch), src/scene/stack/pick.ts */
import { LAYERS } from '@/config/layers';
import { getLayerRect } from '../api';

export interface LabelParts {
  buttons: HTMLButtonElement[];
  update(): void;
}

export function initLabels(): LabelParts {
  const nav = document.querySelector<HTMLElement>('.layer-nav');
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('.layer-nav button')];
  if (!nav || buttons.length === 0) {
    return { buttons, update: () => undefined };
  }

  // Buttons become absolutely positioned children of the sticky stage,
  // one per slab, following its right face every frame. Clearing the CSS
  // transform matters: it would keep the nav a stacking context + containing
  // block, trapping the buttons below the canvas (T19 QA finding).
  nav.style.position = 'static';
  nav.style.transform = 'none';
  for (const li of nav.querySelectorAll('li')) {
    (li as HTMLElement).style.display = 'contents';
  }
  for (const btn of buttons) {
    btn.style.position = 'absolute';
    btn.style.left = '0';
    btn.style.top = '0';
    btn.style.zIndex = '4'; // above the canvas (z 2), below the preview card (z 6)
    btn.style.willChange = 'transform';
  }

  return {
    buttons,
    update() {
      const mount = document.getElementById('canvas-mount');
      const stage = nav.parentElement as HTMLElement | null;
      const stageH = stage?.clientHeight ?? window.innerHeight;
      // getLayerRect is canvas-relative; the buttons are positioned against the
      // stage, so add the cell's own offset. The cell is the tower's column, so
      // its bounds are also the fence that keeps a pill out of the text columns.
      const ox = mount?.offsetLeft ?? 0;
      const oy = mount?.offsetTop ?? 0;
      const left = ox + 4;
      const right = ox + (mount?.clientWidth ?? window.innerWidth) - 8;
      for (let i = 0; i < buttons.length && i < LAYERS.length; i++) {
        const rect = getLayerRect(LAYERS[i].id);
        if (!rect) continue;
        const btn = buttons[i];
        // Cap the pill to the room right of its own anchor (the slab's outer
        // corner), so a long floor name wraps instead of running into a text cell.
        const anchor = rect.left + ox + 20;
        const cap = Math.round(Math.max(96, right - anchor));
        const capPx = `${cap}px`;
        if (btn.style.maxInlineSize !== capPx) btn.style.maxInlineSize = capPx;
        const bw = btn.offsetWidth;
        const bh = btn.offsetHeight;
        const x = Math.min(anchor, Math.max(left, right - bw));
        const y = Math.min(Math.max(rect.top + oy - 18, 4), Math.max(4, stageH - bh - 4));
        btn.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      }
    },
  };
}
