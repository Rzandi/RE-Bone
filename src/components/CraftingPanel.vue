<script setup>
import { computed, ref } from "vue";
import { gameStore } from "../game/store.js";
import { DB } from "../game/config/database.js";

const s = gameStore.state;
const recipes = computed(() => DB.RECIPES || []);

const canCraft = (recipe) => {
   if(window.Crafting) return Crafting.canCraft(recipe);
   return false; 
};

const craft = (recipe) => {
    if(window.Crafting) {
        Crafting.craft(recipe);
    }
};

const close = () => {
  gameStore.state.activePanel = "inventory";
};
</script>

<template>
  <div class="crafting-panel scanline">
    <div class="header">
      <h2>SOUL FORGE</h2>
      <button class="btn-close" @click="close">X</button>
    </div>

    <div class="recipe-list">
        <div v-for="(rec, i) in recipes" :key="i" class="recipe-card">
            <div class="rec-header">
                <h3>{{ rec.name }}</h3>
                <span class="type-badge">{{ rec.type }}</span>
            </div>
            
            <div class="rec-cost">
                <span v-for="(amt, mat) in rec.cost" :key="mat">
                    {{ mat }}: {{ amt }} 
                </span>
            </div>
            
            <button :disabled="!canCraft(rec)" @click="craft(rec)">
                CRAFT
            </button>
        </div>
    </div>
  </div>
</template>

<style scoped>
.crafting-panel {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: #151010; z-index: 101;
  display: flex; flex-direction: column;
}

.header {
  padding: 15px; background: #200; border-bottom: 2px solid #f00;
  display: flex; justify-content: space-between; align-items: center;
}
.header h2 { color: #f55; margin: 0; }

.recipe-list { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }

.recipe-card {
    background: #222; border: 1px solid #444; padding: 10px;
    display: flex; justify-content: space-between; align-items: center;
}
.rec-header h3 { margin: 0; color: #fff; font-size: 1rem; }
.type-badge { font-size: 0.7rem; background: #444; padding: 2px 4px; border-radius: 4px; color: #aaa; }

.rec-cost { font-size: 0.8rem; color: #aaa; }

button {
    background: #f55; color: #fff; border: none; padding: 8px 16px; 
    cursor: pointer; font-weight: bold;
}
button:disabled { background: #444; color: #888; cursor: default; }

.btn-close { background: transparent; border: 1px solid #f55; color: #f55; }
</style>
