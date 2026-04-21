// ===== MAP.JS =====
// Map goes BOTTOM (start) to TOP (gym boss), like the original Pokelike

const NODE_TYPES = ['battle','battle','battle','catch','catch','item','trainer','question','pokecenter'];

const NODE_SPRITES = {
  battle:     'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
  catch:      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
  item:       'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png',
  pokecenter: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png',
  boss:       'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
};

const TRAINER_SPRITE_URLS = {
  Scientist:   'https://play.pokemonshowdown.com/sprites/trainers/scientist.png',
  hiker:       'https://play.pokemonshowdown.com/sprites/trainers/hiker.png',
  policeman:   'https://play.pokemonshowdown.com/sprites/trainers/policeman.png',
  fisher:      'https://play.pokemonshowdown.com/sprites/trainers/fisherman.png',
  aceTrainer:  'https://play.pokemonshowdown.com/sprites/trainers/acetrainerm.png',
  oldGuy:      'https://play.pokemonshowdown.com/sprites/trainers/gentleman.png',
  fireSpitter: 'https://play.pokemonshowdown.com/sprites/trainers/firebreather.png',
};

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
// Layer 0 (start) = BOTTOM, last layer (boss) = TOP
function renderMap(map, onNodeClick) {
  const container = document.getElementById('map-container');
  container.innerHTML = '';

  const layers = map.layers;
  const maxCols = Math.max(...layers.map(l=>l.length));
  const NODE_W = 80, NODE_H = 88, PAD_X = 36, PAD_Y = 24;
  const svgW = maxCols * NODE_W + PAD_X*2;
  const svgH = layers.length * NODE_H + PAD_Y*2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox',`0 0 ${svgW} ${svgH}`);
  svg.setAttribute('width','100%');
  svg.setAttribute('height', svgH);
  svg.style.maxWidth = svgW + 'px';
  svg.classList.add('map-svg');

  // Pixel-art grass background tiles
  drawGrassBackground(svg, svgW, svgH);

  // Node centers: layer 0 at bottom, highest layer at top
  const centers = {};
  layers.forEach((layer, li) => {
    const y = PAD_Y + (layers.length - 1 - li) * NODE_H + NODE_H/2;
    layer.forEach((node, ci) => {
      const x = PAD_X + (maxCols - layer.length)*NODE_W/2 + ci*NODE_W + NODE_W/2;
      centers[node.id] = {x, y};
    });
  });

  // Draw dashed path edges
  map.edges.forEach(e => {
    const a = centers[e.from], b = centers[e.to];
    if(!a||!b) return;
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',a.x); line.setAttribute('y1',a.y);
    line.setAttribute('x2',b.x); line.setAttribute('y2',b.y);
    line.setAttribute('stroke','rgba(0,0,0,0.4)');
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

function drawGrassBackground(svg, w, h) {
  // Base grass gradient
  const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
  const grad = document.createElementNS('http://www.w3.org/2000/svg','linearGradient');
  grad.setAttribute('id','grassGrad');
  grad.setAttribute('x1','0'); grad.setAttribute('y1','0');
  grad.setAttribute('x2','0'); grad.setAttribute('y2','1');
  const s1 = document.createElementNS('http://www.w3.org/2000/svg','stop');
  s1.setAttribute('offset','0%'); s1.setAttribute('stop-color','#5ba85b');
  const s2 = document.createElementNS('http://www.w3.org/2000/svg','stop');
  s2.setAttribute('offset','100%'); s2.setAttribute('stop-color','#3d7a3d');
  grad.appendChild(s1); grad.appendChild(s2);
  defs.appendChild(grad);
  svg.appendChild(defs);

  const bg = document.createElementNS('http://www.w3.org/2000/svg','rect');
  bg.setAttribute('width', w); bg.setAttribute('height', h);
  bg.setAttribute('fill','url(#grassGrad)');
  svg.appendChild(bg);

  // Pixel-art grass tiles (small lighter squares scattered)
  const tileSize = 16;
  for(let px=0; px<w; px+=tileSize) {
    for(let py=0; py<h; py+=tileSize) {
      if(Math.random() < 0.18) {
        const t = document.createElementNS('http://www.w3.org/2000/svg','rect');
        t.setAttribute('x', px+2); t.setAttribute('y', py+2);
        t.setAttribute('width', tileSize-2); t.setAttribute('height', tileSize-2);
        t.setAttribute('fill', Math.random()<0.5 ? '#6abf6a' : '#4d8f4d');
        t.setAttribute('opacity','0.5');
        svg.appendChild(t);
      }
    }
  }

  // Sandy path running vertically in center
  const pathX = w/2 - 18;
  const path = document.createElementNS('http://www.w3.org/2000/svg','rect');
  path.setAttribute('x', pathX); path.setAttribute('y', 0);
  path.setAttribute('width', 36); path.setAttribute('height', h);
  path.setAttribute('fill','#d4b866');
  path.setAttribute('opacity','0.35');
  svg.appendChild(path);

  // Trees on sides
  const treePositions = [
    {x:8,y:10},{x:8,y:80},{x:8,y:160},{x:8,y:240},{x:8,y:320},
    {x:w-28,y:10},{x:w-28,y:80},{x:w-28,y:160},{x:w-28,y:240},{x:w-28,y:320},
  ];
  treePositions.forEach(p => {
    if(p.y < h - 20) drawTree(svg, p.x, p.y);
  });
}

function drawTree(svg, x, y) {
  // Trunk
  const trunk = document.createElementNS('http://www.w3.org/2000/svg','rect');
  trunk.setAttribute('x', x+7); trunk.setAttribute('y', y+14);
  trunk.setAttribute('width', 6); trunk.setAttribute('height', 8);
  trunk.setAttribute('fill','#8b6914');
  svg.appendChild(trunk);
  // Canopy
  const canopy = document.createElementNS('http://www.w3.org/2000/svg','rect');
  canopy.setAttribute('x', x); canopy.setAttribute('y', y);
  canopy.setAttribute('width', 20); canopy.setAttribute('height', 16);
  canopy.setAttribute('rx', 3);
  canopy.setAttribute('fill','#2d7a2d');
  svg.appendChild(canopy);
  // Highlight
  const hi = document.createElementNS('http://www.w3.org/2000/svg','rect');
  hi.setAttribute('x', x+3); hi.setAttribute('y', y+2);
  hi.setAttribute('width', 8); hi.setAttribute('height', 5);
  hi.setAttribute('rx', 2);
  hi.setAttribute('fill','#3d9a3d');
  svg.appendChild(hi);
}

function drawNode(g, node) {
  const info = nodeInfo(node);

  // Accessible glow ring
  if(node.accessible && !node.visited) {
    const glow = document.createElementNS('http://www.w3.org/2000/svg','circle');
    glow.setAttribute('r','24');
    glow.setAttribute('fill','none');
    glow.setAttribute('stroke','#ffd700');
    glow.setAttribute('stroke-width','3');
    glow.setAttribute('opacity','0.8');
    g.appendChild(glow);
  }

  const spriteUrl = node.type === 'trainer'
    ? (TRAINER_SPRITE_URLS[node.trainerSprite] || null)
    : NODE_SPRITES[node.type] || null;

  if(spriteUrl && node.type !== 'start') {
    // No background circle for sprites — raw sprite on grass (like original)
    if(node.type === 'trainer') {
      // Trainer sprites are taller, render larger
      const img = document.createElementNS('http://www.w3.org/2000/svg','image');
      img.setAttribute('href', spriteUrl);
      img.setAttribute('x','-18'); img.setAttribute('y','-20');
      img.setAttribute('width','36'); img.setAttribute('height','40');
      img.setAttribute('preserveAspectRatio','xMidYMid meet');
      img.setAttribute('image-rendering','pixelated');
      if(node.visited) img.setAttribute('opacity','0.35');
      g.appendChild(img);
    } else {
      // Item sprites (pokeball, etc) — render on a small white circle base
      const base = document.createElementNS('http://www.w3.org/2000/svg','circle');
      base.setAttribute('r','17');
      base.setAttribute('fill', node.visited ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.15)');
      base.setAttribute('stroke', node.accessible ? '#ffd700' : 'rgba(255,255,255,0.2)');
      base.setAttribute('stroke-width','1.5');
      g.appendChild(base);

      const img = document.createElementNS('http://www.w3.org/2000/svg','image');
      img.setAttribute('href', spriteUrl);
      img.setAttribute('x','-15'); img.setAttribute('y','-15');
      img.setAttribute('width','30'); img.setAttribute('height','30');
      img.setAttribute('preserveAspectRatio','xMidYMid meet');
      img.setAttribute('image-rendering','pixelated');
      if(node.visited) img.setAttribute('opacity','0.3');
      g.appendChild(img);
    }
  } else {
    // Fallback: colored circle + emoji
    const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('r','17');
    circle.setAttribute('fill', node.visited ? 'rgba(0,0,0,0.5)' : info.bgColor);
    circle.setAttribute('stroke', node.accessible ? '#ffd700' : 'rgba(255,255,255,0.2)');
    circle.setAttribute('stroke-width', node.accessible ? '2.5' : '1.5');
    g.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg','text');
    text.setAttribute('text-anchor','middle');
    text.setAttribute('dominant-baseline','central');
    text.setAttribute('font-size','15');
    text.textContent = node.visited ? '✓' : info.icon;
    g.appendChild(text);
  }

  // Visited checkmark overlay
  if(node.visited && spriteUrl) {
    const check = document.createElementNS('http://www.w3.org/2000/svg','text');
    check.setAttribute('text-anchor','middle');
    check.setAttribute('dominant-baseline','central');
    check.setAttribute('font-size','14');
    check.setAttribute('fill','rgba(255,255,255,0.6)');
    check.textContent = '✓';
    g.appendChild(check);
  }

  // Label below node
  const label = document.createElementNS('http://www.w3.org/2000/svg','text');
  label.setAttribute('text-anchor','middle');
  label.setAttribute('y','28');
  label.setAttribute('font-size','5.5');
  label.setAttribute('fill','rgba(0,0,0,0.75)');
  label.setAttribute('font-family',"'Press Start 2P', monospace");
  label.setAttribute('font-weight','bold');
  label.textContent = info.label;
  g.appendChild(label);
}

function nodeInfo(node) {
  const m = {
    start:      { icon:'▶', bgColor:'#1a5c1a', label:'START' },
    battle:     { icon:'⚔', bgColor:'#8b0000', label:'BATTLE' },
    catch:      { icon:'⬟', bgColor:'#1a5c1a', label:'CATCH' },
    item:       { icon:'✦', bgColor:'#7a4500', label:'ITEM' },
    trainer:    { icon:'🧑',bgColor:'#4a2080', label:'TRAINER' },
    question:   { icon:'?', bgColor:'#555522', label:'???' },
    pokecenter: { icon:'♥', bgColor:'#8b0030', label:'CENTER' },
    boss:       { icon:'👑',bgColor:'#806000', label:'GYM' },
  };
  return m[node.type] || { icon:'?', bgColor:'#333', label:'???' };
}
