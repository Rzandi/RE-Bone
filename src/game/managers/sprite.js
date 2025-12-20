/* =========================================
   SPRITE MANAGER - Pixel Art System
   ========================================= */

export const SpriteManager = {
  currentSprites: {},
  
  // Render pixel art sprite with color classes
  render(spriteData, state = 'idle') {
    if (typeof spriteData === 'string') {
      return spriteData; // Legacy simple sprite
    }
    
    if (spriteData[state]) {
      return spriteData[state];
    }
    
    return spriteData.idle || spriteData;
  },
  
  // Animate sprite transition
  animate(elementId, spriteData, fromState, toState, duration = 300) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Show transition state
    element.innerHTML = this.render(spriteData, toState);
    element.classList.add('sprite-pulse');
    
    // Return to idle after duration
    setTimeout(() => {
      element.classList.remove('sprite-pulse');
      if (toState !== 'idle') {
        element.innerHTML = this.render(spriteData, 'idle');
      }
    }, duration);
  },
  
  // Trigger attack animation
  showAttack(elementId, spriteData) {
    this.animate(elementId, spriteData, 'idle', 'attack', 400);
  },
  
  // Trigger hurt animation
  showHurt(elementId, spriteData) {
    this.animate(elementId, spriteData, 'idle', 'hurt', 300);
  },
  
  // Set sprite to idle
  setIdle(elementId, spriteData) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = this.render(spriteData, 'idle');
    }
  }
};

// Export to global scope
window.SpriteManager = SpriteManager;
