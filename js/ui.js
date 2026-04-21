// ===== UI.JS =====
// All rendering / DOM update helpers

// ---- SCREEN SWITCHING ----
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if(el) el.classList.add('active');
  window.scrollTo(0,0);
}

// ---- POKEMON CARD ----
function renderPokeCard(poke, onClick, extraClass='') {
  const card = document.createElement('div');
  card.className = `poke-card ${extraClass} ${poke.isShiny?'shiny':''}`;
  const hp = poke.currentHp/poke.maxHp;
  const hpColor = hp>0.5?'':'hp-fill '+(hp>0.25?'yellow':'red');
  card.innerHTML = `
    <img src="${poke.spriteUrl}" alt="${poke.name}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.speciesId}.png'">
    <div class="poke-name">${poke.isShiny?'★ ':''}${poke.nickname||poke.name}</div>
    <div class="poke-level">Lv.${poke.level}</div>
    <div class="poke-types">${poke.types.map(t=>`<span class="type-badge type-${t}">${t}</span>`).join('')}</div>
    <div class="hp-bar-wrap">
      <div class="hp-label"><span>HP</span><span>${poke.currentHp}/${poke.maxHp}</span></div>
      <div class="hp-bar"><div class="hp-fill ${hpColor}" style="width:${Math.max(0,hp*100)}%"></div></div>
    </div>
  `;
  if(onClick) card.addEventListener('click', onClick);
  return card;
}

// ---- BATTLE POKEMON CARD ----
function renderBattlePoke(poke, fainted=false, winner=false) {
  const div = document.createElement('div');
  div.className = `battle-poke ${fainted?'fainted':''} ${winner?'winner':''}`;
  const hp = poke.currentHp/poke.maxHp;
  const hpColor = hp>0.5?'':'hp-fill '+(hp>0.25?'yellow':'red');
  div.innerHTML = `
    <img src="${poke.spriteUrl}" alt="${poke.name}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.speciesId}.png'">
    <div class="poke-name">${poke.isShiny?'★ ':''}${poke.nickname||poke.name}</div>
    <div class="poke-level">Lv.${poke.level}</div>
    <div class="hp-bar-wrap">
      <div class="hp-label"><span>HP</span><span>${Math.max(0,poke.currentHp)}/${poke.maxHp}</span></div>
      <div class="hp-bar"><div class="hp-fill ${hpColor}" style="width:${Math.max(0,hp*100)}%"></div></div>
    </div>
  `;
  return div;
}

// ---- TEAM BAR (map HUD) ----
function renderTeamBar(team, containerId='team-bar') {
  const bar = document.getElementById(containerId);
  if(!bar) return;
  bar.innerHTML = '';
  team.forEach(poke => {
    const mini = document.createElement('div');
    mini.className = `team-mini ${poke.currentHp<=0?'fainted':''}`;
    mini.title = `${poke.name} Lv.${poke.level} (${poke.currentHp}/${poke.maxHp} HP)`;
    mini.innerHTML = `
      <img src="${poke.spriteUrl}" alt="${poke.name}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.speciesId}.png'">
      <div class="mini-level">${poke.level}</div>
    `;
    bar.appendChild(mini);
  });
}

// ---- ITEM BAR ----
function renderItemBar(items, containerId='item-bar') {
  const bar = document.getElementById(containerId);
  if(!bar) return;
  bar.innerHTML = '';
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'item-mini';
    el.title = `${item.name}: ${item.desc}`;
    el.textContent = item.icon;
    bar.appendChild(el);
  });
}

// ---- BADGE PANEL ----
function renderBadgePanel(badges, containerId='badge-panel') {
  const el = document.getElementById(containerId);
  if(!el) return;
  el.innerHTML = '';
  for(let i=0; i<8; i++) {
    const b = document.createElement('span');
    b.className = 'badge-mini';
    b.textContent = i < badges ? '🏅' : '⬜';
    el.appendChild(b);
  }
}

