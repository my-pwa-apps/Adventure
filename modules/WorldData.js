// Game world data definitions

// List of all sprites to load
export const spriteList = [
    { id: 'player', path: 'assets/sprites/player.png' },
    { id: 'oldMan', path: 'assets/sprites/old_man.png' },
    { id: 'tree', path: 'assets/sprites/tree.png' },
    { id: 'rock', path: 'assets/sprites/rock.png' },
    { id: 'path', path: 'assets/sprites/path.png' },
    { id: 'door', path: 'assets/sprites/door.png' },
    { id: 'pendant', path: 'assets/sprites/pendant.png' },
    { id: 'forestBg', path: 'assets/backgrounds/forest.png' },
    { id: 'cottageBg', path: 'assets/backgrounds/cottage.png' }
];

export const rooms = {
    'forest': {
        name: 'Forest Entrance',
        background: '#005500',
        backgroundSprite: 'forestBg',
        objects: [
            { 
                name: 'tree', 
                x: 50, 
                y: 50, 
                width: 30, 
                height: 80, 
                description: 'A tall pine tree.',
                sprite: 'tree'
            },
            { 
                name: 'rock', 
                x: 200, 
                y: 170, 
                width: 20, 
                height: 15, 
                description: 'A moss-covered rock.', 
                canTake: true,
                sprite: 'rock'
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
                sprite: 'path'
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
                sprite: 'oldMan'
            }
        ],
        description: 'You are at the entrance to a dark forest. There is a path leading south.'
    },
    'cottage': {
        name: 'Cottage',
        background: '#553311',
        backgroundSprite: 'cottageBg',
        objects: [
            { 
                name: 'door', 
                x: 160, 
                y: 100, 
                width: 40, 
                height: 80, 
                description: 'A wooden door to the cottage.',
                sprite: 'door'
            },
            { 
                name: 'pendant', 
                x: 220, 
                y: 180, 
                width: 10, 
                height: 10, 
                description: 'A golden pendant.', 
                canTake: true,
                sprite: 'pendant'
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
                sprite: 'path'
            }
        ],
        npcs: [],
        description: 'A small cottage with a wooden door. The path leads back to the forest.'
    }
};

// You can add more game data here as the game expands:
// - Items database
// - NPC database
// - Quest information
// - Dialog trees
