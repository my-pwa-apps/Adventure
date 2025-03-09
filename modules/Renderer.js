export default class Renderer {
    constructor(canvasElement, rooms) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.rooms = rooms;
        
        // Sierra games used low-res screens 
        // Set virtual resolution that gets scaled to canvas size
        this.virtualWidth = 320;
        this.virtualHeight = 200;
        
        // Create an offscreen canvas for pixel-perfect rendering
        this.virtualCanvas = document.createElement('canvas');
        this.virtualCanvas.width = this.virtualWidth;
        this.virtualCanvas.height = this.virtualHeight;
        this.virtualCtx = this.virtualCanvas.getContext('2d');
        this.virtualCtx.imageSmoothingEnabled = false;
        
        // EGA 16-color palette (authentic Sierra colors)
        this.EGAPalette = {
            black: '#000000',
            blue: '#0000AA',
            green: '#00AA00',
            cyan: '#00AAAA',
            red: '#AA0000',
            magenta: '#AA00AA',
            brown: '#AA5500',
            lightGray: '#AAAAAA',
            darkGray: '#555555',
            lightBlue: '#5555FF',
            lightGreen: '#55FF55',
            lightCyan: '#55FFFF',
            lightRed: '#FF5555',
            lightMagenta: '#FF55FF',
            yellow: '#FFFF55',
            white: '#FFFFFF'
        };
        
        // Standard Sierra screen layout
        this.sierraLayout = {
            sky: 0.4,      // 40% of screen for sky
            horizon: 0.4,  // horizon line position
            ground: 0.6    // 60% of screen for ground
        };
        
        // Cache for background rendering
        this.backgroundCache = {};
    }
    
    setSpriteManager(spriteManager) {
        this.spriteManager = spriteManager;
    }
    
    render(currentRoomId, player) {
        // Clear virtual canvas
        this.virtualCtx.clearRect(0, 0, this.virtualWidth, this.virtualHeight);
        
        const room = this.rooms[currentRoomId];
        
        // Draw background
        this.drawBackground(room, currentRoomId);
        
        // Draw objects
        this.drawObjects(room.objects);
        
        // Draw NPCs
        this.drawNPCs(room.npcs);
        
        // Draw player
        this.drawPlayer(player);
        
        // Scale the virtual canvas to the actual canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(
            this.virtualCanvas, 
            0, 0, this.virtualWidth, this.virtualHeight,
            0, 0, this.canvas.width, this.canvas.height
        );
    }
    
    drawBackground(room, roomId) {
        // Check if we have a cached background
        if (this.backgroundCache[roomId]) {
            this.virtualCtx.drawImage(this.backgroundCache[roomId], 0, 0);
            return;
        }
        
        // Create an off-screen canvas for background caching
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = this.virtualWidth;
        bgCanvas.height = this.virtualHeight;
        const bgCtx = bgCanvas.getContext('2d');
        
        // Generate background based on room type
        if (room.type === 'forest') {
            this.drawSierraForestBackground(bgCtx);
        } else if (room.type === 'cottage') {
            this.drawSierraCottageBackground(bgCtx);
        }
        
        // Store the rendered background in cache
        this.backgroundCache[roomId] = bgCanvas;
        
        // Draw the background to the virtual canvas
        this.virtualCtx.drawImage(bgCanvas, 0, 0);
    }
    
    drawSierraForestBackground(ctx) {
        const width = this.virtualWidth;
        const height = this.virtualHeight;
        const horizon = height * this.sierraLayout.horizon;
        
        // Clear background
        ctx.fillStyle = this.EGAPalette.black;
        ctx.fillRect(0, 0, width, height);
        
        // Sky gradient (simulated with bands of color)
        const skyColors = [
            this.EGAPalette.blue,
            this.EGAPalette.lightBlue
        ];
        
        const bandHeight = horizon / skyColors.length;
        for (let i = 0; i < skyColors.length; i++) {
            ctx.fillStyle = skyColors[i];
            ctx.fillRect(0, i * bandHeight, width, bandHeight);
        }
        
        // Draw distant mountains - typical Sierra backdrop
        ctx.fillStyle = this.EGAPalette.darkGray;
        
        // First mountain range (distant)
        this.drawMountainRange(ctx, height * 0.25, height * 0.4, 3);
        
        // Second mountain range (closer)
        ctx.fillStyle = this.EGAPalette.darkGray;
        this.drawMountainRange(ctx, height * 0.3, height * 0.4, 2);
        
        // Draw ground
        ctx.fillStyle = this.EGAPalette.green;
        ctx.fillRect(0, horizon, width, height - horizon);
        
        // Draw pixelated trees in background
        this.drawDistantForestTrees(ctx, horizon);
        
        // Draw walking path
        this.drawForestPath(ctx, horizon);
        
        // Add Sierra-style dithering for ground texture
        this.addSierraDithering(ctx, 0, horizon, width, height - horizon, 
                             this.EGAPalette.green, this.EGAPalette.lightGreen);
    }
    
    drawMountainRange(ctx, baseY, maxHeight, roughness) {
        const width = this.virtualWidth;
        const segments = 10;
        const segmentWidth = width / segments;
        
        ctx.beginPath();
        ctx.moveTo(0, baseY);
        
        // Generate mountain peaks
        for (let i = 0; i <= segments; i++) {
            const x = i * segmentWidth;
            const heightVariation = Math.sin(i / roughness) * maxHeight;
            const y = baseY - heightVariation;
            ctx.lineTo(x, y);
        }
        
        // Complete the shape
        ctx.lineTo(width, baseY);
        ctx.lineTo(width, baseY + maxHeight * 2);
        ctx.lineTo(0, baseY + maxHeight * 2);
        ctx.closePath();
        ctx.fill();
    }
    
    drawDistantForestTrees(ctx, horizon) {
        const width = this.virtualWidth;
        const treeLine = horizon - 10;
        
        // Draw multiple layers of trees for depth
        for (let row = 0; row < 3; row++) {
            const y = treeLine - row * 5;
            const treeWidth = 8 - row * 2;
            const treeHeight = 12 - row * 2;
            const treeColor = row === 0 ? this.EGAPalette.green : 
                             (row === 1 ? this.EGAPalette.lightGreen : this.EGAPalette.green);
            
            ctx.fillStyle = treeColor;
            
            for (let x = -treeWidth/2; x < width; x += treeWidth - 2) {
                // Draw triangular tree
                ctx.beginPath();
                ctx.moveTo(x + treeWidth/2, y - treeHeight);
                ctx.lineTo(x + treeWidth, y);
                ctx.lineTo(x, y);
                ctx.closePath();
                ctx.fill();
            }
        }
    }
    
    drawForestPath(ctx, horizon) {
        const width = this.virtualWidth;
        const height = this.virtualHeight;
        
        // Draw a typical Sierra-style path
        ctx.fillStyle = this.EGAPalette.brown;
        
        // Path starts narrow at horizon and widens toward bottom
        const pathTopWidth = 20;
        const pathBottomWidth = 60;
        
        ctx.beginPath();
        ctx.moveTo(width/2 - pathTopWidth/2, horizon);
        ctx.lineTo(width/2 + pathTopWidth/2, horizon);
        ctx.lineTo(width/2 + pathBottomWidth/2, height);
        ctx.lineTo(width/2 - pathBottomWidth/2, height);
        ctx.closePath();
        ctx.fill();
        
        // Add some dithering to the path for texture
        this.addSierraDithering(
            ctx, 
            width/2 - pathBottomWidth/2, horizon, 
            pathBottomWidth, height - horizon,
            this.EGAPalette.brown, this.EGAPalette.lightGray
        );
    }
    
    drawSierraCottageBackground(ctx) {
        const width = this.virtualWidth;
        const height = this.virtualHeight;
        const horizon = height * this.sierraLayout.horizon;
        
        // Clear background
        ctx.fillStyle = this.EGAPalette.black;
        ctx.fillRect(0, 0, width, height);
        
        // Sky
        ctx.fillStyle = this.EGAPalette.lightBlue;
        ctx.fillRect(0, 0, width, horizon);
        
        // Ground
        ctx.fillStyle = this.EGAPalette.green;
        ctx.fillRect(0, horizon, width, height - horizon);
        
        // Draw a cottage in Sierra style
        this.drawSierraCottage(ctx, width/2 - 60, horizon - 60, 120, 80);
        
        // Draw a path to the cottage
        ctx.fillStyle = this.EGAPalette.brown;
        
        // Path from bottom to cottage door
        const pathBottomWidth = 40;
        const pathTopWidth = 20;
        const cottageY = horizon + 20; // Just below horizon
        
        ctx.beginPath();
        ctx.moveTo(width/2 - pathTopWidth/2, cottageY);
        ctx.lineTo(width/2 + pathTopWidth/2, cottageY);
        ctx.lineTo(width/2 + pathBottomWidth/2, height);
        ctx.lineTo(width/2 - pathBottomWidth/2, height);
        ctx.closePath();
        ctx.fill();
        
        // Add Sierra-style dithering for ground texture
        this.addSierraDithering(
            ctx, 0, horizon, width, height - horizon, 
            this.EGAPalette.green, this.EGAPalette.lightGreen
        );
    }
    
    drawSierraCottage(ctx, x, y, width, height) {
        // House wall
        ctx.fillStyle = this.EGAPalette.brown;
        ctx.fillRect(x, y, width, height);
        
        // Roof (pointy)
        ctx.fillStyle = this.EGAPalette.red;
        ctx.beginPath();
        ctx.moveTo(x - 10, y);
        ctx.lineTo(x + width/2, y - 30);
        ctx.lineTo(x + width + 10, y);
        ctx.closePath();
        ctx.fill();
        
        // Door
        ctx.fillStyle = this.EGAPalette.darkGray;
        const doorWidth = 20;
        const doorHeight = 40;
        const doorX = x + (width - doorWidth) / 2;
        const doorY = y + height - doorHeight;
        ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
        
        // Door handle
        ctx.fillStyle = this.EGAPalette.yellow;
        ctx.fillRect(doorX + doorWidth - 5, doorY + doorHeight/2, 3, 3);
        
        // Windows
        ctx.fillStyle = this.EGAPalette.lightCyan;
        
        // Left window
        this.drawSierraWindow(ctx, x + width * 0.25 - 10, y + height * 0.3, 20, 15);
        
        // Right window
        this.drawSierraWindow(ctx, x + width * 0.75 - 10, y + height * 0.3, 20, 15);
        
        // Add some Sierra-style detail lines for texture
        ctx.strokeStyle = this.EGAPalette.black;
        ctx.lineWidth = 1;
        
        // Roof lines
        ctx.beginPath();
        ctx.moveTo(x - 10, y);
        ctx.lineTo(x + width + 10, y);
        ctx.stroke();
    }
    
    drawSierraWindow(ctx, x, y, width, height) {
        // Window background
        ctx.fillRect(x, y, width, height);
        
        // Window frame
        ctx.strokeStyle = this.EGAPalette.white;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // Window cross
        ctx.beginPath();
        ctx.moveTo(x + width/2, y);
        ctx.lineTo(x + width/2, y + height);
        ctx.moveTo(x, y + height/2);
        ctx.lineTo(x + width, y + height/2);
        ctx.stroke();
    }
    
    addSierraDithering(ctx, x, y, width, height, color1, color2) {
        // Sierra games often used dithered patterns for textures
        // This creates a simple checkerboard dithering pattern
        const patternSize = 2; // 2x2 pixel pattern
        
        for (let pY = y; pY < y + height; pY += patternSize) {
            for (let pX = x; pX < x + width; pX += patternSize) {
                // Use a deterministic pattern for consistency
                const isAlternate = ((Math.floor(pX / patternSize) + 
                                   Math.floor(pY / patternSize)) % 2 === 0);
                
                ctx.fillStyle = isAlternate ? color1 : color2;
                ctx.fillRect(
                    pX, pY, 
                    Math.min(patternSize, x + width - pX), 
                    Math.min(patternSize, y + height - pY)
                );
            }
        }
    }
    
    drawObjects(objects) {
        for (const obj of objects) {
            // Scale object positions from the actual canvas to our virtual resolution
            const scaledX = (obj.x / this.canvas.width) * this.virtualWidth;
            const scaledY = (obj.y / this.canvas.height) * this.virtualHeight;
            const scaledWidth = (obj.width / this.canvas.width) * this.virtualWidth;
            const scaledHeight = (obj.height / this.canvas.height) * this.virtualHeight;
            
            switch(obj.type) {
                case 'tree':
                    this.drawSierraTree(this.virtualCtx, scaledX, scaledY, scaledWidth, scaledHeight);
                    break;
                case 'rock': 
                    this.drawSierraRock(this.virtualCtx, scaledX, scaledY, scaledWidth, scaledHeight);
                    break;
                case 'path':
                    this.drawSierraPathSegment(this.virtualCtx, scaledX, scaledY, scaledWidth, scaledHeight);
                    break;
                case 'door':
                    this.drawSierraDoor(this.virtualCtx, scaledX, scaledY, scaledWidth, scaledHeight);
                    break;
                case 'pendant':
                    this.drawSierraPendant(this.virtualCtx, scaledX, scaledY, scaledWidth, scaledHeight);
                    break;
                default:
                    // Generic colored rectangle as fallback
                    this.virtualCtx.fillStyle = obj.isExit ? this.EGAPalette.darkGray : 
                                        obj.canTake ? this.EGAPalette.yellow : this.EGAPalette.brown;
                    this.virtualCtx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
            }
        }
    }
    
    drawSierraTree(ctx, x, y, width, height) {
        const trunkWidth = width * 0.4;
        const trunkHeight = height * 0.4;
        const trunkX = x + (width - trunkWidth) / 2;
        const trunkY = y + height - trunkHeight;
        
        // Draw trunk
        ctx.fillStyle = this.EGAPalette.brown;
        ctx.fillRect(trunkX, trunkY, trunkWidth, trunkHeight);
        
        // Draw tree foliage - Sierra style with detailed texture
        ctx.fillStyle = this.EGAPalette.green;
        
        // Draw multiple triangular foliage sections
        for (let i = 0; i < 3; i++) {
            const sectionHeight = (height - trunkHeight) * 0.4;
            const sectionY = y + i * sectionHeight * 0.7;
            const sectionWidth = width * (1 - i * 0.2);
            const sectionX = x + (width - sectionWidth) / 2;
            
            // Triangle shape for each section
            ctx.beginPath();
            ctx.moveTo(sectionX + sectionWidth/2, sectionY);
            ctx.lineTo(sectionX + sectionWidth, sectionY + sectionHeight);
            ctx.lineTo(sectionX, sectionY + sectionHeight);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    drawSierraRock(ctx, x, y, width, height) {
        // Draw a rock with Sierra-style shading
        ctx.fillStyle = this.EGAPalette.lightGray;
        
        // Irregular rock shape
        ctx.beginPath();
        ctx.moveTo(x + width * 0.2, y);
        ctx.lineTo(x + width * 0.8, y);
        ctx.lineTo(x + width, y + height * 0.6);
        ctx.lineTo(x + width * 0.7, y + height);
        ctx.lineTo(x + width * 0.3, y + height);
        ctx.lineTo(x, y + height * 0.6);
        ctx.closePath();
        ctx.fill();
        
        // Add a highlight
        ctx.fillStyle = this.EGAPalette.white;
        ctx.beginPath();
        ctx.moveTo(x + width * 0.3, y + height * 0.3);
        ctx.lineTo(x + width * 0.5, y + height * 0.2);
        ctx.lineTo(x + width * 0.4, y + height * 0.4);
        ctx.closePath();
        ctx.fill();
    }
    
    drawSierraPathSegment(ctx, x, y, width, height) {
        ctx.fillStyle = this.EGAPalette.brown;
        ctx.fillRect(x, y, width, height);
        
        // Add dithering for texture
        this.addSierraDithering(
            ctx, x, y, width, height, 
            this.EGAPalette.brown, this.EGAPalette.lightGray
        );
    }
    
    drawSierraDoor(ctx, x, y, width, height) {
        // Door frame
        ctx.fillStyle = this.EGAPalette.brown;
        ctx.fillRect(x, y, width, height);
        
        // Door itself (inset)
        ctx.fillStyle = this.EGAPalette.darkGray;
        ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
        
        // Door handle
        ctx.fillStyle = this.EGAPalette.yellow;
        ctx.fillRect(x + width * 0.8, y + height * 0.5, width * 0.1, width * 0.1);
    }
    
    drawSierraPendant(ctx, x, y, width, height) {
        // In Sierra style, important items usually stood out with bright colors
        
        // Pendant chain - single pixel line
        ctx.strokeStyle = this.EGAPalette.lightGray;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + width/2, y);
        ctx.lineTo(x + width/2, y + height * 0.3);
        ctx.stroke();
        
        // Pendant body
        ctx.fillStyle = this.EGAPalette.yellow;
        ctx.beginPath();
        ctx.arc(x + width/2, y + height * 0.6, width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Gem in center
        ctx.fillStyle = this.EGAPalette.red;
        ctx.beginPath();
        ctx.arc(x + width/2, y + height * 0.6, width/4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawNPCs(npcs) {
        if (!npcs) return;
        
        for (const npc of npcs) {
            // Scale NPC positions from the actual canvas to our virtual resolution
            const scaledX = (npc.x / this.canvas.width) * this.virtualWidth;
            const scaledY = (npc.y / this.canvas.height) * this.virtualHeight;
            const scaledWidth = (npc.width / this.canvas.width) * this.virtualWidth;
            const scaledHeight = (npc.height / this.canvas.height) * this.virtualHeight;
            
            if (npc.type === 'oldMan') {
                this.drawSierraOldMan(this.virtualCtx, scaledX, scaledY, scaledWidth, scaledHeight);
            } else {
                // Generic colored rectangle as fallback
                this.virtualCtx.fillStyle = this.EGAPalette.cyan;
                this.virtualCtx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
            }
        }
    }
    
    drawSierraOldMan(ctx, x, y, width, height) {
        // Body - Sierra characters were often detailed but still pixelated
        ctx.fillStyle = this.EGAPalette.blue; // Robe color
        
        // Body rectangle
        ctx.fillRect(x + width * 0.25, y + height * 0.3, width * 0.5, height * 0.7);
        
        // Head
        ctx.fillStyle = this.EGAPalette.lightGray; // Skin tone
        ctx.beginPath();
        ctx.arc(x + width * 0.5, y + height * 0.2, width * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // White beard - Sierra style (pixelated)
        ctx.fillStyle = this.EGAPalette.white;
        ctx.beginPath();
        ctx.moveTo(x + width * 0.3, y + height * 0.2);
        ctx.lineTo(x + width * 0.7, y + height * 0.2);
        ctx.lineTo(x + width * 0.6, y + height * 0.4);
        ctx.lineTo(x + width * 0.4, y + height * 0.4);
        ctx.closePath();
        ctx.fill();
        
        // Eyes (simple pixels)
        ctx.fillStyle = this.EGAPalette.black;
        ctx.fillRect(x + width * 0.4, y + height * 0.15, 1, 1);
        ctx.fillRect(x + width * 0.6, y + height * 0.15, 1, 1);
        
        // Staff - classic Sierra NPCs often held items
        ctx.strokeStyle = this.EGAPalette.brown;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + width * 0.8, y + height * 0.3);
        ctx.lineTo(x + width * 0.8, y + height);
        ctx.stroke();
    }
    
    drawPlayer(player) {
        // Scale player position from the actual canvas to our virtual resolution
        const scaledX = (player.x / this.canvas.width) * this.virtualWidth;
        const scaledY = (player.y / this.canvas.height) * this.virtualHeight;
        const scaledWidth = (player.width / this.canvas.width) * this.virtualWidth;
        const scaledHeight = (player.height / this.canvas.height) * this.virtualHeight;
        
        const direction = player.drawStyle.direction;
        
        // Classic Sierra character - pixelated with minimal detail
        
        // Body
        this.virtualCtx.fillStyle = this.EGAPalette.lightBlue;
        this.virtualCtx.fillRect(
            scaledX + scaledWidth * 0.25, 
            scaledY + scaledWidth, 
            scaledWidth * 0.5, 
            scaledHeight * 0.6
        );
        
        // Head
        this.virtualCtx.fillStyle = this.EGAPalette.lightGray;
        this.virtualCtx.beginPath();
        this.virtualCtx.arc(
            scaledX + scaledWidth * 0.5, 
            scaledY + scaledWidth * 0.5, 
            scaledWidth * 0.5, 
            0, Math.PI * 2
        );
        this.virtualCtx.fill();
        
        // Legs
        const walkingFrame = Math.floor(scaledX + scaledY) % 8 < 4; // Simple animation
        this.virtualCtx.fillStyle = this.EGAPalette.blue;
        
        if (walkingFrame) {
            // First walking frame
            this.virtualCtx.fillRect(
                scaledX + scaledWidth * 0.3, 
                scaledY + scaledHeight * 0.6, 
                scaledWidth * 0.15, 
                scaledHeight * 0.4
            );
            this.virtualCtx.fillRect(
                scaledX + scaledWidth * 0.55, 
                scaledY + scaledHeight * 0.6, 
                scaledWidth * 0.15, 
                scaledHeight * 0.4
            );
        } else {
            // Second walking frame
            this.virtualCtx.fillRect(
                scaledX + scaledWidth * 0.25, 
                scaledY + scaledHeight * 0.6, 
                scaledWidth * 0.15, 
                scaledHeight * 0.4
            );
            this.virtualCtx.fillRect(
                scaledX + scaledWidth * 0.6, 
                scaledY + scaledHeight * 0.6, 
                scaledWidth * 0.15, 
                scaledHeight * 0.4
            );
        }
        
        // Face (direction-specific)
        // For simplicity, just use dots for eyes
        this.virtualCtx.fillStyle = this.EGAPalette.black;
        
        if (direction === 'left') {
            this.virtualCtx.fillRect(scaledX + scaledWidth * 0.35, scaledY + scaledWidth * 0.4, 2, 2);
        } else if (direction === 'right') {
            this.virtualCtx.fillRect(scaledX + scaledWidth * 0.65, scaledY + scaledWidth * 0.4, 2, 2);
        } else {
            // Front facing
            this.virtualCtx.fillRect(scaledX + scaledWidth * 0.4, scaledY + scaledWidth * 0.4, 2, 2);
            this.virtualCtx.fillRect(scaledX + scaledWidth * 0.6, scaledY + scaledWidth * 0.4, 2, 2);
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
