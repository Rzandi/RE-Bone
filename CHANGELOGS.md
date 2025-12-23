# RE:BONE - Version History

## v36.4 - UI Polish & Optimization 🎨 (2025-12-23)

**"Looks pretty, kills smoother."**

### 🎨 Visual Overhaul

- **Status Panel**: Added dynamic **Class Icons** (🧙‍♂️, 🛡️, ⚔️) replacing the generic skull.
- **Inventory**:
  - Added **Icon Placeholders** for all items based on slot/type.
  - Improved grid spacing and responsiveness.
  - Polished "Floor Badge" visuals.
- **Combat**:
  - Enemies now have a **Floating Animation** (Idle).
  - HP Bar transitions are smoother (cubic-bezier).
  - Status badges have better contrast.
- **Log Panel**: Darker background, crisper text, and better count badges.
- **Controls**: Retro 3D buttons with satisfying "push" animation & larger touch targets.

### 📱 Mobile & Optimization

- **Full Viewport**: Game now takes 100% width/height on mobile (no borders/padding).
- **Scrollbars**: Custom dark-themed scrollbars for all panels.
- **Performance**: Reduced CSS layout thrashing in Combat Panel.
- **Mobile Layout Fix (v36.4.1)**: Fixed "cut off" UI buttons on iPhone/Android browsers by implementing `100dvh` dynamic height.
- **Crash Fixes & Stability (v36.4.2)**:
  - **Soul Forge**: Fixed crash when Shop Stock was undefined (`NaN` refresh count) and wired up "Initialize Shop" button correctly.
  - **Settings**: Fixed "Export Save" crash on mobile browsers (added legacy Clipboard fallback).
  - **Class Selection**: Improved grid layout (min-width 280px) and bottom padding to prevent scroll clipping.
  - **Patch Notes**: Added pagination (4 items/page) for better readability.

---

## v36.3 - Loot & Rewards System Overhaul 🎁 (2025-12-23)

**"Fortune favors the brave."**

### 🎁 Victory Rewards FIXED

- **CRITICAL FIX**: Victory rewards now work correctly!
- ✅ EXP gain after combat
- ✅ Gold drops from enemies
- ✅ Floor completion percentage progression
- ✅ Item drops from combat
- ✅ All rewards log to LogPanel with proper icons (💰/🎁/🆙)
- ✅ Level up notifications working

### 🎲 Weighted Rarity Distribution System

- **NEW**: Enemy rarity determines loot probability distribution (bell curve)
- Uncommon enemies MOSTLY drop uncommon items (40% peak)
- But ALL rarities still possible from ANY enemy! (RNG excitement)
- Higher floors boost rare+ drop chances (+0.5% per floor, max +10%)
- **Config-based**: Easy balance changes without editing code

**Loot Distribution Table:**
| Enemy Rarity | Common | Uncommon | Rare | Epic | Legend |
|-------------|--------|----------|------|------|--------|
| Common | 50% | 30% | 15% | 4% | 1% |
| Uncommon | 30% | **40%** | 20% | 8% | 2% |
| Rare | 15% | 25% | **35%** | 20% | 5% |
| Epic | 5% | 15% | 25% | **40%** | 15% |
| Legend | 2% | 8% | 20% | 30% | **40%** |

### ✨ Lucky Drop Notifications

- **+1 tier higher**: ✨ Lucky drop! [Item] (RARITY)
- **+2 tiers higher**: 🍀 VERY LUCKY! [Item] (RARITY)!
- **+3 tiers higher**: ⭐ JACKPOT! [Item] (EPIC) from [Enemy]!
- Shows rarity and enemy name for maximum excitement

### 👾 Enemy-Themed Loot (40+ New Items!)

- **16 enemy type categories** with themed drops
- **25% chance** for contextual loot (Skeletons → Bone items)
- **New Items**:
  - 🦴 Bone Set (Dagger, Helmet, Cage, Ring)
  - 🐺 Beast Set (Claw Gauntlet, Wolf Pelt, Fang Necklace)
  - ☠️ Poison Set (Poison Dagger, Slimy Boots, Toxic Ring)
  - 🕷️ Spider Set (Web Cloak, Spider Silk, Spider Ring)
  - 🗿 Golem Set (Stone Gauntlet, Rock Shield, Earth Ring)
  - 🔥 Fire Set - EPIC (Flame Sword, Inferno Robe, Fire Ring)
  - 🌑 Shadow Set - EPIC (Shadow Blade, Dark Cloak, Void Ring)
  - And many more!

