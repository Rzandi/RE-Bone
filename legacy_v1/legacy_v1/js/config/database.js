/* =========================================
   DATABASE - Game Data & Configuration
   ========================================= */

const DB = {
  ITEMS: {
    ...window.ITEMS_DB,
    ...window.LEGENDARY_ITEMS
  },
  PASSIVES: window.PASSIVES_DB,
  SKILLS: window.SKILLS_DB,
  CLASSES: window.CLASSES_DB,
  ENEMIES: window.ENEMIES_DB,
  BOSSES: window.BOSSES_DB,
  
  STATUS: {
    burn: { icon: "🔥", color: "#f55" },
    poison: { icon: "☠️", color: "#0f0" },
    bleed: { icon: "🩸", color: "#f00" },
    stun: { icon: "⚡", color: "#ff0" },
  },
};

window.DB = DB;
