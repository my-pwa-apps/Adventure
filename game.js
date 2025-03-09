// Game engine for Sierra-style adventure

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const textOutput = document.getElementById('textOutput');
const commandInput = document.getElementById('commandInput');
const roomNameDisplay = document.getElementById('roomName');

// Game state
const gameState = {
    playerX: 160,
    playerY: 150,
    playerSpeed: 2,
    currentRoom: 'forest',
    inventory: [],
    gameFlags: {}
};

// Room definitions
const rooms = {
    'forest': {
        name: 'Forest Entrance',
        background: '#005500',
        objects: [
            { name: 'tree', x: 50, y: 50, width: 30, height: 80, description: 'A tall pine tree.' },
            { name: 'rock', x: 200, y: 170, width: 20, height: 15, description: 'A moss-covered rock.', canTake: true },
            { name: 'path', x: 160, y: 190, width: 50, height: 10, description: 'A path leading to a cottage.', isExit: true, leadsTo: 'cottage' }
        ],
        npcs: [
            { name: 'old man', x: 280, y: 140, width: 20, height: 40, description: 'An old man with a long beard.', dialogue: "Hello traveler! I've lost my pendant. If you find it, I'll reward you!" }
        ],
        description: 'You are at the entrance to a dark forest. There is a path leading south.'
    },
    'cottage': {
        name: 'Cottage',
        background: '#553311',
        objects: [
            { name: 'door', x: 160, y: 100, width: 40, height: 80, description: 'A wooden door to the cottage.' },
            { name: 'pendant', x: 220, y: 180, width: 10, height: 10, description: 'A golden pendant.', canTake: true },
            { name: 'path', x: 160, y: 10, width: 50, height: 10, description: 'A path leading back to the forest.', isExit: true, leadsTo: 'forest' }
        ],
        npcs: [],
        description: 'A small cottage with a wooden door. The path leads back to the forest.'
    }
};

// Sprites (simple colored rectangles for this example)
const playerSprite = {
    width: 16,
    height: 30,
    color: '#ffff00'
};

// Handle keyboard input for movement
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Event listeners
window.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
    }
});

// Text parser
commandInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const command = commandInput.value.toLowerCase().trim();
        parseCommand(command);
        commandInput.value = '';
    }
});

function parseCommand(command) {
    const words = command.split(' ');
    const verb = words[0];
    
    if (command === '') {
        displayMessage("Please enter a command.");
        return;
    }
    
    // Basic commands
    if (verb === 'look' || verb === 'examine') {
        if (words.length === 1) {
            // Just "look"
            displayMessage(rooms[gameState.currentRoom].description);
        } else {
            // Look at something specific
            const targetName = words.slice(1).join(' ').replace('at ', '');
            lookAtObject(targetName);
        }
    } else if (verb === 'take' || verb === 'get') {
        if (words.length > 1) {
            const itemName = words.slice(1).join(' ');
            takeObject(itemName);
        } else {
            displayMessage("Take what?");
        }
    } else if (verb === 'use') {
        if (words.length > 1) {
            const itemName = words.slice(1).join(' ');
            useObject(itemName);
        } else {
            displayMessage("Use what?");
        }
    } else if (verb === 'talk' && words[1] === 'to') {
        if (words.length > 2) {
            const npcName = words.slice(2).join(' ');
            talkToNpc(npcName);
        } else {
            displayMessage("Talk to whom?");
        }
    } else if (verb === 'inventory' || verb === 'i') {
        showInventory();
    } else if (verb === 'help') {
        displayMessage("Commands: look, take [item], use [item], talk to [person], inventory");
    } else {
        displayMessage("I don't understand that command.");
    }
}

function displayMessage(message) {
    textOutput.textContent = message;
}

function lookAtObject(targetName) {
    const room = rooms[gameState.currentRoom];
    
    // Check objects in the room
    for (const obj of room.objects) {
        if (obj.name.toLowerCase() === targetName.toLowerCase()) {
            displayMessage(obj.description);
            return;
        }
    }
    
    // Check NPCs in the room
    for (const npc of room.npcs) {
        if (npc.name.toLowerCase() === targetName.toLowerCase()) {
            displayMessage(npc.description);
            return;
        }
    }
    
    // Check inventory items
    for (const item of gameState.inventory) {
        if (item.name.toLowerCase() === targetName.toLowerCase()) {
            displayMessage(item.description);
            return;
        }
    }
    
    displayMessage("You don't see that here.");
}

function takeObject(itemName) {
    const room = rooms[gameState.currentRoom];
    
    for (let i = 0; i < room.objects.length; i++) {
        const obj = room.objects[i];
        if (obj.name.toLowerCase() === itemName.toLowerCase()) {
            if (obj.canTake) {
                gameState.inventory.push({...obj});
                room.objects.splice(i, 1);
                displayMessage(`You take the ${obj.name}.`);
                return;
            } else {
                displayMessage(`You can't take the ${obj.name}.`);
                return;
            }
        }
    }
    
    displayMessage("You don't see that here.");
}

