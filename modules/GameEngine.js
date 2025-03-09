export default class GameEngine {
    constructor({ player, renderer, commandParser, inputHandler, rooms, textOutput, roomNameDisplay, scoreDisplay }) {
        this.player = player;
        this.renderer = renderer;
        this.commandParser = commandParser;
        this.inputHandler = inputHandler;
        this.rooms = rooms;
        this.textOutput = textOutput;
        this.roomNameDisplay = roomNameDisplay;
        this.scoreDisplay = scoreDisplay;
        
        this.currentRoom = 'forest';
        this.gameFlags = {};
        this.inventory = [];
        this.score = 0;
        this.maxScore = 100;
        this.gameOver = false;
        
        // Sierra-style text display
        this.narrationQueue = [];
        this.narrationTimer = null;
        this.narrationSpeed = 30; // ms per character
        
        // Connect systems
        this.commandParser.setGameEngine(this);
        this.inputHandler.setGameEngine(this);
        this.player.setGameEngine(this);
    }
    
    start() {
        // Display initial room description
        this.displayMessage(this.rooms[this.currentRoom].description);
        
        // Start input handling
        this.inputHandler.initialize();
        
        // Start game loop with timestamp
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    gameLoop(timestamp) {
        this.update(timestamp);
        this.render();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    update(timestamp) {
        // Update player
        this.player.update();
        
        // Check for room transitions
        this.checkRoomTransitions();
        
        // Update room name display
        this.roomNameDisplay.textContent = this.rooms[this.currentRoom].name;
    }
    
    render() {
        this.renderer.render(this.currentRoom, this.player);
    }
    
    displayMessage(message) {
        // Clear any existing narration
        if (this.narrationTimer) {
            clearTimeout(this.narrationTimer);
        }
        
        this.textOutput.textContent = '';
        let index = 0;
        
        const narrate = () => {
            if (index < message.length) {
                this.textOutput.textContent += message.charAt(index);
                index++;
                this.narrationTimer = setTimeout(narrate, this.narrationSpeed);
            }
        };
        
        narrate();
    }
    
    getCurrentRoom() {
        return this.rooms[this.currentRoom];
    }
    
    changeRoom(roomId) {
        this.currentRoom = roomId;
        const room = this.rooms[roomId];
        
        // Place player at appropriate position based on which exit was used
        this.player.placeInNewRoom(room);
        
        // Display new room description
        this.displayMessage(room.description);
    }
    
    checkRoomTransitions() {
        const currentRoom = this.rooms[this.currentRoom];
        for (const obj of currentRoom.objects) {
            if (obj.isExit && this.player.isColliding(obj)) {
                this.changeRoom(obj.leadsTo);
                break;
            }
        }
    }
    
    handleDeath(message) {
        this.gameOver = true;
        
        const overlay = document.createElement('div');
        overlay.className = 'death-overlay';
        
        const deathMessage = document.createElement('div');
        deathMessage.className = 'death-message';
        deathMessage.textContent = message || "You have died! Be more careful next time.";
        
        const restoreButton = document.createElement('button');
        restoreButton.className = 'restore-button';
        restoreButton.textContent = "Restore Game";
        restoreButton.onclick = () => this.restoreGame();
        
        overlay.appendChild(deathMessage);
        overlay.appendChild(restoreButton);
        document.body.appendChild(overlay);
    }

    restoreGame() {
        const overlay = document.querySelector('.death-overlay');
        if (overlay) {
            document.body.removeChild(overlay);
        }
        
        this.gameOver = false;
        this.currentRoom = 'forest';
        this.player.x = 160;
        this.player.y = 150;
        
        this.displayMessage(this.rooms[this.currentRoom].description);
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    addPoints(points, reason = "") {
        this.score += points;
        if (reason) {
            this.displayMessage(`You just earned ${points} points ${reason}!`);
        }
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = this.score;
        }
    }
    
    // Inventory management
    addToInventory(item) {
        this.inventory.push(item);
    }
    
    removeFromInventory(itemName) {
        const index = this.inventory.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase());
        if (index !== -1) {
            return this.inventory.splice(index, 1)[0];
        }
        return null;
    }
    
    hasInInventory(itemName) {
        return this.inventory.some(item => item.name.toLowerCase() === itemName.toLowerCase());
    }
    
    getInventoryItem(itemName) {
        return this.inventory.find(item => item.name.toLowerCase() === itemName.toLowerCase());
    }
    
    showInventory() {
        if (this.inventory.length === 0) {
            this.displayMessage("Your inventory is empty.");
        } else {
            const itemNames = this.inventory.map(item => item.name).join(', ');
            this.displayMessage(`Inventory: ${itemNames}`);
        }
    }
}
