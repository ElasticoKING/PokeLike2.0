// data.js - Pokemon data, gym leaders, items, type chart
// Source: pokelike.xyz (original by cousin)

const TYPE_CHART = {
  Normal:   { Normal:1,   Fire:1,   Water:1,   Electric:1,   Grass:1,   Ice:1,   Fighting:1,   Poison:1,   Ground:1, Flying:1,   Psychic:1,   Bug:1,   Rock:0.5, Ghost:0,   Dragon:1,   Dark:1,   Steel:0.5 },
  Fire:     { Normal:1,   Fire:0.5, Water:0.5, Electric:1,   Grass:2,   Ice:2,   Fighting:1,   Poison:1,   Ground:1, Flying:1,   Psychic:1,   Bug:2,   Rock:0.5, Ghost:1,   Dragon:0.5, Dark:1,   Steel:2   },
  Water:    { Normal:1,   Fire:2,   Water:0.5, Electric:1,   Grass:0.5, Ice:1,   Fighting:1,   Poison:1,   Ground:2, Flying:1,   Psychic:1,   Bug:1,   Rock:2,   Ghost:1,   Dragon:0.5, Dark:1,   Steel:1   },
  Electric: { Normal:1,   Fire:1,   Water:2,   Electric:0.5, Grass:0.5, Ice:1,   Fighting:1,   Poison:1,   Ground:0, Flying:2,   Psychic:1,   Bug:1,   Rock:1,   Ghost:1,   Dragon:0.5, Dark:1,   Steel:1   },
  Grass:    { Normal:1,   Fire:0.5, Water:2,   Electric:1,   Grass:0.5, Ice:1,   Fighting:1,   Poison:0.5, Ground:2, Flying:0.5, Psychic:1,   Bug:0.5, Rock:2,   Ghost:1,   Dragon:0.5, Dark:1,   Steel:0.5 },
  Ice:      { Normal:1,   Fire:0.5, Water:0.5, Electric:1,   Grass:2,   Ice:0.5, Fighting:1,   Poison:1,   Ground:2, Flying:2,   Psychic:1,   Bug:1,   Rock:1,   Ghost:1,   Dragon:2,   Dark:1,   Steel:0.5 },
  Fighting: { Normal:2,   Fire:1,   Water:1,   Electric:1,   Grass:1,   Ice:2,   Fighting:1,   Poison:0.5, Ground:1, Flying:0.5, Psychic:0.5, Bug:0.5, Rock:2,   Ghost:0,   Dragon:1,   Dark:2,   Steel:2   },
  Poison:   { Normal:1,   Fire:1,   Water:1,   Electric:1,   Grass:2,   Ice:1,   Fighting:1,   Poison:0.5, Ground:0.5, Flying:1, Psychic:1,   Bug:1,   Rock:0.5, Ghost:0.5, Dragon:1,   Dark:1,   Steel:0   },
  Ground:   { Normal:1,   Fire:2,   Water:1,   Electric:2,   Grass:0.5, Ice:1,   Fighting:1,   Poison:2,   Ground:1, Flying:0,   Psychic:1,   Bug:0.5, Rock:2,   Ghost:1,   Dragon:1,   Dark:1,   Steel:2   },
  Flying:   { Normal:1,   Fire:1,   Water:1,   Electric:0.5, Grass:2,   Ice:1,   Fighting:2,   Poison:1,   Ground:1, Flying:1,   Psychic:1,   Bug:2,   Rock:0.5, Ghost:1,   Dragon:1,   Dark:1,   Steel:0.5 },
  Psychic:  { Normal:1,   Fire:1,   Water:1,   Electric:1,   Grass:1,   Ice:1,   Fighting:2,   Poison:2,   Ground:1, Flying:1,   Psychic:0.5, Bug:1,   Rock:1,   Ghost:1,   Dragon:1,   Dark:0,   Steel:0.5 },
  Bug:      { Normal:1,   Fire:0.5, Water:1,   Electric:1,   Grass:2,   Ice:1,   Fighting:0.5, Poison:0.5, Ground:1, Flying:0.5, Psychic:2,   Bug:1,   Rock:1,   Ghost:0.5, Dragon:1,   Dark:2,   Steel:0.5 },
  Rock:     { Normal:1,   Fire:2,   Water:1,   Electric:1,   Grass:1,   Ice:2,   Fighting:0.5, Poison:1,   Ground:0.5, Flying:2, Psychic:1,   Bug:2,   Rock:1,   Ghost:1,   Dragon:1,   Dark:1,   Steel:0.5 },
  Ghost:    { Normal:0,   Fire:1,   Water:1,   Electric:1,   Grass:1,   Ice:1,   Fighting:0,   Poison:1,   Ground:1, Flying:1,   Psychic:2,   Bug:1,   Rock:1,   Ghost:2,   Dragon:1,   Dark:0.5, Steel:0.5 },
  Dragon:   { Normal:1,   Fire:1,   Water:1,   Electric:1,   Grass:1,   Ice:1,   Fighting:1,   Poison:1,   Ground:1, Flying:1,   Psychic:1,   Bug:1,   Rock:1,   Ghost:1,   Dragon:2,   Dark:1,   Steel:0.5 },
  Dark:     { Normal:1,   Fire:1,   Water:1,   Electric:1,   Grass:1,   Ice:1,   Fighting:0.5, Poison:1,   Ground:1, Flying:1,   Psychic:2,   Bug:1,   Rock:1,   Ghost:2,   Dragon:1,   Dark:0.5, Steel:0.5 },
  Steel:    { Normal:1,   Fire:0.5, Water:0.5, Electric:0.5, Grass:1,   Ice:2,   Fighting:1,   Poison:1,   Ground:1, Flying:1,   Psychic:1,   Bug:1,   Rock:2,   Ghost:1,   Dragon:1,   Dark:1,   Steel:0.5 },
};

function getTypeEffectiveness(attackType, defenderTypes) {
  let mult = 1;
  for (const dt of defenderTypes) {
    const cap = dt.charAt(0).toUpperCase() + dt.slice(1).toLowerCase();
    const atCap = attackType.charAt(0).toUpperCase() + attackType.slice(1).toLowerCase();
    if (TYPE_CHART[atCap] && TYPE_CHART[atCap][cap] !== undefined) mult *= TYPE_CHART[atCap][cap];
  }
  return mult;
}

