export default class Renderer {
    constructor(canvasElement, rooms) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.rooms = rooms;
        
        // Pixel size for "retro" drawing
        this.pixelSize = 2;
        
        // Color palettes for procedural generation
        this.palettes = {
            forest: ['#005500', '#007700', '#009900', '#00bb00'],
            cottage: ['#553311', '#775533', '#997755', '#bb9977'],
            grass: ['#005500', '#007700', '#009900', '#00bb00'],
            dirt: ['#663300', '#885522', '#aa7744', '#cc9966'],
            wood: ['#663300', '#885522', '#aa7744', '#cc9966'],
            stone: ['#777777', '#999999', '#aaaaaa', '#cccccc'],
            foliage: ['#005500', '#007700', '#009900', '#00bb00'],
            water: ['#0000aa', '#0000cc', '#0000ee', '#0000ff'],
            sky: ['#3399ff', '#55aaff', '#77ccff', '#99eeff']
        };
        
        // Cache for background rendering
        this.backgroundCache = {};
    }
    
    setSpriteManager(spriteManager) {
        this.spriteManager = spriteManager;
    }
    
    render(currentRoomId, player) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const room = this.rooms[currentRoomId];
        
        // Draw background (from cache if available)
        this.drawBackground(room, currentRoomId);
        
        // Draw objects
        this.drawObjects(room.objects);
        
        // Draw NPCs
        this.drawNPCs(room.npcs);
        
        // Draw player
        this.drawPlayer(player);
    }
    
    drawBackground(room, roomId) {
        // Check if we have a cached background
        if (this.backgroundCache[roomId]) {
            this.ctx.drawImage(this.backgroundCache[roomId], 0, 0);
            return;
        }
        
        // Create an off-screen canvas for background caching
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = this.canvas.width;
        bgCanvas.height = this.canvas.height;
        const bgCtx = bgCanvas.getContext('2d');
        
        // Draw base background color
        bgCtx.fillStyle = room.background;
        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        // Generate background based on room type
        if (room.type === 'forest') {
            this.drawForestBackground(bgCtx, bgCanvas);
        } else if (room.type === 'cottage') {
            this.drawCottageBackground(bgCtx, bgCanvas);
        }
        
        // Add some randomized details to make the background more interesting
        this.drawRandomizedDetails(room.type, bgCtx, bgCanvas);
        
        // Store the rendered background in cache
        this.backgroundCache[roomId] = bgCanvas;
        
        // Draw the background to the main canvas
        this.ctx.drawImage(bgCanvas, 0, 0);
    }
    
    drawForestBackground(ctx, canvas) {
        // Draw sky
        ctx.fillStyle = '#87ceeb';  // Sky blue
        ctx.fillRect(0, 0, canvas.width, canvas.height / 3);
        
        // Draw distant trees (simplified shapes)
        for (let x = 0; x < canvas.width; x += 20) {
            const height = 30 + Math.random() * 20;
            ctx.fillStyle = this.getRandomColor(this.palettes.foliage);
            ctx.fillRect(x, canvas.height / 3 - height, 15, height);
        }
        
        // Draw ground
        ctx.fillStyle = '#228B22';  // Forest green
        ctx.fillRect(0, canvas.height / 3, canvas.width, canvas.height * 2/3);
        
        // Add some noise/texture to the ground
        this.addNoiseTexture(0, canvas.height / 3, canvas.width, canvas.height * 2/3, 
                           this.palettes.grass, 0.1, ctx);
    }
    
    drawCottageBackground(ctx, canvas) {
        // Draw sky
        ctx.fillStyle = '#87ceeb';  // Sky blue
        ctx.fillRect(0, 0, canvas.width, canvas.height / 3);
        
        // Draw hills
        ctx.fillStyle = '#228B22';  // Forest green
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 3);
        
        // Create wavy hills with a deterministic pattern for caching
        const seed = 12345; // Fixed seed for reproducibility
        for (let x = 0; x < canvas.width; x += 50) {
            // Use a deterministic function instead of Math.random()
            const height = ((x * seed) % 20);
            ctx.lineTo(x, canvas.height / 3 + height);
        }
        ctx.lineTo(canvas.width, canvas.height / 3);
        ctx.closePath();
        ctx.fill();
        
        // Draw ground
        ctx.fillStyle = '#8B4513';  // Saddle brown for dirt
        ctx.fillRect(0, canvas.height / 3, canvas.width, canvas.height * 2/3);
        
        // Draw a simple cottage in the background
        ctx.fillStyle = '#A0522D';  // Brown for cottage
        ctx.fillRect(80, 60, 160, 80);
        
        // Roof
        ctx.fillStyle = '#8B4513';  // Darker brown for roof
        ctx.beginPath();
        ctx.moveTo(70, 60);
        ctx.lineTo(160, 30);
        ctx.lineTo(250, 60);
        ctx.closePath();
        ctx.fill();
        
        // Add some noise/texture to the ground
        this.addNoiseTexture(0, canvas.height / 3, canvas.width, canvas.height * 2/3, 
                           this.palettes.dirt, 0.1, ctx);
    }
    
    drawRandomizedDetails(roomType, ctx, canvas) {
        // Use deterministic pattern for caching consistency
        const seed = roomType === 'forest' ? 54321 : 98765;
        const numDetails = 20;
        const palette = roomType === 'forest' ? this.palettes.grass : this.palettes.dirt;
        
        for (let i = 0; i < numDetails; i++) {
            const x = (i * seed) % canvas.width;
            const y = (canvas.height / 3) + ((i * seed * 31) % (canvas.height * 2/3));
            const size = 2 + (i % 5);
            
            ctx.fillStyle = palette[i % palette.length];
            ctx.fillRect(x, y, size, size);
        }
    }
    
    addNoiseTexture(x, y, width, height, colorPalette, density, ctx = this.ctx) {
        // Use a deterministic pattern for texture when cached
        const pixelsToAdd = Math.floor(width * height * density);
        const seed = 42; // Fixed seed
        
        for (let i = 0; i < pixelsToAdd; i++) {
            const px = x + ((i * seed) % width);
            const py = y + ((i * seed * 27) % height);
            const color = colorPalette[i % colorPalette.length];
            
            ctx.fillStyle = color;
            ctx.fillRect(px, py, this.pixelSize, this.pixelSize);
        }
    }
    
    getRandomColor(palette) {
        return palette[Math.floor(Math.random() * palette.length)];
    }
    
    drawObjects(objects) {
        for (const obj of objects) {
            // Different drawing methods based on object type
            switch(obj.type) {
                case 'tree':
                    this.drawTree(obj.x, obj.y, obj.width, obj.height);
                    break;
                case 'rock': 
                    this.drawRock(obj.x, obj.y, obj.width, obj.height);
                    break;
                case 'path':
                    this.drawPath(obj.x, obj.y, obj.width, obj.height);
                    break;
                case 'door':
                    this.drawDoor(obj.x, obj.y, obj.width, obj.height);
                    break;
                case 'pendant':
                    this.drawPendant(obj.x, obj.y, obj.width, obj.height);
                    break;
                default:
                    // Generic colored rectangle as fallback
                    this.ctx.fillStyle = obj.isExit ? '#888888' : 
                                        obj.canTake ? '#ffff00' : '#8B4513';
                    this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            }
        }
    }
    
    drawTree(x, y, width, height) {
        // Draw tree trunk
        this.ctx.fillStyle = '#8B4513'; // Brown
        const trunkWidth = width / 2;
        const trunkHeight = height / 2;
        const trunkX = x + (width - trunkWidth) / 2;
        this.ctx.fillRect(trunkX, y + height - trunkHeight, trunkWidth, trunkHeight);
        
        // Draw foliage (triangle for pine tree)
        this.ctx.fillStyle = '#228B22'; // Forest green
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + height - trunkHeight);
        this.ctx.lineTo(x + width / 2, y);
        this.ctx.lineTo(x + width, y + height - trunkHeight);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add some details to the foliage
        this.addNoiseTexture(x, y, width, height - trunkHeight, this.palettes.foliage, 0.05);
    }
    
    drawRock(x, y, width, height) {
        // Draw a rock with some shading
        const rockGradient = this.ctx.createRadialGradient(
            x + width / 2, y + height / 2, 1,
            x + width / 2, y + height / 2, width
        );
        rockGradient.addColorStop(0, '#aaaaaa');
        rockGradient.addColorStop(1, '#666666');
        
        // Draw rock as an ellipse
        this.ctx.fillStyle = rockGradient;
        this.ctx.beginPath();
        this.ctx.ellipse(
            x + width / 2, y + height / 2,
            width / 2, height / 2,
            0, 0, Math.PI * 2
        );
        this.ctx.fill();
        
        // Add some details to make it look more like a rock
        this.addNoiseTexture(x, y, width, height, this.palettes.stone, 0.1);
    }
    
    drawPath(x, y, width, height) {
        // Draw a dirt path
        this.ctx.fillStyle = '#8B4513'; // Saddle brown
        this.ctx.fillRect(x, y, width, height);
        
        // Add some texture/noise to the path
        this.addNoiseTexture(x, y, width, height, this.palettes.dirt, 0.2);
    }
    
    drawDoor(x, y, width, height) {
        // Door frame
        this.ctx.fillStyle = '#8B4513'; // Brown
        this.ctx.fillRect(x, y, width, height);
        
        // Door itself
        this.ctx.fillStyle = '#A0522D'; // Sienna (slightly lighter brown)
        this.ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
        
        // Door handle
        this.ctx.fillStyle = '#FFD700'; // Gold
        this.ctx.fillRect(x + width * 0.8, y + height / 2, width * 0.1, width * 0.1);
    }
    
    drawPendant(x, y, width, height) {
        // Draw pendant chain
        this.ctx.strokeStyle = '#C0C0C0'; // Silver
        this.ctx.beginPath();
        this.ctx.moveTo(x + width / 2, y);
        this.ctx.lineTo(x + width / 2, y + height / 3);
        this.ctx.stroke();
        
        // Draw pendant itself (circle)
        this.ctx.fillStyle = '#FFD700'; // Gold
        this.ctx.beginPath();
        this.ctx.arc(x + width / 2, y + height * 0.7, width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add a gem to the pendant
        this.ctx.fillStyle = '#FF0000'; // Red gem
        this.ctx.beginPath();
        this.ctx.arc(x + width / 2, y + height * 0.7, width / 4, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawNPCs(npcs) {
        if (!npcs) return;
        
        for (const npc of npcs) {
            if (npc.type === 'oldMan') {
                this.drawOldMan(npc.x, npc.y, npc.width, npc.height);
            } else {
                // Generic colored rectangle as fallback
                this.ctx.fillStyle = '#00ffff'; // Cyan for NPCs
                this.ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
            }
        }
    }
    
    drawOldMan(x, y, width, height) {
        const headSize = width * 0.8;
        const headY = y + height * 0.1;
        const bodyY = headY + headSize;
        const bodyHeight = height - (headSize + height * 0.1);
        
        // Body
        this.ctx.fillStyle = '#8B4513'; // Brown robe
        this.ctx.fillRect(x, bodyY, width, bodyHeight);
        
        // Head
        this.ctx.fillStyle = '#FFE4C4'; // Bisque (skin tone)
        this.ctx.beginPath();
        this.ctx.arc(x + width / 2, headY + headSize / 2, headSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Beard
        this.ctx.fillStyle = '#FFFFFF'; // White beard
        this.ctx.beginPath();
        this.ctx.arc(x + width / 2, headY + headSize * 0.7, headSize / 2, 0, Math.PI);
        this.ctx.fill();
        
        // Eyes
        this.ctx.fillStyle = '#000000'; // Black eyes
        const eyeSize = headSize * 0.15;
        const eyeY = headY + headSize * 0.4;
        this.ctx.beginPath();
        this.ctx.arc(x + width * 0.35, eyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + width * 0.65, eyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawPlayer(player) {
        const x = player.x;
        const y = player.y;
        const width = player.width;
        const height = player.height;
        const direction = player.drawStyle.direction;
        
        // Create a simple walking animation based on position
        const walkCycle = Math.floor(x + y) % 4 === 0;
        
        // Draw body
        const headSize = width;
        const headY = y;
        const bodyY = headY + headSize;
        const bodyHeight = height - headSize;
        
        // Head
        this.ctx.fillStyle = player.drawStyle.headColor;
        this.ctx.beginPath();
        this.ctx.arc(x + width / 2, headY + headSize / 2, headSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Body
        this.ctx.fillStyle = player.drawStyle.shirtColor;
        this.ctx.fillRect(x, bodyY, width, bodyHeight / 2);
        
        // Legs with walking animation
        this.ctx.fillStyle = player.drawStyle.pantsColor;
        if (walkCycle) {
            // Right leg forward
            this.ctx.fillRect(x, bodyY + bodyHeight / 2, width / 2, bodyHeight / 2);
            this.ctx.fillRect(x + width / 2, bodyY + bodyHeight / 2 + 2, width / 2, bodyHeight / 2 - 2);
        } else {
            // Left leg forward
            this.ctx.fillRect(x, bodyY + bodyHeight / 2 + 2, width / 2, bodyHeight / 2 - 2);
            this.ctx.fillRect(x + width / 2, bodyY + bodyHeight / 2, width / 2, bodyHeight / 2);
        }
        
        // Eyes based on direction
        this.drawPlayerEyes(x, y, width, headSize, headY, direction);
        
        // Hair
        this.ctx.fillStyle = player.drawStyle.hairColor;
        this.ctx.beginPath();
        this.ctx.arc(x + width / 2, headY + headSize / 4, headSize / 2, Math.PI, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawPlayerEyes(x, y, width, headSize, headY, direction) {
        const eyeSize = headSize * 0.15;
        const eyeY = headY + headSize * 0.4;
        
        // White of eyes
        this.ctx.fillStyle = '#FFFFFF';
        
        if (direction === 'left') {
            // Eyes facing left
            this.ctx.beginPath();
            this.ctx.arc(x + width * 0.25, eyeY, eyeSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Pupils
            this.ctx.fillStyle = '#000000';
            this.ctx.beginPath();
            this.ctx.arc(x + width * 0.2, eyeY, eyeSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
        } 
        else if (direction === 'right') {
            // Eyes facing right
            this.ctx.beginPath();
            this.ctx.arc(x + width * 0.75, eyeY, eyeSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Pupils
            this.ctx.fillStyle = '#000000';
            this.ctx.beginPath();
            this.ctx.arc(x + width * 0.8, eyeY, eyeSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
        } 
        else {
            // Front-facing eyes
            this.ctx.beginPath();
            this.ctx.arc(x + width * 0.35, eyeY, eyeSize, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(x + width * 0.65, eyeY, eyeSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Pupils with up/down variation
            this.ctx.fillStyle = '#000000';
            const pupilOffset = direction === 'up' ? -2 : 2;
            this.ctx.beginPath();
            this.ctx.arc(x + width * 0.35, eyeY + pupilOffset, eyeSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(x + width * 0.65, eyeY + pupilOffset, eyeSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
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
