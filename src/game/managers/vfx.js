/* =========================================
   VISUAL EFFECTS MANAGER
   ========================================= */

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
    
    if(window.GameStore) {
        for(let i=0; i<count; i++) {
            window.GameStore.state.vfx.push({
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
       if(window.GameStore) {
            // Text Popup
            window.GameStore.state.vfx.push({
                id: Math.random(),
                type: 'buff',
                val: name || 'Relic!',
                target: 'player'
            });
            // Sparkles
            for(let i=0; i<5; i++) {
                window.GameStore.state.vfx.push({
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
    const sprite = document.getElementById('mob-sprite');
    if(!sprite) return;
    
    if (type === 'fire') {
      sprite.classList.add('vfx-burning');
      setTimeout(() => sprite.classList.remove('vfx-burning'), 600);
    } else if (type === 'ice') {
      sprite.classList.add('vfx-frozen');
      setTimeout(() => sprite.classList.remove('vfx-frozen'), 600);
    } else if (type === 'blood') {
      sprite.classList.add('vfx-bleeding');
      setTimeout(() => sprite.classList.remove('vfx-bleeding'), 500);
    } else if (type === 'stun') {
      sprite.classList.add('vfx-stunned');
      setTimeout(() => sprite.classList.remove('vfx-stunned'), 400);
    } else if (type === 'heal') {
      sprite.classList.add('vfx-healing');
      setTimeout(() => sprite.classList.remove('vfx-healing'), 600);
    }
  },
  
  // Boss entrance animation
  playBossEntrance(callback) {
    const sprite = document.getElementById('mob-sprite');
    const panel = document.getElementById('panel-combat');
    const app = document.getElementById('app');

    if(!sprite || !panel || !app) {
        if(callback) callback();
        return;
    }
    
    // Screen shake
    app.classList.add('shake-heavy');
    
    // Boss entrance
    sprite.classList.add('boss-entrance');
    panel.classList.add('boss-entrance-bg');
    
    // Flash effect
    setTimeout(() => {
        if(document.getElementById('app')) document.getElementById('app').classList.add('flash');
    }, 300);
    
    // Cleanup and callback
    setTimeout(() => {
      if(document.getElementById('app')) document.getElementById('app').classList.remove('shake-heavy', 'flash');
      if(sprite) sprite.classList.remove('boss-entrance');
      if(panel) panel.classList.remove('boss-entrance-bg');
      if (callback) callback();
    }, 1200);
  },
  
  // Enhanced screen shake
  screenShake(intensity = 'normal') {
    const app = document.getElementById('app');
    if(!app) return;
    const className = intensity === 'heavy' ? 'shake-heavy' : 'shake';
    
    app.classList.add(className);
    setTimeout(() => app.classList.remove(className), 400);
  }
};

// Export to global scope
window.VFX = VFX;
