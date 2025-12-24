<script setup>
import { ref, computed, onMounted } from "vue";
import { gameStore } from "../game/store.js";
import { GEMS } from "../game/config/gems.js";

const s = gameStore.state;
const shopTab = ref("ITEMS"); // ITEMS | GEMS

// v37.1: Play sound helper
const playSound = (soundName) => {
  if (window.SoundManager) window.SoundManager.play(soundName);
};

// v37.1: Switch tab with sound
const switchTab = (tab) => {
  if (shopTab.value !== tab) {
    shopTab.value = tab;
    playSound('tab_switch');
  }
};

// Initialize merchant stock if empty
onMounted(() => {
  if (!s.merchantStock || s.merchantStock.length === 0) {
    if (window.LootManager) {
      const newStock = window.LootManager.generateMerchantStock(s.floor || 1);
      s.merchantStock = newStock;
    }
  }
  
  // Generate gem stock if empty
  if (!s.merchantGemStock || s.merchantGemStock.length === 0) {
    s.merchantGemStock = generateGemStock();
  }
});

const shopStock = computed(() => {
  // Use Merchant Stock from Store (which is set by EventManager or LootManager)
  // If empty, we might want to fail gracefully or show nothing
  // Existing logic used window.DB lookups. Let's map it safely.
  if(!s.merchantStock) return [];
  
  // If merchantStock contains Objects (from EventManager), use them directly.
  // If it contains ID strings (legacy/merchant), map them.
  return s.merchantStock.map(item => {
      if(typeof item === 'string') {
           return window.DB.ITEMS ? window.DB.ITEMS[item] : { name: item, price: 0 };
      }
      return item;
  }).filter(i => i);
});

// v37.0: Generate gem stock (common/rare only, epic/legendary from Blacksmith)
const generateGemStock = () => {
  const floor = s.floor || 1;
  const gemStock = [];
  
  // Filter gems: Only common and rare tiers, exclude legendary quality gems
  const availableGems = Object.values(GEMS).filter(gem => 
    (gem.rarity === 'common' || gem.rarity === 'rare') &&
    (gem.quality === 'lesser' || gem.quality === 'standard') // No perfect gems in merchant
  );
  
  // Pick 4-6 random gems
  const stockSize = 4 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < stockSize; i++) {
    const randomGem = availableGems[Math.floor(Math.random() * availableGems.length)];
    
    if (randomGem && window.SocketManager) {
      const scaledBonus = window.SocketManager.scaleGemStats(randomGem.bonus, floor);
      const basePrice = window.SocketManager.getGemValue(randomGem.rarity, floor);
      
      gemStock.push({
        id: randomGem.id,
        gemType: randomGem.id,
        name: `${randomGem.name} (FL${floor})`,
        icon: randomGem.icon,
        rarity: randomGem.rarity,
        quality: randomGem.quality,
        bonus: scaledBonus,
        price: Math.floor(basePrice * 2), // 2x sell price to buy
        desc: `${randomGem.desc}\n\nBonuses: ${Object.entries(scaledBonus).map(([s, v]) => `+${v} ${s.toUpperCase()}`).join(', ')}`,
        dropFloor: floor,
        slot: 'gem',
        type: 'gem'
      });
    }
  }
  
  return gemStock;
};

const gemStock = computed(() => {
  return s.merchantGemStock || [];
});

// v37.0 Phase 4: Economy Integration
const inflation = computed(() => {
  if (!window.EconomyManager) return 0;
  return window.EconomyManager.getInflationPercent();
});

const activeEvent = computed(() => {
  return s.economy?.activeEvent || null;
});

const isShopClosed = computed(() => {
  return activeEvent.value?.type === 'closed';
});

// Get dynamic price for item
const getDynamicPrice = (item) => {
  if (!window.EconomyManager) return item.price || 0;
  return window.EconomyManager.calculateBuyPrice(item.price || 0, item.id);
};

