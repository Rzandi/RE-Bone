# 🎮 Re:BONE - Vue Edition

**Version**: v37.1.0 POLISH COMPLETE 🎨✨  
**Genre**: Pixel Art Dungeon Crawler  
**Platform**: Web Browser (Desktop + Mobile PWA) 📱  
**Status**: Production Ready ✅

---

## 📖 Overview

**Re:BONE** is a retro-style pixel art dungeon crawler featuring deep character progression, legendary items, set bonuses, and challenging boss encounters. Descend through 100 floors of increasingly difficult dungeons across 5 unique biomes.

**Now remastered in Vue 3 + Vite for enhanced stability and mobile performance.**

### ✨ Key Features

- 🗺️ **100-Floor Dungeon** with 5 distinct biomes (Ruins, Caverns, Dark Dungeon, Crypt, Abyss).
- 🦸 **6 Unique Character Classes** (Skeleton, Zombie, Ghost, Vampire, Lich, Wraith).
- ⚔️ **Dynamic Combat**: Turn-based battles with multi-hit attacks, lifesteal, and status effects.
- 🎨 **Visuals 2.0** (v37.1): Glassmorphism UI, Dynamic Pixel Sprites, Ember VFX.
- 🔊 **Audio 2.0** (v37.1): 25+ SFX, Ambient Soundscapes, Smart Audio Engine.
- ⚒️ **Reforge & Socketing**: Customize gear with Gems and localized Undo logic.
- 🔮 **Skill Management System** (v36.7): Equip up to 5 skills, upgrade with SP, permanent progression.
- 💎 **Loot System**: 26 Legendary Items, Set Bonuses, and Rarity Scaling (Common -> Mythic).
- 🏆 **Endgame Modes**: Boss Rush Mode & Hall of Bones Leaderboard.
- 💾 **Roguelike Progression**: Permadeath with Sanctuary-based saving.
- 📱 **Fully Mobile Optimized** (v36.9): Touch controls, responsive layouts, FAB button, swipe gestures.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)

### Installation

```sh
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 🎮 Game Mechanics

### Character Classes

| Class          | Theme          | Specialization            |
| -------------- | -------------- | ------------------------- |
| **Skeleton**   | Undead Warrior | Balanced melee combat     |
| **Zombie**     | Tank           | High HP, poison attacks   |
| **Ghost**      | Evasion        | Dodge-focused, ethereal   |
| **Vampire** 🦇 | Lifesteal      | Sustain through healing   |
| **Lich** 💀    | Necromancer    | Magic damage, auto-revive |
| **Wraith** 👻  | Phaser         | Ignore DEF, high dodge    |

### Loot & Sets

Collect powerful sets to unlock unique bonuses:

- **🦇 Vampire Set**: Lifesteal + HP per kill.
- **💀 Bone Lord Set**: Massive Spell Damage.
- **👻 Shadow Set**: High Dodge & Phase Strike.

### Controls

**Menu Navigation**:

- **NEW GAME**: Start a fresh run.
- **CONTINUE**: Resume from last Sanctuary save.
- **DAILY RUN**: Special seeded challenge.

**Combat**:

- **ATTACK**: Basic physical strike.
- **SKILL**: Class-specific abilities (Uses MP).
- **ITEM**: Open Inventory/Equipment.
- **FLEE**: Attempt to escape (Risk of failure).

---

## 🛠️ Architecture (Vue 3)

The project has been migrated from Vanilla JS to a component-based **Vue 3** architecture.

- **`src/game/`**: Core Game Logic (Framework Agnostic).
  - `core/`: `Game.js` (Loop), `Player.js` (State).
  - `config/`: Database files (`items.js`, `enemies.js`).
  - `store.js`: Reactive State Bridge.
- **`src/components/`**: UI Components (e.g., `InventoryPanel.vue`, `CombatPanel.vue`).
- **`src/App.vue`**: Main Application Layout.

---

## 📝 Change Log

Detailed patch notes and version history can be found in [CHANGELOGS.md](CHANGELOGS.md).

---

## 🎨 Credits

**Development**: [Rzandi]  
**Powered By**: Gemini AI ✨  
**Engine**: Custom Vue 3 + Vite Engine

_Last updated: v37.1.0 (Dec 2025)_
