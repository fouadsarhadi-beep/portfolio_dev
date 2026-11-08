/** @module main: page entry; resolves the locale, boots the scene, then wires the UI layer to it. @see src/scene/boot.ts, src/lib/i18n.ts, src/ui/preview.ts, src/ui/detail.ts, src/ui/keyboard.ts */
import { initLocale } from '@/lib/i18n';
import { bus } from '@/lib/bus';

// Locale before anything renders text from the dictionaries.
initLocale();

// boot() stays tiny so the eager chunk stays small; everything heavy loads after first paint.
void import('@/scene/boot').then((m) => m.boot()).then(async () => {
  const [{ initPreview }, { initDetail }, { initKeyboard }] = await Promise.all([
    import('@/ui/preview'),
    import('@/ui/detail'),
    import('@/ui/keyboard'),
  ]);
  initPreview();
  initDetail();
  initKeyboard();

  // A scrolled reload can emit step:change while the UI chunks were still
  // loading, leaving the nav and ladder on floor 01 while the panel (which
  // seeds from __stack) shows the real one. Re-broadcast once, now that every
  // listener is registered, so all three agree before the first paint frame.
  const debug = (window as unknown as Record<string, unknown>).__stack as { step?: number } | null;
  bus.emit('step:change', { step: typeof debug?.step === 'number' ? debug.step : 0 });
});