const MOVE_POOL = {
  Normal:   { physical: [{name:'Tackle',power:40},{name:'Body Slam',power:85},{name:'Giga Impact',power:150}],
              special:  [{name:'Swift',power:60},{name:'Hyper Voice',power:90},{name:'Boomburst',power:140}] },
  Fire:     { physical: [{name:'Ember',power:60},{name:'Fire Punch',power:75},{name:'Flare Blitz',power:120}],
              special:  [{name:'Incinerate',power:60},{name:'Flamethrower',power:90},{name:'Fire Blast',power:110}] },
  Water:    { physical: [{name:'Water Gun',power:50},{name:'Waterfall',power:80},{name:'Aqua Tail',power:110}],
              special:  [{name:'Bubble',power:50},{name:'Surf',power:80},{name:'Hydro Pump',power:110}] },
  Electric: { physical: [{name:'Spark',power:40},{name:'Thunder Punch',power:75},{name:'Bolt Strike',power:130}],
              special:  [{name:'Thunder Shock',power:40},{name:'Thunderbolt',power:90},{name:'Thunder',power:110}] },
  Grass:    { physical: [{name:'Vine Whip',power:40},{name:'Razor Leaf',power:65},{name:'Power Whip',power:120}],
              special:  [{name:'Magical Leaf',power:40},{name:'Energy Ball',power:90},{name:'Solar Beam',power:120}] },
  Ice:      { physical: [{name:'Powder Snow',power:40},{name:'Ice Punch',power:75},{name:'Icicle Crash',power:110}],
              special:  [{name:'Icy Wind',power:40},{name:'Ice Beam',power:90},{name:'Blizzard',power:110}] },
  Fighting: { physical: [{name:'Karate Chop',power:50},{name:'Cross Chop',power:100},{name:'Close Combat',power:120}],
              special:  [{name:'Force Palm',power:60},{name:'Aura Sphere',power:80},{name:'Focus Blast',power:120}] },
  Poison:   { physical: [{name:'Poison Sting',power:40},{name:'Poison Jab',power:80},{name:'Gunk Shot',power:120}],
              special:  [{name:'Acid',power:40},{name:'Sludge Bomb',power:90},{name:'Acid Spray',power:110}] },
  Ground:   { physical: [{name:'Mud Shot',power:55},{name:'Earthquake',power:100},{name:'Precipice Blades',power:120}],
              special:  [{name:'Bulldoze',power:60},{name:'Earth Power',power:90},{name:'Land\'s Wrath',power:110}] },
  Flying:   { physical: [{name:'Peck',power:35},{name:'Aerial Ace',power:60},{name:'Sky Attack',power:140}],
              special:  [{name:'Gust',power:40},{name:'Air Slash',power:75},{name:'Hurricane',power:110}] },
  Psychic:  { physical: [{name:'Confusion',power:50},{name:'Zen Headbutt',power:80},{name:'Psycho Boost',power:140}],
              special:  [{name:'Psybeam',power:65},{name:'Psychic',power:90},{name:'Psystrike',power:100}] },
  Bug:      { physical: [{name:'Bug Bite',power:60},{name:'X-Scissor',power:80},{name:'Megahorn',power:120}],
              special:  [{name:'Struggle Bug',power:50},{name:'Bug Buzz',power:90},{name:'Pollen Puff',power:110}] },
  Rock:     { physical: [{name:'Rock Throw',power:50},{name:'Rock Slide',power:75},{name:'Stone Edge',power:100}],
              special:  [{name:'Smack Down',power:50},{name:'Power Gem',power:80},{name:'Rock Wrecker',power:150}] },
  Ghost:    { physical: [{name:'Astonish',power:40},{name:'Shadow Claw',power:70},{name:'Phantom Force',power:90}],
              special:  [{name:'Lick',power:40},{name:'Shadow Ball',power:80},{name:'Shadow Force',power:120}] },
  Dragon:   { physical: [{name:'Twister',power:40},{name:'Dragon Claw',power:80},{name:'Outrage',power:120}],
              special:  [{name:'Dragon Breath',power:60},{name:'Dragon Pulse',power:85},{name:'Draco Meteor',power:130}] },
  Dark:     { physical: [{name:'Bite',power:60},{name:'Crunch',power:80},{name:'Knock Off',power:120}],
              special:  [{name:'Snarl',power:55},{name:'Dark Pulse',power:80},{name:'Night Daze',power:110}] },
  Steel:    { physical: [{name:'Metal Claw',power:50},{name:'Iron Tail',power:100},{name:'Heavy Slam',power:130}],
              special:  [{name:'Steel Wing',power:60},{name:'Flash Cannon',power:90},{name:'Doom Desire',power:140}] },
};

function getMoveТierForMap(mapIndex) { return mapIndex <= 2 ? 0 : 1; }

function getBestMove(types, baseStats, speciesId, moveTier = 1) {
  if (speciesId === 129) return { name:'Splash',   power:0, type:'Normal', isSpecial:false, noDamage:true };
  if (speciesId === 63)  return { name:'Teleport', power:0, type:'Normal', isSpecial:false, noDamage:true };
  const isSpecial = (baseStats?.special || 0) >= (baseStats?.atk || 0);
  const tier = Math.max(0, Math.min(2, moveTier ?? 1));
  if ([74,75,76,95].includes(speciesId)) {
    const move = MOVE_POOL['Rock'][isSpecial ? 'special' : 'physical'][tier];
    return { ...move, type:'Rock', isSpecial };
  }
  for (const t of types) {
    if (t.toLowerCase() === 'normal' && types.length > 1) continue;
    const cap = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    if (MOVE_POOL[cap]) {
      const move = isSpecial ? MOVE_POOL[cap].special[tier] : MOVE_POOL[cap].physical[tier];
      return { ...move, type: cap, isSpecial };
    }
  }
  return { name:'Tackle', power:40, type:'Normal', isSpecial:false };
}

