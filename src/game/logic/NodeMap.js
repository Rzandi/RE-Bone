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
        
        // 1. Generate Layers
        for (let l = 0; l < this.config.layers; l++) {
            let layerNodes = [];
            
            // First Layer: All Combat (easier start)
            if (l === 0) {
                for (let i = 0; i < 3; i++) {
                    layerNodes.push(this.createNode(l, i, 'combat'));
                }
            } 
            // Last Layer: Boss
            else if (l === this.config.layers - 1) {
                layerNodes.push(this.createNode(l, 0, 'boss'));
            }
            // Middle Layers
            else {
                // Random count 2-4 nodes
                let count = 2 + Math.floor(Math.random() * 3);
                for (let i = 0; i < count; i++) {
                    let type = this.getRandomType(l);
                    // Force Rest Site at ~50% mark (Layer 7)
                    if (l === 7 && i === 0) type = 'rest';
                    
                    layerNodes.push(this.createNode(l, i, type));
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
            
            // Validation: Ensure every next-layer node has at least one parent?
            // (Skip for MVP, assume randomness covers it mostly)
        }

        return map;
    },

    createNode(layer, index, typeId) {
        const type = Object.values(this.nodeTypes).find(t => t.id === typeId);
        return {
            id: `${layer}-${index}`,
            layer: layer,
            index: index,
            type: typeId,
            icon: type.icon,
            color: type.color,
            next: [], // Indices of connected nodes in next layer
            status: 'locked' // locked | available | completed
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
