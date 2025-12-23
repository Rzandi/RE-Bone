import { RECIPES } from "../config/recipes.js";
import { gameStore } from "../store.js";
import { Player } from "../logic/Player.js"; // Ensure Player is imported or assumed global
import { SoundManager } from "../managers/sound.js"; // Optional import if not global
import { DB } from "../config/database.js";
import { CONSTANTS } from "../config/constants.js";

export const Crafting = {
  // Check if player has materials for a recipe
  canCraft(recipeId) {
    const recipe = RECIPES[recipeId];
    if (!recipe) return false;
    
    for (const [matId, count] of Object.entries(recipe.inputs)) {
      if (this.countMaterial(matId) < count) return false;
    }
    return true;
  },

  // Count quantity of a material in inventory
  countMaterial(matId) {
    return Player.inventory.filter(item => item.id === matId).length;
  },
  
  // Consume materials from inventory
  consumeMaterials(inputs) {
    for (const [matId, count] of Object.entries(inputs)) {
      let remaining = count;
      // Remove items from inventory (reverse loop to avoid index shifting issues)
      for (let i = Player.inventory.length - 1; i >= 0; i--) {
        if (Player.inventory[i].id === matId) {
          Player.inventory.splice(i, 1);
          remaining--;
          if (remaining <= 0) break;
        }
      }
    }
  },

  // Execute craft
  craft(recipeId) {
    const recipe = RECIPES[recipeId];
    
    if (this.canCraft(recipeId)) {
      this.consumeMaterials(recipe.inputs);
      
      // Add output item(s)
      for(let i=0; i< (recipe.count || 1); i++) {
        Player.addItem(recipe.output);
      }
      
      if(window.gameStore) gameStore.log(`Crafted ${recipe.name}!`, "item");
      if(window.SoundManager) SoundManager.play("loot");
      
      // UI update is reactive via Player.inventory mutation
    } else {
        if(window.gameStore) gameStore.log("Not enough materials!", "error");
    }
  },

  // DOM Render removed in favor of CraftingPanel.vue
  
  // Salvage Logic (Break item -> get mats)
  salvage(idx) {
    const item = Player.inventory[idx];
    if (!item) return;
    
    // Check locked status
    if (Player.isLocked(item)) {
       if(window.gameStore) gameStore.log("Item is Locked! Cannot Salvage.", "error");
       return;
    }

    // Determine Base Material based on Slot
    let baseMat = CONSTANTS.MATERIALS.SCRAP;
    if (item.slot === "armor") baseMat = CONSTANTS.MATERIALS.LEATHER;
    if (item.slot === "acc") baseMat = CONSTANTS.MATERIALS.DUST;

    // Rarity Multipliers & Rare drops
    let count = 1;
    let extraMat = null;
    let extraCount = 0;

    if (item.rarity === "common") {
      count = Math.floor(Math.random() * 2) + 1; // 1-2
    } 
    if (item.rarity === "rare") {
      count = Math.floor(Math.random() * 3) + 2; // 2-4
      if (Math.random() < 0.3) { extraMat = CONSTANTS.MATERIALS.ESSENCE; extraCount = 1; }
    }
    else if (item.rarity === "epic") {
      count = Math.floor(Math.random() * 4) + 4; // 4-7
      extraMat = CONSTANTS.MATERIALS.ESSENCE; 
      extraCount = Math.floor(Math.random() * 2) + 1; // 1-2
    }
    else if (item.rarity === "legend") {
      count = Math.floor(Math.random() * 6) + 10; // 10-15
      extraMat = CONSTANTS.MATERIALS.ESSENCE;
      extraCount = Math.floor(Math.random() * 3) + 3; // 3-5
      
      // Chance for Fragment (NEW v28.0)
      if (Math.random() < 0.10) { // 10% chance
        const frag = Math.random() < 0.5 ? CONSTANTS.MATERIALS.FRAG_DRAGON : CONSTANTS.MATERIALS.FRAG_VOID;
        Player.addItem(frag); 
        if(window.gameStore) gameStore.log(`✨ LUCKY! Salvager found ${DB.ITEMS[frag].name}`, "rare");
      }
    }
    
    // Remove item
    Player.inventory.splice(idx, 1);
    
    // Add Base Materials
    for(let i=0; i<count; i++) Player.addItem(baseMat);
    
    // Add Extra Materials
    if (extraMat && extraCount > 0) {
       for(let i=0; i<extraCount; i++) Player.addItem(extraMat);
    }
    
    if(window.gameStore) gameStore.log(`Salvaged ${item.name} -> Materials`, "item");
    if(window.SoundManager) SoundManager.play("ui");
  }
};

window.Crafting = Crafting;
