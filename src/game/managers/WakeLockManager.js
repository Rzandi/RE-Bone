/**
 * WakeLockManager.js
 * Manages the Screen Wake Lock API to keep the device screen on during gameplay.
 * Highly recommended for Idle/Auto-battle games.
 */
import { gameStore } from "../store";

export const WakeLockManager = {
    sentinel: null,
    isEnabled: true, // Master switch (can be tied to settings)

    // Initialize listeners
    init() {
        if (typeof document === 'undefined') return;

        // Re-acquire lock when app becomes visible again
        document.addEventListener('visibilitychange', async () => {
            if (this.sentinel !== null && document.visibilityState === 'visible') {
                await this.request(); 
            }
        });
    },

    // Request the wake lock
    async request() {
        // v38.9: Check settings if available
        if (gameStore.state.settings && !gameStore.state.settings.keepScreenOn) {
            return; // Setting disabled
        }

        // Prevent multiple locks
        if (this.sentinel) return;

        if (!('wakeLock' in navigator)) {
            // console.warn("Wake Lock API not supported");
            return;
        }

        try {
            this.sentinel = await navigator.wakeLock.request('screen');
             console.log("Wake Lock active");
            
            this.sentinel.addEventListener('release', () => {
                 console.log("Wake Lock released");
                 this.sentinel = null; // Clean up
            });
        } catch (err) {
            console.error(`Wake Lock failed: ${err.name}, ${err.message}`);
        }
    },

    // Release the lock
    async release() {
        if (this.sentinel) {
            try {
                await this.sentinel.release();
                this.sentinel = null;
            } catch (err) {
                console.error("Wake Lock release failed", err);
            }
        }
    }
};
