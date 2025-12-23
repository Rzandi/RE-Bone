/* =========================================
   EVENT MANAGER (Narrative System)
   Handles Text Events, Choices, and Outcomes
   ========================================= */

import { gameStore } from '../store';
import { EVENTS_DB } from '../config/events';

export const EventManager = {
    // Current Active Event
    currentEvent: null,

    init() {
        // Pre-load common events?
    },

    // Trigger an event based on Biome/Random
    triggerEvent(node) {
        // 0. Check Hidden Events (Priority)
        const hidden = this.checkHiddenEvents();
        if (hidden) {
            gameStore.log("Hidden Event Triggered!", "rare");
            this.startEvent(hidden);
            return;
        }

        // 1. Check for specific Biome events
        const biomeId = node.biome ? node.biome.id : 'generic';
        
        // For MVP, just pull from a simple pool
        // Future: Load from DB.EVENTS
        const pool = this.getEventPool(biomeId);
        const eventData = pool[Math.floor(Math.random() * pool.length)];

        this.startEvent(eventData);
    },

    startEvent(eventData) {
        this.currentEvent = eventData;
        
        // Update Store for UI
        gameStore.state.activePanel = 'event';
        gameStore.state.event = {
            title: eventData.title,
            text: eventData.text,
            image: eventData.image || null, // Optional ASCII art or IMG
            choices: eventData.choices.map((c, idx) => ({
                ...c,
                id: idx,
                disabled: this.checkRequirement(c.req) // true if can't pick
            }))
        };
    },

    selectChoice(choiceIndex) {
        const choice = this.currentEvent.choices[choiceIndex];
        if (!choice) return;

        // 1. Pay Cost / Check Req
        // (Assumed already checked by UI disabling)
        
        // 2. Resolve Outcome
        let outcomeText = choice.resultText || "Something happened.";
        
        // Apply Effects
        if (choice.effect) {
            choice.effect();
        }

        // Save History (if event has ID)
        if (this.currentEvent && this.currentEvent.id) {
             if (!gameStore.state.history.events.includes(this.currentEvent.id)) {
                 gameStore.state.history.events.push(this.currentEvent.id);
                 // Check for Lore?
                 if (this.currentEvent.lore) {
                     gameStore.state.history.lore.push(this.currentEvent.lore);
                     gameStore.log(`Lore Discovered: ${this.currentEvent.lore}`, "system");
                 }
             }
        }

        // 3. Show Result
        gameStore.state.event.text = outcomeText;
        gameStore.state.event.choices = [
            { txt: "Continue", fn: () => this.endEvent() }
        ];
    },

    endEvent() {
        // Return to Map
        // Assuming Game.js handles this via a direct call or we set activePanel back
        if(window.Game) {
             window.Game.returnToMap();
        }
    },

    checkRequirement(req) {
        if (!req) return false; // Not disabled
        // Example: { type: 'gold', val: 100 } -> Disabled if gold < 100
        // Return TRUE to DISABLE
        if (req.type === 'gold') return gameStore.state.gold < req.val;
        if (req.type === 'hp') return gameStore.state.hp <= req.val;
        if (req.type === 'mp') return gameStore.state.mp < req.val;
        if (req.type === 'stat') return (gameStore.state[req.stat] || 0) < req.val;
        if (req.type === 'item') {
            // Check if player has item (Inventory or Equipped?)
            // Usually Key Items are in inventory. 
            // Simplified: Check inventory for ID.
            if (!gameStore.state.inventory) return true; // Disable if no inv
            // Inventory is array of objects or strings? 
            // Player.js: s.inventory = ["item_id"...] usually? 
            // Let's check Player.addItem logic to be sure. 
            // Assuming string array for now based on Merchant.js usage.
            // But wait, addItem pushes objects or strings?
            // Player.addItem implementation: s.inventory.push(id) or object?
            // Need to verify Player.js addItem first to be 100% sure. 
            // For safety, assume it might be strings or objects.
            return !gameStore.state.inventory.some(it => (typeof it === 'string' ? it === req.id : it.id === req.id));
        }
        return false;
    },

    // --- HIDDEN EVENT LOGIC ---
    checkHiddenEvents() {
        if (!window.EVENTS_DB || !EVENTS_DB.hidden) return null;
        
        const history = gameStore.state.history.events;
        
        for (const ev of EVENTS_DB.hidden) {
            if (history.includes(ev.id)) continue; // Already done
            
            if (ev.reqEvents) {
                const allMet = ev.reqEvents.every(reqId => history.includes(reqId));
                if (allMet) return ev;
            }
        }
        return null;
    },

    // --- DATA POOL (Could be moved to config/events.js) ---
    // --- DATA POOL (Could be moved to config/events.js) ---
    getEventPool(biomeId) {
        let pool = [];

        // v35.1: LEGENDARY NPC EVENTS (Very Low Chance or Specific Nodes)
        // Implemented here as rare global events for now, or specific biome overrides
        
        const legendaryEvents = [
            {
                title: "The Legendary Blacksmith",
                text: "A massive forge glows with ethereal fire. The Legendary Blacksmith stands before you.",
                choices: [
                    {
                        txt: "Buy Godly Gear",
                        resultText: "He shows you weapons that hum with power.",
                        effect: () => {
                             // Only SELL Equipment
                             const stock = [
                                 'excalibur', 
                                 'aegis_shield',
                                 'dragon_claw',
                                 'void_ring',
                                 'blood_ring'
                             ].filter(key => DB.ITEMS[key]); // Filter invalid keys
                             
                             gameStore.state.merchantStock = stock;
                             gameStore.state.activePanel = 'merchant';
                             gameStore.log("Blacksmith Open!", "system");
                        }
                    },
                    {
                        txt: "Sell Equipment Only",
                        resultText: " 'I only care for steel, not your trash.' ",
                        effect: () => {
                             // Open Merchant Panel with empty buy list
                             gameStore.state.merchantStock = []; 
                             gameStore.state.activePanel = 'merchant';
                        }
                    },
                    {
                         txt: "Craft (Repair +50 HP)",
                         req: { type: 'gold', val: 100 },
                         resultText: "He hits your armor once. It is fixed.",
                         effect: () => {
                             gameStore.state.gold -= 100;
                             gameStore.state.hp = Math.min(gameStore.state.hp + 50, gameStore.state.maxHp);
                             gameStore.triggerVfx({ type: 'heal', val: 50 });
                         }
                    },
                    { txt: "Leave", resultText: "You leave the heat of the forge." }
                ]
            },
            {
                title: "The Legendary Alchemist",
                text: "Bubbling vials and strange fumes fill the air.",
                choices: [
                    {
                        txt: "Buy Rare Potions",
                        resultText: " 'Drink these at your own risk...' ",
                        effect: () => {
                             const stock = [
                                 'elixir_strength',
                                 'elixir_protection',
                                 'elixir_exp',
                                 'potion_greed',
                                 'health_potion', // Stock staple
                                 'mana_potion'
                             ].filter(key => DB.ITEMS[key]);
                             
                             gameStore.state.merchantStock = stock;
                             gameStore.state.activePanel = 'merchant';
                        }
                    },
                    {
                        txt: "Sell Ingredients",
                        resultText: " 'I need materials. Show me.' ",
                        effect: () => {
                             gameStore.state.merchantStock = [];
                             gameStore.state.activePanel = 'merchant';
                        }
                    },
                    {
                         txt: "Brew Elixir (-50 HP for Random Buff)",
                         req: { type: 'hp', val: 51 },
                         resultText: "You drink the experimental brew...",
                         effect: () => {
                             gameStore.state.hp -= 50;
                             gameStore.triggerVfx({ type: 'damage', val: 50 });
                             
                             // Random Buff
                             const buffs = [
                                 { id: 'buff_str', turn: 20, val: 5 },
                                 { id: 'buff_def', turn: 20, val: 5 },
                                 { id: 'buff_dodge', turn: 10, val: 50 }
                             ];
                             const b = buffs[Math.floor(Math.random()*buffs.length)];
                             if(window.Player) Player.status.push(b);
                             gameStore.log("Experimental Buff Applied!", "buff");
                         }
                    },
                    { txt: "Leave", resultText: "You step away from the fumes." }
                ]
            }
        ];

        // v35.2 NEW EVENTS: Relic Hunting
        
        // 1. The Gambling Chest (Gold/HP Risk)
        const gamblingChest = {
            title: "Cursed Chest",
            text: "A chest sits in the center of the room. It pulses with dark energy.",
            choices: [
                {
                    txt: "Pry Open (-50 HP)",
                    req: { type: 'hp', val: 51 },
                    resultText: "You tear it open!",
                    effect: () => {
                        gameStore.state.hp -= 50;
                        gameStore.triggerVfx({ type: 'damage', val: 50 });
                        
                        // 70% Chance Relic, 30% Trap (Nothing)
                        if(Math.random() < 0.7) {
                             if(window.LootManager) {
                                 const relicName = LootManager.dropRelic('common');
                                 if(relicName) gameStore.state.event.text = `Success! You found: ${relicName}`;
                                 else gameStore.state.event.text = "The chest was empty (Max Relics?)";
                             }
                        } else {
                             gameStore.state.event.text = "It snaps shut on your fingers! Empty.";
                        }
                    }
                },
                {
                    txt: "Use Gold Key (-100g)",
                    req: { type: 'gold', val: 100 },
                    resultText: "The lock clicks open smoothly.",
                    effect: () => {
                        gameStore.state.gold -= 100;
                        if(window.LootManager) {
                             const relicName = LootManager.dropRelic('rare'); // Better tier
                             if(relicName) gameStore.state.event.text = `Success! You found: ${relicName}`;
                             else gameStore.state.event.text = "The chest was empty.";
                        }
                    }
                },
                { txt: "Leave it", resultText: "Not worth the risk." }
            ]
        };

        // 2. The Challenge Altar (Stat Check)
        const challengeAltar = {
            title: "Warrior's Shrine",
            text: "An ancient statue challenges your strength. 'Prove your might...'",
            choices: [
                {
                    txt: "Lift the Statue (Req: 20 STR)",
                    disabled: gameStore.state.str < 20, // Manual disable check? Or use req type
                    // Let's use custom req logic in checkRequirement if needed, or simple disabled prop here if dynamic
                    // Current EventManager computes disabled on startEvent. 
                    // Let's rely on standard 'req' if we update checkRequirement, or just fail text.
                    // Simple approach: Always clickable, but fail if Low STR
                    resultText: "You strain your muscles...",
                    effect: () => {
                        if(gameStore.state.str >= 20) {
                            if(window.LootManager) {
                                const relicName = LootManager.dropRelic('rare');
                                gameStore.state.event.text = `You lift it easily! Underneath lies: ${relicName}`;
                            }
                        } else {
                             gameStore.state.hp -= 10;
                             gameStore.triggerVfx({ type: 'damage', val: 10 });
                             gameStore.state.event.text = "You fail and drop it on your toe. (-10 HP)";
                        }
                    }
                },
                {
                    txt: "Sacrifice Blood (-20 Max HP)",
                    resultText: "The statue absorbs your vitality.",
                    effect: () => {
                        gameStore.state.maxHp = Math.max(1, gameStore.state.maxHp - 20);
                        gameStore.state.hp = Math.min(gameStore.state.hp, gameStore.state.maxHp);
                        gameStore.triggerVfx({ type: 'damage', val: 20 });
                        
                        if(window.LootManager) {
                            const relicName = LootManager.dropRelic('epic'); // High reward
                            gameStore.log(`Sacrificed 20 Max HP for ${relicName}`, "item");
                            gameStore.state.event.text = `The statue grinds open. You found: ${relicName}`;
                        }
                    }
                },
                { txt: "Ignore", resultText: "You ignore the challenge." }
            ]
        };

        // 1. ADD GENERIC EVENTS (From embedded or DB)
        // (Using the local hardcoded 'common' from below for now, but really should be in DB)
        // For backwards compat, we keep the hardcoded ones inside this function or move them.
        // Let's mix them.
        
        const genericEvents = [
            {
                title: "Wandering Trader",
                text: "A hooded figure offers you a potion (50g).",
                choices: [
                    { 
                        txt: "Buy (50g)", 
                        req: { type: 'gold', val: 50 },
                        resultText: "You drink the potion.",
                        effect: () => { 
                            gameStore.state.gold -= 50; 
                            if(window.Player) {
                                window.Player.heal(20);
                            } else {
                                gameStore.state.hp = Math.min(gameStore.state.hp + 20, gameStore.state.maxHp);
                            }
                        }
                    },
                    { txt: "Ignore", resultText: "You walk away." }
                ]
            },
            {
                title: "Mysterious Altar",
                text: "An ancient shrine demands a sacrifice.",
                choices: [
                    { 
                        txt: "Sacrifice HP (-10 HP)", 
                        req: { type: 'hp', val: 10 },
                        resultText: "The altar glows. You feel stronger.",
                        effect: () => { 
                             if(window.Player) {
                                 window.Player.takeDamage(10);
                                 window.Player.gainStat('str', 1);
                             } else {
                                gameStore.state.hp -= 10;
                                gameStore.state.str += 1;
                             }
                             gameStore.log("Permanently gained +1 STR!", "buff");
                        }
                    },
                    { txt: "Leave", resultText: "Nothing ventured, nothing gained." }
                ]
            }
        ];
        pool = [...pool, ...genericEvents];

        // 2. ADD BIOME EVENTS (From EVENTS_DB)
        if (EVENTS_DB.realms[biomeId]) {
            pool = [...pool, ...EVENTS_DB.realms[biomeId]];
        }
        
        // Also check if biomeId matches a Realm Key (e.g. 'nature_den')
        const activeRealm = gameStore.state.world ? gameStore.state.world.activeRealm : null;
        if (activeRealm && EVENTS_DB.realms[activeRealm]) {
             // Add global realm events too
             pool = [...pool, ...EVENTS_DB.realms[activeRealm]];
        }

        // 3. ADD CLASS SPECIFIC EVENTS
        if (window.Player && EVENTS_DB.classes) {
            // Check Base Class (e.g. 'skeleton')
            const classId = window.Player.classId || 'skeleton'; // fallback
            // We need a mapping or check for 'family' vs 'id'
            // Simplified: Check if exact ID exists, OR if family exists
            
            // Try Exact ID Match (e.g. 'paladin')
            if (EVENTS_DB.classes[classId]) {
                pool = [...pool, ...EVENTS_DB.classes[classId]];
            }
            
            // Check Family (e.g. 'skeleton' for 'skel_warrior')
            // This requires us to know the family of the current class if not obvious
            const families = ['skeleton', 'ghoul', 'phantom', 'vampire', 'lich', 'wraith', 'paladin', 'druid'];
            families.forEach(fam => {
                if (classId.includes(fam) && EVENTS_DB.classes[fam]) {
                     // Avoid double add if exact match already added
                     if(fam !== classId) {
                         pool = [...pool, ...EVENTS_DB.classes[fam]];
                     }
                }
            });
        }
        
        // 4. RARE LEGENDARY (Keep existing logic)
        // Inject into pool slightly more common than Legendary
        if(Math.random() < 0.05) return [gamblingChest];
        if(Math.random() < 0.05) return [challengeAltar];

        // RARE CHANCE FOR LEGENDARY EVENT (10%)
        if (Math.random() < 0.1) {
            return legendaryEvents;
        }
        
        // TREASURE / LOOT DISCOVERY (30% chance)
        if (EVENTS_DB.realms.treasure && Math.random() < 0.3) {
            return EVENTS_DB.realms.treasure;
        }

        return pool.length > 0 ? pool : genericEvents;
    }
};

window.EventManager = EventManager;