const GYM_LEADERS = [
  { name:'Brock',     badge:'Boulder Badge', type:'Rock',     moveTier:0,
    pokemon:[74,95], levels:[12,14],
    team:[{speciesId:74,name:'Geodude',types:['Rock','Ground'],baseStats:{hp:40,atk:80,def:100,speed:20,special:30},level:12},{speciesId:95,name:'Onix',types:['Rock','Ground'],baseStats:{hp:35,atk:45,def:160,speed:70,special:30},level:14}] },
  { name:'Misty',     badge:'Cascade Badge', type:'Water',    moveTier:0,
    pokemon:[120,121], levels:[18,20],
    team:[{speciesId:120,name:'Staryu',types:['Water'],baseStats:{hp:30,atk:45,def:55,speed:85,special:70},level:18},{speciesId:121,name:'Starmie',types:['Water','Psychic'],baseStats:{hp:60,atk:75,def:85,speed:115,special:100},level:20}] },
  { name:'Lt. Surge', badge:'Thunder Badge', type:'Electric', moveTier:1,
    pokemon:[25,100,26], levels:[20,23,26],
    team:[{speciesId:25,name:'Pikachu',types:['Electric'],baseStats:{hp:35,atk:55,def:40,speed:90,special:50},level:20,heldItem:{id:'eviolite',name:'Eviolite',icon:'💎'}},{speciesId:100,name:'Voltorb',types:['Electric'],baseStats:{hp:40,atk:30,def:50,speed:100,special:55},level:23,heldItem:{id:'magnet',name:'Magnet',icon:'🧲'}},{speciesId:26,name:'Raichu',types:['Electric'],baseStats:{hp:60,atk:90,def:55,speed:110,special:90},level:26,heldItem:{id:'life_orb',name:'Life Orb',icon:'🔮'}}] },
  { name:'Erika',     badge:'Rainbow Badge', type:'Grass',    moveTier:1,
    pokemon:[114,71,45], levels:[26,31,32],
    team:[{speciesId:114,name:'Tangela',types:['Grass'],baseStats:{hp:65,atk:55,def:115,speed:60,special:100},level:26,heldItem:{id:'leftovers',name:'Leftovers',icon:'🍃'}},{speciesId:71,name:'Victreebel',types:['Grass','Poison'],baseStats:{hp:80,atk:105,def:65,speed:70,special:100},level:31,heldItem:{id:'poison_barb',name:'Poison Barb',icon:'☠️'}},{speciesId:45,name:'Vileplume',types:['Grass','Poison'],baseStats:{hp:75,atk:80,def:85,speed:50,special:110},level:32,heldItem:{id:'miracle_seed',name:'Miracle Seed',icon:'🌱'}}] },
  { name:'Koga',      badge:'Soul Badge',    type:'Poison',   moveTier:1,
    pokemon:[109,109,89,110], levels:[38,38,40,44],
    team:[{speciesId:109,name:'Koffing',types:['Poison'],baseStats:{hp:40,atk:65,def:95,speed:35,special:60},level:38,heldItem:{id:'rocky_helmet',name:'Rocky Helmet',icon:'⛑️'}},{speciesId:109,name:'Koffing',types:['Poison'],baseStats:{hp:40,atk:65,def:95,speed:35,special:60},level:38,heldItem:{id:'rocky_helmet',name:'Rocky Helmet',icon:'⛑️'}},{speciesId:89,name:'Muk',types:['Poison'],baseStats:{hp:105,atk:105,def:75,speed:50,special:65},level:40,heldItem:{id:'poison_barb',name:'Poison Barb',icon:'☠️'}},{speciesId:110,name:'Weezing',types:['Poison'],baseStats:{hp:65,atk:90,def:120,speed:60,special:85},level:44,heldItem:{id:'leftovers',name:'Leftovers',icon:'🍃'}}] },
  { name:'Sabrina',   badge:'Marsh Badge',   type:'Psychic',  moveTier:1,
    pokemon:[122,49,64,65], levels:[40,41,42,44],
    team:[{speciesId:122,name:'Mr. Mime',types:['Psychic'],baseStats:{hp:40,atk:45,def:65,speed:90,special:100},level:40,heldItem:{id:'twisted_spoon',name:'Twisted Spoon',icon:'🥄'}},{speciesId:49,name:'Venomoth',types:['Bug','Poison'],baseStats:{hp:70,atk:65,def:60,speed:90,special:90},level:41,heldItem:{id:'silver_powder',name:'Silver Powder',icon:'🐛'}},{speciesId:64,name:'Kadabra',types:['Psychic'],baseStats:{hp:40,atk:35,def:30,speed:105,special:120},level:42,heldItem:{id:'eviolite',name:'Eviolite',icon:'💎'}},{speciesId:65,name:'Alakazam',types:['Psychic'],baseStats:{hp:55,atk:50,def:45,speed:120,special:135},level:44,heldItem:{id:'scope_lens',name:'Scope Lens',icon:'🔭'}}] },
  { name:'Blaine',    badge:'Volcano Badge', type:'Fire',     moveTier:2,
    pokemon:[77,58,78,59], levels:[47,47,48,53],
    team:[{speciesId:77,name:'Ponyta',types:['Fire'],baseStats:{hp:50,atk:85,def:55,speed:90,special:65},level:47,heldItem:{id:'charcoal',name:'Charcoal',icon:'🔥'}},{speciesId:58,name:'Growlithe',types:['Fire'],baseStats:{hp:55,atk:70,def:45,speed:60,special:50},level:47,heldItem:{id:'eviolite',name:'Eviolite',icon:'💎'}},{speciesId:78,name:'Rapidash',types:['Fire'],baseStats:{hp:65,atk:100,def:70,speed:105,special:80},level:48,heldItem:{id:'charcoal',name:'Charcoal',icon:'🔥'}},{speciesId:59,name:'Arcanine',types:['Fire'],baseStats:{hp:90,atk:110,def:80,speed:95,special:100},level:53,heldItem:{id:'life_orb',name:'Life Orb',icon:'🔮'}}] },
  { name:'Giovanni',  badge:'Earth Badge',   type:'Ground',   moveTier:2,
    pokemon:[51,31,34,111,112], levels:[55,53,54,56,60],
    team:[{speciesId:51,name:'Dugtrio',types:['Ground'],baseStats:{hp:35,atk:100,def:50,speed:120,special:50},level:55,heldItem:{id:'soft_sand',name:'Soft Sand',icon:'🏖️'}},{speciesId:31,name:'Nidoqueen',types:['Poison','Ground'],baseStats:{hp:90,atk:82,def:87,speed:76,special:75},level:53,heldItem:{id:'poison_barb',name:'Poison Barb',icon:'☠️'}},{speciesId:34,name:'Nidoking',types:['Poison','Ground'],baseStats:{hp:81,atk:92,def:77,speed:85,special:75},level:54,heldItem:{id:'soft_sand',name:'Soft Sand',icon:'🏖️'}},{speciesId:111,name:'Rhyhorn',types:['Ground','Rock'],baseStats:{hp:80,atk:85,def:95,speed:25,special:30},level:56,heldItem:{id:'hard_stone',name:'Hard Stone',icon:'🪨'}},{speciesId:112,name:'Rhydon',types:['Ground','Rock'],baseStats:{hp:105,atk:130,def:120,speed:40,special:45},level:60,heldItem:{id:'rocky_helmet',name:'Rocky Helmet',icon:'⛑️'}}] },
];

