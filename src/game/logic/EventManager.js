/* =========================================
   EVENT MANAGER (Narrative System)
   Handles Text Events, Choices, and Outcomes
   ========================================= */

import { gameStore } from '../store';

export const EventManager = {
    // Current Active Event
    currentEvent: null,

    init() {
        // Pre-load common events?
    },

    // Trigger an event based on Biome/Random
    triggerEvent(node) {
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
        return false;
    },

    // --- DATA POOL (Could be moved to config/events.js) ---
    getEventPool(biomeId) {
        // Generic fallback
        const common = [
            {
                title: "Wandering Trader",
                text: "A hooded figure offers you a potion for a steep price.",
                choices: [
                    { 
                        txt: "Buy Potion (50g)", 
                        req: { type: 'gold', val: 50 },
                        resultText: "You drink the potion. It tastes like sweat.",
                        effect: () => { 
                            gameStore.state.gold -= 50; 
                            gameStore.triggerVfx({ type: 'heal', val: 20 });
                            gameStore.state.hp = Math.min(gameStore.state.hp + 20, gameStore.state.maxHp);
                        }
                    },
                    { 
                        txt: "Ignore", 
                        resultText: "You walk away. The trader mutters curses.",
                        effect: () => {} 
                    }
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
                             gameStore.state.hp -= 10;
                             gameStore.state.str += 1;
                             gameStore.log("Permanently gained +1 STR!", "buff");
                        }
                    },
                    { txt: "Leave", resultText: "Nothing ventured, nothing gained." }
                ]
            }
        ];

        // Biome Specifics
        if (biomeId === 'swamp') {
            return [{
                title: "Corpse in the Mud",
                text: "A soldier lies face down in the toxic sludge.",
                choices: [
                    { 
                        txt: "Loot Body", 
                        resultText: "You found gold, but the fumes made you sick.",
                        effect: () => { 
                            gameStore.state.gold += 30;
                            gameStore.state.hp -= 5;
                            gameStore.triggerVfx({ type: 'damage', val: 5 });
                        }
                    },
                    { txt: "Respect the Dead", resultText: "You move on." }
                ]
            }];
        }

        return common;
    }
};

window.EventManager = EventManager;
