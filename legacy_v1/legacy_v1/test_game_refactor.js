
// Mock Dependencies
global.window = {};
global.localStorage = {
  store: {},
  getItem: function(key) { return this.store[key] || null; },
  setItem: function(key, value) { this.store[key] = value.toString(); }
};

// Mock Player
global.Player = {
  init: () => {},
  hp: 100, maxHp: 100,
  exp: 0, nextExp: 100,
  inventory: []
};

// Mock UI
global.UI = {
  showPanel: () => {},
  refresh: () => {},
  setButtons: () => {},
  init: () => {}
};

// Mock Others
global.CONSTANTS = { SAVE_KEY: 'test_save' };
global.Events = { emit: () => {} };
global.Social = { isDailyChallenge: () => false };

// Load Game Object (We have to eval it because it's in a file that expects browser env)
const fs = require('fs');
const gameContent = fs.readFileSync('js/core/game.js', 'utf8');

// Strip out existing const Game declaration if we want to wrap it, 
// but since we are in node, we can just eval it. 
// However, the file has `const Game = ...`. referencing CONSTANTS etc.
// Let's just mock the environment and eval.

eval(gameContent + "; global.Game = Game;");

// TEST 1: Initial State
console.log("Test 1: Initial State");
Game.init();
if (Game.state.floor !== 1) console.error("FAIL: State floor not 1");
else console.log("PASS: State floor is 1");

// TEST 2: Getter Access
console.log("Test 2: Legacy Getter Access");
if (Game.floor !== 1) console.error(`FAIL: Game.floor is ${Game.floor}, expected 1`);
else console.log("PASS: Game.floor getter works");

// TEST 3: Setter Access
console.log("Test 3: Legacy Setter Access");
Game.floor = 5;
if (Game.state.floor !== 5) console.error(`FAIL: Game.state.floor is ${Game.state.floor}, expected 5`);
else console.log("PASS: Game.floor setter updates state");

// TEST 4: Save/Load
console.log("Test 4: Save/Load");
Game.progress = 50;
Game.saveGame();
// Modify state manually
Game.state.floor = 99;
Game.state.progress = 0;
// Load
Game.loadGame();

if (Game.floor === 5 && Game.progress === 50) console.log("PASS: Load restored state");
else console.error(`FAIL: Restored floor=${Game.floor}, prog=${Game.progress}`);

console.log("Verification Complete");
