/* =========================================
   LEGENDARY ITEMS & SET BONUSES
   ========================================= */

// Legendary Items Database
const LEGENDARY_ITEMS = {
  // ===== VAMPIRE SET 🦇 =====
  bloodfang: {
    name: "Bloodfang",
    slot: "weapon",
    atk: 15,
    rarity: "legend",
    desc: "+15 ATK | 10% Lifesteal",
    price: 500,
    setBonus: "vampire_set",
    uniqueEffect: "lifesteal_10"
  },
  crimson_mantle: {
    name: "Crimson Mantle",
    slot: "armor",
    def: 8,
    hp: 30,
    rarity: "legend",
    desc: "+8 DEF, +30 HP | Vampire Set",
    price: 500,
    setBonus: "vampire_set"
  },
  blood_ring: {
    name: "Blood Ring",
    slot: "acc",
    atk: 8,
    vit: 5,
    rarity: "legend",
    desc: "+8 ATK, +5 VIT | Vampire Set",
    price: 500,
    setBonus: "vampire_set"
  },
  
  // ===== BONE LORD SET 💀 =====
  femur_staff: {
    name: "Femur Staff",
    slot: "weapon",
    int: 12,
    rarity: "legend",
    desc: "+12 INT | Bone Lord Set",
    price: 500,
    setBonus: "bone_set"
  },
  skeletal_armor: {
    name: "Skeletal Armor",
    slot: "armor",
    def: 6,
    int: 8,
    hp: 25,
    rarity: "legend",
    desc: "+6 DEF, +8 INT, +25 HP | Bone Set",
    price: 500,
    setBonus: "bone_set"
  },
  bone_crown: {
    name: "Bone Crown",
    slot: "acc",
    int: 10,
    mp: 20,
    rarity: "legend",
    desc: "+10 INT, +20 MP | Bone Set",
    price: 500,
    setBonus: "bone_set"
  },
  
  // ===== SHADOW SET 👻 =====
  wraith_blade: {
    name: "Wraith Blade",
    slot: "weapon",
    atk: 12,
    int: 6,
    rarity: "legend",
    desc: "+12 ATK, +6 INT | Shadow Set",
    price: 500,
    setBonus: "shadow_set",
    uniqueEffect: "phase_damage"
  },
  shadow_cloak: {
    name: "Shadow Cloak",
    slot: "armor",
    def: 5,
    hp: 20,
    rarity: "legend",
    desc: "+5 DEF, +20 HP | +15% Dodge | Shadow Set",
    price: 500,
    setBonus: "shadow_set",
    uniqueEffect: "dodge_15"
  },
  void_ring: {
    name: "Void Ring",
    slot: "acc",
    int: 8,
    rarity: "legend",
    desc: "+8 INT | Shadow Set",
    price: 500,
    setBonus: "shadow_set"
  },
  
  // ===== DRAGON'S WRATH SET (Fire/DPS) 🔥 ===== (v27.0)
  dragon_claw: {
    name: "Dragon Claw",
    slot: "weapon",
    atk: 18,
    str: 5,
    rarity: "legend",
    desc: "+18 ATK, +5 STR | Dragon Set",
    price: 600,
    setBonus: "dragon_set",
    uniqueEffect: "fire_damage"
  },
  dragon_scale: {
    name: "Dragon Scale",
    slot: "armor",
    def: 10,
    hp: 40,
    rarity: "legend",
    desc: "+10 DEF, +40 HP | Dragon Set",
    price: 600,
    setBonus: "dragon_set"
  },
  dragon_heart: {
    name: "Dragon Heart",
    slot: "acc",
    vit: 8,
    hp: 50,
    rarity: "legend",
    desc: "+8 VIT, +50 HP | Dragon Set",
    price: 600,
    setBonus: "dragon_set"
  },

  // ===== ETERNAL GUARD SET (Tank) 🛡️ ===== (v27.0)
  aegis_shield: {
    name: "Aegis Shield",
    slot: "weapon", // Off-hand weapon? or just weapon slot with Shield type? Assuming weapon for now
    atk: 5,
    def: 15,
    rarity: "legend",
    desc: "+15 DEF | Eternal Set",
    price: 600,
    setBonus: "eternal_set",
    uniqueEffect: "block_chance"
  },
  eternal_plate: {
    name: "Eternal Plate",
    slot: "armor",
    def: 18,
    hp: 60,
    rarity: "legend",
    desc: "+18 DEF, +60 HP | Eternal Set",
    price: 600,
    setBonus: "eternal_set"
  },
  guardian_charm: {
    name: "Guardian Charm",
    slot: "acc",
    def: 5,
    vit: 10,
    rarity: "legend",
    desc: "+5 DEF, +10 VIT | Eternal Set",
    price: 600,
    setBonus: "eternal_set"
  },
  
  // ===== STANDALONE LEGENDARIES =====
  phoenix_feather: {
    name: "Phoenix Feather",
    slot: "acc",
    hp: 40,
    rarity: "legend",
    desc: "+40 HP | Auto-Revive (1x)",
    price: 1000,
    uniqueEffect: "auto_revive"
  },
  time_crystal: {
    name: "Time Crystal",
    slot: "acc",
    mp: 30,
    rarity: "legend",
    desc: "+30 MP | Extra turn on kill",
    price: 800,
    uniqueEffect: "extra_turn"
  },
  mana_siphon_ring: {
    name: "Mana Siphon Ring",
    slot: "acc",
    int: 6,
    rarity: "legend",
    desc: "+6 INT | +3 MP on enemy skill",
    price: 600,
    uniqueEffect: "mp_on_enemy_skill"
  },
  berserker_helm: {
    name: "Berserker Helm",
    slot: "armor",
    atk: 10,
    hp: 15,
    rarity: "legend",
    desc: "+10 ATK, +15 HP | Rage at low HP",
    price: 700,
    uniqueEffect: "rage_low_hp"
  },
  dragon_scale_mail: {
    name: "Dragon Scale Mail",
    slot: "armor",
    def: 12,
    hp: 50,
    rarity: "legend",
    desc: "+12 DEF, +50 HP | Legendary",
    price: 800,
    rarity: "legend"
  },
  soul_reaper: {
    name: "Soul Reaper",
    slot: "weapon",
    atk: 20,
    rarity: "legend",
    desc: "+20 ATK | Restore 3 HP per kill",
    price: 900,
    uniqueEffect: "hp_per_kill"
  },
  eternal_grimoire: {
    name: "Eternal Grimoire",
    slot: "acc",
    int: 15,
    rarity: "legend",
    desc: "+15 INT | Spell costs -1 MP",
    price: 850,
    uniqueEffect: "reduce_mp_cost"
  },
  // v27.0 New Standalones
  void_walker_boots: {
    name: "Void Walker Boots",
    slot: "acc",
    dex: 10,
    rarity: "legend",
    desc: "+10 DEX | Ignore Trap Damage",
    price: 750,
    uniqueEffect: "ignore_traps"
  },
  mirror_shield: {
    name: "Mirror Shield",
    slot: "acc",
    def: 10,
    rarity: "legend",
    desc: "+10 DEF | Reflect 20% Magic Dmg",
    price: 800,
    uniqueEffect: "reflect_magic_20"
  },
  cursed_blade: {
    name: "Cursed Blade",
    slot: "weapon",
    atk: 35,
    hp: -20,
    rarity: "legend",
    desc: "+35 ATK, -20 HP | High Risk",
    price: 666,
    uniqueEffect: "cursed_power"
  }
};

