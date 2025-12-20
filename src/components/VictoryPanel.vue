<script setup>
import { gameStore } from "../game/store.js";

const ascend = () => {
    if(window.Ascension) {
        Ascension.prestige();
    }
};

const cont = () => {
    // Just keep playing on this floor (Endless?) or Menu
    gameStore.state.activePanel = 'menu-view';
};
</script>

<template>
  <div class="victory-panel scanline">
    <h1>VICTORY!</h1>
    <p>You have conquered Floor 10.</p>
    <p>The cycle is complete... but the dungeon is infinite.</p>
    
    <div class="actions">
        <button class="btn-ascend" @click="ascend">
            👻 ASCEND (New Game+)
            <small>Reset Level, Keep Perks, Harder Enemies</small>
        </button>
        
        <button class="btn-continue" @click="cont">
            Stay Here (Menu)
        </button>
    </div>
  </div>
</template>

<style scoped>
.victory-panel {
    background: #110011;
    color: #fff;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px;
}

h1 { color: gold; font-size: 3rem; margin-bottom: 20px; text-shadow: 0 0 10px red; }

.actions {
    display: flex; flex-direction: column; gap: 20px; width: 100%; max-width: 300px;
}

button {
    padding: 15px; font-size: 1.2rem; cursor: pointer; border: 1px solid #555;
    background: #222; color: #eee;
}

.btn-ascend {
    border-color: gold; color: gold;
    background: #221;
}
.btn-ascend small { display: block; font-size: 0.8rem; color: #aaa; margin-top: 5px; }

</style>
