// ===== GAME.JS =====
// Main game loop, state management, save/load

// ---- GAME STATE ----
let RUN = null; // current run state
let nuzlockeMode = false;

const MAX_TEAM = 6;
const SAVE_KEY = 'poke_current_run';
const DEX_KEY  = 'poke_dex';
const HOF_KEY  = 'poke_hall_of_fame';

// ---- INIT ----
window.addEventListener('load', async () => {
  setupTitleButtons();
  loadDex();
  // Check for saved run
  const saved = localStorage.getItem(SAVE_KEY);
  if(saved) {
    document.getElementById('btn-continue').style.display = '';
  }
});

function setupTitleButtons() {
  document.getElementById('btn-new-run').addEventListener('click', () => startNewRun(false));
  document.getElementById('btn-nuzlocke').addEventListener('click', () => startNewRun(true));
  document.getElementById('btn-continue').addEventListener('click', continueRun);
  document.getElementById('btn-retry').addEventListener('click', () => showScreen('title-screen'));
  document.getElementById('btn-play-again').addEventListener('click', () => showScreen('title-screen'));
  document.getElementById('btn-skip-catch').addEventListener('click', skipCatch);
  document.getElementById('btn-skip-item').addEventListener('click', skipItem);
  document.getElementById('btn-cancel-swap').addEventListener('click', cancelSwap);
  document.getElementById('btn-next-map').addEventListener('click', nextMap);
  document.getElementById('btn-skip-battle').addEventListener('click', skipBattle);
  document.getElementById('btn-continue-battle').addEventListener('click', afterBattle);
}

// ---- NEW RUN ----
function startNewRun(nuzlocke) {
  nuzlockeMode = nuzlocke;
  showTrainerSelect();
}

function showTrainerSelect() {
  showScreen('trainer-screen');
}

function selectTrainer(gender) {
  RUN = {
    trainer: gender,
    team: [],
    items: [],
    badges: 0,
    currentMap: 0,
    map: null,
    currentNodeId: null,
    nuzlockeMode,
    atkBonus: 1,
    defBonus: 1,
    expBonus: 1,
    critBonus: 0,
    amuletCoin: false,
    eliteIndex: 0,
    pendingBattle: null,
  };
  showStarterSelect();
}

// ---- STARTER SELECT ----
async function showStarterSelect() {
  showScreen('starter-screen');
  const container = document.getElementById('starter-choices');
  container.innerHTML = '<div style="font-size:9px;color:var(--text-dim)">Loading...</div>';

  // Prefetch all starter species
  await prefetchSpecies(STARTERS.map(s=>s.speciesId));

  container.innerHTML = '';
  STARTERS.forEach(s => {
    const data = _statsCache[s.speciesId];
    if(!data) return;
    const poke = createPokemon(s.speciesId, 5);
    const card = renderPokeCard(poke, () => pickStarter(poke));
    container.appendChild(card);
  });
}

async function pickStarter(poke) {
  RUN.team = [poke];
  addToDex(poke);
  await initMap();
}

// ---- MAP ----
async function initMap() {
  RUN.map = generateMap(RUN.currentMap);
  RUN.currentNodeId = 'n0_0';
  saveRun();
  await showMap();
}

async function showMap() {
  // Update HUD
  document.getElementById('map-info').textContent =
    `Map ${RUN.currentMap+1} / 3  |  ${RUN.nuzlockeMode ? '☠ NUZLOCKE' : 'Normal'}`;
  renderTeamBar(RUN.team, 'team-bar');
  renderItemBar(RUN.items, 'item-bar');
  renderBadgePanel(RUN.badges, 'badge-panel');

  renderMap(RUN.map, handleNodeClick);
  showScreen('map-screen');
}

// ---- NODE CLICK ----
async function handleNodeClick(node) {
  if(!node.accessible) return;
  RUN.currentNodeId = node.id;

  switch(node.type) {
    case 'battle':    await startWildBattle(node); break;
    case 'catch':     await startCatch(node); break;
    case 'item':      await startItem(); break;
    case 'trainer':   await startTrainerBattle(node); break;
    case 'question':  await doQuestion(node); break;
    case 'pokecenter':doPokeCenter(); break;
    case 'boss':      await startBoss(); break;
    default: advanceAndReturn(node.id);
  }
}

