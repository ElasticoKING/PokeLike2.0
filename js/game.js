// game.js - Central game state and entry point

// Seeded PRNG (same as original)
let _rngSeed = 0;
function rng() {
  _rngSeed = (_rngSeed + 0x6D2B79F5) | 0;
  let t = Math.imul(_rngSeed ^ (_rngSeed >>> 15), 1 | _rngSeed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function seedRng(seed) { _rngSeed = seed >>> 0; }
function getRngSeed() { return _rngSeed >>> 0; }

// ---- State ----
let state = {
  currentMap: 0, currentNode: null, team: [], items: [],
  badges: 0, map: null, eliteIndex: 0, trainer: 'boy',
  starterSpeciesId: null, maxTeamSize: 1, nuzlockeMode: false,
  usedPokecenter: false, pickedUpItem: false,
};

// ---- Persistence ----
function saveRun() {
  try {
    const saved = { ...state, currentNodeId: state.currentNode?.id || null, currentNode: null, rngSeed: getRngSeed() };
    localStorage.setItem('poke_current_run', JSON.stringify(saved));
  } catch(e) {}
}

function loadRun() {
  try {
    const raw = localStorage.getItem('poke_current_run');
    if (!raw) return false;
    const saved = JSON.parse(raw);
    if (saved.rngSeed) seedRng(saved.rngSeed);
    state = saved;
    state.currentNode = saved.currentNodeId ? (state.map?.nodes?.[saved.currentNodeId] || null) : null;
    delete state.currentNodeId; delete state.rngSeed;
    return true;
  } catch(e) { return false; }
}

function clearSavedRun() { localStorage.removeItem('poke_current_run'); }

// ---- Settings ----
function getSettings() {
  try { return JSON.parse(localStorage.getItem('poke_settings') || '{}'); } catch { return {}; }
}
function saveSettings(s) { localStorage.setItem('poke_settings', JSON.stringify(s)); }
function applyDarkMode() {
  document.body.classList.toggle('dark-mode', !!getSettings().darkMode);
}

// ---- Pokedex helpers ----
function getPokedex() {
  try { return JSON.parse(localStorage.getItem('poke_dex') || '{}'); } catch { return {}; }
}
function markPokedexCaught(id, name, types, spriteUrl) {
  const dex = getPokedex();
  dex[id] = { id, name, types, spriteUrl, caught: true };
  localStorage.setItem('poke_dex', JSON.stringify(dex));
}
function getShinyDex() {
  try { return JSON.parse(localStorage.getItem('poke_shiny_dex') || '{}'); } catch { return {}; }
}
function markShinyDexCaught(id, name, types, spriteUrl) {
  const dex = getShinyDex();
  dex[id] = { id, name, types, spriteUrl };
  localStorage.setItem('poke_shiny_dex', JSON.stringify(dex));
}
function hasShinyCharm() { return false; } // simplified
function checkDexAchievements() {}
function isPokedexComplete() { return false; }
function isShinyDexComplete() { return false; }

// ---- Hall of Fame ----
function getHallOfFame() {
  try { return JSON.parse(localStorage.getItem('poke_hall_of_fame') || '[]'); } catch { return []; }
}
function saveHallOfFameEntry(team, runNumber, hardMode) {
  const hof = getHallOfFame();
  hof.push({
    date: new Date().toLocaleDateString(),
    runNumber, hardMode,
    team: team.map(p => ({ name: p.name, level: p.level, spriteUrl: p.spriteUrl, isShiny: p.isShiny, nickname: p.nickname }))
  });
  localStorage.setItem('poke_hall_of_fame', JSON.stringify(hof));
}
function incrementEliteWins() {
  const wins = (parseInt(localStorage.getItem('poke_elite_wins') || '0') + 1);
  localStorage.setItem('poke_elite_wins', wins);
  return wins;
}

// ---- Achievements (stub) ----
function getUnlockedAchievements() { try { return new Set(JSON.parse(localStorage.getItem('poke_achievements') || '[]')); } catch { return new Set(); } }
function unlockAchievement(id) { return null; }
function showAchievementToast(ach) {}
const ACHIEVEMENTS = [];
const ALL_CATCHABLE_IDS = new Set(Array.from({length:151},(_,i)=>i+1));

// ---- Item helpers (stub) ----
function itemIconHtml(item, size) { return item?.icon || '?'; }
function openItemEquipModal() {}

// ---- Trainer SVGs ----
const TRAINER_SVG = {
  boy:  `<img src="https://play.pokemonshowdown.com/sprites/trainers/red.png" style="width:80px;height:80px;image-rendering:pixelated;">`,
  girl: `<img src="https://play.pokemonshowdown.com/sprites/trainers/leaf.png" style="width:80px;height:80px;image-rendering:pixelated;">`,
};

// ---- Pokemon creation (bridges to data.js) ----
async function fetchPokemonById(id) {
  await fetchBaseStats(id);
  return _statsCache[id] || null;
}

function createInstance(species, level, isShiny = false, moveTier = 0) {
  const bs = species.baseStats;
  const hp = calcHP(bs.hp, level);
  return {
    speciesId: species.id,
    name: species.name,
    nickname: null,
    level,
    currentHp: hp,
    maxHp: hp,
    isShiny,
    types: species.types,
    baseStats: bs,
    spriteUrl: isShiny ? species.shinySpriteUrl : species.spriteUrl,
    heldItem: null,
    moveTier: moveTier || 0,
    exp: 0,
  };
}

function calcHp(baseHp, level) { return calcHP(baseHp, level); }

// ---- Level gain (simplified) ----
function applyLevelGain(team, items, participants, maxEnemyLevel, nuzlocke, override) {
  const levelUps = [];
  const gain = override !== null && override !== undefined ? override : 1;
  team.forEach((p, idx) => {
    if (p.currentHp <= 0 && nuzlocke) return;
    const oldLevel = p.level;
    p.level = Math.min(100, p.level + gain);
    if (p.level > oldLevel) {
      recalcStats(p);
      levelUps.push({ idx, pokemon: p, newLevel: p.level, preHp: p.currentHp });
    }
  });
  return levelUps;
}

// ---- Wild Pokemon pool ----
async function getCatchChoices(mapIndex) {
  const pool = WILD_POOLS[Math.min(mapIndex, WILD_POOLS.length - 1)];
  const count = 3;
  const used = new Set();
  const result = [];
  let tries = 0;
  while (result.length < count && tries < 50) {
    tries++;
    const id = pool[Math.floor(rng() * pool.length)];
    if (used.has(id)) continue;
    used.add(id);
    const sp = await fetchPokemonById(id);
    if (sp) result.push(sp);
  }
  return result;
}

function getMoveТierForMap(mapIndex) {
  if (mapIndex >= 6) return 2;
  if (mapIndex >= 3) return 1;
  return 0;
}

function minLevelForSpecies(id) { return 1; }

// ---- Map level ranges ----
const MAP_LEVEL_RANGES = [
  [5, 15], [15, 25], [25, 35], [35, 45],
  [40, 50], [45, 55], [50, 60], [55, 65], [60, 75],
];

// ---- Init ----
async function initGame() {
  applyDarkMode();
  showScreen('title-screen');

  const continueBtn = document.getElementById('btn-continue-run');
  if (localStorage.getItem('poke_current_run')) {
    continueBtn.style.display = '';
    continueBtn.onclick = async () => {
      if (!loadRun()) return;
      // Rebuild species cache
      const ids = state.team.map(p => p.speciesId);
      await prefetchSpecies(ids);
      showMapScreen();
    };
  } else {
    continueBtn.style.display = 'none';
  }

  document.getElementById('btn-new-run').onclick  = () => startNewRun(false);
  document.getElementById('btn-hard-run').onclick = () => startNewRun(true);
  document.getElementById('btn-retry')?.addEventListener('click', () => showScreen('title-screen'));
  document.getElementById('btn-play-again')?.addEventListener('click', () => showScreen('title-screen'));
}

async function startNewRun(nuzlockeMode = false) {
  const seed = (Date.now() ^ (Math.random() * 0x100000000 | 0)) >>> 0;
  seedRng(seed);
  const savedTrainer = localStorage.getItem('poke_trainer') || null;
  state = {
    currentMap: 0, currentNode: null, team: [], items: [], badges: 0,
    map: null, eliteIndex: 0, trainer: savedTrainer || 'boy',
    starterSpeciesId: null, maxTeamSize: 1, nuzlockeMode,
    usedPokecenter: false, pickedUpItem: false, runSeed: seed,
  };
  if (savedTrainer) await showStarterSelect();
  else await showTrainerSelect();
}

async function showTrainerSelect() {
  showScreen('trainer-screen');
  const boyCard  = document.getElementById('trainer-boy');
  const girlCard = document.getElementById('trainer-girl');
  if (boyCard)  boyCard.querySelector('.trainer-icon-wrap').innerHTML  = TRAINER_SVG.boy;
  if (girlCard) girlCard.querySelector('.trainer-icon-wrap').innerHTML = TRAINER_SVG.girl;

  await new Promise(resolve => {
    function pick(gender) {
      state.trainer = gender;
      localStorage.setItem('poke_trainer', gender);
      resolve();
    }
    if (boyCard)  boyCard.onclick  = () => pick('boy');
    if (girlCard) girlCard.onclick = () => pick('girl');
  });
  await showStarterSelect();
}

// Also expose selectTrainer for onclick in HTML
function selectTrainer(gender) {
  state.trainer = gender;
  localStorage.setItem('poke_trainer', gender);
  showStarterSelect();
}

async function showStarterSelect() {
  showScreen('starter-screen');
  const container = document.getElementById('starter-choices');
  container.innerHTML = '<div class="loading">Loading starters...</div>';

  await prefetchSpecies(STARTERS.map(s => s.speciesId));
  container.innerHTML = '';

  for (const s of STARTERS) {
    const species = _statsCache[s.speciesId];
    if (!species) continue;
    const isShiny = rng() < 0.01;
    const inst = createInstance(species, 5, isShiny, 0);
    const card = renderPokeCard(inst, () => selectStarter(inst));
    container.appendChild(card);
  }
}

function selectStarter(pokemon) {
  markPokedexCaught(pokemon.speciesId, pokemon.name, pokemon.types,
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.speciesId}.png`);
  state.team = [pokemon];
  state.starterSpeciesId = pokemon.speciesId;
  state.maxTeamSize = 1;
  startMap(0);
}

// ---- Map ----
function startMap(mapIndex) {
  state.currentMap = mapIndex;
  state.map = generateMap(mapIndex, state.nuzlockeMode);
  if (mapIndex > 0) state.team.forEach(p => { p.currentHp = p.maxHp; });
  state.currentNode = state.map.nodes['n0_0'];
  showMapScreen();
}

function showMapScreen() {
  showScreen('map-screen');
  const mapInfo = document.getElementById('map-info');
  if (mapInfo) {
    const leader = GYM_LEADERS[Math.min(state.currentMap, GYM_LEADERS.length-1)];
    mapInfo.textContent = leader ? `Map ${state.currentMap+1}: vs ${leader.name}` : 'Elite Four';
  }

  // Badges
  const badgeHtml = Array.from({length:8}, (_, i) =>
    i < state.badges
      ? `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/${i+1}.png" class="badge-icon-img" title="${GYM_LEADERS[i]?.badge}">`
      : `<span class="badge-icon-empty"></span>`
  ).join('');
  ['badge-count','badge-count-panel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = badgeHtml;
  });

  renderTeamBar(state.team);
  renderItemBadges(state.items);

  const mapContainer = document.getElementById('map-container');
  mapContainer.style.backgroundImage = `url('https://pokelike.xyz/ui/map${Math.min(state.currentMap+1,3)}.png')`;
  renderMap(state.map, onNodeClick);
  saveRun();
}

