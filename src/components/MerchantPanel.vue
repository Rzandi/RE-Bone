<script setup>
import { computed, onMounted } from "vue";
import { gameStore } from "../game/store.js";

const s = gameStore.state;

// Initialize merchant stock if empty
onMounted(() => {
  if (!s.merchantStock || s.merchantStock.length === 0) {
    if (window.LootManager) {
      const newStock = window.LootManager.generateMerchantStock(s.floor || 1);
      s.merchantStock = newStock;
    }
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

const canAfford = (item) => {
    return s.gold >= (item.price || 0);
};

const buyItem = (item) => {
    if (!item) return;
    if (window.PlayerLogic) {
        window.PlayerLogic.buyItem(item); 
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
        
        // Safety: Equipment Only (Skip Mats/Consumables/Books)
        if (['mat', 'con', 'skill_book'].includes(item.slot)) continue;
        
        let shouldSell = false;
        if (rarityType === 'common' && item.rarity === 'common') shouldSell = true;
        if (rarityType === 'junk' && (item.rarity === 'common' || item.rarity === 'uncommon')) shouldSell = true;
        
        if (shouldSell) {
             const price = Math.floor((item.price || 10) / 2);
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
    
    <div class="shop-grid">
         <div v-for="(item, i) in shopStock" :key="i" class="shop-item" @click="buyItem(item)">
             <div class="name" :class="item.rarity">{{ item.name }}</div>
             <div class="price" :class="{ red: !canAfford(item) }">{{ item.price }} G</div>
             <div class="desc">{{ item.desc }}</div>
         </div>
         
         <div v-if="shopStock.length === 0" class="empty">
             Sold Out
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
    padding: 10px; background: #111; height: 100%; display: flex; flex-direction: column;
}
.header {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 2px solid #444; padding-bottom: 5px; margin-bottom: 10px;
}
.header h3 { color: var(--c-gold); margin: 0; }
.refresh-btn {
    background: #333; color: #fff; border: 1px solid #666; cursor: pointer;
}
.refresh-btn:hover { background: #555; }

.shop-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
    overflow-y: auto; flex: 1;
}
.shop-item {
    background: #1a1a1a; border: 1px solid #444; padding: 10px;
    cursor: pointer; transition: all 0.2s;
}
.shop-item:hover {
    background: #252525; border-color: var(--c-gold);
}
.name { font-weight: bold; margin-bottom: 5px; }
.price { color: var(--c-gold); float: right; }
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
</style>
