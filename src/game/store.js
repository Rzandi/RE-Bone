import { reactive } from 'vue';

export const gameState = reactive({
    floor: 1,
    progress: 0,
    gold: 100,
    souls: 0, // v37.0: Soul currency for enhanced synthesis & black market
    essence: 0, // v37.0: Rare currency for high-tier synthesis
    hp: 1,
    maxHp: 1,
    mp: 1,
    maxMp: 1,
    level: 1,
    exp: 0,
    nextExp: 100,
    className: "Novice",
    activePanel: 'combat',
    merchantStock: [],
    merchantGemStock: [], // v37.0: Gem stock in merchant
    logs: [],
    buttons: [], // Dynamic Buttons from UI.setButtons
    previousPanel: null, // Track previous panel for back navigation
    inventory: [],
    // Stats
    str: 0,
    vit: 0,
    int: 0,
    
    // Equipment
    equip: { weapon: null, armor: null, acc: null },
    
    // Inventory State
    lockedItems: [],
    merchantStock: [], 
    inspectMode: false,
    salvageMode: false,
    lore: { active: false, title: "", text: "" }, // NEW
    
    // v34.0 Event System
    event: null, // { title, text, choices: [] }

    // Skills & Passives
    skills: [],
    unlockedSkills: [], // v36.7: Skills available for use/equipping
    skillCooldowns: {}, // v36.6: Per-skill cooldown tracking { skillId: turnsRemaining }
    skillUpgrades: {}, // v36.6.5: Permanent skill upgrades { skillId: { level, powerBonus, cdReduction } }
    equippedSkills: [], // v36.7: Equipped skills (max 5)
    sp: 3, // v36.7: Skill Points (starting: 3, +2 per level)
    passives: [], // Passive abilities (always-on)
    relics: [], // v35.2 Relic System (Permanent Passive Items)
    activeSkills: [],
    learnedSkills: [],
    
    // v37.0 Socketing & Crafting System
    gems: [], // Collected gems { id, gemType, quantity }
    socketedItems: {}, // Track socketed gems per item { itemId: [gemType, gemType, null] }
    synthesisFailures: {}, // v37.0: Track synthesis failures for pity system { rarity: failCount }
    
    // v37.0 Phase 3: Black Market System
    mysteryBoxPity: {}, // Track pity for mystery boxes { boxType_boxSize: count }
    blackMarket: { purchases: 0, lastRep: 0 }, // Dealer reputation tracking
    cursedItemsOwned: [], // IDs of cursed items ever owned (for achievements)
    
    // v37.0 Phase 4: Dynamic Economy
    economy: {
      totalGoldSpent: 0,
      totalGoldEarned: 0,
      itemPurchases: {},
      itemStock: {},
      activeEvent: null,
      eventDuration: 0,
      merchantReputation: 0,
      eventsThisSession: 0,
      permanentDeflation: 0,
      inflation50Warned: false
    },
    
    // Evolution
    evolutionOptions: [], // Array of options for current evo
    
    // Progression
    evolutions: [],
    classTree: null,
    
    // Combat State
    combat: {
        enemy: null,
        turn: 'player', // 'player' | 'enemy' | 'victory' | 'defeat'
        log: [],
    },
    
    // Visual Effects Queue
    vfx: [],
    
    // Internal calcs
    multipliers: { str: 1, vit: 1, int: 1, hp: 1, mp: 1, def: 1, dmg: 1 },
    bonuses: { dodge: 0, lifesteal: 0, crit: 0, block: 0, spellPower: 0, critDmg: 0, cooldownReduction: 0 },
    baseStats: { STR: 0, VIT: 0, INT: 0 },
    shake: null, // 'small', 'medium', 'heavy'
    
    // Meta Progression (Saved separately)
    meta: {
        souls: 0,
        unlockedClasses: ['skeleton'],
        maxFloor: 1, // Track max floor for unlocks
    },
    
    // v35.3 History & Lore
    history: {
        events: [], // IDs of completed events
        lore: []    // Discovered lore fragments
    },
    
    // v34.0 World Map State
    world: {
        unlockedRealms: [],     // ['nature', 'shadow', etc.]
        activeRealm: null,      // Current realm ID
        nodeMap: [],            // The Slay-the-Spire tree
        currentNode: null       // { layer: 0, index: 0 }
    },
    
    // User Settings (v32.3)
    settings: {
        audio: true, // Master Switch
        volume: 0.5, // 0.0 to 1.0
        crt: true, // Scanline toggle
        textSpeed: 1 // 1=Normal, 0=Instant
    }
});

export const gameStore = {
    state: gameState,
    
    // Helper to log (replaces UI.log)
    log(msg, type="system") {
        this.state.logs.push({ id: Date.now() + Math.random(), text: msg, type });
        if(this.state.logs.length > 50) this.state.logs.shift();
    },

    // VFX Helper
    triggerVfx(data) {
        this.state.vfx.push({ 
            id: Date.now() + Math.random(), 
            ...data,
            timestamp: Date.now()
        });
        
        if(this.state.vfx.length > 20) this.state.vfx.shift();
    },

    triggerShake(intensity = "medium") {
        // intensity: 'small', 'medium', 'heavy'
        // We push a special vfx event that App.vue listens to, OR we set a transient state
        // Let's use a specialized state for simplicity
        this.state.shake = intensity;
        setTimeout(() => {
            if(this.state.shake === intensity) this.state.shake = null;
        }, 500); // 500ms shake
    }
};

// Global access for legacy code
window.GameStore = gameStore; 
window.gameStore = gameStore; // Alias for compatibility 