// ---- Node Click ----
async function onNodeClick(node) {
  state.currentNode = node;
  saveRun();

  let type = node.type;
  if (type === NODE_TYPES.QUESTION) {
    const r = rng();
    if (r < 0.35) type = NODE_TYPES.BATTLE;
    else if (r < 0.60) type = NODE_TYPES.CATCH;
    else if (r < 0.80) type = NODE_TYPES.ITEM;
    else type = NODE_TYPES.TRAINER;
  }

  switch(type) {
    case NODE_TYPES.BATTLE:     await doBattleNode(node); break;
    case NODE_TYPES.CATCH:      await doCatchNode(node); break;
    case NODE_TYPES.ITEM:       doItemNode(node); break;
    case NODE_TYPES.BOSS:       await doBossNode(node); break;
    case NODE_TYPES.POKECENTER: doPokeCenterNode(node); break;
    case NODE_TYPES.TRAINER:    await doTrainerNode(node); break;
    default:                    await doBattleNode(node); break;
  }
}

function getLevelForNode(node) {
  const [minL, maxL] = MAP_LEVEL_RANGES[Math.min(state.currentMap, MAP_LEVEL_RANGES.length-1)];
  const t = Math.min(1, Math.max(0, (node.layer - 1) / 5));
  const base = Math.round(minL + t * (maxL - minL));
  return Math.min(maxL, Math.max(minL, base + Math.floor(rng() * 3)));
}

