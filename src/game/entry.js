// Import Config
import './config/constants.js';
import './config/legendary_items.js';
import './config/items.js';
import { ENEMIES_DB, BOSSES_DB, BIOME_ENEMIES } from './config/enemies.js'; // v36.2
import './config/skills.js';
import './config/classes.js';
import './config/biomes.js';
import './config/realms.js'; // v34.0 Realms
// import './config/secrets.js';
import './config/evolution.js';
import './config/recipes.js';
import './config/skill_trees.js';
import './config/relics.js'; // v35.2 Relics
import { EVENTS_DB } from './config/events.js'; // v36.0 Events
import './config/enemy_skills.js'; // v36.4.3 Enemy Skills
import './config/gems.js'; // v37.0 Gems
import './config/database.js'; // Must be last config

// Import Logic
import { Events } from './core/events.js';
import './managers/loot.js';
import './managers/progression.js';
import { Gemini } from './managers/gemini.js';
import { SoundManager } from './managers/sound.js'; 
import { Achievements } from './managers/achievements.js'; 
import { Ascension } from './managers/ascension.js'; 
import { Crafting } from './managers/crafting.js'; 
import { SocialManager } from './managers/social.js'; 
import { VFX } from './managers/vfx.js'; 
import { SpriteManager } from './managers/sprite.js'; 
import { MobileHandler } from './managers/mobile.js';
import './managers/SocketManager.js'; // v37.0 Socket System
import './managers/SynthesisManager.js'; // v37.0 Synthesis System
import './managers/ReforgeManager.js'; // v37.0 Reforging System
import './managers/BlackMarketManager.js'; // v37.0 Black Market System
import './config/cursed_items.js'; // v37.0 Cursed Items
import './config/black_market_event.js'; // v37.0 Black Market Events
import './managers/EconomyManager.js'; // v37.0 Dynamic Economy

import { Combat as CombatLogic } from './logic/Combat.js';
import { Player as PlayerLogic } from './logic/Player.js';
import { EventManager } from './logic/EventManager.js';
import { Game } from './core/game.js';
import { gameStore } from './store.js';

export function initGame() {
    console.log("Initializing Re:BONE (Vue Engine)...");
    
    // Hook into Event System
    Events.on("log", (msg) => gameStore.log(msg));
    Events.on("log_combat", (msg) => gameStore.log(msg, 'combat'));
    Events.on("log_item", (msg) => gameStore.log(msg, 'item'));
    Events.on("log_boss", (msg) => gameStore.log(msg, 'boss'));
    Events.on("progress", (val) => { gameStore.state.progress = val; });

    gameStore.state.activePanel = 'title'; 
    
    // 3. Init Game Core
    // Game.init() (Imported directly)
    // We can call it here if needed, or let main.js handle it
    // But since this is entry.js, let's just initialize.
    // Game.init() is imported at top-level now.
    
    // Checking initGame logic..
    // 3A. Mobile Init
    if(MobileHandler) {
         MobileHandler.init();
    }

    // 3. Init Game Core
    if(Game) {
        Game.init();
    }
}
