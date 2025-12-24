<script setup>
import { ref, computed } from 'vue';
import { gameStore } from '../game/store.js';

const s = gameStore.state;
const selectedItem = ref(null);
const reforgeMode = ref('gold'); // 'gold' | 'soul'
const isReforging = ref(false); // Prevent spam clicks

// Get reforgeable items (equipment only, no legendary)
const reforgeableItems = computed(() => {
  return s.inventory.filter(item => 
    ['weapon', 'armor', 'acc'].includes(item.slot) && 
    item.rarity !== 'legendary'
  );
});

const previousItemState = ref(null);

// Select item
const selectItem = (item) => {
  if (isReforging.value) return; // Prevent selection during reforge
  selectedItem.value = item;
  previousItemState.value = null; // Clear undo history on new selection
};

// Undo Reforge
const undoReforge = () => {
  if (!selectedItem.value || !previousItemState.value) return;
  
  // Restore stats from backup
  Object.assign(selectedItem.value, JSON.parse(previousItemState.value));
  
  if (window.SoundManager) window.SoundManager.play('ui_back');
  gameStore.log('Reforge undone.', 'neural');
  
  // Clear backup to prevent multiple undos
  previousItemState.value = null;
};

// Get costs for selected item
const costs = computed(() => {
  if (!selectedItem.value || !window.ReforgeManager) return null;
  return window.ReforgeManager.getCosts(selectedItem.value.rarity);
});

// Get stat ranges for preview
const statRanges = computed(() => {
  if (!selectedItem.value || !window.ReforgeManager) return null;
  return window.ReforgeManager.getStatRange(selectedItem.value, reforgeMode.value);
});

// Can afford check
const canAfford = computed(() => {
  if (!selectedItem.value || !costs.value) return false;
  
  if (reforgeMode.value === 'gold') {
    return s.gold >= costs.value.gold;
  } else {
    return (Number(s.souls) || 0) >= costs.value.souls;
  }
});

// Perform reforge
const performReforge = () => {
  if (!selectedItem.value || !window.ReforgeManager || isReforging.value) return;
  
  // Prevent concurrent reforges (potential issue #4)
  isReforging.value = true;
  
  // Snapshot state for UNDO (deep copy)
  previousItemState.value = JSON.stringify(selectedItem.value);
  
  let result;
  if (reforgeMode.value === 'gold') {
    result = window.ReforgeManager.reforgeGold(selectedItem.value);
  } else {
    result = window.ReforgeManager.reforgeSoul(selectedItem.value);
  }
  
  if (result.success) {
    // Keep item selected to see changes
    if (window.SoundManager) window.SoundManager.play('loot');
  } else {
    gameStore.log(result.error, 'error');
    if (window.SoundManager) window.SoundManager.play('error');
    // Clear undo if failed (nothing changed)
    previousItemState.value = null;
  }
  
  // Re-enable after short delay
  setTimeout(() => {
    isReforging.value = false;
  }, 500);
};

// Close panel
const close = () => {
  if (gameStore.state.previousPanel) {
    const prev = gameStore.state.previousPanel;
    gameStore.state.previousPanel = null;
    gameStore.state.activePanel = prev;
  } else {
    gameStore.state.activePanel = 'menu-view';
  }
};
</script>

