<script setup>
import { gameStore } from "../game/store.js";
import { ref, computed } from "vue";

// Props from App.vue
const props = defineProps({
  inventory: { type: Array, default: () => [] },
  gold: { type: Number, default: 0 }
});

const s = gameStore.state;
const filterType = ref("ALL"); // ALL, EQUIP, USE, MAT, RELIC
const sortRarity = ref(false); // Toggle
const selectedItem = ref(null); // For Details

const maxInventory = computed(() => {
    return window.Player?.maxInventory || 20;
});

const relics = computed(() => {
    // Construct relic objects from IDs
    if(!s.relics) return [];
    return s.relics.map(rid => {
        return window.RELICS ? window.RELICS[rid] : { name: rid, desc: 'Unknown Relic', rarity: 'common' };
    }).filter(r => r);
});

const rarityRank = {
    "common": 1, "uncommon": 2, "rare": 3, "epic": 4, "legend": 5, "mythic": 6
};

// Filter & Sort Logic
const filteredInventory = computed(() => {
    let list = [...props.inventory];
    
    // Filter
    if (filterType.value === "EQUIP") {
        list = list.filter(i => ["weapon", "armor", "acc"].includes(i.slot));
    } else if (filterType.value === "USE") {
        list = list.filter(i => i.type === "consumable" || i.slot === "con" || i.slot === "skill_book");
    } else if (filterType.value === "MAT") {
        // Fix: Check for slot 'mat' OR type 'material' just in case
        list = list.filter(i => i.slot === "mat" || i.type === "material");
    } else if (filterType.value === "RELIC") {
        return relics.value;
    } else if (filterType.value === "GEM") {
        // v37.1: Filter gems
        list = list.filter(i => i.type === 'gem');
    }
    
    // Sort
    if (sortRarity.value) {
        list.sort((a, b) => {
            const rA = rarityRank[a.rarity] || 0;
            const rB = rarityRank[b.rarity] || 0;
            return rB - rA; // High to Low
        });
    }
    
    return list;
});

const handleItemClick = (item, index) => {
  // v37.1: Play click sound
  if (window.SoundManager) window.SoundManager.play('click');
  
  if(selectedItem.value === item) {
       selectedItem.value = null; // Deselect
  } else {
       selectedItem.value = item;
  }
};

// Action Button in Detail Panel
const useSelectedItem = () => {
    if(!selectedItem.value) return;
    const idx = props.inventory.indexOf(selectedItem.value);
    if(idx === -1) return; 
    
    // v37.1: Play equip/use sound
    if (window.SoundManager) window.SoundManager.play('item_equip');
    
    if (window.PlayerLogic) {
        PlayerLogic.handleItemClick(idx); // Standard Use/Equip
        // Don't deselect automatically if stackable (might want to use again)
        if (!selectedItem.value.qty || selectedItem.value.qty <= 1) {
             selectedItem.value = null; 
        }
    }
};

const discardSelectedItem = () => {
    if(!selectedItem.value) return;
    const idx = props.inventory.indexOf(selectedItem.value);
    if(idx === -1) return;
    
    if (confirm(`Discard ${selectedItem.value.name}? This cannot be undone.`)) {
        if (window.PlayerLogic) PlayerLogic.discardItem(idx);
        selectedItem.value = null;
    }
};

const clickItem = (item) => {
    if (window.Player && window.Player.clickItem) {
        window.Player.clickItem(item);
        // v37.0: Recalc after equip to apply socket bonuses
        if (item.slot && ['weapon', 'armor', 'acc'].includes(item.slot)) {
            setTimeout(() => {
                if (window.Player.recalc) window.Player.recalc();
            }, 50);
        }
    }
};

const toggleOracle = () => {
    if(window.PlayerLogic) PlayerLogic.toggleInspect();
};

const openCrafting = () => {
    gameStore.state.activePanel = 'crafting';
};

// v37.0: Socket helpers
const getSocketDisplay = (item) => {
  if (!item.sockets || item.sockets.length === 0) return '';
  if (window.SocketManager) {
    return window.SocketManager.getSocketDisplay(item);
  }
  return '';
};

