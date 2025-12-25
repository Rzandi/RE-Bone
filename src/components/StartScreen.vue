<script setup>
import { ref, onMounted, computed, onUnmounted, toRaw } from "vue";
import { gameStore } from "../game/store.js";
import { SaveManager } from "../game/managers/SaveManager.js";
import { initGame } from "../game/entry.js";
import { SoundManager } from "../game/managers/sound.js";
import { Game } from "../game/core/game.js";
import { SocialManager } from "../game/managers/social.js";
import { Ascension } from "../game/managers/ascension.js";
import { Achievements } from "../game/managers/achievements.js";

const hasSave = ref(false);

// v37.1: Save Preview Data
const savePreview = ref(null);

// v37.1: Ember particles
const embers = ref([]);
let emberInterval = null;

onMounted(() => {
  hasSave.value = SaveManager.hasSave();
  
  // v37.1: Load save preview if exists
  if (hasSave.value) {
    try {
      const rawSave = localStorage.getItem('rebone_save');
      if (rawSave) {
        const saveData = JSON.parse(rawSave);
        savePreview.value = {
          className: saveData.className || 'Unknown',
          floor: saveData.floor || 1,
          souls: saveData.souls || 0,
          level: saveData.level || 1
        };
      }
    } catch (e) {
      console.warn('Failed to load save preview:', e);
      savePreview.value = null;
    }
  }
  
  // v37.1: Start ember particles
  createEmbers();
  emberInterval = setInterval(createEmbers, 2000);
});

onUnmounted(() => {
  if (emberInterval) clearInterval(emberInterval);
});

// v37.1: Create floating ember particles
const createEmbers = () => {
  const count = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const ember = {
      id: Date.now() + i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 3,
      size: 2 + Math.random() * 4
    };
    embers.value.push(ember);
    
    // Remove after animation
    setTimeout(() => {
      embers.value = embers.value.filter(e => e.id !== ember.id);
    }, (ember.duration + ember.delay) * 1000);
  }
  
  // Limit max embers
  if (embers.value.length > 30) {
    embers.value = embers.value.slice(-20);
  }
};

const onNewGame = () => {
  if (hasSave.value) {
    if (!confirm("Overwrite existing save?")) return;
  }
  
  // Play sound
  // Play sound
  if (SoundManager) SoundManager.play('menu_open');

  SaveManager.clearSave();
  gameStore.state.logs = [];
  gameStore.state.activePanel = "class";
};

const onContinue = () => {
  // Play sound
  // Play sound
  if (SoundManager) SoundManager.play('success');
  
  if (SaveManager.loadGame()) {
    SaveManager.initAutoSave(); // Start Autosave
    
    // Resume Game Loop
    if(Game) {
        // v38.5: Sync Game State (Fixes Floor 1 Regression Bug)
        if(Game.syncStateFromStore) Game.syncStateFromStore();

        // v38.4: Restart Global Timer (it stops on app reload)
        Game.startGlobalTimer();
        
        if(gameStore.state.activePanel === 'combat') {
             // If we were in combat/explore, we need to restart the loop
             // But Game.exploreState() resets UI...
             if(gameStore.state.combat && gameStore.state.combat.enemy) {
                 Game.combatState(); // Resume combat
             } else {
                 Game.exploreState(); // Resume explore
             }
        } else {
             Game.menuState();
        }
    }
  } else {
    if (SoundManager) SoundManager.play('error');
    alert("Failed to load save!");
  }
};

const showLeaderboard = () => {
    if(!SocialManager) { 
        console.error("Social Manager missing");
        alert("Error: Social Manager not loaded. Please refresh.");
        return; 
    }
    if (SoundManager) SoundManager.play('menu_open');
    gameStore.state.previousPanel = 'title'; // v38.0: Track where we came from
    gameStore.state.activePanel = "leaderboard";
};

const showSoulForge = () => {
    if(!Ascension) { 
        console.error("Ascension Manager missing");
        alert("Error: Ascension Manager not loaded. Please refresh.");
        return; 
    }
    if (SoundManager) SoundManager.play('menu_open');
    gameStore.state.previousPanel = 'title'; // v38.0: Track where we came from
    gameStore.state.activePanel = "shop-ascension";
};

const showAchievements = () => {
    if(!Achievements) { 
        console.error("Achievements Manager missing");
        alert("Error: Achievements Manager not loaded. Please refresh.");
        return; 
    }
    if (SoundManager) SoundManager.play('menu_open');
    gameStore.state.previousPanel = 'title'; // v38.0: Track where we came from
    gameStore.state.activePanel = "achievements";
};

