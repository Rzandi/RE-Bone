3. Endless Mode System
   3.1 Lore & Story Background
   The Endless Descent
   "Beyond the Iron Fortress lies the Abyss Gate - a tear in reality that leads to infinite darkness. Those who enter never return, but legends speak of treasures beyond imagination for those brave enough to descend..."

Story Context
After defeating the Warlord King at Floor 100:
"The fortress crumbles, revealing an ancient portal.
You feel an overwhelming pull toward the darkness beyond.
The souls of fallen warriors
whisper:
'The Endless awaits. Only the worthy may descend.'"
┌──────────────────────────────────────┐
│ THE ABYSS GATE HAS OPENED │
│ │
│ "Beyond lies infinite challenge. │
│ There is no return. No salvation. │
│ Only the climb." │
│ │
│ [ENTER THE ENDLESS] [CLAIM VICTORY]│
└──────────────────────────────────────┘
Realm Lore in Endless
Floor Range Realm Lore
101-120 🌲 Corrupted Nature "The Den has grown wild, consuming all light."
121-140 🌑 Abyssal Shadow "The Guild has been swallowed by the void."
141-160 🔥 Hellfire Citadel "The Castle burns with unholy flames."
161-180 ❄️ Frozen Pinnacle "The Tower is encased in eternal ice."
181-200 ⚡ Storm Fortress "The Fortress rages with elemental fury."
201+ 🌀 The Chaos Core "Reality itself unravels. All realms merge."
Endless Boss Lore
Boss Floor Lore
The Amalgam 125 "A twisted fusion of all realm guardians."
Time Warden 150 "A being that exists outside of time itself."
The Void 175 "Pure nothingness given form and hunger."
Primordial 200 "The first being. The source of all undeath."
3.2 Integration with Ascension, Realm & Biome
Ascension Integration
Ascension Level affects Endless Mode:
├─ Difficulty Scaling: +20% enemy stats per ascension level
├─ Soul Rewards: +10% souls per ascension level
├─ Starting Floor: Can start from checkpoint (requires ascension 1+)
├─ Meta Upgrades: All ascension upgrades apply
└─ Score Multiplier: +10% score per ascension level
Realm Integration (Cycling)
Floor 101-120: 🌲 Nature Realm (Thorns, Poison enemies)
Floor 121-140: 🌑 Shadow Realm (Dodge-heavy, Stealth enemies)
Floor 141-160: 🔥 Fire Realm (High DMG, DOT enemies)
Floor 161-180: ❄️ Ice Realm (Slow, Freeze enemies)
Floor 181-200: ⚡ Storm Realm (Random elements)
Floor 201+: 🌀 Chaos Realm (All elements mixed)
Cycle repeats every 100 floors with +50% scaling
Biome Integration
Each Realm has 3-4 Biomes that rotate every 5 floors:
Nature Realm Biomes:
├─ Forest: +10% EXP, normal enemies
├─ Swamp: -10% speed, poison pools
├─ Grove: +healing, nature spirits
└─ Corrupted: +25% difficulty, corrupted enemies
Biome Modifiers stack with Endless scaling:
├─ Movement speed affects flee chance
├─ Environmental damage every X turns
├─ Unique enemy types per biome
└─ Special loot tables per biome
Boss Structure in Endless
Every 10 floors: Mini-Boss (scaled realm boss)
Every 25 floors: Mega-Boss (new endless-only bosses)
Every 50 floors: Realm Guardian (super boss + checkpoint)
Every 100 floors: Ascended Boss (requires specific strategy)
Endless-Only Bosses:
├─ The Amalgam (Floor 125) - Combines all realm elements
├─ Time Warden (Floor 150) - Rewinds player buffs
├─ The Void (Floor 175) - Disables items temporarily
├─ Primordial (Floor 200) - Final form, unlocks Chaos Realm
└─ [Procedural Bosses] - Random combinations after floor 200
World Map Integration
NORMAL MODE (Floor 1-100):
┌─────────────────────────────────────────────┐
│ World Map: Choose Realm → Node Map │
│ │
│ 🌳 Nature's Den (Floor 1-20) │
│ └─ Node Map: 4 layers, 3-4 nodes each │
│ └─ Nodes: Combat, Event, Merchant, Rest│
│ └─ Boss at final node │
│ │
│ 🗡️ Shadow Guild (Floor 21-40) │
│ 🏰 Castle of Light (Floor 41-60) │
│ 🔮 Arcane Tower (Floor 61-80) │
│ 🛡️ Iron Fortress (Floor 81-100) │
└─────────────────────────────────────────────┘
ENDLESS MODE (Floor 101+):
┌─────────────────────────────────────────────┐
│ World Map: LOCKED (linear progression) │
│ │
│ Procedural Node Map Generation: │
│ ├─ New map every 20 floors (realm cycle) │
│ ├─ Increased Combat nodes (60% → 80%) │
│ ├─ Decreased Rest nodes (limited healing) │
│ ├─ More Elite nodes appear │
│ └─ Every 50 floors: Special Checkpoint Map │
│ │
│ Visual Changes: │
│ ├─ Map background changes per realm │
│ ├─ Node icons show scaling level │
│ ├─ Progress bar shows endless floor # │
│ └─ Checkpoint nodes glow golden │
└─────────────────────────────────────────────┘
Endless Node Types
Node Type Frequency Description
⚔️ Combat 60% Scaled enemies by floor
💀 Elite 15% Mini-boss enemies, +50% rewards
🎭 Event 10% Challenge events (from 1.2)
🛒 Merchant 8% Scaled shop prices
⛺ Rest 5% Limited healing (50% max)
✨ Checkpoint 2% Every 50 floors, full heal + save
Map Transition Flow
Floor 100 Boss Defeated
↓
Victory Screen
"ENDLESS MODE UNLOCKED"
↓
┌─────────────────┐
│ Continue to │
│ Endless Mode? │
│ [YES] [NO] │
└─────────────────┘
↓
(YES) Generate Endless Map
↓
Floor 101: Nature Realm (Endless) - New procedural node map - Realm visual: Nature + Dark tint - Showing "Endless Floor 1 (101)"
2.2 Floor Progression Summary
Floor 1-100: Normal Progression (5 Realms)
└─ World Map: Choose realm
└─ Node Map: Navigate nodes
└─ Floor 20: Realm 1 Boss (Nature)
└─ Floor 40: Realm 2 Boss (Shadow)
└─ Floor 60: Realm 3 Boss (Fire/Light)
└─ Floor 80: Realm 4 Boss (Arcane)
└─ Floor 100: Final Boss → Endless Mode Option
Endless Mode (Floor 101+):
└─ World Map: Locked (auto-progression)
└─ Node Map: Procedural generation
└─ Realm cycles (every 20 floors)
└─ Biome rotation (every 5 floors)
└─ Score tracking for leaderboards
└─ Checkpoints every 50 floors
2.2 Scaling Formula
// Enemy scaling for Endless Mode
const endlessFloor = currentFloor - 100;
const scalingFactor = 1 + endlessFloor _ 0.05; // +5% per floor
const ascensionBonus = 1 + ascensionLevel _ 0.2; // +20% per ascension
enemyStats.hp _= scalingFactor _ ascensionBonus;
enemyStats.atk _= scalingFactor _ ascensionBonus;
enemyStats.exp _= 1 + endlessFloor _ 0.02; // +2% exp per floor
enemyStats.gold _= 1 + endlessFloor _ 0.03; // +3% gold per floor
2.3 Endless Mode Features
Realm Cycling: Floor 101-120 = Nature, 121-140 = Shadow, etc.
Mini-Bosses: Every 10 floors
Mega-Bosses: Every 25 floors (new boss types)
Checkpoints: Every 50 floors (can resume from here)
Score System: Distance × Kills × Modifier bonus
2.4 Files to Modify/Create
[NEW] src/game/managers/EndlessMode.js
export const EndlessMode = {
isActive: false,
startFloor: 100,
checkpoints: [],
score: 0,
getScalingFactor(floor) { ... },
cycleRealm(floor) { ... },
getEndlessBoss(floor) { ... },
calculateScore() { ... }
};