function useObject(itemName) {
    // Check if item is in inventory
    const itemIndex = gameState.inventory.findIndex(
        item => item.name.toLowerCase() === itemName.toLowerCase()
    );
    
    if (itemIndex !== -1) {
        // Item-specific logic
        if (itemName === 'pendant' && gameState.currentRoom === 'forest') {
            // Check if near the old man
            const oldMan = rooms.forest.npcs.find(npc => npc.name === 'old man');
            if (isPlayerNear(oldMan)) {
                displayMessage("The old man takes the pendant. 'Thank you! As promised, here's your reward.' He gives you a magic key.");
                gameState.inventory.splice(itemIndex, 1);
                gameState.inventory.push({
                    name: 'magic key',
                    description: 'A glowing magic key.',
                    canTake: true
                });
                return;
            }
        }
        
        displayMessage(`You used the ${itemName}, but nothing happens.`);
    } else {
        displayMessage(`You don't have a ${itemName}.`);
    }
}

function talkToNpc(npcName) {
    const room = rooms[gameState.currentRoom];
    
    for (const npc of room.npcs) {
        if (npc.name.toLowerCase() === npcName.toLowerCase()) {
            if (isPlayerNear(npc)) {
                displayMessage(`${npc.name} says: "${npc.dialogue}"`);
            } else {
                displayMessage(`You need to get closer to ${npc.name}.`);
            }
            return;
        }
    }
    
    displayMessage(`You don't see ${npcName} here.`);
}

function showInventory() {
    if (gameState.inventory.length === 0) {
        displayMessage("Your inventory is empty.");
    } else {
        const itemNames = gameState.inventory.map(item => item.name).join(', ');
        displayMessage(`Inventory: ${itemNames}`);
    }
}

function isPlayerNear(entity) {
    const distance = Math.sqrt(
        Math.pow(gameState.playerX - entity.x, 2) + 
        Math.pow(gameState.playerY - entity.y, 2)
    );
    return distance < 50;
}

// Update game state
function update() {
    // Handle movement based on key presses
    if (keys.ArrowUp) {
        gameState.playerY -= gameState.playerSpeed;
    }
    if (keys.ArrowDown) {
        gameState.playerY += gameState.playerSpeed;
    }
    if (keys.ArrowLeft) {
        gameState.playerX -= gameState.playerSpeed;
    }
    if (keys.ArrowRight) {
        gameState.playerX += gameState.playerSpeed;
    }
    
    // Keep player within bounds
    gameState.playerX = Math.max(0, Math.min(canvas.width - playerSprite.width, gameState.playerX));
    gameState.playerY = Math.max(0, Math.min(canvas.height - playerSprite.height, gameState.playerY));
    
    // Check for room exits
    const currentRoom = rooms[gameState.currentRoom];
    for (const obj of currentRoom.objects) {
        if (obj.isExit && isColliding(gameState.playerX, gameState.playerY, playerSprite.width, playerSprite.height, obj)) {
            changeRoom(obj.leadsTo);
            break;
        }
    }
    
    // Update room name display
    roomNameDisplay.textContent = rooms[gameState.currentRoom].name;
}

function isColliding(x1, y1, w1, h1, obj) {
    return x1 < obj.x + obj.width &&
           x1 + w1 > obj.x &&
           y1 < obj.y + obj.height &&
           y1 + h1 > obj.y;
}

function changeRoom(roomId) {
    gameState.currentRoom = roomId;
    
    // Place player at appropriate position based on which exit was used
    const room = rooms[roomId];
    
    // Find the exit that leads back to where we came from
    for (const obj of room.objects) {
        if (obj.isExit) {
            if (obj.y < canvas.height / 2) {
                // Exit is at the top, place player at the bottom
                gameState.playerY = canvas.height - playerSprite.height - 20;
            } else if (obj.y > canvas.height / 2) {
                // Exit is at the bottom, place player at the top
                gameState.playerY = 20;
            }
            
            if (obj.x < canvas.width / 2) {
                // Exit is at the left, place player at the right
                gameState.playerX = canvas.width - playerSprite.width - 20;
            } else if (obj.x > canvas.width / 2) {
                // Exit is at the right, place player at the left
                gameState.playerX = 20;
            }
        }
    }
    
    displayMessage(room.description);
}

// Draw game state
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = rooms[gameState.currentRoom].background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw objects
    const room = rooms[gameState.currentRoom];
    for (const obj of room.objects) {
        // Different colors for different types of objects
        if (obj.isExit) {
            ctx.fillStyle = '#888888';
        } else if (obj.canTake) {
            ctx.fillStyle = '#ffff00'; // Yellow for items
        } else {
            ctx.fillStyle = '#8B4513'; // Saddle Brown for scenery
        }
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    }
    
    // Draw NPCs
    for (const npc of room.npcs) {
        ctx.fillStyle = '#00ffff'; // Cyan for NPCs
        ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
    }
    
    // Draw player
    ctx.fillStyle = playerSprite.color;
    ctx.fillRect(gameState.playerX, gameState.playerY, playerSprite.width, playerSprite.height);
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
displayMessage(rooms[gameState.currentRoom].description);
gameLoop();