// v38.4: Show Challenge Modifiers panel
const showChallengeModifiers = () => {
    if (SoundManager) SoundManager.play('menu_open');
    gameStore.state.previousPanel = 'title';
    gameStore.state.activePanel = "run-setup";
};

// v38.5: Daily Challenge
const showDailyChallenge = () => {
    if (SoundManager) SoundManager.play('menu_open');
    gameStore.state.previousPanel = 'title';
    gameStore.state.activePanel = "daily";
};

const showPatchModal = ref(false);

import { PATCH_NOTES } from "../game/config/patch_notes.js";

const patchNotes = PATCH_NOTES;

const togglePatchNotes = () => {
    if (SoundManager) SoundManager.play('tab_switch');
    showPatchModal.value = !showPatchModal.value;
};

const ITEMS_PER_PAGE = 4;
const currentPage = ref(0);

const totalPages = computed(() => Math.ceil(patchNotes.length / ITEMS_PER_PAGE));

const paginatedPatches = computed(() => {
    const start = currentPage.value * ITEMS_PER_PAGE;
    return patchNotes.slice(start, start + ITEMS_PER_PAGE);
});

const nextPage = () => {
    if (currentPage.value < totalPages.value - 1) currentPage.value++;
};

const prevPage = () => {
    if (currentPage.value > 0) currentPage.value--;
};

const onImportSave = () => {
  const saveString = prompt("📥 Paste your save string below:");
  
  if (!saveString) return; // User cancelled
  
  if (confirm("⚠️ This will overwrite your current save. Continue?")) {
    const success = SaveManager.importSaveString(saveString);
    
    if (success) {
      if (SoundManager) SoundManager.play('success');
      alert("✅ Save imported successfully! Click Continue to load."); 
      hasSave.value = true; // Show Continue button
      
      // Update preview
      try {
        const rawSave = localStorage.getItem('rebone_save');
        if (rawSave) {
          const saveData = JSON.parse(rawSave);
          savePreview.value = {
            className: saveData.className || 'Unknown',
            floor: saveData.floor || 1,
            souls: saveData.souls || 0,
            level: saveData.level || 1
          };
        }
      } catch (e) {
        savePreview.value = null;
      }
    } else {
      if (SoundManager) SoundManager.play('error');
      alert("❌ Import failed! Invalid save string.");
    }
  }
};

const installAvailable = computed(() => {
    return gameStore.state.installPrompt !== null;
});

const installApp = async () => {
    try {
        const prompt = toRaw(gameStore.state.installPrompt);
        if (!prompt) return;
        
        await prompt.prompt();
        
        const { outcome } = await prompt.userChoice;
        console.log(`User  Choice: ${outcome}`);
        
        if (outcome === 'accepted') {
            gameStore.state.installPrompt = null;
        }
    } catch (err) {
        console.error("Install prompt error:", err);
        alert("Install error: " + err.message);
    }
};

const ascension = computed(() => {
    return gameStore.state.meta?.ascensionLevel || 0;
});
</script>