// Get stock badge for item (only if tracked)
const getStockBadge = (itemId) => {
  if (!window.EconomyManager) return null;
  // Only show badge if item has been purchased before
  if (!s.economy?.itemStock?.[itemId] && s.economy?.itemStock?.[itemId] !== 0) return null;
  return window.EconomyManager.getStockBadge(itemId);
};

// Check if out of stock
const isOutOfStock = (itemId) => {
  if (!window.EconomyManager) return false;
  return window.EconomyManager.getStockLevel(itemId) <= 0;
};

const canAfford = (item) => {
    const price = getDynamicPrice(item);
    return s.gold >= price && !isOutOfStock(item.id);
};

const buyItem = (item) => {
    if (!item) return;
    if (isShopClosed.value) {
      gameStore.log('Shop is CLOSED!', 'error');
      playSound('error');
      return;
    }
    if (isOutOfStock(item.id)) {
      gameStore.log('Out of stock!', 'error');
      playSound('error');
      return;
    }
    
    const price = getDynamicPrice(item);
    if (s.gold < price) {
      gameStore.log('Not enough gold!', 'error');
      playSound('error');
      return;
    }
    
    // Deduct dynamic price
    s.gold -= price;
    
    // Add to inventory
    if (window.Player) {
      window.Player.addItem({ ...item });
    } else {
      s.inventory.push({ ...item });
    }
    
    // Track purchase for economy
    if (window.EconomyManager) {
      window.EconomyManager.recordPurchase(item.id, price);
    }
    
    gameStore.log(`Bought ${item.name} for ${price}g!`, 'loot');
    if(window.SoundManager) window.SoundManager.play("shop_buy");
};

// v37.0: Buy gem
const buyGem = (gem) => {
  if (isShopClosed.value) {
    gameStore.log('Shop is CLOSED!', 'error');
    playSound('error');
    return;
  }
  
  const basePrice = gem.price || 0;
  const dynamicPrice = window.EconomyManager ? 
    window.EconomyManager.calculateBuyPrice(basePrice, gem.gemType) : basePrice;
  
  if (!gem || s.gold < dynamicPrice) {
    gameStore.log("Not enough gold!", "error");
    playSound('error');
    return;
  }
  
  // Deduct gold
  s.gold -= dynamicPrice;
  
  // Add gem to inventory via Player
  if (window.Player) {
    const gemItem = {
      id: `${gem.gemType}_fl${gem.dropFloor}_${Date.now()}`,
      name: gem.name,
      icon: gem.icon,
      type: 'gem',
      slot: 'mat',
      rarity: gem.rarity,
      gemType: gem.gemType,
      dropFloor: gem.dropFloor,
      scaledBonus: gem.bonus,
      desc: gem.desc,
      qty: 1,
      sellPrice: Math.floor(dynamicPrice / 2)
    };
    
    window.Player.addItem(gemItem);
    
    // Track purchase
    if (window.EconomyManager) {
      window.EconomyManager.recordPurchase(gem.gemType, dynamicPrice);
    }
    
    gameStore.log(`Bought ${gem.icon} ${gem.name}!`, "loot");
    if(window.SoundManager) window.SoundManager.play("shop_buy");
  }
};

const refreshShop = () => {
    if (s.gold >= 50) {
        if(window.LootManager) {
            s.gold -= 50;
            // Generate IDs
            const newStockIds = window.LootManager.generateMerchantStock(s.floor || 1);
            s.merchantStock = newStockIds;
            
            // v37.0: Also refresh gem stock
            s.merchantGemStock = generateGemStock();

            // v37.1 E4.7: Reset scarcity on shop refresh
            if (window.EconomyManager) {
                window.EconomyManager.resetScarcity();
            }
            
            gameStore.log("Merchant stock refreshed!", "system");
        }
    } else {
        gameStore.log("Need 50 Gold to refresh.", "error");
    }
};

