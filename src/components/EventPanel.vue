<script setup>
import { computed } from 'vue';
import { gameStore } from '../game/store';
import { EventManager } from '../game/logic/EventManager';

const event = computed(() => gameStore.state.event);

const selectChoice = (c, index) => {
    if (c.disabled) return;
    
    // If it's a simple continue button defined in EventManager logic
    if (c.fn) {
        c.fn();
    } else {
        // Standard choice selection
        EventManager.selectChoice(index);
    }
};
</script>

<template>
  <div class="event-panel" v-if="event">
    <div class="event-content">
        <h2 class="event-title">{{ event.title }}</h2>
        <div class="event-divider"></div>
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
