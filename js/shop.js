// The shop panel: kids spend coins on colors, clothing for six slots, pets
// and furniture. Names and prices come from world/items.json.
import { drawAvatar } from './avatar.js';
import { drawFurniture } from './furniture.js';
import { drawPet } from './pet.js';
import { paintCanvas } from './sprites.js';
import { drawDecorSwatch, drawHousePreview } from './world-draw.js';
import {
  adoptPet, buyFurniture, buyHouse, buyItem, decorKey, feedPet, getActivePet, getCoins, getFurnitureOwned, getHouse, getLook, getPets,
  ownsHouse, ownsItem, petHappiness, setActivePet, setHouse, setLook, SLOTS,
} from './progress.js';

// The house tabs (houses, wallpapers, floors, furniture) work like a catalog (Phase 13).
const TABS = ['colors', ...SLOTS, 'pets', 'houses', 'wallpapers', 'floors', 'furniture'];
let lastTab = 'colors';

export function openShop(panel, { items, defaultLook, t, pick, onChange }) {
  let tab = lastTab;
  let naming = null; // The pet being named before adoption.

  function canvasWith(draw, size = 80) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.className = 'shop-preview';
    paintCanvas(canvas, draw);
    return canvas;
  }
  const avatarPreview = (look) => canvasWith((ctx) => drawAvatar(ctx, 40, 72, look, items, { scale: 1.25 }));

  function button(label, { primary = false, disabled = false, onClick } = {}) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `button small${primary ? ' primary' : ''}`;
    b.textContent = label;
    b.disabled = disabled;
    if (onClick) b.addEventListener('click', onClick);
    return b;
  }

  function card(preview, name, buttons, highlight = false) {
    const div = document.createElement('div');
    div.className = `shop-card${highlight ? ' worn' : ''}`;
    const p = document.createElement('p');
    p.className = 'shop-name';
    p.textContent = name;
    div.append(preview, p, ...buttons);
    return div;
  }

  // The buy / wear button for a color or clothing item.
  function wearButtons(item, look, isWorn) {
    if (isWorn) return [button(t('shop.wearing'), { disabled: true })];
    if (!item || ownsItem(item)) return [button(t('shop.wear'), { onClick: () => wear(look) })];
    const coins = getCoins();
    if (coins >= item.price) {
      return [button(t('shop.buy', { price: item.price }), { primary: true, onClick: () => { if (buyItem(item)) wear(look); } })];
    }
    return [button(t('shop.needMore', { n: item.price - coins }), { disabled: true })];
  }

  function wear(look) {
    setLook(look);
    changed();
  }

  function changed() {
    onChange();
    render();
  }

  function colorCards(current) {
    return items.colors.map((c) => {
      const look = { ...current, color: c.id };
      return card(avatarPreview(look), pick(c.name), wearButtons(c, look, current.color === c.id), current.color === c.id);
    });
  }

  function slotCards(current, slot) {
    const none = { ...current, [slot]: null };
    const cards = [card(avatarPreview(none), t('shop.remove'), wearButtons(null, none, !current[slot]), !current[slot])];
    for (const item of items.clothing.filter((c) => c.slot === slot)) {
      const look = { ...current, [slot]: item.id };
      const worn = current[slot] === item.id;
      cards.push(card(avatarPreview(look), pick(item.name), wearButtons(item, look, worn), worn));
    }
    return cards;
  }

  function petCards() {
    const owned = getPets();
    const active = getActivePet();
    return items.pets.map((pet) => {
      const preview = canvasWith((ctx) => drawPet(ctx, pet.id, 40, 70, { scale: 1.3 }));
      const mine = owned[pet.id];
      if (!mine) {
        const coins = getCoins();
        const adopt = coins >= pet.price
          ? button(t('shop.adopt', { price: pet.price }), { primary: true, onClick: () => { naming = pet; render(); } })
          : button(t('shop.needMore', { n: pet.price - coins }), { disabled: true });
        return card(preview, pick(pet.name), [adopt]);
      }
      const happiness = petHappiness(mine);
      const bar = document.createElement('div');
      bar.className = 'happiness';
      bar.title = `${t('shop.happiness')}: ${happiness}%`;
      bar.innerHTML = '<span></span>';
      bar.firstChild.style.width = `${happiness}%`;
      const label = document.createElement('p');
      label.className = 'muted small';
      label.textContent = `${t('shop.happiness')}: ${happiness}%`;
      const walking = active === pet.id;
      const buttons = [
        label, bar,
        walking
          ? button(t('shop.walking'), { onClick: () => { setActivePet(null); changed(); } })
          : button(t('shop.walk'), { onClick: () => { setActivePet(pet.id); changed(); } }),
        button(t('shop.feed', { price: items.petFoodPrice }), {
          disabled: getCoins() < items.petFoodPrice || happiness >= 100,
          onClick: () => { feedPet(pet.id, items.petFoodPrice); changed(); },
        }),
      ];
      return card(preview, `${mine.name} (${pick(pet.name)})`, buttons, walking);
    });
  }

  function nameChooser() {
    const wrap = document.createElement('div');
    const h3 = document.createElement('h3');
    h3.textContent = t('shop.chooseName', { pet: pick(naming.name) });
    const grid = document.createElement('div');
    grid.className = 'name-grid';
    for (const name of items.petNames) {
      grid.append(button(name, {
        primary: true,
        onClick: () => {
          adoptPet(naming, name);
          naming = null;
          changed();
        },
      }));
    }
    wrap.append(h3, grid, button(t('shop.cancel'), { onClick: () => { naming = null; render(); } }));
    return wrap;
  }

  // A buy button, or how many coins are missing.
  function buyButton(price, onBuy) {
    const coins = getCoins();
    return coins >= price
      ? button(t('shop.buy', { price }), { primary: true, onClick: onBuy })
      : button(t('shop.needMore', { n: price - coins }), { disabled: true });
  }

  function houseCards() {
    const house = getHouse();
    return items.houseStyles.map((style) => {
      const preview = document.createElement('canvas');
      preview.width = 160;
      preview.height = 100;
      preview.className = 'shop-preview wide';
      paintCanvas(preview, (ctx) => drawHousePreview(ctx, style.id, 160, 100));
      const here = house.style === style.id;
      let action;
      if (here) action = button(t('shop.livingHere'), { disabled: true });
      else if (ownsHouse(style)) action = button(t('shop.moveIn'), { onClick: () => { setHouse({ ...getHouse(), style: style.id }); changed(); } });
      else action = buyButton(style.price, () => { if (buyHouse(style)) setHouse({ ...getHouse(), style: style.id }); changed(); });
      return card(preview, pick(style.name), [action], here);
    });
  }

  // Wallpapers or floors: the house style's own first, then the ones to buy.
  function decorCards(kind) {
    const list = items[kind === 'wallpaper' ? 'wallpapers' : 'floors'];
    const house = getHouse();
    const current = house[kind];
    const swatch = (id) => canvasWith((ctx) => drawDecorSwatch(ctx, kind, id, house.style, 80));
    const use = (id) => { setHouse({ ...getHouse(), [kind]: id }); changed(); };
    const cards = [card(swatch(null), t('shop.styleDefault'), [current ? button(t('shop.use'), { onClick: () => use(null) }) : button(t('shop.inUse'), { disabled: true })], !current)];
    for (const item of list) {
      const key = { ...item, id: decorKey(kind, item.id) };
      let action;
      if (current === item.id) action = button(t('shop.inUse'), { disabled: true });
      else if (ownsItem(key)) action = button(t('shop.use'), { onClick: () => use(item.id) });
      else action = buyButton(item.price, () => { if (buyItem(key)) use(item.id); });
      cards.push(card(swatch(item.id), pick(item.name), [action], current === item.id));
    }
    return cards;
  }

  function furnitureCards() {
    const owned = getFurnitureOwned();
    return items.furniture.map((item) => {
      const preview = canvasWith((ctx) => {
        ctx.translate(40, 74);
        ctx.scale(0.45, 0.45);
        drawFurniture(ctx, item.id, 0, 0);
      });
      const coins = getCoins();
      const buy = coins >= item.price
        ? button(t('shop.buy', { price: item.price }), { primary: true, onClick: () => { buyFurniture(item); changed(); } })
        : button(t('shop.needMore', { n: item.price - coins }), { disabled: true });
      const count = document.createElement('p');
      count.className = 'muted small';
      count.textContent = owned[item.id] ? t('shop.owned', { n: owned[item.id] }) : '';
      return card(preview, pick(item.name), [count, buy], Boolean(owned[item.id]));
    });
  }

  function render() {
    const current = getLook(defaultLook);
    panel.replaceChildren();

    const head = document.createElement('div');
    head.className = 'shop-head';
    const title = document.createElement('h2');
    title.textContent = t('shop.title');
    const coins = document.createElement('span');
    coins.className = 'coins';
    coins.textContent = `${getCoins()} ${t('world.coins')}`;
    head.append(title, coins, button(t('shop.close'), { onClick: closeShop }));

    const tabs = document.createElement('div');
    tabs.className = 'shop-tabs';
    tabs.setAttribute('role', 'tablist');
    for (const id of TABS) {
      const b = button(t(`shop.tab.${id}`));
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(id === tab));
      b.addEventListener('click', () => {
        tab = id;
        lastTab = id;
        naming = null;
        render();
      });
      tabs.append(b);
    }
    panel.append(head, tabs);

    if (naming) {
      panel.append(nameChooser());
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'shop-grid';
    if (tab === 'colors') grid.append(...colorCards(current));
    else if (tab === 'pets') grid.append(...petCards());
    else if (tab === 'furniture') {
      // One heading per furniture set, then its pieces.
      const cards = furnitureCards();
      for (const set of [...new Set(items.furniture.map((f) => f.set ?? 'classic'))]) {
        const h3 = document.createElement('h3');
        h3.className = 'shop-set';
        h3.textContent = t(`shop.set.${set}`);
        grid.append(h3, ...cards.filter((_, i) => (items.furniture[i].set ?? 'classic') === set));
      }
    } else if (tab === 'houses') grid.append(...houseCards());
    else if (tab === 'wallpapers') grid.append(...decorCards('wallpaper'));
    else if (tab === 'floors') grid.append(...decorCards('floor'));
    else grid.append(...slotCards(current, tab));
    panel.append(grid);
  }

  function closeShop() {
    panel.hidden = true;
    document.removeEventListener('keydown', onKey);
    onChange();
  }

  function onKey(event) {
    if (event.key === 'Escape') closeShop();
  }

  render();
  panel.hidden = false;
  document.addEventListener('keydown', onKey);
  panel.querySelector('button')?.focus();
}
