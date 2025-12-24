/* =========================================
   GAME CORE (Refactored v31.0)
   Encapsulating State & Logic
   ========================================= */

const Game = {
  // Encapsulated State
  state: {
    floor: 1,
    progress: 0,
    isDaily: false,
    bossRush: { active: false, index: 0, bosses: [], startHp: 0 },
    stats: { kills: 0, damageDealt: 0 }
  },
  
  // Runtime Loops (Private-ish)
  _combatLoop: null,
  _exploreLoop: null,
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
    if (window.GameStore) {
        window.GameStore.state.activePanel = 'title';
    }
  },

  checkFeatures() {
    // Feature Flags for dependencies
    this.hasAscension = !!window.Ascension;
    this.hasSocial = !!window.Social;
    this.hasVFX = !!window.VFX;
  },

  startNewGame() {
    Player.init("skeleton");
    this.state.floor = 1;
    this.state.progress = 0;
    this.state.isDaily = false;
    this.state.bossRush.active = false;
    
    // Check Daily
    if (this.hasSocial && Social.isDailyChallenge()) {
      this.state.isDaily = true;
      Social.applyDailyModifiers();
      Events.emit("log", "🌞 DAILY CHALLENGE ACTIVE!");
    }
    
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
    if(window.GameStore) window.GameStore.state.activePanel = "menu-view"; // Sync Panel
    if(window.GameStore) window.GameStore.state.currAction = "idle"; // Sync Action
    this.currAction = "idle";
    UI.showPanel("menu-view");
  },

  exploreState() {
    this.stopLoops();
    UI.showPanel("combat");
    this.currAction = "exploring";
    if(window.GameStore) window.GameStore.state.currAction = "exploring"; // SYNC TO STORE
    
    this.enemy = null;
    
    // Clear Combat UI
    if(window.GameStore && window.GameStore.state.combat) {
        window.GameStore.state.combat.enemy = null;
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

    UI.setButtons(btns);

    
    // MANUAL EXPLORE: No setInterval
    Events.emit("log", `Floor ${this.state.floor} - Explore to find enemies...`);
    Events.emit("progress", this.state.progress);
  },

  encounterRandom() {
    this.stopLoops();
    
    const roll = Math.random();
    
    // 5% Sanctuary (Save Point)
    if (roll < 0.05) {
        this.sanctuaryState();
        return;
    }

    // 10% Merchant
    if (roll < 0.15) {
        this.merchantState();
        return;
    }
    
    // 85% Combat
    this.combatState();
  },

  encounterBoss() {
    this.stopLoops();
    this.combatState(true);
  },

  combatState(isBoss = false, isElite = false) {
    this.stopLoops();
    this.currAction = "combat";
    if(window.GameStore) window.GameStore.state.currAction = "combat"; // SYNC TO STORE
    
    // Generate Enemy
    if (isBoss) {
        this.enemy = this.generateBoss();
    } else {
        this.enemy = this.generateEnemy(isElite);
    }
    
    // Delegate
    if (window.CombatManager) {
        CombatManager.startCombat(this.enemy, isBoss, isElite);
    }
  },
  
  merchantState() {
    this.stopLoops();
    this.currAction = "merchant";
    if(window.GameStore) window.GameStore.state.currAction = "merchant"; // SYNC TO STORE
    UI.showPanel("shop"); // Added explicit panel show
    Events.emit("log", "You found a travelling Merchant!");
    if(window.Merchant) Merchant.generateStock(this.state.floor);
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
        if(window.GameStore) window.GameStore.state.previousPanel = 'combat';
    }
    
    this.currAction = "inventory";
    if(window.GameStore) window.GameStore.state.currAction = "inventory";
    UI.showPanel("inventory");
  },
  
  // Sanctuary: The ONLY place to save manually
  sanctuaryState() {
      this.stopLoops();
      this.currAction = "sanctuary"; 
      if(window.GameStore) window.GameStore.state.currAction = "sanctuary";
      
      Events.emit("log_boss", "✨ SANCTUARY FOUND ✨");
      Events.emit("log", "Safe haven. Heal or Save?");
      
      UI.setButtons([
          { txt: "💖 HEAL (FULL)", col: "var(--c-green)", fn: () => this.sanctuaryHeal() },
          { txt: "💾 SAVE GAME", col: "var(--c-blue)", fn: () => { this.saveGame(); } },
          null,
          { txt: "LEAVE", fn: () => this.exploreState() }
      ]);
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
      const RESURRECT_COST = 500 * this.state.floor; // Increases per floor
      Events.emit("log_boss", "💀 YOU HAVE DIED 💀");
      
      // Stop logic
      this.stopLoops();

      // Check Gold
      const canRez = Player.gold >= RESURRECT_COST;
      
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
      
      // Force reload option just in case
      buttons.push({
          txt: "🔄 RELOAD APP",
          fn: () => this.permadeath(true)
      });
      
      if(!canRez) {
          Events.emit("log", "Not enough gold to resurrect...");
      } else {
          Events.emit("log", `Resurrect for ${RESURRECT_COST} gold?`);
      }
      
      UI.setButtons(buttons);
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
      Events.emit("log_boss", "YOUR SOUL FADES...");
      if(window.SaveManager) SaveManager.clearSave(); // Don't wipe meta!
      
      setTimeout(() => {
          if(forceReload) {
              window.location.reload();
          } else {
              // Soft Restart
              this.startNewGame();
              Events.emit("log_boss", "🆕 NEW CYCLE BEGINS");
              UI.showPanel("menu-view");
          }
      }, 300); // Faster transition
  },

  // Risky Rest from Menu
  restState() {
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
      UI.showPanel("shop-ascension");
  },

  worldMapState() {
      this.stopLoops();
      this.currAction = "world_map";
      if(window.GameStore) window.GameStore.state.currAction = "world_map";
      
      Events.emit("log_boss", "🗺️ THE WORLD OPENS BEFORE YOU...");
      UI.showPanel("world_map");
  },

  // v34.0: Enter a specific Realm (Generates Map)
  enterRealm(realmId) {
      this.stopLoops();
      
      // Lazy Load NodeMap Logic if needed? Already imported/global?
      // Assuming NodeMap is global or we import it. 
      // Ideally Game.js shouldn't depend on View logic, but let's assume `import { NodeMap }` or global.
      // WE NEED TO IMPORT IT. For now, let's assume logic is in store or helper.
      // Actually, NodeMapPanel calls NodeMap.generateMap on mount.
      
      if(window.GameStore) {
          window.GameStore.state.world.activeRealm = realmId;
          
          // Polish: Play Sound / Ambience
          // if(window.SoundManager) window.SoundManager.playAmbience(realmId);
          Events.emit("log_boss", `You step into the ${realmId.replace('_', ' ').toUpperCase()}...`);
          
          // Trigger UI switch
          UI.showPanel("node_map");
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
              if (window.EventManager) {
                  window.EventManager.triggerEvent(node);
              } else {
                  Events.emit("log_item", "❓ Event System not ready.");
                  setTimeout(() => UI.showPanel("node_map"), 1000);
              }
              break;
          default:
              this.combatState();
      }
  },

    applyBiomeEffect(biome) {
        if(!window.Player || !biome || !biome.effect) return;

        const type = biome.effect;
        const name = biome.name;
        let log = `Zone: ${name} (${type})`;

        switch(type) {
            case 'Poison': 
                Player.takeDamage(5); 
                log += " -5 HP (Toxic)";
                break;
            case 'Heal': 
                Player.heal(10);
                log += " +10 HP (Blessed)";
                break;
            case 'Heat':
                Player.takeDamage(3);
                log += " -3 HP (Heat)";
                break;
            case 'Cold':
                Player.takeDamage(2);
                break;
            case 'Fog':
                log += " (Low Visibility)";
                break;
            default:
                break;
        }
        Events.emit("log", log);
    },

  // v34.0: Helper for EventManager to return
  returnToMap() {
      // Clear event state? Not strictly needed if overwritten
      if(window.GameStore) window.GameStore.state.event = null;
      UI.showPanel("node_map");
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
          lootLog += `, +${goldReward} G`;
          
          
          if(window.LootManager) {
              // Standard Loot
              itemDrop = LootManager.dropLoot(this.enemy);
              
              // v35.0: TRAITOR BOSS UNLOCKS & DROPS
              if (this.enemy.unlockClass) {
                  const unlockId = this.enemy.unlockClass;
                  const store = window.GameStore;
                  
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
                if (window.LootManager) {
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
         if (window.LEGENDARY_ITEMS && LEGENDARY_ITEMS[dropId]) {
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
              if(window.ProgressionManager) ProgressionManager.levelUpState();
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
          if (window.GameStore && window.GameStore.state.world.activeRealm) {
               UI.showPanel("node_map");
          } else {
               this.exploreState();
          }
      }, 800);
  },
  
  checkAscensionVictory() {
    // v34.0: Floor 100 triggers World Map, not just "Victory"
    if (this.enemy.isBoss && this.state.floor >= 100) { 
        Events.emit("log_boss", "🎉 FLOOR 100 CONQUERED!");
        // First win achievement
        if (window.Achievements) Achievements.unlock('floor_100');
        
        // Unlock World Map access
        this.worldMapState();
        return true; // Stop exploration
    }
    
    // Normal Boss win
    if (this.enemy.isBoss) {
        this.nextFloor();
        return false; // let handleWin continue to exploreState (BUT we just called nextFloor?)
        // Wait, logic flaw in original. If boss dead -> next floor -> explore.
    }
    return false;
  },
  
  nextFloor() {
      this.state.floor++;
      this.state.progress = 0;
      
      // Clear Logs (v31.2 Request)
      if(window.GameStore) window.GameStore.state.logs = [];
      
      Events.emit("log_boss", `Welcome to Floor ${this.state.floor}...`);
      
      // v37.0 Phase 4: Update economy on floor change
      if (window.EconomyManager) {
        window.EconomyManager.onFloorChange();
      }
      
      // ROGUELIKE: No auto-save on floor change. Must find Sanctuary.
      // this.saveGame();
  },

  // ============================
  // BOSS RUSH MODE
  // ============================
  
  bossRushStart() {
    UI.showPanel("class");
    const cont = document.getElementById("class-list");
    if(cont) {
        cont.innerHTML = `
          <div style="text-align:center; padding:20px;">
            <h2 style="color:var(--c-gold)">⚔️ BOSS RUSH ⚔️</h2>
            <p>Fight all 5 bosses consecutively!</p>
            <p>+20 HP, +10 MP between fights</p>
            <p style="color:var(--c-gold)">Reward: Legendary Item</p>
          </div>
        `;
    }
    
    UI.setButtons([
      null,
      { txt: "START", col: "var(--c-gold)", fn: () => this.bossRushInit() },
      null,
      { txt: "BACK", fn: () => this.menuState() },
    ]);
  },
  
  bossRushInit() {
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
    Events.emit("log_boss", `Boss ${this.state.bossRush.index + 1}/5: Floor ${this.state.floor}`);
    this.combatState(true); // IsBoss = true
  },
  
  bossRushVictory() {
    this.state.bossRush.active = false;
    Events.emit("log_boss", "🏆 BOSS RUSH COMPLETE!");
    Player.gold += 500;
    
    if(window.LootManager) {
        const legends = LootManager.getLegendaryItems();
        // Give 2 random legends
        for(let i=0; i<2; i++) {
             if(legends.length > 0) {
                 const item = legends[Math.floor(Math.random()*legends.length)];
                 Player.inventory.push({...item});
                 Events.emit("log_item", `Reward: ${item.name}`);
             }
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
  },
  
  getFloorType() {
      // Return biome info if needed
      return "dungeon";
  },
  
  generateEnemy(isElite = false) {
      // v36.2: Biome-Specific Logic
      let pool = [];
      const worldState = window.GameStore ? window.GameStore.state.world : null;
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
      if (window.gameStore && window.gameStore.state.meta.ascensionLevel) {
          ascMult += (window.gameStore.state.meta.ascensionLevel * 0.2); // +20% per cycle
      }
      
      const totalMult = rankMult * rarMult * ascMult * (isElite ? 1.5 : 1.0);
      
      enemy.maxHp = Math.floor((enemy.maxHp || enemy.hp) * totalMult);
      enemy.hp = enemy.maxHp;
      enemy.atk = Math.floor(enemy.atk * totalMult);
      enemy.exp = Math.floor(enemy.exp * totalMult * (isElite ? 2 : 1)); 
      
      if(ascMult > 1.0) {
          enemy.name = `💀${window.gameStore.state.meta.ascensionLevel} ${enemy.name}`; 
      }
      
      return enemy;
  },
  
  generateBoss() {
      // v36.3: Realm Boss Priority
      const store = window.GameStore;
      if (store && store.state.world.activeRealm) {
          const rId = store.state.world.activeRealm;
          if (window.REALMS && REALMS[rId] && REALMS[rId].boss) {
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
    // v34.0: Save World State
    let worldData = {};
    if(window.GameStore) {
        worldData = JSON.parse(JSON.stringify(window.GameStore.state.world));
    }

    localStorage.setItem(
      CONSTANTS.SAVE_KEY,
      JSON.stringify({
        p: Player,
        w: { floor: this.state.floor, prog: this.state.progress },
        v34: worldData // specific v34 data
      })
    );
    
    // v35.0: Ensure Meta (Unlocks) is saved
    if(window.SaveManager) window.SaveManager.saveMeta();
    
    Events.emit("log_item", "Saved.");
  },
  
  loadGame() {
    try {
        const d = localStorage.getItem(CONSTANTS.SAVE_KEY);
        if (d) {
          const data = JSON.parse(d);
          Object.assign(Player, data.p);
          this.state.floor = data.w.floor || 1;
          this.state.progress = data.w.prog || 0;
          
          // v34.0: Restore World
          if(data.v34 && window.GameStore) {
               Object.assign(window.GameStore.state.world, data.v34);
          }
          
          // v35.0: Restore Meta
          if(window.SaveManager) window.SaveManager.loadMeta();

          // v35.2: Sync Relics back to Store (Fix Persistence Bug)
          if(window.GameStore) {
              // Ensure Player.relics is synced to reactive store
              if(Player.relics) {
                  window.GameStore.state.relics = Player.relics;
              } else {
                   window.GameStore.state.relics = [];
                   Player.relics = window.GameStore.state.relics;
              }
          }

          if(Player.recalc) Player.recalc();

          // v34.0: Intelligent Resume
          if (window.GameStore && window.GameStore.state.world.activeRealm) {
              // We are in a realm, go to Node Map
              this.stopLoops();
              this.currAction = "node_map"; // internal state sync
              setTimeout(() => UI.showPanel("node_map"), 100);
          } else {
              this.exploreState();
          }
        }
    } catch(e) {
        console.error("Save Corrupt", e);
        this.startNewGame();
    }
  },
  
  skillState() {
      if (this.currAction === 'combat') {
          UI.showPanel("skill-selector");
      } else {
          UI.showPanel("skills");
      }
  },
  
};


window.Game = Game;