<template>
  <div class="start-screen scanline">
    <!-- v37.1: Floating Ember Particles -->
    <div class="ember-container">
      <div 
        v-for="ember in embers" 
        :key="ember.id"
        class="ember"
        :style="{
          left: ember.left + '%',
          animationDelay: ember.delay + 's',
          animationDuration: ember.duration + 's',
          width: ember.size + 'px',
          height: ember.size + 'px'
        }"
      ></div>
    </div>

    <div class="title-container">
      <div class="main-title">
        <span class="title-re">Re:</span>
        <span class="title-div">|</span>
        <span class="title-bone">BONE</span>
      </div>
      <p class="version-text">v38.9 PWA Ready</p>
      
      <div class="future-focus-container">
          <span class="focus-label">🔮 NEXT UPDATE FOCUS:</span>
          <div class="focus-items">
              <span>Story</span> • <span>Narrative</span> • <span>Immersive Depth</span> • <span>2D Pixel Sprites</span> • <span>Cinematics/Video</span>
          </div>
      </div>
      <div v-if="ascension > 0" class="cycle-display">
          ☠️ CYCLE {{ ascension }} ☠️
      </div>
    </div>

    <!-- MAIN MENU -->
    <div class="menu stagger-children">
      <div class="primary-actions">
           <!-- Logic: If Save exists, show CONTINUE with preview -->
           <button v-if="hasSave" class="btn-main btn-continue animate-initial" @click="onContinue">
             [ CONTINUE ]
             <span v-if="savePreview" class="save-preview">
               {{ savePreview.className }} Lv.{{ savePreview.level }} • FL{{ savePreview.floor }} • 💀{{ savePreview.souls }}
             </span>
           </button>
           <button class="btn-main btn-start animate-initial" @click="onNewGame">[ NEW GAME ]</button>
           
           <!-- v38.9: PWA Install Button -->
           <button v-if="installAvailable" class="btn-main btn-install animate-initial" @click="installApp" style="color:var(--c-gold)">
             [ 📥 INSTALL APP ]
           </button>

           <button class="btn-main btn-daily animate-initial" @click="showDailyChallenge">[ 🌞 DAILY RUN ]</button>
           <button class="btn-main btn-import animate-initial" @click="onImportSave">[ IMPORT SAVE ]</button>
      </div>
      
      <p class="powered-text">Powered by Gemini AI ✨</p>

      <div class="extra-menu">
          <button class="btn-small animate-initial" @click="showLeaderboard">
            <span class="btn-icon">🏆</span>
            <span class="btn-label">HALL OF BONES</span>
          </button>
          <button class="btn-small animate-initial" @click="showAchievements">
            <span class="btn-icon">🎖️</span>
            <span class="btn-label">ACHIEVEMENTS</span>
          </button>
          <button class="btn-small animate-initial" @click="showSoulForge">
            <span class="btn-icon">👻</span>
            <span class="btn-label">SOUL SHOP</span>
          </button>
          <!-- v38.4: Challenge Modifiers -->
          <button class="btn-small btn-challenge animate-initial" @click="showChallengeModifiers">
            <span class="btn-icon">🎲</span>
            <span class="btn-label">CHALLENGE</span>
          </button>
      </div>
    </div>

    <div class="footer-actions">
        <button class="btn-link" @click="togglePatchNotes">PATCH NOTES</button>
    </div>

    <!-- PATCH NOTES MODAL -->
    <div v-if="showPatchModal" class="modal-overlay" @click.self="togglePatchNotes">
        <div class="modal-content">
            <h2>📜 CHANGELOGS ({{ currentPage + 1 }}/{{ totalPages }})</h2>
            <div class="changelog-list">
                <div v-for="(note, idx) in paginatedPatches" :key="idx" class="patch-entry">
                    <div class="patch-header">
                        <span class="patch-ver">{{ note.ver }}</span>
                        <span class="patch-date">{{ note.date }}</span>
                    </div>
                    <ul>
                        <li v-for="c in note.changes" :key="c">- {{ c }}</li>
                    </ul>
                </div>
            </div>

            <!-- Pagination Controls -->
            <div class="pagination-controls" v-if="totalPages > 1">
                <button :disabled="currentPage === 0" @click="prevPage" class="btn-nav">◀ PREV</button>
                <span>Page {{ currentPage + 1 }}</span>
                <button :disabled="currentPage >= totalPages - 1" @click="nextPage" class="btn-nav">NEXT ▶</button>
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

/* New Title Styles v37.3 */
.main-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 5px;
}

.title-re {
  font-family: 'Consolas', 'Monaco', monospace; /* Tech look */
  font-weight: 700;
  font-size: 3.5rem;
  color: #6effda; /* Brighter Cyan/Green */
  text-shadow: 0 0 10px rgba(110, 255, 218, 0.6), 0 0 20px rgba(110, 255, 218, 0.3);
  letter-spacing: -2px;
}

.title-div {
  font-size: 3.5rem;
  color: #fff;
  font-weight: 300;
  opacity: 0.6;
  margin: 0 5px;
  transform: translateY(-2px);
}

.title-bone {
  /* Assumes pixel font is global default or 'Courier' fallback */
  font-family: inherit; 
  font-weight: 900;
  font-size: 3.8rem;
  color: #eec;
  text-shadow: 3px 3px 0px #222;
  letter-spacing: 2px;
}

.version-text {
  color: #666;
  margin-top: 5px;
  font-size: 0.9rem;
  opacity: 0.7;
}

.future-focus-container {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    animation: fadeIn 2.5s;
}

.focus-label {
    color: var(--c-gold);
    font-size: 0.7rem;
    letter-spacing: 2px;
    font-weight: bold;
    opacity: 0.8;
}

