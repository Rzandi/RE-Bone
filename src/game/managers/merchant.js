import { gameStore } from "../store.js";
import { DB } from "../config/database.js";
import { CONSTANTS } from "../config/constants.js";
import { Player } from "../logic/Player.js";
import { SoundManager } from "./sound.js";

/* =========================================
   MERCHANT MANAGER
   ========================================= */

const Merchant = {
    stock: [],
    
    init() {
        // Any init logic if needed
    },

    // Generate random stock based on floor depth
    generateStock(floor) {
        this.stock = [];
        
        // 1. Always standard potions
        this.stock.push("health_potion", "mana_potion");
        
        // 2. Random Consumables/Buffs (3 slots)
        const consumables = ["elixir_strength", "elixir_protection", "scroll_haste", "rotten_meat", "mana_shard"];
        for(let i=0; i<3; i++) {
            const rand = consumables[Math.floor(Math.random() * consumables.length)];
            if(!this.stock.includes(rand)) this.stock.push(rand);
        }
        
        // 3. Equipment (3 slots) - Scaled by Floor (v30.10: Fixed Descent Logic)
        let allowedRarities = ["common"];
        if (floor <= 80) allowedRarities.push("rare"); // Unlocks at Floor 80
        if (floor <= 60) allowedRarities.push("epic"); // Unlocks at Floor 60
        if (floor <= 30) allowedRarities.push("legend"); // Unlocks at Floor 30
        
        // Filter out low tier trash at high depth (Low Floor Number)
        if (floor <= 40) allowedRarities = allowedRarities.filter(r => r !== "common");
        if (floor <= 10) allowedRarities = allowedRarities.filter(r => r !== "rare");

        const equipment = Object.keys(DB.ITEMS).filter(k => {
            const it = DB.ITEMS[k];
            return ["weapon", "armor", "acc"].includes(it.slot) && 
                   it.price > 0 && 
                   allowedRarities.includes(it.rarity);
        });
        
        for(let i=0; i<3; i++) {
            if(equipment.length > 0) {
                const rand = equipment[Math.floor(Math.random() * equipment.length)];
                if(!this.stock.includes(rand)) this.stock.push(rand);
            }
        }

        // 4. Materials/Fragments (2 slots)
        // User specifically asked for Fragments
        const materials = Object.keys(DB.ITEMS).filter(k => {
            const it = DB.ITEMS[k];
            return it.slot === "mat" && it.price > 0 && allowedRarities.includes(it.rarity);
        });

        for(let i=0; i<2; i++) {
            if(materials.length > 0) {
               const rand = materials[Math.floor(Math.random() * materials.length)];
               if(!this.stock.includes(rand)) this.stock.push(rand);
            }
        }
        
        // Sync to Store for Vue UI
        if(gameStore) {
            gameStore.state.merchantStock = [...this.stock];
        }

        this.render();
    },

    render() {
        // DOM Render removed in favor of MerchantPanel.vue
        // Just Update Buttons for legacy fallback or hybrid mode/
        // Actually, Game.js handles buttons for Merchant State?
        // UI.showPanel("shop") is called by Game.js. 
        // We just need to ensure stock is in store.
    },
    
    buy(key) {
        // v36.2 Refactor: Check gold and use Player logic if needed
        const item = DB.ITEMS[key];
        const p = Player.state; // Assumes window.Player exposed or imported logic
        
        if(p.gold >= item.price) {
            p.gold -= item.price;
            Player.addItem(key); 
            
            // Log & Sound
            if(gameStore) gameStore.log(`Bought ${item.name}`, "shop");
            if(SoundManager) SoundManager.play("buy"); // Use 'buy' if exists
            
            // Re-render handled by Reactivity usually, but if manual:
            this.render(); 
        } else {
            // UI.toast is likely deprecated or not linked
            if(gameStore) gameStore.log("Not enough Gold!", "error");
        }
    }
};

// Export to global scope - REMOVED v38.0
// window.Merchant = Merchant;
export { Merchant };
