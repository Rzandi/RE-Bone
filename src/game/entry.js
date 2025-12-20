// Import Config
import './config/constants.js';
import './config/legendary_items.js';
import './config/items.js';
import './config/enemies.js';
import './config/skills.js';
import './config/classes.js';
import './config/biomes.js';
import './config/secrets.js';
import './config/evolution.js';
import './config/recipes.js';
import './config/skill_trees.js';
import './config/database.js'; // Must be last config

// Import Logic
import './core/events.js';
import './managers/loot.js';
import './managers/progression.js';
import { Gemini } from './managers/gemini.js';
import { SoundManager } from './managers/sound.js'; 
import { Achievements } from './managers/achievements.js'; 
import { Ascension } from './managers/ascension.js'; 
import { Crafting } from './managers/crafting.js'; 
import { Social } from './managers/social.js'; 
import { VFX } from './managers/vfx.js'; 
import { SpriteManager } from './managers/sprite.js'; 
import { MobileHandler } from './managers/mobile.js';

// import './core/combat.js'; // LEGACY COMBAT DISABLED
import { Combat as CombatLogic } from './logic/Combat.js'; // NEW LOGIC
// import './core/player.js'; // LEGACY PLAYER DISABLED
import { Player as PlayerLogic } from './logic/Player.js'; // NEW LOGIC
import './core/game.js';

import { gameStore } from './store.js';

// Mock UI for legacy compatibility
window.UI = {
    log: (msg, type) => gameStore.log(msg, type),
    renderInv: () => {}, // Handled by Vue
    refresh: () => {},   // No-op, reactive store handles it
    
    updateProgress: (val) => { gameStore.state.progress = val; }, 
    fxDmg: (val, type) => { /* Emit event for Vue to catch? */ },
    showLoreCard: (t, text) => { console.log("LORE:", t, text) }, 
    showSpeechBubble: (t) => { console.log("SPEECH:", t) },
    
    init: () => { console.log("UI Init stub called"); },
    setButtons: (btns) => { 
        gameStore.state.buttons = btns; 
    },
    showPanel: (id) => { 
        gameStore.state.activePanel = id; 
        // Auto-clear buttons if switching main panels? 
        // Maybe optional? For now, let's keep it manual clearing or overwrite.
        // If we switch to 'combat' or 'menu', we might want to clear 'buttons' if they are meant to be dynamic.
        // But ControlPanel.vue prioritizes `s.buttons`.
        // So `UI.showPanel` should probably clear `s.buttons` to revert to default logic?
        // Let's TRY: clearing buttons on panel switch to avoid stuck buttons.
        gameStore.state.buttons = [];
    },
    toggleLog: () => {},
    toast: (msg) => console.log("TOAST:", msg),
    showLevelUpEffect: (lvl) => { 
        gameStore.log(`LEVEL UP! You are now Level ${lvl}`, "buff"); 
        gameStore.triggerVfx({ type: 'heal', val: "LEVEL UP!", target: 'player' });
    }
};

