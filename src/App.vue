<script setup>
import { computed, ref, watch, onMounted, onUnmounted, onErrorCaptured } from "vue";
import { gameStore } from "./game/store";
import LogPanel from "./components/LogPanel.vue";
import ControlPanel from "./components/ControlPanel.vue";
import InventoryPanel from "./components/InventoryPanel.vue";
import MerchantPanel from "./components/MerchantPanel.vue";
import StatsPanel from "./components/StatsPanel.vue";
import CombatPanel from "./components/CombatPanel.vue";
import EvolutionPanel from "./components/EvolutionPanel.vue";
import SkillsPanel from "./components/SkillsPanel.vue";
import CombatSkillSelector from "./components/CombatSkillSelector.vue";
import LevelUpPanel from "./components/LevelUpPanel.vue"; // NEW
import CraftingPanel from "./components/CraftingPanel.vue";
import LeaderboardPanel from "./components/LeaderboardPanel.vue";
import ClassSelectionPanel from "./components/ClassSelectionPanel.vue";
import BossRushPanel from "./components/BossRushPanel.vue"; // NEW
import SoulForgePanel from "./components/SoulForgePanel.vue";
import AchievementsPanel from "./components/AchievementsPanel.vue";
import VictoryPanel from "./components/VictoryPanel.vue";
import MobileTooltip from "./components/MobileTooltip.vue";
import LoreCard from "./components/LoreCard.vue";
import VFXLayer from "./components/VFXLayer.vue";
import StartScreen from "./components/StartScreen.vue";
import SettingsPanel from "./components/SettingsPanel.vue";
import WorldMapPanel from "./components/WorldMapPanel.vue";
import NodeMapPanel from "./components/NodeMapPanel.vue";
import EventPanel from "./components/EventPanel.vue";
import PauseMenuPanel from "./components/PauseMenuPanel.vue";
import SkillManagementPanel from "./components/SkillManagementPanel.vue";
import ReforgePanel from "./components/ReforgePanel.vue"; // v37.0 Phase 2
import BlackMarketPanel from "./components/BlackMarketPanel.vue"; // v37.0 Phase 3
import StatAllocationPanel from "./components/StatAllocationPanel.vue"; // v37.3: Free stat points
import SocketingPanel from "./components/SocketingPanel.vue";
import RunSetupPanel from "./components/RunSetupPanel.vue"; // v38.4: Challenge modifiers
import DailyChallengePanel from "./components/DailyChallengePanel.vue"; // v38.5: Daily Challenge
import ToastNotification from "./components/ToastNotification.vue"; // v38.8: Toast system
import { REALMS } from "./game/config/realms";
import { Game } from "./game/core/game.js";
import { Combat } from "./game/logic/Combat.js";
import { DB } from "./game/config/database.js";

const s = gameStore.state;
const realmsConfig = REALMS; // Make available to template

// v36.8 Phase 2: SP Pulse Animation
const spPulse = ref(false);
let lastSP = s.sp || 0;

watch(() => s.sp, (newSP) => {
  if (newSP > lastSP) {
    spPulse.value = true;
    setTimeout(() => spPulse.value = false, 1000);
  }
  lastSP = newSP;
});

// v36.9 Phase 3: Mobile detection (FIXED: Now reactive to window resize)
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);

// v38.9: PWA Enhancements
import { WakeLockManager } from "./game/managers/WakeLockManager";
import { registerSW } from 'virtual:pwa-register';

// v38.0: Store handler reference for cleanup
let resizeHandler = null;

