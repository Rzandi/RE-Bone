/* =========================================
   NODE MAP GENERATOR (The Atlas)
   Handles Slay-the-Spire style graph generation
   ========================================= */

export const NodeMap = {
    config: {
        layers: 15,          // Depth of the map
        width: 5,            // Max nodes per layer
        paths: 3,            // Min paths from start
        bossLayer: 14        // The final layer is Boss
    },

    nodeTypes: {
        COMBAT: { id: 'combat', icon: '⚔️', color: '#ff4444', chance: 0.45 },
        ELITE: { id: 'elite', icon: '💀', color: '#aa0000', chance: 0.15 },
        EVENT: { id: 'event', icon: '❓', color: '#8888ff', chance: 0.25 },
        REST: { id: 'rest', icon: '🔥', color: '#ffaa00', chance: 0.15 },
        BOSS: { id: 'boss', icon: '👹', color: '#aa00aa', chance: 0.0 }, // Special
        START: { id: 'start', icon: '🏁', color: '#ffffff', chance: 0.0 } // Special
    },

    generateMap(realmId) {
        let map = [];
        const realmConfig = window.REALMS ? window.REALMS[realmId] : null;

        // 1. Generate Layers
        for (let l = 0; l < this.config.layers; l++) {
            let layerNodes = [];
            
            // First Layer: All Combat (easier start)
            if (l === 0) {
                for (let i = 0; i < 3; i++) {
                    layerNodes.push(this.createNode(l, i, 'combat', realmConfig));
                }
            } 
            // Last Layer: Boss
            else if (l === this.config.layers - 1) {
                layerNodes.push(this.createNode(l, 0, 'boss', realmConfig));
            }
            // Middle Layers
            else {
                // Random count 2-4 nodes
                let count = 2 + Math.floor(Math.random() * 3);
                for (let i = 0; i < count; i++) {
                    let type = this.getRandomType(l);
                    // Force Rest Site at ~50% mark (Layer 7)
                    if (l === 7 && i === 0) type = 'rest';
                    
                    layerNodes.push(this.createNode(l, i, type, realmConfig));
                }
            }
            map.push(layerNodes);
        }

        // 2. Connect Paths (Simple forward linking)
        for (let l = 0; l < this.config.layers - 1; l++) {
            let currentLayer = map[l];
            let nextLayer = map[l+1];

            currentLayer.forEach(node => {
                // Connect to at least one node in next layer
                // Simple logic: connect to nearest index, plus minus 1
                // For Boss layer (single node), all connect to it.
                if (nextLayer.length === 1) {
                    node.next.push(0); // Connect to Boss
                } else {
                    // Random connections 1-2
                    let attempts = 0;
                    while (node.next.length < 1 && attempts < 10) {
                        let targetIdx = Math.floor(Math.random() * nextLayer.length);
                        // Ensure slightly logical path (not crossing entire map)
                        // But for now, random is fine for prototype
                        if (!node.next.includes(targetIdx)) {
                            node.next.push(targetIdx);
                        }
                        attempts++;
                    }
                }
            });
            
            
            // Validation: Ensure every next-layer node has at least one parent
            const nextLayerIds = nextLayer.map(n => n.index);
            const connectedIndices = new Set();
            currentLayer.forEach(n => n.next.forEach(idx => connectedIndices.add(idx)));

            nextLayer.forEach(nextNode => {
                if (!connectedIndices.has(nextNode.index)) {
                     // ORPHAN DETECTED! Connect a random parent from current layer
                     // Find a parent with close index to keep lines somewhat straight
                     const parent = currentLayer.reduce((prev, curr) => {
                        return (Math.abs(curr.index - nextNode.index) < Math.abs(prev.index - nextNode.index)) ? curr : prev;
                     });
                     parent.next.push(nextNode.index);
                     connectedIndices.add(nextNode.index);
                     // console.log(`Fixed Orphan: Node ${nextNode.id} connected to ${parent.id}`);
                }
            });
        }

        return map;
    },

    createNode(layer, index, typeId, realmConfig = null) {
        const type = Object.values(this.nodeTypes).find(t => t.id === typeId);
        
        // v34.0: Assign Sub-Biome
        let biome = null;
        if(realmConfig && realmConfig.biomes) {
            // Simple logic: 5 biomes spread across 15 layers -> 3 layers per biome
            const biomeIndex = Math.min(Math.floor(layer / 3), realmConfig.biomes.length - 1);
            biome = realmConfig.biomes[biomeIndex];
        }

        return {
            id: `${layer}-${index}`,
            layer: layer,
            index: index,
            type: typeId,
            icon: type.icon,
            color: type.color,
            next: [], // Indices of connected nodes in next layer
            status: 'locked', // locked | available | completed
            biome: biome // The specific environment
        };
    },

    getRandomType(layer) {
        // Elite only after level 5
        let types = ['combat', 'event'];
        if (layer > 3) types.push('elite');
        if (layer > 2) types.push('rest');

        // Weighted Random (Simple version)
        const type = types[Math.floor(Math.random() * types.length)];
        return type;
    }
};
