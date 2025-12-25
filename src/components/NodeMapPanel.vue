<script setup>
import { computed, onMounted, ref, nextTick, onUnmounted } from 'vue';
import { gameStore } from '../game/store';
import { NodeMap } from '../game/logic/NodeMap';
import { Game } from '../game/core/game.js';

const s = gameStore.state;

// Computed
const map = computed(() => s.world.nodeMap);
const activeRealm = computed(() => s.world.activeRealm);

// Lines State
const connections = ref([]);
const mapContainer = ref(null);

// Actions
const enterNode = (node) => {
    // Validation
    const current = s.world.currentNode;
    
    // If first node (layer 0)
    if (!current && node.layer === 0) {
        selectNode(node);
        return;
    }

    // Normal progression check
    if (current && node.layer === current.layer + 1) {
        // Check if connected
        const prevNode = map.value[current.layer].find(n => n.index === current.index);
        if (prevNode.next.includes(node.index)) {
            selectNode(node);
        } else {
            gameStore.log("That path is not connected!", "error");
        }
    }
};

const selectNode = (node) => {
   // Update State
   s.world.currentNode = { layer: node.layer, index: node.index };
   node.status = 'completed'; // Visually mark as done
   
   // Trigger Game Logic based on Type
   gameStore.log(`Traveling to ${node.type.toUpperCase()} node...`);
   
   // HACK: Minimal delay for visual feedback
   setTimeout(() => {
       if (Game && Game.resolveNode) Game.resolveNode(node);
   }, 300);
};

// SVG Line Logic
const updateLines = () => {
    if (!mapContainer.value) return;
    
    // Safety check just in case map isn't rendered
    if (map.value.length === 0) return;

    const newConnections = [];
    const containerRect = mapContainer.value.getBoundingClientRect();
    
    // Loop through all nodes and find their DOM elements
    // We only need to draw lines from Layer N to Layer N+1
    for (let l = 0; l < map.value.length - 1; l++) {
        const layerNodes = map.value[l];
        // const nextLayerNodes = map.value[l+1]; // Not needed directly, just indices
        
        layerNodes.forEach(node => {
            const startEl = document.getElementById(`node-${node.id}`);
            if (!startEl) return;
            
            const startRect = startEl.getBoundingClientRect();
            // Calculate center relative to container
            const x1 = startRect.left + startRect.width/2 - containerRect.left;
            const y1 = startRect.top + startRect.height/2 - containerRect.top;
            
            node.next.forEach(targetIndex => {
                const targetId = `${l+1}-${targetIndex}`;
                const endEl = document.getElementById(`node-${targetId}`);
                if (endEl) {
                    const endRect = endEl.getBoundingClientRect();
                    const x2 = endRect.left + endRect.width/2 - containerRect.left;
                    const y2 = endRect.top + endRect.height/2 - containerRect.top;
                    
                    // Determine if active path
                   // const isActive = isPathActive(node, targetIndex); 
                   const current = s.world.currentNode;
                   let active = false;
                   if (current && current.layer === l && current.index === node.index) {
                       // We are at start node
                       // Is this one of the valid next paths? Yes.
                       // Highlight all valid next paths? Or just the one we took?
                       // Actually, 'active' usually means the history.
                       // For now, simple gray lines.
                   }
                   
                    newConnections.push({ x1, y1, x2, y2, active: false });
                }
            });
        });
    }
    
    connections.value = newConnections;
};

// Generate Map if empty (Safety check)
onMounted(() => {
    if ((!map.value || map.value.length === 0) && activeRealm.value) {
        // console.log("Generating Map for", activeRealm.value);
        s.world.nodeMap = NodeMap.generateMap(activeRealm.value, s.floor);
    }
    
    // Wait for DOM
    nextTick(() => {
        setTimeout(updateLines, 500); // Hacky delay for layout settle
        window.addEventListener('resize', updateLines);
    });
});

