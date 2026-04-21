// map.js - Node map generation and rendering

const NODE_TYPES = {
  START: 'start',
  BATTLE: 'battle',
  CATCH: 'catch',
  ITEM: 'item',
  QUESTION: 'question',
  BOSS: 'boss',
  POKECENTER: 'pokecenter',
  TRAINER: 'trainer',
  LEGENDARY: 'legendary',
  MOVE_TUTOR: 'move_tutor',
  TRADE: 'trade',
};

const NODE_WEIGHTS = [
  { battle: 25, catch: 30, item: 15, trainer: 30, question: 0,  pokecenter: 0, move_tutor: 0, trade: 0, legendary: 0 },
  { battle: 20, catch: 20, item: 15, trainer: 30, question: 10, pokecenter: 0, move_tutor: 0, trade: 5, legendary: 0 },
  { battle: 16, catch: 14, item: 12, trainer: 27, question: 13, pokecenter: 0, move_tutor: 9, trade: 9, legendary: 0 },
  { battle: 13, catch: 12, item: 10, trainer: 27, question: 13, pokecenter: 0, move_tutor: 8, trade: 8, legendary: 0 },
  { battle: 13, catch: 10, item:  8, trainer: 27, question: 18, pokecenter: 0, move_tutor: 8, trade: 7, legendary: 0 },
  { battle: 20, catch:  9, item: 14, trainer: 18, question:  9, pokecenter: 0, move_tutor: 0, trade: 0, legendary: 0 },
];

// Simple seeded RNG (replaces the original rng() function)
let _rngSeed = Date.now();
function rng() {
  _rngSeed = (_rngSeed * 1664525 + 1013904223) & 0xffffffff;
  return ((_rngSeed >>> 0) / 0xffffffff);
}

function weightedRandom(weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (const [k, v] of Object.entries(weights)) {
    r -= v;
    if (r <= 0) return k;
  }
  return Object.keys(weights)[0];
}

const TRAINER_SPRITE_KEYS = [
  'aceTrainer', 'bugCatcher', 'fireSpitter', 'fisher',
  'hiker', 'oldGuy', 'policeman', 'Scientist', 'teamRocket',
];

const TRAINER_SPRITE_NAMES = {
  aceTrainer:  'Ace Trainer',
  bugCatcher:  'Bug Catcher',
  fireSpitter: 'Fire Breather',
  fisher:      'Fisher',
  hiker:       'Hiker',
  oldGuy:      'Old Man',
  policeman:   'Policeman',
  Scientist:   'Scientist',
  teamRocket:  'Team Rocket Grunt',
};

const GYM_LEADER_SPRITES = [
  'https://pokelike.xyz/sprites/brock.png',
  'https://pokelike.xyz/sprites/misty.png',
  'https://pokelike.xyz/sprites/lt. surge.png',
  'https://pokelike.xyz/sprites/erika.png',
  'https://pokelike.xyz/sprites/koga.png',
  'https://pokelike.xyz/sprites/sabrina.png',
  'https://pokelike.xyz/sprites/blaine.png',
  'https://pokelike.xyz/sprites/giovanni.png',
];

function getNodeSprite(node) {
  const BASE = 'https://pokelike.xyz/sprites/';
  const ICON_SPRITES = {
    [NODE_TYPES.BATTLE]:    BASE + 'grass.png',
    [NODE_TYPES.CATCH]:     BASE + 'catchPokemon.png',
    [NODE_TYPES.ITEM]:      BASE + 'itemIcon.png',
    [NODE_TYPES.TRADE]:     BASE + 'tradeIcon.png',
    [NODE_TYPES.LEGENDARY]: BASE + 'legendaryEncounter.png',
    [NODE_TYPES.QUESTION]:  BASE + 'questionMark.png',
    [NODE_TYPES.POKECENTER]:BASE + 'Poke Center.png',
    [NODE_TYPES.MOVE_TUTOR]:BASE + 'moveTutor.png',
  };
  if (ICON_SPRITES[node.type]) return ICON_SPRITES[node.type];
  if (node.type === NODE_TYPES.TRAINER) {
    const key = node.trainerSprite || TRAINER_SPRITE_KEYS[0];
    return `${BASE}${key}.png`;
  }
  if (node.type === NODE_TYPES.BOSS) {
    const mi = node.mapIndex ?? -1;
    if (mi >= 0 && mi < GYM_LEADER_SPRITES.length) return GYM_LEADER_SPRITES[mi];
    return BASE + 'brock.png';
  }
  return null;
}

