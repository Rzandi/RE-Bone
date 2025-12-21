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

const s = gameStore.state;

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
      if (window.Game) window.Game.menuState();
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
      if (window.Game) window.Game.menuState();
      break;
  }
};
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
        <div class="col-c">
          <span style="color: var(--c-gold)">FL {{ s.floor }}</span>
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
        <EvolutionPanel v-if="s.activePanel === 'evolution'" />
        <SkillsPanel v-if="s.activePanel === 'skills'" /> 
        <CombatSkillSelector v-if="s.activePanel === 'combat_skills'" />
        <CraftingPanel v-if="s.activePanel === 'crafting'" />
        <LeaderboardPanel v-if="s.activePanel === 'leaderboard'" />
        <ClassSelectionPanel v-if="s.activePanel === 'class'" />
        <SoulForgePanel v-if="s.activePanel === 'shop-ascension'" />
        <AchievementsPanel v-if="s.activePanel === 'achievements'" />
        <SettingsPanel v-if="s.activePanel === 'settings'" /> <!-- NEW -->

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
  height: 100vh;
  padding: 10px;
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
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-2px, 0, 0); }
  40%, 60% { transform: translate3d(2px, 0, 0); }
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
</style>
