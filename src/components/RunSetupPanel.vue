<script setup>
import { ref, computed } from "vue";
import { gameStore } from "../game/store.js";
import { RUN_MODIFIERS, calculateModifierMultipliers, checkModifierConflicts } from "../game/config/modifiers.js";
import { SoundManager } from "../game/managers/sound.js";

const s = gameStore.state;

// Selected modifiers (local state before confirming)
const selectedModifiers = ref([...s.activeModifiers]);

// Check if modifiers are unlocked (completed floor 100)
const isUnlocked = computed(() => s.meta?.hasCompletedFloor100 || false);

// Get all modifiers grouped by difficulty
const modifiersByDifficulty = computed(() => {
  const groups = {
    easy: [],
    medium: [],
    hard: [],
    very_hard: []
  };
  
  Object.values(RUN_MODIFIERS).forEach(mod => {
    if (groups[mod.difficulty]) {
      groups[mod.difficulty].push(mod);
    }
  });
  
  return groups;
});

// Calculate current multipliers
const currentMultipliers = computed(() => {
  return calculateModifierMultipliers(selectedModifiers.value);
});

// Check for conflicts
const conflicts = computed(() => {
  return checkModifierConflicts(selectedModifiers.value);
});

// Toggle a modifier
const toggleModifier = (modId) => {
  if (!isUnlocked.value) return;
  
  const idx = selectedModifiers.value.indexOf(modId);
  if (idx >= 0) {
    selectedModifiers.value.splice(idx, 1);
    if (SoundManager) SoundManager.play('ui_back'); // Deselect sound
  } else {
    selectedModifiers.value.push(modId);
    if (SoundManager) SoundManager.play('click'); // Select sound
  }
};

// Check if modifier is selected
const isSelected = (modId) => selectedModifiers.value.includes(modId);

// Confirm and apply modifiers
const confirmModifiers = () => {
  // Apply modifiers to game state
  s.activeModifiers = [...selectedModifiers.value];
  
  // Calculate and apply effects
  applyModifierEffects();
  
  // Go back to previous panel
  gameStore.state.activePanel = s.previousPanel || 'title';
  gameStore.log(`Challenge Modifiers Applied! Score: x${currentMultipliers.value.scoreMultiplier.toFixed(1)}`, 'system');
  
  if (SoundManager) SoundManager.play('event_good'); // Confirm sound
};

// Apply modifier effects to game state
const applyModifierEffects = () => {
  // Reset effects
  s.modifierEffects = {
    healingDisabled: false,
    dmgMult: 1,
    hpMult: 1,
    defMult: 1,
    goldMult: 1,
    permadeath: false,
    noResurrection: false,
    noEquipment: false,
    floorTimer: 0,
    startCurses: 0
  };
  
  // Apply each modifier's effects
  s.activeModifiers.forEach(modId => {
    const mod = RUN_MODIFIERS[modId];
    if (!mod || !mod.effects) return;
    
    const eff = mod.effects;
    
    if (eff.healingDisabled) s.modifierEffects.healingDisabled = true;
    if (eff.dmgMult) s.modifierEffects.dmgMult *= eff.dmgMult;
    if (eff.hpMult) s.modifierEffects.hpMult *= eff.hpMult;
    if (eff.defMult !== undefined) s.modifierEffects.defMult *= eff.defMult;
    if (eff.goldMult) s.modifierEffects.goldMult *= eff.goldMult;
    if (eff.permadeath) s.modifierEffects.permadeath = true;
    if (eff.noResurrection) s.modifierEffects.noResurrection = true;
    if (eff.noEquipment) s.modifierEffects.noEquipment = true;
    if (eff.floorTimer) s.modifierEffects.floorTimer = eff.floorTimer;
    if (eff.startCurses) s.modifierEffects.startCurses = eff.startCurses;
    if (eff.startGold === 0) s.gold = 0;
  });
};

