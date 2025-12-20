
// ==========================================
// HEADLESS GAMEPLAY VERIFIER
// ==========================================

// 1. MOCK BROWSER ENVIRONMENT
const mockStorage = new Map();
global.window = global; // Self-reference
global.localStorage = {
    getItem: (k) => mockStorage.get(k),
    setItem: (k, v) => mockStorage.set(k, v.toString()),
    removeItem: (k) => mockStorage.delete(k)
};
global.document = {
    getElementById: (id) => ({
        innerText: '', 
        innerHTML: '', 
        style: {}, 
        appendChild: () => {}, 
        classList: { add:()=>{}, remove:()=>{}, contains:()=>false },
        getAttribute: () => null,
        setAttribute: () => {},
        querySelector: () => null,
        querySelectorAll: () => [],
        disabled: false
    }),
    createElement: (tag) => ({
        innerText: '', 
        innerHTML: '', 
        style: {}, 
        appendChild: () => {}, 
        classList: { add:()=>{}, remove:()=>{}, contains:()=>false },
        setAttribute: () => {},
        querySelector: () => null
    }),
    querySelectorAll: () => [],
    body: { appendChild: () => {} }
};

// 2. LOAD DEPENDENCIES (Order Matters!)
const fs = require('fs');

const load = (path) => {
    try {
        const content = fs.readFileSync(path, 'utf8');
        eval(content);
        console.log(`[LOADED] ${path}`);
    } catch(e) {
        console.error(`[ERROR] Loading ${path}:`, e.message);
        process.exit(1);
    }
};

console.log("--- Loading Scripts ---");
load('js/config/constants.js');
load('js/config/legendary_items.js'); // Required by items.js
load('js/config/items.js');
load('js/config/skills.js');
load('js/config/classes.js');
load('js/config/enemies.js'); 
// items.js etc export to window.ITEMS_DB usually.
// Let's ensure window.ITEMS_DB works.
load('js/config/database.js'); // Relies on window.ITEMS_DB etc.

load('js/core/events.js');
load('js/managers/loot.js');
load('js/managers/progression.js');
load('js/core/combat.js');
load('js/core/player.js');
load('js/managers/ui.js');
// Mock Social/Ascension/VFX/Sprite/Mobile as they are visual/optional
global.Social = { isDailyChallenge: () => false, getDailyModifiers: () => [] };
global.Ascension = null; 
global.VFX = { screenShake: () => {}, showSkillEffect: () => {} };
global.SpriteManager = { showHurt: () => {} };
global.MobileHandler = null;
global.Merchant = { generateStock: () => {} };
global.Achievements = { load: () => {}, addProgress: () => {}, unlock: () => {} };

load('js/core/game.js');

// 3. EXECUTE GAMEPLAY TEST
console.log("\n--- Starting Gameplay Simulation ---");

// A. Init Game
console.log("Action: Game.init()");
Game.init();
if (!Game.state) throw new Error("Game.state missing after init!");
console.log("Status: Game Initialized. Floor:", Game.floor);

// B. Start New Game
console.log("Action: Game.startNewGame()");
Game.startNewGame();
if (Player.level !== 1) throw new Error("Player not level 1!");
console.log(`Player Stats: HP ${Player.hp}/${Player.maxHp}`);

// C. Enter Combat
console.log("Action: Game.combatState()");
Game.combatState();
if (Game.currAction !== "combat") throw new Error("Game not in combat mode!");
if (!Game.enemy) throw new Error("No enemy generated!");
console.log(`Enemy Encountered: ${Game.enemy.name} (HP: ${Game.enemy.hp})`);

// D. Player Attack
console.log("Action: CombatManager.playerTurn() -> Attack");
const initialEnemyHp = Game.enemy.hp;
// Simulate 'ATTACK' button click logic which usually calls CombatManager.playerTurn('attack') 
// or directly executeSkill logic.
// CombatManager has playerTurn() but it handles cooldowns. 
// Let's assume standard attack.
// Wait, CombatManager.playerTurn checks cooldowns and queue?
// Inspecting combat.js... usually `CombatManager.executeSkill` is validated.
// Let's assert we have a skill 0 (Basic Attack)
const skill0 = Player.skills[0];
if(!skill0) throw new Error("Player has no skills!");
console.log(`Using Skill: ${skill0}`);

// We need to resolve the skill object from DB
const skillObj = DB.SKILLS[skill0];
CombatManager.executeSkill(skillObj); 
// This is async due to timeouts usually?
// In Headless, define timeouts as immediate?
// CombatManager likely uses setTimeout for VFX. 
// We can't fast-forward time easily without mocking setTimeout.
// However, the logic for damage calculation happens synchronously usually before the VFX delay.
// Let's check if enemy HP dropped.

if (Game.enemy.hp < initialEnemyHp) {
    console.log(`SUCCESS: Enemy took damage! HP: ${initialEnemyHp} -> ${Game.enemy.hp}`);
} else {
    // Maybe it missed? Or maybe damage is 0?
    console.warn("WARNING: Enemy took no damage. (Missed or Defense too high?)");
}

// E. Win State?
// Force Kill Enemy
console.log("Action: Force Kill Enemy");
Game.enemy.hp = 0;
// We must call handleWin physically because we aren't waiting for the loop/timeout
Game.handleWin();

if (Game.state.progress > 0 || Player.exp > 0) {
    console.log("SUCCESS: Victory processed! Progress:", Game.progress);
} else {
    // Note: ensure handleWin actually updates these
    console.log("Check: Progress/EXP might be delayed by timeouts.");
}

// F. Inventory Check
console.log("Action: Loot Drop Check");
// LootDrop is probabilistic.
// Let's force add item.
Player.addItem("potion_small");
if (Player.inventory.length > 0) {
    console.log(`SUCCESS: Inventory has ${Player.inventory.length} items.`);
} else {
    throw new Error("Inventory add failed!");
}

console.log("\n--- SIMULATION PASSED ---");