### 🍀 Luck-Based Double Drops

- **Base 5%** chance for 2x items
- **+1% per 5 luck** stat (scales with character)
- Max ~25% at 100 luck
- Shows luck percentage: "💎 LUCKY! Double drop! (Luck: 10%)"

### 🏷️ Floor Tracking System

- All equipment tagged with origin floor
- Purple "FL#" badge displayed in inventory
- Helps judge item quality and progression
- Materials/consumables excluded (clutter-free)

### 📝 Improved Item Descriptions

- All items show stats: "+10 ATK, +5 DEF, +20 HP"
- Special effects highlighted: "+10% Dodge", "Poisons on hit"
- Materials labeled: "Crafting material. [description]"

### 🛍️ Merchant Panel Fixed

- **FIXED**: No longer shows "Sold Out" on first open
- Auto-generates 5-7 items + health potion
- Refresh button (50G) working correctly

### 🔧 Technical Improvements

- **NEW FILE**: `loot_config.js` - Centralized loot configuration
- Easy balance changes for game designers
- Future-proof for new rarities (mythic ready!)
- All hardcoded values moved to config
- Single source of truth for rarity systems

### 🐛 Bug Fixes

1. Victory rewards completely broken → FIXED
2. Merchant empty panel → FIXED
3. Missing loot drops → FIXED
4. Floor progression stuck → FIXED
5. EXP not gained → FIXED

---

## v36.0 - The Great Stabilization 🛡️ (2025-12-23)

**"Order from Chaos."**

### 🛡️ Code & Stability

- **Deep Audit**: Comprehensive scan of codebase to identify and fix legacy issues.
- **Ghost Enemy Fix**: Resolved critical bug where enemies would persist after death or appear incorrectly.
- **UI Restoration**: Restored missing UI components and verified responsiveness.
- **Performance**: Optimized rendering loop for smoother gameplay.

### 🐛 Bug Fixes

- Fixed multiple render glitches.
- Fixed state inconsistencies in Combat Manager.
- Cleaned up console errors.

---

## v35.0 - The Arsenal of Vengeance ⚔️ (2025-12-22)

**"Power comes at a price."**

### 🏺 The Relic System

- **Global Passives**: Collected artifacts that provide permanent bonuses for the run.
- **Inventory Integration**: View collected relics in the Player Panel.
- **Unique Effects**:
  - **Assassin Cloak**: Double damage on first hit.
  - **Cursed Skull**: Reduces all enemy HP by 20%.
  - **Vampire Tooth**: Lifesteal effect.

### 🎭 New Content

- **Relic Events**: Special nodes where you can find or sacrifice HP for Relics.
- **Relic Hunter Achievement**: Find unique relics.
- **Visuals**: Glimmer VFX when relics trigger.

---

## v34.0 - The Revenge of the Abandoned (2025-12-21)

**"The Crossroads are open. The hunt begins."**

### 🌍 New Features: World Map & Nodes

- **World Map**: Unlocks at Floor 100. Choose from 5 Realms to invade.
- **Node System**: Traverse procedural maps with Combat, Elite, Rest, and Event nodes.
- **5 Realms**:
  - **Nature's Den** (Toxic/Forest)
  - **Shadow Guild** (Rogue/Sewer)
  - **Iron Fortress** (Industrial/Fire)
  - **Castle of Light** (Holy/Citadel)
  - **Arcane Tower** (Magic/Void)
- **Event System**: Text-based narrative choices with risks and rewards.

### 🎨 Visual & Audio Polish

- **Dynamic Themes**: Combat and Event UIs now change color based on the Active Realm.
- **Ambient Audio**: Unique procedural soundscapes for each Realm (Deep drones, high ethereal winds, etc).
- **HUD Update**: Main Header now displays the Realm Icon.
- **Transitions**: Smooth SVG connection lines on the Node Map.

### 🐛 Bug Fixes

- Fixed World State not loading correctly from save file.
- Fixed Victory Loop returning to Main Menu instead of Map.
- Fixed `CombatPanel` HTML syntax errors.

---

## v33.1 - POLISH & JUICE 🧃 (2024-12-21)

**Visuals & Audio Update**

- **Audio Engine 2.0**:
  - Added synthesized **Level Up** jingle (Arpeggio).
  - Added **Ascension** rumble effect.
  - Added **Victory** fanfare.
