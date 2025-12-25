<script setup>
import { computed, ref } from "vue";
import { gameStore } from "../game/store.js";
import { DB } from "../game/config/database.js";
import { Crafting } from "../game/managers/crafting.js";
import { SynthesisManager } from "../game/managers/SynthesisManager.js";
import { SoundManager } from "../game/managers/sound.js";

const s = gameStore.state;
const recipes = computed(() => {
    // v38.0: Convert RECIPES object to array for proper iteration
    const recipeObj = DB.RECIPES || {};
    return Object.entries(recipeObj).map(([id, recipe]) => ({
        ...recipe,
        recipeId: id
    }));
});

// v37.0: Synthesis System
const activeTab = ref('CRAFT'); // CRAFT | SYNTHESIS
const selectedItems = ref([]); // Array of 3 selected items for synthesis

// v38.0: Count materials helper
const countMaterial = (matId) => {
    return s.inventory.filter(item => item.id === matId).length;
};

// v38.0: Check if can craft with material count display
const getMaterialStatus = (recipe) => {
    if (!recipe.inputs) return [];
    return Object.entries(recipe.inputs).map(([matId, required]) => {
        const have = countMaterial(matId);
        return {
            id: matId,
            name: matId.replace(/_/g, ' ').toUpperCase(),
            required,
            have,
            enough: have >= required
        };
    });
};

const canCraft = (recipe) => {
   if(Crafting && recipe.recipeId) return Crafting.canCraft(recipe.recipeId);
   return false; 
};

const craft = (recipe) => {
    if(Crafting && recipe.recipeId) {
        Crafting.craft(recipe.recipeId);
        if (SoundManager) SoundManager.play('craft');
    }
};

// v37.0: Synthesis Functions
const synthesisMode = ref('basic'); // 'basic' | 'enhanced'

const synthesisEligibleItems = computed(() => {
    // Get all equipment from inventory (weapon/armor/acc)
    return s.inventory.filter(item => 
        ['weapon', 'armor', 'acc'].includes(item.slot) && 
        item.rarity !== 'legendary' // Can't synthesize legendary
    );
});

const toggleItemSelection = (item) => {
    const idx = selectedItems.value.indexOf(item);
    
    if (idx !== -1) {
        // Deselect
        selectedItems.value.splice(idx, 1);
    } else {
        // Select (max 3)
        if (selectedItems.value.length < 3) {
            selectedItems.value.push(item);
        }
    }
};

const isSelected = (item) => {
    return selectedItems.value.includes(item);
};

const synthesisPreview = computed(() => {
    if (!SynthesisManager) return null;
    return SynthesisManager.getPreview(selectedItems.value);
});

const canSynthesize = computed(() => {
    if (!SynthesisManager) return false;
    return SynthesisManager.canSynthesize(selectedItems.value);
});

const canAffordEnhanced = computed(() => {
    if (!synthesisPreview.value || !synthesisPreview.value.costs) return false;
    const materials = synthesisPreview.value.costs.materials;
    const souls = s.meta.souls || 0;
    const essence = s.essence || 0;
    
    if (materials.souls && souls < materials.souls) return false;
    if (materials.essence && essence < materials.essence) return false;
    
    return true;
});

const performSynthesis = () => {
    if (!SynthesisManager || !canSynthesize.value) return;
    
    const useEnhanced = synthesisMode.value === 'enhanced';
    const result = SynthesisManager.synthesize(selectedItems.value, useEnhanced);
    
    if (result.success) {
        // Clear selection
        selectedItems.value = [];
        
        // Show success message
        if (SoundManager) SoundManager.play('loot');
        
        if (useEnhanced) {
          gameStore.log(`⚗️ ENHANCED synthesis! ${result.result.name} has bonus stats!`, 'loot');
        } else {
          gameStore.log(`⚗️ Synthesis successful! Created ${result.result.name}!`, 'loot');
        }
    } else {
        gameStore.log(`❌ Synthesis failed: ${result.error}`, 'system');
    }
};

const clearSelection = () => {
    selectedItems.value = [];
};

const close = () => {
  // v38.8 FIX: Use previousPanel for proper back navigation
  const prev = gameStore.state.previousPanel;
  if (prev) {
    gameStore.state.previousPanel = null;
    gameStore.state.activePanel = prev;
  } else {
    gameStore.state.activePanel = "inventory";
  }
};
</script>