const autoSell = (rarityType) => {
    if (!window.Player || !window.Player.inventory) return;
    
    let soldCount = 0;
    let earned = 0;
    
    // Reverse loop
    for (let i = window.Player.inventory.length - 1; i >= 0; i--) {
        const item = window.Player.inventory[i];
        
        // Safety: Unlocked only
        if (window.Player.lockedItems && window.Player.lockedItems.includes(item.id)) continue;
        
        // Safety: Skip Gems, Mats, Consumables, Books (valuable crafting materials)
        if (['mat', 'con', 'skill_book'].includes(item.slot)) continue;
        if (item.type === 'gem') continue; // v37.0: Skip gems
        
        let shouldSell = false;
        if (rarityType === 'common' && item.rarity === 'common') shouldSell = true;
        if (rarityType === 'junk' && (item.rarity === 'common' || item.rarity === 'uncommon')) shouldSell = true;
        
        if (shouldSell) {
             // Use sellPrice if available, otherwise calculate from price
             const price = item.sellPrice || Math.floor((item.price || 10) / 2);
             earned += price;
             window.Player.inventory.splice(i, 1);
             soldCount++;
        }
    }
    
    if (soldCount > 0) {
        s.gold += earned;
        if(window.SoundManager) window.SoundManager.play("sell");
        gameStore.log(`Auto-Sold ${soldCount} items for ${earned} G`, "buff");
    } else {
        gameStore.log("No matching items to sell.", "error");
    }
};


const leave = () => {
  if (window.Game) window.Game.exploreState();
};
</script>

<template>
  <div class="merchant-panel scanline">
    <div class="header">
        <h3>MERCHANT <small>Gold: {{ s.gold }}</small></h3>
        <button class="refresh-btn" @click="refreshShop">🔄 50G</button>
    </div>
    
    <!-- v37.0: Tab Switcher -->
    <div class="shop-tabs">
      <button :class="{ active: shopTab === 'ITEMS' }" @click="switchTab('ITEMS')">
        ⚔️ ITEMS
      </button>
      <button :class="{ active: shopTab === 'GEMS' }" @click="switchTab('GEMS')">
        💎 GEMS
      </button>
    </div>
    
    <!-- v37.0 Phase 4: Economy Info Bar -->
    <div class="economy-bar">
      <span class="inflation" :class="{ high: inflation > 30 }">
        📈 Inflation: {{ inflation }}%
      </span>
      <span v-if="s.economy?.merchantReputation" class="merchant-rep">
        ⭐ Rep: {{ s.economy.merchantReputation }}
      </span>
    </div>
    
    <!-- v37.0 Phase 4: Event Banner -->
    <div v-if="activeEvent" class="event-banner" :style="{ borderColor: activeEvent.color }">
      <span class="event-icon">{{ activeEvent.icon }}</span>
      <span class="event-text">
        <strong>{{ activeEvent.name }}</strong> - {{ activeEvent.desc }}
      </span>
      <span v-if="s.economy?.eventDuration > 0" class="event-timer">
        {{ s.economy.eventDuration }} floor(s)
      </span>
    </div>
    
    <!-- ITEMS TAB -->
    <div v-if="shopTab === 'ITEMS'" class="shop-grid">
         <!-- Shop Closed Overlay -->
         <div v-if="isShopClosed" class="shop-closed-overlay">
           🚫 SHOP CLOSED
         </div>
         
         <div v-for="(item, i) in shopStock" :key="i" 
              class="shop-item" 
              :class="{ 'out-of-stock': isOutOfStock(item.id), 'shop-closed': isShopClosed }"
              @click="buyItem(item)">
             <div class="item-header">
               <div class="name" :class="item.rarity">{{ item.name }}</div>
               <span v-if="getStockBadge(item.id)" 
                     class="stock-badge" 
                     :style="{ color: getStockBadge(item.id).color }">
                 {{ getStockBadge(item.id).icon }}
               </span>
             </div>
             <div class="price-row">
               <span v-if="getDynamicPrice(item) !== item.price" class="old-price">{{ item.price }}G</span>
               <span class="price" 
                     :class="{ 
                       red: !canAfford(item), 
                       discount: getDynamicPrice(item) < item.price,
                       markup: getDynamicPrice(item) > item.price 
                     }">
                 {{ getDynamicPrice(item) }} G
               </span>
             </div>
             <div class="desc">{{ item.desc }}</div>
         </div>
         
         <div v-if="shopStock.length === 0" class="empty">
             Sold Out
         </div>
    </div>
    
    <!-- v37.0: GEMS TAB -->
    <div v-if="shopTab === 'GEMS'" class="shop-grid gems-grid">
      <div v-for="(gem, i) in gemStock" :key="i" 
           class="gem-item" 
           :class="gem.rarity"
           @click="buyGem(gem)">
        <div class="gem-header">
          <div class="gem-icon">{{ gem.icon }}</div>
          <div class="gem-info">
            <div class="name" :class="gem.rarity">{{ gem.name }}</div>
            <div class="quality">{{ gem.quality }}</div>
          </div>
        </div>
        <div class="gem-bonuses">
          <span v-for="(val, stat) in gem.bonus" :key="stat" class="bonus-chip">
            +{{ val }} {{ stat.toUpperCase() }}
          </span>
        </div>
        <div class="price" :class="{ red: !canAfford(gem) }">{{ gem.price }} G</div>
      </div>
      
      <div v-if="gemStock.length === 0" class="empty">
        No gems in stock
      </div>
    </div>
    
    <!-- AUTO-SELL CONTROLS -->
    <div class="auto-sell-section">
        <label>Bulk Sell (Equipment Only):</label>
        <div class="btn-group">
            <button class="sell-btn common" @click="autoSell('common')">All Common</button>
            <button class="sell-btn junk" @click="autoSell('junk')">All Junk (Unc+Com)</button>
        </div>
    </div>
    
    <div class="footer">
      <button class="leave-btn" @click="leave">LEAVE SHOP</button>
    </div>
  </div>
