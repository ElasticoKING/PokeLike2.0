// ===== MAP.JS =====
// Map goes BOTTOM (start) to TOP (gym boss), like the original Pokelike

const NODE_TYPES = ['battle','battle','battle','catch','catch','item','trainer','question','pokecenter'];

// Exact same sprites as pokelike.xyz!
const NODE_SPRITES = {
  battle:     'https://pokelike.xyz/sprites/teamRocket.png',
  catch:      'https://pokelike.xyz/sprites/catchPokemon.png',
  item:       'https://pokelike.xyz/sprites/itemIcon.png',
  trainer:    'https://pokelike.xyz/sprites/aceTrainer.png',
  question:   'https://pokelike.xyz/sprites/questionMark.png',
  pokecenter: 'https://pokelike.xyz/sprites/Poke Center.png',
  boss:       'https://pokelike.xyz/sprites/brock.png',
  trade:      'https://pokelike.xyz/sprites/tradeIcon.png',
};

const TRAINER_SPRITES_MAP = {
  Scientist:   'https://pokelike.xyz/sprites/aceTrainer.png',
  hiker:       'https://pokelike.xyz/sprites/aceTrainer.png',
  policeman:   'https://pokelike.xyz/sprites/policeman.png',
  fisher:      'https://pokelike.xyz/sprites/bugCatcher.png',
  aceTrainer:  'https://pokelike.xyz/sprites/aceTrainer.png',
  oldGuy:      'https://pokelike.xyz/sprites/aceTrainer.png',
  fireSpitter: 'https://pokelike.xyz/sprites/teamRocket.png',
};

// Background from original
const MAP_BG = 'https://pokelike.xyz/ui/background.jpg';

function generateMap(mapIndex) {
  const nodes = {}, edges = [], layers = [];

  const start = { id:'n0_0', type:'start', layer:0, col:0, visited:true, accessible:false, revealed:true };
  nodes['n0_0'] = start;
  layers.push([start]);

  for(let l=1; l<=7; l++) {
    const cols = l <= 2 ? 2 : l <= 5 ? 3 : 2;
    const layerNodes = [];
    for(let c=0; c<cols; c++) {
      let type;
      if(l===6 && c===0) type = 'pokecenter';
      else {
        const pool = NODE_TYPES.filter(t => t!=='pokecenter');
        type = pool[Math.floor(Math.random()*pool.length)];
      }
      const id = `n${l}_${c}`;
      const node = { id, type, layer:l, col:c, visited:false, accessible:false, revealed:true };
      if(type==='trainer') node.trainerSprite = randomTrainerSprite();
      nodes[id] = node;
      layerNodes.push(node);
    }
    layers.push(layerNodes);
  }

  const boss = { id:'n8_0', type:'boss', layer:8, col:0, mapIndex, visited:false, accessible:false, revealed:true };
  nodes['n8_0'] = boss;
  layers.push([boss]);

  for(let l=0; l<layers.length-1; l++) {
    const from = layers[l], to = layers[l+1];
    from.forEach((fn, fi) => {
      const targets = [];
      to.forEach((tn, ti) => {
        const dist = Math.abs(fi/(from.length-1||1) - ti/(to.length-1||1));
        if(dist <= 0.6) targets.push(tn);
      });
      if(targets.length === 0) targets.push(to[0]);
      targets.forEach(tn => {
        if(!edges.find(e=>e.from===fn.id&&e.to===tn.id))
          edges.push({from:fn.id, to:tn.id});
      });
    });
    to.forEach(tn => {
      if(!edges.find(e=>e.to===tn.id)) {
        const src = from[Math.floor(Math.random()*from.length)];
        edges.push({from:src.id, to:tn.id});
      }
    });
  }

  layers[1].forEach(n => { n.accessible = true; });
  return { nodes, edges, layers, mapIndex };
}

function randomTrainerSprite() {
  const opts = ['Scientist','hiker','policeman','fisher','aceTrainer','oldGuy','fireSpitter'];
  return opts[Math.floor(Math.random()*opts.length)];
}

function advanceMap(map, visitedId) {
  const node = map.nodes[visitedId];
  if(!node) return;
  node.visited = true;
  node.accessible = false;
  map.edges.forEach(e => {
    if(e.from === visitedId) {
      const target = map.nodes[e.to];
      if(target && !target.visited) target.accessible = true;
    }
  });
}

