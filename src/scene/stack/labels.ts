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
      for (let i = 0; i < buttons.length && i < LAYERS.length; i++) {
        const rect = getLayerRect(LAYERS[i].id);
        if (!rect) continue;
        // Anchor just beyond the projected outer-right corner of the slab.
        const stageWidth = nav.parentElement?.clientWidth ?? window.innerWidth;
        const maxX = Math.max(12, stageWidth - buttons[i].offsetWidth - 12);
        const x = Math.min(rect.left + 20, maxX);
        const y = rect.top - 18;
        buttons[i].style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      }
    },
  };
}
