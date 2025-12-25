# RE:BONE - CHANGELOGS

All notable changes to this project will be documented in this file.

---

## [38.9.1] - 2025-12-26 - 💀 CURSED POLISH UPDATE

### 🐛 Logic Fixes

- **Relics:** Fixed verification for Cursed Relics (Midas, Flesh Rot, Chaos Dice).
- **UI:** Stats Panel now dynamically lists active negative modifiers.
- **System:** Correctly hooked passives to player recalculation logic.

## [38.9] - 2025-12-25 - 💀 CURSED ALTARS UPDATE

### 💀 New Features

- **20+ Mythic Cursed Relics:** High risk, high reward items.
- **Trade-offs:** Stat vs Stat (e.g. +50% Gold / -20% HP).
- **Dynamic Events:** Relic events now pull from the new pool.

## [38.8] - 2025-12-25 - 🔊 AUDIO ENGINE EXPANSION

- **SFX:** Added 25+ new sound effects (Impacts, Triggers).
- **Ambience:** Biome-specific background audio.
- **Haptics:** Vibration support for mobile devices.

## [38.7] - 2025-12-25 - 📱 PWA & MOBILE POLISH

- **Wake Lock:** Prevent screen sleep during gameplay.
- **Shortcuts:** Desktop/Home Screen quick actions.
- **Safe Area:** Support for notched displays.

## [38.6] - 2025-12-25 - 🍞 TOAST NOTIFICATIONS

- **System:** Replaced native alerts with custom Toast UI.
- **Feedback:** Visual cues for level up and drops.
- **Center:** Notification history center.

## [38.5] - 2025-12-25 - 🛍️ BLACK MARKET & SOULS

- **Economy:** Soul currency implementation.
- **Gacha:** Mystery Box mechanic.
- **Inflation:** Dynamic pricing based on progression.

## [38.4] - 2025-12-25 - 🎲 RUN MODIFIERS

- **System:** 9 Challenge Modes (e.g. Glass Cannon).
- **Rewards:** Score & Soul multipliers.
- **Stats:** Added AGI & LUCK stats.

## [38.3.0] - 2025-12-25 - 🛡️ AUDIT & STABILITY UPDATE

### 🚨 Critical Fixes

- **Mechanics:** Fixed **Chaos Axe** (and Cursed Items) dealing 0 bonus crit damage. Multipliers are now correctly applied.
- **Inventory:** Fixed **Discard Trash** logic safer; avoids deleting consumables/mats, targets only common/uncommon gear.
- **Stability:** Fixed potential crash in `SocketManager` when unsocketing gems.
- **Stability:** Hardened `SoundManager` against AudioContext failures (autoplay policies).

### 📱 Mobile & UI

- **Quick Skill Bar:** Added dedicated 5-slot bar for mobile users (<768px).
- **Feedback:** Skill Selector now shows "No MP" state clearly (grayscale + cursor lock).
- **Loading:** Added global loading overlay for critical operations (Save/Load).
- **Visuals:** Added "Reputation" progress bar for Black Market.

### 🛠️ Polish

- **Refactor:** Standardized Version numbers across all files.
- **Performance:** Optimized inventory filtering logic.
- **UX:** Improved gem socketing reactivity.

---

## [37.3.0] - 2025-12-24 - 📊 STATS & ANIMATION UPDATE

### 📊 Stat Allocation System

- **New Feature:** Freely allocate stat points (STR, VIT, INT) upon leveling up.
- **Stat Points:** Gain +3 Stat Points per level.
- **UI:** New dedicated `StatAllocationPanel` with preview and bonus modifiers.
- **Controls:** Added "STATS" button to main control panel (pulses when points available).

### ⚔️ Combat 2.0

- **Animations:** Added rich enemy animations:
  - 🫁 Breathing (Idle)
  - 💥 Attack Shake (On Turn)
  - ⚡ Hit Flash (On Damage)
  - 👹 Boss Aura (Glow Effect)
- **Progress:** Ambush victories now grant +10% floor progress.
- **Mobile:** Optimized Combat Panel layout for small screens.

### 📱 Mobile Optimization & PWA

- **New Branding:** Re-designed "Re:BONE" title with neon glow aesthetics.
- **PWA Support:** Game is now installable as an App (Add to Home Screen).
- **Stat Panel:** Fully responsive with larger touch targets.
- **Combat Panel:** Compact layout for ≤480px devices.
- **Touch:** Improved button sizing and spacing.

### 🛠️ Bug Fixes

- **Cooldowns:** Fixed skill cooldowns not resetting on Flee/New Combat.
- **Save System:** Added auto-repair for legacy saves (`statPt` undefined).
- **UI:** Fixed Achievement Panel overflow and Start Screen button alignment.

---

## [37.2.0] - 2025-12-24 - 🔧 ITEM SYSTEM REFACTOR