onMounted(() => {
  window.addEventListener('resize', resizeHandler);
  
  // v38.9: Initialize Wake Lock
  WakeLockManager.init();
  // Request wake lock on first user interaction (click/touch)
  window.addEventListener('click', () => {
      WakeLockManager.request();
  }, { once: true });
  
  // v38.9: Capture Install Prompt
  window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      gameStore.state.installPrompt = e;
      gameStore.log("App Install available!", "system");
  });
  
  // v38.9: Handle App Shortcuts (Query Params)
  const params = new URLSearchParams(window.location.search);
  const action = params.get('action');
  if (action === 'daily') {
      // Wait for game init?
      setTimeout(() => {
          gameStore.state.activePanel = 'daily';
      }, 500);
  } else if (action === 'inventory') {
      setTimeout(() => {
          gameStore.state.activePanel = 'inventory';
      }, 500);
  }
  
  // v38.9: Service Worker Updates
  registerSW({
      onNeedRefresh() { 
          gameStore.showToast("Update available! Please reload.", "refresh", 10000);
      },
      onOfflineReady() {
          gameStore.showToast("Ready to play offline!", "wifi", 3000);
      },
  });
});

// v38.2: Global Error Boundary
onErrorCaptured((err, instance, info) => {
  console.error("Global Error Captured:", err, info);
  gameStore.log(`Critical Error: ${err.message}`, "error");
  return false; 
});

onUnmounted(() => {
  // Cleanup resize listener
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
  }
  // Cleanup keyboard listener
  window.removeEventListener('keydown', handleKeyPress);
});

const isMobile = computed(() => windowWidth.value <= 767);

// Computed for bars
const hpPct = computed(() => Math.min(100, Math.max(0, (s.hp / s.maxHp) * 100)));
const mpPct = computed(() => Math.min(100, Math.max(0, (s.mp / s.maxMp) * 100)));

const expPct = computed(() => {
  if (!s.nextExp || s.nextExp === 0) return 0;
  return Math.min(100, (s.exp / s.nextExp) * 100);
});

// v37.1: Stat flash animations
const soulFlash = ref(false);
const goldFlash = ref(false);
const expGain = ref(false);

let lastSouls = s.souls || 0;
let lastGold = s.gold || 0;
let lastExp = s.exp || 0;

watch(() => s.souls, (newSouls) => {
  if (newSouls > lastSouls) {
    soulFlash.value = true;
    setTimeout(() => soulFlash.value = false, 500);
  }
  lastSouls = newSouls;
});

watch(() => s.gold, (newGold) => {
  if (newGold > lastGold) {
    goldFlash.value = true;
    setTimeout(() => goldFlash.value = false, 500);
  }
  lastGold = newGold;
});

watch(() => s.exp, (newExp) => {
  if (newExp > lastExp) {
    expGain.value = true;
    setTimeout(() => expGain.value = false, 1000);
  }
  lastExp = newExp;
});

// v37.1: Format large numbers with abbreviations
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// Handle Control Panel Clicks
const handleAction = (action) => {
  switch (action) {
    case "explore":
      if (Game) Game.exploreState();
      break;
    case "menu":
      gameStore.state.activePanel = "pause-menu";
      break;

    // Combat
    case "attack":
      if (Combat) Combat.playerAttack();
      break;
    case "flee":
      if (Game) Game.exploreState(); // Or menu
      break;

    // States
    case "skill":
      if (Game) Game.skillState();
      break;
    case "item":
      // Save current panel before switching to inventory
      gameStore.state.previousPanel = gameStore.state.activePanel;
      if (Game) Game.invState();
      break;
    case "shop":
      if (Game) Game.merchantState();
      break;
    case "soul_shop":
      if (Game) Game.openSoulShop();
      break;
    case "rest":
      if (Game) Game.restState();
      break;
    case "status":
      gameStore.state.activePanel = "status";
      break;
    case "settings":
      gameStore.state.activePanel = "settings";
      break;
    case "resume_combat":
      gameStore.state.activePanel = "combat";
      gameStore.state.previousPanel = null;
      
      // v37.3 Fix: Restore Frozen Enemy if missing
      if ((!s.combat || !s.combat.enemy) && Game && Game._frozenEnemy) {
          if(!s.combat) s.combat = {};
          s.combat.enemy = Game._frozenEnemy;
          Game.enemy = Game._frozenEnemy;
      }
      break;
      
    // v38.8 FIX: Proper back action handler
    case "back":
      // v37.3 Fix: Context-Aware Return for Inventory Root Only
      if (gameStore.state.activePanel === 'inventory') {
           const storeEnemy = s.combat && s.combat.enemy;
           const coreEnemy = Game && Game.enemy;
           const frozenEnemy = Game && Game._frozenEnemy;
           
           if (storeEnemy || coreEnemy || frozenEnemy) {
               gameStore.state.activePanel = 'combat';
               gameStore.state.previousPanel = null;
               
               // Restore frozen enemy if needed
               if (!storeEnemy && !coreEnemy && frozenEnemy) {
                   if (!s.combat) s.combat = {};
                   s.combat.enemy = frozenEnemy;
                   Game.enemy = frozenEnemy;
               }
               return;
           }
      }

      // Use previousPanel if it exists, otherwise fallback
      if (gameStore.state.previousPanel) {
        const prev = gameStore.state.previousPanel;
        gameStore.state.previousPanel = null;
        gameStore.state.activePanel = prev;
      } else {
        // Fallback to title if we came from StartScreen panels
        const currentPanel = gameStore.state.activePanel;
        const startScreenPanels = ['run-setup', 'achievements', 'leaderboard', 'shop-ascension', 'daily'];
        if (startScreenPanels.includes(currentPanel)) {
          gameStore.state.activePanel = 'title';
        } else if (Game) {
          Game.menuState();
        }
      }
      break;
  }
};

