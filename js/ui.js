// ui.js - Screen transitions and UI helpers

const SKIP_SPEED = 3;
let battleSpeedMultiplier = 1;
let _hoverEnabled = true;

document.addEventListener('mousemove', () => { _hoverEnabled = true; }, { capture: true, passive: true });

// ---- Screen switching ----
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const s = document.getElementById(id);
  if (s) s.classList.add('active');
  window.scrollTo(0, 0);
}

// ---- HP Bar ----
function hpBarColor(pct) {
  if (pct > 0.5) return '#00FF4A';
  if (pct > 0.1) return '#EAFF00';
  return '#FF0000';
}

function renderHpBar(current, max) {
  const pct = Math.max(0, current / max);
  const color = hpBarColor(pct);
  return `<div class="hp-bar-bg">
    <div class="hp-bar-fill" style="width:${Math.floor(pct*100)}%;background:${color}">
      <div class="hp-bar-shadow"></div>
    </div>
  </div>
  <span class="hp-text">${Math.max(0,current)}/${max}</span>`;
}

// ---- Pokemon Card ----
function renderPokeCard(pokemon, onClick, selected) {
  const pct = pokemon.currentHp / pokemon.maxHp;
  const typeHtml = (pokemon.types || ['Normal']).map(t =>
    `<span class="type-badge type-${t}">${t}</span>`
  ).join('');
  const card = document.createElement('div');
  card.className = `poke-card${selected?' selected':''}`;
  if (onClick) { card.setAttribute('role','button'); card.setAttribute('tabindex','0'); }
  card.innerHTML = `
    <div class="poke-sprite-wrap">
      <img src="${pokemon.spriteUrl||''}" alt="${pokemon.name}" class="poke-sprite${pokemon.isShiny?' shiny':''}"
           onerror="this.src='';this.style.display='none'">
      ${pokemon.isShiny ? '<span class="shiny-badge">★ Shiny</span>' : ''}
    </div>
    <div class="poke-name">${pokemon.nickname||pokemon.name}</div>
    <div class="poke-level">Lv. ${pokemon.level}</div>
    <div class="poke-types">${typeHtml}</div>
    <div class="poke-stats">
      HP: ${pokemon.baseStats.hp} | ATK: ${pokemon.baseStats.atk} | DEF: ${pokemon.baseStats.def}<br>
      SPD: ${pokemon.baseStats.speed}
    </div>
    <div class="poke-hp">${renderHpBar(pokemon.currentHp, pokemon.maxHp)}</div>
  `;
  if (onClick) {
    card.addEventListener('click', onClick);
    card.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' ') onClick(); });
  }
  return card;
}

// ---- renderPokemonCard (HTML string version for compatibility) ----
function renderPokemonCard(pokemon, onClick, selected) {
  const card = renderPokeCard(pokemon, onClick, selected);
  return card.outerHTML;
}

// ---- Team Bar ----
function renderTeamBar(team, el) {
  if (!el) el = document.getElementById('team-bar');
  if (!el) return;
  el.innerHTML = '';
  team.forEach((p, i) => {
    const pct = p.currentHp / p.maxHp;
    const color = hpBarColor(pct);
    const slot = document.createElement('div');
    slot.className = 'team-slot';
    slot.innerHTML = `
      <img src="${p.spriteUrl||''}" alt="${p.name}" class="team-sprite"
           onerror="this.src='';this.style.display='none'">
      <div class="team-slot-name">${p.nickname||p.name}</div>
      <div class="team-slot-lv">Lv${p.level}</div>
      <div class="hp-bar-bg sm">
        <div class="hp-bar-fill" style="width:${Math.floor(pct*100)}%;background:${color}"></div>
      </div>
    `;
    el.appendChild(slot);
  });
}

// ---- Item Badges ----
function renderItemBadges(items) {
  const el = document.getElementById('item-bar');
  if (!el) return;
  el.innerHTML = '';
  if (!items || items.length === 0) {
    el.innerHTML = '<span style="color:var(--text-dim);font-size:10px;">Bag empty</span>';
    return;
  }
  items.forEach(it => {
    const span = document.createElement('span');
    span.className = 'item-badge';
    span.title = `${it.name}: ${it.desc}`;
    span.textContent = `${it.icon} ${it.name}`;
    el.appendChild(span);
  });
}