<template>
  <div class="crafting-panel scanline">
    <div class="header">
      <h2>{{ activeTab === 'CRAFT' ? '🔨 CRAFTING' : '⚗️ SYNTHESIS' }}</h2>
      <button class="btn-close" @click="close">X</button>
    </div>

    <!-- Tab Switcher -->
    <div class="tab-switcher">
      <button 
        :class="{ active: activeTab === 'CRAFT' }" 
        @click="activeTab = 'CRAFT'">
        🔨 CRAFTING
      </button>
      <button 
        :class="{ active: activeTab === 'SYNTHESIS' }" 
        @click="activeTab = 'SYNTHESIS'">
        ⚗️ SYNTHESIS
      </button>
    </div>

    <!-- CRAFTING TAB -->
    <div v-if="activeTab === 'CRAFT'" class="recipe-list">
        <div v-if="recipes.length === 0" class="empty-msg">
            No recipes available
        </div>
        
        <div v-for="rec in recipes" :key="rec.recipeId" class="recipe-card">
            <div class="rec-header">
                <h3>{{ rec.name }}</h3>
                <span class="type-badge">{{ rec.desc }}</span>
            </div>
            
            <!-- v38.0: Improved material display -->
            <div class="rec-materials">
                <div 
                    v-for="mat in getMaterialStatus(rec)" 
                    :key="mat.id" 
                    class="material-req"
                    :class="{ enough: mat.enough, missing: !mat.enough }">
                    <span class="mat-name">{{ mat.name }}</span>
                    <span class="mat-count">{{ mat.have }}/{{ mat.required }}</span>
                </div>
            </div>
            
            <button :disabled="!canCraft(rec)" @click="craft(rec)">
                CRAFT
            </button>
        </div>
    </div>

    <!-- SYNTHESIS TAB -->
    <div v-else-if="activeTab === 'SYNTHESIS'" class="synthesis-panel">
      <div class="synthesis-header">
        <p>Combine 3 items of the same slot and rarity to create 1 item of higher rarity!</p>
        <button v-if="selectedItems.length > 0" class="btn-clear" @click="clearSelection">
          Clear Selection ({{ selectedItems.length }}/3)
        </button>
      </div>

      <!-- Item Grid -->
      <div class="synthesis-grid">
        <div 
          v-for="(item, i) in synthesisEligibleItems" 
          :key="i" 
          :class="['synthesis-item', { selected: isSelected(item) }]"
          @click="toggleItemSelection(item)">
          <div class="item-icon">{{ item.icon || '📦' }}</div>
          <div class="item-name" :class="item.rarity">{{ item.name }}</div>
          <div class="item-info">
            <span class="slot-badge">{{ item.slot }}</span>
            <span :class="['rarity-badge', item.rarity]">{{ item.rarity }}</span>
          </div>
        </div>
      </div>

      <!-- Synthesis Preview & Confirm -->
      <div v-if="selectedItems.length > 0" class="synthesis-preview">
        <div class="selected-items">
          <h3>Selected Items ({{ selectedItems.length }}/3)</h3>
          <div class="preview-items">
            <div v-for="(item, i) in selectedItems" :key="i" class="preview-item">
              {{ item.icon }} {{ item.name }}
            </div>
          </div>
        </div>

        <div v-if="synthesisPreview" class="preview-result">
          <div class="arrow">→</div>
          <div class="result-info">
            <h3>Result Preview</h3>
            <p>{{ synthesisPreview.description }}</p>
            <div class="rarity-upgrade">
              <span :class="['badge', synthesisPreview.fromRarity]">{{ synthesisPreview.fromRarity }}</span>
              <span class="arrow-right">→</span>
              <span :class="['badge', synthesisPreview.toRarity]">{{ synthesisPreview.toRarity }}</span>
            </div>
            
            <!-- Mode Selector -->
            <div class="synthesis-mode-selector">
              <h4>Synthesis Mode:</h4>
              <div class="mode-buttons">
                <button 
                  :class="['mode-btn', { active: synthesisMode === 'basic' }]"
                  @click="synthesisMode = 'basic'">
                  ⚙️ BASIC
                </button>
                <button 
                  :class="['mode-btn', { active: synthesisMode === 'enhanced' }]"
                  :disabled="!canAffordEnhanced"
                  @click="synthesisMode = 'enhanced'">
                  ✨ ENHANCED
                </button>
              </div>
            </div>
            
            <!-- Costs Display -->
            <div v-if="synthesisPreview.costs" class="synthesis-costs">
              <h4>{{ synthesisMode === 'enhanced' ? 'Enhanced' : 'Basic' }} Costs:</h4>
              <div class="cost-list">
                <span class="cost-item">💰 {{ synthesisPreview.costs.gold }} Gold</span>
                <span v-if="synthesisMode === 'enhanced' && synthesisPreview.costs.materials.souls" class="cost-item souls-cost">
                  👻 {{ synthesisPreview.costs.materials.souls }} Souls
                </span>
                <span v-if="synthesisMode === 'enhanced' && synthesisPreview.costs.materials.essence" class="cost-item">
                  ✨ {{ synthesisPreview.costs.materials.essence }} Essence
                </span>
              </div>
              
              <!-- Mode Benefits -->
              <div class="mode-benefits">
                <div v-if="synthesisMode === 'basic'" class="benefit basic">
                  📦 Standard result, no sockets
                </div>
                <div v-else class="benefit enhanced">
                  ✨ +10% all stats<br>
                  💎 Guaranteed socket (rare+)
                </div>
              </div>
              
              <div class="success-rate" :class="{ low: synthesisPreview.costs.successRate < 85 }">
                Success Rate: {{ synthesisPreview.costs.successRate.toFixed(0) }}%
                <span v-if="synthesisPreview.costs.pityBonus > 0" class="pity-bonus">
                  (+{{ synthesisPreview.costs.pityBonus.toFixed(0) }}% pity bonus!)
                </span>
              </div>
              <div v-if="synthesisPreview.costs.failureCount > 0" class="pity-info">
                💔 Failed {{ synthesisPreview.costs.failureCount }}x before - rate increased!
              </div>
              <div class="warning">
                ⚠️ Items will be consumed even on failure!
              </div>
            </div>
          </div>
        </div>

        <button 
          v-if="canSynthesize" 
          :class="['btn-synthesize', synthesisMode]" 
          @click="performSynthesis">
          {{ synthesisMode === 'enhanced' ? '✨ ENHANCED SYNTHESIS' : '⚗️ BASIC SYNTHESIS' }}
        </button>
        <div v-else-if="selectedItems.length === 3" class="error-msg">
          ❌ Items must be same slot and same rarity!
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crafting-panel {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: #151010; z-index: 101;
  display: flex; flex-direction: column;
}