.focus-items {
    color: #888;
    font-size: 0.75rem;
    font-family: 'Consolas', monospace;
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

.btn-import {
    color: #5bf !important;
    font-size: 1.2rem !important;
}

.btn-import:hover {
    color: #8df !important;
    text-shadow: 0 0 10px #5bf !important;
}

.btn-daily {
    color: #fca !important;
    border-color: #f75 !important;
}
.btn-daily:hover {
    color: #fff !important;
    text-shadow: 0 0 10px #f55 !important;
    background: rgba(255, 100, 0, 0.1) !important;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #111;
    border: 1px solid #444;
    color: #aaa;
    padding: 12px 10px;
    font-size: 0.75rem;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
    min-width: 70px;
    text-align: center;
}

.btn-icon {
    font-size: 1.4rem;
    margin-bottom: 4px;
}

.btn-label {
    font-size: 0.65rem;
    line-height: 1.2;
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

.pagination-controls {
    display: flex; justify-content: space-between; align-items: center; width: 100%;
    margin-top: 10px; padding: 10px; border-top: 1px solid #333;
}
.btn-nav {
    background: #222; border: 1px solid #444; color: #fff; padding: 5px 15px; cursor: pointer;
}
.btn-nav:disabled { opacity: 0.3; cursor: not-allowed; }

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

/* ============================================
   v37.1 POLISH ENHANCEMENTS
   ============================================ */

/* Ember Particles Container */
.ember-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.ember {
  position: absolute;
  bottom: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, #ff6600 0%, #ff3300 50%, transparent 100%);
  opacity: 0.8;
  animation: emberFloat 4s ease-out forwards;
  box-shadow: 0 0 6px #ff4400, 0 0 12px #ff2200;
}

@keyframes emberFloat {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) scale(0.3);
    opacity: 0;
  }
}

/* Title Glow Effect */
.title-glow {
  animation: titleFlicker 4s ease-in-out infinite;
}

@keyframes titleFlicker {
  0%, 100% { 
    text-shadow: 0 0 10px #500, 0 0 20px #300, 0 0 40px #200; 
  }
  10% { 
    text-shadow: 0 0 15px #700, 0 0 30px #500, 0 0 50px #300; 
  }
  20% { 
    text-shadow: 0 0 10px #500, 0 0 20px #300, 0 0 40px #200; 
  }
  30% { 
    text-shadow: 0 0 12px #600, 0 0 25px #400, 0 0 45px #250; 
  }
  50% { 
    text-shadow: 0 0 18px #800, 0 0 35px #600, 0 0 60px #400; 
  }
  70% { 
    text-shadow: 0 0 10px #500, 0 0 20px #300, 0 0 40px #200; 
  }
  90% { 
    text-shadow: 0 0 14px #650, 0 0 28px #450, 0 0 48px #280; 
  }
}

/* Save Preview */
.save-preview {
  display: block;
  font-size: 0.7rem;
  color: var(--c-gold);
  margin-top: 4px;
  font-weight: normal;
  opacity: 0.9;
  letter-spacing: 0;
}

/* Button Continue Enhanced */
.btn-continue {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--c-gold) !important;
}

.btn-continue:hover {
  transform: scale(1.08);
  text-shadow: 0 0 15px var(--c-gold);
}

/* Staggered menu animation */
.stagger-children .animate-initial {
  opacity: 0;
  animation: fadeInUp 0.5s ease-out forwards;
}

.stagger-children .primary-actions .animate-initial:nth-child(1) { animation-delay: 0.1s; }
.stagger-children .primary-actions .animate-initial:nth-child(2) { animation-delay: 0.2s; }
.stagger-children .primary-actions .animate-initial:nth-child(3) { animation-delay: 0.3s; }
.stagger-children .extra-menu .animate-initial:nth-child(1) { animation-delay: 0.4s; }
.stagger-children .extra-menu .animate-initial:nth-child(2) { animation-delay: 0.5s; }
.stagger-children .extra-menu .animate-initial:nth-child(3) { animation-delay: 0.6s; }
.stagger-children .extra-menu .animate-initial:nth-child(4) { animation-delay: 0.7s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced buttons */
.btn-main {
  position: relative;
  overflow: hidden;
}

.btn-main::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.5s;
}

.btn-main:hover::before {
  left: 100%;
}

/* Enhanced small buttons */
.btn-small {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.btn-small:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

/* Modal glass effect */
.modal-content {
  background: rgba(17, 17, 17, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .ember {
    animation: none;
    display: none;
  }
  
  .title-glow {
    animation: none;
  }
  
  .stagger-children .animate-initial {
    animation: none;
    opacity: 1;
  }
  
  .cycle-display {
    animation: none;
  }
}
</style>