function generateMap(mapIndex, nuzlockeMode = false) {
  const CONTENT_SIZES = [3, 4, 3, 4, 3, 2];
  const bossLayerIdx  = 2 + CONTENT_SIZES.length;
  const bossId        = `n${bossLayerIdx}_0`;

  const assignTrainerSprite = (node, nodeId) => {
    const availableKeys = TRAINER_SPRITE_KEYS.filter(k => {
      if (k === 'aceTrainer' && mapIndex >= 6) return false;
      if (k === 'policeman'  && mapIndex >= 4) return false;
      return true;
    });
    let h = 0;
    for (const ch of nodeId) h = (h * 31 + ch.charCodeAt(0)) | 0;
    node.trainerSprite = availableKeys[Math.abs(h) % availableKeys.length];
  };

  const makeNode = (id, type, layer, col, extra = {}) => {
    const node = { id, type, layer, col, ...extra };
    if (type === NODE_TYPES.TRAINER) assignTrainerSprite(node, id);
    return node;
  };

  const pickType = (ci) => {
    const w = { ...NODE_WEIGHTS[Math.min(ci, NODE_WEIGHTS.length - 1)] };
    if (mapIndex >= 5 && ci >= 2) w.legendary = 6;
    if (nuzlockeMode) { w.catch = 0; w.trade = 0; }
    return weightedRandom(w);
  };

  const makeLayerEdges = (fromLayer, toLayer) => {
    const N = fromLayer.length, M = toLayer.length;
    if (N === 1) return toLayer.map(t => ({ from: fromLayer[0].id, to: t.id }));
    const edges = [];
    for (let i = 0; i < N; i++) {
      let left, right;
      if (M === 1) {
        left = right = 0;
      } else if (M < N && i === 0) {
        left = right = 0;
      } else if (M < N && i === N - 1) {
        left = right = M - 1;
      } else {
        const pos = i * (M - 1) / (N - 1);
        left  = Math.floor(pos);
        right = left + 1;
        if (right >= M) { right = M - 1; left = M - 2; }
      }
      edges.push({ from: fromLayer[i].id, to: toLayer[left].id });
      if (left !== right) edges.push({ from: fromLayer[i].id, to: toLayer[right].id });
    }
    return edges;
  };

  const layers = [];
  layers.push([makeNode('n0_0', NODE_TYPES.START, 0, 0)]);
  layers.push([
    makeNode('n1_0', NODE_TYPES.CATCH,  1, 0),
    makeNode('n1_1', nuzlockeMode ? NODE_TYPES.CATCH : NODE_TYPES.BATTLE, 1, 1),
  ]);

  for (let ci = 0; ci < CONTENT_SIZES.length; ci++) {
    const l = ci + 2, size = CONTENT_SIZES[ci];
    const layer = Array.from({ length: size }, (_, c) => makeNode(`n${l}_${c}`, pickType(ci), l, c));
    if (ci === CONTENT_SIZES.length - 1 && !layer.some(n => n.type === NODE_TYPES.POKECENTER)) {
      layer[Math.floor(rng() * size)].type = NODE_TYPES.POKECENTER;
    }
    layers.push(layer);
  }

  layers.push([makeNode(bossId, NODE_TYPES.BOSS, bossLayerIdx, 0, { mapIndex })]);

  const edges = [];
  for (let l = 0; l < layers.length - 1; l++) {
    edges.push(...makeLayerEdges(layers[l], layers[l + 1]));
  }

  const nodes = {};
  for (const layer of layers) {
    for (const n of layer) {
      n.visited = false; n.accessible = false; n.revealed = true;
      nodes[n.id] = n;
    }
  }
  nodes['n0_0'].visited = true;
  edges.filter(e => e.from === 'n0_0').forEach(e => { nodes[e.to].accessible = true; });

  return { nodes, edges, layers, mapIndex };
}

function advanceMap(map, nodeId) {
  const node = map.nodes[nodeId];
  if (!node) return;
  node.visited = true;
  node.accessible = false;

  // Lock siblings in same layer
  for (const n of Object.values(map.nodes)) {
    if (n.layer === node.layer && n.id !== nodeId && n.accessible) {
      n.accessible = false;
    }
  }

  // Unlock next layer
  for (const edge of map.edges) {
    if (edge.from === nodeId) {
      const target = map.nodes[edge.to];
      if (target) { target.revealed = true; target.accessible = true; }
    }
  }
}

// Keep advanceFromNode as alias
const advanceFromNode = advanceMap;

