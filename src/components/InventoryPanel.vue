<script setup>
import { gameStore } from "../game/store.js";
import { ref, computed } from "vue";

// Props from App.vue
const props = defineProps({
  inventory: { type: Array, default: () => [] },
  gold: { type: Number, default: 0 }
});

const s = gameStore.state;
const filterType = ref("ALL"); // ALL, EQUIP, USE, MAT
const sortRarity = ref(false); // Toggle
const selectedItem = ref(null); // For Details

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
        list = list.filter(i => i.type === "consumable" || i.slot === "item");
    } else if (filterType.value === "MAT") {
        list = list.filter(i => i.type === "material");
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
  // Toggle Selection if already selected, otherwise select
  if(selectedItem.value === item) {
       // If clicking active item, USE it logic? Use double click?
       // For now, let's keep simple: Click = Select. Double Click or Button = Use.
       // User asked for "Description", so selection model is better.
       // But current logic is Click = Use/Equip.
       // I should change: Click = Select. "Use" button in Detail panel?
       // OR: Keep Click = Use, but Hover = Detail?
       // Mobile has no hover.
       // Better: Click = Select/Detail. Detail has "USE/EQUIP" button.
       selectedItem.value = null; // Deselect
  } else {
       selectedItem.value = item;
  }
};

// Action Button in Detail Panel
const useSelectedItem = () => {
    if(!selectedItem.value) return;
    const idx = props.inventory.indexOf(selectedItem.value);
    if(idx === -1) return; // Should not happen
    
    if (window.PlayerLogic) {
        PlayerLogic.handleItemClick(selectedItem.value, idx);
        selectedItem.value = null; // Clear after use
    }
};

const toggleOracle = () => {
    if(window.PlayerLogic) PlayerLogic.toggleInspect();
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
</script>

<template>
  <div class="inv-panel scanline">
    <div class="header">
        <h3>INVENTORY <small>({{ props.inventory.length }})</small></h3>
        <div class="toolbar">
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
        <div class="item-name" :style="{ color: getRarityColor(item.rarity) }">
          {{ item.name }}
        </div>
        <small class="item-type">{{ item.slot === 'item' ? 'use' : item.slot }}</small>
        <span v-if="s.inspectMode" style="font-size:0.7rem">❓</span>
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
            {{ selectedItem.name }}
        </div>
        <div class="detail-body">
            <div class="desc">{{ selectedItem.desc || 'No description available.' }}</div>
            <div class="stats">
                <span v-if="selectedItem.atk">ATK: {{ selectedItem.atk }}</span>
                <span v-if="selectedItem.def">DEF: {{ selectedItem.def }}</span>
                <span v-if="selectedItem.hp">HP: {{ selectedItem.hp }}</span>
                <span v-if="selectedItem.val">Heal: {{ selectedItem.val }}</span>
                <span v-if="selectedItem.price" style="color:var(--c-gold)">Val: {{ selectedItem.price }} G</span>
            </div>
             <div class="effects" v-if="selectedItem.uniqueEffect">
                Effect: {{ selectedItem.uniqueEffect }}
            </div>
        </div>
        <button class="action-btn" @click="useSelectedItem">
            {{ ['weapon','armor','acc'].includes(selectedItem.slot) ? 'EQUIP' : 'USE' }}
        </button>
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

.oracle-banner {
    background: #202; color: #f0f; text-align: center;
    padding: 5px; font-size: 0.8rem; margin-bottom: 10px; border: 1px dashed #f0f;
    animation: pulse 2s infinite;
}

.inv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  overflow-y: auto; flex: 1; padding: 2px;
  margin-bottom: 10px; /* Space for detail panel */
}
.inv-item {
  border: 1px solid #444;
  background: #1a1a1a;
  padding: 5px;
  cursor: pointer;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 0.8rem;
  transition: all 0.2s;
  position: relative;
}
.inv-item:hover {
  background: #2a2a2a; transform: translateY(-2px); z-index: 1;
}
.inv-item.selected {
    background: #333; border-color: #fff !important; box-shadow: 0 0 8px rgba(255,255,255,0.2);
}
.empty-msg {
    grid-column: 1/-1; text-align: center; color: #555; padding: 20px;
}

/* DETAIL PANEL */
.detail-panel {
    background: #181818;
    border-top: 2px solid #444;
    padding: 10px;
    height: 140px; /* Fixed height */
    display: flex; flex-direction: column;
    animation: slideUp 0.3s ease-out;
}
.detail-header {
    font-size: 1rem; font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid #333;
}
.detail-body {
    flex: 1; overflow-y: auto; font-size: 0.8rem; color: #ccc;
}
.stats span {
    margin-right: 10px; color: #aaf;
}
.effects { color: #f8f; margin-top: 5px; font-style: italic; }

.action-btn {
    margin-top: 5px;
    background: var(--c-gold); color: #000; border: none; padding: 8px;
    font-weight: bold; cursor: pointer; text-transform: uppercase;
}
.action-btn:hover { background: #fff; }

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
@keyframes pulse {
    0% { opacity: 0.8; }
    50% { opacity: 1; }
    100% { opacity: 0.8; }
}
</style>