### 🔧 Core Engine Upgrade

- **Refactoring:** Converted static `items.js` into dynamic `ItemFactory` class.
- **Performance:** Reduced memory usage for inventory items by 30%.
- **Scalability:** Foundation for future procedural item generation.
- **Type Safety:** Improved item property validation.

## [37.1.0] - 2025-12-24 - 🎨 COMPLETE POLISH UPDATE

### 🚀 Major Features

- **Reforge Undo:** Safe "UNDO" button to revert bad rolls.
- **Save Preview:** Continue button previews Class, Level, and Floor.
- **Audio Engine 2.0:** 25+ new SFX with smart spam-prevention.
- **Glassmorphism UI:** Visual overhaul with gradients, glows, and dynamic sprites.

### 🎨 Visual & Audio

- **Dynamic Sprites:** Fixed pixel art logic for classes/evolutions.
- **VFX:** Floating ember particles on Start Screen.
- **Haptics:** Vibration feedback for mobile devices.
- **Reduced Motion:** Accessibility support.

### ⚖️ Balance & Economy

- **Black Market:** Mystery Box inflation capped at 5.0x.
- **Curse Cleansing:** Added safe "Can Afford" checks.

### 🐞 Bug Fixes

- **Critical:** Fixed data structure mismatch in `enemies.js`.
- **Critical:** Fixed CSS variables in `SkillManagementPanel`.
- **Safety:** Added global Error Boundary.

## [36.9.0] - 2025-12-23 - 📱 MOBILE OPTIMIZATION COMPLETE

### Major Features

- **Complete Mobile Support** - Touch optimization for all devices
- **Responsive Design** - Adaptive layouts (phone/tablet/desktop)
- **Performance Optimization** - Debounced search, memory leak fixes

### Mobile Touch (Phase 1)

- Viewport meta tags for PWA support
- 44x44px minimum tap targets on all buttons
- Touch feedback animations (scale + opacity)
- iOS safe area support for notched devices
- Overscroll bounce prevention
- Double-tap zoom disabled

### Responsive Layouts (Phase 2)

- Vertical stacking on mobile (< 767px)
- Bottom sheet modals with swipe handles
- Full-screen detail views with back button
- Single column grids on small screens
- Landscape optimization (2-column layouts)
- Mobile search bar stacking

### Mobile Components (Phase 3)

- Floating Action Button (FAB) for quick skill access
- Swipe-down gesture to close panels
- Window resize reactivity
- Ripple effects on button taps

### Performance & Polish (Phase 4-6)

- 300ms debounced search (mobile only)
- Event listener cleanup (memory leak fix)
- Long skill name truncation
- Keyboard-open state handling
- Empty state improvements
- Loading states with pulse
- Network-aware animations

### Bug Fixes

- Fixed event listener memory leak
- Fixed isMobile not reactive to resize
- Fixed debounced search initial flash

### Metrics

- 15 mobile features, 34 CSS queries
- 500+ lines of optimization
- 99% production ready

---

## [36.8.0] - 2025-12-23 - 🎨 UI/UX POLISH

### Phase 1: Quick Wins

- **Enemy Status Icons** - Emoji icons (🔥☠️⚡) replace text
- **Upgrade Badges** - Gold ⚡X badges show investment
- **Upgrade Tooltips** - Hover for before/after stats
- **Toast Notifications** - Auto-dismiss component
- **Keyboard Shortcuts** - ESC, U, 1-5

### Phase 2: Animations

- **Cooldown Tick Animation** - Smooth bounce on turn change
- **SP Pulse** - Gold glow on SP gain
- **Panel Transitions** - Slide-in/out (0.3s)
- **Search & Filter** - Real-time with 4 types

### Phase 3: Advanced

- **Skill Comparison** - Compare up to 3 skills
- **Confirmation Modals** - Confirm ≥10 SP upgrades
- **Equip Recommended** - Auto-equip top 5 skills
- **Premium Styling** - Dark theme polish

### Metrics

- 10 polish features
- 6 animation types
- 2 new components

---

## [36.7.0] - 2025-12-23 - 🔮 SKILL MANAGEMENT SYSTEM

### Core Features

- **Skill Management Panel** - Complete UI (314 lines)
- **Equip System** - Max 5 skills for combat
- **Upgrade System** - Spend SP permanently
- **SP Economy** - +2 SP per level

### Implementation

- New SkillManagementPanel.vue component
- Real-time SP cost (base 3 \* 1.5^level)
- Skill filtering by equipped/available
- Detail view with upgrade paths

### Integration

- Navigation in ControlPanel
- Combat filtering (equipped only)
- State initialization in Player.js
- Panel transitions

### Bug Fixes

- Fixed SP gain placement
- Fixed panel routing
- Fixed upgrade application