</template>

<style scoped>
.merchant-panel {
    padding: 15px; 
    background: var(--glass-bg, rgba(17, 17, 17, 0.95));
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    height: 100%; 
    display: flex; 
    flex-direction: column;
    border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
}
.header {
    display: flex; 
    justify-content: space-between; 
    align-items: center;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1); 
    padding-bottom: 10px; 
    margin-bottom: 12px;
}
.header h3 { 
    color: var(--c-gold, #cfaa4c); 
    margin: 0;
    text-shadow: 0 0 10px rgba(207, 170, 76, 0.3);
}
.header h3 small {
    color: #4f4;
    margin-left: 10px;
    font-size: 0.9rem;
}
.refresh-btn {
    background: linear-gradient(135deg, #2a2a35, #1a1a25);
    color: #fff; 
    border: 1px solid rgba(100, 100, 120, 0.4); 
    cursor: pointer;
    padding: 8px 14px; 
    border-radius: 6px;
    transition: all 0.2s ease;
}
.refresh-btn:hover { 
    background: linear-gradient(135deg, #3a3a45, #2a2a35);
    border-color: var(--c-gold, #cfaa4c);
    box-shadow: 0 0 10px rgba(207, 170, 76, 0.2);
}

/* v37.1: Enhanced Shop Tabs */
.shop-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.shop-tabs button {
  flex: 1;
  background: linear-gradient(135deg, #1a1a25, #0f0f15);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #888;
  padding: 10px;
  cursor: pointer;
  font-weight: bold;
  border-radius: 6px;
  transition: all 0.25s ease;
}
.shop-tabs button.active {
  background: linear-gradient(135deg, #2a2535, #1a1525);
  border-color: var(--c-gold, #cfaa4c);
  color: var(--c-gold, #cfaa4c);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.25), inset 0 0 10px rgba(255, 215, 0, 0.05);
}
.shop-tabs button:hover:not(.active) {
  background: linear-gradient(135deg, #252530, #1a1a25);
  border-color: rgba(255, 255, 255, 0.15);
}

.shop-grid {
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 10px;
    overflow-y: auto; 
    flex: 1;
    padding: 5px;
}
.shop-item {
    background: linear-gradient(135deg, rgba(30, 30, 35, 0.8), rgba(20, 20, 25, 0.9));
    border: 1px solid rgba(255, 255, 255, 0.08); 
    border-radius: 8px;
    padding: 12px;
    cursor: pointer; 
    transition: all 0.25s ease;
}
.shop-item:hover {
    background: linear-gradient(135deg, rgba(40, 40, 50, 0.9), rgba(30, 30, 40, 0.95));
    border-color: var(--c-gold, #cfaa4c);
    box-shadow: 0 0 15px rgba(207, 170, 76, 0.2);
    transform: translateY(-2px);
}

/* v37.0: Gem Grid */
.gems-grid {
  grid-template-columns: 1fr;
  gap: 10px;
}

.gem-item {
  background: #1a1a1a;
  border: 2px solid #444;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gem-item:hover {
  background: #252525;
  border-color: var(--c-gold);
  transform: translateX(4px);
}

.gem-item.common { border-left: 4px solid #888; }
.gem-item.rare { border-left: 4px solid #4af; }
.gem-item.epic { border-left: 4px solid #d0f; }
.gem-item.legendary { border-left: 4px solid #ffa500; }

.gem-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gem-icon {
  font-size: 32px;
}

.gem-info {
  flex: 1;
}

.quality {
  font-size: 0.7rem;
  color: #666;
  text-transform: uppercase;
}

.gem-bonuses {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.bonus-chip {
  background: #0a3d0a;
  color: #0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  border: 1px solid #0f0;
}

.name { font-weight: bold; margin-bottom: 5px; }
.price { color: var(--c-gold); font-weight: bold; font-size: 1.1rem; }
.price.red { color: #f44; }
.desc { font-size: 0.8rem; color: #888; clear: both; }

/* Rarity Colors */
.common { color: #ccc; }
.uncommon { color: #4f4; }
.rare { color: #4af; }
.epic { color: #d0d; }
.legend { color: #fa0; }
.mythic { color: #f00; }

.auto-sell-section {
    margin-top: 10px; border-top: 1px solid #333; padding-top: 10px;
}
.auto-sell-section label {
    display: block; font-size: 0.8rem; color: #666; margin-bottom: 5px;
}
.btn-group { display: flex; gap: 10px; }
.sell-btn {
    flex: 1; padding: 8px; border: none; font-weight: bold; cursor: pointer;
    text-transform: uppercase; font-size: 0.8rem;
}
.sell-btn.common { background: #444; color: #ccc; }
.sell-btn.junk { background: #644; color: #fbb; }
.sell-btn:hover { filter: brightness(1.2); }

.footer {
  padding: 10px;
  text-align: center;
  border-top: 1px solid #333;
}
.leave-btn {
  background: #333;
  color: white;
  border: 1px solid #555;
  padding: 10px 30px;
  cursor: pointer;
}
.leave-btn:hover { background: #555; }

/* v37.0 Phase 4: Economy Styling */
.economy-bar {
  display: flex;
  justify-content: space-between;
  background: #1a1a1a;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.inflation {
  color: #4f4;
}

.inflation.high {
  color: #f44;
  animation: inflation-pulse 1s infinite;
}

@keyframes inflation-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.merchant-rep {
  color: #fa0;
}

.event-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #1a1a2a, #2a1a2a);
  border: 2px solid;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  animation: banner-slide 0.3s ease-out;
}

@keyframes banner-slide {
  0% { transform: translateY(-20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.event-icon {
  font-size: 1.5rem;
}

.event-text {
  flex: 1;
  color: #fff;
}

.event-timer {
  color: #888;
  font-size: 0.8rem;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stock-badge {
  font-size: 1rem;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 5px 0;
}

.old-price {
  text-decoration: line-through;
  color: #666;
  font-size: 0.9rem;
}

.price.discount {
  color: #4f4 !important;
}

.price.markup {
  color: #fa0 !important;
}

.shop-item.out-of-stock {
  opacity: 0.5;
  pointer-events: none;
}

.shop-item.shop-closed {
  opacity: 0.3;
  pointer-events: none;
}

.shop-closed-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  color: #f44;
  z-index: 10;
  text-shadow: 0 0 10px rgba(255,0,0,0.5);
}

.shop-grid {
  position: relative;
}
</style>