onUnmounted(() => {
    window.removeEventListener('resize', updateLines);
});

const isReachable = (node) => {
    const current = s.world.currentNode;
    if (!current) return node.layer === 0; // Start nodes
    
    if (node.layer !== current.layer + 1) return false;
    
    // Check connection
    const prevNode = map.value[current.layer].find(n => n.index === current.index);
    if (!prevNode) return false; // Safety
    return prevNode.next.includes(node.index);
};

const isCurrent = (node) => {
    return s.world.currentNode && 
           s.world.currentNode.layer === node.layer && 
           s.world.currentNode.index === node.index;
};
</script>

<template>
  <div class="node-map-panel">
    <div class="map-header">
       <h3>🗺️ THE ATLAS</h3>
       <button @click="s.activePanel = 'menu-view'">MENU</button>
    </div>

    <!-- SVG Layer for Lines -->
    <svg class="map-lines">
        <line 
            v-for="(line, idx) in connections" 
            :key="idx"
            :x1="line.x1" :y1="line.y1" 
            :x2="line.x2" :y2="line.y2"
            :stroke="line.active ? '#fff' : '#444'"
            stroke-width="2"
            stroke-dasharray="5"
        />
    </svg>

    <div class="map-container" ref="mapContainer">
        <!-- Render from Last Layer (Top) to First Layer (Bottom) -->
        <div 
            v-for="(layer, lIndex) in [...map].reverse()" 
            :key="lIndex"
            class="map-layer"
            :data-layer="layer[0].layer"
        >
            <div 
                v-for="node in layer"
                :key="node.id"
                class="map-node"
                :id="`node-${node.id}`"
                :class="{ 
                    'reachable': isReachable(node),
                    'current': isCurrent(node),
                    'boss': node.type === 'boss',
                     'completed': node.status === 'completed',
                    'locked': !isReachable(node) && !isCurrent(node) && node.layer > (s.world.currentNode?.layer || -1)
                }"
                :style="{ borderColor: node.color, color: node.color }"
                @click="enterNode(node)"
            >
                <span class="icon">{{ node.icon }}</span>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.node-map-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #050505;
  color: #fff;
  overflow: hidden;
  position: relative; 
}

/* SVG Overlay */
.map-lines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1; /* Behind text but above BG? Actually needs to be on top of BG */
}
/* Nodes need z-index 2 */
.map-node { z-index: 2; }
.map-container { z-index: 2; background: transparent; }

.map-header {
    padding: 10px;
    border-bottom: 2px solid #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10;
    background: #050505;
}

.map-container {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 30px;
    align-items: center; 
}

.map-layer {
    display: flex;
    justify-content: center;
    gap: 40px; 
    position: relative;
    width: 100%;
}

.map-node {
    width: 60px;
    height: 60px;
    border: 2px solid #555;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #111;
    cursor: not-allowed;
    opacity: 0.5;
    transition: all 0.3s;
    position: relative;
}

.map-node .icon {
    font-size: 1.5rem;
}

.map-node.reachable {
    border-color: #fff;
    box-shadow: 0 0 10px rgba(255,255,255,0.3);
    cursor: pointer;
    opacity: 1;
    animation: pulse 2s infinite;
}

.map-node.current {
    background: #fff;
    color: #000 !important;
    opacity: 1;
    transform: scale(1.1);
    box-shadow: 0 0 20px var(--c-gold);
}

/* Completed nodes dim out but stay visible */
.map-node.completed {
    opacity: 0.3;
    border-color: #888 !important;
    color: #888 !important;
}

.map-node.boss {
    width: 80px;
    height: 80px;
    border-width: 4px;
}

.map-node:hover.reachable {
    transform: scale(1.1);
}

@keyframes pulse {
    0% { box-shadow: 0 0 5px currentColor; }
    50% { box-shadow: 0 0 15px currentColor; }
    100% { box-shadow: 0 0 5px currentColor; }
}
</style>
