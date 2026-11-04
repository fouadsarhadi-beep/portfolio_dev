/** @module ui/preview: the preview card; follows the hovered or selected slab. @see docs/MOTION.md (Pick, hover, touch), src/scene/api.ts, src/lib/bus.ts */
import { bus } from '@/lib/bus';
import { LAYERS } from '@/config/layers';
import { getLayerRect } from '@/scene/api';
import { ticker } from '@/lib/ticker';
import { t } from '@/lib/i18n';

let card: HTMLDivElement | null = null;
let numEl: HTMLElement | null = null;
let titleEl: HTMLElement | null = null;
let shortEl: HTMLElement | null = null;
let linkEl: HTMLAnchorElement | null = null;
let currentId: string | null = null;
let visible = false;

export function initPreview(): void {
  const host = document.querySelector<HTMLElement>('.stage-sticky');
  if (!host || card) return;

  card = document.createElement('div');
  card.setAttribute('data-preview-card', '');
  applyCardStyles(card);
  card.innerHTML = `
    <div data-pc-num></div>
    <div data-pc-body>
      <strong data-pc-title></strong>
      <p data-pc-short></p>
      <a data-pc-link rel="nofollow"></a>
    </div>`;
  numEl = card.querySelector('[data-pc-num]');
  titleEl = card.querySelector('[data-pc-title]');
  shortEl = card.querySelector('[data-pc-short]');
  linkEl = card.querySelector('[data-pc-link]');
  host.appendChild(card);

  bus.on('layer:hover', ({ id }) => {
    if (id) show(id);
    else hide();
  });
  bus.on('layer:select', ({ id }) => show(id));
  // While the detail view is open the preview card stays out of the way.
  bus.on('layer:open', () => hide());
  bus.on('layer:close', () => hide());

  // Track the slab while it lifts, lands or the camera moves.
  ticker.add(() => {
    if (visible && currentId && card) {
      const rect = getLayerRect(currentId);
      if (rect) card.style.transform = `translate(${Math.round(rect.left + 26)}px, ${Math.round(rect.top - 30)}px)`;
    }
  });
}

function applyCardStyles(el: HTMLDivElement): void {
  const s = el.style;
  s.position = 'absolute';
  s.left = '0';
  s.top = '0';
  s.zIndex = '6';
  s.display = 'flex';
  s.gap = '12px';
  s.alignItems = 'flex-start';
  s.maxWidth = '280px';
  s.padding = '12px 16px';
  s.background = 'var(--surface)';
  s.border = '2px solid var(--ink)';
  s.borderRadius = 'var(--radius-l)';
  s.boxShadow = 'var(--hard-offset) var(--hard-offset) 0 0 var(--layer-c, var(--c-butter))';
  s.pointerEvents = 'none';
  s.opacity = '0';
  s.transition = 'opacity 0.15s';
  s.willChange = 'transform';
}

function show(id: string): void {
  const layer = LAYERS.find((l) => l.id === id);
  if (!layer || !card || !numEl || !titleEl || !shortEl || !linkEl) return;
  currentId = id;
  numEl.textContent = layer.number;
  titleEl.textContent = layer.title;
  shortEl.textContent = layer.short;
  linkEl.textContent = t('preview.viewWork');
  linkEl.href = `/work/${layer.id}/`;
  card.style.setProperty('--layer-c', `var(--c-${layer.color})`);
  const rect = getLayerRect(id);
  if (rect) card.style.transform = `translate(${Math.round(rect.left + 26)}px, ${Math.round(rect.top - 30)}px)`;
  card.style.opacity = '1';
  visible = true;
}

function hide(): void {
  currentId = null;
  visible = false;
  if (card) card.style.opacity = '0';
}
