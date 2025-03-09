export default class GameEngine {
    constructor({ player, renderer, commandParser, inputHandler, rooms, textOutput, roomNameDisplay }) {
        this.player = player;
        this.renderer = renderer;
        this.commandParser = commandParser;
        this.inputHandler = inputHandler;
        this.rooms = rooms;
        this.textOutput = textOutput;
        this.roomNameDisplay = roomNameDisplay;
        
        this.currentRoom = 'forest';
        this.gameFlags = {};
        this.inventory = [];
        
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
        
        // Start game loop
        this.gameLoop();
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
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
        this.textOutput.textContent = message;
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
