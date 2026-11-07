/** @module main: page entry; resolves the locale, boots the scene, then wires the UI layer to it. @see src/scene/boot.ts, src/lib/i18n.ts, src/ui/preview.ts, src/ui/detail.ts, src/ui/keyboard.ts */
import { initLocale } from '@/lib/i18n';

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
});
