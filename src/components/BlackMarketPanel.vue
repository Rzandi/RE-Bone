<script setup>
import { ref, computed } from 'vue';
import { gameStore } from '../game/store.js';

const s = gameStore.state;
const activeTab = ref('boxes'); // 'boxes' | 'cursed' | 'services'
const selectedBox = ref(null);
const boxCurrency = ref('soul'); // 'soul' | 'gold'
const isOpening = ref(false);
const lastResult = ref(null);
const viewMode = ref('default'); // 'default' | 'cleanse'

// Get dealer reputation
const dealerRep = computed(() => {
  if (!window.BlackMarketManager) return 0;
  return window.BlackMarketManager.getDealerReputation();
});

// Get discount
const discount = computed(() => {
  if (!window.BlackMarketManager) return 0;
  return window.BlackMarketManager.getDiscount();
});

// Available boxes based on reputation
const availableBoxes = computed(() => {
  const rep = dealerRep.value;
  const boxes = [];
  
  if (boxCurrency.value === 'soul') {
    boxes.push({ key: 'small', ...window.BlackMarketManager?.soulBoxes?.small });
    if (rep >= 2) boxes.push({ key: 'medium', ...window.BlackMarketManager?.soulBoxes?.medium });
    if (rep >= 3) boxes.push({ key: 'large', ...window.BlackMarketManager?.soulBoxes?.large });
  } else {
    boxes.push({ key: 'bronze', ...window.BlackMarketManager?.goldBoxes?.bronze });
    if (rep >= 2) boxes.push({ key: 'silver', ...window.BlackMarketManager?.goldBoxes?.silver });
    if (rep >= 3) boxes.push({ key: 'gold', ...window.BlackMarketManager?.goldBoxes?.gold });
  }
  
  return boxes;
});

// Cursed items for sale
const cursedStock = computed(() => {
  if (!window.BlackMarketManager) return [];
  return window.BlackMarketManager.generateDealerStock(s.floor || 1).cursedItems;
  return window.BlackMarketManager.generateDealerStock(s.floor || 1).cursedItems;
});

// Player's cursed items for cleansing
const cursedInventory = computed(() => {
  return (s.inventory || []).filter(item => item && item.curses);
});

// Available services
const availableServices = computed(() => {
  const rep = dealerRep.value;
  const services = [];
  
  if (rep >= 3) {
    services.push({ key: 'identify', name: 'Identify Curse', icon: '🔍' });
    services.push({ key: 'curse_transfer', name: 'Transfer Curse', icon: '🔄' });
  }
  if (rep >= 4) {
    services.push({ key: 'curse_removal', name: 'Remove Curse', icon: '✨' });
    services.push({ key: 'curse_amplify', name: 'Amplify Curse', icon: '⚡' });
  }
  
  return services;
});

// Get box cost with discount
const getBoxCost = (box) => {
  if (!box) return 0;
  return Math.floor(box.cost * (1 - discount.value));
};

// Check if can afford box
const canAffordBox = (box) => {
  if (!box) return false;
  const cost = getBoxCost(box);
  if (boxCurrency.value === 'soul') {
    return (Number(s.souls) || 0) >= cost;
  }
  return s.gold >= cost;
};

// Open mystery box
const openBox = async (box) => {
  if (!window.BlackMarketManager || isOpening.value) return;
  
  isOpening.value = true;
  lastResult.value = null;
  selectedBox.value = box;
  
  // Animate delay
  await new Promise(r => setTimeout(r, 1500));
  
  const result = window.BlackMarketManager.openBox(box.key, boxCurrency.value);
  
  if (result.success) {
    lastResult.value = result;
    if (window.SoundManager) window.SoundManager.play('loot');
  } else {
    gameStore.log(result.error, 'error');
  }
  
  isOpening.value = false;
};

// Buy cursed item
const buyCursedItem = (item) => {
  if (!item) return;
  
  const cost = Math.floor(item.price * (1 - discount.value));
  
  if (s.gold < cost) {
    gameStore.log('Not enough gold!', 'error');
    return;
  }
  
  s.gold -= cost;
  
  // Create copy of item for inventory
  const newItem = { ...item };
  if (window.Player) {
    window.Player.addItem(newItem);
  } else {
    s.inventory.push(newItem);
  }
  
  // Track cursed items owned
  if (!s.cursedItemsOwned) s.cursedItemsOwned = [];
  if (!s.cursedItemsOwned.includes(item.id)) {
    s.cursedItemsOwned.push(item.id);
  }
  
  if (window.BlackMarketManager) {
    window.BlackMarketManager.recordPurchase();
  }
  
  gameStore.log(`☠️ Purchased ${item.name}!`, 'danger');
  if (window.SoundManager) window.SoundManager.play('buy');
};