.header {
  padding: 15px; background: #200; border-bottom: 2px solid #f00;
  display: flex; justify-content: space-between; align-items: center;
}
.header h2 { color: #f55; margin: 0; }

/* Tab Switcher */
.tab-switcher {
  display: flex;
  background: #1a1a1a;
  border-bottom: 2px solid #333;
}
.tab-switcher button {
  flex: 1;
  padding: 12px;
  background: transparent;
  color: #888;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}
.tab-switcher button.active {
  color: #f55;
  border-bottom-color: #f55;
  background: #222;
}
.tab-switcher button:hover:not(.active) {
  color: #aaa;
  background: #1f1f1f;
}

.recipe-list { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }

.recipe-card {
    background: #222; 
    border: 1px solid #444; 
    padding: 15px;
    border-radius: 8px;
    display: flex; 
    flex-direction: column;
    gap: 10px;
}
.rec-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center;
}
.rec-header h3 { margin: 0; color: #fff; font-size: 1rem; }
.type-badge { font-size: 0.7rem; background: #444; padding: 2px 8px; border-radius: 4px; color: #aaa; }

/* v38.0: Material requirements display */
.rec-materials {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.material-req {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.8rem;
    min-width: 120px;
}

.material-req.enough {
    background: rgba(0, 170, 0, 0.2);
    border: 1px solid #0a0;
    color: #0f0;
}

.material-req.missing {
    background: rgba(170, 0, 0, 0.2);
    border: 1px solid #a00;
    color: #f55;
}

.mat-name {
    font-weight: bold;
    text-transform: capitalize;
}

.mat-count {
    font-weight: bold;
}

.recipe-card button {
    align-self: flex-end;
    padding: 8px 20px;
}

.empty-msg {
    text-align: center;
    color: #666;
    padding: 40px;
    font-style: italic;
}

/* Synthesis Panel */
.synthesis-panel {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.synthesis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #1f1f1f;
  border-radius: 4px;
}
.synthesis-header p {
  margin: 0;
  color: #aaa;
  font-size: 0.9rem;
}

.btn-clear {
  background: #444 !important;
  color: #fff !important;
  font-size: 0.85rem !important;
  padding: 6px 12px !important;
}

.synthesis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  background: #0a0a0a;
  border-radius: 4px;
}

.synthesis-item {
  background: #1a1a1a;
  border: 2px solid #333;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.synthesis-item:hover {
  border-color: #555;
  background: #222;
  transform: translateY(-2px);
}
.synthesis-item.selected {
  border-color: #0f0 !important;
  background: #1a3a1a !important;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
}

.item-icon {
  font-size: 2rem;
  text-align: center;
}
.item-name {
  font-size: 0.9rem;
  font-weight: bold;
  text-align: center;
}
.item-info {
  display: flex;
  justify-content: space-between;
  gap: 5px;
  font-size: 0.7rem;
}
.slot-badge {
  background: #444;
  padding: 2px 6px;
  border-radius: 3px;
  color: #aaa;
  text-transform: uppercase;
}

/* Rarity Colors */
.common { color: #aaa; }
.uncommon { color: #0f0; }
.rare { color: #4af; }
.epic { color: #a0f; }
.legendary { color: #fa0; }

.rarity-badge {
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
  font-weight: bold;
}
.rarity-badge.common { background: #555; color: #aaa; }
.rarity-badge.uncommon { background: #1a3a1a; color: #0f0; }
.rarity-badge.rare { background: #1a2a3a; color: #4af; }
.rarity-badge.epic { background: #2a1a3a; color: #a0f; }
.rarity-badge.legendary { background: #3a2a1a; color: #fa0; }

/* Synthesis Preview */
.synthesis-preview {
  background: #1a1a1a;
  border: 2px solid #444;
  border-radius: 6px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.selected-items h3,
.result-info h3 {
  margin: 0 0 10px 0;
  color: #f55;
  font-size: 1rem;
}

.preview-items {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.preview-item {
  background: #222;
  padding: 8px;
  border-radius: 4px;
  color: #aaa;
  font-size: 0.9rem;
}

.preview-result {
  display: flex;
  align-items: center;
  gap: 15px;
}

.arrow {
  font-size: 2rem;
  color: #f55;
}

.result-info p {
  margin: 0 0 10px 0;
  color: #aaa;
  font-size: 0.9rem;
}

.rarity-upgrade {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rarity-upgrade .badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.85rem;
}

.arrow-right {
  color: #f55;
  font-size: 1.2rem;
}

.btn-synthesize {
  background: #0a0 !important;
  color: #fff !important;
  padding: 12px !important;
  font-size: 1.1rem !important;
  border-radius: 6px !important;
  margin-top: 10px;
}
.btn-synthesize:hover {
  background: #0c0 !important;
}

.error-msg {
  color: #f55;
  text-align: center;
  padding: 10px;
  background: #3a1a1a;
  border-radius: 4px;
  font-weight: bold;
}

/* Synthesis Costs */
.synthesis-costs {
  margin-top: 15px;
  padding: 10px;
  background: #0a0a0a;
  border-radius: 4px;
  border: 1px solid #333;
}

.synthesis-costs h4 {
  margin: 0 0 8px 0;
  color: #f55;
  font-size: 0.9rem;
}

.cost-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
}

.cost-item {
  color: #aaa;
  font-size: 0.85rem;
  padding: 4px 8px;
  background: #1a1a1a;
  border-radius: 3px;
}

.success-rate {
  color: #0f0;
  font-weight: bold;
  text-align: center;
  padding: 8px;
  background: #1a3a1a;
  border-radius: 4px;
  margin: 8px 0;
}
.success-rate.low {
  color: #fa0;
  background: #3a2a1a;
}

.warning {
  color: #fa0;
  font-size: 0.75rem;
  text-align: center;
  padding: 6px;
  background: #3a2a1a;
  border-radius: 3px;
  margin-top: 8px;
}

.pity-bonus {
  color: #fa0;
  font-weight: bold;
  margin-left: 5px;
}

.pity-info {
  color: #fa0;
  font-size: 0.8rem;
  text-align: center;
  padding: 6px;
  background: #3a2a1a;
  border-radius: 3px;
  margin: 5px 0;
}

button {
    background: #f55; color: #fff; border: none; padding: 8px 16px; 
    cursor: pointer; font-weight: bold;
}
button:disabled { background: #444; color: #888; cursor: default; }

.btn-close { background: transparent; border: 1px solid #f55; color: #f55; }
</style>