const getSocketBonuses = (item) => {
  if (window.SocketManager) {
    return window.SocketManager.getSocketBonuses(item);
  }
  return {};
};

const openAlchemy = (type) => {
    // Assuming Alchemy is part of Crafting or separate panel?
    // Using 'crafting' panel with a tab or separate?
    // Let's assume we pass a reliable way or just open Crafting for now.
    // If 'Alchemy' doesn't exist, fallback to Crafting.
    gameStore.state.activePanel = 'crafting'; // For now
};

const getRarityColor = (rarity) => {
  const map = {
    common: "#ccc",
    uncommon: "#4f4",
    rare: "#4af",
    epic: "#d0d",
    legend: "#fa0",
    mythic: "#f00",
  };
  return map[rarity] || "#fff";
};

const getItemIcon = (item) => {
    if (item.icon) return item.icon; // If item has specific icon
    
    // Generic Icons by Slot/Type
    const map = {
        weapon: '⚔️',
        armor: '🛡️',
        acc: '💍',
        con: '🧪',
        skill_book: '📜',
        mat: '🧱',
        material: '🦴'
    };
    
    // Fallback logic
    if (item.type === 'consumable') return '🧪';
    if (item.id && item.id.includes('bone')) return '🦴';
    if (item.slot === 'relic') return '🏺';
    
    return map[item.slot] || '📦';
};
</script>