// ---- Battle Field ----
function renderBattleField(pTeam, eTeam) {
  const pEl = document.getElementById('player-side');
  const eEl = document.getElementById('enemy-side');
  const pActiveIdx = pTeam.findIndex(p => p.currentHp > 0);
  const eActiveIdx = eTeam.findIndex(p => p.currentHp > 0);

  if (pEl) {
    pEl.innerHTML = pTeam.map((p, i) => {
      const fainted = p.currentHp <= 0;
      const active  = i === pActiveIdx;
      return `<div class="battle-pokemon ${fainted?'fainted':''} ${active?'active-pokemon':''}" data-idx="${i}">
        <div class="battle-poke-name">${p.nickname||p.name} Lv${p.level}</div>
        <div class="poke-hp">${renderHpBar(p.currentHp, p.maxHp)}</div>
        <img src="${p.spriteUrl||''}" alt="${p.name}" class="battle-sprite"
             onerror="this.src=''">
      </div>`;
    }).join('');
  }
  if (eEl) {
    eEl.innerHTML = eTeam.map((p, i) => {
      const fainted = p.currentHp <= 0;
      const active  = i === eActiveIdx;
      return `<div class="battle-pokemon ${fainted?'fainted':''} ${active?'active-pokemon':''}" data-idx="${i}">
        <div class="battle-poke-name">${p.name} Lv${p.level}</div>
        <div class="poke-hp">${renderHpBar(p.currentHp, p.maxHp)}</div>
        <img src="${p.spriteUrl||''}" alt="${p.name}" class="battle-sprite"
             onerror="this.src=''">
      </div>`;
    }).join('');
  }
}

