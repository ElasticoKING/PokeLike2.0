// ===== BATTLE.JS =====
// Auto-battle simulation engine

// Type effectiveness chart
const TYPE_CHART = {
  Fire:     { Grass:2, Ice:2, Bug:2, Steel:2, Water:0.5, Fire:0.5, Rock:0.5, Dragon:0.5 },
  Water:    { Fire:2, Ground:2, Rock:2, Water:0.5, Grass:0.5, Dragon:0.5 },
  Grass:    { Water:2, Ground:2, Rock:2, Fire:0.5, Grass:0.5, Poison:0.5, Flying:0.5, Bug:0.5, Dragon:0.5, Steel:0.5 },
  Electric: { Water:2, Flying:2, Ground:0, Electric:0.5, Grass:0.5, Dragon:0.5 },
  Ice:      { Grass:2, Ground:2, Flying:2, Dragon:2, Fire:0.5, Water:0.5, Ice:0.5, Steel:0.5 },
  Fighting: { Normal:2, Ice:2, Rock:2, Dark:2, Steel:2, Poison:0.5, Bug:0.5, Psychic:0.5, Flying:0.5, Fairy:0.5, Ghost:0 },
  Poison:   { Grass:2, Fairy:2, Poison:0.5, Ground:0.5, Rock:0.5, Ghost:0.5, Steel:0 },
  Ground:   { Fire:2, Electric:2, Poison:2, Rock:2, Steel:2, Grass:0.5, Bug:0.5, Flying:0 },
  Rock:     { Fire:2, Ice:2, Flying:2, Bug:2, Fighting:0.5, Ground:0.5, Steel:0.5 },
  Bug:      { Grass:2, Psychic:2, Dark:2, Fire:0.5, Fighting:0.5, Flying:0.5, Ghost:0.5, Steel:0.5, Fairy:0.5 },
  Ghost:    { Ghost:2, Psychic:2, Dark:0.5, Normal:0, Fighting:0 },
  Dragon:   { Dragon:2, Steel:0.5, Fairy:0 },
  Dark:     { Ghost:2, Psychic:2, Fighting:0.5, Dark:0.5, Fairy:0.5 },
  Steel:    { Ice:2, Rock:2, Fairy:2, Fire:0.5, Water:0.5, Electric:0.5, Steel:0.5 },
  Psychic:  { Fighting:2, Poison:2, Steel:0.5, Psychic:0.5, Dark:0 },
  Fairy:    { Fighting:2, Dragon:2, Dark:2, Fire:0.5, Poison:0.5, Steel:0.5 },
  Flying:   { Grass:2, Fighting:2, Bug:2, Electric:0.5, Rock:0.5, Steel:0.5 },
  Normal:   { Rock:0.5, Steel:0.5, Ghost:0 },
};

function typeEffectiveness(attackType, defenderTypes) {
  let mult = 1;
  defenderTypes.forEach(dt => {
    const row = TYPE_CHART[attackType] || {};
    mult *= (row[dt] ?? 1);
  });
  return mult;
}

// Best attacking type against defender
function bestAttackType(attacker, defender) {
  let bestType = attacker.types[0];
  let bestMult = 0;
  attacker.types.forEach(at => {
    const m = typeEffectiveness(at, defender.types);
    if(m > bestMult) { bestMult=m; bestType=at; }
  });
  return { type: bestType, mult: bestMult };
}

// Calculate damage
function calcDamage(attacker, defender, runState={}) {
  const atkStat = calcStat(attacker.baseStats.atk, attacker.level) * (runState.atkBonus||1);
  const defStat = calcStat(defender.baseStats.def, defender.level) * (runState.defBonus||1);
  const {type, mult} = bestAttackType(attacker, defender);

  // STAB bonus
  const stab = attacker.types.includes(type) ? 1.5 : 1;
  // Crit
  const critChance = 0.0625 + (runState.critBonus||0);
  const crit = Math.random() < critChance ? 1.5 : 1;
  // Random variance
  const variance = 0.85 + Math.random()*0.15;

  const base = ((2*attacker.level/5+2) * atkStat * 50 / defStat) / 50 + 2;
  const dmg = Math.max(1, Math.floor(base * stab * mult * crit * variance));

  return { dmg, mult, crit: crit>1, type };
}

