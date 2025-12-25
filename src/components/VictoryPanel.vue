<script setup>
import { gameStore } from "../game/store.js";
import { Game } from "../game/core/game.js";
import { Ascension } from "../game/managers/ascension.js";
import { Leaderboard } from "../game/managers/Leaderboard.js";

const s = gameStore.state;

// v38.8 FIX: Check floor 500 for Endless Mode gate (was 100)
const isFloor500 = s.floor === 500;

const ascend = () => {
    if(Ascension) {
        // v38.6: Fix Soul Calculation on Ascend
        const score = Leaderboard.calculateScore(gameStore.state);
        // Pass object with score
        Ascension.prestige({ score: score });
    } else {
        alert("Ascension System not ready.");
    }
};

const enterEndless = () => {
    // V24: Enter The Endless
    // v38.8 FIX: Set floor to 501 (was 101)
    Game.state.floor = 501; 
    s.floor = 501;
    // Set Realm
    Game.exploreState();
    Game.saveGame();
    if(SoundManager) SoundManager.play('event_bad'); // Ominous sound
};

const claimVictory = () => {
    // Submit Score (Win)
    try {
          const score = Leaderboard.calculateScore(gameStore.state);
          Leaderboard.addEntry({
              name: s.name || "Champion",
              score: score,
              floor: s.floor,
              class: s.className || "Unknown",
              mode: "Normal", // Victory is usually Normal mode completion
              date: new Date().toISOString(),
              modifiers: s.activeModifiers || []
          });
          console.log("Victory Score Submitted:", score);
    } catch(e) { console.error("Win Score Submit Error", e); }

    gameStore.state.activePanel = 'menu-view';
};
</script>

<template>
  <div class="victory-panel scanline">
    <h1>{{ isFloor500 ? 'THE ABYSS OPENS' : 'VICTORY!' }}</h1>
    
    <div v-if="isFloor500" class="endless-prompt">
        <p class="lore">"Beyond exists only the climb. No return. No salvation."</p>
        <div class="actions">
            <button class="btn-endless" @click="enterEndless">
                🌀 ENTER THE ENDLESS
            </button>
            <button class="btn-leave" @click="claimVictory">
                🏆 CLAIM VICTORY (Quit)
            </button>
        </div>
    </div>

    <div v-else class="normal-victory">
        <p>You have conquered Floor {{ s.floor }}.</p>
        <div class="actions">
            <!-- Normal Ascension Option if available -->
             <button class="btn-ascend" @click="ascend">
                👻 ASCEND (New Game+)
            </button>
            <button class="btn-continue" @click="claimVictory">
                Stay Here (Menu)
            </button>
        </div>
    </div>
  </div>
</template>

<style scoped>
.victory-panel {
    background: #050005;
    color: #fff;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px;
}

h1 { color: gold; font-size: 3rem; margin-bottom: 20px; text-shadow: 0 0 10px red; }

.lore { font-style: italic; color: #a8a; margin-bottom: 30px; }

.actions {
    display: flex; flex-direction: column; gap: 20px; width: 100%; max-width: 300px;
}

button {
    padding: 15px; font-size: 1.2rem; cursor: pointer; border: 1px solid #555;
    background: #222; color: #eee;
}

.btn-endless {
    border: 2px solid #80f;
    color: #ccf;
    background: #102;
    box-shadow: 0 0 15px #408;
    animation: pulse 2s infinite;
}

.btn-leave {
    border: 1px solid #666;
    color: #888;
}

.btn-ascend {
    border-color: gold; color: gold;
    background: #221;
}

@keyframes pulse { 0% { box-shadow: 0 0 10px #408; } 50% { box-shadow: 0 0 25px #80f; } 100% { box-shadow: 0 0 10px #408; } }
</style>
