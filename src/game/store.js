import { reactive } from 'vue';

export const gameState = reactive({
    floor: 1,
    progress: 0,
    gold: 0,
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
    logs: [],
    buttons: [], // Dynamic Buttons from UI.setButtons
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
    
    // Skills & Passives
    skills: [],
    passives: [],
    activeSkills: [],
    learnedSkills: [],
    
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
    bonuses: { dodge: 0, lifesteal: 0, crit: 0 },
    baseStats: { STR: 0, VIT: 0, INT: 0 },
    shake: null, // 'small', 'medium', 'heavy'
    
    // Meta Progression (Saved separately)
    meta: {
        souls: 0,
        unlockedClasses: ['skeleton'],
        maxFloor: 1, // Track max floor for unlocks
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
        // data: { type: 'damage'|'heal'|'crit', val: string|number, x?: number, y?: number }
        // For simple centralized combat, we ignore x/y for now and center it or randomize slightly
        this.state.vfx.push({ 
            id: Date.now() + Math.random(), 
            ...data,
            timestamp: Date.now()
        });
        
        // Auto-cleanup happens in VFXLayer or via timer, but let's keep array small just in case
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