// Clear all modifiers
const clearAll = () => {
  selectedModifiers.value = [];
  if (SoundManager) SoundManager.play('ui_back');
};

// Go back
const goBack = () => {
  gameStore.state.activePanel = s.previousPanel || 'title';
};

// Difficulty label colors
const getDifficultyColor = (diff) => {
  const colors = {
    easy: '#4f4',
    medium: '#fa0',
    hard: '#f44',
    very_hard: '#f0f'
  };
  return colors[diff] || '#fff';
};

const getDifficultyLabel = (diff) => {
  const labels = {
    easy: '🟢 Easy',
    medium: '🟡 Medium',
    hard: '🔴 Hard',
    very_hard: '💀 Very Hard'
  };
  return labels[diff] || diff;
};
</script>

<template>
  <div class="run-setup-panel scanline">
    <div class="panel-header">
      <h2>🎲 CHALLENGE MODIFIERS</h2>
      <p v-if="isUnlocked">Select modifiers to increase difficulty and rewards</p>
      <p v-else class="locked-msg">🔒 Complete Floor 100 to Unlock!</p>
    </div>
    
    <!-- Locked Overlay -->
    <div v-if="!isUnlocked" class="locked-overlay">
      <div class="lock-content">
        <span class="lock-icon">🔒</span>
        <h3>Challenge Modifiers Locked</h3>
        <p>Defeat the Warlord King at Floor 100 to unlock challenge modifiers!</p>
        <button class="btn-back" @click="goBack">← Back</button>
      </div>
    </div>
    
    <!-- Modifier Selection (Only if unlocked) -->
    <div v-else class="modifier-content">
      <!-- Multiplier Display -->
      <div class="multiplier-bar">
        <div class="mult-item">
          <span class="mult-label">📊 Score</span>
          <span class="mult-value" :class="{ boosted: currentMultipliers.scoreMultiplier > 1 }">
            x{{ currentMultipliers.scoreMultiplier.toFixed(1) }}
          </span>
        </div>
        <div class="mult-item">
          <span class="mult-label">👻 Souls</span>
          <span class="mult-value" :class="{ boosted: currentMultipliers.soulMultiplier > 1 }">
            x{{ currentMultipliers.soulMultiplier.toFixed(1) }}
          </span>
        </div>
      </div>
      
      <!-- Conflict Warnings -->
      <div v-if="conflicts.length > 0" class="conflicts">
        <div v-for="conflict in conflicts" :key="conflict.mods.join()" class="conflict-warning">
          ⚠️ {{ conflict.warning }}
        </div>
      </div>
      
      <!-- Modifier Groups -->
      <div class="modifier-groups">
        <div v-for="(mods, difficulty) in modifiersByDifficulty" :key="difficulty" class="modifier-group">
          <h3 :style="{ color: getDifficultyColor(difficulty) }">
            {{ getDifficultyLabel(difficulty) }}
          </h3>
          <div class="modifier-list">
            <div 
              v-for="mod in mods" 
              :key="mod.id" 
              class="modifier-card"
              :class="{ selected: isSelected(mod.id), 'card-pulse': isSelected(mod.id) }"
              @mouseover="SoundManager && SoundManager.play('button_hover')"
              @click="toggleModifier(mod.id)"
            >
              <div class="mod-icon">{{ mod.icon }}</div>
              <div class="mod-info">
                <div class="mod-name">{{ mod.name }}</div>
                <div class="mod-desc">{{ mod.desc }}</div>
                <div class="mod-mult">
                  📊 x{{ mod.scoreMultiplier }} | 👻 x{{ mod.soulMultiplier }}
                </div>
              </div>
              <div class="mod-check">
                <span v-if="isSelected(mod.id)">✅</span>
                <span v-else>⬜</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="action-bar">
        <button class="btn-clear" @click="clearAll">Clear All</button>
        <button class="btn-back" @click="goBack">← Cancel</button>
        <button class="btn-confirm" @click="confirmModifiers">
          ✅ Confirm ({{ selectedModifiers.length }} selected)
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.run-setup-panel {
  background: var(--bg-core, #111);
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--c-gold, #fd0);
}

.panel-header h2 {
  color: var(--c-gold, #fd0);
  margin: 0 0 5px 0;
  font-size: 1.4rem;
}

.panel-header p {
  color: #888;
  margin: 0;
  font-size: 0.9rem;
}

.locked-msg {
  color: #f44 !important;
  font-weight: bold;
}

/* Locked Overlay */
.locked-overlay {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.lock-content {
  text-align: center;
  padding: 30px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #444;
  border-radius: 10px;
}

.lock-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 15px;
}

.lock-content h3 {
  color: #f44;
  margin: 0 0 10px 0;
}

.lock-content p {
  color: #888;
  margin: 0 0 20px 0;
}

/* Modifier Content */
.modifier-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Multiplier Bar */
.multiplier-bar {
  display: flex;
  justify-content: center;
  gap: 30px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.5);
  margin: 10px 0;
  border-radius: 8px;
}

.mult-item {
  text-align: center;
}

.mult-label {
  display: block;
  color: #888;
  font-size: 0.8rem;
}

.mult-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  transition: all 0.3s ease;
}

