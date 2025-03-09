export default class Renderer {
    constructor(canvasElement, rooms) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.rooms = rooms;
    }
    
    render(currentRoomId, player) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const room = this.rooms[currentRoomId];
        
        // Draw background
        this.ctx.fillStyle = room.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw objects
        this.drawObjects(room.objects);
        
        // Draw NPCs
        this.drawNPCs(room.npcs);
        
        // Draw player
        this.drawPlayer(player);
    }
    
    drawObjects(objects) {
        for (const obj of objects) {
            // Different colors for different types of objects
            if (obj.isExit) {
                this.ctx.fillStyle = '#888888';
            } else if (obj.canTake) {
                this.ctx.fillStyle = '#ffff00'; // Yellow for items
            } else {
                this.ctx.fillStyle = '#8B4513'; // Saddle Brown for scenery
            }
            this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        }
    }
    
    drawNPCs(npcs) {
        if (!npcs) return;
        
        for (const npc of npcs) {
            this.ctx.fillStyle = '#00ffff'; // Cyan for NPCs
            this.ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
        }
    }
    
    drawPlayer(player) {
        this.ctx.fillStyle = player.color;
        this.ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}