const ELITE_4 = [
  { name:'Lorelei', title:'Elite Four', type:'Ice',
    team:[{speciesId:87,name:'Dewgong',types:['Water','Ice'],baseStats:{hp:90,atk:70,def:80,speed:70,special:95},level:54,heldItem:{id:'mystic_water',name:'Mystic Water',icon:'💧'}},{speciesId:91,name:'Cloyster',types:['Water','Ice'],baseStats:{hp:50,atk:95,def:180,speed:70,special:85},level:53,heldItem:{id:'rocky_helmet',name:'Rocky Helmet',icon:'⛑️'}},{speciesId:80,name:'Slowbro',types:['Water','Psychic'],baseStats:{hp:95,atk:75,def:110,speed:30,special:100},level:54,heldItem:{id:'leftovers',name:'Leftovers',icon:'🍃'}},{speciesId:124,name:'Jynx',types:['Ice','Psychic'],baseStats:{hp:65,atk:50,def:35,speed:95,special:95},level:56,heldItem:{id:'wise_glasses',name:'Wise Glasses',icon:'🔬'}},{speciesId:131,name:'Lapras',types:['Water','Ice'],baseStats:{hp:130,atk:85,def:80,speed:60,special:95},level:56,heldItem:{id:'shell_bell',name:'Shell Bell',icon:'🐚'}}] },
  { name:'Bruno',   title:'Elite Four', type:'Fighting',
    team:[{speciesId:95,name:'Onix',types:['Rock','Ground'],baseStats:{hp:35,atk:45,def:160,speed:70,special:30},level:53,heldItem:{id:'rocky_helmet',name:'Rocky Helmet',icon:'⛑️'}},{speciesId:107,name:'Hitmonchan',types:['Fighting'],baseStats:{hp:50,atk:105,def:79,speed:76,special:35},level:55,heldItem:{id:'black_belt',name:'Black Belt',icon:'🥋'}},{speciesId:106,name:'Hitmonlee',types:['Fighting'],baseStats:{hp:50,atk:120,def:53,speed:87,special:35},level:55,heldItem:{id:'muscle_band',name:'Muscle Band',icon:'💪'}},{speciesId:95,name:'Onix',types:['Rock','Ground'],baseStats:{hp:35,atk:45,def:160,speed:70,special:30},level:54,heldItem:{id:'hard_stone',name:'Hard Stone',icon:'🪨'}},{speciesId:68,name:'Machamp',types:['Fighting'],baseStats:{hp:90,atk:130,def:80,speed:55,special:65},level:58,heldItem:{id:'choice_band',name:'Choice Band',icon:'🎀'}}] },
  { name:'Agatha',  title:'Elite Four', type:'Ghost',
    team:[{speciesId:94,name:'Gengar',types:['Ghost','Poison'],baseStats:{hp:60,atk:65,def:60,speed:110,special:130},level:54,heldItem:{id:'spell_tag',name:'Spell Tag',icon:'👻'}},{speciesId:42,name:'Golbat',types:['Poison','Flying'],baseStats:{hp:75,atk:80,def:70,speed:90,special:75},level:54,heldItem:{id:'poison_barb',name:'Poison Barb',icon:'☠️'}},{speciesId:93,name:'Haunter',types:['Ghost','Poison'],baseStats:{hp:45,atk:50,def:45,speed:95,special:115},level:56,heldItem:{id:'life_orb',name:'Life Orb',icon:'🔮'}},{speciesId:42,name:'Golbat',types:['Poison','Flying'],baseStats:{hp:75,atk:80,def:70,speed:90,special:75},level:56,heldItem:{id:'sharp_beak',name:'Sharp Beak',icon:'🦅'}},{speciesId:94,name:'Gengar',types:['Ghost','Poison'],baseStats:{hp:60,atk:65,def:60,speed:110,special:130},level:58,heldItem:{id:'scope_lens',name:'Scope Lens',icon:'🔭'}}] },
  { name:'Lance',   title:'Elite Four', type:'Dragon',
    team:[{speciesId:130,name:'Gyarados',types:['Water','Flying'],baseStats:{hp:95,atk:125,def:79,speed:81,special:100},level:56,heldItem:{id:'mystic_water',name:'Mystic Water',icon:'💧'}},{speciesId:149,name:'Dragonite',types:['Dragon','Flying'],baseStats:{hp:91,atk:134,def:95,speed:80,special:100},level:56,heldItem:{id:'dragon_fang',name:'Dragon Fang',icon:'🐉'}},{speciesId:148,name:'Dragonair',types:['Dragon'],baseStats:{hp:61,atk:84,def:65,speed:70,special:70},level:58,heldItem:{id:'eviolite',name:'Eviolite',icon:'💎'}},{speciesId:148,name:'Dragonair',types:['Dragon'],baseStats:{hp:61,atk:84,def:65,speed:70,special:70},level:60,heldItem:{id:'dragon_fang',name:'Dragon Fang',icon:'🐉'}},{speciesId:149,name:'Dragonite',types:['Dragon','Flying'],baseStats:{hp:91,atk:134,def:95,speed:80,special:100},level:62,heldItem:{id:'choice_band',name:'Choice Band',icon:'🎀'}}] },
  { name:'Gary',    title:'Champion', type:'Mixed',
    team:[{speciesId:18,name:'Pidgeot',types:['Normal','Flying'],baseStats:{hp:83,atk:80,def:75,speed:101,special:70},level:61,heldItem:{id:'sharp_beak',name:'Sharp Beak',icon:'🦅'}},{speciesId:65,name:'Alakazam',types:['Psychic'],baseStats:{hp:55,atk:50,def:45,speed:120,special:135},level:59,heldItem:{id:'twisted_spoon',name:'Twisted Spoon',icon:'🥄'}},{speciesId:112,name:'Rhydon',types:['Ground','Rock'],baseStats:{hp:105,atk:130,def:120,speed:40,special:45},level:61,heldItem:{id:'soft_sand',name:'Soft Sand',icon:'🏖️'}},{speciesId:103,name:'Exeggutor',types:['Grass','Psychic'],baseStats:{hp:95,atk:95,def:85,speed:55,special:125},level:61,heldItem:{id:'miracle_seed',name:'Miracle Seed',icon:'🌱'}},{speciesId:6,name:'Charizard',types:['Fire','Flying'],baseStats:{hp:78,atk:84,def:78,speed:100,special:109},level:65,heldItem:{id:'charcoal',name:'Charcoal',icon:'🔥'}}] },
];

