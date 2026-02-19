/**
 * Serenity Data Generator
 * Creates a "Universe" of memories with emotional weight and depth.
 */

const PHOTOS = [
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=400&auto=format&fit=crop", // Morning
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop", // Ocean
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&auto=format&fit=crop", // City Rain
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=400&auto=format&fit=crop", // Nebula
    "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=400&auto=format&fit=crop", // Mountain
    "https://images.unsplash.com/photo-1466781783364-36c955e42a7f?q=80&w=400&auto=format&fit=crop", // Glass House
    "https://images.unsplash.com/photo-1474044158699-59270e99d264?q=80&w=400&auto=format&fit=crop", // Canyon
    "https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=400&auto=format&fit=crop", // Forest
    "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?q=80&w=400&auto=format&fit=crop", // Field
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=400&auto=format&fit=crop", // Coding
    "https://images.unsplash.com/photo-1517404215738-15263e9f9178?q=80&w=400&auto=format&fit=crop", // Concert
    "https://images.unsplash.com/photo-1485627658391-1365e4e0dbfe?q=80&w=400&auto=format&fit=crop", // Architecture
    "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400&auto=format&fit=crop", // Profile
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop", // Portrait
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop"  // Portrait
];

const EMOTIONS = [
    { type: 'happy', color: '#F0B27A', weight: 0.8 },
    { type: 'bittersweet', color: '#B784A7', weight: 0.6 },
    { type: 'grief', color: '#5D6D7E', weight: 0.9 },
    { type: 'peaceful', color: '#76D7C4', weight: 0.4 },
    { type: 'nostalgic', color: '#B97C4B', weight: 0.7 },
    { type: 'loved', color: '#6C3483', weight: 1.0 }
];

const LAYERS = [
    { name: 'abyss', count: 400, opacity: [0.08, 0.12], size: [250, 350], z: -500 },
    { name: 'reflection', count: 300, opacity: [0.12, 0.18], size: [200, 280], z: -300 },
    { name: 'nostalgia', count: 200, opacity: [0.18, 0.25], size: [170, 230], z: -100 },
    { name: 'recent', count: 100, opacity: [0.25, 0.35], size: [150, 200], z: 0 },
    { name: 'present', count: 50, opacity: [0.35, 0.5], size: [120, 170], z: 100 }
];

const CONSTELLATIONS = [
    { name: "Her", x: -500, y: -200, color: "#E6B88A" }, // Warm Gold
    { name: "The Lake", x: 800, y: 300, color: "#5B9AA0" }, // Teal
    { name: "Winter 2024", x: -200, y: 800, color: "#9D8BB0" }, // Violet
    { name: "Childhood", x: 0, y: 0, color: "#F0B27A" } // Amber
];

function generateMemoryData() {
    const memories = [];
    let idCounter = 0;

    LAYERS.forEach(layer => {
        for (let i = 0; i < layer.count; i++) {
            const emotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
            const photo = PHOTOS[Math.floor(Math.random() * PHOTOS.length)];

            // Constellation Logic
            // 60% chance to belong to a constellation, 40% random drift
            let x, y, constellationId = null;

            if (Math.random() > 0.4) {
                const c = CONSTELLATIONS[Math.floor(Math.random() * CONSTELLATIONS.length)];
                const spread = 400; // How tight the cluster is
                x = c.x + (Math.random() - 0.5) * spread;
                y = c.y + (Math.random() - 0.5) * spread;
                constellationId = c.name;
            } else {
                const spread = 3000;
                x = (Math.random() - 0.5) * spread;
                y = (Math.random() - 0.5) * spread;
            }

            memories.push({
                id: ++idCounter,
                src: photo,
                emotion: emotion.type,
                baseColor: emotion.color,
                layer: layer.name,
                constellationId: constellationId, // NEW

                // Visual constraints
                x: x,
                y: y,
                z: layer.z + (Math.random() - 0.5) * 100,

                baseSize: Math.random() * (layer.size[1] - layer.size[0]) + layer.size[0],
                baseOpacity: Math.random() * (layer.opacity[1] - layer.opacity[0]) + layer.opacity[0],

                // Movement
                driftSpeed: {
                    x: (Math.random() - 0.5) * 0.1, // Even slower drift for "Stars" feel
                    y: (Math.random() - 0.5) * 0.1
                },

                // State
                warmth: 0,
                visits: 0,
                lastVisited: null,
                created: new Date(Date.now() - Math.random() * 10000000000)
            });
        }
    });

    return memories.sort((a, b) => a.z - b.z);
}

// Export for main.js 
// (In a real app we'd use modules, but for this simple setup we'll just load it globally or attach to window)
window.SerenityData = { generateMemoryData };
