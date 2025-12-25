<script setup>
import { ref, onMounted, computed } from "vue";
import { gameStore } from "../game/store.js";
import { Game } from "../game/core/game.js";
import { Player } from "../game/logic/Player.js";
import { RUN_MODIFIERS } from "../game/config/modifiers.js";
import { DB } from "../game/config/database.js";
import { getDailyConfig } from "../game/config/daily_config.js";
import { SoundManager } from "../game/managers/sound.js";
import { Leaderboard } from "../game/managers/Leaderboard.js";

const config = ref(null);
const loading = ref(true);

const s = gameStore.state;

onMounted(() => {
    loading.value = true;
    // Simulate API delay or calc
    setTimeout(() => {
        config.value = getDailyConfig();
        loading.value = false;
    }, 500);
});

// Get Modifier Objects
const dailyModifiers = computed(() => {
    if(!config.value) return [];
    return config.value.modifiers.map(id => RUN_MODIFIERS[id]).filter(Boolean);
});

// Get Class Object
const dailyClass = computed(() => {
    if(!config.value) return null;
    return DB.CLASSES[config.value.heroClass] || DB.CLASSES['skeleton'];
});

const startDaily = () => {
    if(!config.value) return;
    
    // v38.6: Daily Retry Block (Edge Case)
    // Check if entry exists for this Date + Mode=Daily
    const today = new Date().toLocaleDateString(); // Local date string match
    const entries = Leaderboard.getEntries();
    const hasPlayed = entries.some(e => {
        // e.date is ISO. transform to local date
        const d = new Date(e.date).toLocaleDateString();
        return e.mode === 'Daily' && d === today;
    });

    if (hasPlayed) {
        alert("You have already completed the Daily Challenge today!\nCheck the Leaderboard for your score.");
        return;
    }

    // 1. Reset Game State (Centralized)
    SaveManager.clearSave(); // Ensure fresh start
    Game.resetRunFlags();
    
    // 2. Set Modifiers (Before Player Init for Start Curses)
    s.activeModifiers = [...config.value.modifiers];
    applyModifierEffects();

    // 3. Initialize Player with Daily Class
    Player.init(config.value.heroClass);

    // v38.5: Apply Daily Bonus
    if (config.value.bonusGold > 0) {
        s.gold = (s.gold || 0) + config.value.bonusGold;
        gameStore.log(`Daily Bonus: +${config.value.bonusGold} Gold`, "green");
    }
    
    // 4. Set Daily Flags
    Game.state.isDaily = true;
    s.isDailyChallenge = true;
    s.dailySeed = config.value.seed;
    
    // 5. Start Game
    gameStore.log(`🌞 DAILY CHALLENGE STARTED!`, "system");
    
    // v38.4: Ensure Timer starts if Speed Run
    if(s.modifierEffects.floorTimer) {
        s.currentFloorTime = s.modifierEffects.floorTimer;
    }
    
    // Start Global Timer
    s.runTime = 0;
    Game.startGlobalTimer();

    Game.exploreState();
    Game.saveGame(); // Initial Save
    
    if(SoundManager) SoundManager.play('event_good');
};

const applyModifierEffects = () => {
   s.modifierEffects = {
    healingDisabled: false,
    dmgMult: 1,
    hpMult: 1,
    defMult: 1,
    goldMult: 1,
    permadeath: false,
    noResurrection: false,
    noEquipment: false,
    floorTimer: 0,
    startCurses: 0
  };
  
  s.activeModifiers.forEach(modId => {
    const mod = RUN_MODIFIERS[modId];
    if (!mod || !mod.effects) return;
    const eff = mod.effects;
    
    if (eff.healingDisabled) s.modifierEffects.healingDisabled = true;
    if (eff.dmgMult) s.modifierEffects.dmgMult *= eff.dmgMult;
    if (eff.hpMult) s.modifierEffects.hpMult *= eff.hpMult;
    if (eff.defMult !== undefined) s.modifierEffects.defMult *= eff.defMult;
    if (eff.goldMult) s.modifierEffects.goldMult *= eff.goldMult;
    if (eff.permadeath) s.modifierEffects.permadeath = true;
    if (eff.noResurrection) s.modifierEffects.noResurrection = true;
    if (eff.noEquipment) s.modifierEffects.noEquipment = true;
    if (eff.floorTimer) s.modifierEffects.floorTimer = eff.floorTimer;
    if (eff.startCurses) s.modifierEffects.startCurses = eff.startCurses;
    if (eff.startGold === 0) s.gold = 0;
  });
};