<template>
  <div class="inv-panel scanline">
    <div class="header">
        <h3>BACKPACK <small>({{ props.inventory.length }}/{{ maxInventory }})</small></h3>
        <div class="toolbar">
             <button @click="openCrafting" title="Crafting">🔨</button>
            <button @click="gameStore.state.previousPanel = 'inventory'; gameStore.state.activePanel = 'reforge'" class="reforge-btn" title="Reforge">🔥</button>
            <button @click="gameStore.state.previousPanel = 'inventory'; gameStore.state.activePanel = 'black_market'" class="market-btn" title="Black Market">💀</button>
            <button @click="toggleOracle" :class="{ active: s.inspectMode }" title="Inspect">👁️</button>
            <button @click="sortRarity = !sortRarity" :class="{ active: sortRarity }" title="Sort Rarity">💎</button>
        </div>
    </div>
    
    <!-- Filter Tabs -->
    <div class="tabs">
        <button :class="{ active: filterType === 'ALL' }" @click="filterType = 'ALL'">ALL</button>
        <button :class="{ active: filterType === 'EQUIP' }" @click="filterType = 'EQUIP'">EQUIP</button>
        <button :class="{ active: filterType === 'USE' }" @click="filterType = 'USE'">USE</button>
        <button :class="{ active: filterType === 'MAT' }" @click="filterType = 'MAT'">MAT</button>
        <button :class="{ active: filterType === 'GEM' }" @click="filterType = 'GEM'" style="color:#f44">GEMS</button>
        <button :class="{ active: filterType === 'RELIC' }" @click="filterType = 'RELIC'" style="color:#fd0">RELICS</button>
    </div>
    
    <div v-if="s.inspectMode" class="oracle-banner">
        ORACLE MODE: Select item to reveal lore
    </div>

    <!-- Grid -->
    <div class="inv-grid">
      <div
        v-for="(item, i) in filteredInventory"
        :key="i"
        class="inv-item"
        :class="{ selected: selectedItem === item }"
        :style="{ borderColor: getRarityColor(item.rarity) }"
        @click="handleItemClick(item, i)"
      >
        <!-- Icon Placeholder -->
        <div class="item-icon">{{ getItemIcon(item) }}</div>
        
        <!-- Quantity Badge -->
        <div v-if="item.qty > 1" class="qty-badge">{{ item.qty }}</div>
        
        <!-- Floor Badge (Top Right) -->
        <div v-if="item.dropFloor" class="floor-badge">F{{ item.dropFloor }}</div>

        <div class="item-name" :style="{ color: getRarityColor(item.rarity) }">
          {{ item.name }}
        </div>
        <small class="item-type">{{ item.slot === 'item' ? 'use' : (item.slot || 'relic') }}</small>
        <span v-if="s.inspectMode" style="font-size:0.7rem">❓</span>
        <!-- v37.0: Socket indicators -->
        <div class="socket-display" v-if="getSocketDisplay(item)">{{ getSocketDisplay(item) }}</div>
        <!-- v37.0 Phase 3: Curse indicator -->
        <div class="curse-indicator" v-if="item.curses">☠️</div>
      </div>

      <div
        v-if="filteredInventory.length === 0"
        class="empty-msg"
      >
        {{ filterType === 'ALL' ? 'Empty Bag' : 'No items found' }}
      </div>
    </div>

    <!-- DETAIL PANEL (Fixed Bottom) -->
    <div class="detail-panel" v-if="selectedItem">
        <div class="detail-header" :style="{ color: getRarityColor(selectedItem.rarity) }">
            {{ selectedItem.name }} <span v-if="selectedItem.qty > 1">x{{ selectedItem.qty }}</span>
        </div>
        <div class="detail-body">
            <p class="detail-desc">{{ selectedItem.desc || 'No description available.' }}</p>
                
            <!-- v37.0: Socket bonuses display -->
            <div v-if="getSocketDisplay(selectedItem)" class="socket-info">
              <div class="socket-label">💎 Sockets:</div>
              <div class="socket-gems">{{ getSocketDisplay(selectedItem) }}</div>
              <div v-if="Object.keys(getSocketBonuses(selectedItem)).length > 0" class="socket-bonuses">
                <span v-for="(val, stat) in getSocketBonuses(selectedItem)" :key="stat" class="socket-bonus">
                  +{{ val }} {{ stat.toUpperCase() }}
                </span>
              </div>
            </div>
            
            <div class="stats-grid">
                <span v-if="selectedItem.atk">ATK: {{ selectedItem.atk }}</span>
                <span v-if="selectedItem.def">DEF: {{ selectedItem.def }}</span>
                <span v-if="selectedItem.hp">HP: {{ selectedItem.hp }}</span>
                <span v-if="selectedItem.val">Heal: {{ selectedItem.val }}</span>
                <span v-if="selectedItem.price" style="color:var(--c-gold)">Val: {{ selectedItem.price }} G</span>
            </div>
             <div class="effects" v-if="selectedItem.uniqueEffect">
                Effect: {{ selectedItem.uniqueEffect }}
            </div>
            
            <!-- Relic Indicator -->
            <div v-if="filterType === 'RELIC'" class="relic-status">
                ✨ PASSIVE EFFECT ACTIVE
            </div>
        </div>
        
        <!-- Only show actions for non-relics -->
        <div class="actions" v-if="filterType !== 'RELIC'">
            <button class="action-btn use" @click="useSelectedItem">
                {{ ['weapon','armor','acc'].includes(selectedItem.slot) ? 'EQUIP' : 'USE' }}
            </button>
            <button class="action-btn discard" @click="discardSelectedItem">
                🗑️
            </button>
        </div>
    </div>
  </div>
</template>

<style scoped>
.inv-panel {
  background: #111;
  padding: 10px;
  height: 100%;
  display: flex; flex-direction: column;
}