// ---- SIMULATE BATTLE ----
// Returns { playerWon, log, expGained }
function simulateBattle(playerTeam, enemyTeam, runState={}) {
  // Deep copy teams so we don't mutate originals
  const pTeam = playerTeam.map(p => ({...p, baseStats:{...p.baseStats}}));
  const eTeam = enemyTeam.map(p => ({...p, baseStats:{...p.baseStats}}));

  const log = [];
  let expGained = 0;

  const alive = arr => arr.filter(p => p.currentHp > 0);

  // Battle until one side is wiped
  let turn = 0;
  while(alive(pTeam).length > 0 && alive(eTeam).length > 0 && turn < 200) {
    turn++;
    const pFront = alive(pTeam)[0];
    const eFront = alive(eTeam)[0];

    // Speed check — faster goes first
    const pSpd = calcStat(pFront.baseStats.speed, pFront.level);
    const eSpd = calcStat(eFront.baseStats.speed, eFront.level);

    const firstAttacker  = pSpd >= eSpd ? pFront : eFront;
    const firstDefender  = pSpd >= eSpd ? eFront : pFront;
    const secondAttacker = pSpd >= eSpd ? eFront : pFront;
    const secondDefender = pSpd >= eSpd ? pFront : eFront;

    // First attack
    if(firstAttacker.currentHp > 0 && firstDefender.currentHp > 0) {
      const r = calcDamage(firstAttacker, firstDefender, runState);
      firstDefender.currentHp = Math.max(0, firstDefender.currentHp - r.dmg);
      let msg = `${firstAttacker.name} → ${firstDefender.name}: ${r.dmg} dmg`;
      if(r.mult > 1) msg += ' (super eff!)';
      if(r.mult < 1 && r.mult > 0) msg += ' (not very eff)';
      if(r.crit) msg += ' CRIT!';
      log.push({msg, type: pTeam.includes(firstAttacker)?'player':'enemy'});

      if(firstDefender.currentHp <= 0) {
        log.push({msg:`${firstDefender.name} fainted!`, type:'faint'});
        if(eTeam.includes(firstDefender)) {
          const expBase = Math.floor(firstDefender.baseStats ? (firstDefender.baseStats.hp+firstDefender.baseStats.atk+firstDefender.baseStats.def)/3 : 30);
          expGained += Math.floor(expBase * firstDefender.level * (runState.expBonus||1));
        }
      }
    }

    // Second attack (if still alive)
    if(secondAttacker.currentHp > 0 && secondDefender.currentHp > 0) {
      const r = calcDamage(secondAttacker, secondDefender, runState);
      secondDefender.currentHp = Math.max(0, secondDefender.currentHp - r.dmg);
      let msg = `${secondAttacker.name} → ${secondDefender.name}: ${r.dmg} dmg`;
      if(r.mult > 1) msg += ' (super eff!)';
      if(r.mult < 1 && r.mult > 0) msg += ' (not very eff)';
      if(r.crit) msg += ' CRIT!';
      log.push({msg, type: pTeam.includes(secondAttacker)?'player':'enemy'});

      if(secondDefender.currentHp <= 0) {
        log.push({msg:`${secondDefender.name} fainted!`, type:'faint'});
        if(eTeam.includes(secondDefender)) {
          const expBase = Math.floor(secondDefender.baseStats ? (secondDefender.baseStats.hp+secondDefender.baseStats.atk+secondDefender.baseStats.def)/3 : 30);
          expGained += Math.floor(expBase * secondDefender.level * (runState.expBonus||1));
        }
      }
    }
  }

  const playerWon = alive(eTeam).length === 0;

  // Apply HP changes back to real team
  playerTeam.forEach((p, i) => {
    p.currentHp = Math.max(0, pTeam[i].currentHp);
  });

  return { playerWon, log, expGained };
}

// ---- EXP DISTRIBUTION ----
// Returns array of {pokemon, newLevel, evolved} for level-up events
function distributeExp(team, exp, run) {
  const events = [];
  const alive = team.filter(p=>p.currentHp>0);
  if(!alive.length) return events;

  const share = Math.floor(exp / alive.length);
  alive.forEach(p => {
    let gained = share;
    if(!p.exp) p.exp = 0;
    p.exp += gained;
    // Check level ups
    while(p.level < 100 && p.exp >= expToNext(p.level)) {
      p.exp -= expToNext(p.level);
      p.level++;
      recalcStats(p);
      events.push({pokemon: p, newLevel: p.level});
      // Check evolution
      const evo = EVOLUTIONS[p.speciesId];
      if(evo && p.level >= evo.level && !evo.eevee) {
        events.push({pokemon: p, evolving: true, toId: evo.to});
      }
    }
  });
  return events;
}
