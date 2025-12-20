/* =========================================
   MAIN - Entry Point
   ========================================= */

// Export to window for global access
window.Game = Game;
window.SoundManager = SoundManager;
window.Player = Player;
window.UI = UI;
window.Gemini = Gemini;

// Initialize game via Loader (v31.0)
// window.onload = () => Game.init();

// Global Error Handler (v30.2)
window.onerror = function(msg, url, line, col, error) {
   // Ignore ResizeObserver errors (common harmless browser warnings)
   if (msg.includes("ResizeObserver")) return;

   const cleanMsg = msg.replace("Uncaught Error: ", "");
   if (window.UI && UI.toast) {
       UI.toast(`Error: ${cleanMsg}`, 'error');
   } else {
       console.error("Critical Error (UI not ready):", error);
       alert("Error: " + cleanMsg);
   }
   return false; // Let default handler run too (log to console)
};