const goBack = () => {
    gameStore.state.activePanel = 'title';
    if(SoundManager) SoundManager.play('ui_back');
};
</script>

<template>
  <div class="daily-panel scanline">
    <div class="header">
        <h2>🌞 DAILY CHALLENGE</h2>
        <div class="date-display">{{ config ? config.date : 'Loading...' }}</div>
    </div>

    <div v-if="loading" class="loading">
        <div class="spinner"></div>
    </div>

    <div v-else class="content">
        <!-- Hero Section -->
        <div class="section hero-section">
            <div class="label">TODAY'S VESSEL</div>
            <div class="hero-card">
                <div class="hero-icon">{{ dailyClass?.icon || '💀' }}</div>
                <div class="hero-info">
                    <h3>{{ dailyClass?.name }}</h3>
                    <div class="hero-stats">
                        STR: {{ dailyClass?.attr.STR }} | VIT: {{ dailyClass?.attr.VIT }} | INT: {{ dailyClass?.attr.INT }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Modifiers Section -->
        <div class="section mod-section">
            <div class="label">ACTIVE CURSES</div>
            <div class="mod-grid">
                <div v-for="mod in dailyModifiers" :key="mod.id" class="mod-card">
                    <div class="mod-icon">{{ mod.icon }}</div>
                    <div class="mod-details">
                        <div class="mod-name">{{ mod.name }}</div>
                        <div class="mod-desc">{{ mod.desc }}</div>
                    </div>
                </div>
                <div v-if="dailyModifiers.length === 0" class="no-mods">
                    No Modifiers Today. Pure Skill!
                </div>
            </div>
        </div>

        <!-- Start Button -->
        <div class="action-area">
            <button class="btn-back" @click="goBack">BACK</button>
            <button class="btn-start" @click="startDaily">
                ACCEPT CHALLENGE
            </button>
        </div>
    </div>
  </div>
</template>

<style scoped>
.daily-panel {
    position: fixed; top: 0; left: 0; width: 100%; height: 100dvh;
    background: #050510; /* Dark Blue tint */
    z-index: 200;
    display: flex; flex-direction: column;
    color: #fff;
    padding: 20px;
}

.header {
    text-align: center;
    border-bottom: 2px solid #55f;
    padding-bottom: 15px;
    margin-bottom: 20px;
}

.header h2 {
    color: #55f;
    margin: 0;
    font-size: 2rem;
    text-shadow: 0 0 10px #00f;
}

.date-display {
    color: #88f;
    font-family: monospace;
    font-size: 1.2rem;
    margin-top: 5px;
}

.content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}

.section {
    background: rgba(0,0,0,0.5);
    border: 1px solid #335;
    padding: 15px;
    border-radius: 8px;
}

.label {
    color: #55f;
    font-size: 0.8rem;
    letter-spacing: 2px;
    margin-bottom: 10px;
    font-weight: bold;
}

/* Hero Card */
.hero-card {
    display: flex;
    align-items: center;
    gap: 15px;
    background: #112;
    padding: 15px;
    border: 1px solid #448;
    border-radius: 6px;
}

.hero-icon { font-size: 3rem; }
.hero-info h3 { margin: 0 0 5px 0; color: #fff; }
.hero-stats { color: #88a; font-family: monospace; font-size: 0.9rem; }

/* Mod Grid */
.mod-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.mod-card {
    display: flex;
    align-items: center;
    gap: 15px;
    background: #211;
    border: 1px solid #522;
    padding: 10px;
    border-radius: 6px;
}

.mod-icon { font-size: 2rem; }
.mod-name { color: #f55; font-weight: bold; margin-bottom: 2px; }
.mod-desc { color: #caa; font-size: 0.85rem; }

.no-mods { text-align: center; color: #888; font-style: italic; }

/* Actions */
.action-area {
    margin-top: auto;
    display: flex;
    gap: 15px;
}

.btn-back {
    flex: 1;
    padding: 15px;
    background: #222;
    color: #fff;
    border: 1px solid #444;
    cursor: pointer;
}

.btn-start {
    flex: 2;
    padding: 15px;
    background: #004;
    color: #aaf;
    border: 1px solid #55f;
    font-weight: bold;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-start:hover {
    background: #006;
    box-shadow: 0 0 20px #00f;
    transform: scale(1.02);
}

.loading {
    flex: 1; display: flex; justify-content: center; align-items: center;
}
.spinner {
    width: 40px; height: 40px;
    border: 4px solid #333;
    border-top: 4px solid #55f;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