// ---- Node Handlers ----
async function doBattleNode(node) {
  const level = getLevelForNode(node);
  const choices = await getCatchChoices(state.currentMap);
  const species = choices[Math.floor(rng() * choices.length)];
  if (!species) { advanceFromNode(state.map, node.id); showMapScreen(); return; }
  const enemy = createInstance(species, level, false, getMoveТierForMap(state.currentMap));
  document.getElementById('battle-title').textContent = `Wild ${enemy.name} appeared!`;
  document.getElementById('battle-subtitle').textContent = `Level ${enemy.level}`;
  renderTrainerIcons(state.trainer, null, false);
  await runBattleScreen([enemy], false,
    () => { advanceFromNode(state.map, node.id); showMapScreen(); },
    () => showGameOver(), null, [], 1);
}

async function doTrainerNode(node) {
  const level = getLevelForNode(node);
  const choices = await getCatchChoices(state.currentMap);
  const count = state.currentMap === 0 ? 1 : 2;
  const enemies = choices.slice(0, count).map(sp =>
    createInstance(sp, level, false, getMoveТierForMap(state.currentMap)));
  const sprite = node.trainerSprite ? `https://pokelike.xyz/sprites/${node.trainerSprite}.png` : null;
  document.getElementById('battle-title').textContent = `Trainer wants to battle!`;
  document.getElementById('battle-subtitle').textContent = `${enemies.length} Pokémon — Lv ~${level}`;
  renderTrainerIcons(state.trainer, sprite, true);
  await runBattleScreen(enemies, false,
    () => { advanceFromNode(state.map, node.id); showMapScreen(); },
    () => showGameOver(), node.trainerSprite, [], 2);
}

