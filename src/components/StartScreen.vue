<script setup>
import { ref, onMounted } from "vue";
import { gameStore } from "../game/store.js";
import { SaveManager } from "../game/managers/SaveManager.js";
import { initGame } from "../game/entry.js"; // We might need to re-think init flow

const hasSave = ref(false);

onMounted(() => {
  hasSave.value = SaveManager.hasSave();
});

const onNewGame = () => {
  if (hasSave.value) {
    if (!confirm("Overwrite existing save?")) return;
  }

  SaveManager.clearSave();
  gameStore.state.logs = [];
  gameStore.state.activePanel = "class";
};

const onContinue = () => {
  if (SaveManager.loadGame()) {
    SaveManager.initAutoSave(); // Start Autosave
    
    // Resume Game Loop
    if(window.Game) {
        if(gameStore.state.activePanel === 'combat') {
             // If we were in combat/explore, we need to restart the loop
             // But Game.exploreState() resets UI...
             if(gameStore.state.combat && gameStore.state.combat.enemy) {
                 window.Game.combatState(); // Resume combat
             } else {
                 window.Game.exploreState(); // Resume explore
             }
        } else {
             window.Game.menuState();
        }
    }
  } else {
    alert("Failed to load save!");
  }
};

const showLeaderboard = () => {
    // We can't use gameStore activePanel efficiently if we are in StartScreen overlay?
    // StartScreen is v-if="activePanel === 'title'".
    // So if we switch activePanel to 'leaderboard', StartScreen disappears and Leaderboard appears.
    // That's actually correct behavior.
    gameStore.state.activePanel = "leaderboard";
};

const showSoulForge = () => {
    gameStore.state.activePanel = "shop-ascension";
};

const showAchievements = () => {
    gameStore.state.activePanel = "achievements";
};

const showPatchModal = ref(false);

const patchNotes = [
    { ver: "v33.1", date: "2025-12-21", changes: ["Audio Expansion: Level Up, Victory, Ascend Sounds", "VFX Juice: Screen Shake & Blood Particles", "Optimized Codebase"] },
    { ver: "v33.0", date: "2025-12-21", changes: ["New Game+: Endless Ascension Cycles", "Soft Reset: Keep Souls & Unlocks", "Difficulty Scaling (+20% per Cycle)"] },
    { ver: "v32.2", date: "2025-12-21", changes: ["Inventory Overhaul: Item Details & Safe Use", "Loot Upgrade: Gold Drops & Consolidated Logs", "UI Fixes: Auto-Scroll Logs, Boss Button Fix","Minor Bugs Fixed"] },
    { ver: "v32.1", date: "2025-12-19", changes: ["Roguelike Mode: Permadeath & Sanctuary Saving", "New Content: God-Tier Passives", "UI Polish: Start Screen Remaster"] },
    { ver: "v32.0", date: "2025-12-18", changes: ["Vue 3 Migration Complete", "Performance Optimization", "Mobile Controls"] },
    { ver: "v31.0", date: "2025-12-10", changes: ["Boss Rush Mode Added", "New Classes: Dark Knight, Necro Priest", "Balance Changes"] }
];

const togglePatchNotes = () => {
    showPatchModal.value = !showPatchModal.value;
};

const ascension = computed(() => {
    return gameStore.state.meta?.ascensionLevel || 0;
});
</script>

