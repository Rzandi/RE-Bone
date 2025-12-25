export const EVENTS_DB = {
    // 🕵️ HIDDEN / SECRET EVENTS (Triggered by History)
    hidden: [
        {
            id: 'shadow_king_return',
            reqEvents: ['shadow_poster', 'shadow_throne'],
            title: "The True King",
            text: "You have torn down the lies and visited the empty throne. The shadows now recognize you as their master.",
            choices: [
                {
                    txt: "Claim the Crown",
                    resultText: "You place the shadow crown on your head. ALL stats increase.",
                    effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { 
                        Player.gainStat('str', 2);
                        Player.gainStat('int', 2);
                        Player.gainStat('vit', 2);
                        gameStore.log("All Stats +2", "buff");
                    }
                },
                {
                    txt: "Destroy the Crown",
                    resultText: "You need no crown. The shadows serve you anyway. (+500 XP)",
                    effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(500); }
                }
            ]
        },
        {
            id: 'nature_awakens',
            reqEvents: ['nature_shrine', 'forest_tree'],
            title: "Nature's Awakening",
            text: "Because you cleansed the Shrine and fed the Tree, the Spirit of the Forest appears.",
            choices: [
                {
                    txt: "Accept Blessing",
                    resultText: "Your body blooms with vitality. (+10 Max HP)",
                    effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => {
                        Player.gainStat('maxHp', 10);
                        Player.heal(100);
                        gameStore.log("+10 Max HP", "buff");
                    }
                },
                {
                    txt: "Ask for Power",
                    resultText: "The spirit infuses your weapon with thorns. (+3 ATK)",
                    effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => {
                        Player.gainStat('atk', 3);
                        gameStore.log("+3 ATK", "buff");
                    }
                }
            ]
        },
        {
            id: 'rat_uprising',
            reqEvents: ['sewer_rat_king'], // Only need to befriend the Rat King
            title: "The Squeaking Horde",
            text: "The Rat King remembers your tribute. His army is ready to help.",
            choices: [
                {
                    txt: "Command them to Loot",
                    resultText: "Thousands of rats scour the sewers. They bring you... everything.",
                    effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => {
                        gameStore.state.gold += 200;
                        gameStore.log("Found 200 Gold!", "item");
                    }
                },
                {
                    txt: "Learn their Sneaky Ways",
                    resultText: "You move like a rat. (+10% Dodge)",
                    effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => {
                        Player.gainStat('dodge', 0.10);
                        gameStore.log("+10% Dodge", "buff");
                    }
                }
            ]
        }
    ],

    // 🌍 REALM / BIOME SPECIFIC EVENTS
    realms: {
        // --- 1. NATURE'S DEN ---
        nature_den: [
            {
                title: "Overgrown Shrine",
                text: "Vines choke an ancient statue of a forgotten goddess.",
                choices: [
                    {
                        txt: "Clear Vines (Strength)",
                        req: { type: "stat", stat: "str", val: 10 },
                        resultText: "The statue hums. You feel revitalized.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.heal(50); }
                    },
                    {
                        txt: "Meditate",
                        resultText: "You find peace in the silence. (Full MP)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { gameStore.state.mp = gameStore.state.maxMp; gameStore.log("Full Mana", "buff"); }
                    }
                ]
            },
            {
                title: "Druidic Circle",
                text: "A circle of stones hums with faint magic.",
                choices: [
                    { txt: "Touch Stones", resultText: "Nature's power flows into you. (+Max MP)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('maxMp', 5); gameStore.log("+5 Max MP", "buff"); } },
                    { txt: "Leave", resultText: "You respect the ancient magic." }
                ]
            }
        ],
        swamp: [
            {
                title: "Sinking Chest",
                text: "A treasure chest is slowly sinking into the mud.",
                choices: [
                    {
                        txt: "Leap for it!",
                        resultText: "You snatch it just in time, but get muddy.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { 
                            if(Math.random() > 0.4) {
                                gameStore.state.gold += 50; 
                                gameStore.log("Found 50 Gold!", "item");
                            } else {
                                const dmg = Math.floor(Player.maxHp * 0.10);
                                Player.takeDamage(dmg);
                                gameStore.log(`You slipped! -${dmg} HP (10%)`, "damage");
                            }
                        }
                    },
                    { txt: "Let it sink", resultText: "It vanishes into the sludge." }
                ]
            },
            {
                title: "Gas Bubble",
                text: "A large bubble of swamp gas rises nearby.",
                choices: [
                    { txt: "Pop it", resultText: "It explodes! Poison gas covers you.", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { const dmg = Math.floor(Player.maxHp * 0.08); Player.takeDamage(dmg); gameStore.log(`-${dmg} HP (8%)`, "damage"); } },
                    { txt: "Bottle it", req: { type: "stat", stat: "int", val: 10 }, resultText: "You collect the volatile gas. (Item? No, just XP for now)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(25); } }
                ]
            }
        ],
        deep_forest: [
            {
                id: 'forest_tree',
                title: "Ancient Whispering Tree",
                text: "The tree's face looks tired. 'Water...' it groans.",
                choices: [
                    {
                        txt: "Give Life (10 HP)", 
                        req: { type: "hp", val: 11 },
                        resultText: " 'Not water... but it will do.' The tree drops a fruit.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { 
                            const dmg = Math.floor(Player.maxHp * 0.05);
                            Player.takeDamage(dmg);
                            Player.gainStat('maxHp', 5);
                            gameStore.log("Max HP +5", "buff");
                        }
                    },
                    { txt: "Ignore", resultText: "The tree falls silent." }
                ]
            },
            {
                title: "Lost Fawn",
                text: "A magical creature is trapped in a snare.",
                choices: [
                    { txt: "Free it", resultText: "It blesses you before vanishing. (+Luck)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('luck', 1); gameStore.log("+1 Luck", "buff"); } },
                    { txt: "Eat it", resultResult: "You monster. (+Health)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.heal(50); } }
                ]
            }
        ],
        fungal_cave: [
            {
                title: "Glowing Mushroom",
                text: "It pulses with strange neon light.",
                choices: [
                    {
                        txt: "Eat it",
                        resultText: "Colors swirl... You feel dizzy but stronger.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { 
                            Player.gainStat('str', 2);
                            Player.gainStat('int', -1);
                            gameStore.log("+2 STR, -1 INT", "buff");
                        }
                    },
                    { txt: "Harvest (Sell)", resultText: "You keep it for later. (+20g)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainGold(20); } }
                ]
            },
            {
                title: "Spore Cloud",
                text: "A thick cloud of spores blocks the way.",
                choices: [
                    { txt: "Run through", resultText: "Cough! Cough! (-HP)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { const dmg = Math.floor(Player.maxHp * 0.08); Player.takeDamage(dmg); gameStore.log(`-${dmg} HP (8%)`, "damage"); } },
                    { txt: "Hold Breath (VIT)", req: { type: "stat", stat: "vit", val: 10 }, resultText: "You make it safely.", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(20); } }
                ]
            }
        ],
        riverbank: [
            {
                title: "Washed Up Cargo",
                text: "A crate from a shipwreck washes ashore.",
                choices: [
                    {
                        txt: "Smash Open",
                        resultText: "Supplies!",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainGold(40); gameStore.log("Found 40 Gold", "item"); }
                    },
                    { txt: "Kick it", resultText: "It was empty anyway." }
                ]
            },
            {
                title: "Fisherman's Corpse",
                text: "Half-eaten by something.",
                choices: [
                    { txt: "Loot", resultText: "Found a hook. (+ATK)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('atk', 1); gameStore.log("+1 ATK", "buff"); } },
                    { txt: "Bury", resultText: "Rest in peace. (+XP)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(30); } }
                ]
            }
        ],
        elf_village: [
            {
                title: "Ghostly Sentinel",
                text: "A transparent elf aims a bow at you.",
                choices: [
                    {
                        txt: "Show Respect",
                        resultText: "He lowers the bow and fades. You feel lucky.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('luck', 1); gameStore.log("Luck Up", "buff"); }
                    },
                    { 
                        txt: "Attack", 
                        resultText: "Your weapon passes through him. He shoots you.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { const dmg = Math.floor(Player.maxHp * 0.15); Player.takeDamage(dmg); gameStore.log(`-${dmg} HP (15%)`, "damage"); }
                    }
                ]
            },
            {
                title: "Burned House",
                text: "The embers are still warm.",
                choices: [
                    { txt: "Search Ash", resultText: "A fire-proof ring? (+DEF)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('def', 1); gameStore.log("+1 DEF", "buff"); } },
                    { txt: "Leave", resultText: "Nothing but soot." }
                ]
            }
        ],

        // --- 2. SHADOW GUILD ---
        shadow_guild: [
            {
                id: 'shadow_poster',
                lore: "The poster was covering an ancient royal sigil.",
                title: "Wanted Poster",
                text: "A poster offers a reward for a 'Bone Monster'. That's you.",
                choices: [
                    {
                        txt: "Tear it down",
                        resultText: "You remove the evidence. (+XP)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(30); }
                    },
                    { txt: "Ignore", resultText: "You stay in the shadows." }
                ]
            }
        ],
        sewers: [
            {
                id: 'sewer_rat_king',
                title: "Rat King",
                text: "A massive rat wearing a crown blocks the path.",
                choices: [
                    {
                        txt: "Pay Tribute (20g)",
                        req: { type: "gold", val: 20 },
                        resultText: "He squeaks and gives you a shiny thing.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { 
                            gameStore.state.gold -= 20;
                            Player.gainStat('dodge', 0.05);
                            gameStore.log("+5% Dodge", "buff");
                        }
                    },
                    { txt: "Kick", resultText: "He bites you!", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { const dmg = Math.floor(Player.maxHp * 0.05); Player.takeDamage(dmg); gameStore.log(`-${dmg} HP (5%)`, "damage"); } }
                ]
            },
            {
                title: "Drain Pipe",
                text: "Something shiny glitters inside.",
                choices: [
                    { txt: "Reach in", resultText: "It's slime... and a coin! (+10g)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainGold(10); } },
                    { txt: "Leave", resultText: "Gross." }
                ]
            }
        ],
        rooftops: [
            {
                title: "Chimney Stash",
                text: "Someone hid a bag in this chimney.",
                choices: [
                    {
                        txt: "Reach in",
                        resultText: "You find loot, but get covered in soot.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainGold(45); }
                    },
                    { txt: "Leave it", resultText: "Not worth the dirt." }
                ]
            },
            {
                title: "Tightrope",
                text: "A plank connects two roofs.",
                choices: [
                    { txt: "Cross (DEX)", req: { type: "stat", stat: "dex", val: 10 }, resultText: "Easy balance. (+XP)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(40); } },
                    { txt: "Jump", resultText: "You fall!", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { const dmg = Math.floor(Player.maxHp * 0.10); Player.takeDamage(dmg); gameStore.log(`-${dmg} HP (10%)`, "damage"); } }
                ]
            }
        ],
        market: [
            {
                title: "Shady Merchant",
                text: " 'Psst. Wanna buy a mystery box?' ",
                choices: [
                    {
                        txt: "Buy (100g)",
                        req: { type: "gold", val: 100 },
                        resultText: "It contains... a bomb! (Just joking, it's a potion)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { 
                             gameStore.state.gold -= 100;
                             Player.heal(100);
                        }
                    },
                    { txt: "No thanks", resultText: "He vanishes." }
                ]
            },
            {
                title: "Pickpocket",
                text: "A street urchin bumps into you.",
                choices: [
                    { txt: "Check Pockets", resultText: "Hey! He took 10g!", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { gameStore.state.gold -= 10; } },
                    { txt: "Catch him (DEX)", req: { type: "stat", stat: "dex", val: 15 }, resultText: "You catch him. He drops the loot. (+20g)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainGold(20); } }
                ]
            }
        ],
        dungeon: [
            {
                title: "Torture Rack",
                text: "An old device stained with blood.",
                choices: [
                    {
                        txt: "Scavenge Parts",
                        resultText: "You found some iron spikes.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('str', 1); gameStore.log("+1 STR", "buff"); }
                    },
                    { txt: "Break it", resultText: "You smash it to pieces. Good." }
                ]
            },
            {
                title: "Cell Door",
                text: "A locked door. Someone might be inside.",
                choices: [
                    { txt: "Pick Lock", resultText: "Empty... except for a skeleton. (+XP)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(30); } },
                    { txt: "Kick it open", resultText: "The noise attracts guards!", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { const dmg = Math.floor(Player.maxHp * 0.05); Player.takeDamage(dmg); gameStore.log(`-${dmg} HP (5%)`, "damage"); } }
                ]
            }
        ],
        throne: [
            {
                id: 'shadow_throne',
                lore: "The throne feels warm, as if recently occupied.",
                title: "The Empty Throne",
                text: "The Shadow King is long gone.",
                choices: [
                    {
                        txt: "Sit on it",
                        resultText: "Shadows coil around you. Power flows.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { 
                            Player.gainStat('int', 2); 
                            const dmg = Math.floor(Player.maxHp * 0.05);
                            Player.takeDamage(dmg);
                            gameStore.log("+2 INT, -10 HP", "buff");
                        }
                    },
                    { txt: "Leave", resultText: "It's not your kingdom... yet." }
                ]
            }
        ],

        // --- 3. CASTLE OF LIGHT ---
        light_castle: [
            {
                title: "Confession Booth",
                text: "A priest awaits behind the screen. He cannot see you.",
                choices: [
                    {
                        txt: "Confess Sins (Heal)",
                        resultText: "The light heals you despite your nature.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.heal(30); }
                    },
                    {
                        txt: "Rob Poor Box",
                        resultText: "You stole 25 gold. You monster.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { gameStore.state.gold += 25; gameStore.log("Stole 25 Gold", "item"); }
                    }
                ]
            }
        ],
        courtyard: [
            {
                title: "Training Dummy",
                text: "A straw knight used for practice.",
                choices: [
                    {
                        txt: "Practice Attack",
                        resultText: "You tear it to shreds. Good form.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(25); }
                    },
                    { txt: "Ignore", resultText: "Wood does not fight back." }
                ]
            },
            {
                title: "Garden Maze",
                text: "Topiary bushes form a confusing path.",
                choices: [
                    { txt: "Navigate (INT)", req: { type: "stat", stat: "int", val: 15 }, resultText: "You find a lost ring! (+LUCK)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('luck', 1); gameStore.log("+1 Luck", "buff"); } },
                    { txt: "Burn it down", resultText: "The smoke alerts guards! (Start Combat? Not yet.)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(10); } }
                ]
            }
        ],
        cathedral: [
            {
                title: "Stained Glass",
                text: "A masterpiece depicting the 'Hero'.",
                choices: [
                    {
                        txt: "Admire",
                        resultText: "The art is undeniable.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('int', 1); }
                    },
                    {
                        txt: "Shatter It",
                        resultText: "Glass rains down. You feel rebellious.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('str', 1); gameStore.log("+1 STR", "buff"); }
                    }
                ]
            },
            {
                title: "Holy Water Font",
                text: "A basin of glowing water.",
                choices: [
                    { txt: "Drink", resultText: "It burns your undead throat!", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { const dmg = Math.floor(Player.maxHp * 0.10); Player.takeDamage(dmg); gameStore.log(`-${dmg} HP (10%)`, "damage"); } },
                    { txt: "Corrupt it", req: { type: "mp", val: 10 }, resultText: "It turns black. (+Dark DMG - unimplemented, so +INT)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { gameStore.state.mp -= 10; Player.gainStat('int', 1); } }
                ]
            }
        ],
        barracks: [
            {
                title: "Weapon Rack",
                text: "Standard issue Paladin blades.",
                choices: [
                    {
                        txt: "Steal one",
                        resultText: "It's heavy, but sharp.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('str', 1); }
                    },
                    { txt: "Leave", resultText: "You have better weapons." }
                ]
            },
            {
                title: "Sleeping Guard",
                text: "A squire is napping on duty.",
                choices: [
                    { txt: "Slit Throat", resultText: "Grim work. (+XP)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(50); } },
                    { txt: "Steal Purse", resultText: "Easy money. (+30g)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainGold(30); } }
                ]
            }
        ],
        library: [
            {
                title: "Forbidden Scroll",
                text: "Hidden behind a holy text is a dark scroll.",
                choices: [
                    {
                        txt: "Read it (-20 HP)",
                        req: { type: "hp", val: 21 },
                        resultText: "Your eyes burn, but you understand.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { 
                            const dmg = Math.floor(Player.maxHp * 0.10);
                            Player.takeDamage(dmg);
                            Player.gainStat('int', 3);
                            gameStore.log("+3 INT", "buff");
                        }
                    },
                    { txt: "Burn it", resultText: "Safety first." }
                ]
            },
            {
                title: "Silence Spell",
                text: "The room is unnaturally quiet.",
                choices: [
                    { txt: "Study Spell", resultText: "You learn to focus. (+Max MP)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('maxMp', 10); gameStore.log("+10 Max MP", "buff"); } },
                    { txt: "Scream", resultText: "No sound comes out.", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => {} }
                ]
            }
        ],
        sanctum: [
            {
                title: "High Priest's Desk",
                text: "Notes about an impending 'Crusade'.",
                choices: [
                    {
                        txt: "Read Plans",
                        resultText: "You learn their tactics. (+DEF)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('def', 2); gameStore.log("+2 DEF", "buff"); }
                    },
                    {
                        txt: "Steal Symbol",
                        resultText: "A golden holy symbol. (+60g)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainGold(60); }
                    }
                ]
            }
        ],

        // --- 4. ARCANE TOWER ---
        arcane_tower: [
            {
                title: "Floating Book",
                text: "A grimoire drifts past you, dripping with ink.",
                choices: [
                    {
                        txt: "Read it (+INT)",
                        resultText: "Your mind expands... painfully.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { 
                            Player.gainStat('int', 1); 
                            const dmg = Math.floor(Player.maxHp * 0.03);
                            Player.takeDamage(dmg); 
                            gameStore.log("+1 INT, -5 HP", "buff");
                            SoundManager.play('event_mystery');
                        }
                    },
                    {
                        txt: "Catch it",
                        resultText: "It bites your hand!",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { const dmg = Math.floor(Player.maxHp * 0.05); Player.takeDamage(dmg); gameStore.log(`-${dmg} HP (5%)`, "damage"); SoundManager.play('event_bad'); }
                    }
                ]
            }
        ],
        library_void: [
            {
                title: "Zero Gravity Zone",
                text: "Everything floats here.",
                choices: [
                    {
                        txt: "Meditate",
                        resultText: "You float and recharge.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { 
                            gameStore.state.mp = gameStore.state.maxMp; 
                            SoundManager.play('event_good');
                        }
                    },
                    { txt: "Push off wall", resultText: "Weeee!", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(15); } }
                ]
            },
            {
                title: "Ink Storm",
                text: "A tornado of written words.",
                choices: [
                    { txt: "Absorb Words", req: { type: "stat", stat: "int", val: 20 }, resultText: "Knowledge is power. (+INT)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('int', 2); gameStore.log("+2 INT", "buff"); SoundManager.play('event_good'); } },
                    { txt: "Duck", resultText: "Paper cuts avoided.", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => {} }
                ]
            }
        ],
        lab: [
            {
                title: "Bubbling Vat",
                text: "Green slime bubbles aggressively.",
                choices: [
                    {
                        txt: "Drink it",
                        resultText: "It tastes like lime... and poison.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { 
                            const r = Math.random();
                            if(r > 0.6) { Player.heal(50); gameStore.log("Healed!", "buff"); SoundManager.play('event_good'); }
                            else if (r > 0.3) { const dmg = Math.floor(Player.maxHp * 0.15); Player.takeDamage(dmg); gameStore.log(`Poisoned! -${dmg} HP (15%)`, "damage"); SoundManager.play('event_bad'); }
                            else { Player.gainStat('str', 2); gameStore.log("Mutated! +2 STR", "buff"); SoundManager.play('event_mystery'); }
                        }
                    },
                    { txt: "Kick it over", resultText: "The floor melts.", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => {} }
                ]
            },
            {
                title: "Homunculus Jar",
                text: "A small creature taps on the glass.",
                choices: [
                    { txt: "Break Glass", resultText: "It scurries away, leaving a shiny stone. (+Item? No, Gold)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainGold(50); SoundManager.play('loot'); } },
                    { txt: "Tap Back", resultText: "It mocks you.", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(5); } }
                ]
            }
        ],
        observatory: [
            {
                title: "Star Gazer",
                text: "A telescope pointed at the Void.",
                choices: [
                    {
                        txt: "Look",
                        resultText: "You see something looking back. (+INT)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { 
                            Player.gainStat('int', 2); 
                            Achievements.unlock('void_gazer');
                            SoundManager.play('event_mystery');
                        }
                    },
                    { txt: "Walk away", resultText: "Don't stare into the abyss." }
                ]
            },
            {
                title: "Meteor Fragment",
                text: "A rock humming with cosmic energy.",
                choices: [
                    { txt: "Touch", resultText: "Shocking! (-HP, +Max MP)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { const dmg = Math.floor(Player.maxHp * 0.10); Player.takeDamage(dmg); Player.gainStat('maxMp', 10); gameStore.log(`-${dmg} HP (10%), +10 MaxMP`, "buff"); SoundManager.play('event_mystery'); } },
                    { txt: "Mine it", resultText: "Extract star metal. (+DEF)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('def', 1); gameStore.log("+1 DEF", "buff"); SoundManager.play('loot'); } }
                ]
            }
        ],
        construct: [
            {
                title: "Scrap Pile",
                text: "Dead golems.",
                choices: [
                    {
                        txt: "Scavenge",
                        resultText: "You find usable metal.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('def', 1); gameStore.log("+1 DEF", "buff"); SoundManager.play('loot'); }
                    },
                    { txt: "Leave", resultText: "Rust and dust." }
                ]
            },
            {
                title: "Active Conveyor",
                text: "Belts moving parts into a furnace.",
                choices: [
                    { txt: "Grab Part (DEX)", req: { type: "stat", stat: "dex", val: 20 }, resultText: "Yoink! Found a gear.", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainGold(40); SoundManager.play('loot'); } },
                    { txt: "Jam it", resultText: "The machine stops. (+XP)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(50); } }
                ]
            }
        ],
        pinnacle: [
            {
                title: "Mana Storm",
                text: "Raw magic lightning strikes the roof.",
                choices: [
                    {
                        txt: "Channel it (+Max MP)",
                        resultText: "POWER OVERWHELMING! (-50 HP)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { 
                            Player.gainStat('maxMp', 20); 
                            const dmg = Math.floor(Player.maxHp * 0.25);
                            Player.takeDamage(dmg);
                            SoundManager.play('event_bad'); // It hurts!
                        }
                    },
                    { txt: "Hide", resultText: "You wait it out." }
                ]
            }
        ],

        // --- 5. IRON FORTRESS ---
        iron_fort: [
            {
                title: "War Machine",
                text: "A half-built catapult points towards the horizon.",
                choices: [
                    {
                        txt: "Sabotage",
                        resultText: "You jam the gears. (+XP)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(40); SoundManager.play('hit'); }
                    },
                    {
                        txt: "Fire it!",
                        resultText: "It launches a rock into the distance. Crash! (+STR)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('str', 1); gameStore.log("+1 STR", "buff"); SoundManager.play('hazard'); }
                    }
                ]
            }
        ],
        forge: [
            {
                title: "Molten Pit",
                text: "Liquid metal flows like water.",
                choices: [
                    {
                        txt: "Dip Weapon",
                        resultText: "Your weapon glows red hot. (+DMG)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('atk', 2); gameStore.log("+2 ATK", "buff"); SoundManager.play('evo'); }
                    },
                    { txt: "Too hot", resultText: "You wipe the sweat away." }
                ]
            },
            {
                title: "Master Smith's Hammer",
                text: "Resting on an anvil.",
                choices: [
                    { txt: "Lift it (STR)", req: { type: "stat", stat: "str", val: 25 }, resultText: "Heavy! But you feel strong.", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('str', 2); gameStore.log("+2 STR", "buff"); SoundManager.play('event_good'); } },
                    { txt: "Steal Ingot", resultText: "Burned your hand!", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { const dmg = Math.floor(Player.maxHp * 0.03); Player.takeDamage(dmg); gameStore.log(`-${dmg} HP (3%)`, "damage"); SoundManager.play('event_bad'); } }
                ]
            }
        ],
        mine: [
            {
                title: "Cave In",
                text: "Rocks tumble from the ceiling!",
                choices: [
                    {
                        txt: "Dodge! (DEX)",
                        resultText: "You roll to safety.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(20); }
                    },
                    {
                        txt: "Tank it (VIT)",
                        req: { type: "stat", stat: "vit", val: 20 },
                        resultText: "You catch a boulder. Impressive.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('def', 2); gameStore.log("+2 DEF", "buff"); SoundManager.play('hit'); }
                    }
                ]
            },
            {
                title: "Gem Vein",
                text: "Sparkling gems in the wall.",
                choices: [
                    { txt: "Pickaxe", resultText: "Rich! (+100g)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainGold(100); SoundManager.play('loot'); } },
                    { txt: "Claw", resultText: "Only got a few. (+20g)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainGold(20); SoundManager.play('loot'); } }
                ]
            }
        ],
        armory: [
            {
                title: "Masterwork Shield",
                text: "A beautiful shield hangs on the wall.",
                choices: [
                    {
                        txt: "Steal it",
                        resultText: "You equip it. (+3 DEF)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('def', 3); gameStore.log("+3 DEF", "item"); SoundManager.play('loot'); }
                    },
                    { txt: "Leave", resultText: "Too heavy." }
                ]
            },
            {
                title: "Cursed Blade",
                text: "A sword whispering dark thoughts.",
                choices: [
                    { 
                        txt: "Wield it", 
                        resultText: "It drinks your blood. (+ATK, -MaxHP)", 
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { 
                            Player.gainStat('atk', 5); 
                            Player.gainStat('maxHp', -20); 
                            gameStore.log("+5 ATK, -20 MaxHP", "buff"); 
                            Achievements.unlock('cursed_destiny');
                            SoundManager.play('event_bad');
                        } 
                    },
                    { txt: "Destroy it", resultText: "You break the curse. (+XP)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(100); } }
                ]
            }
        ],
        walls: [
            {
                title: "Ballista",
                text: "A giant crossbow overlooking the valley.",
                choices: [
                    {
                        txt: "Fire!",
                        resultText: "The bolt flies for miles. Fun!",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(50); }
                    },
                    { txt: "Dismantle", resultText: "You break the mechanism." }
                ]
            },
            {
                title: "Patrol Route",
                text: "Guards are marching this way.",
                choices: [
                    { txt: "Ambush", resultText: "Surprise attack! (+Crit chance)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('crit', 0.05); gameStore.log("+5% Crit", "buff"); } },
                    { txt: "Hide", resultText: "They pass by.", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => {} }
                ]
            }
        ],
        core: [
            {
                title: "Steam Engine",
                text: "The heart of the fortress.",
                choices: [
                    {
                        txt: "Overload",
                        resultText: "It hisses violently! You run. (Fortress weak?)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(100); }
                    },
                    { txt: "Ignore", resultText: "Not your problem." }
                ]
            }
        ],

        // 🎁 TREASURE / LOOT DISCOVERY EVENTS
        treasure: [
            {
                title: "Abandoned Chest",
                text: "You find a dusty chest half-buried in rubble.",
                choices: [
                    {
                        txt: "Open it",
                        resultText: "Inside: some gold and a random item!",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => {
                            const floor = gameStore.state.floor || 1;
                            const gold = 20 + (floor * 5);
                            gameStore.state.gold += gold;
                            
                            if (LootManager) {
                                const item = LootManager.generateDrop(floor);
                                if (item && Player) {
                                    Player.addItem(item);
                                    gameStore.log(`Found: ${gold}G + ${item.name || 'Item'}!`, "item");
                                }
                            }
                        }
                    },
                    {
                        txt: "Leave it (Suspicious...)",
                        resultText: "You walk away. Probably the safe choice.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { gameStore.log("Nothing happened.", "system"); }
                    }
                ]
            },
            {
                title: "Glittering Pile",
                text: "Gold coins scattered on the ground. Too good to be true?",
                choices: [
                    {
                        txt: "Grab the Gold!",
                        resultText: "Easy money!",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => {
                            const floor = gameStore.state.floor || 1;
                            const gold = 30 + (floor * 8);
                            gameStore.state.gold += gold;
                            gameStore.log(`+${gold} Gold!`, "item");
                        }
                    },
                    {
                        txt: "Search Carefully",
                        resultText: "You find a hidden item beneath the coins!",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => {
                            const floor = gameStore.state.floor || 1;
                            if (LootManager) {
                                const item = LootManager.generateDrop(floor, 'rare');
                                if (item && Player) {
                                    Player.addItem(item);
                                    gameStore.log(`Found rare item: ${item.name || 'Unknown'}!`, "item");
                                }
                            }
                        }
                    }
                ]
            },
            {
                title: "Skeleton Remains",
                text: "The bones of an unlucky adventurer. They still clutch something...",
                choices: [
                    {
                        txt: "Take their Equipment",
                        resultText: "Their loss, your gain.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => {
                            const floor = gameStore.state.floor || 1;
                            if (LootManager) {
                                const item = LootManager.generateDrop(floor);
                                if (item && Player) {
                                    Player.addItem(item);
                                    gameStore.log(`Looted: ${item.name || 'Equipment'}`, "item");
                                }
                            }
                        }
                    },
                    {
                        txt: "Pay Respects (+EXP)",
                        resultText: "You honor the fallen. Their knowledge flows to you.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => {
                            const floor = gameStore.state.floor || 1;
                            const exp = 15 + (floor * 3);
                            Player.gainExp(exp);
                            gameStore.log(`+${exp} EXP (Respect)`, "buff");
                        }
                    }
                ]
            },
            {
                title: "Hidden Stash",
                text: "A well-concealed cache. Someone hid this for later... that never came.",
                choices: [
                    {
                        txt: "Claim the Loot",
                        resultText: "Gold, potions, and equipment!",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => {
                            const floor = gameStore.state.floor || 1;
                            const gold = 40 + (floor * 10);
                            gameStore.state.gold += gold;
                            
                            if (LootManager && Player) {
                                const item = LootManager.generateDrop(floor);
                                if (item) Player.addItem(item);
                                gameStore.log(`Stash: ${gold}G + Loot!`, "item");
                            }
                        }
                    }
                ]
            }
        ]
    },

    // 💀 CLASS SPECIFIC EVENTS
    classes: {
        // SKELETON FAMILY
        skeleton: [
            {
                title: "Pile of Bones",
                text: "You find the remains of a fellow warrior.",
                choices: [
                    {
                        txt: "Harvest Bone (Heal)",
                        resultText: "You attach the bone to yourself.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.heal(40); }
                    },
                    { txt: "Respect", resultText: "You salute the fallen.", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(15); } }
                ]
            }
        ],
        // GHOUL FAMILY
        ghoul: [
            {
                title: "Fresh Corpse",
                text: "It smells delicious.",
                choices: [
                    {
                        txt: "Eat it (+Max HP)",
                        resultText: "Chewy... but empowering.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('maxHp', 5); Player.heal(20); gameStore.log("+5 Max HP", "buff"); }
                    },
                    { txt: "Resist Hunger", resultText: "You walk away, stomach growling." }
                ]
            }
        ],
        // VAMPIRE FAMILY
        vampire: [
            {
                title: "Exquisite Mirror",
                text: "An ornate mirror stands here. You see no reflection.",
                choices: [
                    {
                        txt: "Admire Frame",
                        resultText: "It truly is beautiful work. (+INT)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('int', 1); gameStore.log("+1 INT", "buff"); }
                    },
                    {
                        txt: "Smash it",
                        resultText: "Bad luck for someone else. (+STR)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('str', 1); gameStore.log("+1 STR", "buff"); }
                    }
                ]
            }
        ],
        // LICH FAMILY
        lich: [
            {
                title: "Soul Gem",
                text: "A gem pulsing with trapped souls.",
                choices: [
                    {
                        txt: "Consume Souls (+MP)",
                        resultText: "Power flows through you.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('maxMp', 10); gameStore.state.mp = gameStore.state.maxMp; }
                    },
                    { txt: "Study it", resultText: "You learn its secrets. (+XP)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(100); } }
                ]
            }
        ],
        // WRAITH FAMILY
        wraith: [
             {
                title: "Ghostly Veil",
                text: "The veil between worlds is thin here.",
                choices: [
                    {
                        txt: "Phase Shift",
                        resultText: "You flicker in and out of reality. (+Dodge)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('dodge', 0.05); gameStore.log("+Dodge", "buff"); }
                    },
                    { txt: "Ignore", resultText: "You stay grounded." }
                ]
            }
        ],
        // DARK KNIGHT FAMILY
        dark_knight: [
            {
                title: "Chaos Rift",
                text: "Entropy bleeds from a crack in the air.",
                choices: [
                    {
                        txt: "Embrace Chaos",
                        resultText: "You let it twist your form. (-HP, +ATK)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { 
                            const dmg = Math.floor(Player.maxHp * 0.15);
                            Player.takeDamage(dmg); 
                            Player.gainStat('atk', 3);
                            gameStore.log(`+3 ATK, -${dmg} HP (15%)`, "buff");
                        }
                    },
                    { txt: "Close it", resultText: "You seal the rift." }
                ]
            }
        ],
         // NECRO PRIEST FAMILY
        necro_priest: [
            {
                title: "Dying Cultist",
                text: "A follower of your order lies dying.",
                choices: [
                    {
                        txt: "Last Rites (Heal)",
                        resultText: "You absorb his life force as he passes.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.heal(60); }
                    },
                    { txt: "Blessing", resultText: "He dies in peace. (+XP)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(50); } }
                ]
            }
        ],
         // SHADOW ASSASSIN FAMILY
        shadow_assassin: [
            {
                title: "Shadow Contract",
                text: "A note pinned to a wall with a dagger.",
                choices: [
                    {
                        txt: "Take the Job",
                        resultText: "Target acquired. You feel focused. (+Crit)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('crit', 0.05); gameStore.log("+5% Crit", "buff"); }
                    },
                    { txt: "Steal Dagger", resultText: "A free knife! (+DMG)", effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('atk', 1); } }
                ]
            }
        ],
        
        // TRAITOR: PALADIN
        paladin: [
            {
                title: "Fallen Shrine",
                text: "A shrine to your old god, desecrated.",
                choices: [
                    {
                        txt: "Pray (Force of Habit)",
                        resultText: "Nothing answers. Silence.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainExp(10); } // Sadness
                    },
                    {
                        txt: "Destroy it",
                        resultText: "You sever the last tie. (+STR)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('str', 2); gameStore.log("+2 STR", "buff"); }
                    }
                ]
            }
        ],
        
        // TRAITOR: DRUID
        druid: [
            {
                title: "Withered Grove",
                text: "Nature here is dying, infested with rot.",
                choices: [
                    {
                        txt: "Heal it (Mana)",
                        req: { type: "mp", val: 20 },
                        resultText: "The rot recedes. Nature thanks you.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { 
                            gameStore.state.mp -= 20; 
                            Player.gainStat('vit', 2); 
                            gameStore.log("+2 VIT", "buff"); 
                        }
                    },
                    {
                        txt: "Absorb Rot",
                        resultText: "You twist the corruption to your will. (+Poison Dmg)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('int', 1); gameStore.log("+1 INT", "buff"); }
                    }
                ]
            }
        ],

        // TRAITOR: BERSERKER
        berserker: [
            {
                title: "Arena of Blood",
                text: "A fighting pit stained with centuries of violence.",
                choices: [
                    {
                        txt: "Roar Challenge",
                        resultText: "The ghosts of warriors applaud. (+ATK)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('atk', 2); gameStore.log("+2 ATK", "buff"); }
                    },
                    {
                        txt: "Meditate on Rage",
                        resultText: "You focus your anger into armor. (+DEF)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('def', 2); gameStore.log("+2 DEF", "buff"); }
                    }
                ]
            }
        ],

        // TRAITOR: MECHANIST
        mechanist: [
            {
                title: "Ancient Automaton",
                text: "A rusted war-bot leans against the wall.",
                choices: [
                    {
                        txt: "Repair (INT)",
                        req: { type: "stat", stat: "int", val: 15 },
                        resultText: "It beeps and drops a module.",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { 
                             gameStore.state.gold += 50; 
                             gameStore.log("Found 50 Gold", "item");
                        }
                    },
                    {
                        txt: "Salvage Parts",
                        resultText: "Useful scrap metal. (+DEF)",
                        effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) => { Player.gainStat('def', 1); gameStore.log("+1 DEF", "buff"); }
                    }
                ]
            }
        ],
        

    }
};

// v37.0: Import Blacksmith Event
import { BLACKSMITH_EVENT } from './blacksmith_event.js';

// Add blacksmith to general pool (repeatable special event)
if (!EVENTS_DB.general) {
    EVENTS_DB.general = [];
}
EVENTS_DB.general.push(BLACKSMITH_EVENT);

// window.EVENTS_DB = EVENTS_DB;
