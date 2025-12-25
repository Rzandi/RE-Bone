<script setup>
import { computed, ref, onMounted } from "vue";
import { gameStore } from "../game/store.js";
import { DB } from "../game/config/database.js";
import { SaveManager } from "../game/managers/SaveManager.js";
import { Ascension } from "../game/managers/ascension.js";

const s = gameStore.state;

// Safe Accessors
const meta = computed(() => s.meta || {});
const souls = computed(() => meta.value.souls || 0);
const upgrades = computed(() => meta.value.upgrades || {});
const unlockedClasses = computed(() => meta.value.unlockedClasses || ['skeleton']);

const activeTab = ref('classes');

// Shop Data (with safety checks)
const shopItems = computed(() => (Ascension?.SHOP_ITEMS) || []);
const shopStock = computed(() => (meta.value.shopStock) || []);
const refreshCount = computed(() => (meta.value.refreshCount !== undefined) ? meta.value.refreshCount : 3);

// --- CLASS SHOP LOGIC ---
const lockedClasses = computed(() => {
    const all = DB.CLASSES || {};
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
    const unlocked = unlockedClasses.value;
    let boughtCount = 0;
    unlocked.forEach(id => {
        if(id !== 'skeleton' && id !== 'ghoul' && id !== 'phantom') boughtCount++;
    });
    return 50 * Math.pow(2, boughtCount);
});


const buyClass = (id) => {
    const cost = classCost.value;
    if(souls.value >= cost) {
        s.meta.souls -= cost;
        s.meta.unlockedClasses.push(id);
        SaveManager.saveMeta();
        gameStore.log(`Unlocked ${DB.CLASSES[id].name}!`, "system");
    }
}

// --- UPGRADE LOGIC ---
const buy = (id) => {
    if(Ascension) Ascension.buyUpgrade(id);
};

const initializeShop = () => {
    if(Ascension) Ascension.refreshShop();
};

const refreshShop = () => {
     if(Ascension) Ascension.refreshShop();
};

const close = () => {
    // Smart Close Logic
    const prev = gameStore.state.previousPanel;
    
    if (prev === 'title') {
        gameStore.state.activePanel = 'title';
    } else if (prev === 'menu-view') {
        gameStore.state.activePanel = 'menu-view';
    } else {
        // Fallback heuristic
        if (s.hp > 0 && s.floor > 0) {
            gameStore.state.activePanel = 'menu-view';
        } else {
            gameStore.state.activePanel = 'title';
        }
    }
    gameStore.state.previousPanel = null;
};

// Ensure Shop is generated
onMounted(() => {
    if(Ascension && Ascension.shopStock.length === 0) {
        Ascension.generateStock();
    }
});
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
            <button :class="{ active: activeTab === 'cosmetics' }" @click="activeTab = 'cosmetics'">✨ STYLE</button>
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
            <div v-for="item in shopItems" :key="item.id" class="card">
                 <!-- Filter out class unlocks from this tab -->
                 <template v-if="!item.id.startsWith('unlock_')">
                    <h3>{{ item.name }}</h3>
                    <p>{{ item.desc }}</p>
                    <div class="stats-mini" style="color:#aaa;">
                        Level: {{ upgrades[item.id] || 0 }} / {{ item.max }}
                    </div>
                    
                    <button @click="buy(item.id)" 
                            :disabled="souls < item.cost || (upgrades[item.id] || 0) >= item.max"
                            :style="(upgrades[item.id] || 0) >= item.max ? 'background:#556; color:#889' : ''">
                        {{ (upgrades[item.id] || 0) >= item.max ? 'MAXED' : `UPGRADE (${item.cost} 👻)` }}
                    </button>
                 </template>
            </div>
        </div>

        <!-- PERKS TAB -->
        <div v-show="activeTab === 'perks'" class="grid">
            <div v-if="shopStock.length === 0" class="empty-msg">
                No Perks Available.
                <button @click="initializeShop" style="margin-top:10px; width:auto;">Initialize Shop</button>
            </div>
            
            <div v-else v-for="pid in shopStock" :key="pid" class="card">
                <template v-if="DB.PASSIVES && DB.PASSIVES[pid]">
                    <h3>{{ DB.PASSIVES[pid].name }}</h3>
                    <p>{{ DB.PASSIVES[pid].desc }}</p>
                    
                    <button @click="buy('perk_' + pid)" 
                            :disabled="souls < 50 || upgrades['perk_' + pid] === 1"
                             :style="upgrades['perk_' + pid] ? 'background:#556; color:#889' : ''">
                        {{ upgrades['perk_' + pid] ? 'OWNED' : 'BUY (50 👻)' }}
                    </button>
                </template>
            </div>
             <!-- Refresh Button -->
             <div style="width:100%; text-align:center; padding:10px; grid-column: 1 / -1;">
                <button @click="refreshShop" style="width:auto; background:#f90; color:#000;">
                   🔄 Refresh Perks ({{ refreshCount }})
                </button>
            </div>
        </div>

        <!-- v38.8: COSMETICS TAB (Placeholder) -->
        <div v-show="activeTab === 'cosmetics'" class="cosmetics-placeholder">
            <div class="coming-soon-icon">✨</div>
            <h2>STYLE SHOP</h2>
            <p>Coming Soon...</p>
            <div class="preview-list">
                <div class="preview-item">🎭 Titles</div>
                <div class="preview-item">💀 Death Effects</div>
                <div class="preview-item">🌈 Screen Filters</div>
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

/* v38.8: Cosmetics Placeholder */
.cosmetics-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    color: #889;
}
.coming-soon-icon { font-size: 5rem; margin-bottom: 20px; animation: pulse 2s infinite; }
.cosmetics-placeholder h2 { color: #a8dadc; margin: 0 0 10px 0; }
.cosmetics-placeholder p { font-size: 1.2rem; margin-bottom: 30px; }
.preview-list { display: flex; gap: 20px; }
.preview-item { 
    background: #223; 
    padding: 15px 25px; 
    border-radius: 8px; 
    border: 1px dashed #445;
    color: #667;
}
@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.1); opacity: 1; }
}
</style>
