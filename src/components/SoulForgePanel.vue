<script setup>
import { computed, ref, onMounted } from "vue";
import { gameStore } from "../game/store.js";
import { DB } from "../game/config/database.js";
import { SaveManager } from "../game/managers/SaveManager.js";

const s = gameStore.state;
const items = computed(() => window.Ascension ? Ascension.SHOP_ITEMS : []);
const upgrades = computed(() => window.Ascension ? Ascension.upgrades : {});
const souls = computed(() => s.meta ? s.meta.souls : 0);
// const souls = computed(() => window.Ascension ? Ascension.shards : 0); // Replaced with persistent meta souls? 
// Wait, if I use meta.souls, I must ensure Ascension.js uses it too?
// For now, let's assume 'souls' in this panel refers to the new persistent currency.
// But Ascension might have its own 'shards'.
// I should verify if user wants separate currencies. "Soul Shop" implies the same.
// I will sync them. `meta.souls` IS the currency.

const activeTab = ref('classes'); // 'classes' | 'upgrades' | 'perks'

// --- CLASS SHOP LOGIC ---
const unlockedClasses = computed(() => s.meta ? s.meta.unlockedClasses : []);

// Safely access Ascension globals
const ascensionShopItems = computed(() => window.Ascension ? window.Ascension.SHOP_ITEMS : []);
const ascensionUpgrades = computed(() => window.Ascension ? window.Ascension.upgrades : {});
const ascensionShopStock = computed(() => window.Ascension ? window.Ascension.shopStock : []);
const ascensionRefreshCount = computed(() => window.Ascension ? window.Ascension.refreshCount : 0);

// Currency: Sync with Meta Souls
// Duplicate removed

// --- CLASS SHOP LOGIC ---
const lockedClasses = computed(() => {
    const all = DB.CLASSES;
    const unlocked = unlockedClasses.value;
    const list = [];
    
    for(const id in all) {
        if(id === 'skeleton' || id === 'ghoul' || id === 'phantom') continue; // Not buyable
        if(unlocked.includes(id)) continue; // Already owned
        list.push({ id, ...all[id] });
    }
    return list;
});

const classCost = computed(() => {
    // Formula: 50 * (2 ^ bought_count)
    // We need to count how many BUYABLE classes we have unlocked.
    const unlocked = unlockedClasses.value;
    let boughtCount = 0;
    unlocked.forEach(id => {
        if(id !== 'skeleton' && id !== 'ghoul' && id !== 'phantom') boughtCount++;
    });
    return 50 * Math.pow(2, boughtCount);
});


const buyClass = (id) => {
    const cost = classCost.value;
    if(s.meta.souls >= cost) {
        s.meta.souls -= cost;
        s.meta.unlockedClasses.push(id);
        SaveManager.saveMeta();
        gameStore.log(`Unlocked ${DB.CLASSES[id].name}!`, "system");
    }
}

