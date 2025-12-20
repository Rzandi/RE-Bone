import { gameStore } from "../store.js";
import { DB } from "../config/database.js";
import { CONSTANTS } from "../config/constants.js";

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
        if(window.gameStore) {
            window.gameStore.state.merchantStock = [...this.stock];
        }

        this.render();
    },

    render() {
        // Safe check for Vue container or existing legacy container
        let p = document.getElementById("panel-merchant");
        const container = document.getElementById("game-container") || document.getElementById("app");
        
        if(!p && container) {
            // Create panel if missing (Plan fallback)
            p = document.createElement("div");
            p.id = "panel-merchant";
            p.className = "panel";
            p.style.display = "none";
            p.style.cssText = "position:absolute; top:200px; left:0; right:0; margin:auto; width:90%; background:black; border:2px solid gold; z-index:100; padding:20px;";
            container.appendChild(p);
        }
        
        if(p) {
            UI.showPanel("merchant");
            
            let html = `
                <h2 style="color:gold; text-align:center; margin-bottom:10px;">MERCHANT</h2>
                <div style="text-align:center; margin-bottom:20px; color:#aaa;">
                    "Got some rare things on sale, stranger..."<br>
                    <span style="color:gold">Gold: ${Player.gold}</span>
                </div>
                <div id="merchant-list" style="height:400px; overflow-y:auto; border:1px solid #444; padding:10px;">
            `;
            
            this.stock.forEach(key => {
                const item = DB.ITEMS[key];
                if(!item) return;
                
                const canAfford = Player.gold >= item.price;
                const col = canAfford ? "#fff" : "#777";
                const btnCol = canAfford ? "gold" : "#555";
                
                html += `
                    <div class="shop-item" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding:10px;">
                        <div>
                            <strong style="color:${CONSTANTS.RARITY_COLORS[item.rarity] || '#fff'}">${item.name}</strong>
                            <div style="font-size:0.8rem; color:#aaa;">${item.desc}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="color:gold; margin-bottom:5px;">${item.price} G</div>
                            <button onclick="Merchant.buy('${key}')" 
                                    style="border:1px solid ${btnCol}; color:${col}; padding:5px 10px; background:none; cursor:${canAfford?'pointer':'default'}">
                                BUY
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
            
            p.innerHTML = html;
        }
        
        UI.setButtons([
            null, null, null,
            { txt: "LEAVE", fn: () => Game.exploreState() }
        ]);
    },
    
    buy(key) {
        const item = DB.ITEMS[key];
        if(Player.gold >= item.price) {
            Player.gold -= item.price;
            Player.addItem(key); // Standard addItem handles inventory push
            SoundManager.play("loot"); // Or "buy" sound
            this.render(); // Re-render to update gold
        } else {
            UI.toast("Not enough Gold!");
        }
    }
};

window.Merchant = Merchant;
export { Merchant };
