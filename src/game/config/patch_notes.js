export const PATCH_NOTES = [
    {
        ver: "v38.9.1", 
        date: "2025-12-26", 
        changes: [
            "💀 CURSED ALTERNATE FIXES",
            "Fixed Midas Curse: Now correctly disables EXP gain",
            "Fixed Flesh Rot: HP Decay now correctly drains HP",
            "Fixed Chaos Dice: Implementation for 50-150% DMG variance",
            "Fixed Berserker Eye: Accuracy penalty now applies",
            "Fixed Sisyphus Stone: Boss HP Regen now functional",
            "Fixed Equipment Lock: Ascetic Vow correctly prevents equipping"
        ] 
    },
    {
        ver: "v38.9", 
        date: "2025-12-25", 
        changes: [
            "💀 CURSED ALTARS UPDATE!",
            "20+ New Mythic Cursed Relics (High Risk, High Reward)",
            "Dynamic Stats Panel: Auto-displays active curses",
            "Passive Skills now correctly reflect in Stats Panel",
            "Fixed various logic hookups for relic effects"
        ]
    },
    {
        ver: "v38.8", 
        date: "2025-12-25", 
        changes: [
            "🔊 AUDIO ENGINE EXPANSION",
            "Added 25+ New SFX (Skill impacts, Relic triggers)",
            "Ambient Soundscapes per Biome",
            "Haptic Feedback Support (Vibrate on Crit/Death)",
            "Volume Mixing (BGM vs SFX sliders)"
        ] 
    },
    {
        ver: "v38.7", 
        date: "2025-12-25", 
        changes: [
            "📱 PWA & MOBILE POLISH",
            "Screen Wake Lock (Keep screen on while playing)",
            "App Shortcuts (Long press app icon to Quick Start)",
            "Safe Area Padding for Notched Phones",
            "Touch-Optimized Hitboxes for Inventory"
        ] 
    },
    {
        ver: "v38.6", 
        date: "2025-12-25", 
        changes: [
            "🍞 TOAST NOTIFICATION SYSTEM",
            "Replaced native alerts with non-intrusive Toasts",
            "New Notification Center logic",
            "Auto-dismiss for combat logs",
            "Visual cues for Rare Drops & Level Ups"
        ] 
    },
    {
        ver: "v38.5", 
        date: "2025-12-25", 
        changes: [
            "🛍️ BLACK MARKET EXPANSION",
            "Added 'Soul Economy' (Souls as currency)",
            "Mystery Boxes (Gacha Mechanic)",
            "Inflation Logic (Prices rise per floor)",
            "Gambling Event Nodes"
        ] 
    },
    {
        ver: "v38.4", 
        date: "2025-12-25", 
        changes: [
            "🎲 RUN MODIFIERS SYSTEM!",
            "9 Challenge Modifiers: No Healing, Glass Cannon, Hardcore, Berserker, Ascetic, etc.",
            "Score & Soul Multipliers (x1.2 - x2.5)",
            "🔓 Unlock by completing Floor 100",
            "🏃 NEW STATS: AGI (Agility) & LUCK!",
            "AGI: +0.3% Dodge/pt, +0.5% Flee/pt",
            "LUCK: +0.3% Crit/pt, +0.5% Gold/pt, +Rarity",
            "💎 NEW GEMS: Jade (+AGI) & Citrine (+LUCK)",
            "⚔️ 6 New Items with AGI/LUCK stats",
            "🌳 Class Tree AGI/LUCK Integration"
        ] 
    },
    {
        ver: "v38.3", 
        date: "2025-12-25", 
        changes: [
            "💥 CRITICAL HIT FIX: Chaos Axe & Cursed Items now deal correct damage!",
            "🗑️ INVENTORY POLISH: Discard Trash logic fixed (Safe for mats)",
            "📱 MOBILE UPDATE: Quick Skill Bar & Touch targets",
            "🛡️ STABILITY: Audio engine hardening & Socket fixes"
        ] 
    },
    {
        ver: "v38.2", 
        date: "2025-12-25", 
        changes: [
            "🧹 DEEP CLEANUP",
            "Dead Code Removal: Deleted legacy_v1 and unused assets",
            "Log Sanitization: Improved security in LogPanel",
            "Complexity Reduction: Refactored nested logic in Player.js",
            "Config Extraction: Moved hardcoded formulas to config files"
        ] 
    },
    {
        ver: "v38.1", 
        date: "2025-12-25", 
        changes: [
            "🏗️ COMPONENT ARCHITECTURE",
            "Refactored 'God Components' (StartScreen, BlackMarket) into sub-components",
            "CSS Modernization: Replaced hardcoded pixels with REM & Variables",
            "UI Refactor: Extracted inline styles to CSS modules",
            "Accessibility: Added aria-labels and semantic structure"
        ] 
    },
    {
        ver: "v38.0", 
        date: "2025-12-25", 
        changes: [
            "⚙️ THE GAUNTLET: TECHNICAL FOUNDATION",
            "Major Refactor: ProgressionManager & Skills.js converted to Vue Components",
            "Dependency Injection: Removed global 'window' reliance",
            "Standardized Stores: Native GameStore integration",
            "VFX Refactor: Event-driven visual effects system"
        ] 
    },
    { ver: "v37.3.0", date: "2025-12-24", changes: ["📊 STAT ALLOCATION SYSTEM!", "Free Stat Points (+3/Level) for STR/VIT/INT", "⚔️ COMBAT 2.0: Rich Enemy Animations", "Float, Breathe, Attack Shake, Hit Flash, Boss Aura", "📱 PWA & BRANDING UPDATE", "Installable App (Add to Home Screen), New Neon Title", "Refined Ambush Progress (+10%)", "Bug Fixes: Skill Cooldowns, Save Repairs"] },
    { ver: "v37.2.0", date: "2025-12-24", changes: ["🔧 ITEM SYSTEM REFACTOR", "Converted static items to dynamic ItemFactory", "30% Reduced Memory Usage for Inventory", "Foundation for Procedural Generation", "Improved Type Safety & Validation"] },
    { ver: "v37.1.0", date: "2025-12-24", changes: ["🎨 COMPLETE POLISH UPDATE", "Reforge Undo Button (Safe Rerolling)", "Save Preview on Continue Button", "Audio Engine 2.0 (25+ New SFX)", "Visual Overhaul: Glassmorphism & Glows", "Black Market Balance Fixes", "Safety: Global Error Boundary"] },
    { ver: "v37.0.0", date: "2025-12-24", changes: ["⚒️ THE MASTER SMITH!", "Socketing: 60 gems, socket system", "Reforging: Reroll legendary stats", "Black Market: Mystery boxes, cursed items", "Dynamic Economy: Inflation, scarcity, market events", "30+ new achievements"] },
    { ver: "v36.9.0", date: "2025-12-23", changes: ["📱 MOBILE OPTIMIZATION COMPLETE", "Full Touch Support (Tap/Swipe)", "Responsive Layouts (Phone/Tablet)", "Floating Action Button (Skills)", "Performance: Debounced Search & cleanups"] },
    { ver: "v36.8.0", date: "2025-12-23", changes: ["🎨 UI/UX POLISH!", "Status Icons: Emoji icons (🔥☠️⚡) replace text", "Upgrade Badges: ⚡X shows skill investment", "Preview Tooltips: Hover for before/after stats", "Animations: Cooldown ticks, SP pulse, panel transitions", "Advanced: Skill comparison, confirmation modals, search & filter", "Keyboard Shortcuts: ESC, U, 1-5"] },
    { ver: "v36.7.0", date: "2025-12-23", changes: ["🔮 SKILL MANAGEMENT SYSTEM!", "Equip Up to 5 Skills for Combat", "Upgrade Skills with SP (Skill Points)", "Gain +2 SP per Level Up", "SP Cost Scaling: base 3 * 1.5^level", "Upgrade Paths: Power, Cooldown, Ailment boosts", "New Panel: Full skill management UI"] },
    { ver: "v36.6.0", date: "2025-12-23", changes: ["⏱️ SKILL COOLDOWN SYSTEM!", "Per-Skill Cooldown Tracking", "Cooldown Calculation: Upgrades reduce base CD first", "CDR Cap: Maximum 50% reduction", "Minimum CD: Always ≥ 1 turn", "Haste Passive: -20% all cooldowns", "Upgrade foundation for skill progression"] },
    { ver: "v36.5.0", date: "2025-12-23", changes: ["🤖 ENEMY AI REVOLUTION!", "Enemies use SKILLS intelligently (Heal, Buff, Attack)", "MP System: Enemies manage resources (+5 MP/turn)", "Cooldowns: Skills have 1-4 turn cooldowns", "UI: Enemy MP bar in combat", "Logs: Enhanced skill detection (🔮 icon)", "7 Bug Fixes: Floor progress, Combat nav, Flee %, Item turns, Rest button, Pause menu, Import save"] },
    { ver: "v36.4.2", date: "2025-12-23", changes: ["CRITICAL FIX: Soul Forge Crash (Shop Init)", "CRITICAL FIX: Mobile Clipboard (Export Save)", "UI: Class Selector Grid & Scroll Padding", "UI: Patch Notes Pagination (Readable!)"] },
    { ver: "v36.4.1", date: "2025-12-23", changes: ["MOBILE LAYOUT FIXED 📱", "Fixed 'Cut Off' UI Buttons on Mobile Browsers", "Implemented Dynamic Viewport (100dvh)", "Added Safe Area Padding for iPhone/Android Gestures"] },
    { ver: "v36.4", date: "2025-12-23", changes: ["UI OPTIMIZATION 🎨", "Mobile Layout & Buttons (Retro 3D)", "New Class Icons in Status Panel (🧙‍♂️/🛡️)", "Inventory Visuals: Item Icons & Badges", "Combat: Floating Enemy & HP Animation", "Polished Log Panel (Text & Contrast)"] },
    { ver: "v36.3", date: "2025-12-23", changes: ["Weighted Loot Rarity (Bell Curve)", "40+ Enemy-Themed Items", "Lucky Drop Notifications (✨/🍀/⭐)", "Floor Tracking Badges", "Fixed Victory Rewards (EXP/Gold/Loot)", "Fixed Merchant Stock Issues", "Luck Stat Boosts Double Drops"] },
    { ver: "v36.0", date: "2025-12-23", changes: ["THE GREAT STABILIZATION 🛡️", "Deep Code Audit & cleanup", "Fixed Ghost Enemy & Render Glitches", "Restored & Verified UI Components", "Performance Optimization"] },
    { ver: "v35.0", date: "2025-12-22", changes: ["THE ARSENAL OF VENGEANCE ⚔️", "NEW: Relic System (Global Passives)", "NEW: Relic Hunting Events", "NEW: Achievements (Relic Hunter)", "Items: Assassin Cloak, Cursed Skull"] },
    { ver: "v34.0", date: "2025-12-21", changes: ["World Map: 5 Realms to Explore", "Node System: Navigate Combat, Events, & Rest", "Visual Polish: Dynamic Backgrounds & Transitions", "Audio: Realm Ambience"] },
    { ver: "v33.1", date: "2025-12-21", changes: ["Audio Expansion: Level Up, Victory, Ascend Sounds", "VFX Juice: Screen Shake & Blood Particles", "Optimized Codebase"] },
    { ver: "v33.0", date: "2025-12-21", changes: ["New Game+: Endless Ascension Cycles", "Soft Reset: Keep Souls & Unlocks", "Difficulty Scaling (+20% per Cycle)"] },
    { ver: "v32.2", date: "2025-12-21", changes: ["Inventory Overhaul: Item Details & Safe Use", "Loot Upgrade: Gold Drops & Consolidated Logs", "UI Fixes: Auto-Scroll Logs, Boss Button Fix","Minor Bugs Fixed"] },
    { ver: "v32.1", date: "2025-12-19", changes: ["Roguelike Mode: Permadeath & Sanctuary Saving", "New Content: God-Tier Passives", "UI Polish: Start Screen Remaster"] },
    { ver: "v32.0", date: "2025-12-18", changes: ["Vue 3 Migration Complete", "Performance Optimization", "Mobile Controls"] },
    { ver: "v31.0", date: "2025-12-10", changes: ["Boss Rush Mode Added", "New Classes: Dark Knight, Necro Priest", "Balance Changes"] },
    // --- ERA 6: THE RENAISSANCE ---
    { ver: "v30.0", date: "2025-12-05", changes: ["Codebase Code Freeze", "Pre-Vue Migration Cleanup"] },
    { ver: "v29.0", date: "2025-12-01", changes: ["Hall of Bones (Leaderboard)", "Daily Dungeon Prototype"] },
    { ver: "v28.0", date: "2025-11-28", changes: ["Crafting 1.0 (Scrap/Dust)", "Skill Tree Array Structure"] },
    { ver: "v27.0", date: "2025-11-25", changes: ["Prototype Classes (DK, Priest)", "New Sets: Dragon/Eternal"] },
    { ver: "v26.0", date: "2025-11-20", changes: ["Mobile responsiveness (320px)", "Touch Listeners"] },
    // --- ERA 5: THE ULTIMATE FORM ---
    { ver: "v25.0", date: "2025-11-15", changes: ["Sovereign Edition", "Expanded Skillsets", "Evolution System"] },
    { ver: "v24.0", date: "2025-11-10", changes: ["Perk Mastery System", "Loadouts"] },
    { ver: "v23.0", date: "2025-11-05", changes: ["Refactoring & Modularization", "Memory Leak Fixes"] },
    { ver: "v22.0", date: "2025-11-01", changes: ["AI Integration (Gemini)", "Soul Speak", "Oracle"] },
    { ver: "v21.0", date: "2025-10-25", changes: ["Class Selection (Skeleton/Ghoul/Phantom)", "Save Integrity Fix"] },
    { ver: "v20.0", date: "2025-10-20", changes: ["Environmental Hazards", "Secrets & Keys"] },
    // --- ERA 4: THE NARRATIVE ---
    { ver: "v19.0", date: "2025-10-15", changes: ["Market Economy", "Sell System"] },
    { ver: "v18.0", date: "2025-10-10", changes: ["Smart Enemy AI", "Debuff Logic"] },
    { ver: "v16.0", date: "2025-10-01", changes: ["Revenge Arc (Narrative)", "Final Boss Party"] },
    { ver: "v15.0", date: "2025-09-25", changes: ["The Ascent (Reverse Dungeon Concept)"] },
    // --- ERA 3: THE SOUL ---
    { ver: "v17.0", date: "2025-10-05", changes: ["Stats Overhaul (AGI/LUCK)", "Damage Formula Fix"] },
    { ver: "v14.0", date: "2025-09-20", changes: ["Elemental Status Effects", "Combos"] },
    { ver: "v13.0", date: "2025-09-15", changes: ["Equipment Slot Split", "Dynamic Stats"] },
    { ver: "v11.0", date: "2025-09-01", changes: ["Soul Shards (Meta)", "Rarity System"] },
    // --- ERA 2: THE DUNGEON ---
    { ver: "v12.0", date: "2025-09-10", changes: ["Audio Engine (Web API)", "Bestiary"] },
    { ver: "v10.0", date: "2025-08-25", changes: ["Juice & Polish (VFX)", "UI Stacking"] },
    { ver: "v9.0", date: "2025-08-20", changes: ["Save System", "Bone Shrines"] },
    { ver: "v8.0", date: "2025-08-15", changes: ["Forked Paths (Exploration)", "Stat Checks"] },
    { ver: "v7.0", date: "2025-08-10", changes: ["MP System", "Active Skills"] },
    { ver: "v6.0", date: "2025-08-05", changes: ["Floor Progression", "Boss Battles"] },
    // --- ERA 1: THE AWAKENING ---
    { ver: "v5.0", date: "2025-08-01", changes: ["Level Up System", "Stat Allocation"] },
    { ver: "v4.0", date: "2025-07-25", changes: ["Risk & Reward Events", "Ambush"] },
    { ver: "v3.0", date: "2025-07-20", changes: ["Inventory Array", "Consumables"] },
    { ver: "v2.0", date: "2025-07-15", changes: ["Combat Prototype", "Anatomy Targeting"] },
    { ver: "v1.0", date: "2025-07-01", changes: ["Prototype", "HTML Structure", "Basic Logs"] }
];
