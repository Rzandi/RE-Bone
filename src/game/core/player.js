/* =========================================
   PLAYER
   ========================================= */

const Player = {
  hp: 0,
  maxHp: 0,
  mp: 0,
  maxMp: 0,
  exp: 0,
  nextExp: 50,
  level: 1,
  gold: 0,
  attr: { STR: 0, VIT: 0, INT: 0 },
  inventory: [],
  equip: { weapon: null, armor: null, acc: null },
  skills: [],
  passives: [],
  status: [],
  className: "",
  inspectMode: false,
  
  // Progression State
  evolutions: [], // IDs of unlocked evolutions
  classTree: null, // Tracks the base evolution tree
  activeSkills: [], // Active skill slots (Max 4)
  learnedSkills: [], // All skills learned
  multipliers: { str: 1, vit: 1, int: 1, hp: 1, mp: 1, def: 1, dmg: 1 },
  bonuses: { dodge: 0, lifesteal: 0, crit: 0 },
  baseStats: { STR: 0, VIT: 0, INT: 0 }, 

  // Defensive Mechanics
  invulnTurns: 0,
  hasPhylactery: false,
  summon: null,
  
  // Initialization
  init(clsKey) {
    const c = DB.CLASSES[clsKey] || DB.CLASSES["skeleton"];
    
    // Core Stats
    this.className = c.name;
    this.level = 1;
    this.exp = 0;
    this.nextExp = 50;
    this.gold = 0;
    this.attr = { ...c.attr };
    
    // Skills & Passives
    this.skills = [...c.skills]; 
    this.passives = [...c.passives]; 
    
    // Load Equipped Perks
    if (window.Ascension && Ascension.equippedPerks) {
        Ascension.equippedPerks.forEach(pid => {
            const cleanId = pid.replace("perk_", "");
            if (!this.passives.includes(cleanId)) {
                this.passives.push(cleanId);
            }
        });
    }
    
    // Inventory & Equipment
    this.inventory = [];
    this.equip = { weapon: null, armor: null, acc: null };
    this.lockedItems = []; 
    this.salvageMode = false;
    this.inspectMode = false;
    
    // Combat State
    this.hp = 0; 
    this.mp = 0;
    this.invulnTurns = 0;
    this.summon = null;
    this.status = []; 
    
    // Progression State
    this.evolutions = [];
    this.classTree = this.className.toLowerCase().replace(/ /g, "_");
    this.activeSkills = [];
    this.learnedSkills = [];
    this.multipliers = { str: 1, vit: 1, int: 1, hp: 1, mp: 1, def: 1, dmg: 1 };
    this.bonuses = { dodge: 0, lifesteal: 0, crit: 0 };
    this.baseStats = { STR: 0, VIT: 0, INT: 0 }; 
    
    // Skill Tree
    this.sp = 0;
    this.unlockedSkills = [];
    
    // Class Specifics
    this.hasPhylactery = this.passives.includes("phylactery");

    // Default Items
    this.addItem("rotten_meat");
    
    // Bind Properties (Optimization: Bind Once)
    this._bindProperties();
    
    // Initial Calc
    this.recalc();
    this.hp = this.maxHp;
    this.mp = this.maxMp;
  },
  
  // Reset
  reset() {
    const clsName = Object.keys(DB.CLASSES).find(k => DB.CLASSES[k].name === this.className) || "skeleton";
    this.init(clsName);
  },

  // Optimized Property Binding
  _bindProperties() {
    // Max HP
    Object.defineProperty(this, "maxHp", {
      get: function () {
        let b = 0;
        for (let k in this.equip)
          if (this.equip[k] && this.equip[k].hp) b += this.equip[k].hp;
        
        let total = CONSTANTS.BASE_HP + (this.attr.VIT * this.multipliers.vit) * CONSTANTS.HP_PER_VIT + b;

        if (window.Ascension && Ascension.upgrades["vit_plus"]) {
            total += (Ascension.upgrades["vit_plus"] * 5 * CONSTANTS.HP_PER_VIT);
        }

        if (window.Game && Game.isDaily) {
            const mods = window.Social ? Social.getDailyModifiers() : [];
            if (mods.find(m => m.id === 'glass_cannon')) total = Math.floor(total * 0.5);
        }
        
        return Math.floor(total * (this.multipliers.hp || 1));
      },
      configurable: true,
    });
    
    // Max MP
    Object.defineProperty(this, "maxMp", {
      get: function () {
        let equipMp = 0;
        for (let k in this.equip) {
          if (this.equip[k] && this.equip[k].mp) equipMp += this.equip[k].mp;
        }
        let total = CONSTANTS.BASE_MP + (this.attr.INT * this.multipliers.int) * CONSTANTS.MP_PER_INT + equipMp;
        
        if (window.Ascension && Ascension.upgrades["int_plus"]) {
            total += (Ascension.upgrades["int_plus"] * 5 * CONSTANTS.MP_PER_INT);
        }

        return Math.floor(total * (this.multipliers.mp || 1));
      },
      configurable: true,
    });
    
    // ATK
    Object.defineProperty(this, "atk", {
      get: function () {
        let b = 0;
        for (let k in this.equip)
          if (this.equip[k] && this.equip[k].atk) b += this.equip[k].atk;
        
        let total = Math.max(1, Math.floor((this.attr.STR * this.multipliers.str) * 1.5) + b);

        if (window.Ascension && Ascension.upgrades["str_plus"]) {
            total += Math.floor(Ascension.upgrades["str_plus"] * 5 * 1.5);
        }

        if (window.Game && Game.isDaily) {
            const mods = window.Social ? Social.getDailyModifiers() : [];
            if (mods.find(m => m.id === 'glass_cannon')) total = Math.floor(total * 1.5);
        }
        
        return Math.floor(total * (this.multipliers.dmg || 1));
      },
      configurable: true,
    });
    
    // DEF
    Object.defineProperty(this, "def", {
      get: function () {
        let base = Math.floor((this.attr.VIT * this.multipliers.vit) * 0.5);
        if (this.passives.includes("thick_skin")) base += 1;
        if (this.bonuses.flatDef) base += this.bonuses.flatDef;
        
        let equipDef = 0;
        for (let k in this.equip) {
          if (this.equip[k] && this.equip[k].def) equipDef += this.equip[k].def;
        }
        
        return Math.floor((base + equipDef) * (this.multipliers.def || 1));
      },
      configurable: true,
    });
    
    // STR
    Object.defineProperty(this.attr, "STR", {
      get: function () {
        let cls = DB.CLASSES[Player.className.toLowerCase()] || DB.CLASSES["skeleton"];
        let base = (Player.baseStats.STR > 0) ? Player.baseStats.STR : cls.attr.STR;
        base += (Player.level - 1);
        
        if (window.Ascension && Ascension.upgrades["str_plus"]) {
            base += (Ascension.upgrades["str_plus"] * 5);
        }
        
        let bonus = base * (Player.multipliers.str - 1);
        return Math.floor(base + bonus);
      },
      configurable: true,
    });
    
    // VIT
    Object.defineProperty(this.attr, "VIT", {
      get: function () {
        let cls = DB.CLASSES[Player.className.toLowerCase()] || DB.CLASSES["skeleton"];
        let base = (Player.baseStats.VIT > 0) ? Player.baseStats.VIT : cls.attr.VIT;
        base += (Player.level - 1);
        
        if (window.Ascension && Ascension.upgrades["vit_plus"]) {
            base += (Ascension.upgrades["vit_plus"] * 5);
        }
        
        let bonus = base * (Player.multipliers.vit - 1);
        return Math.floor(base + bonus);
      },
      configurable: true,
    });
    
    // INT
    Object.defineProperty(this.attr, "INT", {
      get: function () {
        let cls = DB.CLASSES[Player.className.toLowerCase()] || DB.CLASSES["skeleton"];
        let base = (Player.baseStats.INT > 0) ? Player.baseStats.INT : cls.attr.INT;
        base += (Player.level - 1);
        
        if (window.Ascension && Ascension.upgrades["int_plus"]) {
            base += (Ascension.upgrades["int_plus"] * 5);
        }
        
        let bonus = base * (Player.multipliers.int - 1);
        return Math.floor(base + bonus);
      },
      configurable: true,
    });
  },
  
  // Take Damage Logic
  takeDamage(amount) {
      if (this.invulnTurns > 0) {
          if (window.Events) Events.emit("log_combat", "Invulnerable! 0 dmg");
          return;
      }
      
      this.hp -= amount;
      if (this.hp <= 0) {
          this.hp = 0;
          if (window.Game) Game.handleDefeat(); 
      }
      
      // Flash red? handled by event usually
      if(window.UI && UI.fxDmg) UI.fxDmg(amount, "phys");
  },

  recalc() {
    // Reset multipliers/bonuses
    this.multipliers = { str: 1, vit: 1, int: 1, hp: 1, mp: 1, def: 1, dmg: 1 };
    this.bonuses = { dodge: 0, lifesteal: 0, crit: 0 };
    
    // Apply Evolutions
    if (window.EVOLUTIONS && this.evolutions) {
        for (let tier in EVOLUTIONS) {
            EVOLUTIONS[tier].forEach(evo => {
                if (this.evolutions.includes(evo.id)) {
                    evo.effect(this);
                }
            });
        }
    }

    // Passives
    this.passives.forEach(pid => {
        const p = DB.PASSIVES[pid];
        if (p && p.stats) {
            if (p.stats.def) {
                if (!this.bonuses.flatDef) this.bonuses.flatDef = 0;
                this.bonuses.flatDef += p.stats.def;
            }
            if (p.stats.atk) this.multipliers.dmg += p.stats.atk;
            if (p.stats.hpMult) this.multipliers.hp += p.stats.hpMult;
            if (p.stats.magRes) this.multipliers.magRes = (this.multipliers.magRes || 0) + p.stats.magRes;
            
            if (p.stats.dodge) this.bonuses.dodge += (p.stats.dodge / 100);
            if (p.stats.crit) this.bonuses.crit += (p.stats.crit / 100);
            if (p.stats.critDmg) this.bonuses.critDmg = (this.bonuses.critDmg || 0) + p.stats.critDmg;
            if (p.stats.reflect) this.bonuses.reflect = (this.bonuses.reflect || 0) + p.stats.reflect;
            if (p.stats.hpRegen) this.bonuses.hpRegen = (this.bonuses.hpRegen || 0) + p.stats.hpRegen;
            if (p.stats.immuneStun) this.bonuses.immuneStun = true;
            
            if (p.stats.gold) this.multipliers.gold = (this.multipliers.gold || 1) + p.stats.gold;
            if (p.stats.exp) this.multipliers.exp = (this.multipliers.exp || 1) + p.stats.exp;
        }
    });

    if (this.hp > this.maxHp) this.hp = this.maxHp;
  },
  
  getDamageBonus() {
    let bonus = 0;
    if (this.passives.includes("undead_mastery")) {
      let floorsDescended = 100 - Game.floor;
      bonus += Math.floor(floorsDescended / 10);
    }
    return bonus;
  },

  getSetBonuses() {
    let equipped = [];
    for (let slot in this.equip) {
      if (this.equip[slot] && this.equip[slot].setBonus) {
        equipped.push(this.equip[slot].setBonus);
      }
    }
    
    let sets = {};
    equipped.forEach(set => {
      sets[set] = (sets[set] || 0) + 1;
    });
    
    let bonuses = {
      lifesteal: 0,
      int: 0,
      dodge: 0,
      hpPerKill: 0,
      spellDamage: 0,
      phaseOnDodge: false
    };
    
    for (let setName in sets) {
      let count = sets[setName];
      if (typeof SET_BONUSES !== 'undefined' && SET_BONUSES[setName]) {
        if (count >= 2) Object.assign(bonuses, SET_BONUSES[setName].two);
        if (count >= 3) Object.assign(bonuses, SET_BONUSES[setName].three);
      }
    }
    
    return bonuses;
  },
  
  getUniqueEffects() {
    let effects = {
      lifesteal: 0,
      dodge: 0,
      autoRevive: false,
      extraTurn: false,
      mpOnEnemySkill: 0,
      rageLowHp: false,
      hpPerKill: 0,
      reduceMpCost: 0
    };
    
    for (let slot in this.equip) {
      if (this.equip[slot] && this.equip[slot].uniqueEffect) {
        let effect = this.equip[slot].uniqueEffect;
        
        if (effect === "lifesteal_10") effects.lifesteal += 0.10;
        if (effect === "dodge_15") effects.dodge += 0.15;
        if (effect === "auto_revive") effects.autoRevive = true;
        if (effect === "extra_turn") effects.extraTurn = true;
        if (effect === "mp_on_enemy_skill") effects.mpOnEnemySkill = 3;
        if (effect === "rage_low_hp") effects.rageLowHp = true;
        if (effect === "hp_per_kill") effects.hpPerKill += 3;
        if (effect === "reduce_mp_cost") effects.reduceMpCost = 1;
      }
    }
    
    if (this.bonuses.dodge) effects.dodge = (effects.dodge || 0) + this.bonuses.dodge;
    if (this.bonuses.lifesteal) effects.lifesteal = (effects.lifesteal || 0) + this.bonuses.lifesteal;
    
    return effects;
  },

  mutate(opt) {
      this.className = opt.name;
      
      if (this.baseStats.STR === 0) {
          const cls = DB.CLASSES[this.className.toLowerCase()] || DB.CLASSES["skeleton"];
          this.baseStats.STR = cls.attr.STR;
          this.baseStats.VIT = cls.attr.VIT;
          this.baseStats.INT = cls.attr.INT;
      }
      
      this.baseStats.STR += opt.stats.str;
      this.baseStats.VIT += opt.stats.vit;
      this.baseStats.INT += opt.stats.int;
      
      if (opt.sprite) {
        this.spriteOverride = opt.sprite;
      }
      
      if (opt.skills && opt.skills.length > 0) {
          opt.skills.forEach(s => {
              if (!this.learnedSkills.includes(s)) this.learnedSkills.push(s);
          });
          this.activeSkills = [...opt.skills];
          if(window.UI && UI.log) UI.log("Class Skills Equipped!", "log item");
      }
      
      if (opt.passivePool && opt.passivePool.length > 0) {
          const rand = opt.passivePool[Math.floor(Math.random() * opt.passivePool.length)];
          if (!this.passives.includes(rand)) {
              this.passives.push(rand);
              const pName = DB.PASSIVES[rand] ? DB.PASSIVES[rand].name : rand;
              if(window.UI && UI.log) UI.log(`Learned Passive: ${pName}!`, "log passive");
          }
      }
      
      this.recalc();
  },
  
  onAttack(target) {
    if (this.passives.includes("rot_touch") && Math.random() < 0.3) {
      if(window.Combat) Combat.applyStatus(target, { id: "poison", turn: 3, val: 2 });
      if(window.UI && UI.log) UI.log("Passive: Rot Touch!", "log passive");
    }
    if (this.passives.includes("mana_leech")) {
      this.mp = Math.min(this.mp + 1, this.maxMp);
    }
  },
  
  learnSkill(id) {
      if (this.learnedSkills.includes(id)) {
          if(window.UI) UI.toast("Skill already learned!");
          return false;
      }
      
      if (!this.checkSkillReqs(id)) {
          if(window.UI) UI.toast("Stats too low to learn!");
          return false;
      }
      
      this.learnedSkills.push(id);
      
      if (this.activeSkills.length < 4) {
          this.activeSkills.push(id);
          if(window.UI) UI.toast("Skill Learned & Equipped!");
          return true;
      }
      
      if(window.UI) UI.toast("Skill Learned (Added to Library)!");
      return true;
  },
  
  checkSkillReqs(id) {
      const s = DB.SKILLS[id];
      if (!s || !s.req) return true;
      
      const stats = this.getStats(); 
      if (s.req.str && stats.str < s.req.str) return false;
      if (s.req.vit && stats.vit < s.req.vit) return false;
      if (s.req.int && stats.int < s.req.int) return false;
      return true;
  },
  
  equipSkill(id, slotIdx) {
      if (!this.learnedSkills.includes(id)) return false;
      if (slotIdx >= 0 && slotIdx < 4) {
          this.activeSkills[slotIdx] = id;
          if(window.UI && UI.log) UI.log(`Equipped ${DB.SKILLS[id].name}`, "log item");
          return true;
      }
      return false;
  },
  
  unequipSkill(slotIdx) {
    if (this.activeSkills[slotIdx]) {
      this.activeSkills.splice(slotIdx, 1);
      if(window.UI && UI.log) UI.log("Skill Unequipped", "log item");
    }
  },
  
  getStats() {
      return {
          str: this.attr.STR,
          vit: this.attr.VIT, // Use getters directly
          int: this.attr.INT
      };
  },

  addItem(id) {
    const t = DB.ITEMS[id];
    if (t) {
      this.inventory.push({ ...t, id });
      if(window.UI && UI.log) UI.log(`Dapat: ${t.name}`, "log item");
      if(window.SoundManager) SoundManager.play("loot");
    }
  },
  
  handleItemClick(idx) {
    if (this.salvageMode) {
        if (confirm(`Salvage ${this.inventory[idx].name} for materials?`)) {
            this.salvageItem(idx);
        }
    }
    else if (this.inspectMode) {
        if(window.Gemini) Gemini.generateLore(this.inventory[idx].name);
    }
    else this.useItem(idx);
  },
  
  useItem(idx) {
    const it = this.inventory[idx];
    
    // Skill Book
    if (it.slot === "skill_book") {
        if (this.learnSkill(it.skillId)) {
            this.inventory.splice(idx, 1);
            if(window.UI && UI.log) UI.log(`Read ${it.name}`, "log item");
        }
        this.recalc();
        if(window.UI) { UI.renderInv(); UI.refresh(); }
        return;
    }
    
    // Consumable
    if (it.slot === "con") {
      if (it.val) this.hp = Math.min(this.hp + it.val, this.maxHp);
      if (it.mp) this.mp = Math.min(this.mp + it.mp, this.maxMp);
      
      if (it.buff) {
          this.status.push({ ...it.buff }); 
          let buffName = it.buff.id.replace("buff_", "").toUpperCase();
          if(window.UI && UI.log) UI.log(`Applied ${buffName}!`, "log item");
      }
      
      this.inventory.splice(idx, 1);
      if(window.UI && UI.log) UI.log(`Pakai ${it.name}`, "log item");
    } else {
      this.inventory.splice(idx, 1);
      if (this.equip[it.slot]) this.inventory.push(this.equip[it.slot]);
      this.equip[it.slot] = it;
      if(window.UI && UI.log) UI.log(`Equip ${it.name}`, "log item");
    }
    this.recalc();
    if(window.UI) { UI.renderInv(); UI.refresh(); }
  },

  salvageItem(idx) {
    if (this.inventory[idx] && window.Crafting) {
      Crafting.salvage(idx);
    }
  },
  
  toggleInspect() {
    this.inspectMode = !this.inspectMode;
    const txt = document.getElementById("inv-mode-text");
    if(txt) txt.innerText = this.inspectMode ? "MODE: ✨ ORACLE" : "MODE: USE/EQUIP";
  },
  
  quickEquip(idx) {
    const it = this.inventory[idx];
    
    if (it.slot === "con") {
      this.useItem(idx);
      return;
    }
    
    this.inventory.splice(idx, 1);
    if (this.equip[it.slot]) {
      this.inventory.push(this.equip[it.slot]);
    }
    this.equip[it.slot] = it;
    
    if(window.UI && UI.log) UI.log(`⚡ Quick-equipped ${it.name}`, "log item");
    this.recalc();
    if(window.UI) { UI.renderInv(); UI.refresh(); }
  },
  
  autoSortInventory() {
    this.inventory.sort((a, b) => {
      const rarityValues = CONSTANTS.RARITY_VALUES;
      return (rarityValues[b.rarity] || 0) - (rarityValues[a.rarity] || 0);
    });
    if(window.UI) {
        UI.renderInv();
        UI.log("📦 Inventory sorted by rarity", "log system");
    }
  },
  
  toggleLock(item) {
    const itemKey = `${item.name}_${item.rarity}`;
    const idx = this.lockedItems.indexOf(itemKey);
    if (idx > -1) {
      this.lockedItems.splice(idx, 1);
      if(window.UI) UI.log("🔓 Item unlocked", "log system");
    } else {
      this.lockedItems.push(itemKey);
      if(window.UI) UI.log("🔒 Item locked", "log system");
    }
    if(window.UI) UI.renderInv();
  },
  
  isLocked(item) {
    const itemKey = `${item.name}_${item.rarity}`;
    return this.lockedItems.includes(itemKey);
  },

  unequip(slot) {
    if (this.equip[slot]) {
        this.inventory.push(this.equip[slot]);
        if(window.UI) UI.log(`Unequipped ${this.equip[slot].name}`, "log item");
        this.equip[slot] = null;
        this.recalc();
        if(window.UI) { UI.renderInv(); UI.refresh(); }
    }
  },
};

window.Player = Player;
