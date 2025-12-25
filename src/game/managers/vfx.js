/* =========================================
   VISUAL EFFECTS MANAGER
   ========================================= */

import { gameStore } from '../store.js';

export const VFX = {
  // Create skill-specific visual effects
  showSkillEffect(skillName, targetElement) {
    const effectType = this.getEffectType(skillName);
    
    if (effectType) {
      this.spawnParticles(effectType, targetElement);
      this.playSkillAnimation(effectType, targetElement);
    }
  },
  
  // Map skills to visual effect types
  getEffectType(skillName) {
    const effectMap = {
      'Fireball': 'fire',
      'Ice Shard': 'ice',
      'Rend': 'blood',
      'Cannibalize': 'heal',
      'Terror': 'dark',
      'Mend': 'heal',
      'Smash': 'impact',
      'Shield Bash': 'stun',
      'Bone Throw': 'impact',
      'Blood Drain': 'blood',
      'Bat Swarm': 'blood',
      'Night Veil': 'dark',
      'Death Bolt': 'dark',
      'Soul Harvest': 'dark',
      'Phase Strike': 'impact',
      'Haunting': 'dark',
      'Possession': 'dark',
      'Soul Cleave': 'blood',
      'Plague Ward': 'heal',
      'Vanish': 'dark'
    };
    return effectMap[skillName] || 'impact';
  },
  
  // Spawn particle effects via Vue Store
  spawnParticles(type, targetElement) {
    // Legacy support: calculate relative pos based on sprite if possible
    // But since Vue handles rendering, we can just push "VFX" objects to store
    // and let VFXLayer.vue handle the CSS positioning?
    // Actually VFXLayer attempts to position them.
    // Let's simplified this: Push generic particle requests
    
    const count = type === 'fire' ? 12 : type === 'ice' ? 10 : type === 'blood' ? 8 : 6;
    
    if(gameStore) {
        for(let i=0; i<count; i++) {
            gameStore.state.vfx.push({
                id: Math.random(),
                type: `particle-${type}`,
                val: '', // No text, just particle
                target: 'mob' // Default target
            });
        }
    }
  },
  
  // v35.3: Relic visual cue (Glimmer on player)
  showRelicTrigger(name) {
       if(gameStore) {
            // Text Popup
            gameStore.state.vfx.push({
                id: Math.random(),
                type: 'buff',
                val: name || 'Relic!',
                target: 'player'
            });
            // Sparkles
            for(let i=0; i<5; i++) {
                gameStore.state.vfx.push({
                    id: Math.random(),
                    type: 'particle-heal', // Reuse heal green/gold sparkles
                    val: '',
                    target: 'player'
                });
            }
       }
  },
  
  // Play skill-specific animation on target
  playSkillAnimation(type, targetElement) {
    // v38.0: Push animation event to store
    if(gameStore) {
        gameStore.state.vfx.push({
            id: Math.random(),
            type: 'animation',
            val: type, // 'fire', 'ice', etc.
            target: 'enemy'
        });
    }
  },
  
  // Boss entrance animation
  playBossEntrance(callback) {
      // v38.0: Push boss entrance event
      if(gameStore) {
          gameStore.state.vfx.push({
              id: Math.random(),
              type: 'boss-entrance',
              duration: 1200
          });
      }
      
      // Callback after duration
      if(callback) {
          setTimeout(callback, 1200);
      }
  },
  
  // Enhanced screen shake
  screenShake(intensity = 'normal') {
      if(gameStore) {
          gameStore.state.vfx.push({
              id: Math.random(),
              type: 'screen-shake',
              val: intensity, // 'normal' or 'heavy'
              duration: 400
          });
      }
  }
};

// Export to global scope
// Export to global scope - REMOVED v38.0
// window.VFX = VFX;
