// Game world data definitions

export const rooms = {
    'forest': {
        name: 'Forest Entrance',
        background: '#005500',
        type: 'forest',
        objects: [
            { 
                name: 'tree', 
                x: 50, 
                y: 50, 
                width: 30, 
                height: 80, 
                description: 'A tall pine tree.',
                type: 'tree'
            },
            { 
                name: 'rock', 
                x: 200, 
                y: 170, 
                width: 20, 
                height: 15, 
                description: 'A moss-covered rock.', 
                canTake: true,
                type: 'rock'
            },
            { 
                name: 'path', 
                x: 160, 
                y: 190, 
                width: 50, 
                height: 10, 
                description: 'A path leading to a cottage.', 
                isExit: true, 
                leadsTo: 'cottage',
                type: 'path'
            }
        ],
        npcs: [
            { 
                name: 'old man', 
                x: 280, 
                y: 140, 
                width: 20, 
                height: 40, 
                description: 'An old man with a long beard.', 
                dialogue: "Hello traveler! I've lost my pendant. If you find it, I'll reward you!",
                type: 'oldMan'
            }
        ],
        description: 'You are at the entrance to a dark forest. There is a path leading south.',
        heightMap: {
            base: 0,
            variations: [
                { x: 0, y: 0, width: 320, height: 200, elevation: 0 }, // Base ground
                { x: 0, y: 0, width: 320, height: 80, elevation: -999 }, // Sky area (unwalkable)
                { x: 160, y: 80, width: 50, height: 120, elevation: 0 }, // Path
                // Add rocks and obstacles
                { x: 50, y: 50, width: 30, height: 30, elevation: -999 }, // Tree area (unwalkable)
                { x: 200, y: 170, width: 20, height: 15, elevation: 2 }, // Rock elevation
            ]
        }
    },
    'cottage': {
        name: 'Cottage',
        background: '#553311',
        type: 'cottage',
        objects: [
            { 
                name: 'door', 
                x: 160, 
                y: 100, 
                width: 40, 
                height: 80, 
                description: 'A wooden door to the cottage. You can enter by using or opening it.',
                type: 'door',
                isExit: true, 
                leadsTo: 'cottage_interior',
                isDoor: true
            },
            { 
                name: 'pendant', 
                x: 220, 
                y: 180, 
                width: 10, 
                height: 10, 
                description: 'A golden pendant.', 
                canTake: true,
                type: 'pendant'
            },
            { 
                name: 'path', 
                x: 160, 
                y: 10, 
                width: 50, 
                height: 10, 
                description: 'A path leading back to the forest.', 
                isExit: true, 
                leadsTo: 'forest',
                type: 'path'
            }
        ],
        npcs: [],
        description: 'A small cottage with a wooden door. The path leads back to the forest.',
        heightMap: {
            base: 0,
            variations: [
                // Base terrain
                { x: 0, y: 80, width: 320, height: 120, elevation: 0 },  // Ground
                { x: 0, y: 0, width: 320, height: 80, elevation: -999 }, // Sky
                
                // Path and steps
                { x: 140, y: 80, width: 80, height: 120, elevation: 0 }, // Path
                { x: 140, y: 140, width: 80, height: 20, elevation: 1 }, // Steps
                
                // Cottage collision
                { x: 100, y: 60, width: 160, height: 80, elevation: -999 }, // Cottage walls
                { x: 160, y: 140, width: 40, height: 40, elevation: 0 },    // Doorway
            ]
        }
    },
    'cottage_interior': {
        name: 'Inside Cottage',
        background: '#553311',
        type: 'cottage_interior',
        objects: [
            { 
                name: 'door', 
                x: 140,     // Centered better
                y: 160,     // At floor level
                width: 40, 
                height: 40,
                description: 'The cottage door leads back outside.', 
                isExit: true, 
                leadsTo: 'cottage',
                type: 'door',
                isDoor: true
            },
            { 
                name: 'table', 
                x: 120, 
                y: 120, 
                width: 80, 
                height: 40, 
                description: 'A wooden table with a few items on it.',
                type: 'table'
            },
            { 
                name: 'chair', 
                x: 90, 
                y: 130, 
                width: 20, 
                height: 20, 
                description: 'A simple wooden chair.',
                type: 'chair'
            }
        ],
        npcs: [],
        description: 'You are inside the small cottage. It\'s a cozy space with simple furniture.',
        heightMap: {
            base: 0,
            variations: [
                // Main floor
                { x: 20, y: 40, width: 280, height: 140, elevation: 0 },
                
                // Walls 
                { x: 0, y: 0, width: 320, height: 40, elevation: -999 },   // Top
                { x: 0, y: 180, width: 320, height: 20, elevation: -999 }, // Bottom
                { x: 0, y: 0, width: 20, height: 200, elevation: -999 },   // Left
                { x: 300, y: 0, width: 20, height: 200, elevation: -999 }, // Right
                
                // Door area
                { x: 140, y: 160, width: 40, height: 40, elevation: 0 },
                
                // Furniture collision
                { x: 120, y: 100, width: 80, height: 40, elevation: -999 }, // Table
                { x: 90, y: 110, width: 20, height: 20, elevation: -999 }   // Chair
            ]
        }
    }
};
