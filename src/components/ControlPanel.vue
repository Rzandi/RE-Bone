<script setup>
import { computed } from "vue";

import { gameStore } from "../game/store.js";
import { Game } from "../game/core/game.js";

const emit = defineEmits(["action"]);

const s = gameStore.state;

// Calculate flee chance for display
const fleeChance = computed(() => {
  if (!s.combat || !s.combat.enemy) return 0;
  
  // Formula: Base 50% + Stat Advantage - Floor Penalty
  let base = 50;
  let statBonus = (s.level * 3);
  let floorPenalty = (s.floor * 2);
  
  // Adjust for Enemy Rank if exists
  if (s.combat.enemy.rank) {
    const rankPenalties = { 'E': 0, 'D': 5, 'C': 10, 'B': 20, 'A': 30, 'S': 50 };
    floorPenalty += (rankPenalties[s.combat.enemy.rank] || 0);
  }
  
  let chance = base + statBonus - floorPenalty;
  return Math.max(0, Math.min(100, Math.floor(chance)));
});

// Define buttons based on activePanel
const buttons = computed(() => {
  // 1. Dynamic Overrides (e.g. Sanctuary, Manual Explore)
  if (s.buttons && s.buttons.length > 0) {
      return s.buttons.map(b => {
          if (!b) return null; // Spacer
          return {
              label: b.txt,
              action: "dynamic", // Special action type
              fn: b.fn,          // Direct function reference
              color: b.col
          };
      });
  }

  // 2. Default Panel Logic
  const panel = s.activePanel || "menu-view";

  if (panel === "menu-view") {
    // v37.3: Show stat points indicator
    const statPts = s.statPt || 0;
    const statsLabel = statPts > 0 ? `📊 STATS (${statPts})` : "📊 STATS";
    const statsColor = statPts > 0 ? "var(--c-gold)" : undefined;
    
    return [
      { label: "🔍 EXPLORE", action: "explore", color: "var(--c-gold)" },
      { label: "💤 REST", action: "rest", color: "var(--c-green)" },
      { label: "🔮 SKILLS", fn: () => s.activePanel = 'skill-management', color: "var(--c-purple)" },
      { label: statsLabel, fn: () => s.activePanel = 'stat-allocation', color: statsColor },
    ];
  }
  
  if (panel === "combat") {
    const fleeLabel = `🏃 FLEE (${fleeChance.value}%)`;
    const fleeColor = fleeChance.value > 50 ? "#fff" : "#888";
    
    return [
      { label: "⚔️ ATTACK", action: "attack", color: "#f55" },
      { label: "⚡ SKILL", action: "skill", color: "var(--c-blue)" },
      { label: "🎒 ITEM", action: "item" },
      { label: fleeLabel, action: "flee", color: fleeColor },
    ];
  }

  if (panel === "inventory") {
    // v37.3: Smart Back - Multi-source check for combat state
    const fromCombat = s.previousPanel === 'combat';
    const inCombat = s.combat && s.combat.enemy;
    const coreWasCombat = Game && (Game._wasInCombat || Game._frozenEnemy);
    
    if (inCombat || fromCombat || coreWasCombat) {
        return [{ label: "⚔️ BACK", action: "resume_combat" }, null, null, null];
    }
    return [{ label: "🔙 BACK", action: "back" }, null, null, null];
  }

  // v37.1 Fix: Skill Selector Back Button
  // v38.8 FIX: Added all secondary panels that should show BACK
  if (panel === "skill-selector" || panel === "reforge" || panel === "black_market" || 
      panel === "crafting" || panel === "run-setup" || panel === "achievements" || 
      panel === "leaderboard" || panel === "shop-ascension" || panel === "daily" ||
      panel === "socketing" || panel === "settings") {
     return [{ label: "🔙 BACK", action: "back" }, null, null, null];
  }

  return [{ label: "MENU", action: "menu" }, null, null, null];
});

const handleClick = (btn) => {
  if (btn) {
      if (btn.fn && typeof btn.fn === 'function') {
          btn.fn(); // Execute direct function
      } else if (btn.action) {
          emit("action", btn.action);
      }
  }
};
</script>

<template>
  <div id="controls">
    <template v-for="(btn, idx) in buttons" :key="idx">
      <button
        v-if="btn"
        @click.stop.prevent="handleClick(btn)"
        :style="{
          color: btn.color || 'var(--c-text)',
          borderColor: btn.color ? btn.color : 'var(--c-border)',
        }"
      >
        {{ btn.label }}
      </button>
      <div v-else class="empty-btn"></div>
    </template>
  </div>
</template>

<style scoped>
/* Grid layout forced here for reliability */
#controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 5px;
  margin-top: auto; /* Push to bottom if flex parent */
  flex-shrink: 0;   /* Prevent shrinking/clipping */
  z-index: 10;      /* Ensure above other elements */
  background: var(--bg-primary, #111); /* Safe background */
}

button {
  background: linear-gradient(to bottom, #222, #111);
  border: 1px solid var(--c-border);
  color: var(--c-text);
  font-family: inherit;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.1s;
  border-radius: 6px;
  padding: 0; /* Centered by flex usually, or line-height */
  display: flex; justify-content: center; align-items: center;
  min-height: 54px; /* Optimal Touch Target (48px+) */
  box-shadow: 0 4px 0 #000; /* Retro press depth */
}
button:active {
  background: #333;
  transform: translateY(4px); /* Pushed down */
  box-shadow: 0 0 0 #000;
}
.empty-btn {
  visibility: hidden;
}
</style>