// ---- SCREEN TEAM BAR (catch/item screens) ----
function renderScreenTeamBar(team, containerId) {
  const bar = document.getElementById(containerId);
  if(!bar) return;
  bar.innerHTML = '';
  team.forEach(poke => {
    const mini = document.createElement('div');
    mini.className = `team-mini ${poke.currentHp<=0?'fainted':''}`;
    mini.title = `${poke.name} Lv.${poke.level}`;
    mini.innerHTML = `<img src="${poke.spriteUrl}" alt="${poke.name}"><div class="mini-level">${poke.level}</div>`;
    bar.appendChild(mini);
  });
}

// ---- ITEM CARD ----
function renderItemCard(item, onClick) {
  const card = document.createElement('div');
  card.className = 'item-card';
  card.innerHTML = `
    <div class="item-icon">${item.icon}</div>
    <div class="item-name">${item.name}</div>
    <div class="item-desc">${item.desc}</div>
  `;
  if(onClick) card.addEventListener('click', onClick);
  return card;
}

// ---- MODAL ----
function openModal(contentHtml) {
  document.getElementById('modal-content').innerHTML = contentHtml;
  document.getElementById('modal-overlay').classList.add('active');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

// ---- POKEDEX MODAL ----
function openPokedex() {
  const dexRaw = localStorage.getItem('poke_dex');
  const dex = dexRaw ? JSON.parse(dexRaw) : {};
  const seen = Object.values(dex);
  if(!seen.length) { openModal('<h2>📖 Pokédex</h2><p style="font-size:9px;color:var(--text-dim)">No Pokemon seen yet!</p>'); return; }
  const grid = seen.map(p => `
    <div class="dex-entry">
      <img src="${p.spriteUrl}" alt="${p.name}">
      <div class="dex-name">${p.name}</div>
    </div>
  `).join('');
  openModal(`<h2>📖 Pokédex (${seen.length} seen)</h2><div class="pokedex-grid">${grid}</div>`);
}

// ---- HALL OF FAME ----
function openHallOfFame() {
  const raw = localStorage.getItem('poke_hall_of_fame');
  const hof = raw ? JSON.parse(raw) : [];
  if(!hof.length) { openModal('<h2>🏆 Hall of Fame</h2><p style="font-size:9px;color:var(--text-dim)">No wins yet. You got this!</p>'); return; }
  const entries = hof.slice(-10).reverse().map((run,i) => `
    <div style="border-bottom:1px solid var(--border);padding:8px 0;font-size:8px;">
      <div style="color:var(--gold);margin-bottom:4px;">#${hof.length-i} — ${run.date}</div>
      <div style="color:var(--text-dim);">${run.team.map(p=>`${p.name} Lv.${p.level}`).join(', ')}</div>
    </div>
  `).join('');
  openModal(`<h2>🏆 Hall of Fame</h2>${entries}`);
}

// ---- EVOLUTION OVERLAY ----
async function showEvolution(poke, toId) {
  const overlay = document.getElementById('evo-overlay');
  const msg = document.getElementById('evo-msg');
  const sprite = document.getElementById('evo-sprite');

  const oldName = poke.name;
  msg.textContent = `What?! ${oldName} is evolving!`;
  sprite.src = poke.spriteUrl;
  overlay.classList.add('active');

  await delay(2000);

  // Fetch new species data
  await fetchBaseStats(toId);
  const newData = _statsCache[toId];
  if(newData) {
    poke.speciesId = toId;
    poke.name = newData.name;
    poke.types = newData.types;
    poke.baseStats = newData.baseStats;
    poke.spriteUrl = poke.isShiny ? newData.shinySpriteUrl : newData.spriteUrl;
    recalcStats(poke);

    sprite.src = poke.spriteUrl;
    msg.textContent = `${oldName} evolved into ${poke.name}!`;
    await delay(2000);
  }

  overlay.classList.remove('active');
}

// ---- UTILS ----
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function hpColor(pct) {
  if(pct > 0.5) return 'var(--hp-green)';
  if(pct > 0.25) return 'var(--hp-yellow)';
  return 'var(--hp-red)';
}