// v36.8: Keyboard shortcuts
const handleKeyPress = (e) => {
  // ESC - Close panels
  if (e.key === 'Escape') {
    if (s.activePanel === 'skill-management' || s.activePanel === 'skill-selector') {
      s.activePanel = 'menu-view';
    }
    return;
  }
  
  // U - Open skill management
  if (e.key === 'u' || e.key === 'U') {
    if (s.activePanel === 'menu-view') {
      s.activePanel = 'skill-management';
    }
    return;
  }
  
  // 1-5 - Use skills in combat
  if (s.activePanel === 'combat' && ['1', '2', '3', '4', '5'].includes(e.key)) {
    const index = parseInt(e.key) - 1;
    const equippedSkills = s.equippedSkills || [];
    if (equippedSkills[index] && Combat) {
      const skillId = equippedSkills[index];
      const skillData = DB?.SKILLS?.[skillId];
      if (skillData) {
        Combat.executeSkill(skillId, skillData);
      }
    }
  }
};

// Register keyboard listener
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeyPress);
}
</script>

<template>
  <div id="app" :class="{ 
      scanline: s.settings ? s.settings.crt : true,
      'shake-sm': s.shake === 'small',
      'shake-md': s.shake === 'medium',
      'shake-hv': s.shake === 'heavy'
  }">
    <!-- OVERLAYS -->
    <div v-if="s.isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <div class="loading-text">SAVING...</div>
    </div>
    <MobileTooltip />
    <LoreCard />
    <VFXLayer />
    
    <!-- v38.8: Toast Notifications -->
    <div class="toast-container">
      <ToastNotification 
        v-for="toast in s.toasts" 
        :key="toast.id"
        :message="toast.message"
        :icon="toast.icon"
        :duration="toast.duration"
        @dismiss="gameStore.dismissToast(toast.id)"
      />
    </div>

    <!-- TITLE SCREEN -->
    <StartScreen v-if="s.activePanel === 'title'" />
    <DailyChallengePanel v-else-if="s.activePanel === 'daily'" />

    <!-- GAME UI -->
    <template v-else>
      <!-- HEADER v37.1 Enhanced -->
      <header class="game-header">
        <!-- Left: Settings + Resources -->
        <div class="header-resources">
          <!-- v37.3: Settings Gear Button -->
          <button class="gear-btn" @click="s.activePanel = 'pause-menu'" title="Menu">
            ⚙️
          </button>
          
          <div class="stat-block glass-block" :class="{ 'stat-flash': soulFlash }">
            <span class="stat-icon wobble-hover">💀</span>
            <span class="stat-val">{{ formatNumber(s.souls || 0) }}</span>
          </div>
          <div class="stat-block glass-block" :class="{ 'sp-pulse': spPulse }">
            <span class="stat-icon">⚡</span>
            <span class="stat-val">{{ s.sp || 0 }}</span>
          </div>
        </div>
        
        <!-- Center: Floor & Class -->
        <div class="header-center">
          <div class="floor-display">
            <span v-if="s.world && s.world.activeRealm && realmsConfig[s.world.activeRealm]" class="realm-icon">
              {{ realmsConfig[s.world.activeRealm].icon }}
            </span>
            <span class="floor-text">FL {{ isMobile && s.floor > 999 ? formatNumber(s.floor) : s.floor }}</span>
            <span class="progress-badge" v-if="s.floor <= 100">({{ s.progress }}%)</span>
          </div>
          <div class="class-display">{{ s.className }} Lv.{{ s.level }}</div>
          
          <!-- v38.4: Speed Run Timer (Polished) -->
          <div v-if="s.currentFloorTime > 0" class="speed-run-timer-container">
              <div class="speed-run-bar" :style="{ width: (s.currentFloorTime / (s.modifierEffects.floorTimer || 60)) * 100 + '%' }"></div>
              <div class="speed-run-content" :class="{'timer-low': s.currentFloorTime <= 10}">
                   <span class="timer-icon">⏳</span>
                   <span class="timer-val">{{ s.currentFloorTime }}s</span>
              </div>
          </div>
        </div>
        
        <!-- Right: Stats -->
        <div class="header-stats">
          <!-- HP Bar -->
          <div class="stat-bar-container">
            <div class="stat-bar-label">
              <span class="bar-icon">❤️</span>
              <span>{{ Math.floor(s.hp) }}/{{ s.maxHp }}</span>
            </div>
            <div class="stat-bar hp-bar">
              <div class="stat-bar-fill" :style="{ width: hpPct + '%' }" :class="{ 'bar-low': hpPct < 25, 'bar-critical': hpPct < 10 }"></div>
            </div>
          </div>
          
          <!-- MP Bar -->
          <div class="stat-bar-container">
            <div class="stat-bar-label">
              <span class="bar-icon">💧</span>
              <span>{{ Math.floor(s.mp) }}/{{ s.maxMp }}</span>
            </div>
            <div class="stat-bar mp-bar">
              <div class="stat-bar-fill" :style="{ width: mpPct + '%' }"></div>
            </div>
          </div>
          
          <!-- Gold -->
          <div class="gold-display" :class="{ 'gold-flash': goldFlash }">
            <span class="gold-icon">💰</span>
            <span class="gold-val">{{ formatNumber(s.gold) }}</span>
          </div>
        </div>
      </header>

      <!-- EXP BAR Enhanced -->
      <div id="progress-container" class="exp-bar-container">
        <div
          id="ui-progress-bar"
          class="exp-bar-fill"
          :class="{ 'exp-glow': expGain }"
          :style="{
            width: expPct + '%',
          }"
        ></div>
        <span class="exp-text">EXP {{ s.exp }}/{{ s.nextExp }}</span>
      </div>

      <!-- MAIN VIEW -->
      <div
        id="main-view"
        style="display: flex; flex-direction: column; flex: 1; overflow: hidden"
      >
        <!-- COMBAT HEADER -->
        <CombatPanel v-if="s.activePanel === 'combat' || s.activePanel === 'combat_skills' || s.activePanel === 'skill-selector'" />

        <!-- LOGS (Always show in combat/explore/menu) -->
        <LogPanel
          :logs="s.logs"
          v-if="
            !s.activePanel ||
            s.activePanel === 'menu-view' ||
            s.activePanel === 'combat' ||
            s.activePanel === 'skill-selector'
          "
        />

        <!-- PANELS -->
        <InventoryPanel 
          v-if="s.activePanel === 'inventory'" 
          :inventory="s.inventory" 
          :gold="s.gold" 
        />
        <MerchantPanel v-if="s.activePanel === 'shop'" />
        <StatsPanel v-if="s.activePanel === 'status'" />
      
      <!-- v36.9 Phase 3: Floating Action Button (Mobile Only) -->
      <button 
        v-if="s.activePanel === 'menu-view' && isMobile" 
        class="fab"
        @click="s.activePanel = 'skill-management'"
        :aria-label="'Open Skills'"
      >
        🔮
      </button>

      <VictoryPanel v-if="s.activePanel === 'victory'" />
        
        <!-- v36.8 Phase 2: Panel Transitions -->
        <Transition name="panel-slide" mode="out-in">
          <SkillManagementPanel v-if="s.activePanel === 'skill-management'" key="skill-mgmt" />
        </Transition>
        <SkillsPanel v-if="s.activePanel === 'skills'" />
        
        <Transition name="panel-slide" mode="out-in">
          <CombatSkillSelector v-if="s.activePanel === 'skill-selector'" key="skill-select" />
        </Transition>
        
        <CraftingPanel v-if="s.activePanel === 'crafting'" />
        <LeaderboardPanel v-if="s.activePanel === 'leaderboard'" />
        <ClassSelectionPanel v-if="s.activePanel === 'class'" />
        <LevelUpPanel v-if="s.activePanel === 'levelup'" />
        <EvolutionPanel v-if="s.activePanel === 'evo'" /> <!-- NEW -->
        <BossRushPanel v-if="s.activePanel === 'boss-rush'" />
        <SoulForgePanel v-if="s.activePanel === 'shop-ascension'" />
        <AchievementsPanel v-if="s.activePanel === 'achievements'" />
        <SettingsPanel v-if="s.activePanel === 'settings'" /> <!-- NEW -->
        <WorldMapPanel v-if="s.activePanel === 'world_map'" />
        <NodeMapPanel v-if="s.activePanel === 'node_map'" />
        <PauseMenuPanel v-if="s.activePanel === 'pause-menu'" />
        <EventPanel v-if="s.activePanel === 'event'" />
        <ReforgePanel v-if="s.activePanel === 'reforge'" /> <!-- v37.0 Phase 2 -->
        <BlackMarketPanel v-if="s.activePanel === 'black_market'" /> <!-- v37.0 Phase 3 -->
        <SocketingPanel v-if="s.activePanel === 'socketing'" />
        <StatAllocationPanel v-if="s.activePanel === 'stat-allocation'" /> <!-- v37.3: Free stat points -->
        <RunSetupPanel v-if="s.activePanel === 'run-setup'" /> <!-- v38.4: Challenge modifiers -->

        <!-- CONTROLS -->
        <ControlPanel @action="handleAction" />
      </div>
    </template>
  </div>
