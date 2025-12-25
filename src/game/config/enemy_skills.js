/* =========================================
   ENEMY SKILLS DATABASE
   Active skills with MP costs, cooldowns, and effects
   ========================================= */

export const ENEMY_SKILLS = {
    // === DAMAGE SKILLS ===
    poison_spit: {
        name: "Poison Spit",
        mp: 10,
        cooldown: 2,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.2);
            player.takeDamage(dmg);
            // Apply poison status
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'poison', turn: 3, val: 5 });
            return { damage: dmg, log: `${enemy.name} spits poison! (${dmg} dmg + Poison)` };
        }
    },
    
    backstab: {
        name: "Backstab",
        mp: 15,
        cooldown: 3,
        priority: 'first_turn',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 2.5);
            player.takeDamage(dmg);
            return { damage: dmg, log: `${enemy.name} backstabs! CRITICAL! (${dmg} dmg)` };
        }
    },
    
    rend: {
        name: "Rend",
        mp: 12,
        cooldown: 2,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.5);
            player.takeDamage(dmg);
            // Apply bleed
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'bleed', turn: 3, val: 3 });
            return { damage: dmg, log: `${enemy.name} rends! (${dmg} dmg + Bleed)` };
        }
    },
    
    smash: {
        name: "Smash",
        mp: 8,
        cooldown: 1,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.8);
            player.takeDamage(dmg);
            return { damage: dmg, log: `${enemy.name} smashes! (${dmg} dmg)` };
        }
    },
    
    bite: {
        name: "Bite",
        mp: 5,
        cooldown: 1,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.3);
            player.takeDamage(dmg);
            // Lifesteal
            enemy.hp = Math.min(enemy.hp + Math.floor(dmg * 0.3), enemy.maxHp);
            return { damage: dmg, log: `${enemy.name} bites! (${dmg} dmg, healed)` };
        }
    },
    
    // === BUFF SKILLS ===
    howl: {
        name: "Howl",
        mp: 10,
        cooldown: 4,
        priority: 'opening',
        execute: (enemy, player) => {
            if (!enemy.status) enemy.status = [];
            enemy.status.push({ id: 'buff_atk', turn: 3, val: Math.floor(enemy.atk * 0.5) });
            return { log: `${enemy.name} howls! ATK increased!` };
        }
    },
    
    // === HEAL SKILLS ===
    heal: {
        name: "Heal",
        mp: 20,
        cooldown: 3,
        priority: 'self_low_hp',
        execute: (enemy, player) => {
            const healAmount = Math.floor(enemy.maxHp * 0.3);
            enemy.hp = Math.min(enemy.hp + healAmount, enemy.maxHp);
            return { log: `${enemy.name} heals! (+${healAmount} HP)` };
        }
    },
    
    // === DEBUFF SKILLS ===
    entangle: {
        name: "Entangle",
        mp: 12,
        cooldown: 3,
        priority: 'offensive',
        execute: (enemy, player) => {
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'stun', turn: 1 });
            return { log: `${enemy.name} entangles you! STUNNED!` };
        }
    },
    
    blind: {
        name: "Blind",
        mp: 10,
        cooldown: 2,
        priority: 'offensive',
        execute: (enemy, player) => {
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'blind', turn: 2, val: 0.5 }); // 50% miss chance
            return { log: `${enemy.name} blinds you!` };
        }
    },
    
    // === v38.0: ALL MISSING SKILL IMPLEMENTATIONS ===
    
    // SPORE/FUNGI BIOME
    sleep_spore: {
        name: "Sleep Spore",
        mp: 15,
        cooldown: 3,
        priority: 'debuff',
        execute: (enemy, player) => {
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'sleep', turn: 2 });
            return { log: `${enemy.name} releases sleep spores! You fell asleep!` };
        }
    },
    
    mind_rot: {
        name: "Mind Rot",
        mp: 20,
        cooldown: 4,
        priority: 'debuff',
        execute: (enemy, player) => {
            const mpDrain = Math.floor(player.state.maxMp * 0.3);
            player.state.mp = Math.max(0, player.state.mp - mpDrain);
            return { log: `${enemy.name} rots your mind! (-${mpDrain} MP)` };
        }
    },
    
    charge: {
        name: "Charge",
        mp: 10,
        cooldown: 2,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 2);
            player.takeDamage(dmg);
            return { damage: dmg, log: `${enemy.name} charges! (${dmg} dmg)` };
        }
    },
    
    // WATER BIOME
    snap: {
        name: "Snap",
        mp: 8,
        cooldown: 1,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.4);
            player.takeDamage(dmg);
            return { damage: dmg, log: `${enemy.name} snaps! (${dmg} dmg)` };
        }
    },
    
    lure: {
        name: "Lure",
        mp: 15,
        cooldown: 3,
        priority: 'debuff',
        execute: (enemy, player) => {
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'charmed', turn: 2 });
            return { log: `${enemy.name} lures you! Charmed for 2 turns!` };
        }
    },
    
    scream: {
        name: "Scream",
        mp: 12,
        cooldown: 2,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.6);
            player.takeDamage(dmg);
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'fear', turn: 1 });
            return { damage: dmg, log: `${enemy.name} screams! (${dmg} dmg + Fear)` };
        }
    },
    
    crush: {
        name: "Crush",
        mp: 15,
        cooldown: 2,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.8);
            player.takeDamage(dmg);
            return { damage: dmg, log: `${enemy.name} crushes you! (${dmg} dmg)` };
        }
    },
    
    // FOREST BIOME
    slash: {
        name: "Slash",
        mp: 8,
        cooldown: 1,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.5);
            player.takeDamage(dmg);
            return { damage: dmg, log: `${enemy.name} slashes! (${dmg} dmg)` };
        }
    },
    
    parry: {
        name: "Parry",
        mp: 10,
        cooldown: 3,
        priority: 'defensive',
        execute: (enemy, player) => {
            if (!enemy.status) enemy.status = [];
            enemy.status.push({ id: 'parrying', turn: 1 });
            return { log: `${enemy.name} readies a parry!` };
        }
    },
    
    multishot: {
        name: "Multishot",
        mp: 15,
        cooldown: 2,
        priority: 'offensive',
        execute: (enemy, player) => {
            const hits = 3;
            let totalDmg = 0;
            for (let i = 0; i < hits; i++) {
                const dmg = Math.floor(enemy.atk * 0.6);
                totalDmg += dmg;
            }
            player.takeDamage(totalDmg);
            return { damage: totalDmg, log: `${enemy.name} fires ${hits} arrows! (${totalDmg} total dmg)` };
        }
    },
    
    thorn_whip: {
        name: "Thorn Whip",
        mp: 12,
        cooldown: 2,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.3);
            player.takeDamage(dmg);
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'bleed', turn: 2, val: 3 });
            return { damage: dmg, log: `${enemy.name} whips with thorns! (${dmg} dmg + Bleed)` };
        }
    },
    
    morph: {
        name: "Morph",
        mp: 20,
        cooldown: 5,
        priority: 'buff',
        execute: (enemy, player) => {
            enemy.atk = Math.floor(enemy.atk * 1.5);
            return { log: `${enemy.name} morphs into a stronger form!` };
        }
    },
    
    // CITY/SEWER BIOME
    suffocate: {
        name: "Suffocate",
        mp: 18,
        cooldown: 3,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.2);
            player.takeDamage(dmg);
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'weakness', turn: 2 });
            return { damage: dmg, log: `${enemy.name} suffocates you! (${dmg} dmg + Weakness)` };
        }
    },
    
    shank: {
        name: "Shank",
        mp: 8,
        cooldown: 1,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.6);
            player.takeDamage(dmg);
            return { damage: dmg, log: `${enemy.name} shanks you! (${dmg} dmg)` };
        }
    },
    
    vanish: {
        name: "Vanish",
        mp: 15,
        cooldown: 4,
        priority: 'defensive',
        execute: (enemy, player) => {
            if (!enemy.status) enemy.status = [];
            enemy.status.push({ id: 'invisible', turn: 2 });
            return { log: `${enemy.name} vanishes into shadows!` };
        }
    },
    
    peck: {
        name: "Peck",
        mp: 5,
        cooldown: 1,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.2);
            player.takeDamage(dmg);
            return { damage: dmg, log: `${enemy.name} pecks! (${dmg} dmg)` };
        }
    },
    
    slam: {
        name: "Slam",
        mp: 12,
        cooldown: 2,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 2);
            player.takeDamage(dmg);
            return { damage: dmg, log: `${enemy.name} slams down! (${dmg} dmg)` };
        }
    },
    
    steal: {
        name: "Steal",
        mp: 10,
        cooldown: 3,
        priority: 'special',
        execute: (enemy, player) => {
            const goldStolen = Math.floor(player.state.gold * 0.1);
            player.state.gold = Math.max(0, player.state.gold - goldStolen);
            return { log: `${enemy.name} steals ${goldStolen} Gold!` };
        }
    },
    
    shield_bash: {
        name: "Shield Bash",
        mp: 10,
        cooldown: 2,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.3);
            player.takeDamage(dmg);
            if (!player.state.status) player.state.status = [];
            if (Math.random() < 0.3) {
                player.state.status.push({ id: 'stun', turn: 1 });
                return { damage: dmg, log: `${enemy.name} shield bashes! (${dmg} dmg + STUN)` };
            }
            return { damage: dmg, log: `${enemy.name} shield bashes! (${dmg} dmg)` };
        }
    },
    
    surprise: {
        name: "Surprise Attack",
        mp: 0,
        cooldown: 0,
        priority: 'first_turn',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 2.5);
            player.takeDamage(dmg);
            return { damage: dmg, log: `${enemy.name} surprises you! AMBUSH! (${dmg} dmg)` };
        }
    },
    
    // DUNGEON BIOME
    flay: {
        name: "Flay",
        mp: 15,
        cooldown: 2,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.4);
            player.takeDamage(dmg);
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'bleed', turn: 4, val: 5 });
            return { damage: dmg, log: `${enemy.name} flays you! (${dmg} dmg + Heavy Bleed)` };
        }
    },
    
    wail: {
        name: "Wail",
        mp: 12,
        cooldown: 2,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.5);
            player.takeDamage(dmg);
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'fear', turn: 2 });
            return { damage: dmg, log: `${enemy.name} wails! (${dmg} dmg + Fear)` };
        }
    },
    
    lockdown: {
        name: "Lockdown",
        mp: 20,
        cooldown: 4,
        priority: 'debuff',
        execute: (enemy, player) => {
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'locked', turn: 2 });
            return { log: `${enemy.name} locks you down! Cannot flee for 2 turns!` };
        }
    },
    
    // CASTLE BIOME
    void_slash: {
        name: "Void Slash",
        mp: 20,
        cooldown: 3,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 2);
            player.takeDamage(dmg);
            return { damage: dmg, log: `${enemy.name} slashes with void energy! (${dmg} dmg)` };
        }
    },
    
    tricks: {
        name: "Tricks",
        mp: 15,
        cooldown: 3,
        priority: 'special',
        execute: (enemy, player) => {
            const effects = ['heal', 'damage', 'debuff'];
            const effect = effects[Math.floor(Math.random() * effects.length)];
            if (effect === 'heal') {
                enemy.hp = Math.min(enemy.hp + 30, enemy.maxHp);
                return { log: `${enemy.name} plays a trick! Healed 30 HP!` };
            } else if (effect === 'damage') {
                const dmg = Math.floor(enemy.atk * 2);
                player.takeDamage(dmg);
                return { damage: dmg, log: `${enemy.name} plays a trick! (${dmg} dmg)` };
            } else {
                if (!player.state.status) player.state.status = [];
                player.state.status.push({ id: 'confusion', turn: 2 });
                return { log: `${enemy.name} plays a trick! Confused!` };
            }
        }
    },
    
    execution: {
        name: "Execution",
        mp: 25,
        cooldown: 4,
        priority: 'execute',
        execute: (enemy, player) => {
            const hpPct = player.state.hp / player.state.maxHp;
            let dmg = Math.floor(enemy.atk * 1.5);
            if (hpPct < 0.3) {
                dmg = Math.floor(enemy.atk * 4); // Execute bonus
            }
            player.takeDamage(dmg);
            return { damage: dmg, log: `${enemy.name} executes! (${dmg} dmg${hpPct < 0.3 ? ' EXECUTE!' : ''})` };
        }
    },
    
    // MILITARY BIOME
    thrust: {
        name: "Thrust",
        mp: 8,
        cooldown: 1,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.5);
            player.takeDamage(dmg);
            return { damage: dmg, log: `${enemy.name} thrusts! (${dmg} dmg)` };
        }
    },
    
    smite: {
        name: "Smite",
        mp: 15,
        cooldown: 2,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.8);
            player.takeDamage(dmg);
            return { damage: dmg, log: `${enemy.name} smites you with holy light! (${dmg} dmg)` };
        }
    },
    
    flash: {
        name: "Flash",
        mp: 10,
        cooldown: 2,
        priority: 'debuff',
        execute: (enemy, player) => {
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'blind', turn: 2, val: 0.5 });
            return { log: `${enemy.name} flashes blinding light!` };
        }
    },
    
    shard_spray: {
        name: "Shard Spray",
        mp: 15,
        cooldown: 2,
        priority: 'offensive',
        execute: (enemy, player) => {
            const hits = 5;
            let totalDmg = 0;
            for (let i = 0; i < hits; i++) {
                totalDmg += Math.floor(enemy.atk * 0.4);
            }
            player.takeDamage(totalDmg);
            return { damage: totalDmg, log: `${enemy.name} sprays glass shards! (${hits} hits, ${totalDmg} total dmg)` };
        }
    },
    
    stunning_blow: {
        name: "Stunning Blow",
        mp: 15,
        cooldown: 3,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.5);
            player.takeDamage(dmg);
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'stun', turn: 1 });
            return { damage: dmg, log: `${enemy.name} delivers a stunning blow! (${dmg} dmg + STUN)` };
        }
    },
    
    flurry: {
        name: "Flurry",
        mp: 12,
        cooldown: 2,
        priority: 'offensive',
        execute: (enemy, player) => {
            const hits = 4;
            let totalDmg = 0;
            for (let i = 0; i < hits; i++) {
                totalDmg += Math.floor(enemy.atk * 0.5);
            }
            player.takeDamage(totalDmg);
            return { damage: totalDmg, log: `${enemy.name} unleashes a flurry! (${hits} hits, ${totalDmg} total dmg)` };
        }
    },
    
    rally: {
        name: "Rally",
        mp: 20,
        cooldown: 5,
        priority: 'buff',
        execute: (enemy, player) => {
            enemy.atk = Math.floor(enemy.atk * 1.3);
            enemy.hp = Math.min(enemy.hp + 50, enemy.maxHp);
            return { log: `${enemy.name} rallies! ATK up + 50 HP healed!` };
        }
    },
    
    // LIBRARY BIOME
    paper_cut: {
        name: "Paper Cut",
        mp: 5,
        cooldown: 1,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.2);
            player.takeDamage(dmg);
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'bleed', turn: 2, val: 2 });
            return { damage: dmg, log: `${enemy.name} paper cuts! (${dmg} dmg + Bleed)` };
        }
    },
    
    silence: {
        name: "Silence",
        mp: 15,
        cooldown: 3,
        priority: 'debuff',
        execute: (enemy, player) => {
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'silence', turn: 2 });
            return { log: `${enemy.name} silences you! Cannot use skills for 2 turns!` };
        }
    },
    
    // TEMPLE BIOME
    burn: {
        name: "Burn",
        mp: 15,
        cooldown: 2,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.3);
            player.takeDamage(dmg);
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'burn', turn: 3, val: 5 });
            return { damage: dmg, log: `${enemy.name} burns you! (${dmg} dmg + Burn)` };
        }
    },
    
    explode: {
        name: "Explode",
        mp: 0,
        cooldown: 0,
        priority: 'suicide',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.maxHp * 0.8);
            player.takeDamage(dmg);
            enemy.hp = 0; // Self-destruct
            return { damage: dmg, log: `${enemy.name} EXPLODES! (${dmg} dmg)` };
        }
    },
    
    judgment: {
        name: "Judgment",
        mp: 30,
        cooldown: 4,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 2.5);
            player.takeDamage(dmg);
            return { damage: dmg, log: `${enemy.name} passes JUDGMENT! (${dmg} dmg)` };
        }
    },
    
    // VOID BIOME
    gaze: {
        name: "Void Gaze",
        mp: 20,
        cooldown: 3,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.5);
            player.takeDamage(dmg);
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'fear', turn: 2 });
            player.state.status.push({ id: 'weakness', turn: 2 });
            return { damage: dmg, log: `${enemy.name} gazes into your soul! (${dmg} dmg + Fear + Weakness)` };
        }
    },
    
    mad_babble: {
        name: "Mad Babble",
        mp: 15,
        cooldown: 2,
        priority: 'debuff',
        execute: (enemy, player) => {
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'confusion', turn: 3 });
            return { log: `${enemy.name} babbles madly! Confused for 3 turns!` };
        }
    },
    
    // EXPERIMENT BIOME
    acid: {
        name: "Acid Spray",
        mp: 15,
        cooldown: 2,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.4);
            player.takeDamage(dmg);
            // Reduce defense temporarily
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'corroded', turn: 3, val: 5 }); // -5 DEF
            return { damage: dmg, log: `${enemy.name} sprays acid! (${dmg} dmg + DEF reduced)` };
        }
    },
    
    gnaw: {
        name: "Gnaw",
        mp: 8,
        cooldown: 1,
        priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.3);
            player.takeDamage(dmg);
            // Lifesteal
            enemy.hp = Math.min(enemy.hp + Math.floor(dmg * 0.2), enemy.maxHp);
            return { damage: dmg, log: `${enemy.name} gnaws! (${dmg} dmg, healed)` };
        }
    },
    
    // Placeholder for unimplemented skills (safe fallback)
    default: {
        name: "Attack",
        mp: 0,
        cooldown: 0,
        priority: 'default',
        execute: (enemy, player) => {
            const dmg = enemy.atk || 5;
            player.takeDamage(dmg);
            return { damage: dmg, log: `${enemy.name} attacks for ${dmg}!` };
        }
    },

    // =========================================
    // v38.8: GATEKEEPER BOSS SKILLS
    // =========================================

    // --- LIMIT BREAKER (Floor 100) ---
    limit_slash: {
        name: "Limit Slash",
        mp: 20, cooldown: 2, priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.8);
            player.takeDamage(dmg);
            // Remove one buff
            if (player.state.buffs && player.state.buffs.length > 0) {
                const removed = player.state.buffs.shift();
                return { damage: dmg, log: `${enemy.name} LIMIT SLASH! (${dmg} + buff removed)` };
            }
            return { damage: dmg, log: `${enemy.name} LIMIT SLASH! (${dmg} dmg)` };
        }
    },

    power_lock: {
        name: "Power Lock",
        mp: 25, cooldown: 4, priority: 'debuff',
        execute: (enemy, player) => {
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'atk_down', turn: 3, val: 0.25 });
            return { log: `${enemy.name} LOCKS your power! ATK -25% for 3 turns!` };
        }
    },

    // --- SOUL WARDEN (Floor 200) ---
    soul_drain: {
        name: "Soul Drain",
        mp: 20, cooldown: 2, priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.5);
            player.takeDamage(dmg);
            const heal = Math.floor(dmg * 0.5);
            enemy.hp = Math.min(enemy.hp + heal, enemy.maxHp);
            return { damage: dmg, log: `${enemy.name} DRAINS your soul! (${dmg} dmg, healed ${heal})` };
        }
    },

    spirit_prison: {
        name: "Spirit Prison",
        mp: 30, cooldown: 3, priority: 'debuff',
        execute: (enemy, player) => {
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'stun', turn: 2 });
            return { log: `${enemy.name} IMPRISONS your spirit! STUNNED for 2 turns!` };
        }
    },

    mass_haunt: {
        name: "Mass Haunt",
        mp: 25, cooldown: 4, priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.0);
            player.takeDamage(dmg);
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'fear', turn: 2 });
            player.state.status.push({ id: 'weakness', turn: 2 });
            return { damage: dmg, log: `${enemy.name} unleashes MASS HAUNT! (${dmg} dmg + Fear + Weakness)` };
        }
    },

    // --- CHAOS SENTINEL (Floor 300) ---
    chaos_beam: {
        name: "Chaos Beam",
        mp: 35, cooldown: 3, priority: 'offensive',
        execute: (enemy, player) => {
            const rawDmg = Math.floor(enemy.atk * 2.5);
            // Ignores 50% DEF - apply reduced mitigation
            const dmg = Math.floor(rawDmg * 0.9); // Simplified: high pierce
            player.takeDamage(dmg);
            return { damage: dmg, log: `${enemy.name} fires CHAOS BEAM! (${dmg} dmg, ignores DEF)` };
        }
    },

    reality_warp: {
        name: "Reality Warp",
        mp: 25, cooldown: 4, priority: 'special',
        execute: (enemy, player) => {
            const hpSwap = Math.floor(player.state.hp * 0.3);
            const mpSwap = Math.floor(player.state.mp * 0.3);
            player.state.hp = Math.max(1, player.state.hp - hpSwap + mpSwap);
            player.state.mp = Math.max(0, player.state.mp - mpSwap + hpSwap);
            return { log: `${enemy.name} WARPS REALITY! HP/MP swapped by 30%!` };
        }
    },

    elemental_flux: {
        name: "Elemental Flux",
        mp: 20, cooldown: 2, priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.3);
            player.takeDamage(dmg);
            if (!player.state.status) player.state.status = [];
            const elements = ['burn', 'freeze', 'stun'];
            const el = elements[Math.floor(Math.random() * elements.length)];
            player.state.status.push({ id: el, turn: 2, val: el === 'burn' ? 5 : 0 });
            return { damage: dmg, log: `${enemy.name} ELEMENTAL FLUX! (${dmg} dmg + ${el.toUpperCase()})` };
        }
    },

    // --- PRIMORDIAL GATE (Floor 400) ---
    oblivion: {
        name: "Oblivion",
        mp: 50, cooldown: 5, priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 4);
            player.takeDamage(dmg);
            player.state.buffs = []; // Clear all buffs
            return { damage: dmg, log: `${enemy.name} unleashes OBLIVION! (${dmg} dmg, ALL buffs removed!)` };
        }
    },

    void_crush: {
        name: "Void Crush",
        mp: 30, cooldown: 3, priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 2);
            player.takeDamage(dmg);
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'silence', turn: 2 });
            return { damage: dmg, log: `${enemy.name} VOID CRUSH! (${dmg} dmg + Silenced)` };
        }
    },

    gate_of_souls: {
        name: "Gate of Souls",
        mp: 40, cooldown: 4, priority: 'summon',
        execute: (enemy, player, game) => {
            // Flag for minion spawn (handled by combat system)
            if (!enemy.minions) enemy.minions = [];
            enemy.minions.push({ name: "Soul Fragment", hp: 500, maxHp: 500, atk: 50 });
            return { log: `${enemy.name} opens the GATE OF SOULS! A Soul Fragment appears!` };
        }
    },

    // --- THE VOID (Floor 500) ---
    annihilation: {
        name: "Annihilation",
        mp: 60, cooldown: 5, priority: 'offensive',
        execute: (enemy, player) => {
            const flatDmg = Math.floor(enemy.atk * 5);
            const trueDmg = Math.floor(player.state.hp * 0.5); // 50% current HP as true damage
            const totalDmg = flatDmg + trueDmg;
            player.takeDamage(totalDmg);
            return { damage: totalDmg, log: `${enemy.name} unleashes ANNIHILATION! (${totalDmg} dmg!)` };
        }
    },

    time_stop: {
        name: "Time Stop",
        mp: 50, cooldown: 6, priority: 'debuff',
        execute: (enemy, player) => {
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'stun', turn: 1 });
            player.state.status.push({ id: 'silence', turn: 1 });
            return { log: `${enemy.name} STOPS TIME! You lose your next turn!` };
        }
    },

    void_embrace: {
        name: "Void Embrace",
        mp: 40, cooldown: 4, priority: 'offensive',
        execute: (enemy, player) => {
            const dmg = Math.floor(enemy.atk * 1.5);
            player.takeDamage(dmg);
            if (!player.state.status) player.state.status = [];
            player.state.status.push({ id: 'curse', turn: 3, val: 5 });
            player.state.status.push({ id: 'silence', turn: 2 });
            player.state.status.push({ id: 'bleed', turn: 3, val: 5 });
            return { damage: dmg, log: `${enemy.name} EMBRACES you with the VOID! (${dmg} dmg + Curse + Silence + Bleed)` };
        }
    }
};

// Helper to get skill or default
export function getEnemySkill(skillId) {
    return ENEMY_SKILLS[skillId] || ENEMY_SKILLS.default;
}

// Export for window access
// Export for window access - REMOVED v38.0
// if (typeof window !== 'undefined') {
//     window.ENEMY_SKILLS = ENEMY_SKILLS;
//     window.getEnemySkill = getEnemySkill;
// }
