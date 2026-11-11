/** @module ui/keyboard: layer-nav focus, ArrowUp/ArrowDown selection, Enter via native click, Escape. @see docs/MOTION.md (Pick, hover, touch), src/lib/bus.ts */
import { bus } from '@/lib/bus';
import { LAYERS } from '@/config/layers';

export function initKeyboard(): void {
  const nav = document.querySelector<HTMLElement>('.layer-nav');
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

  // Tabbing out of the layer nav must not leave a stuck info card (T29).
  nav?.addEventListener('focusout', (e) => {
    if (!(e.relatedTarget instanceof Node) || !nav.contains(e.relatedTarget)) {
      bus.emit('layer:hover', { id: null });
    }
  });

  // Escape closes the preview (and the detail view, once T08 adds it).
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') bus.emit('layer:hover', { id: null });
  });

  // Floors from the keyboard: 1..6 open a floor, [ and ] step the stack by one
  // scroll step. Ignored while the reader is typing or a modifier is held.
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const el = e.target as HTMLElement | null;
    if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;

    const n = Number(e.key);
    if (Number.isInteger(n) && n >= 1 && n <= LAYERS.length) {
      e.preventDefault();
      bus.emit('layer:open', { id: LAYERS[n - 1].id });
      return;
    }

    if (e.key === '[' || e.key === ']') {
      const stage = document.querySelector<HTMLElement>('.stage');
      if (!stage) return;
      e.preventDefault();
      // One step is a quarter of the viewport (STEP_PX_FACTOR in stack/state.ts).
      const px = 0.2 * window.innerHeight * (e.key === ']' ? 1 : -1);
      window.scrollBy({ top: px, behavior: 'smooth' });
    }
  });
}
