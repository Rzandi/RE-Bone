<script setup>
import { ref, computed } from 'vue';
import { gameStore } from '../game/store.js';
import { DB } from '../game/config/database.js';
import { SocketManager } from '../game/managers/SocketManager.js';
import { Player } from '../game/logic/Player.js';

const s = gameStore.state;

// Filter items with sockets
const socketableItems = computed(() => {
  if (!s.inventory) return [];
  
  return s.inventory.filter(item => 
    item.sockets && item.sockets.length > 0
  );
});

// Get player gems from inventory (s.gems is widely used for currency, but physical gems are in inventory)
const playerGems = computed(() => {
  return (s.inventory || []).filter(i => i.type === 'gem');
});

// Selected item for socketing
const selectedItem = ref(null);
const selectedSocket = ref(null);

// Select item to socket
const selectItem = (item) => {
  selectedItem.value = item;
  selectedSocket.value = null;
};

// Select socket slot
const selectSocket = (index) => {
  if (!selectedItem.value) return;
  selectedSocket.value = index;
};

// Insert gem into selected socket
const insertGem = (gemType) => {
  if (!selectedItem.value || selectedSocket.value === null) {
    gameStore.log('Select an item and socket first!', 'error');
    return;
  }
  
  const result = SocketManager.insertGem(
    selectedItem.value, 
    selectedSocket.value, 
    gemType
  );
  
  if (!result.success) {
    gameStore.log(result.error, 'error');
  } else {
    // v37.0: Recalc after socketing to apply bonuses
    if (Player && Player.recalc) {
      Player.recalc();
    }
  }
};

// Remove gem from socket
const removeGem = (socketIndex) => {
  if (!selectedItem.value) return;
  
  SocketManager.removeGem(selectedItem.value, socketIndex);
  // v37.0: Recalc after removing to update bonuses
  if (Player && Player.recalc) {
    Player.recalc();
  }
};

// Get gem info
const getGemInfo = (gemType) => {
  return DB.GEMS[gemType];
};

// Get socket display
const getSocketDisplay = (item) => {
  if (!item.sockets) return '';
  return SocketManager.getSocketDisplay(item);
};

// Close panel - return to previous or inventory
const close = () => {
    // v38.2: Context-aware return (Fixes Combat -> Socketing -> Back bug)
    if (s.previousPanel) {
        const prev = s.previousPanel;
        s.previousPanel = null;
        s.activePanel = prev;
    } else {
        s.activePanel = 'inventory';
    }
};
</script>

