/** @module ui/dialog: dialog semantics: aria, focus in and out, Tab trap, Escape. @see docs/MOTION.md (Detail view), src/ui/detail.ts */
import { gsap } from 'gsap';

export interface DialogHandle {
  open(): void;
  close(): void;
  panel: HTMLElement;
}

export function createDialog(
  build: (panel: HTMLElement) => void,
  opts: { labelledBy: string; onEscape: () => void },
): DialogHandle {
  const panel = document.createElement('section');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', opts.labelledBy);
  panel.hidden = true;
  build(panel);

  let restoreFocusTo: HTMLElement | null = null;

  const trapTab = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab' || panel.hidden) return;
    const focusables = [...panel.querySelectorAll<HTMLElement>('button, a[href]')]
      .filter((el) => !el.hasAttribute('disabled'));
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const onKeydown = (e: KeyboardEvent): void => {
    if (panel.hidden) return;
    if (e.key === 'Escape') opts.onEscape();
    trapTab(e);
  };
  document.addEventListener('keydown', onKeydown);

  return {
    panel,

    open(): void {
      restoreFocusTo = document.activeElement as HTMLElement | null;
      panel.hidden = false;
      const first = panel.querySelector<HTMLElement>('button, a[href]');
      first?.focus();
    },

    close(): void {
      if (panel.hidden) return;
      panel.hidden = true;
      gsap.killTweensOf(panel.querySelectorAll('*'));
      if (restoreFocusTo) restoreFocusTo.focus();
      restoreFocusTo = null;
    },
  };
}
