# 📜 Change Logs

## v32.2 (2024-12-21) - RE:INVENTED

**Major Update: Inventory & UI Overhaul**

- **Inventory System 2.0**:
  - Added **Item Detail Panel**: Click items to inspect stats/description/price before using.
  - Added **Safety Buttons**: Explicit "EQUIP" or "USE" buttons to prevent accidental consumption.
- **Loot & Economy**:
  - **Gold Drops**: Enemies now drop Gold based on level and floor scaling.
  - **Consolidated Logs**: Combined simple combat logs into rich, single-line summaries (e.g., `LOOT: +50 XP, +10 G, [Sword]`).
  - **Floor Clean-up**: Game logs are auto-cleared upon entering a new floor.
- **UX Improvements**:
  - **Auto-Scroll**: Combat logs now automatically stick to the bottom.
  - **Start Screen**: Updated version branding to "RE:INVENTED".
- **Documentation**:
  - **Unified History**: Merged all legacy Vanilla JS changelogs (v22-v31) into this file.
  - **Architecture Guide**: Updated README to reflect Vue 3 structure + Game Mechanics.
- **Bug Fixes**:
  - Fixed `encounterBoss` crash.
  - Fixed Merchant Menu not appearing.
  - Fixed items missing from Inventory UI due to prop connection issues.

## v32.1 (2024-12-19)

**Roguelike & Content Update**

- **Roguelike Mode**:
  - Implemented **Permadeath** mechanics.
  - **Sanctuary Saving**: Saving is only allowed at rare Sanctuary nodes.
- **New Content**:
  - Added God-Tier Passives.
  - Added new Bosses and Biomes.
- **UI Polish**:
  - Remastered Start Screen with "Hall of Bones" and "Daily Run" shortcuts.

## v32.0 (2024-12-18)

**Technical Migration**

- **Vue 3 Migration**: Complete rewrite from Vanilla JS to Vue 3 + Vite.
- **Performance**: Significant optimization in rendering loop.
- **Mobile Controls**: Added "MobileTooltip" for long-press inspection.

## v31.0 (2024-12-10)

**Content Expansion**

- **Boss Rush Mode**: Challenge all 5 bosses consecutively.
- **New Classes**: Added **Dark Knight** and **Necro Priest**.
- **Balance Changes**: Adjusted enemy scaling and player stat curves.

---

# 📜 Legacy Version History (v22.0 - v31.0)

_Archived changelogs from the Vanilla JS era._

## [v31.0] - Architecture Refactor & Stability 🏗️

**Release Date**: 2025-12-18

### 🚨 Critical Fixes

- **"Stuck at Floor 100" Fixed**: Resolved a critical syntax error in `game.js` that caused progression to freeze.
- **Syntax Cleanup**: Fixed dangling commas and extra braces throughout codebase.

### 🏗️ Major Refactor (The "God Object" Fix)

- **LootManager** (`js/managers/loot.js`):
  - Extracted all drop logic, rarity calculation, and legendary handling.
  - Decoupled from core Game loop.
- **ProgressionManager** (`js/managers/progression.js`):
  - Extracted Level Up, Evolution, and Class Mutation UI logic.
  - Centralized UI state management for progression.
- **Game.js Cleanup**:
  - Reduced file size by ~200 lines.
  - Now focuses strictly on Core Loop (Explore -> Combat -> Repeat).

## [v29.0] - Social Update 💀

**Release Date**: 2025-12-16

### Added

- **Hall of Bones (Leaderboard)**:
  - Local tracking of Top 20 Runs.
  - Displays Class, Level, Floor, and Total Score.
  - New Main Menu integration.
- **Daily Dungeon**:
  - A unique challenge generated every 24 hours.
  - **Global Modifiers**: Effects like _Glass Cannon_ (High DMG, Low HP) or _Gold Rush_.
  - Fixed seed ensures all players face the same challenge on the same day.
  - 20% Score Bonus for Daily Runs.
- **Social Implementation**:
  - `SocialManager` handles `localStorage` persistence.
  - **Score Formula**: Calculated based on Floor, Level, Gold, and Boss Kills.

## [v28.0] - System Overhaul 🛠️

**Release Date**: 2025-12-16

### Added

- **Crafting System**:
  - Convert materials (`Scrap`, `Dust`, `Leather`, `Essence`) into items.
  - **Recipes**: Potions, Basic Gear, and Legendary Upgrades.
  - **Legendary Crafting**: Create `Dragon Claw` and `Aegis Shield` using rare fragments.
- **Salvage Mode**:
  - Breakdown unwanted items in inventory.
  - Returns materials based on item Rarity and Slot.
  - Chance to find **Legendary Fragments** (<10%) from high-tier items.
- **Skill Tree System**:
  - **Skill Points (SP)** earned on Level Up.
  - Unlockable passive bonuses (`HP`, `ATK`, `DEF`, `VIT`, `INT`).
  - Dedicated **Skills Panel** UI to manage progression.
- **New Materials**:
  - `Scrap Metal`, `Magic Dust`, `Tough Leather`, `Dark Essence`.
  - `Dragon Fragment`, `Void Fragment`.

## [27.0] - 2025-12-16 - CONTENT EXPANSION

