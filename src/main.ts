/** @module main: page entry; resolves the locale, runs the first-visit pickers, boots the scene (skipped on the simple build), then wires the UI layer to it. @see src/scene/boot.ts, src/lib/i18n.ts, src/ui/picker.ts, src/ui/preview.ts, src/ui/detail.ts, src/ui/keyboard.ts, src/ui/nav-level.ts */
import { applyLocaleDom, initLocale } from '@/lib/i18n';
import { bus } from '@/lib/bus';

// Locale before anything renders text from the dictionaries.
initLocale();
applyLocaleDom();

// The simple build (/simple/) has no 3D stage: UI only, no scene boot.
const SIMPLE = window.location.pathname.startsWith('/simple');

import('@/ui/picker').then((m) => {
  if (!SIMPLE) m.initPicker(); // first-visit popups only on the entry page
  m.initLangToggle();
});

if (!SIMPLE) {
  // boot() stays tiny so the eager chunk stays small; everything heavy loads after first paint.
  void import('@/scene/boot').then((m) => m.boot()).then(async () => {
    const [{ initPreview }, { initDetail }, { initKeyboard }, { initNavLevel }] = await Promise.all([
      import('@/ui/preview'),
      import('@/ui/detail'),
      import('@/ui/keyboard'),
      import('@/ui/nav-level'),
    ]);
    initPreview();
    initDetail();
    initKeyboard();
    initNavLevel();

    // A scrolled reload can emit step:change while the UI chunks were still
    // loading, leaving the nav and ladder on floor 01 while the panel shows
    // the real one. Re-broadcast once, now that every listener is registered.
    const debug = (window as unknown as Record<string, unknown>).__stack as { step?: number } | null;
    bus.emit('step:change', { step: typeof debug?.step === 'number' ? debug.step : 0 });
  });
} else {
  // The simple build wires the detail view and keyboard only (no scene).
  void Promise.all([import('@/ui/detail'), import('@/ui/keyboard')]).then(([{ initDetail }, { initKeyboard }]) => {
    initDetail();
    initKeyboard();
  });
}