// --- LEGACY ASCENSION LOGIC (Keep for upgrades if needed) ---
const buy = (id) => {
    if(window.Ascension) Ascension.buyUpgrade(id);
};

    const close = () => {
        // Smart Close
        if (s.activePanel === 'shop-ascension') {
            // Check if we came from Menu (in-game) or Title
            // A simple heuristic: If Player has a class and we are not in 'idle' state?
            // Or simpler: If we have a 'Game' object and loop is running?
            // Let's assume if 'Game.currAction' is defined.
            
            // If we have a running game (not just initialized):
            if (window.Game && window.Game.state.progress > 0 || window.Game.currAction !== 'idle') {
                gameStore.state.activePanel = 'menu-view';
            } else {
                gameStore.state.activePanel = 'title';
            }
        }
    };
    
    // Ensure all 3 tabs are available
    // const activeTab = ref('classes'); // 'classes' | 'upgrades' | 'perks'
    
    </script>
    
    <template>
      <div class="soul-forge-panel scanline">
        <div class="header">
          <h2>SOUL FORGE 👻</h2>
          <div class="currency">{{ souls }} Souls</div>
          <button class="btn-close" @click="close">X</button>
        </div>
    
        <div class="tabs">
            <button :class="{ active: activeTab === 'classes' }" @click="activeTab = 'classes'">CLASSES</button>
            <button :class="{ active: activeTab === 'upgrades' }" @click="activeTab = 'upgrades'">STATS</button>
            <button :class="{ active: activeTab === 'perks' }" @click="activeTab = 'perks'">PERKS</button>
        </div>

    <div class="content">
        <!-- CLASS MARKET TAB -->
        <div v-show="activeTab === 'classes'" class="grid">
            <div v-if="lockedClasses.length === 0" class="empty-msg">
                All classes unlocked!
            </div>
            
            <div v-for="cls in lockedClasses" :key="cls.id" class="card">
                <div class="icon-lg">{{ cls.icon }}</div>
                <h3>{{ cls.name }}</h3>
                <p>{{ cls.desc }}</p>
                <div class="stats-mini">
                    <span style="color:#f55">S: {{cls.attr.STR}}</span>
                    <span style="color:#5f5">V: {{cls.attr.VIT}}</span>
                    <span style="color:#55f">I: {{cls.attr.INT}}</span>
                </div>
                
                <button @click="buyClass(cls.id)" :disabled="souls < classCost">
                    UNLOCK {{ classCost }} 👻
                </button>
            </div>
        </div>

        <!-- STATS / UPGRADES TAB -->
        <div v-show="activeTab === 'upgrades'" class="grid">
            <div v-for="item in ascensionShopItems" :key="item.id" class="card">
                 <!-- Filter out class unlocks from this tab -->
                 <template v-if="!item.id.startsWith('unlock_')">
                    <h3>{{ item.name }}</h3>
                    <p>{{ item.desc }}</p>
                    <div class="stats-mini" style="color:#aaa;">
                        Level: {{ ascensionUpgrades[item.id] || 0 }} / {{ item.max }}
                    </div>
                    
                    <button @click="buy(item.id)" 
                            :disabled="souls < item.cost || (ascensionUpgrades[item.id] || 0) >= item.max"
                            :style="(ascensionUpgrades[item.id] || 0) >= item.max ? 'background:#556; color:#889' : ''">
                        {{ (ascensionUpgrades[item.id] || 0) >= item.max ? 'MAXED' : `UPGRADE (${item.cost} 👻)` }}
                    </button>
                 </template>
            </div>
        </div>

        <!-- PERKS TAB -->
        <div v-show="activeTab === 'perks'" class="grid">
            <div v-if="ascensionShopStock.length === 0" class="empty-msg">
                No Perks Available via Soul Shop yet.
                <button @click="() => { if(window.Ascension) Ascension.refreshShop(); }">Initialize Shop</button>
            </div>
            
            <div v-else v-for="pid in ascensionShopStock" :key="pid" class="card">
                <template v-if="DB.PASSIVES[pid]">
                    <h3>{{ DB.PASSIVES[pid].name }}</h3>
                    <p>{{ DB.PASSIVES[pid].desc }}</p>
                    
                    <button @click="buy('perk_' + pid)" 
                            :disabled="souls < 50 || ascensionUpgrades['perk_' + pid] === 1"
                             :style="ascensionUpgrades['perk_' + pid] ? 'background:#556; color:#889' : ''">
                        {{ ascensionUpgrades['perk_' + pid] ? 'OWNED' : 'BUY (50 👻)' }}
                    </button>
                </template>
            </div>
             <!-- Refresh Button -->
             <div style="width:100%; text-align:center; padding:10px;">
                <button @click="() => { if(window.Ascension) Ascension.refreshShop(); }" style="width:auto; background:#f90;">
                   🔄 Refresh Perks ({{ ascensionRefreshCount }})
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.soul-forge-panel {
    position: absolute; top:0; left:0; width:100%; height:100%;
    background: #0a0a1a; z-index: 205;
    display: flex; flex-direction: column;
}
.header {
    background: #112; padding: 15px; border-bottom: 2px solid #a8dadc;
    display: flex; justify-content: space-between; align-items: center;
}
.header h2 { color: #a8dadc; margin:0; text-shadow: 0 0 10px #a8dadc; }
.currency { font-size: 1.2rem; color: #fff; font-weight: bold; }

.tabs { display: flex; background: #223; }
.tabs button {
    flex: 1; background: transparent; border: none; padding: 15px;
    color: #889; font-weight: bold; cursor: pointer; border-bottom: 3px solid transparent;
}
.tabs button.active {
    color: #a8dadc; border-bottom-color: #a8dadc; background: #1a1a2e;
}

.content { flex: 1; overflow-y: auto; padding: 20px; }

.grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;
}

.card {
    background: #16162a; border: 1px solid #334; padding: 15px; border-radius: 4px;
    display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px;
}
.icon-lg { font-size: 3rem; }
.card h3 { color: #fff; margin: 0; }
.card p { color: #aaa; font-size: 0.85rem; margin: 0; }

.stats-mini { font-family: monospace; font-size: 0.8rem; display: flex; gap: 10px; }

button {
    background: #a8dadc; color: #000; border: none; padding: 8px 15px; font-weight: bold; cursor: pointer;
    transition: all 0.2s; width: 100%;
}
button:disabled { background: #445; color: #889; cursor: not-allowed; }
button:hover:not(:disabled) { box-shadow: 0 0 10px #a8dadc; }

.empty-msg { width: 100%; text-align: center; color: #667; margin-top: 50px; font-size: 1.5rem; }

.btn-close { width: auto; background: transparent; color: #fff; border: 1px solid #444; }
</style>
