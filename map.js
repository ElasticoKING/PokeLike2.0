// ===== MAP.JS =====
// Generates and renders the roguelike map (node graph)

const NODE_TYPES = ['battle','battle','battle','catch','catch','item','trainer','question','pokecenter'];
const LAYERS = 9; // nodes per run (+ start + boss)

function generateMap(mapIndex) {
  const nodes = {};
  const edges = [];
  const layers = [];

  // Layer 0: start
  const start = { id:'n0_0', type:'start', layer:0, col:0, visited:true, accessible:false, revealed:true };
  nodes['n0_0'] = start;
  layers.push([start]);

  // Layers 1-7: random nodes
  for(let l=1; l<=7; l++) {
    const cols = l <= 3 ? 2 : l <= 5 ? 3 : 2;
    // Make sure pokecenter appears once around layer 5-6
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

  // Layer 8: boss
  const boss = { id:'n8_0', type:'boss', layer:8, col:0, mapIndex, visited:false, accessible:false, revealed:true };
  nodes['n8_0'] = boss;
  layers.push([boss]);

  // Generate edges (connect each node to 1-2 nodes in next layer)
  for(let l=0; l<layers.length-1; l++) {
    const from = layers[l];
    const to = layers[l+1];
    // Each 'from' node connects to at least one 'to' node
    from.forEach((fn, fi) => {
      // Connect to same-ish column
      const targets = [];
      to.forEach((tn, ti) => {
        const dist = Math.abs(fi/(from.length-1||1) - ti/(to.length-1||1));
        if(dist <= 0.6) targets.push(tn);
      });
      if(targets.length === 0) targets.push(to[0]);
      targets.forEach(tn => {
        const key = `${fn.id}->${tn.id}`;
        if(!edges.find(e=>e.from===fn.id&&e.to===tn.id)) {
          edges.push({from:fn.id, to:tn.id});
        }
      });
    });
    // Each 'to' node must have at least one incoming
    to.forEach(tn => {
      if(!edges.find(e=>e.to===tn.id)) {
        const src = from[Math.floor(Math.random()*from.length)];
        edges.push({from:src.id, to:tn.id});
      }
    });
  }

  // Make first layer accessible from start
  layers[1].forEach(n => {
    n.accessible = true;
  });

  return { nodes, edges, layers, mapIndex };
}

function randomTrainerSprite() {
  const opts = ['Scientist','hiker','policeman','fisher','aceTrainer','oldGuy','fireSpitter'];
  return opts[Math.floor(Math.random()*opts.length)];
}

// Mark nodes accessible after visiting a node
function advanceMap(map, visitedId) {
  const node = map.nodes[visitedId];
  if(!node) return;
  node.visited = true;
  node.accessible = false;
  // Find all edges from this node and unlock targets
  map.edges.forEach(e => {
    if(e.from === visitedId) {
      const target = map.nodes[e.to];
      if(target && !target.visited) {
        target.accessible = true;
      }
    }
  });
}

// ---- MAP RENDERER ----
function renderMap(map, onNodeClick) {
  const container = document.getElementById('map-container');
  container.innerHTML = '';

  const layers = map.layers;
  const maxCols = Math.max(...layers.map(l=>l.length));
  const NODE_W = 52, NODE_H = 60, PAD_X = 20, PAD_Y = 10;
  const svgW = maxCols * NODE_W + PAD_X*2;
  const svgH = layers.length * NODE_H + PAD_Y*2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox',`0 0 ${svgW} ${svgH}`);
  svg.setAttribute('width', Math.min(svgW, 560));
  svg.setAttribute('height', svgH);
  svg.classList.add('map-svg');

  // Compute node centers
  const centers = {};
  layers.forEach((layer, li) => {
    const y = PAD_Y + (layers.length-1-li) * NODE_H + NODE_H/2;
    layer.forEach((node, ci) => {
      const x = PAD_X + (maxCols-layer.length)*NODE_W/2 + ci*NODE_W + NODE_W/2;
      centers[node.id] = {x, y};
    });
  });

  // Draw edges
  map.edges.forEach(e => {
    const a = centers[e.from], b = centers[e.to];
    if(!a||!b) return;
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',a.x); line.setAttribute('y1',a.y);
    line.setAttribute('x2',b.x); line.setAttribute('y2',b.y);
    line.setAttribute('stroke','#2a2a4a');
    line.setAttribute('stroke-width','2');
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

      const info = nodeInfo(node);

      // Circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
      circle.setAttribute('r','16');
      circle.setAttribute('fill', node.visited ? '#111' : info.color);
      circle.setAttribute('stroke', node.accessible ? '#ffd700' : '#2a2a4a');
      circle.setAttribute('stroke-width', node.accessible ? '2.5' : '1.5');
      circle.classList.add('node-circle');
      g.appendChild(circle);

      // Icon (text)
      const text = document.createElementNS('http://www.w3.org/2000/svg','text');
      text.setAttribute('text-anchor','middle');
      text.setAttribute('dominant-baseline','central');
      text.setAttribute('font-size','14');
      text.textContent = node.visited ? '✓' : info.icon;
      g.appendChild(text);

      // Label
      const label = document.createElementNS('http://www.w3.org/2000/svg','text');
      label.setAttribute('text-anchor','middle');
      label.setAttribute('y','26');
      label.setAttribute('font-size','5');
      label.setAttribute('fill','#8888aa');
      label.setAttribute('font-family',"'Press Start 2P', monospace");
      label.textContent = info.label;
      g.appendChild(label);

      if(node.accessible) {
        g.style.cursor = 'pointer';
        g.addEventListener('click', () => onNodeClick(node));
      }
      svg.appendChild(g);
    });
  });

  container.appendChild(svg);
}

function nodeInfo(node) {
  const map = {
    start:      { icon:'🏠', color:'#0f3460', label:'START' },
    battle:     { icon:'⚔️', color:'#c03028', label:'BATTLE' },
    catch:      { icon:'⬟',  color:'#78c850', label:'CATCH' },
    item:       { icon:'✦',  color:'#f08030', label:'ITEM' },
    trainer:    { icon:'🧑', color:'#7038f8', label:'TRAINER' },
    question:   { icon:'?',  color:'#f8d030', label:'???' },
    pokecenter: { icon:'♥',  color:'#e94560', label:'CENTER' },
    boss:       { icon:'👑', color:'#ffd700', label:'GYM' },
  };
  return map[node.type] || { icon:'?', color:'#333', label:'???' };
}
