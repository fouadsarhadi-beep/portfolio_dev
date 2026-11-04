/** @module ui/keyboard: layer-nav focus, ArrowUp/ArrowDown selection, Enter via native click, Escape. @see docs/MOTION.md (Pick, hover, touch), src/lib/bus.ts */
import { bus } from '@/lib/bus';
import { LAYERS } from '@/config/layers';

export function initKeyboard(): void {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('.layer-nav button')];
  buttons.forEach((btn, i) => {
    const id = LAYERS[i]?.id;
    if (!id) return;
    btn.addEventListener('focus', () => bus.emit('layer:select', { id }));
    // Enter and Space arrive as a native click on a focused button.
    btn.addEventListener('click', () => bus.emit('layer:open', { id }));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        buttons[Math.min(i + 1, buttons.length - 1)].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        buttons[Math.max(i - 1, 0)].focus();
      }
    });
  });

  // Escape closes the preview (and the detail view, once T08 adds it).
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') bus.emit('layer:hover', { id: null });
  });
}
