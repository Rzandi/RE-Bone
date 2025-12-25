import { gameStore } from '../store.js';
import { Player } from '../logic/Player.js';
import { Events } from '../core/events.js'; // Assuming events handling

export const Biomes = {
  // Apply immediate effect when entering a node
  // Apply immediate effect when entering a node
  applyEffect(biome) {
    if (!biome || !biome.effect) return;

    const s = gameStore.state;
    const type = biome.effect;
    const name = biome.name;
    let log = `Zone: ${name} (${type})`;
    let icon = "🌍";
    
    // v38.1: Randomized Flavor Text
    const flavorText = {
        'Poison': ["Toxic fumes rise...", "The air burns your lungs.", "You cough violently."],
        'Fog': ["Mist swirls around you.", "You can barely see your hand.", "Shapes move in the fog."],
        'Spore': ["Choking spores fill the air.", "You sneeze blue dust.", "The fungus pulses."],
        'Slippery': ["The ground is slick.", "Watch your step.", "Mud clings to your boots."],
        'Ambush': ["Eyes watch from the shadows.", "A twig snaps nearby.", "You feel hunted."],
        'Stench': ["The smell is unbearable.", "Rot and decay.", "You hold your breath."],
        'Wind': ["Gale force winds howl.", "The wind threatens to push you off.", "Debris flies past."],
        'Crowd': ["Shoulder to shoulder.", "Keep your hand on your purse.", "A chaotic din."],
        'Darkness': ["Pitch black.", "Something skitters in the dark.", "Your torch flickers."],
        'Silence': ["Unnatural silence.", "No sound escapes.", "The quiet is deafening."],
        'Blinding': ["My eyes!", "The light is too bright.", "Radiant beams scorch."],
        'Holy': ["A sense of peace.", "Warm light heals you.", "Divine presence."],
        'Formation': ["Drums of war beat.", "Marching feet echo.", "Soldiers drill nearby."],
        'Purge': ["The air feels sterile.", "Magic burns away.", "Purity enforces order."],
        'Gravity': ["You feel heavy.", "Movement is difficult.", "The laws of physics bend."],
        'Explosive': ["Volatile chemicals bubble.", "Sparks fly nearby.", "Don't touch anything!"],
        'Cosmic': ["The stars are close.", "Infinite knowledge flows.", "Space warps around you."],
        'Metal': ["Gears grind.", "Steam hisses.", "The smell of oil and rust."],
        'ManaStorm': ["Lightning crackles.", "Raw magic surges.", "The air tastes of ozone."],
        'Heat': ["It's scorching hot!", "Sweat blinds you.", "Your armor burns."],
        'Collapse': ["Dust falls from above.", "The ceiling groans.", "Rocks shift ominously."],
        'Sharp': ["Blades everywhere.", "Don't touch the walls.", "A forest of steel."],
        'Sniper': ["Movement on the parapets.", "Keep your head down.", "You are in the open."],
        'Alarm': ["Sirens wail.", "Red lights flash.", "The fortress knows you are here."]
    };

    switch (type) {
      // --- NATURE'S DEN ---
      case 'Poison': // Swamp
        Player.takeDamage(Math.ceil(Player.maxHp * 0.05));
        log += " -5% HP";
        icon = "🤢";
        break;
      case 'Fog': // Deep Forest
        log += " (Accuracy Down)";
        icon = "🌫️";
        break;
      case 'Spore': // Fungal Cave
        const mpDrain = Math.ceil(Player.maxMp * 0.05);
        Player.mp = Math.max(0, Player.mp - mpDrain);
        log += ` -${mpDrain} MP`;
        icon = "🍄";
        break;
      case 'Slippery': // Riverbank
        log += " (Dodge Down)";
        icon = "💧";
        break;
      case 'Ambush': // Elf Village
        log += " (Enemy Initiative)";
        icon = "👀";
        break;

      // --- SHADOW GUILD ---
      case 'Stench': // Sewers
        log += " (Attack Down)";
        icon = "🐀";
        break;
      case 'Wind': // Rooftops
        log += " (Dodge Up)";
        icon = "🍃";
        break;
      case 'Crowd': // Market
        if (s.gold > 10) {
            const lost = Math.floor(s.gold * 0.05);
            s.gold -= lost;
            log += ` -${lost} Gold (Pickpocket)`;
        }
        icon = "💰";
        break;
      case 'Darkness': // Dungeon
        log += " (Major Accuracy Down)";
        icon = "🌑";
        break;
      case 'Silence': // Throne
        log += " (Silenced)";
        icon = "🤫";
        break;

      // --- LIGHT CASTLE ---
      case 'Blinding': // Courtyard
        log += " (Accuracy Down)";
        icon = "☀️";
        break;
      case 'Holy': // Cathedral
        const healAmt = Math.ceil(Player.maxHp * 0.10);
        Player.hp = Math.min(Player.maxHp, Player.hp + healAmt);
        log += ` +${healAmt} HP`;
        icon = "✨";
        break;
      case 'Formation': // Barracks
        log += " (Enemy Defense Up)";
        icon = "🛡️";
        break;
      case 'Purge': // Sanctum
        log += " (Buffs Removed)";
        icon = "🔥";
        break;

      // --- ARCANE TOWER ---
      case 'Gravity': // Library Void
        log += " (Speed Down)";
        icon = "🌌";
        break;
      case 'Explosive': // Lab
        if (Math.random() < 0.3) {
            const dmg = Math.ceil(Player.maxHp * 0.10);
            Player.takeDamage(dmg);
            log += ` BOOM! -${dmg} HP`;
        }
        icon = "🧪";
        break;
      case 'Cosmic': // Observatory
        const mpRegen = Math.ceil(Player.maxMp * 0.10);
        Player.mp = Math.min(Player.maxMp, Player.mp + mpRegen);
        log += ` +${mpRegen} MP`;
        icon = "⭐";
        break;
      case 'Metal': // Construct
        log += " (Enemy Defense Up)";
        icon = "🤖";
        break;
      case 'ManaStorm': // Pinnacle
        log += " (Wild Magic)";
        icon = "⚡";
        break;

      // --- IRON FORT ---
      case 'Heat': // Forge
        Player.takeDamage(Math.ceil(Player.maxHp * 0.03));
        log += " -3% HP (Burn)";
        icon = "🔥";
        break;
      case 'Collapse': // Mine
        if (Math.random() < 0.1) {
            const rockDmg = Math.ceil(Player.maxHp * 0.15);
            Player.takeDamage(rockDmg);
            log += ` 🪨 CRASH! -${rockDmg} HP`;
        }
        icon = "⛏️";
        break;
      case 'Sharp': // Armory
        log += " (Enemy Damage Up)";
        icon = "⚔️";
        break;
      case 'Sniper': // Walls
        if (Math.random() < 0.2) {
             const shot = Math.ceil(Player.maxHp * 0.10);
             Player.takeDamage(shot);
             log += ` 🏹 SNIPED! -${shot} HP`;
        }
        icon = "🏰";
        break;
      case 'Alarm': // Core
        log += " (Aggro Up)";
        icon = "🚨";
        break;

      default:
        break;
    }

    // Emit Log
    if (Events) {
        // v38.1: Append Flavor
        const flavor = flavorText[type] ? flavorText[type][Math.floor(Math.random() * flavorText[type].length)] : "";
        if (flavor) log = `${flavor} | ${log}`;
        
        Events.emit("log", log);
        gameStore.triggerVfx({ type: 'text', val: icon, target: 'player' });
    }
  },

  // Get combat modifiers based on biome (To be used in Combat.js)
  getCombatMods(biome) {
     if (!biome || !biome.effect) return {};
     const mods = {};

     switch (biome.effect) {
        // Debuffs
        case 'Fog': mods.accuracy = -0.15; break;
        case 'Darkness': mods.accuracy = -0.20; break;
        case 'Blinding': mods.accuracy = -0.10; break;
        case 'Gravity': mods.speed = -0.20; break;
        case 'Slippery': mods.dodge = -0.20; break;
        case 'Stench': mods.attack = -0.10; break;
        case 'Heat': mods.lifesteal = -0.50; break; // Harder to heal
        case 'Spore': mods.spellPower = -0.20; break;
        
        // Buffs/Special
        case 'Wind': mods.dodge = 0.10; break;
        case 'Formation': mods.enemyDef = 0.20; break; // Enemy tougher
        case 'Metal': mods.enemyDef = 0.30; break;
        case 'Sharp': mods.enemyAtk = 0.20; break;
        case 'Alarm': mods.enemyAggro = true; break; // Start with full turn meter?
        case 'Ambush': mods.enemyAggro = true; break;
        
        case 'Silence': mods.silence = true; break;
        case 'Purge': mods.noBuffs = true; break; // Cannot buff self?
     }
     return mods;
  }
};
