// ===== DATA.JS =====
// All static game data: Pokemon, items, moves, gym leaders, etc.

// ---- STARTERS ----
const STARTERS = [
  { speciesId: 1,  name: 'Bulbasaur',  types: ['Grass','Poison'] },
  { speciesId: 4,  name: 'Charmander', types: ['Fire'] },
  { speciesId: 7,  name: 'Squirtle',   types: ['Water'] },
  { speciesId: 25, name: 'Pikachu',    types: ['Electric'] },
  { speciesId: 133,name: 'Eevee',      types: ['Normal'] },
];

// ---- EVOLUTIONS ----
// level: evolves at this level. to: target speciesId
const EVOLUTIONS = {
  1:   { level: 16, to: 2  },
  2:   { level: 32, to: 3  },
  4:   { level: 16, to: 5  },
  5:   { level: 36, to: 6  },
  7:   { level: 16, to: 8  },
  8:   { level: 36, to: 9  },
  10:  { level: 7,  to: 11 },
  11:  { level: 10, to: 12 },
  13:  { level: 7,  to: 14 },
  14:  { level: 10, to: 15 },
  16:  { level: 18, to: 17 },
  17:  { level: 36, to: 18 },
  19:  { level: 20, to: 20 },
  21:  { level: 20, to: 22 },
  23:  { level: 22, to: 24 },
  25:  { level: 36, to: 26 },
  27:  { level: 22, to: 28 },
  29:  { level: 16, to: 30 },
  30:  { level: 36, to: 31 },
  32:  { level: 16, to: 33 },
  33:  { level: 36, to: 34 },
  35:  { level: 36, to: 36 },
  37:  { level: 29, to: 38 },
  39:  { level: 26, to: 40 },
  41:  { level: 22, to: 42 },
  43:  { level: 21, to: 44 },
  44:  { level: 21, to: 45 },
  46:  { level: 24, to: 47 },
  48:  { level: 31, to: 49 },
  50:  { level: 28, to: 51 },
  52:  { level: 28, to: 53 },
  54:  { level: 33, to: 55 },
  56:  { level: 28, to: 57 },
  58:  { level: 28, to: 59 },
  60:  { level: 25, to: 61 },
  61:  { level: 36, to: 62 },
  63:  { level: 16, to: 64 },
  64:  { level: 36, to: 65 },
  66:  { level: 28, to: 67 },
  67:  { level: 36, to: 68 },
  69:  { level: 21, to: 70 },
  70:  { level: 21, to: 71 },
  72:  { level: 30, to: 73 },
  74:  { level: 25, to: 75 },
  75:  { level: 36, to: 76 },
  77:  { level: 40, to: 78 },
  79:  { level: 37, to: 80 },
  81:  { level: 30, to: 82 },
  84:  { level: 31, to: 85 },
  86:  { level: 34, to: 87 },
  88:  { level: 38, to: 89 },
  90:  { level: 30, to: 91 },
  92:  { level: 25, to: 93 },
  93:  { level: 36, to: 94 },
  95:  { level: 28, to: 208 },
  96:  { level: 26, to: 97 },
  98:  { level: 28, to: 99 },
  100: { level: 30, to: 101 },
  102: { level: 36, to: 103 },
  104: { level: 28, to: 105 },
  108: { level: 30, to: 463 },
  109: { level: 35, to: 110 },
  111: { level: 42, to: 112 },
  116: { level: 32, to: 117 },
  117: { level: 42, to: 230 },
  118: { level: 33, to: 119 },
  120: { level: 20, to: 121 },
  123: { level: 30, to: 212 },
  127: { level: 30, to: 214 },
  128: { level: 30, to: 128 },
  129: { level: 20, to: 130 },
  133: { level: 25, to: 134, eevee: true },
  137: { level: 30, to: 233 },
  138: { level: 40, to: 139 },
  140: { level: 40, to: 141 },
  147: { level: 30, to: 148 },
  148: { level: 55, to: 149 },
};

// Eevee evolutions (random pick)
const EEVEE_EVOS = [134,135,136,196,197,470,471];