// ---- WILD BATTLE ----
async function startWildBattle(node) {
  const mapIndex = RUN.currentMap;
  const baseLevel = 5 + mapIndex*12 + node.layer*2;
  // Single wild pokemon
  const pool = WILD_POOLS[Math.min(mapIndex, WILD_POOLS.length-1)];
  const id = pool[Math.floor(Math.random()*pool.length)];
  await fetchBaseStats(id);
  const level = baseLevel + Math.floor(Math.random()*4);
  const wild = createPokemon(id, level, rollShiny());
  if(!wild) { advanceAndReturn(node.id); return; }

  addToDex(wild);
  RUN.pendingNode = node;
  runBattle([wild], 'Wild Battle!', `A wild ${wild.name} appeared!`, false);
}

// ---- TRAINER BATTLE ----
async function startTrainerBattle(node) {
  const mapIndex = RUN.currentMap;
  const baseLevel = 5 + mapIndex*12 + node.layer*2;
  const pool = WILD_POOLS[Math.min(mapIndex, WILD_POOLS.length-1)];
  const count = 1 + Math.floor(node.layer/3);
  const enemies = [];
  for(let i=0;i<count;i++) {
    const id = pool[Math.floor(Math.random()*pool.length)];
    await fetchBaseStats(id);
    const poke = createPokemon(id, baseLevel + Math.floor(Math.random()*4));
    if(poke) enemies.push(poke);
  }
  const sprite = TRAINER_SPRITES[node.trainerSprite] || '🧑';
  RUN.pendingNode = node;
  runBattle(enemies, `${sprite} Trainer Battle!`, `A trainer challenged you!`, true);
}

// ---- BOSS BATTLE ----
async function startBoss() {
  const node = RUN.map.nodes[RUN.currentNodeId];
  const leader = GYM_LEADERS[RUN.badges] || GYM_LEADERS[7];

  // Prefetch boss pokemon
  await prefetchSpecies(leader.pokemon);
  const enemies = leader.pokemon.map((id,i) => createPokemon(id, leader.levels[i])).filter(Boolean);

  RUN.pendingNode = node;
  RUN.pendingBoss = leader;
  runBattle(enemies, `👑 Gym Leader ${leader.name}!`, `${leader.name} wants to battle!`, true, true);
}

// ---- BATTLE RUNNER ----
function runBattle(enemies, title, subtitle, isTrainer, isBoss=false) {
  showScreen('battle-screen');
  document.getElementById('battle-title').textContent = title;
  document.getElementById('battle-subtitle').textContent = subtitle;
  document.getElementById('btn-skip-battle').style.display = '';
  document.getElementById('btn-continue-battle').style.display = 'none';

  const playerSide = document.getElementById('player-side');
  const enemySide = document.getElementById('enemy-side');
  const log = document.getElementById('battle-log');
  playerSide.innerHTML = '';
  enemySide.innerHTML = '';
  log.innerHTML = '';

  RUN.team.forEach(p => playerSide.appendChild(renderBattlePoke(p, p.currentHp<=0)));
  enemies.forEach(e => enemySide.appendChild(renderBattlePoke(e)));

  // Store for skip handler
  RUN._battleEnemies = enemies;
  RUN._battleIsBoss = isBoss;
  RUN._battleIsTrainer = isTrainer;
}

function skipBattle() {
  const enemies = RUN._battleEnemies;
  const isBoss = RUN._battleIsBoss;
  const result = simulateBattle(RUN.team, enemies, RUN);

  // Re-render with results
  const playerSide = document.getElementById('player-side');
  const enemySide = document.getElementById('enemy-side');
  const log = document.getElementById('battle-log');
  playerSide.innerHTML = '';
  enemySide.innerHTML = '';

  RUN.team.forEach(p => playerSide.appendChild(renderBattlePoke(p, p.currentHp<=0, result.playerWon)));
  enemies.forEach(e => enemySide.appendChild(renderBattlePoke(e, e.currentHp<=0, !result.playerWon)));

  // Show log
  result.log.slice(-12).forEach(entry => {
    const div = document.createElement('div');
    div.className = `log-entry ${entry.type==='faint'?'log-lose':''}`;
    div.textContent = entry.msg;
    log.appendChild(div);
  });

  if(result.playerWon) {
    const wins = document.createElement('div');
    wins.className = 'log-win';
    wins.textContent = `Victory! +${result.expGained} EXP`;
    log.appendChild(wins);
    RUN._pendingExp = result.expGained;
    RUN._pendingWin = true;
  } else {
    const lose = document.createElement('div');
    lose.className = 'log-lose';
    lose.textContent = 'You lost...';
    log.appendChild(lose);
    RUN._pendingWin = false;
  }

  document.getElementById('btn-skip-battle').style.display = 'none';
  document.getElementById('btn-continue-battle').style.display = '';
  log.scrollTop = log.scrollHeight;
}

