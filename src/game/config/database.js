/* =========================================
   DATABASE - Game Data & Configuration
   Aggregates all modules into a single DB object.
   ========================================= */

import { ITEMS_DB } from './items.js';
import { LEGENDARY_ITEMS } from './legendary_items.js';
import { PASSIVES_DB, SKILLS_DB, SKILL_TREES } from './skills.js';
import { CLASSES_DB } from './classes.js';
import { ENEMIES_DB, BOSSES_DB, BIOME_ENEMIES } from './enemies.js';
import { RECIPES } from './recipes.js';
import { EVOLUTIONS, CLASS_TREES } from './evolution.js';

export const DB = {
  ITEMS: {
    ...ITEMS_DB,
    ...LEGENDARY_ITEMS
  },
  PASSIVES: PASSIVES_DB,
  SKILLS: SKILLS_DB,
  SKILL_TREES: SKILL_TREES,
  CLASSES: CLASSES_DB,
  ENEMIES: ENEMIES_DB,
  BIOME_ENEMIES: BIOME_ENEMIES, // v36.2
  BOSSES: BOSSES_DB,
  RECIPES: RECIPES,
  EVOLUTIONS: EVOLUTIONS,
  CLASS_TREES: CLASS_TREES,
  
  STATUS: {
    burn: { icon: "🔥", color: "#f55" },
    poison: { icon: "☠️", color: "#0f0" },
    bleed: { icon: "🩸", color: "#f00" },
    stun: { icon: "⚡", color: "#ff0" },
    weak: { icon: "📉", color: "#aaa" },
    fear: { icon: "😱", color: "#90f" },
    hex: { icon: "🔮", color: "#f0f" },
  },
};

// Legacy Compatibility (Optional, can be removed later)
window.DB = DB;