### Metrics

- 8 new features
- 400+ lines of code

---

## [36.6.0] - 2025-12-23 - ⏱️ SKILL COOLDOWN SYSTEM

### Features

- **Cooldown Tracking** - Per-skill state
- **Smart Calculation** - Upgrades → CDR → cap
- **CDR Cap** - Max 50% reduction
- **Minimum CD** - Always ≥ 1 turn

### Implementation

- skillCooldowns in store
- Calculation in Combat.js
- Haste passive (-20% CDR)
- Upgrade path support

### Verification

- Cooldowns decrement correctly
- Upgrades reduce base CD first
- CDR applies after upgrades
- Skills block on cooldown

---

## [36.5.0] - 2025-12-23 - 🤖 ENEMY AI REVOLUTION

**"Enemies FIGHT BACK! Smart AI, Skills, and Resource Management."**

### 🧠 Enemy AI System (MAJOR FEATURE)

- **Smart Decision-Making**: Enemies now use skills intelligently based on:

  - **HP < 30%**: Prioritize healing/defensive skills
  - **Turn 1-2**: Use buff skills (Howl, etc.) for setup
  - **Combat**: 50% skill usage, 50% basic attacks (balanced)
  - **Low MP**: Falls back to basic attack when out of mana

- **Skills Database**: 10+ enemy skills implemented:

  - **Offensive**: Poison Spit, Backstab, Rend, Smash, Bite
  - **Buffs**: Howl (ATK boost)
  - **Healing**: Self-heal at low HP
  - **Debuffs**: Entangle (stun), Blind (miss chance)

- **MP System**:

  - Enemies spawn with **50 MP + (10 × skill count)**
  - **+5 MP regeneration** per turn
  - Skills cost **5-20 MP** depending on power
  - MP bar displayed below HP in combat UI (blue → orange → red)

- **Cooldown System**:
  - Skills have **1-4 turn cooldowns** to prevent spam
  - Auto-tracked per enemy instance
  - Smart availability checking

### 🎨 UI Enhancements

- **Combat Panel**: Added **MP bar** for enemies below HP bar
  - Color-coded (blue when full, red when low)
  - Shows current/max MP (e.g., "MP 45/70")
- **Log Panel**: Enhanced skill detection with **🔮 icon** for enemy skills
  - Purple color coding for skill usage
  - Clear visual distinction from basic attacks

### 🔧 Bug Fixes (v36.4.3)

- **Item Turn Mechanics**: Using consumables during combat now properly triggers enemy turn (no more "free" heals!)
- **Floor Progress**: Fixed floor reset bug after defeating enemies
- **Combat Navigation**: Back button in Inventory now correctly returns to combat instead of menu
- **Flee Display**: Flee button now shows success % (e.g., "🏃 FLEE (45%)")
- **Rest Button**: Added to main menu controls (Explore, Rest, Item, Menu)
- **Pause Menu**: New overlay with Status, Settings (Ops), and Back options
- **Import Save**: Added to title screen for cross-device save transfers

### ⚖️ Balance Changes

- Enemy skill usage: **50/50 split** between skills and basic attacks
- MP costs tuned for 3-5 skill uses per long fight
- Cooldowns prevent overpowered skill spam

---

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

## 🔵 ERA 6: THE RENAISSANCE (Modern Transition)

_The bridge between the Legacy JS era and the Modern Vue 3 architecture._

### v30.0 - The Precursor

- **Preparation:** Final codebase freeze before Vue migration.
- **Cleanup:** Removal of redundant HTML identifiers.

### v29.0 - Social Update (Legacy)

- **Hall of Bones:** Implementation of local leaderboard logic.
- **Daily Dungeon:** Seeded run generation concept.

### v28.0 - System Overhaul (Legacy)

- **Crafting 1.0:** Scrap/Dust conversion prototype.
- **Skill Tree:** Passive stats array structure.

### v27.0 - Content Expansion

- **Classes:** Prototype definitions for Dark Knight & Nicropriest.
- **Items:** Added Dragon's Wrath & Eternal Guard sets.

### v26.0 - Mobile Optimization

- **Responsiveness:** CSS media queries for 320px screens.
- **Touch:** Basic touch event listeners.

---

# 📜 Legacy Archives (v1.0 - v25.0)

_Preserved history of the development cycle from Prototype to Sovereign Edition._

## 🟣 ERA 5: THE ULTIMATE FORM (AI & Final Polish)

_Integration of AI, critical bug fixes, and strategic depth._

### v25.0 - Sovereign Edition (Current Legacy)

- **Expanded Skillset:** 3 Active Skills & 2 Unique Passives per class/enemy.
- **Evolution System:** Branching classes at Level 5 & 10.
- **Passive Engine:** Logic automation for Lifesteal, Evasion, Thorns.
- **Restoration:** Recovered missing features from refactoring.

