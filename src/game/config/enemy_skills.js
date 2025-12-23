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
    
    // Add more skills as needed...
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
    }
};

// Helper to get skill or default
export function getEnemySkill(skillId) {
    return ENEMY_SKILLS[skillId] || ENEMY_SKILLS.default;
}

// Export for window access
if (typeof window !== 'undefined') {
    window.ENEMY_SKILLS = ENEMY_SKILLS;
    window.getEnemySkill = getEnemySkill;
}