// Get rarity color
const getRarityColor = (rarity) => {
  const colors = {
    common: '#aaa',
    uncommon: '#4f4',
    rare: '#4af',
    epic: '#d0d',
    legendary: '#fa0'
  };
  return colors[rarity] || '#fff';
};

// Handle service click
const handleService = (service) => {
  if (service.key === 'curse_removal') {
    viewMode.value = 'cleanse';
  } else {
    gameStore.log('Service not yet implemented.', 'warning');
  }
};

// Cleanse item
const cleanseItem = (item) => {
  if (!window.BlackMarketManager) return;
  
  const result = window.BlackMarketManager.cleanseCurse(item);
  if (result.success) {
    viewMode.value = 'default';
  } else {
    gameStore.log(result.error || "Failed to cleanse", 'error');
  }
};

// Close panel
const close = () => {
  gameStore.state.activePanel = 'menu-view';
};
</script>

<template>
  <div class="black-market-panel">
    <!-- Header -->
    <div class="panel-header">
      <h2>☠️ THE BLACK MARKET</h2>
      <div class="reputation">
        <span>Rep: {{ dealerRep }}/5</span>
        <span v-if="discount > 0" class="discount">-{{ Math.round(discount * 100) }}%</span>
      </div>
      <button class="close-btn" @click="close">✖</button>
    </div>

    <!-- Currency Display -->
    <div class="currency-bar">
      <span class="currency souls">💀 {{ s.souls || 0 }} Souls</span>
      <span class="currency gold">💰 {{ s.gold }} Gold</span>
    </div>

    <!-- Tab Switcher -->
    <div class="tab-switcher">
      <button 
        :class="{ active: activeTab === 'boxes' }"
        @click="activeTab = 'boxes'">
        📦 Mystery Boxes
      </button>
      <button 
        :class="{ active: activeTab === 'cursed' }"
        @click="activeTab = 'cursed'">
        ☠️ Cursed Items
      </button>
      <button 
        :class="{ active: activeTab === 'services' }"
        :disabled="dealerRep < 3"
        @click="activeTab = 'services'">
        🔮 Services
      </button>
    </div>

    <!-- Content Area -->
    <div class="market-content">
      
      <!-- MYSTERY BOXES TAB -->
      <div v-if="activeTab === 'boxes'" class="boxes-tab">
        <!-- Currency Toggle -->
        <div class="currency-toggle">
          <button 
            :class="{ active: boxCurrency === 'soul' }"
            @click="boxCurrency = 'soul'">
            💀 Soul Boxes
          </button>
          <button 
            :class="{ active: boxCurrency === 'gold' }"
            @click="boxCurrency = 'gold'">
            💰 Gold Chests
          </button>
        </div>

        <!-- Box Grid -->
        <div class="box-grid">
          <div 
            v-for="box in availableBoxes" 
            :key="box.key"
            class="box-card"
            :class="{ opening: isOpening && selectedBox?.key === box.key }"
            @click="!isOpening && canAffordBox(box) && openBox(box)">
            
            <div class="box-icon">📦</div>
            <div class="box-name">{{ box.name }}</div>
            <div class="box-cost" :class="{ unaffordable: !canAffordBox(box) }">
              {{ getBoxCost(box) }} {{ boxCurrency === 'soul' ? 'Souls' : 'Gold' }}
            </div>
            <div class="box-info">
              <small>{{ box.minRarity }} - {{ box.maxRarity }}</small>
              <small v-if="box.cursedChance > 0">{{ Math.round(box.cursedChance * 100) }}% cursed</small>
            </div>
          </div>
        </div>

        <!-- Opening Animation -->
        <div v-if="isOpening" class="opening-animation">
          <div class="shaking-box">📦</div>
          <p>Opening...</p>
        </div>

        <!-- Result Display -->
        <div v-if="lastResult && !isOpening" class="result-display">
          <h3>You got:</h3>
          <div 
            class="result-item"
            :style="{ borderColor: getRarityColor(lastResult.item?.rarity) }">
            <span class="item-name" :style="{ color: getRarityColor(lastResult.item?.rarity) }">
              {{ lastResult.item?.name || 'Nothing' }}
            </span>
            <span class="item-rarity">{{ lastResult.item?.rarity?.toUpperCase() }}</span>
            <span v-if="lastResult.wasPity" class="pity-badge">PITY!</span>
          </div>
          <div v-if="lastResult.gems?.length" class="gems-received">
            + {{ lastResult.gems.length }} gems!
          </div>
        </div>
      </div>

      <!-- CURSED ITEMS TAB -->
      <div v-if="activeTab === 'cursed'" class="cursed-tab">
        <div class="cursed-warning">
          ⚠️ Cursed items have powerful buffs but also dangerous drawbacks!
        </div>

        <div class="cursed-grid">
          <div 
            v-for="item in cursedStock" 
            :key="item.id"
            class="cursed-card">
            
            <div class="item-header">
              <span class="item-icon">{{ item.icon }}</span>
              <span class="item-name" :style="{ color: getRarityColor(item.rarity) }">
                {{ item.name }}
              </span>
            </div>

            <div class="item-desc">{{ item.desc }}</div>

            <div class="item-effects">
              <div class="buffs">
                <span v-for="(val, key) in item.buffs" :key="key" class="buff">
                  +{{ typeof val === 'number' ? (val > 1 ? Math.round((val-1)*100) : Math.round(val*100)) : '' }}% {{ key }}
                </span>
              </div>
              <div class="curses">
                <span v-for="(val, key) in item.curses" :key="key" class="curse">
                  {{ typeof val === 'number' ? (val < 1 ? Math.round((1-val)*100) : val) : '' }}{{ typeof val === 'number' ? (val < 1 ? '% ' : ' ') : '' }}{{ key }}
                </span>
              </div>
            </div>

            <div class="item-price">
              <span>{{ Math.floor(item.price * (1 - discount)) }} Gold</span>
              <button 
                @click="buyCursedItem(item)"
                :disabled="s.gold < Math.floor(item.price * (1 - discount))">
                BUY
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SERVICES TAB -->
      <div v-if="activeTab === 'services'" class="services-tab">
        <div v-if="dealerRep < 3" class="locked-message">
          🔒 Services unlock at Reputation Level 3
        </div>

        <div v-else-if="viewMode === 'cleanse'" class="cleanse-view">
          <div class="cleanse-header">
            <h3>Select Item to Cleanse (Cost: 50 Souls)</h3>
             <button class="back-btn" @click="viewMode = 'default'">⬅ Back</button>
          </div>
          
          <div v-if="cursedInventory.length === 0" class="empty-msg">
            No cursed items in inventory.
          </div>
          
          <div class="cursed-grid">
             <div 
              v-for="item in cursedInventory" 
              :key="item.id"
              class="cursed-card hover-effect"
              @click="cleanseItem(item)">
              
              <div class="item-header">
                <span class="item-icon">{{ item.icon }}</span>
                <span class="item-name" :style="{ color: getRarityColor(item.rarity) }">
                  {{ item.name }}
                </span>
              </div>
              
              <div class="item-effects">
                 <div class="curses">
                  <span v-for="(val, key) in item.curses" :key="key" class="curse">
                    {{ key }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="services-grid">
          <div 
            v-for="service in availableServices" 
            :key="service.key"
            class="service-card"
            @click="handleService(service)">
            <div class="service-icon">{{ service.icon }}</div>
            <div class="service-name">{{ service.name }}</div>
            <div class="service-costs">
              <span>💀 {{ window.BlackMarketManager?.serviceCosts?.[service.key]?.souls || '?' }} Souls</span>
              <span>💰 {{ window.BlackMarketManager?.serviceCosts?.[service.key]?.gold || '?' }} Gold</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.black-market-panel {
  background: linear-gradient(135deg, #0a0a0a, #1a0a1a, #0a0a1a);
  color: #fff;
  padding: 20px;
  min-height: 100%;
  position: relative;
  overflow: hidden;
}

/* Animated fog background */
.black-market-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(ellipse at 20% 80%, rgba(139, 0, 0, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(128, 0, 128, 0.1) 0%, transparent 50%);
  animation: fog-drift 10s ease-in-out infinite alternate;
  pointer-events: none;
  z-index: 0;
}

@keyframes fog-drift {
  0% { opacity: 0.5; transform: translateX(-5%); }
  100% { opacity: 0.8; transform: translateX(5%); }
}

/* Floating particles */
.black-market-panel::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, rgba(255,0,0,0.3), transparent),
    radial-gradient(2px 2px at 80px 60px, rgba(128,0,128,0.4), transparent),
    radial-gradient(2px 2px at 140px 90px, rgba(255,0,0,0.3), transparent),
    radial-gradient(2px 2px at 200px 30px, rgba(128,0,128,0.3), transparent);
  background-size: 250px 120px;
  animation: particles-float 8s linear infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes particles-float {
  0% { transform: translateY(0); }
  100% { transform: translateY(-120px); }
}

/* Ensure content is above effects */
.black-market-panel > * {
  position: relative;
  z-index: 1;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #8b0000;
}

.panel-header h2 {
  margin: 0;
  color: #ff4444;
  text-shadow: 
    0 0 10px rgba(255,0,0,0.5),
    0 0 20px rgba(255,0,0,0.3),
    0 0 30px rgba(139,0,0,0.2);
  animation: title-glow 3s ease-in-out infinite alternate;
}

@keyframes title-glow {
  0% { text-shadow: 0 0 10px rgba(255,0,0,0.5), 0 0 20px rgba(255,0,0,0.3); }
  100% { text-shadow: 0 0 20px rgba(255,0,0,0.8), 0 0 40px rgba(255,0,0,0.5), 0 0 60px rgba(139,0,0,0.3); }
}

.reputation {
  display: flex;
  gap: 10px;
  color: #aaa;
}

.discount {
  color: #4f4;
  font-weight: bold;
}

.close-btn {
  background: #8b0000;
  color: #fff;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
}

.currency-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(0,0,0,0.5);
  border-radius: 4px;
}