<template>
  <div class="reforge-panel">
    <div class="panel-header">
      <h2>🔨 REFORGING STATION</h2>
      <button class="close-btn" @click="close">✖</button>
    </div>

    <div class="reforge-content">
      <!-- Left: Item Selection -->
      <div class="item-list">
        <h3>Reforgeable Items ({{ reforgeableItems.length }})</h3>
        
        <div v-if="reforgeableItems.length === 0" class="empty-state">
          <p>🔍 No eligible items</p>
          <small>Find equipment to reforge! (No legendary)</small>
        </div>
        
        <div v-else class="items-grid">
          <div
            v-for="item in reforgeableItems"
            :key="item.id"
            class="item-card"
            :class="{ selected: selectedItem === item }"
            @click="selectItem(item)"
          >
            <div class="item-name">{{ item.name }}</div>
            <div class="item-stats">
              <span v-if="item.atk">⚔️ {{ item.atk }}</span>
              <span v-if="item.def">🛡️ {{ item.def }}</span>
            </div>
            <div class="item-rarity" :class="item.rarity">{{ item.rarity }}</div>
          </div>
        </div>
      </div>

      <!-- Right: Reforge Interface -->
      <div class="reforge-workspace" v-if="selectedItem">
        <h3>{{ selectedItem.name }}</h3>
        <p class="rarity-badge" :class="selectedItem.rarity">{{ selectedItem.rarity.toUpperCase() }}</p>
        
        <!-- Current Stats -->
        <div class="current-stats">
          <h4>Current Stats:</h4>
          <div class="stat-row" v-if="selectedItem.atk">
            <span class="stat-label">ATK:</span>
            <span class="stat-value">{{ selectedItem.atk }}</span>
          </div>
          <div class="stat-row" v-if="selectedItem.def">
            <span class="stat-label">DEF:</span>
            <span class="stat-value">{{ selectedItem.def }}</span>
          </div>
          <div class="stat-row" v-if="selectedItem.hp">
            <span class="stat-label">HP:</span>
            <span class="stat-value">{{ selectedItem.hp }}</span>
          </div>
          <div class="stat-row" v-if="selectedItem.mp">
            <span class="stat-label">MP:</span>
            <span class="stat-value">{{ selectedItem.mp }}</span>
          </div>
        </div>

        <!-- Mode Selection -->
        <div class="mode-selector">
          <button 
            :class="['mode-btn', { active: reforgeMode === 'gold' }]"
            @click="reforgeMode = 'gold'">
            💰 GOLD
          </button>
          <button 
            :class="['mode-btn', { active: reforgeMode === 'soul' }]"
            :disabled="!s.souls || !costs || s.souls < costs.souls"
            @click="reforgeMode = 'soul'">
            👻 SOUL
          </button>
        </div>

        <!-- Cost & Preview -->
        <div v-if="costs" class="reforge-info">
          <div class="cost-display">
            <span v-if="reforgeMode === 'gold'">Cost: {{ costs.gold }} Gold</span>
            <span v-else>Cost: {{ costs.souls }} Souls</span>
          </div>

          <!-- Stat Range Preview -->
          <div v-if="statRanges" class="stat-preview">
            <h4>{{ reforgeMode === 'gold' ? 'Safe Range (±10%)' : 'Wild Range (±50%)' }}:</h4>
            <div class="stat-range" v-for="(range, stat) in statRanges" :key="stat">
              <span class="stat-name">{{ stat.toUpperCase() }}:</span>
              <span class="range-values">
                {{ range.min }} - {{ range.max }}
                <span class="current-indicator">({{ range.current }})</span>
              </span>
            </div>
            
            <div v-if="reforgeMode === 'soul'" class="bonus-chance">
              + 20% chance for bonus stat!
            </div>
          </div>

          <div class="warning" v-if="reforgeMode === 'soul'">
            ⚠️ Soul reforge is RISKY! Stats can get much worse!
          </div>
        </div>

        <!-- Reforge Button & Undo -->
        <div class="action-buttons">
          <button 
            class="btn-reforge"
            :class="reforgeMode"
            :disabled="!canAfford || isReforging"
            @click="performReforge">
            {{ isReforging ? '⏳ REFORGING...' : (reforgeMode === 'gold' ? '🔨 REFORGE (GOLD)' : '✨ REFORGE (SOUL)') }}
          </button>
          
          <button 
            v-if="previousItemState"
            class="btn-undo"
            @click="undoReforge">
            ↩️ UNDO
          </button>
        </div>

        <div v-if="!canAfford" class="error-msg">
          ❌ Not enough {{ reforgeMode === 'gold' ? 'gold' : 'souls' }}!
        </div>
      </div>

      <!-- Empty state if no selection -->
      <div v-else class="no-selection">
        <p>← Select an item to reforge</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reforge-panel {
  background: #1a1a1a;
  color: #fff;
  padding: 20px;
  padding-top: max(20px, env(safe-area-inset-top)); /* Safe area fix */
  max-width: 1200px;
  margin: 20px auto; /* Add vertical margin */
  border-radius: 8px;
  max-height: 90vh; /* Prevent overflow */
  overflow-y: auto; /* Scroll if needed */
  position: relative;
  z-index: 100;
  border: 1px solid #444;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f55;
  position: sticky; /* Keep header visible */
  top: 0;
  background: #1a1a1a;
  z-index: 10;
}