// ---- Animate HP Bar ----
function animateHpBar(containerEl, fromHp, toHp, maxHp, duration = 250) {
  return new Promise(resolve => {
    const fillEl = containerEl.querySelector('.hp-bar-fill');
    const textEl = containerEl.querySelector('.hp-text');
    if (!fillEl) { resolve(); return; }
    const fromPct = Math.max(0, fromHp / maxHp);
    const toPct   = Math.max(0, toHp / maxHp);
    const scaledDuration = duration / battleSpeedMultiplier;
    const start = performance.now();
    function frame(now) {
      const t = Math.min((now - start) / scaledDuration, 1);
      const curPct = fromPct + (toPct - fromPct) * t;
      const curHp  = Math.round(fromHp + (toHp - fromHp) * t);
      fillEl.style.width = `${Math.floor(curPct * 100)}%`;
      fillEl.style.background = hpBarColor(curPct);
      if (textEl) textEl.textContent = `${Math.max(0, curHp)}/${maxHp}`;
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

// ---- Item Card ----
function renderItemCard(item, onClick) {
  const card = document.createElement('div');
  card.className = 'item-card';
  card.innerHTML = `
    <div class="item-icon">${item.icon}</div>
    <div class="item-name">${item.name}</div>
    <div class="item-desc">${item.desc}</div>
  `;
  if (onClick) card.addEventListener('click', onClick);
  return card;
}

// ---- Modal ----
function openModal(contentHtml) {
  document.getElementById('modal-content').innerHTML = contentHtml;
  document.getElementById('modal-overlay').classList.add('active');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

// ---- Pokedex ----
function openPokedex() {
  const dexRaw = localStorage.getItem('poke_dex');
  const dex = dexRaw ? JSON.parse(dexRaw) : {};
  const seen = Object.values(dex);
  if (!seen.length) {
    openModal('<h2>📖 Pokédex</h2><p style="font-size:9px;color:var(--text-dim);margin-top:8px;">No Pokémon seen yet!</p>');
    return;
  }
  const grid = seen.map(p => `
    <div class="dex-entry">
      <img src="${p.spriteUrl}" alt="${p.name}" onerror="this.style.display='none'">
      <div class="dex-name">${p.name}</div>
    </div>
  `).join('');
  openModal(`<h2>📖 Pokédex (${seen.length} seen)</h2><div class="pokedex-grid">${grid}</div>`);
}
// Alias
function openPokedexModal() { openPokedex(); }

// ---- Hall of Fame ----
function openHallOfFame() {
  const raw = localStorage.getItem('poke_hall_of_fame');
  const hof = raw ? JSON.parse(raw) : [];
  if (!hof.length) {
    openModal('<h2>🏆 Hall of Fame</h2><p style="font-size:9px;color:var(--text-dim);margin-top:8px;">No wins yet. You got this!</p>');
    return;
  }
  const entries = hof.slice(-10).reverse().map((run, i) => `
    <div class="hof-entry">
      <div class="hof-date">#${hof.length - i} — ${run.date}</div>
      <div class="hof-team">${run.team.map(p=>`${p.name} Lv.${p.level}`).join(', ')}</div>
    </div>
  `).join('');
  openModal(`<h2>🏆 Hall of Fame</h2>${entries}`);
}
// Alias
function openHallOfFameModal() { openHallOfFame(); }

// ---- Evolution Overlay ----
async function showEvolution(poke, toId) {
  const overlay  = document.getElementById('evo-overlay');
  const msg      = document.getElementById('evo-msg');
  const sprite   = document.getElementById('evo-sprite');
  const oldName  = poke.name;

  msg.textContent = `What?! ${oldName} is evolving!`;
  sprite.src = poke.spriteUrl;
  overlay.style.display = 'flex';

  await new Promise(r => setTimeout(r, 2000));

  await fetchBaseStats(toId);
  const newData = _statsCache[toId];
  if (newData) {
    poke.speciesId = toId;
    poke.name      = newData.name;
    poke.types     = newData.types;
    poke.baseStats = newData.baseStats;
    poke.spriteUrl = poke.isShiny ? newData.shinySpriteUrl : newData.spriteUrl;
    recalcStats(poke);
    sprite.src = poke.spriteUrl;
    msg.textContent = `${oldName} evolved into ${poke.name}!`;
    await new Promise(r => setTimeout(r, 2000));
  }

  overlay.style.display = 'none';
}

// ---- Trainer Icons ----
function renderTrainerIcons(gender, enemySprite) {
  const playerEl = document.getElementById('player-trainer-icon');
  const enemyEl  = document.getElementById('enemy-trainer-icon');
  if (playerEl) {
    const src = gender === 'girl'
      ? 'https://play.pokemonshowdown.com/sprites/trainers/leaf.png'
      : 'https://play.pokemonshowdown.com/sprites/trainers/red.png';
    playerEl.innerHTML = `<img src="${src}" style="width:56px;height:56px;image-rendering:pixelated;" class="trainer-sprite-img">`;
  }
  if (enemyEl) {
    if (enemySprite) {
      enemyEl.innerHTML = `<img src="${enemySprite}" style="width:56px;height:56px;image-rendering:pixelated;transform:scaleX(-1);" class="trainer-sprite-img">`;
    } else {
      enemyEl.innerHTML = '';
    }
  }
}

// ---- Map Notification ----
function showMapNotification(msg) {
  const mapScreen = document.getElementById('map-screen');
  if (!mapScreen) return;
  const existing = mapScreen.querySelector('.map-notification');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'map-notification';
  div.textContent = msg;
  mapScreen.appendChild(div);
  setTimeout(() => {
    div.style.opacity = '0';
    setTimeout(() => div.remove(), 500);
  }, 1800);
}

// ---- Badge Panel ----
function renderBadgePanel(badges, containerId='badge-count-panel') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const b = document.createElement('span');
    b.style.fontSize = '16px';
    b.textContent = i < badges ? '🏅' : '⬜';
    el.appendChild(b);
  }
  // Also update mobile badge count
  const mobileEl = document.getElementById('badge-count');
  if (mobileEl) {
    mobileEl.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      const b = document.createElement('span');
      b.style.fontSize = '14px';
      b.textContent = i < badges ? '🏅' : '⬜';
      mobileEl.appendChild(b);
    }
  }
}

// ---- Screen team bar (catch/item screens) ----
function renderScreenTeamBar(team, containerId) {
  const bar = document.getElementById(containerId);
  if (!bar) return;
  bar.innerHTML = '';
  team.forEach(p => {
    const slot = document.createElement('div');
    slot.className = 'team-slot';
    slot.innerHTML = `
      <img src="${p.spriteUrl||''}" alt="${p.name}" class="team-sprite"
           onerror="this.src=''">
      <div class="team-slot-name">${p.nickname||p.name}</div>
      <div class="team-slot-lv">Lv${p.level}</div>
    `;
    bar.appendChild(slot);
  });
}

// ---- Stubs for functions called from game.js ----
function openAchievementsModal() {
  openModal('<h2>🏆 Achievements</h2><p style="font-size:9px;color:var(--text-dim);margin-top:8px;">Coming soon!</p>');
}
function openSettingsModal() {
  openModal('<h2>⚙️ Settings</h2><p style="font-size:9px;color:var(--text-dim);margin-top:8px;">No settings yet.</p>');
}
function openPatchNotesModal() {
  openModal('<h2>📋 Patch Notes</h2><p style="font-size:9px;color:var(--text-dim);margin-top:8px;">v1.0.0 — Initial release</p>');
}

// ---- Utility ----
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// Animate level-up (simple version)
async function animateLevelUp(levelUps) {
  if (!levelUps || !levelUps.length) return;
  await delay(400);
}

// Check and evolve team (simple version)
async function checkAndEvolveTeam() {
  if (!RUN) return;
  for (const poke of RUN.team) {
    if (poke.currentHp <= 0) continue;
    const evo = EVOLUTIONS[poke.speciesId];
    if (evo && poke.level >= evo.level && !evo.eevee) {
      await showEvolution(poke, evo.to);
    }
  }
}
