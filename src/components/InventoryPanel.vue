<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { gameStore } from "../game/store.js";
import { SocketManager } from "../game/managers/SocketManager.js";
import { Player } from "../game/logic/Player.js";
import { SoundManager } from "../game/managers/sound.js";
import { RELICS } from "../game/config/relics.js";
import { Crafting } from "../game/managers/crafting.js";
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

// Props from App.vue
const props = defineProps({
  inventory: { type: Array, default: () => [] },
  gold: { type: Number, default: 0 }
});

const s = gameStore.state;
const filterType = ref(s.lastInventoryFilter || "ALL"); // ALL, GEAR, USE, MAT, GEM, RELIC

// v38.2: Persist tab selection
import { watch } from "vue";
watch(filterType, (newVal) => {
    s.lastInventoryFilter = newVal;
});

const sortRarity = ref(false); // Toggle
const selectedItem = ref(null); // For Details
const selectedEquipSlot = ref(null); // For GEAR tab slot selection

const maxInventory = computed(() => {
    return Player?.inventoryLimit || 20;
});

const relics = computed(() => {
    // Construct relic objects from IDs
    if(!s.relics) return [];
    return s.relics.map(rid => {
        return RELICS ? RELICS[rid] : { name: rid, desc: 'Unknown Relic', rarity: 'common' };
    }).filter(r => r);
});

const rarityRank = {
    "common": 1, "uncommon": 2, "rare": 3, "epic": 4, "legend": 5, "mythic": 6
};