// Set Bonuses Database
const SET_BONUSES = {
  vampire_set: {
    name: "Vampire Set",
    two: {
      desc: "2-Piece: +15% Lifesteal",
      lifesteal: 0.15
    },
    three: {
      desc: "3-Piece: +20% Lifesteal, +5 HP per kill",
      lifesteal: 0.20,
      hpPerKill: 5
    }
  },
  bone_set: {
    name: "Bone Lord Set",
    two: {
      desc: "2-Piece: +5 INT",
      int: 5
    },
    three: {
      desc: "3-Piece: +10 INT, +30% Spell Damage",
      int: 10,
      spellDamage: 0.30
    }
  },
  shadow_set: {
    name: "Shadow Set",
    two: {
      desc: "2-Piece: +10% Dodge",
      dodge: 0.10
    },
    three: {
      desc: "3-Piece: +20% Dodge, Phase on dodge",
      dodge: 0.20,
      phaseOnDodge: true
    }
  },
  dragon_set: {
    name: "Dragon's Wrath Set",
    two: {
      desc: "2-Piece: +10% Fire Damage",
      fireDamage: 0.10
    },
    three: {
      desc: "3-Piece: Burns enemies on hit",
      burnOnHit: true
    }
  },
  eternal_set: {
    name: "Eternal Guard Set",
    two: {
      desc: "2-Piece: +10% Block Chance",
      block: 0.10
    },
    three: {
      desc: "3-Piece: Regenerate 5% HP per turn",
      regen: 0.05
    }
  }
};

// Export to global
window.LEGENDARY_ITEMS = LEGENDARY_ITEMS;
window.SET_BONUSES = SET_BONUSES;