<template>
  <div class="start-screen scanline">
    <div class="title-container">
      <h1>RE:BONE</h1>
      <p class="version-text">v33.1 POLISHED</p>
      <div v-if="ascension > 0" class="cycle-display">
          ☠️ CYCLE {{ ascension }} ☠️
      </div>
    </div>

    <!-- MAIN MENU -->
    <div class="menu">
      <div class="primary-actions">
           <!-- Logic: If Save exists, show CONTINUE clearly. -->
           <button v-if="hasSave" class="btn-main btn-continue" @click="onContinue">[ CONTINUE ]</button>
           <button class="btn-main btn-start" @click="onNewGame">[ NEW GAME ]</button>
      </div>
      
      <p class="powered-text">Powered by Gemini AI ✨</p>

      <div class="extra-menu">
          <button class="btn-small" @click="showLeaderboard">🏆 HALL OF BONES</button>
          <button class="btn-small" @click="showAchievements">🎖️ ACHIEVEMENTS</button>
          <button class="btn-small" @click="showSoulForge">👻 SOUL SHOP</button>
          <button class="btn-small" @click="onNewGame">🌞 DAILY RUN</button> <!-- Using New Game for now as placeholder for Daily logic -->
      </div>
      
      <!-- Soul Forge if unlocked? Kept hidden for clean UI or add if needed -->
    </div>

    <div class="footer-actions">
        <button class="btn-link" @click="togglePatchNotes">PATCH NOTES</button>
    </div>

    <!-- PATCH NOTES MODAL -->
    <div v-if="showPatchModal" class="modal-overlay" @click.self="togglePatchNotes">
        <div class="modal-content">
            <h2>📜 CHANGELOGS</h2>
            <div class="changelog-list">
                <div v-for="(note, idx) in patchNotes" :key="idx" class="patch-entry">
                    <div class="patch-header">
                        <span class="patch-ver">{{ note.ver }}</span>
                        <span class="patch-date">{{ note.date }}</span>
                    </div>
                    <ul>
                        <li v-for="c in note.changes" :key="c">- {{ c }}</li>
                    </ul>
                </div>
            </div>
            <button class="btn-close" @click="togglePatchNotes">CLOSE</button>
        </div>
    </div>

  </div>
</template>

<style scoped>
.start-screen {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: #050505;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  color: #eee;
  font-family: 'Courier New', Courier, monospace;
}

.title-container {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeIn 2s;
}

h1 {
  font-size: 5rem;
  margin: 0;
  color: #d04040; /* Red Serif Tone */
  font-family: 'Times New Roman', serif;
  text-shadow: 0 0 10px #500;
  letter-spacing: 5px;
}

.version-text {
  color: #666;
  margin-top: 5px;
  font-size: 0.9rem;
  opacity: 0.7;
}

.menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
  max-width: 400px;
}

.primary-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    align-items: center;
}

.btn-main {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 1.5rem;
    cursor: pointer;
    font-weight: bold;
    padding: 10px 20px;
    transition: all 0.2s;
}

.btn-main:hover {
    color: var(--c-gold);
    text-shadow: 0 0 10px var(--c-gold);
    transform: scale(1.1);
}

.powered-text {
    font-size: 0.8rem;
    color: #0bd;
    margin: 10px 0;
    opacity: 0.8;
}

.extra-menu {
    display: flex;
    gap: 15px;
    justify-content: center;
    width: 100%;
}

.btn-small {
    background: #111;
    border: 1px solid #444;
    color: #aaa;
    padding: 10px 15px;
    font-size: 0.9rem;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
}

.btn-small:hover {
    border-color: var(--c-gold);
    color: var(--c-gold);
    background: #222;
}

.footer-actions {
    position: absolute;
    bottom: 30px;
}

.btn-link {
    background: none;
    border: none;
    color: #555;
    text-decoration: underline;
    cursor: pointer;
    font-size: 0.8rem;
    transition: color 0.2s;
}

.btn-link:hover {
    color: #ccc;
}

/* MODAL */
.modal-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(5px);
    z-index: 2100;
}

.modal-content {
    background: #111;
    border: 1px solid #444;
    padding: 20px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    border-radius: 5px;
    box-shadow: 0 0 20px #000;
}

.modal-content h2 {
    color: var(--c-gold);
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
    margin-top: 0;
    text-align: center;
}

.changelog-list {
    margin: 20px 0;
}

.patch-entry {
    margin-bottom: 15px;
    border-bottom: 1px solid #222;
    padding-bottom: 10px;
}

.patch-header {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    color: #eee;
    margin-bottom: 5px;
}

.patch-date {
    color: #666;
    font-size: 0.8rem;
}

.patch-entry ul {
    margin: 0;
    padding-left: 20px;
    color: #aaa;
    font-size: 0.9rem;
}

.btn-close {
    width: 100%;
    padding: 10px;
    background: #222;
    border: 1px solid #444;
    color: #fff;
    cursor: pointer;
}

.btn-close:hover {
    background: #333;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.cycle-display {
    color: #f00;
    font-weight: bold;
    letter-spacing: 2px;
    margin-top: 5px;
    animation: pulse 2s infinite;
}
</style>