.mult-value.boosted {
  color: var(--c-gold, #fd0);
  text-shadow: 0 0 10px var(--c-gold);
}

/* Conflicts */
.conflicts {
  margin: 10px 0;
}

.conflict-warning {
  background: rgba(255, 68, 0, 0.2);
  border: 1px solid #f80;
  color: #f80;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 5px;
  font-size: 0.85rem;
}

/* Modifier Groups */
.modifier-groups {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.modifier-group {
  margin-bottom: 15px;
}

.modifier-group h3 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  border-bottom: 1px solid #333;
  padding-bottom: 5px;
}

.modifier-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Modifier Card */
.modifier-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(30, 30, 35, 0.9);
  border: 2px solid #333;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  transform: scale(1);
}

.modifier-card:hover {
  border-color: #777;
  background: rgba(60, 60, 65, 0.9);
  transform: scale(1.02);
}

.modifier-card:active {
  transform: scale(0.98);
}

.modifier-card.selected {
  border-color: var(--c-gold, #fd0);
  background: rgba(50, 45, 20, 0.9);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.mod-icon {
  font-size: 2rem;
  width: 50px;
  text-align: center;
}

.mod-info {
  flex: 1;
}

.mod-name {
  font-weight: bold;
  color: #fff;
  font-size: 1rem;
}

.mod-desc {
  color: #888;
  font-size: 0.8rem;
  margin: 2px 0;
}

.mod-mult {
  color: var(--c-gold, #fd0);
  font-size: 0.75rem;
}

.mod-check {
  font-size: 1.5rem;
}

/* Action Bar */
.action-bar {
  display: flex;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #333;
  margin-top: 10px;
}

.action-bar button {
  flex: 1;
  padding: 12px;
  font-size: 0.9rem;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-clear {
  background: #333;
  color: #aaa;
}

.btn-clear:hover {
  background: #444;
  color: #fff;
}

.btn-back {
  background: #444;
  color: #fff;
}

.btn-back:hover {
  background: #555;
}

.btn-confirm {
  background: var(--c-gold, #fd0);
  color: #000;
  flex: 2;
}

.btn-confirm:hover {
  background: #fe0;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  transform: scale(1.05);
}

@keyframes cardPulse {
    0% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.2); }
    50% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.5); border-color: #fff; }
    100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.2); }
}

.card-pulse {
    animation: cardPulse 2s infinite;
}

/* Mobile */
@media (max-width: 480px) {
  .modifier-card {
    padding: 8px;
  }
  
  .mod-icon {
    font-size: 1.5rem;
    width: 40px;
  }
  
  .mod-name {
    font-size: 0.9rem;
  }
  
  .mod-desc {
    font-size: 0.75rem;
  }
}
</style>
