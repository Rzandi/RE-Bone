/* =========================================
   ASCENSION MANAGER (v30.0)
   Handles New Game+, Soul Shards, and Permanent Upgrades
   ========================================= */

export const Ascension = {
  // Data
  level: 0,       // Current NG+ Tier (0 = base game)
  shards: 0,      // Currency for Soul Forge
  upgrades: {},   // Purchased permanent buffs
  upgrades: {},   // Purchased permanent buffs
  equippedPerks: [], // v30.4 Equipped Passives IDs
  shopStock: [], // v30.5 Current random perks in shop
  refreshCount: 3, // v30.5 Refreshes remaining

  // Constants
  SCALING_FACTOR: 1.5, // Enemy stats multiply by this per tier
  
  init() {
    this.load();
  },

  // Persistence
  save() {
    const data = {
      level: this.level,
      shards: this.shards,
      upgrades: this.upgrades,
      upgrades: this.upgrades,
      equippedPerks: this.equippedPerks,
      shopStock: this.shopStock,
      refreshCount: this.refreshCount
    };
    localStorage.setItem("rebone_ascension", JSON.stringify(data));
  },

  load() {
    const raw = localStorage.getItem("rebone_ascension");
    if (raw) {
      const data = JSON.parse(raw);
      this.level = data.level || 0;
      this.shards = data.shards || 0;
      this.upgrades = data.upgrades || {};
      this.upgrades = data.upgrades || {};
      this.equippedPerks = data.equippedPerks || [];
      this.shopStock = data.shopStock || [];
      this.refreshCount = (data.refreshCount !== undefined) ? data.refreshCount : 3;
      
      // Initial Stock
      if (this.shopStock.length === 0) this.generateStock();
    } else {
        // First run
        this.generateStock();
    }
  },

  // Core Mechanics
  getScalingMultiplier() {
    return Math.pow(this.SCALING_FACTOR, this.level);
  },

  // Trigger New Game+
  prestige(playerData) {
    // 1. Calculate Shard Reward (Hard Mode)
    // Base: 1 Shard for clearing Floor 100.
    // Bonus: +1 per 5,000 Score.
    // "Susah untuk mendapatkannya" - User Request
    let reward = 1;
    if (playerData && playerData.score) {
        reward += Math.floor(playerData.score / 5000);
    }

    // 2. Add Shards & Increment Level
    // 2. Add Shards & Increment Level
    this.shards += reward;
    this.level++;
    
    // v30.5 Reset Shop Logic
    this.refreshCount = 3;
    this.generateStock();
    
    this.save();
    
    // 3. Reset Player & Game
    Player.reset();
    Game.floor = 1;
    Game.saveMeta(); // Save ascension level (if added to meta)
    
    // Reload to apply changes cleanly
    location.reload();
    
    return reward;
  },

  // Soul Forge Data
  SHOP_ITEMS: [
    { id: "str_plus", name: "Titan's Strength", desc: "Start with +5 STR", cost: 5, max: 10 },
    { id: "vit_plus", name: "Golem's Heart", desc: "Start with +5 VIT", cost: 5, max: 10 },
    { id: "int_plus", name: "Lich's Mind", desc: "Start with +5 INT", cost: 5, max: 10 },
    { id: "exp_boost", name: "Ancient Wisdom", desc: "+10% EXP Gain", cost: 10, max: 5 },
    { id: "gold_boost", name: "Midas Touch", desc: "+20% Gold Gain", cost: 8, max: 5 },
    { id: "mythic_chance", name: "God's Favor", desc: "+1% Mythic Drop Rate", cost: 20, max: 3 },
    // Class Unlocks (Dynamic Cost)
    { id: "unlock_vampire", name: "Class: Vampire", desc: "Unlock Vampire", cost: 0, max: 1 },
    { id: "unlock_lich", name: "Class: Lich", desc: "Unlock Lich", cost: 0, max: 1 },
    { id: "unlock_wraith", name: "Class: Wraith", desc: "Unlock Wraith", cost: 0, max: 1 },
    { id: "unlock_dark_knight", name: "Class: Dark Knight", desc: "Unlock Dark Knight", cost: 0, max: 1 },
    { id: "unlock_necro_priest", name: "Class: Necro Priest", desc: "Unlock Necro Priest", cost: 0, max: 1 },
    { id: "unlock_shadow_assassin", name: "Class: Shadow Assassin", desc: "Unlock Shadow Assassin", cost: 0, max: 1 }
  ],
  
  // Calculate dynamic cost for class unlocks
  getClassUnlockCost() {
      let count = 0;
      for (let key in this.upgrades) {
          if (key.startsWith("unlock_")) count++;
      }
      // Base usage: 30 + (count * 30)
      // Base usage: 30 + (count * 30)
    return 30 + (count * 30);
  },
  
  // v30.5 Generate Random Shop Stock
  generateStock() {
      const allPerks = Object.keys(DB.PASSIVES);
      const stockSize = 6; // Show 6 random perks
      
      // Fisher-Yates Shuffle
      for (let i = allPerks.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allPerks[i], allPerks[j]] = [allPerks[j], allPerks[i]];
      }
      
      this.shopStock = allPerks.slice(0, stockSize);
      this.save();
  },
  
  // v30.5 Refresh Shop Action
  refreshShop() {
      if (this.refreshCount > 0) {
          this.refreshCount--;
          this.generateStock();
          this.renderShop();
          UI.toast(`Shop Refreshed! (${this.refreshCount} left)`);
      } else {
          UI.toast("No refreshes remaining!");
      }
  },

  // Soul Forge (Shop) Logic
  buyUpgrade(id) {
    let item = this.SHOP_ITEMS.find(i => i.id === id);
    if (!item) {
        // Check if it's a perk
        if (id.startsWith("perk_")) {
             // Mock item for perk
             item = { id: id, max: 1, cost: 50 }; 
        } else {
            return false;
        }
    }

    const currentLevel = this.upgrades[id] || 0;
    if (currentLevel >= item.max) {
        UI.toast("Max Level Reached!");
        return false;
    }

    // Perk Logic
    if (id.startsWith("perk_")) {
        cost = 50; // Fixed cost for perks
    } else if (id.startsWith("unlock_")) {
        cost = this.getClassUnlockCost();
    }

    if (this.shards >= cost) {
        this.shards -= cost;
        this.upgrades[id] = currentLevel + 1;
        this.save();
        this.renderShop(); // Refresh UI
        return true;
    } else {
        UI.toast(`Not enough Souls (Need ${cost})...`);
        return false;
    }
  },

  renderShop() {
    UI.showPanel("shop-ascension"); // Needs to be added to UI.js/index.html
    const list = document.getElementById("soul-forge-list");
    const currency = document.getElementById("soul-shards-display");
    
    if (currency) currency.innerText = this.shards;
    if (!list) return;

    list.innerHTML = "";
    
    this.SHOP_ITEMS.forEach(item => {
        const lvl = this.upgrades[item.id] || 0;
        const btn = document.createElement("div");
        btn.className = "shop-item";
        btn.style.cssText = "padding:10px; margin:5px 0; border:1px solid #444; display:flex; justify-content:space-between; align-items:center;";
        
        const isMax = lvl >= item.max;
        
        // Dynamic Cost Logic
        let cost = item.cost;
        let costDisplay = item.cost + " 👻";
        
        if (item.id.startsWith("unlock_")) {
            cost = this.getClassUnlockCost();
            if (isMax) costDisplay = "OWNED";
            else costDisplay = cost + " 👻 (Scale)";
        }
        
        const canAfford = this.shards >= cost;
        const color = isMax ? "#666" : canAfford ? "var(--c-gold)" : "#888";

        btn.innerHTML = `
            <div>
                <strong style="color:${color}">${item.name}</strong> <small style="color:#aaa">(Lv.${lvl}/${item.max})</small><br>
                <small>${item.desc}</small>
            </div>
            <button class="menu-btn" style="padding:5px 10px; font-size:0.8rem; border-color:${color}; color:${color}" 
                onclick="Ascension.buyUpgrade('${item.id}')">
                ${costDisplay}
            </button>
        `;
        list.appendChild(btn);
    });
    // v30.4 PERKS SHOP
    const perksHeader = document.createElement("div");
    perksHeader.innerHTML = `
        <h3 style="text-align:center; color:var(--c-cyan); margin-top:20px;">
            PERKS (Equip Limit: ${Achievements.getPerkSlots()})
        </h3>
        <div style="text-align:center; margin-bottom:10px;">
            <button class="menu-btn" style="padding:5px 10px; font-size:0.8rem; border-color:${this.refreshCount > 0 ? 'var(--c-gold)' : '#444'}; color:${this.refreshCount > 0 ? 'var(--c-gold)' : '#666'}"
                onclick="Ascension.refreshShop()" ${this.refreshCount <= 0 ? 'disabled' : ''}>
                🔄 Refresh Stock (${this.refreshCount}/3)
            </button>
        </div>
    `;
    list.appendChild(perksHeader);

    // Filter Perks from DB.PASSIVES (only show current stock)
    const PERK_COST = 50; 
    
    // Sort logic? Just iterate stock
    const stock = this.shopStock.length > 0 ? this.shopStock : Object.keys(DB.PASSIVES); // Fallback
    
    stock.forEach(pid => {
        const p = DB.PASSIVES[pid];
        const perkId = `perk_${pid}`;
        const owned = this.upgrades[perkId] ? true : false;
        const equipped = this.equippedPerks.includes(perkId);
        
        const btn = document.createElement("div");
        btn.className = "shop-item";
        btn.style.cssText = "padding:10px; margin:5px 0; border:1px solid #444; display:flex; justify-content:space-between; align-items:center;";
        
        const canAfford = this.shards >= PERK_COST;
        const color = owned ? (equipped ? "var(--c-cyan)" : "#666") : canAfford ? "var(--c-gold)" : "#888";
        
        let actionBtn = "";
        if (owned) {
            actionBtn = `<button class="menu-btn" style="padding:5px 10px; font-size:0.8rem; border-color:${equipped ? 'var(--c-red)' : '#666'}; color:${equipped ? 'var(--c-red)' : '#fff'}"
                onclick="Ascension.togglePerk('${perkId}')">
                ${equipped ? 'UNEQUIP' : 'EQUIP'}
            </button>`;
        } else {
            actionBtn = `<button class="menu-btn" style="padding:5px 10px; font-size:0.8rem; border-color:${color}; color:${color}" 
                onclick="Ascension.buyUpgrade('${perkId}')" ${owned ? 'disabled' : ''}>
                ${PERK_COST + ' 👻'}
            </button>`;
        }
        
        btn.innerHTML = `
            <div>
                <strong style="color:${color}">${p.name}</strong> <small style="color:#aaa">${owned ? (equipped ? '(EQUIPPED)' : '(OWNED)') : ''}</small><br>
                <small>${p.desc}</small>
            </div>
            ${actionBtn}
        `;
        list.appendChild(btn);
    });
  }
};

// Auto-init on load
// Ensure DB is loaded first
window.addEventListener('load', () => {
  if(window.Ascension) Ascension.init();
});