.header {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: 5px; margin-bottom: 5px;
}
.header h3 { margin: 0; color: #fff; font-size:1rem; }

.toolbar { display: flex; gap: 5px; }
.toolbar button { 
    background: #222; border: 1px solid #444; color: #fff; 
    cursor: pointer; padding: 4px 8px; font-size:1rem;
}
.toolbar button.active {
    background: var(--c-purple, #a0a); border-color: #f0f;
    box-shadow: 0 0 5px var(--c-purple, #a0a);
}

.tabs {
    display: flex; gap: 2px; margin-bottom: 10px; border-bottom: 1px solid #333;
}
.tabs button {
    flex: 1; background: #222; border: none; color: #777; padding: 8px 0;
    cursor: pointer; font-weight: bold; font-size: 0.8rem;
    border-bottom: 2px solid transparent;
}
.tabs button.active {
    color: #fff; background: #333; border-bottom-color: var(--c-gold, #fd0);
}

.craft-btn {
  background: linear-gradient(to bottom, #2a4a2a, #1a3a1a);
  border-color: #4f4;
}

.craft-btn:hover {
  background: linear-gradient(to bottom, #3a5a3a, #2a4a2a);
}

.reforge-btn {
  background: linear-gradient(to bottom, #4a2a2a, #3a1a1a);
  border-color: #f55;
}

.reforge-btn:hover {
  background: linear-gradient(to bottom, #5a3a3a, #4a2a4a);
}

.market-btn {
  background: linear-gradient(to bottom, #3a1a4a, #2a0a3a);
  border-color: #a0a;
}

.market-btn:hover {
  background: linear-gradient(to bottom, #4a2a5a, #3a1a4a);
}

.oracle-banner {
    background: #202; color: #f0f; text-align: center;
    padding: 5px; font-size: 0.8rem; margin-bottom: 10px; border: 1px dashed #f0f;
    animation: pulse 2s infinite;
}

.inv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
  gap: 10px;
  overflow-y: auto; 
  flex: 1; 
  padding: 8px;
  margin-bottom: 10px;
  background: var(--glass-bg, rgba(20, 20, 25, 0.6));
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.05));
}

.inv-item {
  position: relative;
  border: 2px solid #333;
  background: linear-gradient(145deg, rgba(30, 30, 35, 0.9), rgba(20, 20, 25, 0.95));
  padding: 8px 6px;
  cursor: pointer;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;
  font-size: 0.8rem;
  transition: all 0.25s var(--ease-out, ease-out);
  border-radius: var(--radius-sm, 4px);
  overflow: hidden;
}

/* Rarity Glow Borders */
.inv-item[style*="common"] {
  box-shadow: 0 0 0 rgba(160, 160, 160, 0);
}

.inv-item:hover {
  transform: translateY(-4px) scale(1.02);
  z-index: 2;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}

.inv-item.selected {
  background: linear-gradient(145deg, rgba(50, 50, 60, 0.95), rgba(40, 40, 50, 0.98));
  border-color: #fff !important;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.05);
}

/* Rarity-based glow effects */
.inv-item[style*="#4d88ff"] {
  box-shadow: 0 0 8px rgba(77, 136, 255, 0.3);
}
.inv-item[style*="#4d88ff"]:hover {
  box-shadow: 0 0 15px rgba(77, 136, 255, 0.5), 0 8px 20px rgba(0, 0, 0, 0.5);
}

.inv-item[style*="#9b59b6"] {
  box-shadow: 0 0 8px rgba(155, 89, 182, 0.3);
}
.inv-item[style*="#9b59b6"]:hover {
  box-shadow: 0 0 15px rgba(155, 89, 182, 0.5), 0 8px 20px rgba(0, 0, 0, 0.5);
}

.inv-item[style*="#cfaa4c"] {
  box-shadow: 0 0 8px rgba(207, 170, 76, 0.3);
  animation: legendaryShimmer 3s ease-in-out infinite;
}
.inv-item[style*="#cfaa4c"]:hover {
  box-shadow: 0 0 20px rgba(207, 170, 76, 0.6), 0 8px 20px rgba(0, 0, 0, 0.5);
}

.inv-item[style*="#ff4444"] {
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.4);
  animation: mythicPulse 2s ease-in-out infinite;
}
.inv-item[style*="#ff4444"]:hover {
  box-shadow: 0 0 25px rgba(255, 68, 68, 0.7), 0 8px 20px rgba(0, 0, 0, 0.5);
}

@keyframes legendaryShimmer {
  0%, 100% { box-shadow: 0 0 8px rgba(207, 170, 76, 0.3); }
  50% { box-shadow: 0 0 15px rgba(207, 170, 76, 0.5); }
}

@keyframes mythicPulse {
  0%, 100% { box-shadow: 0 0 10px rgba(255, 68, 68, 0.4); }
  50% { box-shadow: 0 0 20px rgba(255, 68, 68, 0.7); }
}

.item-icon {
  font-size: 1.6rem;
  margin-bottom: 4px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5));
  transition: transform 0.2s ease;
}

.inv-item:hover .item-icon {
  transform: scale(1.1);
}

.item-name {
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  line-height: 1.2;
  max-height: 2.4em;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-type {
  color: var(--text-muted, #666);
  font-size: 0.65rem;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.qty-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.85);
  color: var(--c-gold, #cfaa4c);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  border: 1px solid rgba(207, 170, 76, 0.3);
}

/* v37.0: Socket display in inventory */
.socket-display {
  font-size: 14px;
  margin-top: 4px;
  text-align: center;
  filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.5));
}

/* v37.0 Phase 3: Curse indicator */
.curse-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 14px;
  filter: drop-shadow(0 0 4px rgba(139, 0, 0, 0.8));
  animation: curse-pulse 1.5s ease-in-out infinite;
}

@keyframes curse-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

.socket-info {
  background: #2a2a00;
  border: 2px solid #ffd700;
  border-radius: 6px;
  padding: 10px;
  margin: 10px 0;
}

.socket-label {
  font-weight: bold;
  color: #ffd700;
  font-size: 14px;
  margin-bottom: 6px;
}

.socket-gems {
  font-size: 24px;
  text-align: center;
  margin: 8px 0;
}

.socket-bonuses {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.socket-bonus {
  background: #0a3d0a;
  color: #0f0;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
  border: 1px solid #0f0;
}

.floor-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(100, 50, 200, 0.8);
  color: #fff;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: bold;
  border: 1px solid rgba(150, 100, 255, 0.5);
}
.empty-msg {
    grid-column: 1/-1; 
    text-align: center; 
    color: var(--text-muted, #555); 
    padding: 30px;
    font-size: 0.9rem;
}

/* DETAIL PANEL - Enhanced v37.1 */
.detail-panel {
    background: linear-gradient(180deg, rgba(25, 25, 30, 0.98), rgba(15, 15, 20, 0.99));
    border-top: 2px solid var(--glass-border-active, rgba(255, 255, 255, 0.15));
    padding: 12px;
    height: 150px;
    display: flex; 
    flex-direction: column;
    animation: slideUp 0.3s var(--ease-out, ease-out);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
}

.detail-header {
    font-size: 1.1rem; 
    font-weight: bold; 
    margin-bottom: 8px; 
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    text-shadow: 0 0 10px currentColor;
}

.detail-body {
    flex: 1; 
    overflow-y: auto; 
    font-size: 0.85rem; 
    color: var(--text-secondary, #ccc);
    padding-right: 5px;
}

.detail-desc {
    margin: 0 0 8px 0;
    line-height: 1.4;
}

.stats span {
    margin-right: 10px; 
    color: var(--c-blue-bright, #66b3ff);
    font-weight: 500;
}

.effects { 
    color: var(--c-pink, #ff66aa); 
    margin-top: 5px; 
    font-style: italic; 
}

.actions { 
    display: flex; 
    gap: 8px; 
    margin-top: 8px; 
}

.action-btn {
    border: none; 
    padding: 10px 12px; 
    font-weight: bold; 
    cursor: pointer; 
    text-transform: uppercase;
    border-radius: var(--radius-sm, 4px);
    transition: all 0.2s ease;
    font-size: 0.85rem;
}

.action-btn.use { 
    flex: 1; 
    background: linear-gradient(135deg, var(--c-gold, #cfaa4c), #d4a84a); 
    color: #000;
    box-shadow: 0 2px 8px rgba(207, 170, 76, 0.3);
}

.action-btn.use:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(207, 170, 76, 0.5);
}

.action-btn.discard { 
    width: 50px; 
    background: linear-gradient(135deg, #4a2222, #3a1515); 
    color: #fcc;
    border: 1px solid rgba(255, 100, 100, 0.3);
}

.action-btn.discard:hover {
    background: linear-gradient(135deg, #5a2a2a, #4a1a1a);
    border-color: rgba(255, 100, 100, 0.5);
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
@keyframes pulse {
    0% { opacity: 0.8; }
    50% { opacity: 1; }
    100% { opacity: 0.8; }
}

.relic-status {
    margin-top: 10px; padding: 5px;
    background: #331; color: #fd0; border: 1px solid #772;
    text-align: center; font-weight: bold; font-size: 0.8rem;
    border-radius: 4px;
}
</style>