### 🎉 Major Content Update

#### Added

- **3 New Classes**
  - **Dark Knight** 🛡️: HP sacrifice mechanic, high damage.
  - **Necro Priest** 🔮: Sustain mage, damage reflection.
  - **Shadow Assassin** 🗡️: Stealth, critical hits.
- **New Biome: Crystal Caverns** 💎
  - Floors 75-55 (Alternative path).
  - New Theme: Cyan/Dark Purple neon aesthetic.
  - New Enemies: Crystal Golem, Shard Wisp.
  - New Boss: **Prism Construct** (Floor 70).
- **New Legendary Items**
  - **Dragon's Wrath Set** 🔥: Fire damage & burn focus.
  - **Eternal Guard Set** 🛡️: Tanking & HP regen.
  - **Standalone Items**: Void Walker Boots, Mirror Shield, Cursed Blade.

## [26.2] - 2025-12-15 - MOBILE OPTIMIZATION

### 🎉 Mobile-Ready Release

#### Added

- **Mobile Optimization**
  - Comprehensive responsive CSS (`mobile.css`)
  - Support for 320px - 1024px+ screens
  - Touch-optimized UI (55px min button height)
  - Special landscape mode optimizations
  - Safe area support for notched devices
  - PWA-ready meta tags
- **Touch Handler Module** (`mobile.js`)
  - Auto touch device detection
  - Button touch feedback
  - Double-tap zoom prevention (iOS)
  - Swipe gesture framework
  - Mobile toast notifications
  - Landscape detection

## [26.1] - 2025-12-15 - CODE QUALITY

### 🎉 Code Quality Improvements

#### Added

- **JSDoc Documentation**
  - Comprehensive comments for 13 functions
  - Type hints and parameter documentation
- **Constants Module** (`constants.js`)
  - Extracted 30+ magic numbers
  - Single source of truth for values
  - Animation durations centralized
  - Game balance values organized

## [26.0] - 2025-12-15 - POLISH & BALANCE

### 🎉 Polish Update

#### Added

- **Inventory System Enhancements**
  - Sort buttons (Rarity, Type, Name, ATK)
  - Filter buttons (All, Weapon, Armor, Accessory)
  - Item comparison tooltips (green ↑ / red ↓)
  - Quick-swap equipment (⚡ click to equip)
  - Auto-sort button
  - Item lock/favorite system (🔒/🔓)
- **Enhanced Tooltips**
  - Stat breakdown tooltips (HP/MP hover)
  - Shows Base + Equipment calculation
  - Set bonus display
  - Color-coded stat differences
- **Visual Polish**
  - Achievement unlock popup animations
  - Screen flash effects
  - Color-coded damage numbers (physical/magic/heal/critical)
  - Larger critical hit numbers with rotation
  - Legendary item glow effects
  - Set item indicators (⚡)

## [25.0] - 2025-12-15 - MAJOR UPDATE

### 🎉 SPRINT 2: Legendary Items & Game Modes

#### Added

- **Legendary Item System**
  - 16 unique legendary items with special effects
  - 3 complete item sets (Vampire, Bone Lord, Shadow)
  - Set bonus system (2-piece and 3-piece bonuses)
  - 4 rarity tiers: Common → Rare → Epic → Legend
- **Boss Rush Mode**
  - Fight all 5 bosses consecutively
  - Limited healing between encounters (+20 HP, +10 MP)
  - Victory rewards: 500 gold + 2 legendary items
- **Achievement System**
  - 14 achievements across multiple categories
  - Progress tracking (heal X HP, defeat Y bosses)
  - LocalStorage persistence
- **Unique Legendary Effects**
  - Bloodfang: +10% lifesteal
  - Phoenix Feather: Auto-revive at 60% HP (consumes item)
  - Time Crystal: Extra turn on kill
  - Shadow Cloak: +15% dodge
  - Soul Reaper: +3 HP per kill
  - Eternal Grimoire: -1 MP cost on all skills
  - Mana Siphon Ring: +3 MP when enemy uses skill
  - Berserker Helm: +ATK at low HP

## [24.0] - 2025-12-14 - SPRINT 1.5 COMPLETE

### 🎮 Skill & Passive Mechanics

#### Added - Core Skill Mechanics

- **Lifesteal System**
  - Blood Drain: 50% lifesteal
  - Bat Swarm: 30% lifesteal per hit
  - Vampirism passive: 20% lifesteal on basic attacks
- **Multi-Hit Attacks**
  - Bat Swarm: 3 hits at 0.8x power each
  - Staggered damage visuals (150ms delay)
- **Ignore DEF Mechanic**
  - Phase Strike bypasses enemy defense completely

## [23.0] - 2025-12-14 - SPRINT 1 COMPLETE

### 🗺️ Foundation: 100 Floors & Biomes

#### Added

- **Extended Dungeon**: Expanded from 50 to 100 floors with dynamic difficulty scaling.
- **Biome System**: 5 unique biomes with distinct themes (Ruins, Caverns, Dark Dungeon, Crypt, Abyss).
- **New Classes**: Vampire, Lich, Wraith.
- **Enemy Expansion**: Added 16 new enemy types and 5 boss encounters.