// THE MAGIC BRIDGE: Legacy Player -> Vue Store
const CompatPlayer = {
    // Direct Stats
    get hp() { return gameStore.state.hp; },
    set hp(v) { gameStore.state.hp = v; },
    get maxHp() { return gameStore.state.maxHp; },
    set maxHp(v) { gameStore.state.maxHp = v; },
    get mp() { return gameStore.state.mp; },
    set mp(v) { gameStore.state.mp = v; },
    get maxMp() { return gameStore.state.maxMp; },
    set maxMp(v) { gameStore.state.maxMp = v; },
    get exp() { return gameStore.state.exp; },
    set exp(v) { gameStore.state.exp = v; },
    get nextExp() { return gameStore.state.nextExp; },
    set nextExp(v) { gameStore.state.nextExp = v; },
    get gold() { return gameStore.state.gold; },
    set gold(v) { gameStore.state.gold = v; },
    get level() { return gameStore.state.level; },
    set level(v) { gameStore.state.level = v; },
    get className() { return gameStore.state.className; },
    set className(v) { gameStore.state.className = v; },
    
    // Attributes (Mapped)
    get attr() {
        return {
            get STR() { return gameStore.state.str; },
            get VIT() { return gameStore.state.vit; },
            get INT() { return gameStore.state.int; }
        };
    },
    set attr(v) {
        // Allow loading from save
        if(v) {
            if(v.STR !== undefined) gameStore.state.str = v.STR;
            if(v.VIT !== undefined) gameStore.state.vit = v.VIT;
            if(v.INT !== undefined) gameStore.state.int = v.INT;
        }
    },
    
    // Arrays (Direct ref to store arrays)
    get inventory() { return gameStore.state.inventory; },
    set inventory(v) { gameStore.state.inventory = v; },
    get passives() { return gameStore.state.passives; },
    set passives(v) { gameStore.state.passives = v; },
    get activeSkills() { return gameStore.state.activeSkills; },
    set activeSkills(v) { gameStore.state.activeSkills = v; },
    
    get learnedSkills() { return gameStore.state.learnedSkills; },
    set learnedSkills(v) { gameStore.state.learnedSkills = v; },
    get unlockedSkills() { return gameStore.state.unlockedSkills; },
    set unlockedSkills(v) { gameStore.state.unlockedSkills = v; },
    
    get equip() { return gameStore.state.equip; },
    set equip(v) { gameStore.state.equip = v; },
    
    // Misc
    get sp() { return gameStore.state.sp; },
    set sp(v) { gameStore.state.sp = v; },
    
    get status() { return gameStore.state.status; },
    set status(v) { gameStore.state.status = v; },
    
    // Methods (Redirect to Logic)
    init: (cls) => PlayerLogic.init(cls),
    recalc: () => PlayerLogic.recalc(),
    takeDamage: (amt) => PlayerLogic.takeDamage(amt),
    addItem: (id) => PlayerLogic.addItem(id),
    
    // Todo: Map other methods if Legacy calls them
    getSetBonuses: () => PlayerLogic.getSetBonuses ? PlayerLogic.getSetBonuses() : {},
    getUniqueEffects: () => ({}),
    
    // Fallback for missing methods to prevent crash
    useItem: (idx) => console.warn("Player.useItem called (Legacy)"),
    equipSkill: (id) => console.warn("Player.equipSkill called (Legacy)"),
};

// Expose Bridge
window.Player = CompatPlayer;
window.CombatManager = CombatLogic;
window.Combat = CombatLogic; // Alias just in case
window.Combat = CombatLogic; // Alias just in case
window.SoundManager = SoundManager; // Expose for UI/Combat hooks

// Restored Global Access
window.Achievements = Achievements;
window.Ascension = Ascension;
window.Crafting = Crafting;
window.Social = Social;
window.VFX = VFX;
window.SpriteManager = SpriteManager;
window.SpriteManager = SpriteManager;
window.MobileHandler = MobileHandler;
window.MobileHandler = MobileHandler;
window.Gemini = Gemini; // Ensure explicit exposure
window.GameStore = gameStore; // Critical for Game.js sync

export function initGame() {
    console.log("Initializing Re:BONE (Vue Engine)...");
    
    // 1. Hook into Legacy Events
    if(window.Events) {
        Events.on("log", (msg) => gameStore.log(msg));
        Events.on("log_combat", (msg) => gameStore.log(msg, 'combat'));
        Events.on("log_item", (msg) => gameStore.log(msg, 'item'));
        Events.on("log_boss", (msg) => gameStore.log(msg, 'boss'));
        Events.on("progress", (val) => { gameStore.state.progress = val; });
    }

    // 2. Init Logic via Bridge
    // Use the CompatPlayer to init, which triggers PlayerLogic.init -> Store update
    // CompatPlayer.init('skeleton'); // DISABLED: Wait for Start Screen
    
    gameStore.state.activePanel = 'title'; 
    
    // 3. Init Legacy Game Loop
    if(window.Game) {
        window.Game.init(); 
    }
}
