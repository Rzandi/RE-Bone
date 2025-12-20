/**
 * Mobile Touch Handler
 * Adds touch gesture support and mobile-specific interactions
 */

export const MobileHandler = {
  touchStartTime: 0,
  touchStartX: 0,
  touchStartY: 0,
  isTouch: false,
  
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
      
      // Only trigger if quick swipe (< 300ms) and significant distance (> 50px)
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
      // Prevent context menu on long press
      el.addEventListener('contextmenu', (e) => {
         e.preventDefault();
      });
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