// Filter & Sort Logic
const filteredInventory = computed(() => {
    let list = [...props.inventory];
    
    // Filter
    if (filterType.value === "GEAR") {
        // Equipment items shown in GEAR tab
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
    } else if (filterType.value === "ALL") {
        // v38.0: ALL shows everything except equipment (moved to GEAR)
        list = list.filter(i => !["weapon", "armor", "acc"].includes(i.slot));
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

// v38.0: Equipped items getter
const equippedItems = computed(() => {
    return {
        weapon: s.equip?.weapon || null,
        armor: s.equip?.armor || null,
        acc: s.equip?.acc || null
    };
});

// v38.0: Equipment inventory (unequipped equipment items)
const equipmentInventory = computed(() => {
    let list = props.inventory.filter(i => ["weapon", "armor", "acc"].includes(i.slot));
    
    // Always sort by rarity when in GEAR tab
    list.sort((a, b) => {
        const rA = rarityRank[a.rarity] || 0;
        const rB = rarityRank[b.rarity] || 0;
        if (rB !== rA) return rB - rA; // High rarity first
        // Same rarity, sort by slot type
        const slotOrder = { weapon: 0, armor: 1, acc: 2 };
        return (slotOrder[a.slot] || 99) - (slotOrder[b.slot] || 99);
    });
    
    return list;
});

// v38.0: Auto-sort function
const autoSortInventory = () => {
    if (SoundManager) SoundManager.play('click');
    
    // Sort all items in inventory
    const sorted = [...props.inventory].sort((a, b) => {
        const rA = rarityRank[a.rarity] || 0;
        const rB = rarityRank[b.rarity] || 0;
        if (rB !== rA) return rB - rA;
        // Same rarity, sort by slot
        const slotOrder = { weapon: 0, armor: 1, acc: 2, con: 3, mat: 4 };
        return (slotOrder[a.slot] || 99) - (slotOrder[b.slot] || 99);
    });
    
    // Update inventory in store
    gameStore.state.inventory = sorted;
    gameStore.log("Inventory sorted by rarity!", "system");
};

// v38.0: Toggle salvage mode
const toggleSalvageMode = () => {
    if (SoundManager) SoundManager.play('click');
    s.salvageMode = !s.salvageMode;
    if (s.salvageMode) {
        s.inspectMode = false; // Mutually exclusive
        gameStore.log("♻️ Salvage mode ON. Click equipment to break down into materials.", "system");
    } else {
        gameStore.log("Salvage mode OFF.", "system");
    }
};

// v38.0: Salvage item function
const salvageItem = (item) => {
    if (!item) return;
    
    // Find item index in inventory
    const idx = s.inventory.findIndex(i => i.id === item.id);
    if (idx === -1) {
        gameStore.log("Item not found in inventory!", "error");
        return;
    }
    
    // Call crafting salvage
    if (Crafting && Crafting.salvage) {
        Crafting.salvage(idx);
        selectedItem.value = null;
        if (SoundManager) SoundManager.play('craft');
    }
};

const handleItemClick = (item, index) => {
  // v37.1: Play click sound
  if (SoundManager) SoundManager.play('click');
  
  // v38.0: Salvage mode - break item into materials
  if (s.salvageMode && ["weapon", "armor", "acc"].includes(item.slot)) {
      if (confirm(`♻️ Salvage ${item.name}? This will convert it to materials.`)) {
          salvageItem(item);
      }
      return;
  }
  
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
    if (SoundManager) SoundManager.play('item_equip');
    
    if (Player) {
        Player.handleItemClick(idx); // Standard Use/Equip
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
        if (Player) Player.discardItem(idx);
        selectedItem.value = null;
    }
};

const clickItem = (item) => {
    if (Player && Player.clickItem) {
        Player.clickItem(item);
        // v37.0: Recalc after equip to apply socket bonuses
        if (item.slot && ['weapon', 'armor', 'acc'].includes(item.slot)) {
            setTimeout(() => {
                if (Player.recalc) Player.recalc();
            }, 50);
        }
    }
};

const toggleOracle = () => {
    if(Player) Player.toggleInspect();
};

const openCrafting = () => {
    gameStore.state.previousPanel = 'inventory'; // v38.8 FIX: Enable back navigation
    gameStore.state.activePanel = 'crafting';
};

// v38.2: Bulk Discard (Low/Polish)
const discardAllTrash = () => {
    // v38.2 Fix: Only discard EQUIPMENT. Do not touch Consumables or Mats.
    const trashItems = props.inventory.filter(i => 
        (i.rarity === 'common' || i.rarity === 'uncommon') && 
        ['weapon', 'armor', 'acc'].includes(i.slot)
    );

    if (trashItems.length === 0) {
        gameStore.log("No common/uncommon equipment to discard.", "warning");
        return;
    }

    if (!confirm(`Discard ${trashItems.length} common/uncommon EQUIPMENT? This cannot be undone.`)) return;

    // Remove them
    // We filter the main inventory in place
    gameStore.state.inventory = gameStore.state.inventory.filter(i => 
        !trashItems.includes(i)
    );
    
    gameStore.log(`Discarded ${trashItems.length} items.`, "system");
    if (SoundManager) SoundManager.play('sell'); // reuse sell sound or ui_back
};

// v37.0: Socket helpers
const getSocketDisplay = (item) => {
  if (!item.sockets || item.sockets.length === 0) return '';
  return SocketManager.getSocketDisplay(item);
};

const getSocketBonuses = (item) => {
  return SocketManager.getSocketBonuses(item);
};

const openAlchemy = (type) => {
    // Assuming Alchemy is part of Crafting or separate panel?
    // Using 'crafting' panel with a tab or separate?
    // Let's assume we pass a reliable way or just open Crafting for now.
    // If 'Alchemy' doesn't exist, fallback to Crafting.
    gameStore.state.activePanel = 'crafting'; // For now
};

// v38.0: Back button handler
const goBack = () => {
    const prev = gameStore.state.previousPanel;
    const enemy = gameStore.state.combat?.enemy;
    
    // v38.2 Fix: Context-aware return
    // If we have an active enemy, ALWAYS go back to combat (unless we came from somewhere specific?)
    // But usually Inventory is accessed via Combat Button.
    
    if (prev) {
        gameStore.state.previousPanel = null;
        gameStore.state.activePanel = prev;
    } else if (enemy) {
        // Fallback: If in combat, return to combat
        gameStore.state.activePanel = 'combat';
    } else {
        gameStore.state.activePanel = 'menu-view';
    }
};

const getRarityColor = (rarity) => {
  const map = {
    common: "var(--rare-common)",
    uncommon: "var(--rare-uncommon)",
    rare: "var(--rare-rare)",
    epic: "var(--rare-epic)",
    legend: "var(--rare-legend)",
    mythic: "var(--rare-mythic)",
  };
  return map[rarity] || "var(--text-primary)";
};

// v38.8: Virtual Scrolling
const gridRef = ref(null);
const columns = ref(4);

const chunkedInventory = computed(() => {
    const list = filteredInventory.value;
    if (!list || list.length === 0) return [];
    
    const size = columns.value;
    const result = [];
    for (let i = 0; i < list.length; i += size) {
        result.push({
            id: i, // row index as unique key
            items: list.slice(i, i + size)
        });
    }
    return result;
});

const updateColumns = () => {
    if (!gridRef.value) return;
    const width = gridRef.value.clientWidth; 
    // Item min-width 85px + 10px gap = 95px approx
    const cols = Math.floor((width) / 95); 
    columns.value = Math.max(1, cols);
};

let resizeObserver = null;
onMounted(() => {
    setTimeout(() => {
        if (gridRef.value && typeof ResizeObserver !== 'undefined') {
            updateColumns();
            resizeObserver = new ResizeObserver(updateColumns);
            resizeObserver.observe(gridRef.value);
        }
    }, 200);
});

onUnmounted(() => {
    if (resizeObserver) resizeObserver.disconnect();
});

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
            <button @click="discardAllTrash" title="Discard All Common/Uncommon">🗑️</button>
            <button @click="gameStore.state.previousPanel = 'inventory'; gameStore.state.activePanel = 'black_market'" class="market-btn" title="Black Market">💀</button>
            <button @click="toggleOracle" :class="{ active: s.inspectMode }" title="Inspect">👁️</button>
        </div>
    </div>
    
    <!-- Filter Tabs -->
    <div class="tabs">
        <button :class="{ active: filterType === 'ALL' }" @click="filterType = 'ALL'">ALL</button>
        <button :class="{ active: filterType === 'GEAR' }" @click="filterType = 'GEAR'" style="color:#0af">⚔️ GEAR</button>
        <button :class="{ active: filterType === 'USE' }" @click="filterType = 'USE'">USE</button>
        <button :class="{ active: filterType === 'MAT' }" @click="filterType = 'MAT'">MAT</button>
        <button :class="{ active: filterType === 'GEM' }" @click="filterType = 'GEM'" style="color:#f44">GEMS</button>
        <button :class="{ active: filterType === 'RELIC' }" @click="filterType = 'RELIC'" style="color:#fd0">RELICS</button>
    </div>
    
    <div v-if="s.inspectMode" class="oracle-banner">
        ORACLE MODE: Select item to reveal lore
    </div>

    <!-- v38.0: GEAR Panel -->
    <div v-if="filterType === 'GEAR'" class="gear-panel">
        <!-- Equipped Slots -->
        <div class="equipped-slots">
            <div class="equip-slot" 
                 :class="{ selected: selectedEquipSlot === 'weapon', filled: equippedItems.weapon }"
                 @click="selectedEquipSlot = 'weapon'; selectedItem = equippedItems.weapon">
                <div class="slot-icon">⚔️</div>
                <div class="slot-label">WEAPON</div>
                <div v-if="equippedItems.weapon" class="slot-item" :style="{ color: getRarityColor(equippedItems.weapon.rarity) }">
                    {{ equippedItems.weapon.name }}
                </div>
                <div v-else class="slot-empty">Empty</div>
            </div>
            
            <div class="equip-slot" 
                 :class="{ selected: selectedEquipSlot === 'armor', filled: equippedItems.armor }"
                 @click="selectedEquipSlot = 'armor'; selectedItem = equippedItems.armor">
                <div class="slot-icon">🛡️</div>
                <div class="slot-label">ARMOR</div>
                <div v-if="equippedItems.armor" class="slot-item" :style="{ color: getRarityColor(equippedItems.armor.rarity) }">
                    {{ equippedItems.armor.name }}
                </div>
                <div v-else class="slot-empty">Empty</div>
            </div>
            
            <div class="equip-slot" 
                 :class="{ selected: selectedEquipSlot === 'acc', filled: equippedItems.acc }"
                 @click="selectedEquipSlot = 'acc'; selectedItem = equippedItems.acc">
                <div class="slot-icon">💍</div>
                <div class="slot-label">ACC</div>
                <div v-if="equippedItems.acc" class="slot-item" :style="{ color: getRarityColor(equippedItems.acc.rarity) }">
                    {{ equippedItems.acc.name }}
                </div>
                <div v-else class="slot-empty">Empty</div>
            </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="gear-actions">
            <button class="gear-btn sort-btn" @click="autoSortInventory">🔀 SORT</button>
            <button class="gear-btn salvage-btn" :class="{ active: s.salvageMode }" @click="toggleSalvageMode">♻️ SALVAGE</button>
            <button class="gear-btn reforge-btn" @click="gameStore.state.previousPanel = 'inventory'; gameStore.state.activePanel = 'reforge'">🔥 REFORGE</button>
            <button class="gear-btn socket-btn" @click="gameStore.state.previousPanel = 'inventory'; gameStore.state.activePanel = 'socketing'">💎 SOCKET</button>
        </div>
        
        <!-- Salvage Mode Banner -->
        <div v-if="s.salvageMode" class="salvage-banner">
            ♻️ SALVAGE MODE: Click equipment to convert to materials
        </div>
        
        <!-- Equipment Inventory -->
        <div class="gear-inventory-header">📦 EQUIPMENT ({{ equipmentInventory.length }})</div>
        <div class="inv-grid gear-grid">
          <div
            v-for="(item, i) in equipmentInventory"
            :key="item.id || i"
            class="inv-item"
            :class="{ selected: selectedItem === item }"
            :style="{ borderColor: getRarityColor(item.rarity) }"
            @click="handleItemClick(item, i)"
          >
            <div class="item-icon">{{ getItemIcon(item) }}</div>
            <div v-if="item.dropFloor" class="floor-badge">F{{ item.dropFloor }}</div>
            <div class="item-name" :style="{ color: getRarityColor(item.rarity) }">
              {{ item.name }}
            </div>
            <small class="item-type">{{ item.slot }}</small>
            <div class="socket-display" v-if="getSocketDisplay(item)">{{ getSocketDisplay(item) }}</div>
            <div class="curse-indicator" v-if="item.curses">☠️</div>
          </div>
          
          <div v-if="equipmentInventory.length === 0" class="empty-msg">
            No equipment in inventory
          </div>
        </div>
    </div>

    <!-- Grid (for non-GEAR tabs) -->
    <div v-else class="inv-grid" ref="gridRef">
      <RecycleScroller
        v-if="filteredInventory && filteredInventory.length > 0"
        class="scroller"
        :items="chunkedInventory"
        :item-size="110"
        key-field="id"
        v-slot="{ item: row }"
      >
        <div class="inv-row" :style="{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '10px' }">
            <div
                v-for="(item, colIndex) in row.items"
                :key="row.id + '_' + colIndex"
                class="inv-item"
                :class="{ selected: selectedItem === item }"
                :style="{ borderColor: getRarityColor(item.rarity) }"
                @click="handleItemClick(item, row.id * columns + colIndex)"
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
        </div>
      </RecycleScroller>

      <div
        v-else
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
                <span v-if="selectedItem.atk" class="item-stat">⚔️ ATK: {{ selectedItem.atk }}</span>
                <span v-if="selectedItem.def" class="item-stat">🛡️ DEF: {{ selectedItem.def }}</span>
                <span v-if="selectedItem.hp" class="item-stat">❤️ HP: {{ selectedItem.hp }}</span>
                <span v-if="selectedItem.str" class="item-stat stat-str">💪 STR: {{ selectedItem.str }}</span>
                <span v-if="selectedItem.vit" class="item-stat stat-vit">❤️ VIT: {{ selectedItem.vit }}</span>
                <span v-if="selectedItem.int" class="item-stat stat-int">🔮 INT: {{ selectedItem.int }}</span>
                <!-- v38.4: AGI/LUCK display -->
                <span v-if="selectedItem.agi" class="item-stat stat-agi">🏃 AGI: {{ selectedItem.agi }}</span>
                <span v-if="selectedItem.luck" class="item-stat stat-lck">🍀 LCK: {{ selectedItem.luck }}</span>
                <span v-if="selectedItem.val" class="item-stat">💚 Heal: {{ selectedItem.val }}</span>
                <span v-if="selectedItem.price" class="item-stat" style="color:var(--c-gold)">💰 Val: {{ selectedItem.price }} G</span>
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
    
    <!-- Footer Buttons -->
    <div class="inv-footer">
        <button class="footer-btn oracle-btn" @click="toggleOracle" :class="{ active: s.inspectMode }">
            ✨ ORACLE
        </button>
        <button class="footer-btn back-btn" @click="goBack">
            ⬅️ BACK
        </button>
    </div>
  </div>
</template>

<style scoped>
.inv-panel {
  background: var(--bg-core);
  padding: 10px;
  height: 100%;
  display: flex; flex-direction: column;
}

.header {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: 5px; margin-bottom: 5px;
}
.header h3 { margin: 0; color: var(--text-primary); font-size:1rem; }

.toolbar { display: flex; gap: 5px; }
.toolbar button { 
    background: #222; border: 1px solid #444; color: var(--text-primary); 
    cursor: pointer; padding: 4px 8px; font-size:1rem;
}
.toolbar button.active {
    background: var(--c-purple); border-color: #f0f;
    box-shadow: 0 0 5px var(--c-purple);
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
    color: var(--text-primary); background: #333; border-bottom-color: var(--c-gold);
}

.craft-btn {
  background: linear-gradient(to bottom, #2a4a2a, #1a3a1a);
  border-color: var(--c-green);
}

.craft-btn:hover {
  background: linear-gradient(to bottom, #3a5a3a, #2a4a2a);
}

.reforge-btn {
  background: linear-gradient(to bottom, #4a2a2a, #3a1a1a);
  border-color: var(--c-red-bright);
}

.reforge-btn:hover {
  background: linear-gradient(to bottom, #5a3a3a, #4a2a4a);
}

.market-btn {
  background: linear-gradient(to bottom, #3a1a4a, #2a0a3a);
  border-color: var(--c-purple);
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
  flex: 1; 
  padding: 8px;
  margin-bottom: 10px;
  background: var(--glass-bg, rgba(20, 20, 25, 0.6));
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.05));
  overflow: hidden; /* v38.8: For virtual scroller */
  display: flex;
  flex-direction: column;
}

/* Native Grid (for Gear tab) */
.inv-grid.gear-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
  gap: 10px;
  overflow-y: auto; 
}

/* v38.8: Virtual Scroll Styles */
.scroller {
  height: 100%;
}
.inv-row {
  /* Note: grid styles applied inline for dynamic columns */
  padding-bottom: 10px;
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
.inv-item[style*="rare-rare"] {
  box-shadow: 0 0 8px rgba(77, 136, 255, 0.3);
}
.inv-item[style*="rare-rare"]:hover {
  box-shadow: 0 0 15px rgba(77, 136, 255, 0.5), 0 8px 20px rgba(0, 0, 0, 0.5);
}

.inv-item[style*="rare-epic"] {
  box-shadow: 0 0 8px rgba(155, 89, 182, 0.3);
}
.inv-item[style*="rare-epic"]:hover {
  box-shadow: 0 0 15px rgba(155, 89, 182, 0.5), 0 8px 20px rgba(0, 0, 0, 0.5);
}

.inv-item[style*="rare-legend"] {
  box-shadow: 0 0 8px rgba(207, 170, 76, 0.3);
  animation: legendaryShimmer 3s ease-in-out infinite;
}
.inv-item[style*="rare-legend"]:hover {
  box-shadow: 0 0 20px rgba(207, 170, 76, 0.6), 0 8px 20px rgba(0, 0, 0, 0.5);
}

.inv-item[style*="rare-mythic"] {
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.4);
  animation: mythicPulse 2s ease-in-out infinite;
}
.inv-item[style*="rare-mythic"]:hover {
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
  color: var(--c-gold);
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
  color: var(--c-gold-bright);
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
  color: var(--c-green-bright);
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

/* v38.4: Colored stat classes for item display */
.item-stat { margin-right: 8px; }
.stat-str { color: #f44 !important; }
.stat-vit { color: #4f4 !important; }
.stat-int { color: #4af !important; }
.stat-agi { color: #4fa !important; }
.stat-lck { color: #fa4 !important; }

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

/* v38.0: Footer Buttons */
.inv-footer {
    display: flex;
    gap: 10px;
    padding: 10px 0;
    margin-top: auto;
    border-top: 1px solid #333;
}

.footer-btn {
    flex: 1;
    padding: 12px;
    font-size: 1rem;
    font-weight: bold;
    border: 2px solid;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.oracle-btn {
    background: linear-gradient(135deg, #2a1a4a, #1a0a3a);
    border-color: #8a4af0;
    color: #d4a0ff;
}

.oracle-btn:hover, .oracle-btn.active {
    background: linear-gradient(135deg, #4a2a6a, #3a1a5a);
    box-shadow: 0 0 15px rgba(138, 74, 240, 0.5);
}

.back-btn {
    background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
    border-color: #666;
    color: var(--text-primary);
}

.back-btn:hover {
    background: linear-gradient(135deg, #3a3a3a, #2a2a2a);
    border-color: #888;
}

/* v38.0: GEAR Panel Styles */
.gear-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    overflow-y: auto;
}

.equipped-slots {
    display: flex;
    gap: 10px;
    justify-content: center;
    padding: 10px;
    background: rgba(0, 100, 200, 0.1);
    border: 1px solid rgba(0, 170, 255, 0.3);
    border-radius: 8px;
}

.equip-slot {
    flex: 1;
    max-width: 100px;
    padding: 10px 8px;
    background: linear-gradient(135deg, #1a2a3a, #0a1a2a);
    border: 2px solid #334;
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.equip-slot:hover {
    border-color: #0af;
    box-shadow: 0 0 10px rgba(0, 170, 255, 0.3);
}

.equip-slot.selected {
    border-color: #0af;
    box-shadow: 0 0 15px rgba(0, 170, 255, 0.5);
}

.equip-slot.filled {
    background: linear-gradient(135deg, #2a3a4a, #1a2a3a);
}

.slot-icon {
    font-size: 1.5rem;
    margin-bottom: 4px;
}

.slot-label {
    font-size: 0.7rem;
    color: #888;
    font-weight: bold;
    text-transform: uppercase;
}

.slot-item {
    font-size: 0.75rem;
    font-weight: bold;
    margin-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.slot-empty {
    font-size: 0.7rem;
    color: #555;
    font-style: italic;
    margin-top: 4px;
}

.gear-actions {
    display: flex;
    gap: 8px;
}

.gear-btn {
    flex: 1;
    padding: 10px;
    font-size: 0.85rem;
    font-weight: bold;
    border: 2px solid;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.gear-btn.sort-btn {
    background: linear-gradient(135deg, #2a3a2a, #1a2a1a);
    border-color: #4a4;
    color: #8f8;
}

.gear-btn.sort-btn:hover {
    background: linear-gradient(135deg, #3a4a3a, #2a3a2a);
    box-shadow: 0 0 10px rgba(68, 170, 68, 0.3);
}

.gear-btn.reforge-btn {
    background: linear-gradient(135deg, #4a2a2a, #3a1a1a);
    border-color: #f44;
    color: #f88;
}

.gear-btn.reforge-btn:hover {
    background: linear-gradient(135deg, #5a3a3a, #4a2a2a);
    box-shadow: 0 0 10px rgba(255, 68, 68, 0.3);
}

.gear-btn.socket-btn {
    background: linear-gradient(135deg, #3a2a4a, #2a1a3a);
    border-color: #a4f;
    color: #d8f;
}

.gear-btn.socket-btn:hover {
    background: linear-gradient(135deg, #4a3a5a, #3a2a4a);
    box-shadow: 0 0 10px rgba(170, 68, 255, 0.3);
}

.gear-inventory-header {
    font-size: 0.85rem;
    font-weight: bold;
    color: var(--text-primary);
    padding: 5px 0;
    border-bottom: 1px solid #333;
}

.gear-grid {
    max-height: 200px;
    overflow-y: auto;
}

/* v38.0: Salvage styles */
.gear-btn.salvage-btn {
    background: linear-gradient(135deg, #3a3a2a, #2a2a1a);
    border-color: #aa8;
    color: #dd8;
}

.gear-btn.salvage-btn:hover {
    background: linear-gradient(135deg, #4a4a3a, #3a3a2a);
    box-shadow: 0 0 10px rgba(170, 170, 68, 0.3);
}

.gear-btn.salvage-btn.active {
    background: linear-gradient(135deg, #5a5a2a, #4a4a1a);
    border-color: #ff0;
    color: #ff0;
    box-shadow: 0 0 15px rgba(255, 255, 0, 0.4);
}

.salvage-banner {
    padding: 8px 12px;
    background: rgba(170, 170, 68, 0.2);
    border: 1px solid rgba(255, 255, 0, 0.5);
    border-radius: 6px;
    text-align: center;
    font-size: 0.85rem;
    color: #ff0;
    font-weight: bold;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}
</style>
