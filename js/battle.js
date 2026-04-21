// battle.js - Battle logic is now handled in data.js (simulateBattle)
// This file is kept for compatibility but contains no duplicate definitions.

// Helper for battle animations (stub - no canvas animations in this version)
function playAttackAnimation(moveType, attackerEl, targetEl, isSpecial, moveName) {
  return Promise.resolve();
}

function animateBattleVisually(log, pTeam, eTeam) {
  return Promise.resolve();
}

function applyLevelGain(team, items, participants, maxEnemyLevel, nuzlocke, override) {
  const gain = (override !== null && override !== undefined) ? override : 1;
  const levelUps = [];
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
