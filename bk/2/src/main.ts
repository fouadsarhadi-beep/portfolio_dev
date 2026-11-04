/** @module main: page entry; boots the scene, then wires the UI layer to it. @see src/scene/boot.ts, src/ui/preview.ts, src/ui/detail.ts, src/ui/keyboard.ts */

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