.panel-header h2 {
  margin: 0;
  color: #f55;
}

.close-btn {
  background: #f55;
  color: #fff;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
}

.reforge-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
}

.item-list h3 {
  margin-top: 0;
  color: #fa0;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: #0a0a0a;
  border-radius: 4px;
  color: #777;
}

.items-grid {
  display: grid;
  gap: 10px;
  max-height: 500px;
  overflow-y: auto;
}

.item-card {
  background: #2a2a2a;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.item-card:hover {
  background: #3a3a3a;
  border-color: #f55;
}

.item-card.selected {
  background: #3a1a1a;
  border-color: #f55;
}

.item-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.item-stats {
  display: flex;
  gap: 10px;
  font-size: 0.9rem;
  color: #aaa;
}

.item-rarity {
  font-size: 0.75rem;
  text-transform: uppercase;
  margin-top: 5px;
}

.item-rarity.common { color: #ccc; }
.item-rarity.uncommon { color: #4f4; }
.item-rarity.rare { color: #4af; }
.item-rarity.epic { color: #d0d; }

.reforge-workspace {
  background: #0a0a0a;
  padding: 20px;
  border-radius: 4px;
}

.reforge-workspace h3 {
  margin-top: 0;
  color: #f55;
}

.rarity-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  margin-bottom: 15px;
}

.rarity-badge.common { background: #444; }
.rarity-badge.uncommon { background: #2a4a2a; }
.rarity-badge.rare { background: #2a2a4a; }
.rarity-badge.epic { background: #4a2a4a; }

.current-stats {
  background: #1a1a1a;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.current-stats h4 {
  margin: 0 0 10px 0;
  color: #fa0;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid #2a2a2a;
}

.stat-label {
  color: #aaa;
}

.stat-value {
  color: #fff;
  font-weight: bold;
}

.mode-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.mode-btn {
  flex: 1;
  padding: 10px;
  background: #2a2a2a;
  color: #fff;
  border: 2px solid transparent;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  transition: all 0.2s;
}

.mode-btn:hover {
  background: #3a3a3a;
}

.mode-btn.active {
  background: #f55;
  border-color: #f55;
}

.mode-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.reforge-info {
  background: #1a1a1a;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.cost-display {
  font-size: 1.1rem;
  font-weight: bold;
  color: #fa0;
  margin-bottom: 15px;
  text-align: center;
}

.stat-preview h4 {
  margin: 0 0 10px 0;
  color: #4af;
}

.stat-range {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 0.9rem;
}

.stat-name {
  color: #aaa;
  font-weight: bold;
}

.range-values {
  color: #fff;
}

.current-indicator {
  color: #fa0;
  margin-left: 5px;
}

.bonus-chance {
  margin-top: 10px;
  padding: 8px;
  background: #2a1a3a;
  border-radius: 4px;
  text-align: center;
  color: #d0d;
  font-weight: bold;
}

.warning {
  background: #3a2a1a;
  color: #fa0;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  margin-top: 10px;
  font-size: 0.85rem;
}

.btn-reforge {
  width: 100%;
  padding: 15px;
  background: #f55;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reforge:hover:not(:disabled) {
  background: #f77;
  transform: scale(1.02);
}

.btn-reforge:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-reforge.soul {
  background: #d0d;
}

.btn-reforge.soul:hover:not(:disabled) {
  background: #e0e;
}

.error-msg {
  color: #f55;
  text-align: center;
  padding: 10px;
  background: #3a1a1a;
  border-radius: 4px;
  margin-top: 10px;
  font-weight: bold;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
  font-size: 1.2rem;
  background: #0a0a0a;
  border-radius: 4px;
}
</style>
