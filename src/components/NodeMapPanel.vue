<script setup>
import { computed, onMounted } from 'vue';
import { gameStore } from '../game/store';
import { NodeMap } from '../game/logic/NodeMap';

const s = gameStore.state;

// Computed
const map = computed(() => s.world.nodeMap);
const activeRealm = computed(() => s.world.activeRealm);

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
       if (window.Game) window.Game.resolveNode(node);
   }, 300);
};

// Generate Map if empty (Safety check)
onMounted(() => {
    if ((!map.value || map.value.length === 0) && activeRealm.value) {
        console.log("Generating Map for", activeRealm.value);
        s.world.nodeMap = NodeMap.generateMap(activeRealm.value);
    }
});

// Helper for connection lines (SVG)
const getLines = () => {
    const lines = [];
    if (!map.value || map.value.length === 0) return [];

    // Iterate layers
    for (let l = 0; l < map.value.length - 1; l++) {
        const layer = map.value[l];
        const nextLayer = map.value[l+1];
        
        layer.forEach(node => {
            node.next.forEach(targetIdx => {
                const target = nextLayer.find(n => n.index === targetIdx);
                if (target) {
                    lines.push({
                        id: `${node.id}-${target.id}`,
                        x1: getX(node.layer),
                        y1: getY(node.index, layer.length),
                        x2: getX(target.layer),
                        y2: getY(target.index, nextLayer.length),
                        active: isPathActive(node, target)
                    });
                }
            });
        });
    }
    return lines;
};

// Layout Math (Horizontal Scroll?)
// Let's do Vertical for Mobile? Or Horizontal?
// Slay the Spire is Vertical (Bottom to Top).
// Let's go Vertical: Layer 0 at Bottom.

const getX = (layer) => {
   // Center vertically? No, vertical stack.
   // Wait, X is horizontal.
   // Let's do X = Index spread, Y = Layer
   // Actually, standard is scrolling UP.
   return 0; // Handled by CSS Grid? No, need SVG coords.
};

// Let's use CSS Grid for nodes, SVG overlay might be tricky without fixed sizes.
// SIMPLIFIED APPROACH: Just use CSS lines or basic logic.
// For Mobile Polish (v36 is later), let's stick to a clean CSS Grid layout.
// Layer Row (bottom up) -> Flex Nodes.

const isReachable = (node) => {
    const current = s.world.currentNode;
    if (!current) return node.layer === 0; // Start nodes
    
    if (node.layer !== current.layer + 1) return false;
    
    // Check connection
    const prevNode = map.value[current.layer].find(n => n.index === current.index);
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
       <button @click="$emit('back')">LEAVE (Debug)</button>
    </div>

    <div class="map-container">
        <!-- Render from Last Layer (Top) to First Layer (Bottom) -->
        <!-- map is [layer0, layer1...] -->
        <!-- We want to display index 14 at top, index 0 at bottom -->
        <div 
            v-for="(layer, lIndex) in [...map].reverse()" 
            :key="lIndex"
            class="map-layer"
        >
            <!-- Real Layer Index calculation -->
            <div 
                v-for="node in layer"
                :key="node.id"
                class="map-node"
                :class="{ 
                    'reachable': isReachable(node),
                    'current': isCurrent(node),
                    'boss': node.type === 'boss',
                    'locked': !isReachable(node) && !isCurrent(node) && node.layer > (s.world.currentNode?.layer || -1)
                }"
                :style="{ borderColor: node.color, color: node.color }"
                @click="enterNode(node)"
            >
                <span class="icon">{{ node.icon }}</span>
                <span class="dev-lines" v-if="false">
                    <!-- Debug connections -->
                    {{ node.next }}
                </span>
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
}

.map-header {
    padding: 10px;
    border-bottom: 2px solid #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.map-container {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 30px;
    /* Reverse scrolling start from bottom? */
}

.map-layer {
    display: flex;
    justify-content: center;
    gap: 40px; /* Spacing between nodes */
    position: relative;
}

/* Optional: Draw lines with pseudo elements? Hard without SVG. */
/* For MVP, just trust the adjacency. */

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