- **VFX Juice**:
  - **Screen Shake**: Dynamic camera shake on Critical Hits, Level Up, and taking Damage.
  - **Particles**: Blood particles spawn when hitting enemies.
- **Code Hygiene**:
  - Removed all legacy Vanilla JS files (`core/player.js`, `core/combat.js`).
  - Optimized `store.js` state management.

## v33.0 - THE ENDLESS CYCLE ♾️ (2024-12-21)

**New Game+ Update**

- **Ascension System**:
  - **Scaling Difficulty**: Enemies gain **+20% Stats and EXP** per Ascension Cycle.
  - **Endless Progression**: No limit to how high you can climb. Multipliers stack indefinitely.
  - **Soft Reset**: Prestiging now instantly resets your Character and World (Floor 1) while keeping your Meta-Progression (Souls, Upgrades, Unlocks), without reloading the page.
  - **Visuals**: Start Screen now proudly displays your current **Death Cycle**. Enemies in NG+ have a skull 💀 indicator next to their name.

## v32.4 - RE:INVENTED (Logic Patch) (2024-12-21)

**Logic & Strategy Update**

- **Combat Depth**:
  - **Status Effects**: Implemented Dot (Damage Over Time) for `Burn`, `Poison`.
  - **Buffs/Debuffs**: `Strength` and `Weakness` correctly modify damage output.
- **Refactoring**:
  - **Modernization**: `Crafting.js` and `Merchant.js` refactored to remove legacy DOM code, ensuring strict Vue reactivity.
  - **Stability**: Fixed skill tree crash in `SkillsPanel`.
- **System**:
  - **Version Sync**: Unified version number across all documentation.

## v32.2 - RE:INVENTED (UI Patch) (2024-12-21)

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

## v32.1 - The Roguelike Update (2024-12-19)

**Roguelike & Content Update**

- **Roguelike Mode**:
  - Implemented **Permadeath** mechanics.
  - **Sanctuary Saving**: Saving is only allowed at rare Sanctuary nodes.
- **New Content**:
  - Added God-Tier Passives.
  - Added new Bosses and Biomes.
- **UI Polish**:
  - Remastered Start Screen with "Hall of Bones" and "Daily Run" shortcuts.

## v32.0 - The Vue Remaster (2024-12-18)

**Technical Migration**

- **Vue 3 Migration**: Complete rewrite from Vanilla JS to Vue 3 + Vite.
- **Performance**: Significant optimization in rendering loop.
- **Mobile Controls**: Added "MobileTooltip" for long-press inspection.

## v31.0 - The Boss Rush (2024-12-10)

**Content Expansion**

- **Boss Rush Mode**: Challenge all 5 bosses consecutively.
- **New Classes**: Added **Dark Knight** and **Necro Priest**.
- **Balance Changes**: Adjusted enemy scaling and player stat curves.

---

# 📜 Legacy Version History (v22.0 - v31.0)

_Archived changelogs from the Vanilla JS era._

## [v31.0 Legacy] - Architecture Refactor & Stability 🏗️

**Release Date**: 2025-12-18

- **"Stuck at Floor 100" Fixed**: Resolved a critical syntax error in `game.js`.
- **Refactor**: Decoupled `LootManager` and `ProgressionManager` from `game.js`.

## [v29.0 Legacy] - Social Update 💀

**Release Date**: 2025-12-16

- **Hall of Bones**: Local Leaderboard.
- **Daily Dungeon**: Unique daily seeded runs.

## [v28.0 Legacy] - System Overhaul 🛠️

**Release Date**: 2025-12-16

- **Crafting**: Convert Scrap/Dust into items.
- **Salvage**: Breakdown items for materials.
- **Skill Tree**: Passives like HP, ATK, DEF.

## [v27.0 Legacy] - Content Expansion

**Release Date**: 2025-12-16

- **Classes**: Dark Knight, Necro Priest, Shadow Assassin.
- **Biome**: Crystal Caverns (Floors 75-55).
- **Items**: Dragon's Wrath Set, Eternal Guard Set.

## [v26.2 Legacy] - Mobile Optimization

**Release Date**: 2025-12-15

- **Responsive**: CSS for 320px+ screens.
- **Touch**: Added `TouchManager` for swipe/tap.

## [v25.0 Legacy] - Legendary Update

**Release Date**: 2025-12-15

- **Legendary Items**: 16 new items with unique effects (e.g. Phoenix Feather).
- **Achievements**: Track stats and unlocks.