<template>
  <div class="socketing-panel scanline">
    <div class="panel-header">
      <h2>💎 GEM SOCKETING</h2>
      <button @click="close" class="close-btn">✕</button>
    </div>

    <div class="socketing-content">
      <!-- Left: Item Selection -->
      <div class="item-list">
        <h3>Socketable Items ({{ socketableItems.length }})</h3>
        
        <div v-if="socketableItems.length === 0" class="empty-state">
          <p>🔍 No items with sockets yet</p>
          <small>Defeat enemies to find equipment with sockets!</small>
        </div>
        
        <div v-else class="items-grid">
          <div
            v-for="item in socketableItems"
            :key="item.id"
            class="item-card"
            :class="{ selected: selectedItem === item }"
            @click="selectItem(item)"
          >
            <div class="item-name">{{ item.name }}</div>
            <div class="item-sockets">{{ getSocketDisplay(item) }}</div>
            <div class="item-rarity" :class="item.rarity">{{ item.rarity }}</div>
          </div>
        </div>
      </div>

      <!-- Center: Socket Grid -->
      <div class="socket-workspace" v-if="selectedItem">
        <h3>{{ selectedItem.name }}</h3>
        <p class="item-desc">{{ selectedItem.desc || 'Equipment with gem sockets' }}</p>
        
        <div class="sockets">
          <div
            v-for="(gemType, index) in selectedItem.sockets"
            :key="index"
            class="socket"
            :class="{ 
              filled: gemType, 
              selected: selectedSocket === index,
              empty: !gemType 
            }"
            @click="selectSocket(index)"
          >
            <div class="socket-icon">
              {{ gemType ? getGemInfo(gemType).icon : '⭕' }}
            </div>
            <div v-if="gemType" class="socket-label">
              {{ getGemInfo(gemType).name }}
            </div>
            <div v-else class="socket-label">Empty</div>
            
            <button
              v-if="gemType"
              @click.stop="removeGem(index)"
              class="remove-gem-btn"
              title="Remove gem"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div v-if="selectedSocket !== null" class="socket-hint">
          💡 Select a gem below to insert into socket {{ selectedSocket + 1 }}
        </div>
      </div>

      <div v-else class="socket-workspace empty">
        <p>← Select an item to begin socketing</p>
      </div>

      <!-- Right: Gem Inventory -->
      <div class="gem-inventory">
        <h3>Your Gems ({{ playerGems.length }} types)</h3>
        
        <div v-if="playerGems.length === 0" class="empty-state">
          <p>💎 No gems collected</p>
          <small>Gems drop from enemies!</small>
        </div>
        
        <div v-else class="gems-list">
          <div
            v-for="gem in playerGems"
            :key="gem.type"
            class="gem-card"
            :class="getGemInfo(gem.type).rarity"
            @click="insertGem(gem.type)"
          >
            <div class="gem-icon">{{ getGemInfo(gem.type).icon }}</div>
            <div class="gem-info">
              <div class="gem-name">{{ getGemInfo(gem.type).name }}</div>
              <div class="gem-quantity">×{{ gem.quantity }}</div>
              <div class="gem-bonus">
                {{ Object.entries(getGemInfo(gem.type).bonus).map(([stat, val]) => 
                  `+${val} ${stat.toUpperCase()}`
                ).join(', ') }}
              </div>
              <div class="gem-desc">{{ getGemInfo(gem.type).desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.socketing-panel {
  background: #1a1a1a;
  border: 2px solid #444;
  border-radius: 8px;
  padding: 20px;
  max-width: 1200px;
  margin: 20px auto;
  min-height: 600px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #444;
  padding-bottom: 10px;
}

.panel-header h2 {
  color: #ffd700;
  margin: 0;
}

.close-btn {
  background: #d33;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
}

.close-btn:hover {
  background: #f55;
}

.socketing-content {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr;
  gap: 20px;
}

/* Item List */
.item-list h3,
.gem-inventory h3,
.socket-workspace h3 {
  color: #ffd700;
  font-size: 16px;
  margin-bottom: 10px;
}

.items-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 500px;
  overflow-y: auto;
}

.item-card {
  background: #2a2a2a;
  border: 2px solid #444;
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.item-card:hover {
  border-color: #ffd700;
  background: #333;
}

.item-card.selected {
  border-color: #ffd700;
  background: #3a3a00;
}

.item-name {
  font-weight: bold;
  color: #fff;
  margin-bottom: 4px;
}

.item-sockets {
  font-size: 20px;
  margin: 6px 0;
}

.item-rarity {
  font-size: 12px;
  text-transform: uppercase;
  font-weight: bold;
}

.item-rarity.common { color: #aaa; }
.item-rarity.uncommon { color: #0f0; }
.item-rarity.rare { color: #0af; }
.item-rarity.epic { color: #d0f; }
.item-rarity.legendary { color: #ffa500; }

/* Socket Workspace */
.socket-workspace {
  background: #222;
  border: 2px solid #444;
  border-radius: 6px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.socket-workspace.empty {
  justify-content: center;
  color: #888;
  font-style: italic;
}

.item-desc {
  color: #aaa;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
}

.sockets {
  display: flex;
  gap: 20px;
  margin: 20px 0;
}

.socket {
  background: #1a1a1a;
  border: 3px solid #444;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
}

.socket.empty {
  border-style: dashed;
}

.socket.filled {
  border-color: #ffd700;
  background: #2a2a00;
}

.socket.selected {
  border-color: #0ff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  transform: scale(1.1);
}

.socket:hover {
  border-color: #ffd700;
}

.socket-icon {
  font-size: 32px;
}

.socket-label {
  font-size: 10px;
  color: #aaa;
  margin-top: 4px;
}

.remove-gem-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #d33;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-gem-btn:hover {
  background: #f55;
}

.socket-hint {
  color: #ffd700;
  font-size: 14px;
  margin-top: 10px;
  animation: pulse 2s infinite;
}

/* Gem Inventory */
.gems-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 500px;
  overflow-y: auto;
}

.gem-card {
  background: #2a2a2a;
  border: 2px solid #444;
  border-radius: 6px;
  padding: 10px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.gem-card:hover {
  border-color: #ffd700;
  background: #333;
  transform: translateX(5px);
}

.gem-card.common { border-left: 4px solid #aaa; }
.gem-card.rare { border-left: 4px solid #0af; }
.gem-card.epic { border-left: 4px solid #d0f; }
.gem-card.legendary { border-left: 4px solid #ffa500; }

.gem-icon {
  font-size: 32px;
}

.gem-info {
  flex: 1;
}

.gem-name {
  font-weight: bold;
  color: #fff;
  font-size: 14px;
}

.gem-quantity {
  color: #ffd700;
  font-size: 12px;
}

.gem-bonus {
  color: #0f0;
  font-size: 12px;
  margin: 4px 0;
}

.gem-desc {
  color: #aaa;
  font-size: 11px;
}

/* Empty States */
.empty-state {
  text-align: center;
  color: #666;
  padding: 40px 20px;
}

.empty-state p {
  font-size: 18px;
  margin-bottom: 8px;
}

.empty-state small {
  font-size: 12px;
}

/* Mobile */
@media (max-width: 767px) {
  .socketing-content {
    grid-template-columns: 1fr;
  }
  
  .sockets {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .socket {
    width: 80px;
    height: 80px;
  }
}

/* Animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