.currency {
  font-weight: bold;
}

.currency.souls { color: #d0d; }
.currency.gold { color: #fa0; }

.tab-switcher {
  display: flex;
  gap: 5px;
  margin-bottom: 15px;
}

.tab-switcher button {
  flex: 1;
  padding: 10px;
  background: #1a1a1a;
  border: 1px solid #333;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-switcher button.active {
  background: #3a1a3a;
  border-color: #8b0000;
  color: #fff;
}

.tab-switcher button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.market-content {
  min-height: 400px;
}

/* Mystery Boxes */
.currency-toggle {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.currency-toggle button {
  flex: 1;
  padding: 8px;
  background: #1a1a1a;
  border: 1px solid #333;
  color: #888;
  cursor: pointer;
}

.currency-toggle button.active {
  background: #2a1a3a;
  border-color: #d0d;
  color: #fff;
}

.box-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.box-card {
  background: #1a1a1a;
  border: 2px solid #333;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.box-card:hover {
  border-color: #8b0000;
  transform: scale(1.05);
}

.box-card.opening {
  animation: box-shake 0.5s infinite, box-glow 0.5s infinite alternate;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px) rotate(-5deg); }
  75% { transform: translateX(5px) rotate(5deg); }
}

@keyframes box-shake {
  0%, 100% { transform: translateX(0) scale(1.05); }
  10% { transform: translateX(-3px) rotate(-2deg) scale(1.06); }
  20% { transform: translateX(3px) rotate(2deg) scale(1.04); }
  30% { transform: translateX(-4px) rotate(-3deg) scale(1.07); }
  40% { transform: translateX(4px) rotate(3deg) scale(1.05); }
  50% { transform: translateX(-3px) rotate(-2deg) scale(1.08); }
  60% { transform: translateX(3px) rotate(2deg) scale(1.04); }
  70% { transform: translateX(-2px) rotate(-1deg) scale(1.06); }
  80% { transform: translateX(2px) rotate(1deg) scale(1.05); }
  90% { transform: translateX(-1px) rotate(-1deg) scale(1.07); }
}

@keyframes box-glow {
  0% { box-shadow: 0 0 10px rgba(139,0,0,0.5), 0 0 20px rgba(139,0,0,0.3); }
  100% { box-shadow: 0 0 20px rgba(255,0,0,0.8), 0 0 40px rgba(139,0,0,0.5), 0 0 60px rgba(128,0,128,0.3); }
}

.box-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.box-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.box-cost {
  color: #fa0;
  font-weight: bold;
}

.box-cost.unaffordable {
  color: #f44;
}

.box-info {
  display: flex;
  flex-direction: column;
  margin-top: 5px;
  color: #666;
  font-size: 0.8rem;
}

.opening-animation {
  text-align: center;
  padding: 40px;
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

.shaking-box {
  font-size: 5rem;
  animation: box-shake 0.3s infinite;
  filter: drop-shadow(0 0 20px rgba(255,0,0,0.5));
}

.result-display {
  background: linear-gradient(135deg, #1a1a1a, #2a1a2a);
  border: 2px solid #fa0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-top: 20px;
  animation: result-reveal 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 0 30px rgba(255, 170, 0, 0.3);
}

@keyframes result-reveal {
  0% { opacity: 0; transform: scale(0.5) rotateY(90deg); }
  50% { opacity: 0.5; transform: scale(1.1) rotateY(0deg); }
  100% { opacity: 1; transform: scale(1) rotateY(0deg); }
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
  border: 2px solid;
  border-radius: 4px;
  margin: 10px 0;
}

.item-name {
  font-size: 1.2rem;
  font-weight: bold;
}

.pity-badge {
  background: #fa0;
  color: #000;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.gems-received {
  color: #d0d;
  font-weight: bold;
}

/* Cursed Items */
.cursed-warning {
  background: linear-gradient(135deg, #3a1a1a, #2a0a2a);
  border: 1px solid #8b0000;
  padding: 10px;
  text-align: center;
  margin-bottom: 15px;
  border-radius: 4px;
  color: #f44;
  animation: warning-pulse 2s ease-in-out infinite;
}

@keyframes warning-pulse {
  0%, 100% { box-shadow: 0 0 5px rgba(139,0,0,0.3); }
  50% { box-shadow: 0 0 15px rgba(255,0,0,0.5), 0 0 30px rgba(139,0,0,0.3); }
}

.cursed-grid {
  display: grid;
  gap: 15px;
}

.cursed-card {
  background: linear-gradient(135deg, #1a0a1a, #0a0a1a);
  border: 2px solid #4a1a4a;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cursed-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(139,0,0,0.1), transparent);
  transform: rotate(45deg);
  animation: curse-shimmer 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes curse-shimmer {
  0% { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(100%) rotate(45deg); }
}

.cursed-card:hover {
  border-color: #8b0000;
  box-shadow: 0 0 20px rgba(139,0,0,0.4), inset 0 0 20px rgba(139,0,0,0.1);
  transform: translateY(-2px);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.item-icon {
  font-size: 1.5rem;
}

.item-desc {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 10px;
  font-style: italic;
}

.item-effects {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
}

.buffs {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.buff {
  background: linear-gradient(135deg, #1a3a1a, #0a2a0a);
  color: #4f4;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  border: 1px solid #3a5a3a;
  box-shadow: 0 0 5px rgba(68,255,68,0.2);
}

.curses {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.curse {
  background: linear-gradient(135deg, #3a1a1a, #2a0a0a);
  color: #f44;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  border: 1px solid #5a2a2a;
  box-shadow: 0 0 5px rgba(255,68,68,0.2);
  animation: curse-badge-pulse 3s ease-in-out infinite;
}

@keyframes curse-badge-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.item-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #333;
}

.item-price span {
  color: #fa0;
  font-weight: bold;
}

.item-price button {
  background: #8b0000;
  color: #fff;
  border: none;
  padding: 5px 15px;
  cursor: pointer;
  border-radius: 4px;
}

.item-price button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Services */
.locked-message {
  text-align: center;
  padding: 40px;
  color: #666;
}

.services-grid {
  gap: 15px;
}

.service-card {
  background: #1a1a1a;
  border: 1px solid #333;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.service-card:hover {
  background: #2a1a2a;
  border-color: #d0d;
  transform: translateY(-2px);
}

.cleanse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.hover-effect {
  cursor: pointer;
}

.hover-effect:hover {
  border-color: #4f4 !important; /* Green for cleanse */
}

.service-card {
  background: #1a1a1a;
  border: 2px solid #4a1a4a;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.service-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.service-name {
  font-weight: bold;
  margin-bottom: 10px;
}

.service-costs {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.9rem;
  color: #888;
}
</style>
