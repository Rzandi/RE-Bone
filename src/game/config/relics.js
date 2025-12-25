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
    },

    /* =========================================
       TIER X: CURSED (High Risk, High Reward)
       ========================================= */
    "idol_of_greed": {
        name: "Idol of Greed",
        desc: "Gold +100%, Max HP -50%",
        rarity: "mythic",
        effect: (p) => { 
            p.multipliers.gold = (p.multipliers.gold || 1) + 1.0; 
            p.multipliers.hp = (p.multipliers.hp || 1) * 0.5; 
        }
    },
    "idol_of_wrath": {
        name: "Idol of Wrath",
        desc: "DMG +50%, DEF -50%",
        rarity: "mythic",
        effect: (p) => { 
            p.multipliers.dmg = (p.multipliers.dmg || 1) + 0.5; 
            p.multipliers.def = (p.multipliers.def || 1) * 0.5; 
        }
    },
    "idol_of_fragility": {
        name: "Glass Idol",
        desc: "DMG +100%, Max HP -80%",
        rarity: "mythic",
        effect: (p) => { 
            p.multipliers.dmg = (p.multipliers.dmg || 1) + 1.0; 
            p.multipliers.hp = (p.multipliers.hp || 1) * 0.2; 
        }
    },
    // New Batch (User Request: 20+)
    "cursed_lens": {
        name: "Cursed Lens",
        desc: "Crit Damage +100%, Crit Chance -20%",
        rarity: "mythic",
        effect: (p) => {
            p.bonuses.critDmg = (p.bonuses.critDmg || 0) + 1.0;
            p.bonuses.crit = (p.bonuses.crit || 0) - 0.2;
        }
    },
    "blood_chalice": {
        name: "Blood Chalice",
        desc: "Lifesteal +20%, Max HP -30%",
        rarity: "mythic",
        effect: (p) => {
            p.bonuses.lifesteal = (p.bonuses.lifesteal || 0) + 0.2;
            p.multipliers.hp = (p.multipliers.hp || 1) * 0.7;
        }
    },
    "heavy_shackles": {
        name: "Heavy Shackles",
        desc: "DEF +100%, Dodge -50%",
        rarity: "mythic",
        effect: (p) => {
            p.multipliers.def = (p.multipliers.def || 1) + 1.0;
            p.bonuses.dodge = (p.bonuses.dodge || 0) - 0.5;
        }
    },
    "mind_parasite": {
        name: "Mind Parasite",
        desc: "Direct Dmg Spells +50%, Max MP -50%",
        rarity: "mythic",
        effect: (p) => {
            p.multipliers.magicDmg = (p.multipliers.magicDmg || 1) + 0.5; // Needs implementation
            p.multipliers.mp = (p.multipliers.mp || 1) * 0.5;
        }
    },
    "blighted_root": {
        name: "Blighted Root",
        desc: "Regen HP +50/sec, Healing Received -50%",
        rarity: "mythic",
        effect: (p) => {
            p.bonuses.hpRegen = (p.bonuses.hpRegen || 0) + 50;
            p.multipliers.healingReceived = 0.5; // Needs implementation
        }
    },
    "reckless_amulet": {
        name: "Reckless Amulet",
        desc: "Instant Cooldowns (CD -30%), Taken DMG +30%",
        rarity: "mythic",
        effect: (p) => {
            p.multipliers.cooldown = (p.multipliers.cooldown || 1) * 0.7;
            p.multipliers.damageTaken = 1.3; // Needs implementation
        }
    },
    "giant_slayer_contract": {
        name: "Giant Slayer Contract",
        desc: "Boss DMG +50%, Normal Enemy DMG -30%",
        rarity: "mythic",
        effect: (p) => {
            p.bonuses.bossDmg = (p.bonuses.bossDmg || 0) + 0.5; // Needs implementation
            p.bonuses.minionDmg = -0.3; // Needs implementation
        }
    },
    "gamblers_ruin": {
        name: "Gambler's Ruin",
        desc: "Crit Chance +50%, Crit DMG -50%",
        rarity: "mythic",
        effect: (p) => {
            p.bonuses.crit = (p.bonuses.crit || 0) + 0.5;
            p.bonuses.critDmg = (p.bonuses.critDmg || 0) - 0.5;
        }
    },
    "turtle_hermit_shell": {
        name: "Turtle Hermit Shell",
        desc: "DEF +200%, Cannot Dodge",
        rarity: "mythic",
        effect: (p) => {
            p.multipliers.def = (p.multipliers.def || 1) + 2.0;
            p.bonuses.dodge = -9.0; // Force 0
        }
    },
    "berserkers_eye": {
        name: "Berserker's Eye",
        desc: "Atk Speed +50%, Accuracy -20%",
        rarity: "mythic",
        effect: (p) => {
            p.multipliers.atkSpeed = (p.multipliers.atkSpeed || 1) + 0.5; // Needs logic
            p.bonuses.hitChance = (p.bonuses.hitChance || 0) - 0.2;
        }
    },
    "void_pact": {
        name: "Void Pact",
        desc: "Start with 0 MP, Regen MP +200%",
        rarity: "mythic",
        effect: (p) => {
            p.bonuses.startEmptyMp = true; // Needs logic
            p.multipliers.mpRegen = (p.multipliers.mpRegen || 1) + 2.0;
        }
    },
    "midas_curse": {
        name: "Midas Curse",
        desc: "Gold +300%, No EXP Gain",
        rarity: "mythic",
        effect: (p) => {
            p.multipliers.gold = (p.multipliers.gold || 1) + 3.0;
            p.bonuses.noExp = true; // Use flag to force 0 at end of recalc
        }
    },
    "scholar_burden": {
        name: "Scholar's Burden",
        desc: "EXP +100%, DMG -30%",
        rarity: "mythic",
        effect: (p) => {
            p.multipliers.exp = (p.multipliers.exp || 1) + 1.0;
            p.multipliers.dmg = (p.multipliers.dmg || 1) * 0.7;
        }
    },
    "flesh_rot": {
        name: "Flesh Rot",
        desc: "Max HP +200%, HP decays 1% per turn",
        rarity: "mythic",
        effect: (p) => {
             p.multipliers.hp = (p.multipliers.hp || 1) + 2.0;
             p.bonuses.hpDecay = 0.01; // Needs logic
        }
    },
    "ethereal_chains": {
        name: "Ethereal Chains",
        desc: "Dodge +40%, Cannot Block",
        rarity: "mythic",
        effect: (p) => {
            p.bonuses.dodge = (p.bonuses.dodge || 0) + 0.4;
            p.bonuses.blockChance = -9.0; // Force 0
        }
    },
    "demonic_tutor": {
        name: "Demonic Tutor",
        desc: "Level Up heals 100%, Potions disabled",
        rarity: "mythic",
        effect: (p) => {
            p.bonuses.fullHealOnLevel = true;
            p.bonuses.noPotions = true; // Needs logic
        }
    },
    "sisyphus_stone": {
        name: "Sisyphus Stone",
        desc: "Stats +20%, Bosses heal 1% per turn",
        rarity: "mythic",
        effect: (p) => {
            p.multipliers.allStats = (p.multipliers.allStats || 1) + 0.2; // Needs update
            p.bonuses.bossRegenAura = 0.01; // Needs logic
        }
    },
    "broken_mirror": {
        name: "Broken Mirror",
        desc: "Reflect 50% DMG, Take 20% more DMG",
        rarity: "mythic",
        effect: (p) => {
             p.bonuses.reflect = (p.bonuses.reflect || 0) + 0.5;
             p.multipliers.damageTaken = (p.multipliers.damageTaken || 1) + 0.2;
        }
    },
    "ascetic_vow": {
        name: "Ascetic Vow",
        desc: "Drop Rates +100%, Cannot Equip Items",
        rarity: "mythic",
        effect: (p) => {
             p.multipliers.dropRate = (p.multipliers.dropRate || 1) + 1.0;
             p.modifierEffects = { ...(p.modifierEffects || {}), noEquipment: true };
        }
    },
    "chaos_dice": {
        name: "Chaos Dice",
        desc: "DMG Variance +/- 50% (Avg higher), Accuracy -10%",
        rarity: "mythic",
        effect: (p) => {
             p.bonuses.highVariance = true; 
             p.bonuses.hitChance = (p.bonuses.hitChance || 0) - 0.1;
        }
    }
};


