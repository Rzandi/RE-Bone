/* =========================================
   VISUAL EFFECTS MANAGER
   ========================================= */

const VFX = {
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
  
  // Spawn particle effects
  spawnParticles(type, targetElement) {
    const container = document.getElementById('dmg-layer');
    const rect = document.getElementById('mob-sprite').getBoundingClientRect();
    const appRect = document.getElementById('app').getBoundingClientRect();
    
    // Calculate position relative to app container
    const centerX = rect.left - appRect.left + rect.width / 2;
    const centerY = rect.top - appRect.top + rect.height / 2;
    
    const particleCount = type === 'fire' ? 12 : type === 'ice' ? 10 : type === 'blood' ? 8 : 6;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = `vfx-particle vfx-${type}`;
      
      // Random spread
      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = 30 + Math.random() * 20;
      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;
      
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      particle.style.setProperty('--offset-x', `${offsetX}px`);
      particle.style.setProperty('--offset-y', `${offsetY}px`);
      
      container.appendChild(particle);
      
      // Auto cleanup
      setTimeout(() => particle.remove(), 800);
    }
  },
  
  // Play skill-specific animation on target
  playSkillAnimation(type, targetElement) {
    const sprite = document.getElementById('mob-sprite');
    
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
    
    // Screen shake
    document.getElementById('app').classList.add('shake-heavy');
    
    // Boss entrance
    sprite.classList.add('boss-entrance');
    panel.classList.add('boss-entrance-bg');
    
    // Flash effect
    setTimeout(() => {
      document.getElementById('app').classList.add('flash');
    }, 300);
    
    // Cleanup and callback
    setTimeout(() => {
      document.getElementById('app').classList.remove('shake-heavy', 'flash');
      sprite.classList.remove('boss-entrance');
      panel.classList.remove('boss-entrance-bg');
      if (callback) callback();
    }, 1200);
  },
  
  // Enhanced screen shake
  screenShake(intensity = 'normal') {
    const app = document.getElementById('app');
    const className = intensity === 'heavy' ? 'shake-heavy' : 'shake';
    
    app.classList.add(className);
    setTimeout(() => app.classList.remove(className), 400);
  }
};

// Export to global scope
window.VFX = VFX;
