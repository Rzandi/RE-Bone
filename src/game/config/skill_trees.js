/* =========================================
   SKILL TREES DATABASE (v28.0)
   ========================================= */

export const SKILL_TREES = {
  // Skeleton Warrior / General Tree (for now shared?)
  // Ideally per class, but let's start with a shared "Undead Mastery" for basics
  
  general: {
    name: "Undead Essence",
    nodes: {
      toughness: {
        id: "toughness",
        name: "Bone Toughness",
        desc: "Max HP +20",
        cost: 1,
        req: null,
        effect: { hp: 20 }
      },
      sharpness: {
        id: "sharpness",
        name: "Sharpened Claws",
        desc: "ATK +5",
        cost: 1,
        req: null,
        effect: { atk: 5 }
      },
      resilience: {
        id: "resilience",
        name: "Dark Resilience",
        desc: "DEF +5",
        cost: 2,
        req: "toughness",
        effect: { def: 5 }
      },
      vitality: {
        id: "vitality",
        name: "Unholy Vitality",
        desc: "VIT +10",
        cost: 3,
        req: "toughness",
        effect: { vit: 10 }
      },
      wisdom: {
        id: "wisdom",
        name: "Ancient Wisdom",
        desc: "INT +10",
        cost: 3,
        req: "sharpness",
        effect: { int: 10 }
      }
      // Future: Class specific trees
    }
  }
};

// window.SKILL_TREES = SKILL_TREES;