const ITEM_POOL = [
  { id:'lucky_egg',    name:'Lucky Egg',    desc:'Holder gains +1 extra level after every battle', icon:'🥚', minMap:4 },
  { id:'life_orb',     name:'Life Orb',     desc:'+30% damage; holder loses 10% max HP per hit',    icon:'🔮' },
  { id:'choice_band',  name:'Choice Band',  desc:'+40% physical damage, -20% DEF',                  icon:'🎀' },
  { id:'choice_specs', name:'Choice Specs', desc:'+40% special damage, -20% Sp.Def',                icon:'👓' },
  { id:'scope_lens',   name:'Scope Lens',   desc:'20% crit chance (+50% damage on crit)',            icon:'🔭' },
  { id:'rocky_helmet', name:'Rocky Helmet', desc:'Attacker takes 12% of their max HP on each hit',  icon:'⛑️' },
  { id:'shell_bell',   name:'Shell Bell',   desc:'Heal 25% of damage dealt',                         icon:'🐚' },
  { id:'eviolite',     name:'Eviolite',     desc:'+50% DEF & Sp.Def if holder is not fully evolved', icon:'💎' },
  { id:'leftovers',    name:'Leftovers',    desc:'Restore 1/16 max HP each round',                   icon:'🍃' },
  { id:'expert_belt',  name:'Expert Belt',  desc:'+30% damage on super effective hits',              icon:'🥊' },
  { id:'focus_sash',   name:'Focus Sash',   desc:'If at full HP, guaranteed to survive any hit with 1 HP', icon:'🎗️' },
  { id:'charcoal',     name:'Charcoal',     desc:'+50% Fire move damage',                            icon:'🔥' },
  { id:'mystic_water', name:'Mystic Water', desc:'+50% Water move damage',                           icon:'💧' },
  { id:'miracle_seed', name:'Miracle Seed', desc:'+50% Grass move damage',                           icon:'🌱' },
  { id:'magnet',       name:'Magnet',       desc:'+50% Electric move damage',                        icon:'🧲', minMap:2 },
  { id:'twisted_spoon',name:'Twisted Spoon',desc:'+50% Psychic move damage',                         icon:'🥄', minMap:3 },
  { id:'dragon_fang',  name:'Dragon Fang',  desc:'+50% Dragon move damage',                          icon:'🐉', minMap:5 },
  { id:'sharp_beak',   name:'Sharp Beak',   desc:'+50% Flying move damage',                          icon:'🦅' },
  { id:'black_belt',   name:'Black Belt',   desc:'+50% Fighting move damage',                        icon:'🥋' },
  { id:'spell_tag',    name:'Spell Tag',    desc:'+50% Ghost move damage',                            icon:'👻', minMap:3 },
  { id:'poison_barb',  name:'Poison Barb',  desc:'+50% Poison move damage',                          icon:'☠️' },
  { id:'silk_scarf',   name:'Silk Scarf',   desc:'+50% Normal move damage',                          icon:'🤍' },
  { id:'wide_lens',    name:'Wide Lens',    desc:'+20% damage on all moves',                          icon:'🔎' },
];

const USABLE_ITEM_POOL = [
  { id:'max_revive', name:'Max Revive',  desc:'Fully revives a fainted Pokémon',             icon:'💊', usable:true },
  { id:'rare_candy', name:'Rare Candy',  desc:'Gives a Pokémon +3 levels',                  icon:'🍬', usable:true },
  { id:'moon_stone', name:'Moon Stone',  desc:'Force evolves a Pokémon regardless of level', icon:'🌙', usable:true },
];

// BST ranges per map
const MAP_BST_RANGES = [
  { min:200, max:310 }, { min:280, max:360 }, { min:340, max:420 }, { min:340, max:420 },
  { min:400, max:480 }, { min:400, max:480 }, { min:460, max:530 }, { min:460, max:530 }, { min:530, max:999 },
];

const MAP_LEVEL_RANGES = [
  [1,5],[8,15],[14,21],[21,29],[29,37],[37,43],[43,47],[47,52],[53,64]
];

const GEN1_BST_APPROX = {
  low:     [10,11,13,14,16,17,19,20,21,23,27,29,32,41,46,48,52,54,56,60,69,72,74,79,81,84,86,96,98,100,102,108,111,116,118,120,129,133],
  midLow:  [25,30,33,35,37,39,43,50,58,61,63,66,73,77,83,92,95,104,109,113,114,116,120,122,126,127,128,138,140],
  mid:     [26,36,42,49,51,64,67,70,75,82,85,93,97,101,103,105,107,110,119,121,124,125,130,137,139,141],
  midHigh: [40,44,55,62,76,80,87,88,89,90,91,99,106,115,117,123,131,132,137,142,143],
  high:    [3,6,9,12,15,18,22,24,28,31,34,38,45,47,53,57,59,65,68,71,76,78,80,89,94,112,121,130,142,143,149],
  veryHigh:[6,9,65,68,94,112,130,131,143,147,148,149],
};

const LEGENDARY_IDS = [144,145,146,150,151];
const ALL_CATCHABLE_IDS = new Set(Array.from({length:151},(_,i)=>i+1));

