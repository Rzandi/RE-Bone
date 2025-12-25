/* =========================================
   Encapsulating State & Logic
   ========================================= */

import { gameStore } from '../store.js';
import { Player } from '../logic/Player.js';
import { Combat } from '../logic/Combat.js';
// import { UI } from '../managers/ui.js'; // REMOVED v38.0
import { Events } from './events.js'; // If needed, or use store/bus
import { EventManager } from '../logic/EventManager.js';
import { Merchant } from '../managers/merchant.js';
import { VFX } from '../managers/vfx.js';
import { Ascension } from '../managers/ascension.js';
import { SocialManager } from '../managers/social.js';
import { SaveManager } from '../managers/SaveManager.js';
import { DB } from '../config/database.js';
import { CONSTANTS } from '../config/constants.js';
import { REALMS } from '../config/realms.js';
import { Biomes } from '../config/biomes.js';
import { SoundManager } from '../managers/sound.js';
import { LootManager } from '../managers/loot.js';
import { EconomyManager } from '../managers/EconomyManager.js';
import { Leaderboard } from '../managers/Leaderboard.js';
import { EndlessMode } from '../logic/EndlessMode.js';
import { GATEKEEPER_BOSSES } from '../config/enemies.js';

const Game = {
  // Encapsulated State
  state: {
    floor: 1,
    progress: 0,
    isDaily: false,
    bossRush: { active: false, index: 0, bosses: [], startHp: 0 },
    stats: { kills: 0, damageDealt: 0, bossKills: 0 },
    totalGoldEarned: 0, // For Score Calc
  },
  
  // Runtime Loops (Private-ish)
  _combatLoop: null,
  _exploreLoop: null,
  _timerLoop: null, // v38.4: Speed Run Timer
  currAction: "idle",
  enemy: null,

  init() {
    console.log("Initializing Game Core...");
    
    // Feature Checks
    this.checkFeatures();

    // Load Save or Start New
    // Load Save or Start New
    // DISABLE AUTO START to allow Title Screen
    /*
    if (localStorage.getItem(CONSTANTS.SAVE_KEY)) {
      this.loadGame();
    } else {
      this.startNewGame();
    }
    */
    
    // UI Init
    // Force Title Screen
    if (gameStore) {
        gameStore.state.activePanel = 'title';
    }
  },

  checkFeatures() {
    // Feature Flags for dependencies
    this.hasAscension = !!Ascension;
    this.hasSocial = !!SocialManager;
    this.hasVFX = !!VFX;
  },

  // v38.5: Centralized Run Reset (Safe state hygiene)
  resetRunFlags() {
      // 1. Reset Core State
      this.state.floor = 1;
      this.state.progress = 0;
      this.state.isDaily = false;
      this.state.bossRush.active = false;
      
      // 2. Reset Store State
      if (gameStore) {
          gameStore.state.floor = 1;
          gameStore.state.progress = 0;
          gameStore.state.isDailyChallenge = false;
          gameStore.state.currentFloorTime = 0;
          gameStore.state.runTime = 0;
          
          // Clear Modifiers
          gameStore.state.activeModifiers = [];
          gameStore.state.modifierEffects = {};
      }
  },

  // v38.5: Sync Game State from Store (Fixes Load Game logic)
  syncStateFromStore() {
      if(!gameStore) return;
      this.state.floor = gameStore.state.floor || 1;
      this.state.progress = gameStore.state.progress || 0;
      this.state.isDaily = !!gameStore.state.isDailyChallenge;
      
      // Boss Rush Sync (Best Effort)
      if (gameStore.state.bossRush) {
          try {
             const br = JSON.parse(JSON.stringify(gameStore.state.bossRush));
             this.state.bossRush.active = br.active;
             // Sync internal props if available
             if(br.index !== undefined) this.state.bossRush.index = br.index;
          } catch(e) { console.warn("Boss Rush Sync Failed", e); }
      }
  },

  startNewGame() {
    this.resetRunFlags();
    Player.init("skeleton");
    this.state.floor = 1;
    this.state.progress = 0;
    this.state.isDaily = false;
    this.state.bossRush.active = false;
    
    // Check Daily
    if (this.hasSocial && SocialManager.isDailyChallenge()) {
      this.state.isDaily = true;
      SocialManager.applyDailyModifiers();
      Events.emit("log", "🌞 DAILY CHALLENGE ACTIVE!");
    }
    
    // v38.4: Init Speed Run Timer if active
    if (gameStore.state.modifierEffects?.floorTimer > 0) {
        gameStore.state.currentFloorTime = gameStore.state.modifierEffects.floorTimer;
    }
    
    // v38.4: Start Global Timer
    gameStore.state.runTime = 0;
    this.startGlobalTimer();
    
    this.saveGame();
  },

  // ============================
  // STATE ACCESSORS
  // ============================
  get floor() { return this.state.floor; },
  set floor(v) { this.state.floor = v; }, // Deprecated but kept for compat
  
  get progress() { return this.state.progress; },
  set progress(v) { this.state.progress = v; },
  
  get isDaily() { return this.state.isDaily; },

  // ============================
  // GAME MODES
  // ============================
  
  menuState() {
    this.stopLoops();
    if(gameStore) gameStore.state.activePanel = "menu-view"; // Sync Panel
    if(gameStore) gameStore.state.currAction = "idle"; // Sync Action
    this.currAction = "idle";
    if(gameStore) gameStore.state.activePanel = "menu-view";
  },

  exploreState() {
    this.stopLoops();
    if(gameStore) gameStore.state.activePanel = "combat";
    this.currAction = "exploring";
    if(gameStore) gameStore.state.currAction = "exploring"; // SYNC TO STORE

    // v38.5: Endless Mode Realm & Biome Override
    if (EndlessMode.isActive) {
        const realm = EndlessMode.getRealm(this.state.floor);
        const biome = EndlessMode.getBiome(this.state.floor);
        
        if (realm && gameStore) {
             gameStore.state.world.activeRealm = realm.id;
             // V24: Apply Biome to Current Node Context (for enemy gen)
             if (biome) {
                 // Mock a node so generateEnemy sees it
                 gameStore.state.world.currentNode = { 
                    type: 'combat', 
                    biome: biome 
                 };
             }
        }
    }
    
    this.enemy = null;
    
    // Clear Combat UI
    if(gameStore && gameStore.state.combat) {
        gameStore.state.combat.enemy = null;
    }
    
    // Check Gate
    const canNext = this.state.progress >= 100;
    
    // Prepare UI Buttons (2x2 grid)
    const btns = [];
    
    // Row 1: EXPLORE | BOSS (or spacer)
    btns.push({ txt: "🔍 EXPLORE", col: "var(--c-green)", fn: () => this.encounterRandom() });
    
    if (canNext) {
        btns.push({ txt: "👹 BOSS", col: "var(--c-red)", fn: () => this.encounterBoss() });
    } else {
        btns.push({ txt: `📊 ${this.state.progress}%`, col: "var(--c-muted)", fn: null }); // Progress indicator instead of empty
    }
    
    // Row 2: ITEM | MENU
    btns.push({ txt: "🎒 ITEM", fn: () => this.invState() });
    btns.push({ txt: "📜 MENU", fn: () => this.menuState() });

    if(gameStore) gameStore.state.buttons = btns;

    
    // MANUAL EXPLORE: No setInterval
    Events.emit("log", `Floor ${this.state.floor} - Explore to find enemies...`);
    Events.emit("progress", this.state.progress);
  },

  encounterRandom() {
    this.stopLoops();
    
    // v38.3: Button cooldown to prevent spam
    if (this._actionCooldown) {
        Events.emit("log", "Wait a moment...");
        return;
    }
    this._actionCooldown = true;
    setTimeout(() => { this._actionCooldown = false; }, 500); // 500ms cooldown
    
    // v38.8: Apply HP/MP Regen on Explore (Soul Forge Upgrades)
    const s = gameStore.state;
    if (s.exploreHpRegen > 0) {
        const hpGain = Math.floor(s.maxHp * (s.exploreHpRegen * 0.01));
        s.hp = Math.min(s.maxHp, s.hp + hpGain);
        if (hpGain > 0) Events.emit("log", `❤️ +${hpGain} HP (Explore Regen)`, "heal");
    }
    if (s.exploreMpRegen > 0) {
        const mpGain = Math.floor(s.maxMp * (s.exploreMpRegen * 0.01));
        s.mp = Math.min(s.maxMp, s.mp + mpGain);
        if (mpGain > 0) Events.emit("log", `💧 +${mpGain} MP (Explore Regen)`, "heal");
    }
    
    const roll = Math.random();
    
    // v38.3: Rebalanced encounter rates
    // 5% Sanctuary (Save Point)
    if (roll < 0.05) {
        this.sanctuaryState();
        return;
    }

    // 10% Merchant (5-15%)
    if (roll < 0.15) {
        this.merchantState();
        return;
    }
    
    // 20% Event (15-35%) - v38.3: NEW EVENT ENCOUNTERS
    if (roll < 0.35) {
        if (EventManager && EventManager.triggerRandomEvent) {
            EventManager.triggerRandomEvent();
        } else {
            // Fallback to combat if EventManager not available
            this.combatState();
        }
        return;
    }
    
    // 65% Combat (Remaining)
    this.combatState();
  },

  encounterBoss() {
    this.stopLoops();
    this.combatState(true);
  },

  combatState(isBoss = false, isElite = false) {
    this.stopLoops();
    this.currAction = "combat";
    if(gameStore) gameStore.state.currAction = "combat"; // SYNC TO STORE
    
    // Generate Enemy
    if (isBoss) {
        this.enemy = this.generateBoss();
    } else {
        this.enemy = this.generateEnemy(isElite);
    }
    
    // Delegate
    // Delegate
    Combat.startCombat(this.enemy, isBoss, isElite);
  },
  
  merchantState() {
    this.stopLoops();
    this.currAction = "merchant";
    if(gameStore) gameStore.state.currAction = "merchant"; // SYNC TO STORE
    if(gameStore) gameStore.state.activePanel = "shop"; // Added explicit panel show
    Events.emit("log", "You found a travelling Merchant!");
    if(Merchant) Merchant.generateStock(this.state.floor);
  },

  invState() {
    const wasInCombat = this.currAction === 'combat' || (this.enemy && this.enemy.hp > 0);
    
    // v37.3 Fix: Store combat origin flag (persists after currAction changes)
    this._wasInCombat = wasInCombat;
    
    // v37.3 Fix: Freeze Enemy State (Prevent data loss during Inv)
    if (this.enemy) {
        this._frozenEnemy = JSON.parse(JSON.stringify(this.enemy));
    }
    
    this.stopLoops();
    
    if (wasInCombat) {
        if(gameStore) gameStore.state.previousPanel = 'combat';
    }
    
    this.currAction = "inventory";
    if(gameStore) gameStore.state.currAction = "inventory";
    if(gameStore) gameStore.state.activePanel = "inventory";
  },
  
  // Sanctuary: The ONLY place to save manually
  sanctuaryState() {
      this.stopLoops();
      this.currAction = "sanctuary"; 
      if(gameStore) gameStore.state.currAction = "sanctuary";
      
      Events.emit("log_item", "Fully Recovered HP/MP.");
      Events.emit("log", "You feel revitalized.");
      
      if(gameStore) gameStore.state.buttons = [
          { txt: "💖 HEAL (FULL)", col: "var(--c-green)", fn: () => this.sanctuaryHeal() },
          { txt: "💾 SAVE GAME", col: "var(--c-blue)", fn: () => { this.saveGame(); } },
          null,
          { txt: "LEAVE", fn: () => this.exploreState() }
      ];
  },
  
  sanctuaryHeal() {
      Player.hp = Player.maxHp;
      Player.mp = Player.maxMp;
      Events.emit("log_item", "Fully Recovered HP/MP.");
      Events.emit("log", "You feel revitalized.");
      this.sanctuaryState();
  },

  // Permadeath Logic
  handleDefeat() {
      // Double Trigger Protection
      if (this.state.isDefeat) return;
      this.state.isDefeat = true;

      const RESURRECT_COST = 500 * this.state.floor;
      Events.emit("log_boss", "💀 YOU HAVE DIED 💀");
      
      this.stopLoops();

      // v38.6: Leaderboard Submission (V24)
      try {
          let mode = "Normal";
          if (EndlessMode.isActive) mode = "Endless";
          if (this.state.isDaily) mode = "Daily";
          if (this.state.bossRush.active) mode = "Boss Rush";
          
          const score = Leaderboard.calculateScore(this.state);
          
          Leaderboard.addEntry({
              name: Player.name || "Adventurer",
              score: score,
              floor: this.state.floor,
              class: Player.className || "Unknown",
              mode: mode,
              date: new Date().toISOString(),
              modifiers: gameStore.state.activeModifiers || []
          });
          Events.emit("log", `Score Submitted: ${score}`);
      } catch(e) { console.error("Score Submit Error", e); }

      // v38.4: Check for Hardcore modifier (instant permadeath)
      const modEffects = gameStore.state.modifierEffects || {};
      if (modEffects.permadeath) {
          Events.emit("log", "☠️ HARDCORE MODE: No second chances!");
          setTimeout(() => this.permadeath(false), 1500);
          return;
      }

      // Check Gold AND noResurrection modifier
      const canRez = Player.gold >= RESURRECT_COST && !modEffects.noResurrection;
      
      const buttons = [];
      
      if(canRez) {
          buttons.push({ 
              txt: `💸 RESURRECT (${RESURRECT_COST}G)`, 
              col: "var(--c-gold)", 
              fn: () => this.resurrect(RESURRECT_COST) 
          });
      }
      
      buttons.push({ 
          txt: "💀 ACCEPT DEATH (RESTART)", 
          col: "#f00", 
          fn: () => this.permadeath(false) // Soft Restart
      });
      
      // v38.6: Endless Mode Checkpoint Resume (V24 Spec)
      if (EndlessMode.isActive && !modEffects.permadeath) {
           buttons.push({
               txt: "🔄 LOAD CHECKPOINT",
               col: "#55f",
               fn: () => {
                   if(confirm("Reload last Checkpoint? (Progress since then will be lost)")) {
                       location.reload(); // Simplest way to restore valid state
                   }
               }
           });
      }

      // Force reload option just in case
      buttons.push({
          txt: "🔄 RELOAD APP",
          fn: () => this.permadeath(true)
      });
      
      if(modEffects.noResurrection) {
          Events.emit("log", "❌ Resurrection disabled by modifier!");
      } else if(!canRez) {
          Events.emit("log", "Not enough gold to resurrect...");
      } else {
          Events.emit("log", `Resurrect for ${RESURRECT_COST} gold?`);
      }
      
      if(gameStore) gameStore.state.buttons = buttons;
  },
  
  resurrect(cost) {
      Player.gold -= cost;
      Player.hp = Math.floor(Player.maxHp * 0.5);
      Events.emit("log_item", `Resurrected! -${cost} Gold`);
      Events.emit("log", "Get up, Skeleton!");
      this.saveGame(); 
      setTimeout(() => {
          this.exploreState();
      }, 300); // Faster transition
  },
  
  permadeath(forceReload = false) {
      console.log("Initiating Permadeath Sequence...");
      Events.emit("log_boss", "YOUR SOUL FADES...");
      
      try {
          if(SaveManager) SaveManager.clearSave(); 
      } catch(e) {
          console.error("Save Wipe Error:", e);
      }
      
      if(forceReload) {
          setTimeout(() => window.location.reload(), 300);
          return;
      }
      
      // v38.3 FIX: Synchronous soft restart
      try {
          // 1. Reset Game.state
          this.state.floor = 1;
          this.state.progress = 0;
          this.state.isDaily = false;
          this.state.bossRush.active = false;
          this.enemy = null;
          this._frozenEnemy = null;
          
          // 2. Reset gameStore state
          if(gameStore) {
              gameStore.state.floor = 1;
              gameStore.state.progress = 0;
              gameStore.state.logs = [];
              gameStore.state.buttons = [];
              gameStore.state.combat = { enemy: null, turn: 'player' };
              gameStore.state.isLoading = false; // Clear any stuck loading
          }
          
          // 3. Reinitialize Player
          Player.init("skeleton");
          
          // 4. Switch to Title Screen (not menu-view)
          if(gameStore) {
              gameStore.state.activePanel = "title";
          }
          
          Events.emit("log_boss", "🆕 NEW CYCLE BEGINS");
          console.log("Soft restart successful");
          
      } catch(err) {
          console.error("Soft Restart Failed:", err);
          // Fallback to hard reload if soft restart fails
          window.location.reload();
      }
  },

  // Risky Rest from Menu
  restState() {
      // v38.3: Cooldown to prevent spam
      if (this._restCooldown) {
          Events.emit("log", "Still tired... wait a moment.");
          return;
      }
      this._restCooldown = true;
      setTimeout(() => { this._restCooldown = false; }, 2000); // 2 second cooldown
      
      this.stopLoops();
      
      // Ambush logic (Restored)
      // Base 25%, increases every 10 floors.
      // Floor 1-9: 25% | Floor 10-19: 35% | ... | Floor 80+: Guaranteed
      const floorFactor = Math.floor(this.state.floor / 10) * 0.10; 
      const ambushChance = 0.25 + floorFactor;
      
      const roll = Math.random();
      const isAmbush = roll < ambushChance;
      
      if (isAmbush) {
          // Ambush Penalty: Half Heal
          const healPct = 0.15;
          Player.hp = Math.min(Player.hp + Math.floor(Player.maxHp * healPct), Player.maxHp);
          Player.mp = Math.min(Player.mp + Math.floor(Player.maxMp * healPct), Player.maxMp);
          
          Events.emit("log_boss", "⚠️ AMBUSHED WHILE RESTING!");
          Events.emit("log", `Recovered only 15% HP/MP.`);
          
          setTimeout(() => {
             this.combatState(); // Start combat immediately
          }, 1000);
          
      } else {
          // Safe Rest: 30% Heal
          const healPct = 0.30;
          Player.hp = Math.min(Player.hp + Math.floor(Player.maxHp * healPct), Player.maxHp);
          Player.mp = Math.min(Player.mp + Math.floor(Player.maxMp * healPct), Player.maxMp);
          
          Events.emit("log_item", "Rested safely. (+30% HP/MP)");
          Events.emit("log", `Chance to Ambush was ${Math.floor(ambushChance * 100)}%`);
          
          this.menuState();
      }
  },
  
  openSoulShop() {
      this.stopLoops();
      if(gameStore) gameStore.state.activePanel = "shop-ascension";
  },

  worldMapState() {
      this.stopLoops();
      this.currAction = "world_map";
      if(gameStore) gameStore.state.currAction = "world_map";
      
      Events.emit("log_boss", "🗺️ THE WORLD OPENS BEFORE YOU...");
      if(gameStore) gameStore.state.activePanel = "world_map";
  },

  // v34.0: Enter a specific Realm (Generates Map)
  enterRealm(realmId) {
      this.stopLoops();
      
      // Lazy Load NodeMap Logic if needed? Already imported/global?
      // Assuming NodeMap is global or we import it. 
      // Ideally Game.js shouldn't depend on View logic, but let's assume `import { NodeMap }` or global.
      // WE NEED TO IMPORT IT. For now, let's assume logic is in store or helper.
      // Actually, NodeMapPanel calls NodeMap.generateMap on mount.
      
      if(gameStore) {
          gameStore.state.world.activeRealm = realmId;
          
          if(active) {
            // Apply biome effect
            // ...
          }
          if(SoundManager) SoundManager.playAmbience(realmId);
          Events.emit("log_boss", `You step into the ${realmId.replace('_', ' ').toUpperCase()}...`);
          
          // Trigger UI switch
          if(gameStore) gameStore.state.activePanel = "node_map";
      }
  },

  // v34.0: Handle Node Click
  resolveNode(node) {
      this.stopLoops();

      // v36.1: Biome Effects
      if (node.biome) this.applyBiomeEffect(node.biome);
      
      switch(node.type) {
          case 'combat':
              this.combatState(); 
              break;
          case 'elite':
              this.combatState(false, true); // isBoss=false, isElite=true
              Events.emit("log_boss", "⚠️ ELITE ENEMY APPROACHING!");
              break;
          case 'boss':
              this.combatState(true);
              break;
          case 'rest':
              this.sanctuaryState();
              break;
          case 'event':
              if (EventManager) {
                  EventManager.triggerEvent(node);
              } else {
                  Events.emit("log_item", "❓ Event System not ready.");
                  setTimeout(() => { if(gameStore) gameStore.state.activePanel = "node_map"; }, 1000);
              }
              break;
          default:
              this.combatState();
      }
  },

    applyBiomeEffect(biome) {
        if(Biomes) Biomes.applyEffect(biome);
    },

  // v34.0: Helper for EventManager to return
  returnToMap() {
      // Clear event state? Not strictly needed if overwritten
      if(gameStore) gameStore.state.event = null;
      if(gameStore) gameStore.state.activePanel = "node_map";
  },

  // ============================
  // WIN/LOSE LOGIC
  // ============================
  
  handleWin(healAmount = 0) {
      if(!this.enemy) return;

      try {
          // Loot Calculation
          // Loot Calculation
          // v35.3: Apply EXP Multiplier
          // Safety check for enemy
          if (!this.enemy || typeof this.enemy.exp === 'undefined') {
              console.error("handleWin called but enemy or enemy.exp is missing", this.enemy);
              // Fallback to minimal rewards
              Player.exp += 10;
              Player.gold += 5;
              this.exploreState();
              return;
          }
          
          let expGain = Math.floor(this.enemy.exp * (Player.multipliers.exp || 1));
          Player.exp += expGain; // Add EXP to player directly or via helper? Player.gainExp handled usually?
          // Note: Player.exp is direct property. Level up logic is usually separate check.
          // Let's assume we just add it here for now or check Player.gainExp exists.
          // Player.js has no gainExp, just property.
          
          let lootLog = `LOOT: +${expGain} XP`;
          
          // GOLD REWARD (New v31.1)
          // Base Gold = EXP * 0.5 + Floor * 2. Randomized +/- 20%
          let baseGold = Math.floor(this.enemy.exp * 0.5) + (this.state.floor * 2);
          let goldReward = Math.floor(baseGold * (0.8 + Math.random() * 0.4));
          if (goldReward < 1) goldReward = 1;
          
          // v35.3: Apply Gold Multiplier
          goldReward = Math.floor(goldReward * (Player.multipliers.gold || 1));
          
          Player.gold += goldReward;
          this.state.totalGoldEarned = (this.state.totalGoldEarned || 0) + goldReward;
          lootLog += `, +${goldReward} G`;
          
          
          if(LootManager) {
              // Standard Loot
              itemDrop = LootManager.dropLoot(this.enemy);
              
              // v35.0: TRAITOR BOSS UNLOCKS & DROPS
              if (this.enemy.unlockClass) {
                  const unlockId = this.enemy.unlockClass;
                  const store = gameStore;
                  
                  // Unlock Class
                  if (store && !store.state.meta.unlockedClasses.includes(unlockId)) {
                      store.state.meta.unlockedClasses.push(unlockId);
                      Events.emit("log_boss", `✨ UNLOCKED NEW CLASS: ${unlockId.toUpperCase()}!`);
                      // Award Achievement Logic here if needed
                  }
              }
              
              // v35.0: GUARANTEED SOUL WEAPON DROP
      // v35.2: Elite Enemy Relic Drop (30% Chance)
      // Check if elite (rank 'elite' or manually set)
      if (this.state.combat.enemy.rank === 'elite' || this.state.combat.enemy.isElite) {
           if (Math.random() < 0.30) {
                if (LootManager) {
                     const relicName = LootManager.dropRelic('common');
                     if (relicName) {
                         this.log(`Elite Drop: Found Relic - ${relicName}!`, "buff");
                     }
                }
           }
      }

      // Check for Boss Drop (Soul Weapon)
      if (this.state.combat.enemy.drop) {
         const dropId = this.state.combat.enemy.drop;
         if (DB.LEGENDARY_ITEMS && DB.LEGENDARY_ITEMS[dropId]) {
              Player.addItem(dropId);
              this.log(`BOSS DEFEATED! Obtained Soul Weapon: ${LEGENDARY_ITEMS[dropId].name}`, "buff");
              Events.emit("log_item", `Found ${LEGENDARY_ITEMS[dropId].name}`);
         }
      }                       
          }

          // HP Per Kill
          let setBonus = Player.getSetBonuses();
          let uniqueEffects = Player.getUniqueEffects();
          let totalHpPerKill = (setBonus.hpPerKill || 0) + (uniqueEffects.hpPerKill || 0);
          
          // v35.3: RELIC - Soul Stealer (% HP on Kill)
          if(Player.bonuses.hpPerKillPercent) {
               totalHpPerKill += Math.floor(Player.maxHp * Player.bonuses.hpPerKillPercent);
               Events.emit("log_item", `Relic: Soul Stealer drained life.`);
          }
          
          if (totalHpPerKill > 0) {
              Player.hp = Math.min(Player.hp + totalHpPerKill, Player.maxHp);
               Events.emit("log_item", `Healed ${totalHpPerKill} HP (On-Kill)`);
          }
          
          // Boss Rush Logic
          if (this.state.bossRush.active) {
              this.state.bossRush.index++;
              setTimeout(() => this.bossRushNext(), 1500);
              return;
          }
      
          // Gain EXP
          // v36.1: Centralized via Player Logic
          Player.gainExp(expGain);
          
          if (Player.level > (this._lastLevel || Player.level)) {
              lootLog += ` | 🆙 LEVEL UP!`;
              // ProgressionManager check? Player.js handles panel switch now?
              if(ProgressionManager) ProgressionManager.levelUpState();
          }
          this._lastLevel = Player.level; // track for log check

          // Progress
          this.state.progress = Math.min(100, this.state.progress + 20);
          // Events.emit("log", `Progress: ${this.state.progress}%`); // Removed noise
          Events.emit("progress", this.state.progress); 
          
          // Finalize Log
          if (itemDrop) lootLog += `, 🎁 [${itemDrop}]`;
          
          // Emit Consolidated Log
          Events.emit("log_item", lootLog);
          
          // Check Victory/Ascension
          if (this.checkAscensionVictory()) return;
          
      } catch (e) {
          console.error("Game.handleWin Error:", e);
          Events.emit("log_boss", "Victory Error - Recovering...");
      }

      // Return to Explore (Always Run)
      setTimeout(() => {
          // v34.0 Loop Logic
        if (gameStore && gameStore.state.world.activeRealm) {
               if(gameStore) gameStore.state.activePanel = "node_map";
          } else {
               this.exploreState();
          }
      }, 800);
  },
  
  checkAscensionVictory() {
    // Endless Mode Trigger (Floor 500 - Epic Mode)
    if (this.enemy.isBoss && this.state.floor === 500) { 
        Events.emit("log_boss", "🎉 FLOOR 500 CONQUERED!");
        if (Achievements) Achievements.unlock('floor_500');
        
        // Show Victory/Ascension Panel
        if(gameStore) gameStore.state.activePanel = "victory";
        return true; 
    }
    
    // v38.8: Floor 100 - Unlock Challenge Modifiers + Achievement
    if (this.enemy.isBoss && this.state.floor === 100) {
        if (gameStore && gameStore.state.meta) {
            gameStore.state.meta.hasCompletedFloor100 = true;
            Events.emit("log_boss", "🔓 Challenge Modifiers Unlocked!");
        }
        if (Achievements) Achievements.unlock('floor_100');
    }
    
    // v38.8: Floor 200, 300, 400 Achievements
    if (this.enemy.isBoss && this.state.floor === 200) {
        if (Achievements) Achievements.unlock('floor_200');
    }
    if (this.enemy.isBoss && this.state.floor === 300) {
        if (Achievements) Achievements.unlock('floor_300');
    }
    if (this.enemy.isBoss && this.state.floor === 400) {
        if (Achievements) Achievements.unlock('floor_400');
    }
    
    // Checkpoint Handler (Endless Mode)
    if (EndlessMode.isActive && EndlessMode.isCheckpoint(this.state.floor) && this.enemy.isBoss) {
         Events.emit("log_boss", "💾 CHECKPOINT REACHED!");
         this.saveGame();
         Player.hp = Player.maxHp;
         Events.emit("log_item", "HP Fully Restored.");
    }
    
    // Normal Boss win
    if (this.enemy.isBoss) {
        this.state.stats.bossKills = (this.state.stats.bossKills || 0) + 1; // Track Boss Kills
        
        // v38.6: Reset NodeMap to force regeneration for next leg
        if(gameStore) gameStore.state.world.nodeMap = [];
        
        // v38.8: Gatekeeper Boss System (Epic Mode)
        // Defeating Realm Boss (100, 200, 300, 400, 500) triggers Gatekeeper Battle
        const gatekeeperFloors = [100, 200, 300, 400, 500];
        if (gatekeeperFloors.includes(this.state.floor)) {
            const gatekeeper = GATEKEEPER_BOSSES[this.state.floor];
            const isDefeated = gameStore.state.gatekeeper?.defeated?.[this.state.floor];
            
            // Skip if gatekeeper already defeated OR if this IS the gatekeeper win
            if (gatekeeper && !isDefeated && !this.enemy.isGatekeeper) {
                // Floor 500 gatekeeper (THE VOID) only spawns if Endless Mode is active
                if (this.state.floor === 500 && !EndlessMode.isActive) {
                    // Skip THE VOID if player hasn't chosen Endless Mode
                    // Player will get the Endless choice event instead
                    this.nextFloor();
                    return true;
                }
                
                // Spawn Gatekeeper Boss with Lore
                this.startGatekeeperBattle(gatekeeper);
                return true; // Stop normal flow
            }
            
            // Handle Gatekeeper Victory
            if (this.enemy.isGatekeeper) {
                const newCap = 100 + (this.state.floor / 100) * 20;
                Player.state.levelCap = newCap;
                gameStore.state.gatekeeper.defeated[this.state.floor] = true;
                
                // Drop rewards - use this.enemy.drops (set during startGatekeeperBattle)
                const drops = this.enemy.drops || [];
                drops.forEach(drop => {
                    if (Math.random() <= drop.chance) {
                        if (drop.id === 'limit_break_shard') {
                            gameStore.state.gatekeeper.limitBreakShards++;
                            Events.emit("log_item", `💎 Obtained: Limit Break Shard!`);
                        } else if (drop.id === 'void_essence') {
                            gameStore.state.gatekeeper.voidEssence++;
                            Events.emit("log_item", `🌌 Obtained: Void Essence!`);
                        }
                    }
                });
                
                Events.emit("log_boss", `🔓 LIMIT BREAK! Level Cap → ${newCap}!`);
                if(SoundManager) SoundManager.play("upgrade_success");
            }
        }
        
        this.nextFloor();
        return true; // Stop current exploration loop, nextFloor restarts it
    }
    return false;
  },
  
  nextFloor() {
      this.state.floor++;
      this.state.progress = 0;
      
      // v38.3: Sync floor to gameStore for UI display
      if (gameStore) {
          gameStore.state.floor = this.state.floor;
          gameStore.state.progress = 0;
      }
      
      // Clear Logs (v31.2 Request)
      if(gameStore) gameStore.state.logs = [];
      
      Events.emit("log_boss", `Welcome to Floor ${this.state.floor}...`);
      
      // v37.0 Phase 4: Update economy on floor change
      if (EconomyManager) {
        EconomyManager.onFloorChange();
      }
      
      // v38.5: ENDLESS TRANSITION LOGS (V24 Story)
      if (EndlessMode.isActive) {
           const realm = EndlessMode.getRealm(this.state.floor);
           const biome = EndlessMode.getBiome(this.state.floor);
           if (realm) {
               // Check if shifted realm (every 100 floors)
               if ((this.state.floor - 1) % 100 === 0) {
                    Events.emit("log_boss", `🌌 REALM SHIFT: ${realm.name}`);
               }
               // Check if shifted biome (every 5 floors)
               if (biome && (this.state.floor - 101) % 5 === 0) {
                   Events.emit("log", `Entering ${biome.name}... ${biome.effect}`);
               }
           }
      }
      
      // v38.4: Reset Speed Run Timer on new floor
      if (gameStore.state.modifierEffects?.floorTimer > 0) {
          gameStore.state.currentFloorTime = gameStore.state.modifierEffects.floorTimer;
          Events.emit("log", "⏰ Timer Reset!");
      }
      // Start Global Timer
      this.startGlobalTimer();
      
      // v38.6: Update Realm State based on Floor (1-500 Refactor)
      this.updateRealmState();
      
      // ROGUELIKE: No auto-save on floor change. Must find Sanctuary.
      // this.saveGame();
  },
  
  // v38.8: START GATEKEEPER BOSS BATTLE
  startGatekeeperBattle(gatekeeperData) {
      // 1. Show Lore Event
      if (gatekeeperData.lore && gameStore) {
          gameStore.state.lore = {
              active: true,
              title: gatekeeperData.lore.title,
              text: `${gatekeeperData.lore.text}\n\n${gatekeeperData.lore.quote}`
          };
      }
      
      // 2. Delay then start combat (allow lore to display)
      setTimeout(() => {
          if (gameStore) gameStore.state.lore.active = false;
          
          // 3. Calculate Dynamic Stats
          const playerMaxHp = Player.maxHp || 500;
          const playerAtk = Player.state ? (Player.state.atk || 100) : 100;
          const playerDef = Player.state ? (Player.state.def || 50) : 50;
          
          const atkMult = gatekeeperData.atkRange[0] + Math.random() * (gatekeeperData.atkRange[1] - gatekeeperData.atkRange[0]);
          
          const scaledHp = Math.floor(playerMaxHp * gatekeeperData.baseHpMult);
          const scaledAtk = Math.floor(playerAtk * atkMult);
          const scaledDef = Math.floor(playerDef * gatekeeperData.defMult);
          
          // 4. Create Enemy Object
          this.enemy = {
              name: gatekeeperData.name,
              hp: scaledHp,
              maxHp: scaledHp,
              atk: scaledAtk,
              def: scaledDef,
              exp: gatekeeperData.exp,
              sprite: gatekeeperData.sprite,
              skills: gatekeeperData.skills || [],
              passives: gatekeeperData.passives || [],
              mp: 100,
              maxMp: 100,
              skillCooldowns: {},
              isBoss: true,
              isGatekeeper: true,
              drops: gatekeeperData.drops
          };
          
          // 5. Log Event
          Events.emit("log_boss", `⚠️ ${gatekeeperData.name} APPEARS!`);
          Events.emit("log", `"${gatekeeperData.lore?.quote || 'Prepare yourself.'}"`);
          
          // 6. Start Combat
          if (gameStore) gameStore.state.activePanel = "combat";
          Combat.start(this.enemy);
          
          if (SoundManager) SoundManager.play("boss_appear");
      }, 3000); // 3 second delay for lore
  },

  updateRealmState() {
      // 100 Floors per Realm logic
      if (!gameStore) return;
      
      const floor = this.state.floor;
      const ids = ['nature_den', 'shadow_guild', 'light_castle', 'arcane_tower', 'iron_fort'];
      
      let rIdx = 0;
      if (floor <= 500) {
          rIdx = Math.floor((floor - 1) / 100);
      } else {
          // Endless > 500
          // Cycle logic from EndlessMode will be handled descriptively, 
          // but we need a valid 'activeRealm' ID for NodeMap generation.
          // EndlessMode.getRealm returns ID.
          const endlessR = EndlessMode.getRealm(floor);
          if (endlessR) return; // endless handles its own visuals? 
          // Actually NodeMap needs gameStore.state.world.activeRealm
          // EndlessMode.js logic maps floor to ID.
          // We should sync it here.
          if (EndlessMode.isActive) {
             const er = EndlessMode.getRealm(floor);
             // er is object {id: 'nature', ...}. Need 'nature_den'.
             // Map IDs again?
             const mapIds = {
                'nature': 'nature_den', 'shadow': 'shadow_guild', 'fire': 'iron_fort',
                'ice': 'arcane_tower', 'storm': 'light_castle'
             };
             // Wait, EndlessMode.getRealm returns one of REALMS array in EndlessMode.js
             // which has 'nature', 'shadow'...
             // We need to set activeRealm to 'nature_den'.
             if(er && mapIds[er.id]) gameStore.state.world.activeRealm = mapIds[er.id];
             return;
          }
      }
      
      if (ids[rIdx]) {
          gameStore.state.world.activeRealm = ids[rIdx];
      }
  },

  // ============================
  // BOSS RUSH MODE
  // ============================
  
  bossRushStart() {
    // v38.0 Refactor: Replaced legacy innerHTML with Vue Panel
    // OLD: UI.showPanel("class"); + innerHTML
    if(gameStore) gameStore.state.activePanel = "boss-rush"; // Targeting BossRushPanel.vue
    
    if(gameStore) gameStore.state.buttons = [
      null,
      { txt: "START", col: "var(--c-gold)", fn: () => this.bossRushInit() },
      null,
      { txt: "BACK", fn: () => this.menuState() },
    ];
  },
  
  bossRushInit() {
    this.resetRunFlags();
    this.state.bossRush.active = true;
    this.state.bossRush.index = 0;
    this.state.bossRush.bosses = [2, 4, 6, 8, 10]; // Floors
    
    Player.init("skeleton");
    Player.hp = Player.maxHp;
    Player.mp = Player.maxMp;
    this.state.bossRush.startHp = Player.hp;
    
    Events.emit("log_boss", "━━━ BOSS RUSH ACTIVATED ━━━");
    Events.emit("log", "Defeat all bosses! Limited healing!");
    
    this.bossRushNext();
  },
  
  bossRushNext() {
    if (this.state.bossRush.index >= this.state.bossRush.bosses.length) {
      this.bossRushVictory();
      return;
    }
    
    // Heal
    if (this.state.bossRush.index > 0) {
      Player.hp = Math.min(Player.hp + 20, Player.maxHp);
      Player.mp = Math.min(Player.mp + 10, Player.maxMp);
      Events.emit("log_item", "+20 HP, +10 MP (Intermission)");
    }
    
    // Set Fake Floor
    this.state.floor = this.state.bossRush.bosses[this.state.bossRush.index];
    
    // v38.4: Reset Speed Run timer for Boss Rush floor
    if (gameStore.state.modifierEffects?.floorTimer > 0) {
        gameStore.state.currentFloorTime = gameStore.state.modifierEffects.floorTimer;
        Events.emit("log", "⏰ Timer Reset for Boss!");
    }
    
    Events.emit("log_boss", `Boss ${this.state.bossRush.index + 1}/5: Floor ${this.state.floor}`);
    this.combatState(true); // IsBoss = true
  },
  
  bossRushVictory() {
    this.state.bossRush.active = false;
    Events.emit("log_boss", "🏆 BOSS RUSH COMPLETE!");
    Player.gold += 500;
          if(LootManager) {
              const drops = [];
              // Generate 3 random drops for victory
              for(let i=0; i<3; i++) {
                  const drop = LootManager.generateDrop(this.state.floor, 'rare'); // Minimum Rare
                  if(drop) drops.push(drop);
              }
              
              if(drops.length > 0) {
                  drops.forEach(item => {
                      Player.addItem(item);
                      Events.emit("log_item", `Reward: ${item.name}`);
                  });
              }
          }
    setTimeout(() => this.menuState(), 3000);
  },

  // ============================
  // HELPERS
  // ============================

  stopLoops() {
    if (this._exploreLoop) clearInterval(this._exploreLoop);
    if (this._combatLoop) clearInterval(this._combatLoop);
    // this.stopTimerLoop(); // v38.4 FIX: Don't stop Global Timer on state change! Only on Defeat/Quit.
  },
  
  getFloorType() {
      // Return biome info if needed
      return "dungeon";
  },
  
  generateEnemy(isElite = false) {
      // v36.2: Biome-Specific Logic
      let pool = [];
      const worldState = gameStore ? gameStore.state.world : null;
      let usedBiome = false;

      // Check if we are in a Biome Node on World Map
      if (worldState && worldState.currentNode && worldState.currentNode.biome) {
          const biomeId = worldState.currentNode.biome.id; // Corrected: Node.biome is object {id, name, eff}
          if (DB.BIOME_ENEMIES && DB.BIOME_ENEMIES[biomeId]) {
              pool = DB.BIOME_ENEMIES[biomeId];
              usedBiome = true;
          }
      }

      // Legacy/Fallback Logic
      if (pool.length === 0) {
           pool = DB.ENEMIES.filter(e => e.floor <= this.state.floor);
      }

      const base = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : DB.ENEMIES[0];
      const enemy = JSON.parse(JSON.stringify(base)); 

      // --- RANK & RARITY SYSTEM ---
      const ranks = ["E", "D", "C", "B", "A", "S"];
      const rarities = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
      
      // Random Rank (Weighted towards lower)
      let rRoll = Math.random();
      let rankIdx = 0;
      
      if (isElite) {
          rankIdx = 3 + Math.floor(Math.random() * 3); // B, A, S
      } else {
          if (rRoll < 0.5) rankIdx = 0; // 50% E
          else if (rRoll < 0.75) rankIdx = 1; // 25% D
          else if (rRoll < 0.90) rankIdx = 2; // 15% C
          else if (rRoll < 0.96) rankIdx = 3; // 6% B
          else if (rRoll < 0.99) rankIdx = 4; // 3% A
          else rankIdx = 5; // 1% S
      }
      
      const rank = ranks[rankIdx];
      const rankMult = [0.8, 1.0, 1.2, 1.5, 2.0, 3.0][rankIdx];
      
      // Random Rarity
      let qRoll = Math.random();
      let rarIdx = 0;
      
      if (isElite) {
          rarIdx = 2 + Math.floor(Math.random() * 3); // Rare, Epic, Leg
      } else {
          if (qRoll < 0.6) rarIdx = 0;
          else if (qRoll < 0.85) rarIdx = 1;
          else if (qRoll < 0.95) rarIdx = 2;
          else if (qRoll < 0.99) rarIdx = 3;
          else rarIdx = 4;
      }
      
      const rarity = rarities[rarIdx];
      const rarMult = [1.0, 1.2, 1.5, 2.0, 3.0][rarIdx];
      
      // Apply States
      enemy.name = `[${rank}] ${enemy.name} (${rarity})`;
      if (isElite) enemy.name = `⚠️ ELITE ${enemy.name}`;
      enemy.rank = rank;
      enemy.rarity = rarity;
      
      // ASCENSION SCALING (New v33.0)
      let ascMult = 1.0;
      if (gameStore && gameStore.state.meta.ascensionLevel) {
          ascMult += (gameStore.state.meta.ascensionLevel * 0.2); // +20% per cycle
      }
      
      const totalMult = rankMult * rarMult * ascMult * (isElite ? 1.5 : 1.0);
      
      enemy.maxHp = Math.floor((enemy.maxHp || enemy.hp) * totalMult);
      enemy.hp = enemy.maxHp;
      enemy.atk = Math.floor(enemy.atk * totalMult);
      enemy.exp = Math.floor(enemy.exp * totalMult * (isElite ? 2 : 1)); 
      
      if(ascMult > 1.0) {
          enemy.name = `💀${gameStore.state.meta.ascensionLevel} ${enemy.name}`; 
      }

      // v38.6: EPIC MODE SCALING (Floors 101-500)
      if (this.state.floor > 100 && !EndlessMode.isActive) {
          const epicFloor = this.state.floor - 100;
          // Linear Scaling: +2% stats per floor past 100
          // Floor 500 = +800% stats (9x base). Fairly balanced for mid-game.
          const epicScale = 1 + (epicFloor * 0.02);
          
          enemy.maxHp = Math.floor(enemy.maxHp * epicScale);
          enemy.hp = enemy.maxHp;
          enemy.atk = Math.floor(enemy.atk * epicScale);
          enemy.exp = Math.floor(enemy.exp * epicScale);
          enemy.name = `⚔️ ${enemy.name}`;
      }

      // v38.5: ENDLESS MODE SCALING
      if (EndlessMode.isActive) {
          const scaler = EndlessMode.getScalingFactor(this.state.floor);
          enemy.maxHp = Math.floor(enemy.maxHp * scaler.hp);
          enemy.hp = enemy.maxHp;
          enemy.atk = Math.floor(enemy.atk * scaler.dmg);
          enemy.exp = Math.floor(enemy.exp * scaler.exp);
          // Gold handled in handleWin? No, loot calculation uses enemy stats?
          // handleWin uses enemy.exp. 
          // We should scale Gold drop here if handleWin doesn't use scaler.
          // handleWin calculates gold based on EXP and Floor. 
          // We scaled EXP, so Gold scales automatically!
          
          enemy.name = `♾️ ${enemy.name}`;
      }
      
      return enemy;
  },
  
  generateBoss() {
      // v38.5: ENDLESS BOSSES (V24)
      if (EndlessMode.isActive) {
          const endlessBoss = EndlessMode.getBoss(this.state.floor);
          if (endlessBoss) {
               // Must clone to prevent mutation of config
               const boss = JSON.parse(JSON.stringify(endlessBoss));
               
               // Apply Scaling
               const scaler = EndlessMode.getScalingFactor(this.state.floor);
               boss.maxHp = Math.floor(boss.hp * scaler.hp);
               boss.hp = boss.maxHp;
               boss.atk = Math.floor(boss.atk * scaler.dmg);
               boss.exp = Math.floor(boss.exp * scaler.exp);
               
               boss.isBoss = true;
               return boss;
          }
      }

      // v36.3: Realm Boss Priority
      const store = gameStore;
      if (store && store.state.world.activeRealm) {
          const rId = store.state.world.activeRealm;
          if (REALMS && REALMS[rId] && REALMS[rId].boss) {
              const rBoss = REALMS[rId].boss;
              // Mixin generic boss traits if missing
              return { 
                  ...DB.ENEMIES[0], 
                  ...rBoss, 
                  isBoss: true, 
                  maxHp: rBoss.hp, // Ensure MaxHP set
                  exp: rBoss.exp || (this.state.floor * 100) // Fallback Exp
              };
          }
      }

      const boss = DB.BOSSES ? DB.BOSSES[this.state.floor] : null;
      if(boss) return JSON.parse(JSON.stringify(boss));
      
      return { ...DB.ENEMIES[0], name: "Guardian", isBoss: true, maxHp: 50*this.state.floor, hp: 50*this.state.floor, exp: 100 };
  },

  saveGame() {
    // v38.3: Use SaveManager for consistent save format
    if (SaveManager) {
        SaveManager.saveGame();
    } else {
        // Legacy fallback (deprecated)
        let worldData = {};
        if(gameStore) {
            worldData = JSON.parse(JSON.stringify(gameStore.state.world));
        }

        localStorage.setItem(
          CONSTANTS.SAVE_KEY,
          JSON.stringify({
            p: Player,
            w: { floor: this.state.floor, prog: this.state.progress },
            v34: worldData
          })
        );
        
        Events.emit("log_item", "Saved.");
    }
  },
  
  loadGame() {
    try {
        const d = localStorage.getItem(CONSTANTS.SAVE_KEY);
        if (d) {
          const data = JSON.parse(d);
          Object.assign(Player, data.p);
          this.state.floor = data.w.floor || 1;
          this.state.progress = data.w.prog || 0;
          
          // v38.6: Force Sync Realm State (Epic Mode Migration)
          this.updateRealmState();
          
          // v34.0: Restore World
          if(data.v34 && gameStore) {
               Object.assign(gameStore.state.world, data.v34);
          }
          
          // v35.0: Restore Meta
          if(SaveManager) SaveManager.loadMeta();

          // v35.2: Sync Relics back to Store (Fix Persistence Bug)
          if(gameStore) {
              // Ensure Player.relics is synced to reactive store
              if(Player.relics) {
                  gameStore.state.relics = Player.relics;
              } else {
                   gameStore.state.relics = [];
                   Player.relics = gameStore.state.relics;
              }
          }

          if(Player.recalc) Player.recalc();

          // v34.0: Intelligent Resume
        if (gameStore && gameStore.state.world.activeRealm) {
              // We are in a realm, go to Node Map
              this.stopLoops();
              this.currAction = "node_map"; // internal state sync
              setTimeout(() => { if(gameStore) gameStore.state.activePanel = "node_map"; }, 100);
          } else {
              this.exploreState();
          }
        }
    } catch(e) {
        console.error("Save Corrupt", e);
        this.startNewGame();
    }
  },
  
  // ============================
  // TIMER LOGIC (v38.4)
  // ============================
  // ============================
  // TIMER LOGIC (v38.4)
  // ============================
  startGlobalTimer() {
      if (this._timerLoop) clearInterval(this._timerLoop);
      
      // v38.4: Ensure Run Time exists
      if (gameStore && typeof gameStore.state.runTime === 'undefined') {
          gameStore.state.runTime = 0;
      }
      
      // v38.4: Init Speed Run Timer if active
      if (gameStore.state.modifierEffects?.floorTimer > 0) {
          if (!gameStore.state.currentFloorTime || gameStore.state.currentFloorTime <= 0) {
                gameStore.state.currentFloorTime = gameStore.state.modifierEffects.floorTimer;
          }
      }
      
      const updateRate = 1000; // 1s
      
      this._timerLoop = setInterval(() => {
          // Pause check - Title only or Dead/Win
          if (gameStore.state.activePanel === 'title' || 
              gameStore.state.activePanel === 'victory' || // Won
              gameStore.state.hp <= 0) { // Dead
              return;
          }
          
          // Increment Global Run Time (v38.4)
          // Runs in Pause Menu too based on user request "tidak akan berhenti"
          if (gameStore.state.runTime !== undefined) {
              gameStore.state.runTime++;
          }
          
          // Speed Run Logic (Only runs if not paused?) 
          // Speed Run normally pauses in Menu. "Speed Run" modifier usually implies game clock.
          // I will PAUSE Speed Run floor timer in Pause Menu, but GLOBAL Run Time continues?
          // That seems inconsistent. 
          // Let's Pause BOTH in Pause Menu for safety, unless user complains.
          // Re-reading: "time itu akan mulai dari awal ... tidak akan berhenti" refers to the "Time" in Pause Menu.
          // So Global Timer runs. Speed Run timer? Usually pauses.
          // let's stick to: GLOBAL runs. FLOOR timer pauses in menu.
          
          const inMenu = gameStore.state.activePanel === 'pause-menu' || 
                         gameStore.state.activePanel === 'settings' ||
                         gameStore.state.activePanel === 'run-setup';

          // Speed Run Floor Timer
          if (gameStore.state.modifierEffects?.floorTimer && !inMenu) {
               if (gameStore.state.currentFloorTime > 0) {
                   gameStore.state.currentFloorTime--;
                   
                   if (gameStore.state.currentFloorTime <= 10) {
                        if (gameStore.state.currentFloorTime <= 5) {
                            Events.emit("log_item", `⏰ ${gameStore.state.currentFloorTime}s remaining!`);
                            if(SoundManager) SoundManager.play('ui');
                        }
                   }
                   
                   if (gameStore.state.currentFloorTime <= 0) {
                       this.handleTimeout();
                   }
               }
          }
      }, updateRate);
  },
  
  stopTimerLoop() {
      if (this._timerLoop) {
          clearInterval(this._timerLoop);
          this._timerLoop = null;
      }
  },
  
  handleTimeout() {
      this.stopTimerLoop();
      gameStore.state.hp = 0;
      Events.emit("log_boss", "⏰ TIME'S UP! ⏰");
      if(SoundManager) SoundManager.play('error'); // Alarm Sound
      this.handleDefeat();
  },

  skillState() {
      if (this.currAction === 'combat') {
          if(gameStore) gameStore.state.activePanel = "skill-selector";
      } else {
          if(gameStore) gameStore.state.activePanel = "skills";
      }
  },
  
};


// Export to global scope - REMOVED for v38.0 strict mode
// window.Game = Game;
export { Game };
