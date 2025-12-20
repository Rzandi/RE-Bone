import { createApp } from 'vue'
import './assets/css/variables.css'
import './assets/css/style.css'
import App from './App.vue'
import { initGame } from './game/entry.js'

// --- ERROR TRAP ---
window.onerror = function(msg, url, line, col, error) {
    const d = document.createElement("div");
    d.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); color:red; z-index:9999; padding:20px; font-family:monospace; white-space:pre-wrap;";
    d.innerHTML = `<h1>CRITICAL ERROR</h1>${msg}\n\n${url}:${line}:${col}\n\n${error ? error.stack : ''}`;
    document.body.appendChild(d);
    return false;
};

// Initialize
try {
    initGame();
    createApp(App).mount('#app')
} catch (e) {
    console.error("Init Failed", e);
    const d = document.createElement("div");
    d.style.cssText = "position:fixed; top:50px; left:0; color:orange; font-size:20px; z-index:10000; background:black;";
    d.innerText = "INIT FAILED: " + e.message;
    document.body.appendChild(d);
}