async function afterBattle() {
  if(RUN._pendingWin) {
    // Distribute EXP
    if(RUN._pendingExp) {
      const events = distributeExp(RUN.team, RUN._pendingExp, RUN);
      for(const ev of events) {
        if(ev.evolving) {
          await showEvolution(ev.pokemon, ev.toId);
        }
      }
    }
    if(RUN._battleIsBoss) {
      await bossBattleWon();
    } else {
      advanceAndReturn(RUN.pendingNode.id);
    }
  } else {
    // Check if all fainted
    const alive = RUN.team.filter(p=>p.currentHp>0);
    if(alive.length === 0) {
      gameOver();
    } else {
      advanceAndReturn(RUN.pendingNode.id);
    }
  }
  RUN._pendingWin = null;
  RUN._pendingExp = null;
}

// ---- BOSS WIN ----
async function bossBattleWon() {
  const leader = RUN.pendingBoss || GYM_LEADERS[RUN.badges];
  RUN.badges++;

  const screen = document.getElementById('badge-screen');
  document.getElementById('badge-msg').textContent = `${leader.badge} earned!`;
  document.getElementById('badge-leader').textContent = `Defeated ${leader.name}!`;
  document.getElementById('badge-count-display').textContent = `Badges: ${RUN.badges}/8`;
  showScreen('badge-screen');

  advanceFromNode(RUN.map, RUN.currentNodeId);
  saveRun();

  document.getElementById('btn-next-map').onclick = async () => {
    if(RUN.badges >= 8) {
      await startEliteFour();
    } else {
      RUN.currentMap++;
      await initMap();
    }
  };
}

// ---- ELITE FOUR ----
async function startEliteFour() {
  const member = ELITE_FOUR[RUN.eliteIndex];
  if(!member) { gameWin(); return; }

  await prefetchSpecies(member.pokemon);
  const enemies = member.pokemon.map((id,i)=>createPokemon(id,member.levels[i])).filter(Boolean);

  RUN._battleIsBoss = true;
  RUN._eliteBattle = true;
  RUN.pendingNode = null;
  runBattle(enemies, `⚔️ Elite Four: ${member.name}!`, `${member.name} stands in your way!`, true, true);

  // Override afterBattle for elite
  const origAfter = afterBattle;
  document.getElementById('btn-continue-battle').onclick = async () => {
    if(RUN._pendingWin) {
      if(RUN._pendingExp) distributeExp(RUN.team, RUN._pendingExp, RUN);
      RUN.eliteIndex++;
      if(RUN.eliteIndex >= ELITE_FOUR.length) {
        gameWin();
      } else {
        await startEliteFour();
      }
    } else {
      gameOver();
    }
    RUN._pendingWin = null;
    RUN._pendingExp = null;
  };
}

// ---- CATCH ----
async function startCatch(node) {
  RUN.pendingNode = node;
  showScreen('catch-screen');
  const container = document.getElementById('catch-choices');
  container.innerHTML = '<div style="font-size:9px;color:var(--text-dim)">Loading...</div>';

  const wilds = await randomWildPokemon(RUN.currentMap, 3);
  wilds.forEach(p => addToDex(p));

  container.innerHTML = '';
  wilds.forEach(poke => {
    const card = renderPokeCard(poke, () => catchPokemon(poke));
    container.appendChild(card);
  });
  renderScreenTeamBar(RUN.team, 'catch-team-bar');
}

async function catchPokemon(poke) {
  if(RUN.team.length >= MAX_TEAM) {
    // Show swap screen
    showSwapScreen(poke);
  } else {
    RUN.team.push(poke);
    advanceAndReturn(RUN.pendingNode.id);
  }
}

function skipCatch() { advanceAndReturn(RUN.pendingNode.id); }

// ---- SWAP ----
function showSwapScreen(incoming) {
  showScreen('swap-screen');
  RUN._swapIncoming = incoming;

  const incomingDiv = document.getElementById('swap-incoming');
  incomingDiv.innerHTML = '';
  incomingDiv.appendChild(renderPokeCard(incoming));

  document.getElementById('swap-prompt').textContent = 'Replace a team member:';

  const choices = document.getElementById('swap-choices');
  choices.innerHTML = '';
  RUN.team.forEach((poke, i) => {
    const card = renderPokeCard(poke, () => doSwap(i));
    choices.appendChild(card);
  });
}

