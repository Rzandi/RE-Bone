<script setup>
import { computed } from "vue";
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
import CraftingPanel from "./components/CraftingPanel.vue";
import LeaderboardPanel from "./components/LeaderboardPanel.vue";
import ClassSelectionPanel from "./components/ClassSelectionPanel.vue";
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
import { REALMS } from "./game/config/realms";

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

onMounted(() => {
  const handleResize = () => {
    windowWidth.value = window.innerWidth;
  };
  window.addEventListener('resize', handleResize);
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
});

const isMobile = computed(() => windowWidth.value <= 767);

// Computed for bars
const hpPct = computed(() => (s.hp / s.maxHp) * 100);
const mpPct = computed(() => (s.mp / s.maxMp) * 100);



const expPct = computed(() => {
  if (!s.nextExp || s.nextExp === 0) return 0;
  return (s.exp / s.nextExp) * 100;
});

// Handle Control Panel Clicks
const handleAction = (action) => {
  switch (action) {
    case "explore":
      if (window.Game) window.Game.exploreState();
      break;
    case "menu":
      gameStore.state.activePanel = "pause-menu";
      break;

    // Combat
    case "attack":
      if (window.CombatManager) window.CombatManager.playerAttack();
      break;
    case "flee":
      if (window.Game) window.Game.exploreState(); // Or menu
      break;

    // States
    case "skill":
      if (window.Game) window.Game.skillState();
      break;
    case "item":
      // Save current panel before switching to inventory
      gameStore.state.previousPanel = gameStore.state.activePanel;
      if (window.Game) window.Game.invState();
      break;
    case "shop":
      if (window.Game) window.Game.merchantState();
      break;
    case "soul_shop":
      if (window.Game) window.Game.openSoulShop();
      break;
    case "rest":
      if (window.Game) window.Game.restState();
      break;
    case "status":
      // Todo: Status Panel
      gameStore.state.activePanel = "status";
      break;
    case "settings":
      gameStore.state.activePanel = "settings";
      break;
    case "back":
      // Restore previous panel if it exists, otherwise go to menu
      if (gameStore.state.previousPanel) {
        const prev = gameStore.state.previousPanel;
        gameStore.state.previousPanel = null; // Clear it
        gameStore.state.activePanel = prev;
      } else {
        if (window.Game) window.Game.menuState();
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
    if (equippedSkills[index] && window.CombatManager) {
      const skillId = equippedSkills[index];
      const skillData = window.DB?.SKILLS?.[skillId];
      if (skillData) {
        window.CombatManager.executeSkill(skillId, skillData);
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
    <MobileTooltip />
    <LoreCard />
    <VFXLayer />

    <!-- TITLE SCREEN -->
    <StartScreen v-if="s.activePanel === 'title'" />

    <!-- GAME UI -->
    <template v-else>
      <!-- HEADER -->
      <header>
        <div class="stat-block">
        <span class="stat-label">💀</span>
        <span class="stat-val">{{ s.souls || 0 }}</span>
      </div>
      <div class="stat-block" :class="{ 'sp-pulse': spPulse }">
        <span class="stat-label">⚡</span>
        <span class="stat-val">{{ s.sp || 0 }}</span>
      </div>
        <div class="col-c">
          <span style="color: var(--c-gold)">
              <span v-if="s.world && s.world.activeRealm && realmsConfig[s.world.activeRealm]">
                  {{ realmsConfig[s.world.activeRealm].icon }} 
              </span>
              FL {{ s.floor }}
          </span>
          <small style="color: #888"> ({{ s.progress }}%)</small><br />
          <span style="font-size: 0.8rem"
            >{{ s.className }} Lv.{{ s.level }}</span
          >
        </div>
        <div class="col-r" style="text-align: right">
          <div style="color: var(--c-red)">
            HP {{ Math.floor(s.hp) }}/{{ s.maxHp }}
          </div>
          <div style="color: var(--c-blue)">
            MP {{ Math.floor(s.mp) }}/{{ s.maxMp }}
          </div>
          <div style="color: var(--c-gold)">{{ s.gold }} G</div>
        </div>
      </header>

      <!-- EXP BAR (Was Progress) -->
      <div id="progress-container">
        <div
          id="ui-progress-bar"
          :style="{
            width: expPct + '%',
            background: 'var(--c-purple, #9370db)',
            height: '100%',
            transition: 'width 0.3s',
          }"
        ></div>
      </div>

      <!-- MAIN VIEW -->
      <div
        id="main-view"
        style="display: flex; flex-direction: column; flex: 1; overflow: hidden"
      >
        <!-- COMBAT HEADER -->
        <CombatPanel v-if="s.activePanel === 'combat' || s.activePanel === 'combat_skills'" />

        <!-- LOGS (Always show in combat/explore/menu) -->
        <LogPanel
          :logs="s.logs"
          v-if="
            !s.activePanel ||
            s.activePanel === 'menu-view' ||
            s.activePanel === 'combat'
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
        <ControlPanel v-if="s.activePanel === 'menu-view'" @action="handleAction" />
      
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
        
        <Transition name="panel-slide" mode="out-in">
          <CombatSkillSelector v-if="s.activePanel === 'skill-selector'" key="skill-select" />
        </Transition>
        
        <CraftingPanel v-if="s.activePanel === 'crafting'" />
        <LeaderboardPanel v-if="s.activePanel === 'leaderboard'" />
        <ClassSelectionPanel v-if="s.activePanel === 'class'" />
        <SoulForgePanel v-if="s.activePanel === 'shop-ascension'" />
        <AchievementsPanel v-if="s.activePanel === 'achievements'" />
        <SettingsPanel v-if="s.activePanel === 'settings'" /> <!-- NEW -->
        <WorldMapPanel v-if="s.activePanel === 'world_map'" />
        <NodeMapPanel v-if="s.activePanel === 'node_map'" />
        <PauseMenuPanel v-if="s.activePanel === 'pause-menu'" />
        <EventPanel v-if="s.activePanel === 'event'" />

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
#progress-container {
  height: 4px;
  background: #222;
  margin-bottom: 10px;
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
   v36.9 PHASE 1: MOBILE TOUCH OPTIMIZATION
   ============================================ */

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
</style>
```