// ---- ITEMS ----
const ITEMS = [
  { id: 'potion',      name: 'Potion',       icon: '🧪', desc: 'Heals 30% HP to one Pokemon.',
    apply: (team) => { const p = team.find(p=>p.currentHp<p.maxHp); if(p){ p.currentHp=Math.min(p.maxHp,p.currentHp+Math.floor(p.maxHp*0.3)); return `${p.name} recovered HP!`; } return 'No effect.'; }},
  { id: 'xattack',     name: 'X Attack',     icon: '⚔️', desc: '+20% ATK for the whole run.',
    apply: (team,run) => { run.atkBonus=(run.atkBonus||1)*1.2; return 'Team ATK up!'; }},
  { id: 'xdefend',     name: 'X Defend',     icon: '🛡️', desc: '+20% DEF for the whole run.',
    apply: (team,run) => { run.defBonus=(run.defBonus||1)*1.2; return 'Team DEF up!'; }},
  { id: 'revive',      name: 'Revive',       icon: '💊', desc: 'Revives a fainted Pokemon at half HP.',
    apply: (team) => { const p = team.find(p=>p.currentHp<=0); if(p){ p.currentHp=Math.floor(p.maxHp/2); return `${p.name} was revived!`; } return 'No fainted Pokemon.'; }},
  { id: 'rare_candy',  name: 'Rare Candy',   icon: '🍬', desc: 'Raises one Pokemon\'s level by 2.',
    apply: (team) => { if(!team.length) return; const p=team[0]; p.level+=2; recalcStats(p); return `${p.name} grew to Lv.${p.level}!`; }},
  { id: 'full_heal',   name: 'Full Heal',    icon: '💉', desc: 'Fully heals the whole team.',
    apply: (team) => { team.forEach(p=>{p.currentHp=p.maxHp;}); return 'Team fully healed!'; }},
  { id: 'lucky_egg',   name: 'Lucky Egg',    icon: '🥚', desc: '+50% EXP gain for the whole run.',
    apply: (team,run) => { run.expBonus=(run.expBonus||1)*1.5; return 'EXP gain boosted!'; }},
  { id: 'max_potion',  name: 'Max Potion',   icon: '🫙', desc: 'Fully heals one Pokemon.',
    apply: (team) => { const p=team.find(p=>p.currentHp<p.maxHp)||team[0]; if(p){ p.currentHp=p.maxHp; return `${p.name} fully recovered!`; } return 'No effect.'; }},
  { id: 'scope_lens',  name: 'Scope Lens',   icon: '🔭', desc: '+15% crit chance for team.',
    apply: (team,run) => { run.critBonus=(run.critBonus||0)+0.15; return 'Crit chance up!'; }},
  { id: 'amulet_coin', name: 'Amulet Coin',  icon: '🪙', desc: 'Doubles badge rewards.',
    apply: (team,run) => { run.amuletCoin=true; return 'Rewards doubled!'; }},
];

// ---- GYM LEADERS / BOSSES ----
const GYM_LEADERS = [
  { name: 'Brock',    badge: 'Boulder Badge', type: 'Rock',    pokemon: [74,95], levels: [12,14] },
  { name: 'Misty',    badge: 'Cascade Badge', type: 'Water',   pokemon: [120,121], levels: [18,21] },
  { name: 'Lt. Surge',badge: 'Thunder Badge', type: 'Electric',pokemon: [100,26], levels: [21,24] },
  { name: 'Erika',    badge: 'Rainbow Badge', type: 'Grass',   pokemon: [70,71,45], levels: [24,27,29] },
  { name: 'Koga',     badge: 'Soul Badge',    type: 'Poison',  pokemon: [109,110,89], levels: [37,39,43] },
  { name: 'Sabrina',  badge: 'Marsh Badge',   type: 'Psychic', pokemon: [64,65,122], levels: [38,42,43] },
  { name: 'Blaine',   badge: 'Volcano Badge', type: 'Fire',    pokemon: [78,58,77], levels: [42,44,47] },
  { name: 'Giovanni', badge: 'Earth Badge',   type: 'Ground',  pokemon: [111,112,51], levels: [45,55,53] },
];

const ELITE_FOUR = [
  { name: 'Lorelei', pokemon: [87,91,80,124,131], levels: [54,55,56,58,58] },
  { name: 'Bruno',   pokemon: [95,105,62,107,68], levels: [53,55,58,58,58] },
  { name: 'Agatha',  pokemon: [94,42,93,94,42],   levels: [54,54,56,58,58] },
  { name: 'Lance',   pokemon: [148,148,62,130,149],levels: [56,56,58,60,62] },
];

// ---- WILD POKEMON POOLS per map ----
// Each map has a pool of possible wild pokemon
const WILD_POOLS = [
  // Map 0 (early)
  [16,19,21,39,41,43,10,13,129,23,27,29,32,46,48,60,63,66,69,72,74,77,79,81,84,86,88,90,92,96,98,100,102,104,108,109,111,116,118,120,123],
  // Map 1
  [17,20,22,40,42,44,11,14,23,24,27,28,55,56,58,57,60,61,63,64,66,67,69,70,72,73,74,75,77,79,81,84,86,88,90,92,93,96,97,98,99,100,101,106,107,109,111,114,115,116,117,118,119,120,121,123,124,125,126,127,128,130,137],
  // Map 2
  [18,25,26,45,47,12,15,24,28,31,34,36,38,53,59,62,65,68,71,73,76,78,80,82,85,87,89,91,94,97,99,101,103,105,110,112,119,121,122,124,125,126,127,128,130,131,132,134,135,136,137,138,140,142,143,144,145,146,147,148],
];

// ---- TRAINER SPRITES ----
const TRAINER_SPRITES = {
  boy:        '👦', girl:       '👧',
  Scientist:  '🧪', hiker:      '🥾',
  policeman:  '👮', fisher:     '🎣',
  aceTrainer: '🏅', oldGuy:     '👴',
  fireSpitter:'🔥', nurse:      '👩‍⚕️',
};

