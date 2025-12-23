<script setup>
import { computed } from 'vue';
import { gameStore } from '../game/store';
import { EventManager } from '../game/logic/EventManager';
import { REALMS } from '../game/config/realms'; // Direct import if possible, or global

const event = computed(() => gameStore.state.event);
const activeRealm = computed(() => gameStore.state.world.activeRealm);
const realmConfig = computed(() => activeRealm.value ? REALMS[activeRealm.value] : null);

const selectChoice = (c, index) => {
    // ... same ...
    if (c.disabled) return;
    if (c.fn) c.fn();
    else EventManager.selectChoice(index);
};
</script>

<template>
  <div class="event-panel" v-if="event">
    <div class="event-content" :style="{ borderColor: realmConfig?.color }">
        <div class="event-header-icon" v-if="realmConfig">{{ realmConfig.icon }}</div>
        <h2 class="event-title" :style="{ color: realmConfig?.color }">{{ event.title }}</h2>
        <div class="event-divider" :style="{ background: `linear-gradient(90deg, transparent, ${realmConfig?.color || '#555'}, transparent)` }"></div>
        
        <div class="event-image" v-if="event.image" v-html="event.image"></div>

        <div class="event-text">
            {{ event.text }}
        </div>
        
        <div class="event-choices">
            <button 
                v-for="(c, idx) in event.choices" 
                :key="idx"
                class="choice-btn"
                :class="{ disabled: c.disabled }"
                @click="selectChoice(c, idx)"
            >
                {{ c.txt }}
            </button>
        </div>
    </div>
  </div>
</template>

<style scoped>
.event-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background: rgba(0,0,0,0.85);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
}

.event-content {
    background: #1a1a1a;
    border: 2px solid #555;
    padding: 30px;
    width: 80%;
    max-width: 500px;
    text-align: center;
    box-shadow: 0 0 20px rgba(0,0,0,0.8);
    border-radius: 8px;
}

.event-title {
    color: var(--c-gold);
    margin: 0 0 10px 0;
    font-size: 1.5rem;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.event-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #555, transparent);
    margin-bottom: 20px;
}

.event-image {
    font-family: 'Courier New', monospace;
    white-space: pre;
    color: #aaa;
    margin-bottom: 20px;
    font-size: 0.8rem;
    line-height: 0.8rem;
    overflow-x: hidden;
}

.event-text {
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 30px;
    color: #ccc;
    font-style: italic;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.event-choices {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.choice-btn {
    padding: 12px;
    background: #333;
    border: 1px solid #555;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    font-size: 1rem;
}

.choice-btn:hover:not(.disabled) {
    background: #444;
    border-color: var(--c-gold);
    transform: scale(1.02);
}

.choice-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #222;
    border-color: #333;
    color: #555;
}
</style>