function doSwap(index) {
  RUN.team[index] = RUN._swapIncoming;
  advanceAndReturn(RUN.pendingNode.id);
}
function cancelSwap() { advanceAndReturn(RUN.pendingNode.id); }

// ---- ITEM ----
async function startItem() {
  const node = RUN.map.nodes[RUN.currentNodeId];
  RUN.pendingNode = node;
  showScreen('item-screen');

  const container = document.getElementById('item-choices');
  container.innerHTML = '';
  const items = randomItems(3);
  items.forEach(item => {
    const card = renderItemCard(item, () => pickItem(item));
    container.appendChild(card);
  });
  renderScreenTeamBar(RUN.team, 'item-team-bar');
}

function pickItem(item) {
  const msg = item.apply(RUN.team, RUN);
  RUN.items.push(item);
  advanceAndReturn(RUN.pendingNode.id);
}
function skipItem() { advanceAndReturn(RUN.pendingNode.id); }

// ---- POKECENTER ----
function doPokeCenter() {
  RUN.team.forEach(p => { p.currentHp = p.maxHp; });
  const node = RUN.map.nodes[RUN.currentNodeId];
  advanceAndReturn(node.id);
}

// ---- QUESTION NODE (random event) ----
async function doQuestion(node) {
  const roll = Math.random();
  if(roll < 0.4) {
    await startCatch(node);
  } else if(roll < 0.7) {
    RUN.pendingNode = node;
    await startItem();
  } else {
    // Mini heal
    RUN.team.forEach(p => { p.currentHp = Math.min(p.maxHp, p.currentHp + Math.floor(p.maxHp*0.2)); });
    advanceAndReturn(node.id);
  }
}

// ---- ADVANCE MAP & RETURN ----
function advanceAndReturn(nodeId) {
  advanceFromNode(RUN.map, nodeId);
  saveRun();
  showMap();
}

// ---- GAME OVER ----
function gameOver() {
  const info = document.getElementById('gameover-info');
  info.innerHTML = `
    Badges: ${RUN.badges}/8<br>
    Team: ${RUN.team.map(p=>`${p.name} Lv.${p.level}`).join(', ')}
  `;
  localStorage.removeItem(SAVE_KEY);
  showScreen('gameover-screen');
}

// ---- WIN ----
function gameWin() {
  const winTeam = document.getElementById('win-team');
  winTeam.innerHTML = '';
  RUN.team.forEach(p => winTeam.appendChild(renderPokeCard(p)));

  // Save to hall of fame
  const raw = localStorage.getItem(HOF_KEY);
  const hof = raw ? JSON.parse(raw) : [];
  hof.push({
    date: new Date().toLocaleDateString(),
    badges: RUN.badges,
    team: RUN.team.map(p=>({name:p.name, level:p.level})),
  });
  localStorage.setItem(HOF_KEY, JSON.stringify(hof));
  localStorage.removeItem(SAVE_KEY);

  showScreen('win-screen');
}

// ---- SAVE / LOAD ----
function saveRun() {
  if(!RUN) return;
  localStorage.setItem(SAVE_KEY, JSON.stringify(RUN));
}

async function continueRun() {
  const raw = localStorage.getItem(SAVE_KEY);
  if(!raw) return;
  RUN = JSON.parse(raw);

  // Rebuild stats cache from saved data
  const allIds = new Set();
  RUN.team.forEach(p => allIds.add(p.speciesId));
  // Also prefetch map wild pool for current map
  const pool = WILD_POOLS[Math.min(RUN.currentMap, WILD_POOLS.length-1)];
  pool.slice(0,20).forEach(id => allIds.add(id));
  await prefetchSpecies([...allIds]);

  await showMap();
}

// ---- POKEDEX ----
function addToDex(poke) {
  const raw = localStorage.getItem(DEX_KEY);
  const dex = raw ? JSON.parse(raw) : {};
  if(!dex[poke.speciesId]) {
    dex[poke.speciesId] = { id:poke.speciesId, name:poke.name, types:poke.types, spriteUrl:poke.spriteUrl };
    localStorage.setItem(DEX_KEY, JSON.stringify(dex));
  }
}
function loadDex() {
  // Nothing needed on load, dex is read on demand
}

// ---- NEXT MAP (badge screen button override) ----
function nextMap() {
  // handled dynamically by bossBattleWon
}