// ---- RENDERER ----
let _hoverEnabled = true;
const _mapTooltip = (() => {
  let el = null;
  return {
    show(label, x, y) {
      if (!el) el = document.getElementById('map-node-tooltip');
      if (!el) return;
      el.innerHTML = label;
      el.style.left = x + 'px';
      el.style.top  = y + 'px';
      el.classList.add('visible');
    },
    move(x, y) {
      if (!el) return;
      el.style.left = x + 'px'; el.style.top = y + 'px';
    },
    hide() {
      if (!el) el = document.getElementById('map-node-tooltip');
      if (el) el.classList.remove('visible');
    },
  };
})();

function renderMap(map, onNodeClick) {
  const container = document.getElementById('map-container');
  container.innerHTML = '';

  // Use original's background image
  container.style.backgroundImage = "url('https://pokelike.xyz/ui/map1.png')";

  const W = container.clientWidth  || 360;
  const H = container.clientHeight || 600;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('id', 'map-svg');
  svg.setAttribute('width', W);
  svg.setAttribute('height', H);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.width = '100%';
  svg.style.height = '100%';

  const layerCount = map.layers.length;
  const padY = 28;

  // Positions: layer 0 = TOP, last layer = BOTTOM (original layout)
  const positions = {};
  for (let l = 0; l < map.layers.length; l++) {
    const layer = map.layers[l];
    const y = layerCount > 1 ? padY + (l / (layerCount - 1)) * (H - 2 * padY) : H / 2;
    const nodeGap = W / (layer.length + 0.2);
    for (let c = 0; c < layer.length; c++) {
      const x = layer.length === 1 ? W / 2 : W / 2 + (c - (layer.length - 1) / 2) * nodeGap;
      positions[layer[c].id] = { x, y };
    }
  }

  // Draw edges
  for (const edge of map.edges) {
    const from = positions[edge.from], to = positions[edge.to];
    if (!from || !to) continue;
    const fromNode = map.nodes[edge.from], toNode = map.nodes[edge.to];
    const travelled = fromNode.visited && toNode.visited;
    const onPath = (fromNode.visited || fromNode.accessible) && (toNode.visited || toNode.accessible);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x); line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x);   line.setAttribute('y2', to.y);
    line.setAttribute('stroke', travelled ? '#333' : onPath ? '#999' : '#222');
    line.setAttribute('stroke-width', onPath ? '2.5' : '1.5');
    if (!onPath) line.setAttribute('stroke-dasharray', '4,5');
    svg.appendChild(line);
  }

  // Draw nodes
  for (const [id, node] of Object.entries(map.nodes)) {
    const pos = positions[id];
    if (!pos) continue;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${pos.x},${pos.y})`);

    const isClickable    = node.accessible && !node.visited;
    const isInaccessible = !node.accessible && !node.visited;
    const isBossNode     = node.type === NODE_TYPES.BOSS;

    g.style.cursor = isClickable ? 'pointer' : 'default';
    if (isInaccessible) g.style.opacity = '0.75';
    if (node.visited)   g.style.filter  = 'grayscale(0.5) brightness(0.62)';
    if (isClickable)    g.style.filter  = 'drop-shadow(0 0 6px #fff) drop-shadow(0 0 3px #ffe066)';

    const sprite = getNodeSprite(node);

    if (sprite) {
      const isHuman = node.type === NODE_TYPES.TRAINER || node.type === NODE_TYPES.BOSS;
      const iw = isHuman ? (isBossNode ? 52 : 38) : (isBossNode ? 52 : 40);
      const ih = isHuman ? (isBossNode ? 52 : 52) : (isBossNode ? 52 : 40);

      const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      img.setAttribute('href', sprite.replace(/ /g, '%20'));
      img.setAttribute('x', -(iw/2)); img.setAttribute('y', -(ih/2));
      img.setAttribute('width', iw);  img.setAttribute('height', ih);
      img.setAttribute('image-rendering', 'pixelated');
      img.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      g.appendChild(img);

      // Pulsing shadow for accessible nodes
      if (isClickable) {
        const px = 4;
        const shadowY = ih/2 - 2;
        const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        shadow.setAttribute('fill', '#fff');
        const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        anim.setAttribute('attributeName', 'opacity');
        anim.setAttribute('values', '0.55;0.1;0.55');
        anim.setAttribute('dur', '1.5s');
        anim.setAttribute('repeatCount', 'indefinite');
        shadow.appendChild(anim);
        [iw * 0.35, iw * 0.55, iw * 0.35].forEach((w, i) => {
          w = Math.round(w / px) * px;
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', -(w/2));
          rect.setAttribute('y', shadowY + (i-1)*px - px/2);
          rect.setAttribute('width', w); rect.setAttribute('height', px);
          shadow.appendChild(rect);
        });
        g.insertBefore(shadow, img);
      }
    } else {
      const r = isBossNode ? 22 : 18;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', r);
      circle.setAttribute('fill', isInaccessible ? '#2a2a3a' : getNodeColor(node));
      circle.setAttribute('stroke', isClickable ? '#fff' : (isInaccessible ? '#444' : '#555'));
      circle.setAttribute('stroke-width', isClickable ? '3' : '1');
      if (isClickable) {
        const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        anim.setAttribute('attributeName', 'stroke-opacity');
        anim.setAttribute('values', '1;0.3;1');
        anim.setAttribute('dur', '1.5s');
        anim.setAttribute('repeatCount', 'indefinite');
        circle.appendChild(anim);
      }
      g.appendChild(circle);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('font-size', '14');
      text.setAttribute('fill', isInaccessible ? '#aaa' : '#fff');
      text.textContent = getNodeIcon(node);
      g.appendChild(text);
    }

    // Tooltip
    const label = getNodeLabel(node);
    g.addEventListener('mouseenter', e => _mapTooltip.show(label, e.clientX, e.clientY));
    g.addEventListener('mousemove',  e => _mapTooltip.move(e.clientX, e.clientY));
    g.addEventListener('mouseleave', () => _mapTooltip.hide());
    g.addEventListener('contextmenu', e => e.preventDefault());

    if (isClickable) g.addEventListener('click', () => onNodeClick(node));
    svg.appendChild(g);
  }

  container.appendChild(svg);
}

function getNodeColor(node) {
  const colors = {
    [NODE_TYPES.START]:      '#4a4a6a',
    [NODE_TYPES.BATTLE]:     '#6a2a2a',
    [NODE_TYPES.CATCH]:      '#2a6a2a',
    [NODE_TYPES.ITEM]:       '#2a4a6a',
    [NODE_TYPES.QUESTION]:   '#6a4a2a',
    [NODE_TYPES.BOSS]:       '#8a2a8a',
    [NODE_TYPES.POKECENTER]: '#006666',
    [NODE_TYPES.TRAINER]:    '#6a3a1a',
    [NODE_TYPES.LEGENDARY]:  '#7a6a00',
    [NODE_TYPES.MOVE_TUTOR]: '#3a4a6a',
    [NODE_TYPES.TRADE]:      '#1a5a5a',
  };
  return colors[node.type] || '#444';
}

function getNodeIcon(node) {
  const icons = {
    [NODE_TYPES.START]:      '★',
    [NODE_TYPES.BATTLE]:     '⚔',
    [NODE_TYPES.CATCH]:      '⬟',
    [NODE_TYPES.ITEM]:       '✦',
    [NODE_TYPES.QUESTION]:   '?',
    [NODE_TYPES.BOSS]:       '♛',
    [NODE_TYPES.POKECENTER]: '+',
    [NODE_TYPES.TRAINER]:    '⚑',
    [NODE_TYPES.LEGENDARY]:  '⚝',
    [NODE_TYPES.MOVE_TUTOR]: '♪',
    [NODE_TYPES.TRADE]:      '⇄',
  };
  return icons[node.type] || '●';
}

function getNodeLabel(node) {
  if (node.visited) return 'Visited';
  const labels = {
    [NODE_TYPES.START]:      'Start',
    [NODE_TYPES.BATTLE]:     'Wild Battle',
    [NODE_TYPES.CATCH]:      'Catch Pokemon',
    [NODE_TYPES.ITEM]:       'Item Found',
    [NODE_TYPES.QUESTION]:   'Random Event',
    [NODE_TYPES.POKECENTER]: 'Pokemon Center — Full Heal',
    [NODE_TYPES.TRAINER]:    `Trainer: ${node.trainerSprite ? (TRAINER_SPRITE_NAMES[node.trainerSprite] || node.trainerSprite) : 'Trainer'}`,
    [NODE_TYPES.LEGENDARY]:  'Legendary Pokemon!',
    [NODE_TYPES.MOVE_TUTOR]: 'Move Tutor',
    [NODE_TYPES.TRADE]:      'Trade Pokemon',
    [NODE_TYPES.BOSS]:       'Gym Leader!',
  };
  return labels[node.type] || node.type;
}