[MODIFY]
src/game/core/game.js
Add endless mode trigger at floor 100
Add checkpoint system
Integrate realm cycling
[MODIFY]
src/game/managers/loot.js
Improved loot tables for endless mode 3. Leaderboard System
3.1 Score Calculation
score = baseScore _ modifierMultiplier _ ascensionMultiplier
baseScore = (floor _ 100) + (kills _ 10) + (bossKills _ 500) + (goldEarned / 10)
modifierMultiplier = product of all active modifier multipliers
ascensionMultiplier = 1 + (ascensionLevel _ 0.1)
3.2 Local Leaderboard (v38.4)
// Stored in localStorage
leaderboard: [
{
name: "Player1",
score: 125000,
floor: 150,
class: "Death Knight",
modifiers: ["no_healing", "glass_cannon"],
ascensionLevel: 5,
date: "2025-12-25",
},
];
3.3 Files to Create
[NEW] src/game/managers/Leaderboard.js
Save/load from localStorage
Sort and display top 10
Filter by mode (Normal, Endless, Daily)
[NEW]
src/components/LeaderboardPanel.vue
Display rankings
Player entry submission 4. Implementation Order
Phase 1: Run Modifiers (Quick Win)
Create modifiers.js config
Add runModifiers to store
Create RunSetupPanel.vue
Apply modifier effects in
Player.js
Block healing logic
Phase 2: Challenge Events
Add event definitions to modifiers.js
Create event trigger in exploration
Add event UI/rewards
Phase 3: Endless Mode
Create EndlessMode.js manager
Add floor 100 trigger
Implement scaling formula
Add realm cycling
Add checkpoint system
Phase 4: Leaderboards
Create Leaderboard.js manager
Create
LeaderboardPanel.vue
Add score calculation
Save on death/complete 5. Verification Plan
Automated Tests
npm run build # Must pass
npm run dev # Visual testing
Manual Testing
Start new game → Select modifiers → Verify effects active
Play through floors 1-100 → Trigger endless mode
Verify enemy scaling in endless mode
Die → Verify leaderboard entry saved
Check leaderboard displays correctly