</template>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  /* Height handled by style.css (100dvh) */
  width: 100%;
  padding: 10px 10px calc(10px + env(safe-area-inset-bottom)) 10px; /* Safe Area Fix */
  box-sizing: border-box;
}
/* Header handled by global style.css for responsive grid */

/* ============================================
   v37.1 ENHANCED HEADER STYLES
   ============================================ */

.game-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  padding: 10px 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--glass-border);
  align-items: center;
}

.header-resources {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* v37.3: Gear Button for Pause Menu */
.gear-btn {
  background: rgba(30, 30, 35, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gear-btn:hover {
  background: rgba(60, 60, 70, 0.8);
  border-color: var(--c-gold);
  transform: rotate(45deg);
}

.gear-btn:active {
  transform: rotate(90deg) scale(0.95);
}

.stat-block.glass-block {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(30, 30, 35, 0.6);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.stat-block.glass-block:hover {
  background: rgba(40, 40, 50, 0.7);
  border-color: rgba(255, 255, 255, 0.1);
}

.stat-icon {
  font-size: 1.1rem;
}

.stat-icon.wobble-hover:hover {
  animation: wiggle 0.5s ease-in-out;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

.stat-flash {
  animation: statFlash 0.5s ease-out;
}

@keyframes statFlash {
  0%, 100% { 
    background: rgba(30, 30, 35, 0.6); 
    box-shadow: none;
  }
  50% { 
    background: rgba(207, 170, 76, 0.3); 
    box-shadow: 0 0 15px rgba(207, 170, 76, 0.4);
  }
}

.gold-flash {
  animation: goldFlashAnim 0.5s ease-out;
}

@keyframes goldFlashAnim {
  0%, 100% { transform: scale(1); }
  50% { 
    transform: scale(1.1); 
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
  }
}

/* Center: Floor & Class */
.header-center {
  text-align: center;
}

.floor-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--c-gold);
  font-weight: bold;
}

.realm-icon {
  font-size: 1.2rem;
}

.floor-text {
  font-size: 1rem;
}

.progress-badge {
  font-size: 0.75rem;
  color: var(--text-muted, #666);
  font-weight: normal;
}

.class-display {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

/* Right: Stats */
.header-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 100px;
}

.stat-bar-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-bar-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.bar-icon {
  font-size: 0.65rem;
}

.stat-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-bar-fill {
  height: 100%;
  transition: width 0.3s ease-out;
  border-radius: 3px;
}

.hp-bar .stat-bar-fill {
  background: linear-gradient(90deg, var(--c-red, #bb3333), #ff5555);
  box-shadow: 0 0 6px rgba(187, 51, 51, 0.4);
}

.hp-bar .stat-bar-fill.bar-low {
  animation: barPulse 1s ease-in-out infinite;
}

.hp-bar .stat-bar-fill.bar-critical {
  animation: barPulseCritical 0.5s ease-in-out infinite;
}

@keyframes barPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes barPulseCritical {
  0%, 100% { opacity: 1; box-shadow: 0 0 10px rgba(255, 0, 0, 0.6); }
  50% { opacity: 0.5; box-shadow: 0 0 5px rgba(255, 0, 0, 0.3); }
}

.mp-bar .stat-bar-fill {
  background: linear-gradient(90deg, var(--c-blue, #4d88ff), #66b3ff);
  box-shadow: 0 0 6px rgba(77, 136, 255, 0.4);
}

.gold-display {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 0.8rem;
  color: var(--c-gold);
  margin-top: 2px;
}

.gold-icon {
  font-size: 0.9rem;
}

/* EXP Bar */
.exp-bar-container {
  height: 8px;
  background: rgba(30, 30, 35, 0.8);
  margin-bottom: 8px;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.exp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--c-purple, #9b59b6), #bb77dd);
  transition: width 0.4s ease-out;
  box-shadow: 0 0 8px rgba(155, 89, 182, 0.4);
}

.exp-bar-fill.exp-glow {
  animation: expGlowAnim 1s ease-out;
}

@keyframes expGlowAnim {
  0% { box-shadow: 0 0 8px rgba(155, 89, 182, 0.4); }
  50% { box-shadow: 0 0 20px rgba(155, 89, 182, 0.8), 0 0 30px rgba(155, 89, 182, 0.5); }
  100% { box-shadow: 0 0 8px rgba(155, 89, 182, 0.4); }
}

.exp-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.55rem;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 0 0 2px #000;
  pointer-events: none;
}

/* Mobile Header */
@media (max-width: 767px) {
  .game-header {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    gap: 8px;
    padding: 8px;
  }
  
  .header-center {
    order: -1;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding-bottom: 6px;
  }
  
  .header-resources {
    justify-content: center;
  }
  
  .header-stats {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    min-width: auto;
  }
  
  .stat-bar-container {
    flex: 1;
    max-width: 100px;
  }
  
  .gold-display {
    margin-top: 0;
  }
}

/* Shake Animations */
.shake-sm { animation: shake-sm 0.3s cubic-bezier(.36,.07,.19,.97) both; }
.shake-md { animation: shake-md 0.5s cubic-bezier(.36,.07,.19,.97) both; }
.shake-hv { animation: shake-hv 0.5s cubic-bezier(.36,.07,.19,.97) both; }

@keyframes shake-sm {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

/* v36.8 Phase 2: Panel Slide Transitions */
.panel-slide-enter-active, .panel-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55), 
              opacity 0.2s ease;
}

.panel-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.panel-slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

@keyframes shake-md {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

@keyframes shake-hv {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-10px, 0, 0); }
  40%, 60% { transform: translate3d(10px, 0, 0); }
}

/* v36.8 Phase 2: SP Pulse Animation */
.sp-pulse {
  animation: sp-pulse 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes sp-pulse {
  0% { 
    transform: scale(1); 
    filter: drop-shadow(0 0 0 rgba(255, 215, 0, 0));
  }
  50% { 
    transform: scale(1.3); 
    filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
  }
  100% { 
    transform: scale(1); 
    filter: drop-shadow(0 0 0 rgba(255, 215, 0, 0));
  }
}

.sp-pulse .stat-val {
  color: #ffd700 !important;
}

/* ============================================
   v38.4: Speed Run Timer
   ============================================ */
.speed-run-timer-container {
    position: relative;
    width: 80px;
    height: 24px;
    background: #111;
    border: 1px solid #444;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 5px;
    box-shadow: 0 2px 4px #000;
}

.speed-run-bar {
    position: absolute;
    top: 0; left: 0;
    height: 100%;
    background: linear-gradient(90deg, #a00, #f44);
    opacity: 0.4;
    transition: width 1s linear;
    z-index: 1;
}

.speed-run-content {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 0.9rem;
    font-weight: bold;
    color: #fff;
    gap: 4px;
}

.timer-low {
    color: #ff5555;
    text-shadow: 0 0 5px #f00;
    animation: timerPulse 0.5s infinite alternate;
}

@keyframes timerPulse {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0.8; transform: scale(1.05); }
}

/* ============================================
   v38.0: UTILITIES
   v36.9 PHASE 1: MOBILE TOUCH OPTIMIZATION
   ============================================ */


/* Loading Overlay */
.loading-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9999;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    backdrop-filter: blur(5px);
}
.loading-spinner {
    width: 40px; height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 4px solid var(--c-gold);
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
}
.loading-text {
    color: var(--c-gold);
    font-weight: bold;
    letter-spacing: 2px;
    animation: pulse 1.5s infinite;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Global touch optimization */
* {
  -webkit-tap-highlight-color: transparent;
}

button, a, input, select {
  touch-action: manipulation;
}

/* Prevent overscroll bounce */
body {
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
}

/* iOS safe areas */
@supports (padding: env(safe-area-inset-top)) {
  .header {
    padding-top: max(10px, env(safe-area-inset-top));
  }
  
  #control-panel {
    padding-bottom: max(10px, env(safe-area-inset-bottom));
  }
}

/* Mobile: Adjust font sizes */
@media (max-width: 767px) {
  body {
    font-size: 14px;
  }
  
  .stat-label {
    font-size: 1.1rem;
  }
  
  .stat-val {
    font-size: 1rem;
  }
}

/* Touch devices: Add active states */
@media (hover: none) and (pointer: coarse) {
  button:active {
    opacity: 0.85;
    transform: scale(0.97);
  }
}

/* ============================================
   v36.9 PHASE 3: MOBILE COMPONENTS & GESTURES
   ============================================ */

/* Floating Action Button */
.fab {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--c-gold), #ff9500);
  color: #000;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 
              0 2px 8px rgba(255, 215, 0, 0.3);
  z-index: 200;
  display: none;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.fab:active {
  transform: scale(0.9);
}

@media (max-width: 767px) {
  .fab {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* FAB ripple effect */
.fab::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.fab:active::after {
  width: 100%;
  height: 100%;
}

/* Performance: Reduce animations on mobile */
@media (max-width: 767px) and (prefers-reduced-motion: no-preference) {
  .panel-slide-enter-active,
  .panel-slide-leave-active {
    transition: transform 0.2s ease, opacity 0.15s ease;
  }
  
  /* Simplify complex animations */
  .upgrade-glow {
    animation: none;
  }
  
  .cd-tick-enter-active {
    animation-duration: 0.3s;
  }
}

/* Landscape orientation adjustments */
@media (max-width: 767px) and (orientation: landscape) {
  .fab {
    bottom: 20px;
    right: 20px;
  }
}

/* v38.8: Toast Notification Container */
.toast-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}
.toast-container > * {
  pointer-events: auto;
}
</style>

