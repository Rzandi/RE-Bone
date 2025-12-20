const LootManager = {
    /**
     * Main drop logic for enemies
     * @param {Object} enemy - The enemy object
     */
    dropLoot(enemy) {
        let dropChance = 0.3; // 30% base drop rate
        
        const floor = Game.floor; // Dependency on Game State

        // Boss guaranteed legendary drop (Only Main Bosses)
        const isMainBoss = enemy.isBoss && (floor === 1 || floor % 20 === 0);
        
        if (isMainBoss) {
            dropChance = 1.0;
            let legendaryItems = this.getLegendaryItems();
            if (legendaryItems.length > 0) {
                let item = legendaryItems[Math.floor(Math.random() * legendaryItems.length)];
                Player.addItem(item);
                UI.log(`💎 Legendary Drop: ${DB.ITEMS[item].name}!`, "log boss");
            }
            return;
        }
        
        // Mini Boss Bonus
        if (enemy.isBoss) dropChance = 0.6;
        
        if (Math.random() < dropChance) {
            let rarity = this.getRarityRoll(floor);
            // Mini Bosses have better minimum rarity
            if (enemy.isBoss && rarity === "common") rarity = "rare";

            let item = this.getRandomItemByRarity(rarity);
            
            if (item) {
                Player.addItem(item);
            }
        }
    },

    /**
     * Calculate rarity based on floor depth
     * @param {number} floor - Current floor depth
     * @returns {string} Rarity string (common, rare, etc)
     */
    getRarityRoll(floor) {
        let roll = Math.random();
        let floorBonus = (100 - floor) / 100 * 0.1; 
        
        // v30.0 Mythic Drop (Ascension Only)
        if (window.Ascension && Ascension.level > 0) {
            if (roll < 0.01) return "mythic";
        }

        if (roll < 0.02 + floorBonus) return "legend";
        if (roll < 0.15 + floorBonus) return "epic";
        if (roll < 0.45 + floorBonus) return "rare";
        
        // v30.10 Deep Floor Clamps (No trash late game)
        if (floor <= 30) return "rare"; // Minimum Rare at Floor 30
        if (floor <= 10) return "epic"; // Minimum Epic at Floor 10
        
        return "common";
    },

    getRandomItemByRarity(rarity) {
        let items = [];
        for (let id in DB.ITEMS) {
            let item = DB.ITEMS[id];
            if (item.rarity === rarity && item.slot !== "con") {
                items.push(id);
            }
        }
        
        if (items.length > 0) {
            return items[Math.floor(Math.random() * items.length)];
        }
        
        // Fallback to common consumable
        return "rotten_meat";
    },

    getLegendaryItems() {
        let items = [];
        for (let id in DB.ITEMS) {
            if (DB.ITEMS[id].rarity === "legend") {
                items.push(id);
            }
        }
        return items;
    }
};

window.LootManager = LootManager;