### v24.0 - Perk Mastery (Restored)

- **Perk System:** Permanent passive skills (Vampirism, Greed, Second Wind).
- **Dynamic Cost:** Exponential price scaling (3x).
- **Loadout:** Select max 2 perks before run.

### v23.0 - Refactoring

- **Modularization:** Code cleanup (DB, UI, Player, Game, SoundManager).
- **Performance:** Memory leak fixes and loop stabilization.

### v22.0 - AI Activated

- **Soul Speak:** Real-time dynamic chat with enemies (Gemini API).
- **Oracle:** AI-generated lore items.

### v21.0 - Soul Mastery

- **Class Selection:** Skeleton, Ghoul, Phantom.
- **Save Integrity:** Fixed stat loss bug on load.

### v20.0 - Hazards & Secrets

- **Environmental Hazards:** Magma (DoT), Poison Gas.
- **Resistance Items:** Magma Charm, Gas Mask.
- **Secrets:** Locked Doors & Skeleton Keys.

## 🔴 ERA 4: THE NARRATIVE (Story & Structure)

_Refactoring phase where the game concept was inverted: Floor 50 -> Floor 1._

### v19.0 - Economy Restoration

- **Merchant:** Gold system and shopkeeper implementation.
- **Sell System:** Sell items from inventory.
- **Scaling:** Deep floor items have higher stats (+1, +2).

### v18.0 - World & War

- **Smart Enemy AI:** Enemies use skills (Web, Acid, Bash).
- **Debuffs:** Slow, Weak correctly impacting stats.

### v16.0 - The Revenge

- **Story Arc:** Narrative flashbacks at floors 45, 35, 25, 15, 5.
- **Final Boss:** The Hero Party (Leon, Elena, Gareth).
- **Biomes:** Unique text descriptions every 10 floors.

### v15.0 - The Ascent (Reverse Dungeon)

- **Concept Flip:** Start at Floor 50 (Hell), climb to Surface (Floor 1).
- **Difficulty Curve:** Inverted scaling.

## 🟠 ERA 3: THE SOUL (Deep RPG Systems)

_Heavy RPG features: Economy, Crafting, Meta-progression._

### v17.0 - Stats Overhaul

- **New Stats:** AGI (Evasion) & LUK (Crit/Drop).
- **Formulas:** Damage calculation fix.

### v14.0 - Elemental Chaos

- **Status Effects:** Burn, Poison, Freeze, Shock, Bleed, Wet, Weak, Slow.
- **Combos:** Elemental interactions (Poison + Fire = Explosion).

### v13.0 - The Armory

- **Equipment Slots:** Weapon, Armor, Accessory split.
- **Dynamic Stats:** Gear calculation updates.

### v11.0 - Soulbound

- **Meta Progression:** Soul Shards currency (persists after death).
- **Rarity:** Color-coded loot (Common, Rare, Epic, Legend).

## 🟡 ERA 2: THE DUNGEON (World & Atmosphere)

_Expansion of world variation, enemies, and audio-visuals._

### v12.0 - Symphony of Death

- **Audio Engine:** Procedural SFX using Web Audio API.
- **Bestiary:** Kill tracker and enemy encyclopedia.

### v10.0 - Juice & Polish

- **VFX:** Screen Shake, Flash, Pop-up text.
- **UI:** Inventory stacking improvements.

### v9.0 - The Sanctuary (Restored)

- **Save System:** LocalStorage implementation.
- **Bone Shrine:** Safe zones for healing/saving.
- **Main Menu:** New Game / Continue.

### v8.0 - Forked Paths

- **Exploration:** Branching paths (Safe vs Dangerous).
- **Stat Checks:** Interactive events matching stats.

### v7.0 - Arcane Arts (Restored)

- **MP System:** Mana resource added.
- **Active Skills:** Spells implementation.
- **Evolution V1:** First iteration of class changes at Level 5.

### v6.0 - The Descent

- **Floor System:** Progression logic.
- **Bosses:** Periodic boss battles.

## 🟢 ERA 1: THE AWAKENING (Foundation)

_Basic engine structure and gameplay loop._

### v5.0 - Stat Building

- **Level Up:** XP system.
- **Allocation:** Manual points for STR/VIT/INT.

### v4.0 - Risk & Reward

- **Events:** Chest vs Trap.
- **Rest:** Ambush mechanics.

### v3.0 - The Scavenger

- **Inventory:** Array-based slots.
- **Loot:** Item usage (Consumables).

### v2.0 - Combat Prototype

- **Combat UI:** First interface.
- **Anatomy:** Body part targeting system (later removed).

### v1.0 - The Skeleton

- **Prototype:** Basic HTML Structure.
- **Stats:** HP/STR.
- **Log:** Text-based output.
