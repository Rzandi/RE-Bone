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
    
    // Prepare UI Buttons
    const btns = [];
    
    // [ EXPLORE ] Button (Manual)
    if (!canNext) {
        btns.push({ txt: "🔍 EXPLORE", col: "var(--c-green)", fn: () => this.encounterRandom() });
    } else {
        // Boss / Next Floor
        btns.push({ txt: "⚔️ BOSS", col: "var(--c-red)", fn: () => this.encounterBoss() });
    }
    
    // Menu / Item
    btns.push({ txt: "🎒 ITEM", fn: () => this.invState() });
    btns.push({ txt: "📜 MENU", fn: () => this.menuState() });
    btns.push(null); // Spacer

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

  combatState(isBoss = false) {
    this.stopLoops();
    this.currAction = "combat";
    if(window.GameStore) window.GameStore.state.currAction = "combat"; // SYNC TO STORE
    
    // Generate Enemy
    if (isBoss) {
        this.enemy = this.generateBoss();
    } else {
        this.enemy = this.generateEnemy();
    }
    
    // Delegate
    if (window.CombatManager) {
        CombatManager.startCombat(this.enemy, isBoss);
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
      if (Player.gold >= RESURRECT_COST) {
          Events.emit("log", `Resurrect for ${RESURRECT_COST} Gold?`);
          
          UI.setButtons([
              { 
                  txt: `💸 RESURRECT (${RESURRECT_COST}G)`, 
                  col: "var(--c-gold)", 
                  fn: () => this.resurrect(RESURRECT_COST) 
              },
              null,
              { 
                  txt: "💀 ACCEPT DEATH", 
                  col: "#f00", 
                  fn: () => this.permadeath() 
              },
              null
          ]);
      } else {
          Events.emit("log", "Not enough gold to resurrect...");
          setTimeout(() => this.permadeath(), 2000);
      }
  },
  
  resurrect(cost) {
      Player.gold -= cost;
      Player.hp = Math.floor(Player.maxHp * 0.5); // 50% HP Revive
      Events.emit("log_item", `Resurrected! -${cost} Gold`);
      Events.emit("log", "Get up, Skeleton!");
      
      // Auto-save on Resurrection to fail-safe the gold loss
      this.saveGame(); 
      
      setTimeout(() => {
          this.exploreState();
      }, 1000);
  },
  
  permadeath() {
      Events.emit("log_boss", "YOUR SOUL FADES...");
      if(window.SaveManager) SaveManager.wipeSave();
      
      setTimeout(() => {
          // Reset Game
          window.location.reload(); 
      }, 3000);
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

  // ============================
  // WIN/LOSE LOGIC
  // ============================
  
  handleWin(healAmount = 0) {
      if(!this.enemy) return;

      try {
          // Loot Calculation
          let lootLog = `LOOT: +${this.enemy.exp} XP`;
          let itemDrop = null;
          
          // GOLD REWARD (New v31.1)
          // Base Gold = EXP * 0.5 + Floor * 2. Randomized +/- 20%
          let baseGold = Math.floor(this.enemy.exp * 0.5) + (this.state.floor * 2);
          let goldReward = Math.floor(baseGold * (0.8 + Math.random() * 0.4));
          if (goldReward < 1) goldReward = 1;
          
          Player.gold += goldReward;
          lootLog += `, +${goldReward} G`;
          
          if(window.LootManager) {
              itemDrop = LootManager.dropLoot(this.enemy);
          }

          // HP Per Kill
          let setBonus = Player.getSetBonuses();
          let uniqueEffects = Player.getUniqueEffects();
          let totalHpPerKill = (setBonus.hpPerKill || 0) + (uniqueEffects.hpPerKill || 0);
          if (totalHpPerKill > 0) {
            Player.hp = Math.min(Player.hp + totalHpPerKill, Player.maxHp);
            lootLog += `, +${totalHpPerKill} HP`;
          }
          
          // Boss Rush Logic
          if (this.state.bossRush.active) {
              this.state.bossRush.index++;
              setTimeout(() => this.bossRushNext(), 1500);
              return;
          }
      
          // Gain EXP
          Player.exp += this.enemy.exp;
          if (Player.exp >= Player.nextExp) {
            Player.level++;
            // if(window.UI) UI.showLevelUpEffect(Player.level); // Let loop handle log
            Player.exp = Player.exp - Player.nextExp; // Handle overflow correctly
            Player.nextExp = Math.floor(Player.nextExp * 1.5);
            
            // Award SP
            Player.sp = (Player.sp || 0) + 1;
            lootLog += ` | 🆙 LEVEL UP!`;
            
            if(window.ProgressionManager) ProgressionManager.levelUpState();
             // Important: Level Up might interrupt explore loop return? 
             // Logic says if Level Up Open, wait?
             // But let's log first.
          }

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
      setTimeout(() => this.exploreState(), 800);
  },
  
  checkAscensionVictory() {
    if (this.enemy.isBoss && this.state.floor === 10) { 
        Events.emit("log_boss", "🎉 FLOOR 10 CONQUERED!");
        // First win achievement
        if (window.Achievements) Achievements.unlock('floor_1');
        
        if (this.hasAscension) {
            UI.showPanel("victory");
            // Show ascension button
        }
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
  
  generateEnemy() {
      const pool = DB.ENEMIES.filter(e => e.floor <= this.state.floor);
      const base = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : DB.ENEMIES[0];
      const enemy = JSON.parse(JSON.stringify(base)); 

      // --- RANK & RARITY SYSTEM ---
      const ranks = ["E", "D", "C", "B", "A", "S"];
      const rarities = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
      
      // Random Rank (Weighted towards lower)
      let rRoll = Math.random();
      let rankIdx = 0;
      if (rRoll < 0.5) rankIdx = 0; // 50% E
      else if (rRoll < 0.75) rankIdx = 1; // 25% D
      else if (rRoll < 0.90) rankIdx = 2; // 15% C
      else if (rRoll < 0.96) rankIdx = 3; // 6% B
      else if (rRoll < 0.99) rankIdx = 4; // 3% A
      else rankIdx = 5; // 1% S
      
      const rank = ranks[rankIdx];
      const rankMult = [0.8, 1.0, 1.2, 1.5, 2.0, 3.0][rankIdx];
      
      // Random Rarity
      let qRoll = Math.random();
      let rarIdx = 0;
      if (qRoll < 0.6) rarIdx = 0;
      else if (qRoll < 0.85) rarIdx = 1;
      else if (qRoll < 0.95) rarIdx = 2;
      else if (qRoll < 0.99) rarIdx = 3;
      else rarIdx = 4;
      
      const rarity = rarities[rarIdx];
      const rarMult = [1.0, 1.2, 1.5, 2.0, 3.0][rarIdx];
      
      // Apply States
      enemy.name = `[${rank}] ${enemy.name} (${rarity})`;
      enemy.rank = rank;
      enemy.rarity = rarity;
      enemy.maxHp = Math.floor((enemy.maxHp || enemy.hp) * rankMult * rarMult);
      enemy.hp = enemy.maxHp;
      enemy.atk = Math.floor(enemy.atk * rankMult * rarMult);
      enemy.exp = Math.floor(enemy.exp * rankMult * rarMult);
      
      return enemy;
  },
  
  generateBoss() {
      const boss = DB.BOSSES ? DB.BOSSES[this.state.floor] : null;
      if(boss) return JSON.parse(JSON.stringify(boss));
      
      return { ...DB.ENEMIES[0], name: "Guardian", isBoss: true, maxHp: 50*this.state.floor, hp: 50*this.state.floor, exp: 100 };
  },

  saveGame() {
    localStorage.setItem(
      CONSTANTS.SAVE_KEY,
      JSON.stringify({
        p: Player,
        w: { floor: this.state.floor, prog: this.state.progress },
      })
    );
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
          
          if(Player.recalc) Player.recalc();
          this.exploreState();
        }
    } catch(e) {
        console.error("Save Corrupt", e);
        this.startNewGame();
    }
  },
  
  skillState() {
      if (this.currAction === 'combat') {
          UI.showPanel("combat_skills");
      } else {
          UI.showPanel("skills");
      }
  },
  
  invState() {
     UI.showPanel("inventory");
     UI.setButtons([
       { txt: "✨ ORACLE", col: "var(--c-ai)", fn: () => Player.toggleInspect() },
       null, null,
       { txt: "BACK", fn: () => { Player.inspectMode = false; this.combatState ? this.exploreState() : this.menuState(); } }
     ]);
     UI.renderInv();
  }
};

window.Game = Game;
