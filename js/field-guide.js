// The Field guide (Bitácora de naturaleza, Phase 13): a card for every kind
// of wild animal, filled in once the kid has spotted it in the world. Card
// pictures are guide/<type>.svg and guide/<type>-unknown.svg; until they
// exist, the animal's own drawing is shown (or a silhouette).
import { drawCritters } from './critter-draw.js';
import { CRITTER_FRAMES, CRITTERS } from './critters.js';
import { drawSpriteBox, paintCanvas } from './sprites.js';

export const GUIDE_ANIMALS = Object.keys(CRITTERS);

// A still animal in the middle of a card.
function drawPortrait(ctx, type, found) {
  if (drawSpriteBox(ctx, `guide/${type}${found ? '' : '-unknown'}.svg`, 0, 0, 120, 120)) return;
  const anim = Object.keys(CRITTER_FRAMES[type])[0];
  const flying = CRITTERS[type].kind === 'flyer' || type === 'bird-flock';
  const jumper = CRITTERS[type].kind === 'jumper';
  const critter = {
    type, kind: CRITTERS[type].kind, anim, facing: 1, variant: 0, progress: jumper ? 0.5 : null, z: 0, state: jumper ? 'jump' : 'look', flying,
    x: type === 'bird-flock' ? 90 : 60, y: flying ? 60 : 92, home: null,
  };
  ctx.save();
  if (type === 'elephant') {
    ctx.translate(60, 92);
    ctx.scale(0.55, 0.55);
    ctx.translate(-60, -92);
  } else if (!['bird-flock', 'sea-turtle'].includes(type)) {
    ctx.translate(60, 92);
    ctx.scale(1.8, 1.8);
    ctx.translate(-60, -92);
  }
  drawCritters(ctx, [critter], 0.3);
  ctx.restore();
  if (!found) {
    // A dark silhouette: keep the shape, cover the colors.
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = '#3d405b';
    ctx.fillRect(0, 0, 120, 120);
    ctx.globalCompositeOperation = 'source-over';
  }
}

export function openFieldGuide(panel, { spotted, t, onClose = () => {} }) {
  panel.replaceChildren();
  const head = document.createElement('div');
  head.className = 'shop-head';
  const title = document.createElement('h2');
  title.textContent = t('world.guideTitle');
  const count = document.createElement('span');
  count.className = 'coins';
  count.textContent = t('world.guideCount', { n: spotted.length, total: GUIDE_ANIMALS.length });
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'button';
  close.textContent = t('shop.close');
  head.append(title, count, close);
  const help = document.createElement('p');
  help.className = 'muted small';
  help.textContent = t('world.guideHelp');
  const grid = document.createElement('div');
  grid.className = 'stamp-grid guide-grid';
  for (const type of GUIDE_ANIMALS) {
    const found = spotted.includes(type);
    const card = document.createElement('div');
    card.className = `stamp-card${found ? ' earned' : ''}`;
    const picture = document.createElement('canvas');
    picture.width = 120;
    picture.height = 120;
    picture.className = 'guide-picture';
    paintCanvas(picture, (ctx) => drawPortrait(ctx, type, found));
    const name = document.createElement('p');
    name.className = 'shop-name';
    name.textContent = found ? t(`critters.${type}`) : '?';
    const fact = document.createElement('p');
    fact.className = 'muted small';
    fact.textContent = found ? t(`critterFacts.${type}`) : t('world.notFound');
    card.append(picture, name, fact);
    grid.append(card);
  }
  panel.append(head, help, grid);
  const closeGuide = () => {
    panel.hidden = true;
    removeEventListener('keydown', onKey);
    onClose();
  };
  const onKey = (event) => { if (event.key === 'Escape') closeGuide(); };
  close.addEventListener('click', closeGuide);
  addEventListener('keydown', onKey);
  panel.hidden = false;
  close.focus();
}