// Cache helpers
function getCached(key) { try { const v=localStorage.getItem(key); return v?JSON.parse(v):null; } catch{return null;} }
function setCached(key,value) { try{localStorage.setItem(key,JSON.stringify(value));}catch{} }

async function fetchPokemonById(id) {
  const key = `pkrl_poke_${id}`;
  const cached = getCached(key);
  if (cached && cached.baseStats?.special !== undefined) return cached;
  try {
    const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const d = await r.json();
    const baseStats = {
      hp:      d.stats.find(s=>s.stat.name==='hp')?.base_stat||45,
      atk:     d.stats.find(s=>s.stat.name==='attack')?.base_stat||50,
      def:     d.stats.find(s=>s.stat.name==='defense')?.base_stat||50,
      speed:   d.stats.find(s=>s.stat.name==='speed')?.base_stat||50,
      special: d.stats.find(s=>s.stat.name==='special-attack')?.base_stat||50,
      spdef:   d.stats.find(s=>s.stat.name==='special-defense')?.base_stat||50,
    };
    const bst = Object.values(baseStats).reduce((a,b)=>a+b,0);
    const types = d.types.map(t=>t.type.name.charAt(0).toUpperCase()+t.type.name.slice(1));
    const poke = {
      id:d.id, name:d.name.charAt(0).toUpperCase()+d.name.slice(1),
      types, baseStats, bst,
      spriteUrl:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${d.id}.png`,
      shinySpriteUrl:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${d.id}.png`,
    };
    setCached(key,poke);
    return poke;
  } catch(e) { console.warn(`Failed to fetch pokemon ${id}`,e); return null; }
}

let _speciesListCache = null;
async function getSpeciesPool() {
  if (_speciesListCache) return _speciesListCache;
  try {
    const r = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
    const d = await r.json();
    _speciesListCache = d.results.map((p,i)=>({name:p.name,id:i+1}));
    return _speciesListCache;
  } catch { return null; }
}

async function getCatchChoices(mapIndex) {
  const range = MAP_BST_RANGES[Math.min(mapIndex, MAP_BST_RANGES.length-1)];
  let bucket;
  if (range.min >= 530) bucket = GEN1_BST_APPROX.veryHigh;
  else if (range.min >= 460) bucket = GEN1_BST_APPROX.high;
  else if (range.min >= 400) bucket = GEN1_BST_APPROX.midHigh;
  else if (range.min >= 340) bucket = GEN1_BST_APPROX.mid;
  else if (range.min >= 280) bucket = GEN1_BST_APPROX.midLow;
  else bucket = GEN1_BST_APPROX.low;
  const filtered = bucket.filter(id => !LEGENDARY_IDS.includes(id));
  const shuffled = [...filtered].sort(() => (typeof rng==='function'?rng():Math.random())-0.5);
  const ids = shuffled.slice(0,3);
  const results = await Promise.all(ids.map(id=>fetchPokemonById(id)));
  return results.filter(Boolean);
}

function calcHp(baseHp, level) { return Math.floor(baseHp*level/50)+level+10; }
// Alias for our battle.js
function calcHP(baseHp, level) { return calcHp(baseHp, level); }
function calcStat(base, level) { return Math.floor(base*level/50)+5; }
function recalcStats(poke) {
  const newMax = calcHp(poke.baseStats.hp, poke.level);
  const ratio = poke.currentHp/poke.maxHp;
  poke.maxHp = newMax;
  poke.currentHp = Math.max(1, Math.floor(newMax*ratio));
}

function createInstance(species, level, isShiny=false, moveTier=1) {
  const lvl = level||5;
  const maxHp = calcHp(species.baseStats.hp, lvl);
  const id = species.id??species.speciesId;
  const spriteUrl = isShiny
    ? (species.shinySpriteUrl||`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`)
    : (species.spriteUrl||`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`);
  return { speciesId:id, name:species.name, nickname:null, level:lvl, currentHp:maxHp, maxHp, isShiny, types:species.types, baseStats:species.baseStats, spriteUrl, heldItem:null, moveTier:Math.max(0,Math.min(2,moveTier??1)) };
}

const STARTER_IDS = [1,4,7];

// Also expose as STARTERS array for compatibility
const STARTERS = [
  {speciesId:1,  name:'Bulbasaur',  types:['Grass','Poison']},
  {speciesId:4,  name:'Charmander', types:['Fire']},
  {speciesId:7,  name:'Squirtle',   types:['Water']},
];

const TRAINER_SVG = {
  boy:  `<img src="https://play.pokemonshowdown.com/sprites/trainers/red.png"  alt="Red"  class="trainer-sprite-img" onerror="this.style.opacity='.3'">`,
  girl: `<img src="https://play.pokemonshowdown.com/sprites/trainers/dawn.png" alt="Dawn" class="trainer-sprite-img" onerror="this.style.opacity='.3'">`,
};

