export const RELICS = {
    /* =========================================
       TIER 1: COMMON (Stat Boosts & Basics)
       ========================================= */
    "vampire_fang": {
        name: "Vampire Fang",
        desc: "Lifesteal +5%",
        rarity: "common",
        effect: (p) => { p.bonuses.lifesteal = (p.bonuses.lifesteal || 0) + 0.05; }
    },
    "stone_skin": {
        name: "Stone Skin",
        desc: "DEF +2",
        rarity: "common",
        effect: (p) => { p.bonuses.flatDef = (p.bonuses.flatDef || 0) + 2; }
    },
    "warrior_heart": {
        name: "Warrior Heart",
        desc: "Max HP +20",
        rarity: "common",
        effect: (p) => { p.multipliers.hp = (p.multipliers.hp || 1) + 0.1; }
    },
    "swift_boots": {
        name: "Swift Boots",
        desc: "Dodge +5%",
        rarity: "common",
        effect: (p) => { p.bonuses.dodge = (p.bonuses.dodge || 0) + 0.05; }
    },
    "whetstone": {
        name: "Whetstone",
        desc: "DMG +5%",
        rarity: "common",
        effect: (p) => { p.multipliers.dmg = (p.multipliers.dmg || 1) + 0.05; }
    },
    "iron_ring": {
        name: "Iron Ring",
        desc: "STR +2",
        rarity: "common",
        effect: (p) => { p.multipliers.dmg = (p.multipliers.dmg || 1) + 0.02; } 
    },

    /* =========================================
       TIER 2: RARE (Utility & Scaling)
       ========================================= */
    "midas_coin": {
        name: "Midas Coin",
        desc: "Gold Gain +20%",
        rarity: "rare",
        effect: (p) => { p.multipliers.gold = (p.multipliers.gold || 1) + 0.2; }
    },
    "scholar_glasses": {
        name: "Scholar Glasses",
        desc: "EXP Gain +20%",
        rarity: "rare",
        effect: (p) => { p.multipliers.exp = (p.multipliers.exp || 1) + 0.2; }
    },
    "berserker_idol": {
        name: "Berserker Idol",
        desc: "Deal +15% DMG, Take +10% DMG",
        rarity: "rare",
        effect: (p) => { 
            p.multipliers.dmg = (p.multipliers.dmg || 1) + 0.15;
            p.multipliers.def = (p.multipliers.def || 1) * 0.9;
        }
    },
    "lucky_clover": {
        name: "Lucky Clover",
        desc: "Crit Chance +10%",
        rarity: "rare",
        effect: (p) => { p.bonuses.crit = (p.bonuses.crit || 0) + 0.10; }
    },
    "thornmail_fragment": {
        name: "Thorn Fragment",
        desc: "Reflect 10% Damage",
        rarity: "rare",
        effect: (p) => { p.bonuses.reflect = (p.bonuses.reflect || 0) + 0.10; }
    },
    "mana_battery": {
        name: "Mana Battery",
        desc: "Max MP +50",
        rarity: "rare",
        effect: (p) => { p.multipliers.mp = (p.multipliers.mp || 1) + 0.2; }
    },

    /* =========================================
       TIER 3: EPIC (Game Changers)
       ========================================= */
    "phoenix_feather": {
        name: "Phoenix Feather",
        desc: "Auto-Revive (Once/Run)",
        rarity: "epic",
        effect: (p) => { p.bonuses.autoRevive = true; } 
    },
    "assassin_cloak": {
        name: "Assassin Cloak",
        desc: "First hit deals double damage",
        rarity: "epic",
        effect: (p) => { p.bonuses.firstStrike = true; } // Needs Combat support
    },
    "infinity_edge": {
        name: "Infinity Edge",
        desc: "Crit DMG +50%",
        rarity: "epic",
        effect: (p) => { p.bonuses.critDmg = (p.bonuses.critDmg || 0) + 0.5; }
    },
    "giant_belt": {
        name: "Giant's Belt",
        desc: "Max HP +50%",
        rarity: "epic",
        effect: (p) => { p.multipliers.hp = (p.multipliers.hp || 1) + 0.5; }
    },

    /* =========================================
       TIER 4: LEGENDARY (Godly Powers)
       ========================================= */
    "cursed_skull": {
        name: "Cursed Skull",
        desc: "Enemies have -20% HP",
        rarity: "legend",
        effect: (p) => { p.bonuses.curseAura = 0.2; } // Combat needs to check this
    },
    "hourglass_of_fate": {
        name: "Hourglass of Fate",
        desc: "Chance for Extra Turn",
        rarity: "legend",
        effect: (p) => { p.bonuses.extraTurnChance = 0.1; }
    },
    "soul_stealer": {
        name: "Soul Stealer",
        desc: "Heal 5% HP on Kill",
        rarity: "legend",
        effect: (p) => { p.bonuses.hpPerKillPercent = 0.05; }
    }
};

window.RELICS = RELICS;