Edge Cases
Run Modifiers Edge Cases
Case Expected Behavior
Select multiple conflicting modifiers Show warning, allow anyway
Glass Cannon + No Healing Both apply, very hard
Modifier during boss fight Effects persist
Save/load with modifiers Modifiers persist
Modifier disabled mid-run Not allowed (locked)
Hardcore + resurrection item Resurrection disabled
Endless Mode Edge Cases
Case Expected Behavior
Player reaches floor 100 but doesn't want endless Allow return to title with souls
Player dies at floor 150 Save to leaderboard, offer checkpoint resume
Checkpoint resume after game update Handle version mismatch gracefully
Realm cycle at floor 200+ Chaos realm with mixed elements
Enemy HP overflow (very high floors) Cap at MAX_SAFE_INTEGER
Loot table at floor 500+ All items legendary+, high scaling
Player disconnect mid-endless Auto-save every 5 floors
Ascension + Endless Edge Cases
Case Expected Behavior
Ascension 10 + Endless floor 200 Extreme scaling, special rewards
Prestige during endless run Keep endless progress as separate save
Meta upgrades affect endless All upgrades apply with multipliers
Soul rewards at high floors Capped growth to prevent inflation
New ascension unlock during endless Show notification, apply after death
Challenge Event Edge Cases
Case Expected Behavior
Event during No Healing modifier Healing rewards converted to gold
Gambling Den with 0 gold Cannot participate, skip
Boss Rematch without previous boss Skip to next available
Multiple events same floor Queue system, one at a time
Event interrupts save Event state saved
Gauntlet with 1 HP Allow, high risk
Devil's Deal at 1 HP Block, would kill player
Leaderboard Edge Cases
Case Expected Behavior
Score overflow Cap at MAX_SAFE_INTEGER
Duplicate names Allow, show date/time
localStorage full Purge oldest entries
Import save with leaderboard Merge leaderboards
Cheated score detection Hash verification (basic)
Name contains special chars Sanitize input
Save System Edge Cases (Endless)
Case Expected Behavior
Player tries pause menu save in endless Show alert: "Save disabled. Find Sanctuary!"
Player tries export save in endless Block with warning: "Cannot export during Endless run"
Sanctuary node appears Allow full save + heal
Browser crash during endless Auto-save at floor transitions only
Import save with active endless run Warn: "This will overwrite endless progress"
Player at checkpoint tries to quit Confirm: "Progress saved at checkpoint. Continue later?"
Daily Challenge Edge Cases
Case Expected Behavior
Player already completed daily Show score, block retry
Daily resets mid-run Allow completion, score counts for previous day
Player opens daily at 23:59 Lock in that day's seed until completion
No internet for daily seed Use cached seed or fallback
Daily + Endless conflict Daily is separate mode, no endless access
UI/UX Edge Cases
Case Expected Behavior
Modifier panel opened mid-combat Block, show "Complete current battle first"
Challenge event during boss fight Queue for after boss
Multiple UI panels open Stack limit, auto-close oldest
Mobile touch during animation Debounce inputs
Endless floor number > 999 Compact display (e.g., "1.2K")
Performance Edge Cases
Case Expected Behavior
1000+ items in inventory Pagination, lazy loading
500+ floor endless run Clear old combat logs
Memory leak from VFX Auto-cleanup stale effects
Long session (4+ hours) Periodic garbage collection