const SHOWDOWN_NAME_MAP = {'gary':'blue','lt. surge':'ltsurge','lorelei':'lorelei-gen3','agatha':'agatha-gen3'};
function getTrainerImgHtml(trainerName) {
  if (trainerName.includes('/')) return `<img src="${trainerName}" alt="Trainer" class="trainer-sprite-img" onerror="this.style.opacity='.3'">`;
  const key = trainerName.toLowerCase();
  const slug = SHOWDOWN_NAME_MAP[key]||key.replace(/[.']/g,'').replace(/\s+/g,'-');
  return `<img src="https://play.pokemonshowdown.com/sprites/trainers/${slug}.png" alt="${trainerName}" class="trainer-sprite-img" onerror="this.src='https://play.pokemonshowdown.com/sprites/trainers/youngster.png';this.onerror=null">`;
}

const GEN1_EVOLUTIONS = {
  1:{into:2,level:16,name:'Ivysaur'},2:{into:3,level:32,name:'Venusaur'},
  4:{into:5,level:16,name:'Charmeleon'},5:{into:6,level:36,name:'Charizard'},
  7:{into:8,level:16,name:'Wartortle'},8:{into:9,level:36,name:'Blastoise'},
  10:{into:11,level:7,name:'Metapod'},11:{into:12,level:10,name:'Butterfree'},
  13:{into:14,level:7,name:'Kakuna'},14:{into:15,level:10,name:'Beedrill'},
  16:{into:17,level:18,name:'Pidgeotto'},17:{into:18,level:36,name:'Pidgeot'},
  19:{into:20,level:20,name:'Raticate'},21:{into:22,level:20,name:'Fearow'},
  23:{into:24,level:22,name:'Arbok'},27:{into:28,level:22,name:'Sandslash'},
  29:{into:30,level:16,name:'Nidorina'},30:{into:31,level:36,name:'Nidoqueen'},
  32:{into:33,level:16,name:'Nidorino'},33:{into:34,level:36,name:'Nidoking'},
  35:{into:36,level:36,name:'Clefable'},37:{into:38,level:32,name:'Ninetales'},
  39:{into:40,level:36,name:'Wigglytuff'},41:{into:42,level:22,name:'Golbat'},
  43:{into:44,level:21,name:'Gloom'},44:{into:45,level:36,name:'Vileplume'},
  46:{into:47,level:24,name:'Parasect'},48:{into:49,level:31,name:'Venomoth'},
  50:{into:51,level:26,name:'Dugtrio'},52:{into:53,level:28,name:'Persian'},
  54:{into:55,level:33,name:'Golduck'},56:{into:57,level:28,name:'Primeape'},
  58:{into:59,level:34,name:'Arcanine'},60:{into:61,level:25,name:'Poliwhirl'},
  61:{into:62,level:40,name:'Poliwrath'},63:{into:64,level:16,name:'Kadabra'},
  64:{into:65,level:36,name:'Alakazam'},66:{into:67,level:28,name:'Machoke'},
  67:{into:68,level:40,name:'Machamp'},69:{into:70,level:21,name:'Weepinbell'},
  70:{into:71,level:36,name:'Victreebel'},72:{into:73,level:30,name:'Tentacruel'},
  74:{into:75,level:25,name:'Graveler'},75:{into:76,level:40,name:'Golem'},
  77:{into:78,level:40,name:'Rapidash'},79:{into:80,level:37,name:'Slowbro'},
  81:{into:82,level:30,name:'Magneton'},84:{into:85,level:31,name:'Dodrio'},
  86:{into:87,level:34,name:'Dewgong'},88:{into:89,level:38,name:'Muk'},
  90:{into:91,level:36,name:'Cloyster'},92:{into:93,level:25,name:'Haunter'},
  93:{into:94,level:38,name:'Gengar'},96:{into:97,level:26,name:'Hypno'},
  98:{into:99,level:28,name:'Kingler'},100:{into:101,level:30,name:'Electrode'},
  102:{into:103,level:36,name:'Exeggutor'},104:{into:105,level:28,name:'Marowak'},
  109:{into:110,level:35,name:'Weezing'},111:{into:112,level:42,name:'Rhydon'},
  116:{into:117,level:32,name:'Seadra'},118:{into:119,level:33,name:'Seaking'},
  120:{into:121,level:36,name:'Starmie'},129:{into:130,level:20,name:'Gyarados'},
  138:{into:139,level:40,name:'Omastar'},140:{into:141,level:40,name:'Kabutops'},
  147:{into:148,level:30,name:'Dragonair'},148:{into:149,level:55,name:'Dragonite'},
};

const EEVEE_EVOLUTIONS = [
  {into:136,level:36,name:'Flareon', types:['Fire']},
  {into:134,level:36,name:'Vaporeon',types:['Water']},
  {into:135,level:36,name:'Jolteon', types:['Electric']},
];

function minLevelForSpecies(speciesId) {
  for (const evo of Object.values(GEN1_EVOLUTIONS)) { if(evo.into===speciesId) return evo.level; }
  return 1;
}
function canEvolve(speciesId) { return speciesId in GEN1_EVOLUTIONS||speciesId===133; }

// ---- Battle System ----
function simulateBattle(playerTeam, enemyTeam, runState={}) {
  const pTeam = playerTeam.map(p=>({...p,baseStats:{...p.baseStats}}));
  const eTeam = enemyTeam.map(p=>({
    ...p, baseStats:{...p.baseStats},
    currentHp: p.currentHp??calcHp(p.baseStats.hp,p.level),
    maxHp: p.maxHp??calcHp(p.baseStats.hp,p.level),
  }));
  const log = [];
  const alive = arr => arr.filter(p=>p.currentHp>0);
  let turn = 0;
  while(alive(pTeam).length>0 && alive(eTeam).length>0 && turn<300) {
    turn++;
    const pFront = alive(pTeam)[0];
    const eFront = alive(eTeam)[0];
    const pSpd = calcStat(pFront.baseStats.speed, pFront.level);
    const eSpd = calcStat(eFront.baseStats.speed, eFront.level);
    const first  = pSpd>=eSpd ? pFront : eFront;
    const second = pSpd>=eSpd ? eFront : pFront;
    const fDef   = pSpd>=eSpd ? eFront : pFront;
    const sDef   = pSpd>=eSpd ? pFront : eFront;

    const attack = (atk, def, isPlayer) => {
      if(atk.currentHp<=0||def.currentHp<=0) return;
      const move = getBestMove(atk.types, atk.baseStats, atk.speciesId, atk.moveTier||0);
      if(move.noDamage) { log.push({msg:`${atk.name} used ${move.name}!`,type:'info'}); return; }
      const isSpecial = move.isSpecial;
      const atkStat = calcStat(isSpecial?atk.baseStats.special:atk.baseStats.atk, atk.level);
      const defStat = calcStat(isSpecial?def.baseStats.spdef||def.baseStats.special:def.baseStats.def, def.level);
      const eff = getTypeEffectiveness(move.type, def.types);
      const stab = atk.types.includes(move.type)?1.5:1;
      const crit = Math.random()<0.0625?1.5:1;
      const variance = 0.85+Math.random()*0.15;
      const dmg = Math.max(1, Math.floor(((2*atk.level/5+2)*move.power*atkStat/defStat/50+2)*stab*eff*crit*variance));
      def.currentHp = Math.max(0, def.currentHp-dmg);
      let msg = `${atk.name} → ${def.name}: ${dmg} dmg`;
      if(eff>1) msg+=' (super eff!)';
      if(eff<1&&eff>0) msg+=' (not very eff)';
      if(crit>1) msg+=' CRIT!';
      log.push({msg, type: isPlayer?'player':'enemy'});
      if(def.currentHp<=0) log.push({msg:`${def.name} fainted!`,type:'faint'});
    };

    attack(first,  fDef,  pTeam.includes(first));
    attack(second, sDef,  pTeam.includes(second));
  }
  const playerWon = alive(eTeam).length===0;
  playerTeam.forEach((p,i)=>{ p.currentHp=Math.max(0,pTeam[i].currentHp); });
  return { playerWon, log };
}

// ---- Pokedex ----
function getPokedex() { try{return JSON.parse(localStorage.getItem('poke_dex')||'{}');}catch{return {};} }
function markPokedexCaught(id,name,types,spriteUrl) {
  if(!id) return;
  const dex=getPokedex();
  dex[id]={...(dex[id]||{}),id,caught:true,name:name||dex[id]?.name,types:types||dex[id]?.types,spriteUrl:spriteUrl||dex[id]?.spriteUrl};
  localStorage.setItem('poke_dex',JSON.stringify(dex));
}
function getShinyDex() { try{return JSON.parse(localStorage.getItem('poke_shiny_dex')||'{}');}catch{return {};} }
function markShinyDexCaught(id,name,types,shinySpriteUrl) {
  if(!id) return;
  const dex=getShinyDex();
  dex[id]={id,name,types,shinySpriteUrl};
  localStorage.setItem('poke_shiny_dex',JSON.stringify(dex));
}
function isPokedexComplete() {
  const dex=getPokedex();
  const caught=new Set(Object.values(dex).filter(e=>e.caught).map(e=>e.id));
  for(const id of ALL_CATCHABLE_IDS){if(!caught.has(id))return false;}
  return true;
}
function isShinyDexComplete() {
  const dex=getShinyDex();
  const caught=new Set(Object.values(dex).map(e=>e.id));
  for(const id of ALL_CATCHABLE_IDS){if(!caught.has(id))return false;}
  return true;
}
function hasShinyCharm() { return isPokedexComplete(); }
function checkDexAchievements() {}

// ---- Achievements ----
const ACHIEVEMENTS = [
  {id:'gym_0',name:'Boulder Basher',desc:'Defeat Brock',icon:'🪨'},
  {id:'gym_1',name:'Cascade Crusher',desc:'Defeat Misty',icon:'💧'},
  {id:'gym_2',name:'Thunder Tamer',desc:'Defeat Lt. Surge',icon:'⚡'},
  {id:'gym_3',name:'Rainbow Ranger',desc:'Defeat Erika',icon:'🌿'},
  {id:'gym_4',name:'Soul Crusher',desc:'Defeat Koga',icon:'💜'},
  {id:'gym_5',name:'Mind Breaker',desc:'Defeat Sabrina',icon:'🔮'},
  {id:'gym_6',name:'Volcano Victor',desc:'Defeat Blaine',icon:'🌋'},
  {id:'gym_7',name:'Earth Shaker',desc:'Defeat Giovanni',icon:'🌍'},
  {id:'elite_four',name:'Pokemon Master',desc:'Beat the Elite Four',icon:'👑'},
  {id:'elite_10',name:'Champion League',desc:'Beat the game 10 times',icon:'🏆'},
  {id:'solo_run',name:'One is Enough',desc:'Beat the game with 1 Pokemon',icon:'⭐'},
  {id:'nuzlocke_win',name:'True Master',desc:'Beat the game in Nuzlocke Mode',icon:'☠️'},
];
function getUnlockedAchievements(){try{return new Set(JSON.parse(localStorage.getItem('poke_achievements')||'[]'));}catch{return new Set();}}
function unlockAchievement(id){const u=getUnlockedAchievements();if(u.has(id))return null;u.add(id);localStorage.setItem('poke_achievements',JSON.stringify([...u]));return ACHIEVEMENTS.find(a=>a.id===id)||null;}

// ---- Settings ----
function getSettings(){const d={autoSkipBattles:false,autoSkipAllBattles:false,autoSkipEvolve:false,darkMode:false};return Object.assign({},d,getCached('poke_settings')||{});}
function saveSettings(s){setCached('poke_settings',s);}

// ---- Hall of Fame ----
function getHallOfFame(){try{return JSON.parse(localStorage.getItem('poke_hall_of_fame')||'[]');}catch{return[];}}
function saveHallOfFameEntry(team,runNumber,hardMode){
  const e=getHallOfFame();
  e.push({runNumber,hardMode:!!hardMode,date:new Date().toLocaleDateString(),team:team.map(p=>({speciesId:p.speciesId,name:p.name,nickname:p.nickname||null,level:p.level,types:p.types,spriteUrl:p.spriteUrl,isShiny:!!p.isShiny}))});
  localStorage.setItem('poke_hall_of_fame',JSON.stringify(e));
}
function getEliteWins(){return parseInt(localStorage.getItem('poke_elite_wins')||'0',10);}
function incrementEliteWins(){const w=getEliteWins()+1;localStorage.setItem('poke_elite_wins',String(w));return w;}

function itemIconHtml(item,size=24){
  const slug=item.id.replace(/_/g,'-');
  const url=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${slug}.png`;
  const esc=item.icon.replace(/'/g,"\\'");
  return `<img src="${url}" alt="${item.name}" title="${item.name}" style="width:${size}px;height:${size}px;image-rendering:pixelated;vertical-align:middle;" onerror="this.replaceWith(document.createTextNode('${esc}'))">`;
}

// Aliases for data.js compat with our other files
const _statsCache = {};
async function fetchBaseStats(id) {
  if(_statsCache[id]) return _statsCache[id];
  const p = await fetchPokemonById(id);
  if(p) _statsCache[id]=p;
  return p;
}
async function prefetchSpecies(ids) { await Promise.all(ids.map(id=>fetchBaseStats(id))); }

// Also keep old WILD_POOLS for any remaining references
const WILD_POOLS = [
  GEN1_BST_APPROX.low,
  GEN1_BST_APPROX.midLow,
  GEN1_BST_APPROX.mid,
  GEN1_BST_APPROX.midHigh,
  GEN1_BST_APPROX.high,
  GEN1_BST_APPROX.veryHigh,
];

// randomItems for item screen
function randomItems(count=3) {
  const shuffled=[...ITEM_POOL].sort(()=>(typeof rng==='function'?rng():Math.random())-0.5);
  return shuffled.slice(0,count);
}
