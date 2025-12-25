import { gameStore } from "../store.js";
import { DB } from "./database.js";
import { SocketManager } from "../managers/SocketManager.js";
import { Player } from "../logic/Player.js";
import { LootManager } from "../managers/loot.js";

// v37.0 Blacksmith Event with Gem Shop & Forge Services
export const BLACKSMITH_EVENT = {
    id: 'master_blacksmith',
    title: "🔨 The Master Blacksmith",
    text: "A legendary blacksmith has set up shop in a hidden forge. His wares glow with power.",
    repeatable: true, // Can trigger multiple times
    minFloor: 10, // Unlock after floor 10
    choices: [
        {
            txt: "💎 Buy Legendary Gems",
            resultText: "The blacksmith shows you his gem collection...",
            effect: () => {
                // Open gem shop interface
                if (SocketManager && Player) {
                    const floor = gameStore.state.floor;
                    
                    // Generate 3 random legendary/epic gems
                    const gemTypes = ['bloodstone', 'starstone', 'voidstone', 'diamond', 'onyx', 'topaz', 'moonstone'];
                    const availableGems = [];
                    
                    for (let i = 0; i < 3; i++) {
                        const gemType = gemTypes[Math.floor(Math.random() * gemTypes.length)];
                        const cost = SocketManager.getGemValue(
                            DB.GEMS[gemType].rarity, 
                            floor
                        ) * 3; // 3x sell price to buy
                        
                        availableGems.push({ gemType, cost, floor });
                    }
                    
                    // Store in game state for UI access
                    gameStore.state.blacksmithGems = availableGems;
                    gameStore.log("Blacksmith Gems available! Check shop.", "item");
                }
            }
        },
        {
            txt: "⚒️ Forge Service (Socket Item)",
            req: { type: "gold", val: 500 },
            resultText: "The blacksmith offers to socket your best item with a premium gem...",
            effect: () => {
                if (!Player || !SocketManager) return;
                
                const floor = gameStore.state.floor;
                
                // Find best equipment without full sockets
                const inventory = gameStore.state.inventory || [];
                const socketable = inventory.filter(item => 
                    item.sockets && item.sockets.some(s => s === null)
                );
                
                if (socketable.length === 0) {
                    gameStore.log("No items with empty sockets!", "error");
                    return;
                }
                
                // Pick highest rarity item
                const rarityRank = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
                socketable.sort((a, b) => (rarityRank[b.rarity] || 0) - (rarityRank[a.rarity] || 0));
                const targetItem = socketable[0];
                
                // Add a random epic/legendary gem
                const premiumGems = ['diamond', 'onyx', 'topaz', 'moonstone', 'bloodstone'];
                const randomGem = premiumGems[Math.floor(Math.random() * premiumGems.length)];
                
                // Find first empty socket
                const emptySocketIndex = targetItem.sockets.findIndex(s => s === null);
                
                if (emptySocketIndex !== -1) {
                    // Create the gem and socket it
                    SocketManager.addGem(randomGem, floor, 1);
                    
                    // Immediately socket it (simulate insertion)
                    const gemInInventory = gameStore.state.inventory.find(
                        item => item.gemType === randomGem && item.dropFloor === floor
                    );
                    
                    if (gemInInventory) {
                        targetItem.sockets[emptySocketIndex] = randomGem;
                        
                        // Remove gem from inventory
                        if (gemInInventory.qty > 1) {
                            gemInInventory.qty--;
                        } else {
                            const idx = gameStore.state.inventory.indexOf(gemInInventory);
                            gameStore.state.inventory.splice(idx, 1);
                        }
                        
                        gameStore.state.gold -= 500;
                        gameStore.log(`Blacksmith socketed ${DB.GEMS[randomGem].icon} ${DB.GEMS[randomGem].name} into ${targetItem.name}!`, "loot");
                    }
                }
            }
        },
        {
            txt: "🛡️ Buy Pre-Socketed Equipment",
            req: { type: "gold", val: 800 },
            resultText: "The blacksmith presents his finest work...",
            effect: () => {
                if (!LootManager || !SocketManager) return;
                
                const floor = gameStore.state.floor;
                
                // Generate random high-tier equipment
                const rarities = ['rare', 'epic', 'legendary'];
                const rarity = rarities[Math.floor(Math.random() * rarities.length)];
                
                const item = LootManager.generateDrop(floor, rarity);
                
                if (item) {
                    // Force add sockets (2-3)
                    const socketCount = 2 + Math.floor(Math.random() * 2); // 2 or 3
                    item.sockets = Array(socketCount).fill(null);
                    item.maxSockets = socketCount;
                    
                    // Fill with random gems
                    const gemTypes = ['ruby', 'sapphire', 'emerald', 'amethyst', 'diamond'];
                    for (let i = 0; i < socketCount; i++) {
                        const gemType = gemTypes[Math.floor(Math.random() * gemTypes.length)];
                        item.sockets[i] = gemType;
                    }
                    
                    item.dropFloor = floor;
                    Player.addItem(item);
                    gameStore.state.gold -= 800;
                    
                    const gemIcons = item.sockets.map(g => DB.GEMS[g].icon).join('');
                    gameStore.log(`Bought ${item.name} ${gemIcons}!`, "loot");
                }
            }
        },
        {
            txt: "Leave",
            resultText: "The blacksmith nods. 'Come back when you need my services.'"
        }
    ]
};
