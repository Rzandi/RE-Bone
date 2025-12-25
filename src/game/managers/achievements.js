/* =========================================
   ACHIEVEMENT SYSTEM
   ========================================= */

import { Player } from '../logic/Player.js';
import { Game } from '../core/game.js';
import { gameStore } from '../store.js';
import { CONSTANTS } from '../config/constants.js';

export const Achievements = {
  list: {
    // Combat Achievements
    immortal: {
      name: "Immortal",
      desc: "Complete game without dying",
      icon: "💀",
      unlocked: false,
      check() {
        return Player.deathCount === 0 && Game.floor === 0;
      }
    },
    vampire_lord: {
      name: "Vampire Lord",
      desc: "Heal 500 HP with lifesteal",
      icon: "🦇",
      unlocked: false,
      progress: 0,
      target: 500
    },
    combo_master: {
      name: "Combo Master",
      desc: "Use Bat Swarm 50 times",
      icon: "💥",
      unlocked: false,
      progress: 0,
      target: 50
    },
    
    // Boss Achievements
    boss_rush_complete: {
      name: "Boss Rush Champion",
      desc: "Complete Boss Rush mode",
      icon: "🏆",
      unlocked: false
    },
    flawless_victory: {
      name: "Flawless Victory",
      desc: "Defeat a boss without taking damage",
      icon: "⭐",
      unlocked: false
    },
    all_bosses: {
      name: "Boss Hunter",
      desc: "Defeat all 5 bosses",
      icon: "⚔️",
      unlocked: false,
      progress: 0,
      target: 5
    },
    
    // Collection Achievements
    legendary_collector: {
      name: "Legendary Collector",
      desc: "Obtain 5 legendary items",
      icon: "💎",
      unlocked: false,
      progress: 0,
      target: 5
    },
    set_master: {
      name: "Set Master",
      desc: "Equip a full 3-piece set",
      icon: "🎭",
      unlocked: false
    },
    
    // Class Achievements
    skeleton_master: {
      name: "Skeleton Master",
      desc: "Beat game as Skeleton",
      icon: "💀",
      unlocked: false
    },
    vampire_master: {
      name: "Vampire Master",
      desc: "Beat game as Vampire",
      icon: "🦇",
      unlocked: false
    },
    lich_master: {
      name: "Lich Master",
      desc: "Beat game as Lich",
      icon: "🔮",
      unlocked: false
    },
    wraith_master: {
      name: "Wraith Master",
      desc: "Beat game as Wraith",
      icon: "👻",
      unlocked: false
    },
    paladin_master: { 
      name: "Paladin Master", 
      desc: "Beat game as Paladin", 
      icon: "🛡️", 
      unlocked: false 
    },
    druid_master: { 
      name: "Druid Master", 
      desc: "Beat game as Druid", 
      icon: "🌿", 
      unlocked: false 
    },
    berserker_master: { 
      name: "Berserker Master", 
      desc: "Beat game as Berserker", 
      icon: "🪓", 
      unlocked: false 
    },
    mechanist_master: { 
      name: "Mechanist Master", 
      desc: "Beat game as Mechanist", 
      icon: "⚙️", 
      unlocked: false 
    },
    
    // Miscellaneous
    floor_100: {
      name: "Abyss Explorer",
      desc: "Survive floor 100",
      icon: "🌑",
      unlocked: false
    },
    // v38.8: Gatekeeper Floor Achievements
    floor_200: {
      name: "Soul Warden's Bane",
      desc: "Survive floor 200",
      icon: "👁️",
      unlocked: false
    },
    floor_300: {
      name: "Chaos Conqueror",
      desc: "Survive floor 300", 
      icon: "🌀",
      unlocked: false
    },
    floor_400: {
      name: "Primordial Slayer",
      desc: "Survive floor 400",
      icon: "🦴",
      unlocked: false
    },
    floor_500: {
      name: "Void Walker",
      desc: "Survive floor 500 - Enter The Endless",
      icon: "⬛",
      unlocked: false
    },
    floor_1: {
      name: "Dungeon Conqueror",
      desc: "Reach Floor 1 (Victory)",
      icon: "🏁",
      unlocked: false
    },
    // --- FLOORS ---
    floor_10: { name: "Beginner", desc: "Reach Floor 10", icon: "🚪", unlocked: false },
    floor_20: { name: "Novice", desc: "Reach Floor 20", icon: "🚪", unlocked: false },
    floor_30: { name: "Adventurer", desc: "Reach Floor 30", icon: "🚪", unlocked: false },
    floor_40: { name: "Explorer", desc: "Reach Floor 40", icon: "🚪", unlocked: false },
    floor_50: { name: "Veteran", desc: "Reach Floor 50", icon: "🚪", unlocked: false },
    floor_60: { name: "Expert", desc: "Reach Floor 60", icon: "🚪", unlocked: false },
    floor_70: { name: "Master", desc: "Reach Floor 70", icon: "🚪", unlocked: false },
    floor_80: { name: "Legend", desc: "Reach Floor 80", icon: "🚪", unlocked: false },
    floor_90: { name: "Demi-God", desc: "Reach Floor 90", icon: "🚪", unlocked: false },
    // floor_100 is existing
    
    // --- LEVELING ---
    level_10: { name: "Growing Strong", desc: "Reach Lv 10", icon: "🆙", unlocked: false },
    level_20: { name: "Class Evolution", desc: "Reach Lv 20", icon: "🧬", unlocked: false },
    level_30: { name: "Power Up", desc: "Reach Lv 30", icon: "💪", unlocked: false },
    level_50: { name: "Ascended", desc: "Reach Lv 50", icon: "🌟", unlocked: false },
    level_80: { name: "Max Potential", desc: "Reach Lv 80", icon: "🔥", unlocked: false },
    
    // --- COMBAT ---
    kill_10: { name: "First Blood", desc: "Kill 10 Enemies", icon: "🩸", unlocked: false, progress: 0, target: 10 },
    kill_50: { name: "Slayer", desc: "Kill 50 Enemies", icon: "🩸", unlocked: false, progress: 0, target: 50 },
    kill_100: { name: "Butcher", desc: "Kill 100 Enemies", icon: "🩸", unlocked: false, progress: 0, target: 100 },
    kill_500: { name: "Exterminator", desc: "Kill 500 Enemies", icon: "☠️", unlocked: false, progress: 0, target: 500 },
    kill_1000: { name: "Genocide", desc: "Kill 1000 Enemies", icon: "💀", unlocked: false, progress: 0, target: 1000 },
    
    crit_master: { name: "Critical Hit", desc: "Land 50 Crits", icon: "🎯", unlocked: false, progress: 0, target: 50 },
    dodge_master: { name: "Untouchable", desc: "Dodge 50 Attacks", icon: "💨", unlocked: false, progress: 0, target: 50 },
    block_master: { name: "Iron Wall", desc: "Block 1000 Dmg total", icon: "🛡️", unlocked: false, progress: 0, target: 1000 },
    
    // --- SKILLS ---
    skill_learner: { name: "Scholar", desc: "Learn 5 Skills", icon: "📖", unlocked: false, progress: 0, target: 5 },
    skill_master: { name: "Archmage", desc: "Learn 10 Skills", icon: "📚", unlocked: false, progress: 0, target: 10 },
    mana_user: { name: "Magic User", desc: "Spend 1000 MP", icon: "💧", unlocked: false, progress: 0, target: 1000 },
    
    // --- WEALTH & ITEMS ---
    gold_1000: { name: "Saver", desc: "Hold 1000 Gold", icon: "💰", unlocked: false },
    gold_5000: { name: "Rich", desc: "Hold 5000 Gold", icon: "💰", unlocked: false },
    gold_10000: { name: "Tycoon", desc: "Hold 10000 Gold", icon: "💰", unlocked: false },
    item_hoarder: { name: "Hoarder", desc: "Full Inventory", icon: "🎒", unlocked: false },
    potion_chugger: { name: "Addict", desc: "Use 50 Potions", icon: "🧪", unlocked: false, progress: 0, target: 50 },
    
    // --- DEATH ---
    die_1: { name: "You Died", desc: "Die once", icon: "⚰️", unlocked: false },
    die_10: { name: "Persistance", desc: "Die 10 times", icon: "⚰️", unlocked: false, progress: 0, target: 10 },
    die_50: { name: "Glutton for Punishment", desc: "Die 50 times", icon: "⚰️", unlocked: false, progress: 0, target: 50 },
    
    // --- STATS ---
    str_50: { name: "Hulk", desc: "Reach 50 STR", icon: "💪", unlocked: false },
    vit_50: { name: "Tank", desc: "Reach 50 VIT", icon: "🛡️", unlocked: false },
    int_50: { name: "Genius", desc: "Reach 50 INT", icon: "🧠", unlocked: false },
    
    // --- MISC ---
    crafting_novice: { name: "Crafter", desc: "Craft 5 Items", icon: "🔨", unlocked: false, progress: 0, target: 5 },
    crafting_master: { name: "Blacksmith", desc: "Craft 20 Items", icon: "🔨", unlocked: false, progress: 0, target: 20 },
    social_butterfly: { name: "Social", desc: "Share a run", icon: "📢", unlocked: false },
    // --- EVENTS (v36.3) ---
    nature_friend: { name: "Nature's Friend", desc: "Awaken the Forest Spirit", icon: "🌸", unlocked: false },
    rat_ally: { name: "King's Hand", desc: "Ally with the Rat King", icon: "🐀", unlocked: false },
    void_gazer: { name: "Void Gazer", desc: "Stare into the Abyss (and survive)", icon: "👁️", unlocked: false },
    cursed_destiny: { name: "Cursed One", desc: "Wield the Cursed Blade", icon: "🗡️", unlocked: false },
    
    // --- EXPLORATION ---
    realm_traveler: { 
        name: "World Traveler", 
        desc: "Visit all 5 Realms", 
        icon: "🌍", 
        unlocked: false, 
        progress: 0, 
        target: 5 
    },
    
    // --- RELICS ---
    relic_hunter: { 
        name: "Archaeologist", 
        desc: "Find 10 Unique Relics", 
        icon: "🏺", 
        unlocked: false, 
        progress: 0, 
        target: 10 
    },
    
    // --- v37.0: GEMS & SOCKETS ---
    gem_collector: {
      name: "Gem Collector",
      desc: "Collect 10 gems",
      icon: "💎",
      unlocked: false,
      progress: 0,
      target: 10
    },
    gem_hoarder: {
      name: "Gem Hoarder",
      desc: "Collect 50 gems",
      icon: "💎",
      unlocked: false,
      progress: 0,
      target: 50
    },
    rare_gem_finder: {
      name: "Rare Gem Hunter",
      desc: "Find 5 rare-tier gems",
      icon: "🔷",
      unlocked: false,
      progress: 0,
      target: 5
    },
    epic_gem_finder: {
      name: "Epic Gem Hunter",
      desc: "Find 5 epic-tier gems",
      icon: "🟣",
      unlocked: false,
      progress: 0,
      target: 5
    },
    legendary_gem_finder: {
      name: "Legendary Gem Hunter",
      desc: "Find a legendary gem",
      icon: "⭐",
      unlocked: false
    },
    socket_novice: {
      name: "Socket Apprentice",
      desc: "Socket 5 gems into items",
      icon: "🔨",
      unlocked: false,
      progress: 0,
      target: 5
    },
    socket_master: {
      name: "Socket Master",
      desc: "Socket 20 gems into items",
      icon: "⚒️",
      unlocked: false,
      progress: 0,
      target: 20
    },
    fully_socketed: {
      name: "Fully Gemmed",
      desc: "Have a 3-socket item fully filled",
      icon: "💠",
      unlocked: false
    },
    synthesis_novice: {
      name: "Alchemist",
      desc: "Synthesize 5 items",
      icon: "⚗️",
      unlocked: false,
      progress: 0,
      target: 5
    },
    synthesis_master: {
      name: "Master Synthesizer",
      desc: "Synthesize 20 items",
      icon: "🧪",
      unlocked: false,
      progress: 0,
      target: 20
    },
    legendary_synthesis: {
      name: "Legendary Crafter",
      desc: "Synthesize a legendary item",
      icon: "🌟",
      unlocked: false
    },
    
    // --- v37.0 Phase 3: BLACK MARKET ---
    curse_curious: {
      name: "Curse Curious",
      desc: "Own 1 cursed item",
      icon: "☠️",
      unlocked: false,
      progress: 0,
      target: 1
    },
    curse_collector: {
      name: "Curse Collector",
      desc: "Own 5 cursed items",
      icon: "💀",
      unlocked: false,
      progress: 0,
      target: 5
    },
    curse_connoisseur: {
      name: "Curse Connoisseur",
      desc: "Own 10 cursed items",
      icon: "👻",
      unlocked: false,
      progress: 0,
      target: 10
    },
    curse_master: {
      name: "Curse Master",
      desc: "Own 15 cursed items",
      icon: "🦇",
      unlocked: false,
      progress: 0,
      target: 15
    },
    lord_of_curses: {
      name: "Lord of Curses",
      desc: "Own all 20 cursed items",
      icon: "👑",
      unlocked: false,
      progress: 0,
      target: 20
    },
    mystery_opener: {
      name: "Gambler",
      desc: "Open 10 mystery boxes",
      icon: "📦",
      unlocked: false,
      progress: 0,
      target: 10
    },
    mystery_addict: {
      name: "Box Addict",
      desc: "Open 50 mystery boxes",
      icon: "🎰",
      unlocked: false,
      progress: 0,
      target: 50
    },
    
    // --- v37.0 Phase 4: ECONOMY ---
    big_spender: {
      name: "Big Spender",
      desc: "Spend 10,000 gold total",
      icon: "💰",
      unlocked: false,
      progress: 0,
      target: 10000
    },
    merchant_friend: {
      name: "Merchant's Friend",
      desc: "Reach Merchant Rep 25",
      icon: "🤝",
      unlocked: false,
      progress: 0,
      target: 25
    },
    haggler: {
      name: "Haggler",
      desc: "Get a discount from merchant",
      icon: "📉",
      unlocked: false
    },
    inflation_survivor: {
      name: "Inflation Survivor",
      desc: "Shop with 50%+ inflation",
      icon: "📈",
      unlocked: false
    },
    market_veteran: {
      name: "Market Veteran",
      desc: "Experience 5 market events",
      icon: "🎪",
      unlocked: false,
      progress: 0,
      target: 5
    },
  },
  
  // Check and unlock achievements
  check(event, data = {}) {
    for (let id in this.list) {
      let ach = this.list[id];
      if (!ach.unlocked) {
        // Event-based checks
        if (event === 'game_complete' && ach.check) {
          if (ach.check()) {
            this.unlock(id);
          }
        }
        
        // Progress-based checks
        if (ach.progress !== undefined && ach.progress >= ach.target) {
          this.unlock(id);
        }
      }
    }
  },
  
  // Unlock achievement with animation
  unlock(id) {
    if (this.list[id] && !this.list[id].unlocked) {
      this.list[id].unlocked = true;
      gameStore.log(`🏆 Achievement: ${this.list[id].name}!`, "boss"); // Was "log boss"
      
      // Show achievement popup animation
      this.showUnlockPopup(this.list[id]);
      
      this.save();
    }
  },
  
  // Show achievement unlock popup
  showUnlockPopup(achievement) {
    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    // This DOM maniuplation is acceptable for now as it's a transient global overlay
    // But ideally should be an event emitted to App.vue
    popup.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-title">Achievement Unlocked!</div>
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-desc">${achievement.desc}</div>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // Screen flash
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    document.body.appendChild(flash);
    
    // Remove after animation
    setTimeout(() => {
      popup.remove();
      flash.remove();
    }, CONSTANTS.ACHIEVEMENT_POPUP_DURATION);
  },

  
  // Update progress
  addProgress(id, amount = 1) {
    if (this.list[id] && this.list[id].progress !== undefined) {
      this.list[id].progress += amount;
      if (this.list[id].progress >= this.list[id].target) {
        this.unlock(id);
      }
      this.save();
    }
  },
  
  // Save to localStorage
  save() {
    let data = {};
    for (let id in this.list) {
      data[id] = {
        unlocked: this.list[id].unlocked,
        progress: this.list[id].progress || 0
      };
    }
    localStorage.setItem('rebone_achievements', JSON.stringify(data));
  },
  
  // Load from localStorage
  load() {
    const saved = localStorage.getItem('rebone_achievements');
    if (saved) {
      const data = JSON.parse(saved);
      for (let id in data) {
        if (this.list[id]) {
          this.list[id].unlocked = data[id].unlocked;
          if (data[id].progress !== undefined) {
            this.list[id].progress = data[id].progress;
          }
        }
      }
    }
  },
  
  // Get achievement count
  getUnlockedCount() {
    return Object.values(this.list).filter(a => a.unlocked).length;
  },
  
  getTotalCount() {
    return Object.keys(this.list).length;
  },
  
  // Perks Slot Calculation (v30.4)
  // Base 1. +1 at 10, 25, 40 Achievements. Max 4.
  getPerkSlots() {
      const count = this.getUnlockedCount();
      let slots = 1;
      if (count >= 10) slots++;
      if (count >= 25) slots++;
      if (count >= 40) slots++;
      return slots;
  }
};

// Export to global - REMOVED v38.0
// window.Achievements = Achievements;
