/**
 * Mobile Touch Handler
 * Adds touch gesture support and mobile-specific interactions
 * v37.1: Enhanced with performance modes and expanded haptics
 */

export const MobileHandler = {
  touchStartTime: 0,
  touchStartX: 0,
  touchStartY: 0,
  isTouch: false,
  isLowPowerMode: false,
  isBackgrounded: false,
  
  // v37.1: Haptic pattern presets
  hapticPatterns: {
    tap: 10,
    click: 20,
    success: 50,
    error: [50, 30, 50],
    warning: [30, 20, 30],
    hit_light: 30,
    hit_heavy: 80,
    hit_critical: [100, 50, 100],
    level_up: [100, 50, 100, 50, 200],
    loot: [50, 30, 50],
    death: [200, 100, 200],
    boss_appear: [50, 50, 50, 200]
  },
  
  /**
   * Initialize mobile touch handlers
   * @returns {void}
   */
  init() {
    this.isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    if (this.isTouch) {
      this.enableTouchOptimizations();
      this.addSwipeGestures();
      this.preventDoubleTapZoom();
    }
    
    // v37.1: Add visibility change handler
    this.addVisibilityHandler();
    
    // v37.1: Check battery status
    this.checkBatteryMode();
  },
  
  /**
   * v37.1: Handle visibility changes (pause when backgrounded)
   */
  addVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      this.isBackgrounded = document.hidden;
      
      if (document.hidden) {
        // Pause animations and audio when hidden
        document.body.classList.add('app-hidden');
        if (window.SoundManager && window.SoundManager.bgm) {
          window.SoundManager.bgm.suspend?.();
        }
      } else {
        document.body.classList.remove('app-hidden');
        if (window.SoundManager && window.SoundManager.bgm) {
          window.SoundManager.bgm.resume?.();
        }
      }
    });
  },
  
  /**
   * v37.1: Check for low power mode / battery saver
   */
  async checkBatteryMode() {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        
        const updatePowerMode = () => {
          // Low power if charging is false and level < 20%
          this.isLowPowerMode = !battery.charging && battery.level < 0.2;
          
          if (this.isLowPowerMode) {
            document.body.classList.add('low-power-mode');
          } else {
            document.body.classList.remove('low-power-mode');
          }
        };
        
        updatePowerMode();
        battery.addEventListener('levelchange', updatePowerMode);
        battery.addEventListener('chargingchange', updatePowerMode);
      } catch (e) {
        // Battery API not available
      }
    }
  },
  
  /**
   * Enable mobile-specific optimizations
   * @returns {void}
   */
  enableTouchOptimizations() {
    // Add active class to body for mobile-specific CSS
    document.body.classList.add('touch-device');
    
    // Improve button feedback
    document.addEventListener('touchstart', (e) => {
      if (e.target.tagName === 'BUTTON') {
        e.target.classList.add('touching');
      }
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      if (e.target.tagName === 'BUTTON') {
        e.target.classList.remove('touching');
      }
    }, { passive: true });
  },
  
  /**
   * Add swipe gesture support
   * @returns {void}
   */
  addSwipeGestures() {
    document.addEventListener('touchstart', (e) => {
      this.touchStartTime = Date.now();
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchDuration = Date.now() - this.touchStartTime;
      
      const diffX = touchEndX - this.touchStartX;
      const diffY = touchEndY - this.touchStartY;
      
      // Only trigger if quick swipe (<300ms) and significant distance (>50px)
      if (touchDuration < 300 && Math.abs(diffX) > 50 && Math.abs(diffY) < 30) {
        // Horizontal swipe detected (future feature: swipe between panels)
        // Currently disabled to avoid conflicts
      }
    }, { passive: true });
  },
  
  /**
   * Prevent double-tap zoom on iOS
   * @returns {void}
   */
  preventDoubleTapZoom() {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  },
  
  /**
   * Detect if device is in landscape mode
   * @returns {boolean}
   */
  isLandscape() {
    return window.innerWidth > window.innerHeight;
  },
  
  /**
   * Get safe area insets for notched devices
   * @returns {Object} Safe area values
   */
  getSafeAreaInsets() {
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('env(safe-area-inset-top)')) || 0,
      bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
      left: parseInt(style.getPropertyValue('env(safe-area-inset-left)')) || 0,
      right: parseInt(style.getPropertyValue('env(safe-area-inset-right)')) || 0
    };
  },
  
  /**
   * Show mobile-optimized notification
   * @param {string} message - Message to display
   * @returns {void}
   */
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'mobile-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.9);
      color: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      animation: toast-in 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'toast-out 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  },
  
  /**
   * Add long press listener to an element
   * @param {HTMLElement} el - Target element
   * @param {Function} callback - Function to call on long press
   * @param {number} duration - Duration in ms (default 500)
   */
  enableLongPress(el, callback, duration = 500) {
      if (!this.isTouch) return; // Only for touch devices

      let timer;
      
      const start = (e) => {
          timer = setTimeout(() => {
              callback(e);
          }, duration);
      };
      
      const clear = () => {
          if (timer) {
              clearTimeout(timer);
              timer = null;
          }
      };
      
      el.addEventListener('touchstart', start, { passive: true });
      el.addEventListener('touchend', clear, { passive: true });
      el.addEventListener('touchmove', clear, { passive: true });
      el.addEventListener('touchcancel', clear, { passive: true });
      el.addEventListener('contextmenu', (e) => {
         e.preventDefault();
      });
  },

  /**
   * Trigger Haptic Feedback (v37.1 Enhanced)
   * @param {number|number[]|string} pattern - Vibration pattern or preset name
   */
  vibrate(pattern) {
      // Don't vibrate if backgrounded
      if (this.isBackgrounded) return;
      
      // Don't vibrate in low power mode
      if (this.isLowPowerMode) return;
      
      if ('vibrate' in navigator) {
          // Check Settings if available
          if (window.gameStore && window.gameStore.state.settings) {
             if (window.gameStore.state.settings.haptics === false) return;
          }
          
          // v37.1: Support preset names
          if (typeof pattern === 'string' && this.hapticPatterns[pattern]) {
            pattern = this.hapticPatterns[pattern];
          }
          
          navigator.vibrate(pattern);
      }
  },
  
  /**
   * v37.1: Check if device should use reduced effects
   * @returns {boolean}
   */
  shouldReduceEffects() {
    return this.isLowPowerMode || 
           window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
};

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MobileHandler.init());
} else {
  MobileHandler.init();
}

// Export to global scope
window.MobileHandler = MobileHandler;