// ---- WILD TRAINER TEAMS (random trainers) ----
function getTrainerTeam(mapIndex, nodeLayer) {
  const pool = WILD_POOLS[Math.min(mapIndex, WILD_POOLS.length-1)];
  const count = Math.min(2 + Math.floor(nodeLayer/3), 4);
  const baseLevel = 5 + mapIndex*10 + nodeLayer*2;
  return Array.from({length: count}, () => {
    const speciesId = pool[Math.floor(Math.random()*pool.length)];
    return createPokemon(speciesId, baseLevel + Math.floor(Math.random()*4));
  });
}

// ---- BASE STATS CACHE ----
const _statsCache = {};
async function fetchBaseStats(speciesId) {
  if (_statsCache[speciesId]) return _statsCache[speciesId];
  // Check localStorage cache
  const cached = localStorage.getItem(`pkrl_poke_${speciesId}`);
  if (cached) { _statsCache[speciesId] = JSON.parse(cached); return _statsCache[speciesId]; }
  try {
    const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${speciesId}`);
    const d = await r.json();
    const stats = {};
    d.stats.forEach(s => {
      const n = s.stat.name;
      if(n==='hp') stats.hp=s.base_stat;
      else if(n==='attack') stats.atk=s.base_stat;
      else if(n==='defense') stats.def=s.base_stat;
      else if(n==='speed') stats.speed=s.base_stat;
      else if(n==='special-attack') stats.special=s.base_stat;
      else if(n==='special-defense') stats.spdef=s.base_stat;
    });
    const bst = Object.values(stats).reduce((a,b)=>a+b,0);
    const types = d.types.map(t=>t.type.name.charAt(0).toUpperCase()+t.type.name.slice(1));
    const name = d.name.charAt(0).toUpperCase()+d.name.slice(1);
    const obj = {
      id: speciesId, name, types, baseStats: stats, bst,
      spriteUrl: d.sprites.front_default,
      shinySpriteUrl: d.sprites.front_shiny,
    };
    _statsCache[speciesId] = obj;
    localStorage.setItem(`pkrl_poke_${speciesId}`, JSON.stringify(obj));
    return obj;
  } catch(e) {
    // fallback
    const fallback = { id: speciesId, name: `#${speciesId}`, types: ['Normal'],
      baseStats:{hp:50,atk:50,def:50,speed:50,special:50,spdef:50}, bst:300,
      spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`,
      shinySpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${speciesId}.png`,
    };
    _statsCache[speciesId] = fallback;
    return fallback;
  }
}

// ---- CREATE POKEMON INSTANCE ----
// Creates a live pokemon object from speciesId and level
function createPokemonFromData(data, level, isShiny=false) {
  const bs = data.baseStats;
  const hp = calcHP(bs.hp, level);
  return {
    speciesId: data.id,
    name: data.name,
    nickname: null,
    level,
    currentHp: hp,
    maxHp: hp,
    isShiny,
    types: data.types,
    baseStats: bs,
    spriteUrl: isShiny ? data.shinySpriteUrl : data.spriteUrl,
    megaStone: null,
    heldItem: null,
    moveTier: 0,
  };
}

// Sync create (uses cache only — must prefetch first)
function createPokemon(speciesId, level, isShiny=false) {
  const data = _statsCache[speciesId];
  if (!data) return null;
  return createPokemonFromData(data, level, isShiny);
}

// ---- STAT FORMULAS ----
function calcHP(baseHp, level) {
  return Math.floor((2 * baseHp * level) / 100) + level + 10;
}
function calcStat(base, level) {
  return Math.floor((2 * base * level) / 100) + 5;
}
function recalcStats(poke) {
  const bs = poke.baseStats;
  const newMax = calcHP(bs.hp, poke.level);
  const ratio = poke.currentHp / poke.maxHp;
  poke.maxHp = newMax;
  poke.currentHp = Math.max(1, Math.floor(newMax * ratio));
}

// ---- EXP FORMULA ----
function expForLevel(level) {
  return Math.floor(Math.pow(level, 3) * 0.8);
}
function expToNext(level) {
  return expForLevel(level+1) - expForLevel(level);
}

// ---- SHINY ODDS ----
const SHINY_ODDS = 1/512;
function rollShiny() { return Math.random() < SHINY_ODDS; }

// ---- RANDOM ITEMS ----
function randomItems(count=3) {
  const shuffled = [...ITEMS].sort(()=>Math.random()-0.5);
  return shuffled.slice(0, count);
}

// ---- WILD ENCOUNTER ----
async function randomWildPokemon(mapIndex, count=3) {
  const pool = WILD_POOLS[Math.min(mapIndex, WILD_POOLS.length-1)];
  const baseLevel = 5 + mapIndex * 12;
  const results = [];
  const used = new Set();
  while(results.length < count) {
    const id = pool[Math.floor(Math.random()*pool.length)];
    if(used.has(id)) continue;
    used.add(id);
    await fetchBaseStats(id);
    const level = baseLevel + Math.floor(Math.random()*8);
    const shiny = rollShiny();
    const poke = createPokemon(id, level, shiny);
    if(poke) results.push(poke);
  }
  return results;
}

// Prefetch a batch of species IDs
async function prefetchSpecies(ids) {
  await Promise.all(ids.map(id => fetchBaseStats(id)));
}
