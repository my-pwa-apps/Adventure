export default class Renderer {
    constructor(canvasElement, rooms) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.rooms = rooms;
        this.spriteManager = null;
    }
    
    setSpriteManager(spriteManager) {
        this.spriteManager = spriteManager;
    }
    
    render(currentRoomId, player) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const room = this.rooms[currentRoomId];
        
        // Draw background
        if (this.spriteManager && this.spriteManager.isLoaded() && room.backgroundSprite) {
            const bgSprite = this.spriteManager.getSprite(room.backgroundSprite);
            if (bgSprite) {
                this.ctx.drawImage(bgSprite, 0, 0, this.canvas.width, this.canvas.height);
            } else {
                // Fallback to solid color if sprite not found
                this.ctx.fillStyle = room.background;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        } else {
            // Fallback to solid color if sprites aren't loaded yet
            this.ctx.fillStyle = room.background;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Draw objects
        this.drawObjects(room.objects);
        
        // Draw NPCs
        this.drawNPCs(room.npcs);
        
        // Draw player
        this.drawPlayer(player);
    }
    
    drawObjects(objects) {
        for (const obj of objects) {
            if (this.spriteManager && this.spriteManager.isLoaded() && obj.sprite) {
                const sprite = this.spriteManager.getSprite(obj.sprite);
                if (sprite) {
                    this.ctx.drawImage(sprite, obj.x, obj.y, obj.width, obj.height);
                    continue;
                }
            }
            
            // Fallback to colored rectangles if sprite not available
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
            if (this.spriteManager && this.spriteManager.isLoaded() && npc.sprite) {
                const sprite = this.spriteManager.getSprite(npc.sprite);
                if (sprite) {
                    this.ctx.drawImage(sprite, npc.x, npc.y, npc.width, npc.height);
                    continue;
                }
            }
            
            // Fallback to colored rectangle if sprite not available
            this.ctx.fillStyle = '#00ffff'; // Cyan for NPCs
            this.ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
        }
    }
    
    drawPlayer(player) {
        if (this.spriteManager && this.spriteManager.isLoaded()) {
            const playerSprite = this.spriteManager.getSprite('player');
            if (playerSprite) {
                this.ctx.drawImage(playerSprite, player.x, player.y, player.width, player.height);
                return;
            }
        }
        
        // Fallback to colored rectangle if sprite not available
        this.ctx.fillStyle = player.color;
        this.ctx.fillRect(player.x, player.y, player.width, player.height);
    }
    
    // Draw loading screen during sprite loading
    drawLoadingScreen(progress) {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Loading...', this.canvas.width / 2, this.canvas.height / 2 - 30);
        
        // Draw progress bar
        const barWidth = this.canvas.width * 0.7;
        const barHeight = 20;
        const barX = (this.canvas.width - barWidth) / 2;
        const barY = this.canvas.height / 2;
        
        // Draw empty bar
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Draw filled portion
        this.ctx.fillStyle = '#5555ff';
        this.ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * progress, barHeight - 4);
        
        // Show percentage
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`${Math.round(progress * 100)}%`, this.canvas.width / 2, barY + barHeight + 30);
    }
}