async function doBossNode(node) {
  if (state.currentMap >= 8) { await doElite4(); return; }
  const leader = GYM_LEADERS[Math.min(state.currentMap, GYM_LEADERS.length-1)];
  await prefetchSpecies(leader.pokemon);
  const enemies = leader.pokemon.map((id, i) => {
    const sp = _statsCache[id];
    return sp ? createInstance(sp, leader.levels[i], false, 1) : null;
  }).filter(Boolean);
  const sprite = `https://pokelike.xyz/sprites/${leader.name.toLowerCase().replace(' ','%20')}.png`;
  document.getElementById('battle-title').textContent = `Gym Leader ${leader.name}!`;
  document.getElementById('battle-subtitle').textContent = `${leader.badge} is on the line!`;
  renderTrainerIcons(state.trainer, sprite, true);
  await runBattleScreen(enemies, true, () => {
    state.badges++;
    advanceFromNode(state.map, node.id);
    showBadgeScreen(leader);
  }, () => showGameOver(), leader.name);
}

async function doElite4() {
  const eliteTeams = [
    { name: 'Lorelei', pokemon: [87,91,80,124,131], levels: [54,55,56,58,58] },
    { name: 'Bruno',   pokemon: [95,105,62,107,68],  levels: [53,55,58,58,58] },
    { name: 'Agatha',  pokemon: [94,42,93,94,42],    levels: [54,54,56,58,58] },
    { name: 'Lance',   pokemon: [148,148,62,130,149], levels: [56,56,58,60,62] },
    { name: 'Gary',    pokemon: [18,65,112,103,59,149], levels: [61,63,61,63,63,65] },
  ];
  for (let i = state.eliteIndex; i < eliteTeams.length; i++) {
    state.eliteIndex = i;
    const boss = eliteTeams[i];
    await prefetchSpecies(boss.pokemon);
    const enemies = boss.pokemon.map((id, j) => {
      const sp = _statsCache[id];
      return sp ? createInstance(sp, boss.levels[j], false, 2) : null;
    }).filter(Boolean);
    document.getElementById('battle-title').textContent = `${i < 4 ? 'Elite Four' : 'Champion'}: ${boss.name}!`;
    document.getElementById('battle-subtitle').textContent = i === 4 ? 'Final Battle!' : `Battle ${i+1}/4`;
    const won = await new Promise(resolve => {
      runBattleScreen(enemies, true, () => resolve(true), () => resolve(false), boss.name);
    });
    if (!won) { showGameOver(); return; }
    if (i < eliteTeams.length - 1) {
      showScreen('transition-screen');
      document.getElementById('transition-msg').textContent = `${boss.name} defeated!`;
      document.getElementById('transition-sub').textContent = `Next: ${eliteTeams[i+1].name}...`;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  showWinScreen();
}

async function doCatchNode(node) {
  showScreen('catch-screen');
  renderTeamBar(state.team, document.getElementById('catch-team-bar'));
  const choicesEl = document.getElementById('catch-choices');
  choicesEl.innerHTML = '<div class="loading">Finding Pokémon...</div>';
  const level = getLevelForNode(node);
  const choices = await getCatchChoices(state.currentMap);
  const instances = choices.map(sp => createInstance(sp, level, rng() < 0.01, getMoveТierForMap(state.currentMap)));
  choicesEl.innerHTML = '';
  for (const inst of instances) {
    const card = renderPokeCard(inst, () => catchPokemon(inst, node));
    choicesEl.appendChild(card);
  }
  document.getElementById('btn-skip-catch').onclick = () => { advanceFromNode(state.map, node.id); showMapScreen(); };
}

function catchPokemon(pokemon, node) {
  markPokedexCaught(pokemon.speciesId, pokemon.name, pokemon.types,
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.speciesId}.png`);
  if (pokemon.isShiny) markShinyDexCaught(pokemon.speciesId, pokemon.name, pokemon.types, pokemon.spriteUrl);
  if (state.team.length < 6) {
    state.team.push(pokemon);
    if (state.team.length > state.maxTeamSize) state.maxTeamSize = state.team.length;
    advanceFromNode(state.map, node.id);
    showMapScreen();
  } else {
    showSwapScreen(pokemon, node);
  }
}

function showSwapScreen(newPoke, node) {
  showScreen('swap-screen');
  const incomingEl = document.getElementById('swap-incoming');
  incomingEl.innerHTML = '';
  incomingEl.style.display = 'flex';
  incomingEl.style.justifyContent = 'center';
  incomingEl.appendChild(renderPokeCard(newPoke));
  document.getElementById('swap-prompt').textContent = 'Choose a Pokémon to release:';
  const el = document.getElementById('swap-choices');
  el.innerHTML = '';
  state.team.forEach((p, i) => {
    const card = renderPokeCard(p, () => {
      if (p.heldItem) state.items.push(p.heldItem);
      state.team.splice(i, 1, newPoke);
      advanceFromNode(state.map, node.id);
      showMapScreen();
    });
    el.appendChild(card);
  });
  document.getElementById('btn-cancel-swap').onclick = () => { advanceFromNode(state.map, node.id); showMapScreen(); };
}

function doItemNode(node) {
  showScreen('item-screen');
  renderTeamBar(state.team, document.getElementById('item-team-bar'));
  const el = document.getElementById('item-choices');
  el.innerHTML = '';
  const picks = randomItems(3);
  for (const item of picks) {
    const card = renderItemCard(item, () => {
      state.pickedUpItem = true;
      const msg = item.apply(state.team, state);
      state.items.push(item);
      advanceFromNode(state.map, node.id);
      showMapScreen();
    });
    el.appendChild(card);
  }
  document.getElementById('btn-skip-item').onclick = () => { advanceFromNode(state.map, node.id); showMapScreen(); };
}

function doPokeCenterNode(node) {
  state.usedPokecenter = true;
  state.team.forEach(p => { p.currentHp = p.maxHp; });
  advanceFromNode(state.map, node.id);
  showMapScreen();
  showMapNotification('🏥 Your team was fully healed!');
}

// ---- Battle Screen ----
function runBattleScreen(enemyTeam, isBoss, onWin, onLose, enemyName = null, enemyItems = [], baseGain = 1) {
  return new Promise(async resolve => {
    showScreen('battle-screen');

    const pTeamCopy = state.team.map(p => ({ ...p }));
    const eTeamCopy = enemyTeam.map(p => ({
      ...p,
      currentHp: p.currentHp ?? calcHP(p.baseStats.hp, p.level),
      maxHp: p.maxHp ?? calcHP(p.baseStats.hp, p.level),
    }));

    renderBattleField(pTeamCopy, eTeamCopy);

    // Run battle simulation
    const result = simulateBattle(state.team, enemyTeam, state);
    const playerWon = result.playerWon;

    // Re-render with results
    renderBattleField(state.team, enemyTeam);

    // Show battle log
    const logEl = document.getElementById('battle-log');
    if (logEl) {
      logEl.innerHTML = '';
      (result.log || []).slice(-10).forEach(entry => {
        const div = document.createElement('div');
        div.className = `log-entry ${entry.type==='faint'?'log-lose':''}`;
        div.textContent = entry.msg;
        logEl.appendChild(div);
      });
      if (playerWon) {
        const win = document.createElement('div');
        win.className = 'log-win';
        win.textContent = 'Victory!';
        logEl.appendChild(win);
      }
      logEl.scrollTop = logEl.scrollHeight;
    }

    const skipBtn = document.getElementById('btn-auto-battle');
    skipBtn.style.display = 'none';
    const continueBtn = document.getElementById('btn-continue-battle');
    continueBtn.style.display = '';
    continueBtn.textContent = 'Continue';
    continueBtn.disabled = false;

    continueBtn.onclick = async () => {
      continueBtn.disabled = true;
      if (playerWon) {
        const levelUps = applyLevelGain(state.team, state.items, null, null, state.nuzlockeMode, baseGain);
        await animateLevelUp(levelUps);
        await checkAndEvolveTeam();

        // Nuzlocke: remove fainted
        if (state.nuzlockeMode) {
          state.team = state.team.filter(p => p.currentHp > 0);
          if (state.team.length === 0) { showGameOver(); resolve(false); return; }
        }
        if (onWin) onWin();
        resolve(true);
      } else {
        if (onLose) onLose();
        resolve(false);
      }
    };
  });
}

// ---- End Screens ----
function showBadgeScreen(leader) {
  showScreen('badge-screen');
  document.getElementById('badge-msg').textContent = `You earned the ${leader.badge}!`;
  document.getElementById('badge-leader').textContent = `Defeated ${leader.name}!`;
  document.getElementById('badge-count-display').textContent = `Badges: ${state.badges}/8`;
  const badgeImg = document.getElementById('badge-icon-img');
  if (badgeImg) {
    badgeImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/${state.badges}.png`;
    badgeImg.onerror = () => { badgeImg.style.display='none'; };
    badgeImg.style.display = '';
  }
  document.getElementById('btn-next-map').onclick = () => {
    if (state.currentMap >= 7) { state.eliteIndex = 0; startMap(8); }
    else startMap(state.currentMap + 1);
  };
}

function showGameOver() {
  clearSavedRun();
  showScreen('gameover-screen');
  const info = document.getElementById('gameover-info');
  if (info) {
    info.innerHTML = `Badges: ${state.badges}/8<br>${state.team.map(p=>`${p.name} Lv.${p.level}`).join(', ')}`;
  }
  document.getElementById('btn-retry').onclick = () => initGame();
}

function showWinScreen() {
  clearSavedRun();
  showScreen('win-screen');
  const winTeam = document.getElementById('win-team');
  if (winTeam) {
    winTeam.innerHTML = '';
    state.team.forEach(p => winTeam.appendChild(renderPokeCard(p)));
  }
  const wins = incrementEliteWins();
  saveHallOfFameEntry(state.team, wins, state.nuzlockeMode);
  const winsEl = document.getElementById('win-run-count');
  if (winsEl) winsEl.textContent = `Championship #${wins}`;
  document.getElementById('btn-play-again').onclick = () => startNewRun(false);
}

// ---- Boot ----
window.addEventListener('DOMContentLoaded', initGame);
