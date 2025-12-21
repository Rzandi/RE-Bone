# 🗺️ RE:BONE - Future Roadmap Strategy

This document outlines the strategic vision for the next major updates of **RE:BONE**, moving from a linear dungeon crawler to a fully realized Roguelike with branching paths and meta-progression.

---

## 📅 Phase 1: The Revenge of the Abandoned (v34.0)

**Focus**: _Node-Based Exploration & Revenge Narrative_

**Core Loop**: Reach Floor 100 -> Unlock World Map -> Hunt 5 Traitors.

- [x] **1. World Map (The Crossroads)**

  - Select one of 5 Realms to invade.
  - **The 5 Realms**:
    1.  **Castle of Light** (Paladin's Domain)
    2.  **Shadow Guild** (Rogue's Hideout)
    3.  **Arcane Tower** (Mage's Spire)
    4.  **Nature's Den** (Druid's Forest)
    5.  **Iron Fortress** (Warrior's Citadel)

- [x] **2. The Fractal Biomes (5x5 System)**

  - Each Realm contains **5 Unique Sub-Biomes** (Total: 25 Biomes).
  - _Example (Nature's Den)_: `Swamp`, `Deep Forest`, `Fungal Cave`, `Riverbank`, `Elf Village`.
  - Each Biome has unique **Environmental Effects** (Buffs/Debuffs).

- [x] **3. The Army of Vengeance (Enemy Randomizer)**

  - To ensure variety, **Every Biome** has a massive pool:
    - **5 Trash Mobs** (Common fodder)
    - **5 Elite Enemies** (High stats, unique skills)
    - **5 Mini-Bosses** (Gatekeepers)
    - **5 Bosses** (Pool of major threats)
  - **Total**: 500+ Unique Enemies planned across the expansion.

- [x] **4. Procedural Infiltration**
  - Use the Node Map system to traverse these biomes randomly.
  - Fight through the army to reach the **Traitor** at the end of the Realm.

---

## 📅 Phase 2: The Arsenal of Vengeance (v35.0)

**Focus**: _Class Expansion, Relics, & Traitor Loot_

With the **Revenge Arc** active (v34), we need powerful tools to hunt the Traitors.

- [ ] **1. Traitor Classes (Unlockables)**

  - Defeating a Guild Leader permanently unlocks their Class.
  - **Paladin**: Defeat the Lord of Light. (Uses _Faith_ resource).
  - **Druid**: Defeat the Keeper of the Den. (Shapeshifting).
  - **Berserker**: Defeat the Iron King. (Uses _Rage_).
  - **Mechanist**: Defeat the Arcane Tinker. (Turrets).

- [ ] **2. Soul Weapons (Traitor Loot)**

  - Unique "God-Tier" weapons dropped by bosses.
  - _Excalibur_: Deals Holy/Physical mix dmg.
  - _Nature's Wrath_: Summons vines on hit.

- [ ] **3. Relic System (Global Modifiers)**
  - Found in the new **Elite Nodes**.
  - Passive bonuses that last for the entire run.
  - _Examples_:
    - "Vampire Tooth": Heal 1 HP on kill.
    - "Merchant's Coin": Shops are 20% cheaper.
    - "Cursed Idol": +50% Gold, but -20% Max HP.

---

## 📅 Phase 3: The Great Stabilization (v36.0)

**Focus**: _Mobile Polish, Code Audit, & Stability_

After the massive content injection of v34/v35, the game will likely be unstable. v36 is the "Cooldown" update.

- [ ] **1. Deep Scan & Bug Hunt**

  - **Audit**: Full codebase scan to find memory leaks from the 500 new enemies.
  - **Balancing**: Analyzing player data to nerf/buff the 25 new Biomes.
  - **Performance**: Optimizing the Node Map for mobile devices.

- [ ] **2. Mobile Optimization**

  - **Haptics API**: Vibrate on critical hits.
  - **Cloud Save**: Export/Import save strings.
  - **UI Overhaul**: Ensure the new Map UI works on portrait mode.

- [ ] **3. Quality of Life**
  - **Bestiary**: A log tracking the 500 enemies you've encountered.
  - **Quick-Restart**: Instant retry after death.

---

## 📅 Phase 4: The Master Smith (v37.0)

**Focus**: _Economy, Balancing, & Advanced Crafting_

- [ ] **1. Socketing & Reforging**

  - **Socketing**: Items spawn with "Slots" for Gems (Ruby=ATK, Sapphire=MP).
  - **Reforging**: Reroll random stats on Legendary Gear using Souls.

- [ ] **2. The Black Market (Gambling System)**

  - A hidden shop that accepts **Souls** instead of Gold.
  - **Gacha Mechanics**: Buy "Mystery Boxes" with variable rarity chances.
  - **High Risk**: Chance to get "Cursed" items (High Stats, Fatal Debuffs).

- [ ] **3. Dynamic Economy & Balancing**
  - **Inflation**: Merchant prices increase by 10% per Realm cleared.
  - **Scarcity**: Potions become more expensive if you buy too many.
  - **Item Synthesis**: Combine 3 items of the same tier to create 1 item of higher rarity (Common -> Rare -> Epic).

---

## 📅 Phase 5: The Gauntlet (v38.0)

**Focus**: _Hardcore Risks & High Scores_

- [ ] **1. Run Modifiers (The Pact)**
  - At the start of a run, choose up to **3 Challenges** from a random pool of 10.
  - **Rewards**: Each Challenge grants **+X% Score** and **+Y% Soul Drops**.
  - **Mechanics**:
    - **Refresh**: 1 Free re-roll of the challenge pool.
    - **Skip**: "No" button to play normally.
    - **Confirm**: Pop-up "CHALLENGE ACCEPTED: DEATH IS THE ONLY OPTION".
- [ ] **2. The Challenge Pool (Examples)**

  - _Glass Cannon_: Player HP cap is 1. (+50% Souls)
  - _Broke_: Gold drops are disabled. (+20% Score)
  - _Blind_: Fog of War is permanent. (+30% Souls)
  - _Pacifist_: Cannot use weapons (Skills only). (+100% Score)

- [ ] **3. Dynamic In-Game Challenges**
  - Random "Cursed Altars" found in Event Nodes.
  - Accept a mid-run curse for a massive immediate reward (e.g., gain 1000 Gold, but lose 50% Max HP).

---

## 📅 Phase 6: The Truth of Re:Bone (v39.0)

**Focus**: _Narrative Climax & The Final Seal_

**The Prerequisite**: The Gate to Floor 101 only opens if you possess all **5 Soul Weapons** (obtained by hunting the Traitors in v34/v35).

- [ ] **1. The Hidden Floor (The Void)**

  - A surreal biome made of memories.
  - Enemies here are "Echoes" of your past forms.

- [ ] **2. The Narrative Twist (The Awakening)**

  - **Lore Reveal**: Why did the Party abandon you?
  - **The Truth**: They didn't abandon you. They **sealed** you. You were never the hero; you were the _World Eater_. The "Traitors" were the heroes protecting the world from _YOU_.

- [ ] **3. The True Final Boss**

  - **The Seal Keeper**: The entity ensuring you remain dead.
  - **Mechanic**: Moveset changes based on which Class you are playing.

- [ ] **4. The Final Choice (Ending)**

  - **Option A (Revenge)**: Kill the Keeper and consume the world. (Triggers Endless Ascension).
  - **Option B (Redemption)**: Sacrifice your Power (Souls) to restore the world. (Unlocks "God Mode" / Sandbox).

- [ ] **5. The Multifaceted Finale (Class Endings)**

  - The Epilogue text changes based on your **Class & Evolution**:
    - **Lich (Redemption)**: You become the Guardian of the Dead, ensuring souls rest in peace.
    - **Vampire Lord (Revenge)**: You turn the world into an eternal night kingdom.
    - **Paladin (Redemption)**: You rebuild the Order of Light from the ashes.
    - **Berserker (Revenge)**: You destroy everything, leaving only a barren wasteland.

- [ ] **6. The Final Secret (Hidden Class)**
  - **Class**: **The World Eater** 🌌
  - **Unlock Condition**: Complete the game once & collect 5 _Eater Fragments_ (Hidden in each Realm).
  - **Playstyle**: Overpowered. Uses "Void Energy". Can consume enemies to gain their stats permanently.

---

## 📅 Phase 7: The Masterpiece (v40.0)

**Focus**: _Final Polish, Feedback, & The "Complete" Experience_

After the Story concludes in v39, v40 is the **"Gold" Release**.

- [ ] **1. The Great Purge (Bug Fixes)**

  - A zero-tolerance policy on bugs.
  - Full optimization of the 500-enemy database.
  - Final balance pass on all 6 Classes.

- [ ] **2. The Feedback Loop**

  - **In-Game Review**: After the credits roll, ask players:
    - _"Which Boss was the hardest?"_
    - _"Which mechanics did you hate?"_
  - **Community Hall**: A featured section showing the most popular Builds and Deaths.

- [ ] **3. The Completionist's Tome**
  - **Museum Mode**: View all 30 Legendary Items and their lore in a gallery.
  - **Stats History**: Lifetime stats (Total Kills, Total Damage, Deaths).

---

## 🌍 The Lore of Re:Bone (Narrative Integration)

**Focus**: _World Building & Immersion_

To make the world feel alive, we will infuse NARRATIVE into every system:

- [ ] **1. Exploration Narrative**

  - **Event Nodes**: Instead of just "You found a chest", you get a mini-story: _"You stumble upon the corpse of a royal guard, clutching a key..."_
  - **Transition Logs**: Unique text when entering a new Floor/Biome.

- [ ] **2. Biome Backstories (Latar Tempat)**

  - **Castle of Light**: Once the seat of the Alliance, now blinded by its own zealous light.
  - **Nature's Den**: A forest that grew wild after the Druid Leader merged with the World Tree.
  - **Iron Fortress**: A factory of war that never stopped churning, even after peace was declared.

- [ ] **3. The Bestiary (Enemy Lore)**

  - Unlocking an enemy entry reveals **Why** it exists.
  - _Skeleton_: "Soldiers who died waiting for orders that never came."
  - _Void Beast_: "A glitch in reality caused by the Player's Ascension."

- [ ] **4. Artifact Lore (Item Descriptions)**

  - Every Legendary Item tells a piece of the Traitors' history.
  - _Example_: **Paladin's Shield** - _"It protected everyone... except the one who mattered most."_

- [ ] **5. The Betrayal (v34 Narrative Layer)**

  - **The Paladin (Light)**: Believed you were too dangerous to live, so he blinded you.
  - **The Rogue (Shadow)**: Feared your power would consume the guild, so he poisoned you.
  - **The Mage (Arcane)**: Wanted to study your "World Eater" essence, so he sealed you in time.
  - **The Druid (Nature)**: Saw you as an aberration of nature, so she buried you alive.
  - **The Warrior (Iron)**: Simply wanted to prove he was stronger, so he broke your bones.

- [ ] **6. The Soul Economy (v37 Narrative Layer)**

  - **The Collector (Charon)**: The NPC running the Black Market.
  - _Lore_: He is not interested in Gold. He collects Souls to ferry them to the Afterlife... or to feed the Seal Keeper.
  - _Dialogue_: "Another soul for the pile? Or perhaps you'd like to buy back a piece of your humanity?"

- [ ] **7. The Gauntlet (v38 Narrative Layer)**
  - **The Seal's Defense**: The "Challenges" are not random. They are the Seal's immune system trying to reject you.
  - _Glass Cannon_: "The Seal strips your physical form."
  - _Blind_: "The Light of the Paladin still burns your eyes."

---

## ⚠️ Risk Analysis & Suggestions (Kritik & Saran)

**1. The "Content Bloat" Risk**

- **Critique**: Creating 500 unique enemies (5x5x20) is a _monumental_ task for a solo/small team.
- **Suggestion**: Use **Procedural generation** for enemy stats/names instead of hand-crafting 500 sprites. Re-color existing sprites (e.g., Red Skeleton = Magma Skeleton).

**2. Balancing Nightmare**

- **Critique**: Balancing 5 new Classes against 25 Biomes is mathematically difficult. Power creep is inevitable.
- **Suggestion**: Implement **Dynamic Scaling** (Enemies scale with Player Level, not just Floor) to keep old biomes relevant.

**3. Mobile Memory Usage**

- **Critique**: Loading assets for 25 biomes might crash low-end phones.
- **Suggestion**: Implement **Asset Lazy Loading** (Only load the current biome's assets).
