export default class CommandParser {
    constructor(outputElement) {
        this.outputElement = outputElement;
        this.gameEngine = null;
    }
    
    setGameEngine(gameEngine) {
        this.gameEngine = gameEngine;
    }
    
    parseCommand(command) {
        const words = command.split(' ');
        const verb = words[0];
        
        if (command === '') {
            this.gameEngine.displayMessage("Please enter a command.");
            return;
        }
        
        // Basic commands
        switch (verb) {
            case 'look':
            case 'examine':
                this.handleLookCommand(words);
                break;
            case 'take':
            case 'get':
                this.handleTakeCommand(words);
                break;
            case 'use':
                this.handleUseCommand(words);
                break;
            case 'inventory':
            case 'i':
                this.gameEngine.showInventory();
                break;
            case 'help':
                this.gameEngine.displayMessage("Commands: look, take [item], use [item], talk to [person], inventory");
                break;
            case 'talk':
                if (words[1] === 'to') {
                    this.handleTalkCommand(words);
                } else {
                    this.gameEngine.displayMessage("Did you mean 'talk to [person]'?");
                }
                break;
            default:
                this.gameEngine.displayMessage("I don't understand that command.");
        }
    }
    
    handleLookCommand(words) {
        if (words.length === 1) {
            // Just "look"
            const room = this.gameEngine.getCurrentRoom();
            this.gameEngine.displayMessage(room.description);
        } else {
            // Look at something specific
            const targetName = words.slice(1).join(' ').replace('at ', '');
            this.lookAtObject(targetName);
        }
    }
    
    handleTakeCommand(words) {
        if (words.length > 1) {
            const itemName = words.slice(1).join(' ');
            this.takeObject(itemName);
        } else {
            this.gameEngine.displayMessage("Take what?");
        }
    }
    
    handleUseCommand(words) {
        if (words.length > 1) {
            const itemName = words.slice(1).join(' ');
            this.useObject(itemName);
        } else {
            this.gameEngine.displayMessage("Use what?");
        }
    }
    
    handleTalkCommand(words) {
        if (words.length > 2) {
            const npcName = words.slice(2).join(' ');
            this.talkToNpc(npcName);
        } else {
            this.gameEngine.displayMessage("Talk to whom?");
        }
    }
    
    lookAtObject(targetName) {
        const room = this.gameEngine.getCurrentRoom();
        
        // Check objects in the room
        for (const obj of room.objects) {
            if (obj.name.toLowerCase() === targetName.toLowerCase()) {
                this.gameEngine.displayMessage(obj.description);
                return;
            }
        }
        
        // Check NPCs in the room
        if (room.npcs) {
            for (const npc of room.npcs) {
                if (npc.name.toLowerCase() === targetName.toLowerCase()) {
                    this.gameEngine.displayMessage(npc.description);
                    return;
                }
            }
        }
        
        // Check inventory items
        for (const item of this.gameEngine.inventory) {
            if (item.name.toLowerCase() === targetName.toLowerCase()) {
                this.gameEngine.displayMessage(item.description);
                return;
            }
        }
        
        this.gameEngine.displayMessage("You don't see that here.");
    }
    
    takeObject(itemName) {
        const room = this.gameEngine.getCurrentRoom();
        
        for (let i = 0; i < room.objects.length; i++) {
            const obj = room.objects[i];
            if (obj.name.toLowerCase() === itemName.toLowerCase()) {
                if (obj.canTake) {
                    this.gameEngine.addToInventory({...obj});
                    room.objects.splice(i, 1);
                    this.gameEngine.displayMessage(`You take the ${obj.name}.`);
                    return;
                } else {
                    this.gameEngine.displayMessage(`You can't take the ${obj.name}.`);
                    return;
                }
            }
        }
        
        this.gameEngine.displayMessage("You don't see that here.");
    }
    
    useObject(itemName) {
        if (!this.gameEngine.hasInInventory(itemName)) {
            this.gameEngine.displayMessage(`You don't have a ${itemName}.`);
            return;
        }
        
        // Item-specific logic
        if (itemName === 'pendant' && this.gameEngine.currentRoom === 'forest') {
            const room = this.gameEngine.getCurrentRoom();
            const oldMan = room.npcs?.find(npc => npc.name === 'old man');
            
            if (oldMan && this.gameEngine.player.isNear(oldMan)) {
                this.gameEngine.displayMessage("The old man takes the pendant. 'Thank you! As promised, here's your reward.' He gives you a magic key.");
                this.gameEngine.removeFromInventory('pendant');
                this.gameEngine.addToInventory({
                    name: 'magic key',
                    description: 'A glowing magic key.',
                    canTake: true
                });
                return;
            }
        }
        
        this.gameEngine.displayMessage(`You used the ${itemName}, but nothing happens.`);
    }
    
    talkToNpc(npcName) {
        const room = this.gameEngine.getCurrentRoom();
        
        if (!room.npcs) {
            this.gameEngine.displayMessage(`You don't see ${npcName} here.`);
            return;
        }
        
        for (const npc of room.npcs) {
            if (npc.name.toLowerCase() === npcName.toLowerCase()) {
                if (this.gameEngine.player.isNear(npc)) {
                    this.gameEngine.displayMessage(`${npc.name} says: "${npc.dialogue}"`);
                } else {
                    this.gameEngine.displayMessage(`You need to get closer to ${npc.name}.`);
                }
                return;
            }
        }
        
        this.gameEngine.displayMessage(`You don't see ${npcName} here.`);
    }
}
