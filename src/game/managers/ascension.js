/* =========================================
   ASCENSION MANAGER (v30.0)
   Handles New Game+, Soul Shards, and Permanent Upgrades
   ========================================= */

import { gameStore } from "../store.js";
import { DB } from "../config/database.js";
import { SaveManager } from "./SaveManager.js"; // Use SaveManager for persistence

export const Ascension = {
  // Constants
  SCALING_FACTOR: 1.5, 
  
  // Accessors for Store State
  get s() { return gameStore.state; },
  get meta() { return gameStore.state.meta; },
  get upgrades() { return this.meta.upgrades || {}; },
  
  // Backwards compatibility for VIEWs
  get SHOP_ITEMS() {
     return [
        { id: "str_plus", name: "Titan's Strength", desc: "Start with +5 STR", cost: 5, max: 10 },
        { id: "vit_plus", name: "Golem's Heart", desc: "Start with +5 VIT", cost: 5, max: 10 },
        { id: "int_plus", name: "Lich's Mind", desc: "Start with +5 INT", cost: 5, max: 10 },
        { id: "exp_boost", name: "Ancient Wisdom", desc: "+10% EXP Gain", cost: 10, max: 5 },
        { id: "gold_boost", name: "Midas Touch", desc: "+20% Gold Gain", cost: 8, max: 5 },
        { id: "mythic_chance", name: "God's Favor", desc: "+1% Mythic Drop Rate", cost: 20, max: 3 },
     ];
  },
  
  // v32.3: Access shop stock from meta or generate if empty
  get shopStock() {
      if(!this.meta.shopStock) this.meta.shopStock = [];
      if(this.meta.shopStock.length === 0) this.generateStock();
      return this.meta.shopStock;
  },
  get refreshCount() { return this.meta.refreshCount !== undefined ? this.meta.refreshCount : 3; },

  init() {
      // Data is loaded via SaveManager usually.
      // If we need specific init logic, do it here.
      if(!this.meta.upgrades) this.meta.upgrades = {};
      if(!this.meta.equippedPerks) this.meta.equippedPerks = [];
  },

  // Persistence is now handled by SaveManager.js calling gameStore state.
  save() {
      SaveManager.saveMeta();
  },

  // Trigger New Game+
  prestige(playerData) {
    let reward = 1;
    if (playerData && playerData.score) {
        reward += Math.floor(playerData.score / 5000);
    }

    // Add Shards (Souls)
    this.meta.souls = (this.meta.souls || 0) + reward;
    
    // INCREMENT CYCLE
    this.meta.ascensionLevel = (this.meta.ascensionLevel || 0) + 1;
    
    // Reset Shop
    this.meta.refreshCount = 3;
    this.generateStock();
    
    // SOFT RESET LOGIC (v33.0)
    if (window.Player && window.Game) {
        // 1. Reset Player (Use init to fully wipe state)
        // Default to skeleton or keep current class name if we want them to stick with it?
        // Usually Rogue-likes reset to base class or character select.
        // Let's reset to "skeleton" and let them choose class if we have a select screen?
        // Or keep className.
        // Safest: Player.init(Player.className) but they should probably re-pick class.
        // Let's reset to 'skeleton'.
        Player.init("skeleton");
        
        // 2. Reset World
        Game.state.floor = 1;
        Game.state.progress = 0;
        gameStore.state.logs = [];
        
        // 3. Save & Redirect
        this.save(); // Save Meta Upgrade
        Game.saveGame(); // Save Reset Player State
        
        // 4. UI Feedback
        gameStore.state.activePanel = 'title'; // Go to title to re-select class
        
        gameStore.triggerVfx({ type: 'critical', val: "ASCENSION!", target: 'player' });
        if(window.SoundManager) window.SoundManager.play("ascend");
        setTimeout(() => {
             alert(`ASCENSION SUCCESSFUL!\n\nNew Cycle: ${this.meta.ascensionLevel}\nEnemies are stronger.\nYou have gained ${reward} Souls.`);
        }, 500);
    } else {
        // Fallback
        location.reload();
    }

    return reward;
  },

  // Cost Logic
  getClassUnlockCost() {
      let count = 0;
      // Count unlocked classes in meta
      if(this.meta.unlockedClasses) {
           // Basic classes don't count towards increase? Or do they?
           // Original logic counted 'unlock_' upgrades.
           // New logic counts purchases.
           return 50 * Math.pow(2, (this.meta.unlockedClasses.length - 1)); // -1 for Skeleton
      }
      return 50;
  },
  
  generateStock() {
      const allPerks = Object.keys(DB.PASSIVES || {});
      if(allPerks.length === 0) return;

      const stockSize = 6;
      // Fisher-Yates
      for (let i = allPerks.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allPerks[i], allPerks[j]] = [allPerks[j], allPerks[i]];
      }
      
      this.meta.shopStock = allPerks.slice(0, stockSize);
      this.save();
  },
  
  refreshShop() {
      if (this.refreshCount > 0) {
          this.meta.refreshCount--;
          this.generateStock();
          gameStore.log(`Shop Refreshed! (${this.refreshCount} left)`);
          this.save();
      } else {
          gameStore.log("No refreshes remaining!", "error");
      }
  },

  buyUpgrade(id) {
    // 1. Check Item
    let item = this.SHOP_ITEMS.find(i => i.id === id);
    let cost = 0;
    
    if (item) {
        cost = item.cost;
    } else if (id.startsWith("perk_")) {
        item = { id: id, max: 1 };
        cost = 50;
    } else {
        return false;
    }

    // 2. Check Level
    const currentLevel = this.upgrades[id] || 0;
    if (currentLevel >= item.max) return false;

    // 3. Check Affordability
    if (this.meta.souls >= cost) {
        this.meta.souls -= cost;
        this.meta.upgrades[id] = currentLevel + 1;
        this.save();
        gameStore.log(`Upgraded ${item.name || id}!`);
        return true;
    }
    return false;
  },
  
  togglePerk(perkId) {
      const idx = this.meta.equippedPerks.findIndex(p => p === perkId);
      if(idx >= 0) {
          this.meta.equippedPerks.splice(idx, 1);
          gameStore.log(`Unequipped ${perkId}`);
      } else {
          // Check limit?
          if(this.meta.equippedPerks.length < 3) { // Hardcoded limit for now
              this.meta.equippedPerks.push(perkId);
               gameStore.log(`Equipped ${perkId}`);
          } else {
               gameStore.log("Perk slots full!", "error");
          }
      }
      this.save();
  }
};

// Auto-init on load
// Ensure DB is loaded first
window.addEventListener('load', () => {
  if(window.Ascension) Ascension.init();
});