// ---- RENDERER ----
function renderMap(map, onNodeClick) {
  const container = document.getElementById('map-container');
  container.innerHTML = '';

  const layers = map.layers;
  const maxCols = Math.max(...layers.map(l=>l.length));
  const NODE_W = 80, NODE_H = 90, PAD_X = 40, PAD_Y = 20;
  const svgW = maxCols * NODE_W + PAD_X*2;
  const svgH = layers.length * NODE_H + PAD_Y*2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox',`0 0 ${svgW} ${svgH}`);
  svg.setAttribute('width','100%');
  svg.setAttribute('height', svgH);
  svg.style.maxWidth = svgW + 'px';
  svg.classList.add('map-svg');

  // Background image from original pokelike
  const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
  const pattern = document.createElementNS('http://www.w3.org/2000/svg','pattern');
  pattern.setAttribute('id','bgPattern');
  pattern.setAttribute('patternUnits','userSpaceOnUse');
  pattern.setAttribute('width', svgW);
  pattern.setAttribute('height', svgH);
  const bgImg = document.createElementNS('http://www.w3.org/2000/svg','image');
  bgImg.setAttribute('href', MAP_BG);
  bgImg.setAttribute('width', svgW);
  bgImg.setAttribute('height', svgH);
  bgImg.setAttribute('preserveAspectRatio','xMidYMid slice');
  pattern.appendChild(bgImg);
  defs.appendChild(pattern);
  svg.appendChild(defs);

  const bgRect = document.createElementNS('http://www.w3.org/2000/svg','rect');
  bgRect.setAttribute('width', svgW);
  bgRect.setAttribute('height', svgH);
  bgRect.setAttribute('fill','url(#bgPattern)');
  svg.appendChild(bgRect);

  // Node centers: layer 0 = BOTTOM, top layer = TOP
  const centers = {};
  layers.forEach((layer, li) => {
    const y = PAD_Y + (layers.length - 1 - li) * NODE_H + NODE_H/2;
    layer.forEach((node, ci) => {
      const x = PAD_X + (maxCols - layer.length)*NODE_W/2 + ci*NODE_W + NODE_W/2;
      centers[node.id] = {x, y};
    });
  });

  // Dashed path edges
  map.edges.forEach(e => {
    const a = centers[e.from], b = centers[e.to];
    if(!a||!b) return;
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',a.x); line.setAttribute('y1',a.y);
    line.setAttribute('x2',b.x); line.setAttribute('y2',b.y);
    line.setAttribute('stroke','rgba(0,0,0,0.45)');
    line.setAttribute('stroke-width','2.5');
    line.setAttribute('stroke-dasharray','7,5');
    svg.appendChild(line);
  });

  // Draw nodes
  layers.forEach(layer => {
    layer.forEach(node => {
      const {x,y} = centers[node.id];
      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('transform',`translate(${x},${y})`);
      g.classList.add('map-node');
      if(node.visited) g.classList.add('visited');
      if(!node.accessible) g.classList.add('inaccessible');

      drawNode(g, node);

      if(node.accessible) {
        g.style.cursor = 'pointer';
        g.addEventListener('click', () => onNodeClick(node));
      }
      svg.appendChild(g);
    });
  });

  container.appendChild(svg);
}

function drawNode(g, node) {
  // Gold glow for accessible nodes
  if(node.accessible && !node.visited) {
    const glow = document.createElementNS('http://www.w3.org/2000/svg','circle');
    glow.setAttribute('r','26');
    glow.setAttribute('fill','rgba(255,215,0,0.25)');
    glow.setAttribute('stroke','#ffd700');
    glow.setAttribute('stroke-width','2.5');
    g.appendChild(glow);
  }

  if(node.type === 'start') {
    // Simple start marker
    const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('r','18');
    circle.setAttribute('fill','rgba(0,0,0,0.5)');
    circle.setAttribute('stroke','rgba(255,255,255,0.4)');
    circle.setAttribute('stroke-width','2');
    g.appendChild(circle);
    const t = document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('text-anchor','middle');
    t.setAttribute('dominant-baseline','central');
    t.setAttribute('font-size','14');
    t.setAttribute('fill','white');
    t.textContent = '▶';
    g.appendChild(t);
    addNodeLabel(g, 'START');
    return;
  }

  // Get sprite URL
  const spriteUrl = node.type === 'trainer'
    ? (TRAINER_SPRITES_MAP[node.trainerSprite] || NODE_SPRITES.trainer)
    : NODE_SPRITES[node.type];

  // Sprite image — no circle background, raw on the map like original
  if(spriteUrl) {
    const img = document.createElementNS('http://www.w3.org/2000/svg','image');
    img.setAttribute('href', spriteUrl);
    img.setAttribute('x','-22'); img.setAttribute('y','-24');
    img.setAttribute('width','44'); img.setAttribute('height','44');
    img.setAttribute('preserveAspectRatio','xMidYMid meet');
    img.setAttribute('image-rendering','pixelated');
    if(node.visited) img.setAttribute('opacity','0.35');
    g.appendChild(img);
  }

  // Visited checkmark
  if(node.visited) {
    const check = document.createElementNS('http://www.w3.org/2000/svg','text');
    check.setAttribute('text-anchor','middle');
    check.setAttribute('dominant-baseline','central');
    check.setAttribute('font-size','16');
    check.setAttribute('fill','rgba(255,255,255,0.7)');
    check.setAttribute('y','-2');
    check.textContent = '✓';
    g.appendChild(check);
  }

  addNodeLabel(g, nodeLabel(node.type));
}

function addNodeLabel(g, text) {
  // White text with black shadow, like original
  const shadow = document.createElementNS('http://www.w3.org/2000/svg','text');
  shadow.setAttribute('text-anchor','middle');
  shadow.setAttribute('y','26');
  shadow.setAttribute('font-size','5.5');
  shadow.setAttribute('fill','black');
  shadow.setAttribute('font-family',"'Press Start 2P', monospace");
  shadow.setAttribute('dx','0.5');
  shadow.setAttribute('dy','0.5');
  shadow.textContent = text;
  g.appendChild(shadow);

  const label = document.createElementNS('http://www.w3.org/2000/svg','text');
  label.setAttribute('text-anchor','middle');
  label.setAttribute('y','26');
  label.setAttribute('font-size','5.5');
  label.setAttribute('fill','white');
  label.setAttribute('font-family',"'Press Start 2P', monospace");
  label.textContent = text;
  g.appendChild(label);
}

function nodeLabel(type) {
  const m = {
    start:'START', battle:'BATTLE', catch:'CATCH', item:'ITEM',
    trainer:'TRAINER', question:'???', pokecenter:'CENTER', boss:'GYM'
  };
  return m[type] || '???';
}
