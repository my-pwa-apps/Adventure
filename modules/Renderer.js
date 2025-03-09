export default class Renderer {
    constructor(canvasElement, rooms) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.rooms = rooms;
        
        // KQ3/4 used 160x200 or 320x200 resolution
        this.virtualWidth = 320;
        this.virtualHeight = 200;
        
        // Create an offscreen canvas for pixel-perfect rendering
        this.virtualCanvas = document.createElement('canvas');
        this.virtualCanvas.width = this.virtualWidth;
        this.virtualCanvas.height = this.virtualHeight;
        this.virtualCtx = this.virtualCanvas.getContext('2d');
        this.virtualCtx.imageSmoothingEnabled = false;
        
        // EGA palette (16 colors) - KQ3 used EGA, early KQ4 used EGA palette with VGA
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
            brightBlue: '#5555FF',
            brightGreen: '#55FF55',
            brightCyan: '#55FFFF',
            brightRed: '#FF5555',
            brightMagenta: '#FF55FF',
            yellow: '#FFFF55',
            white: '#FFFFFF',
            
            // Common color names for KQ3/4 elements
            flesh: '#FFAA55', // EGA flesh tone was more orange
            kq3Sky: '#55AAFF',
            kq3Grass: '#00AA00',
            kq3Ground: '#AA5500',
            kq3Tree: '#00AA00',
            kq3Trunk: '#AA5500',
            kq3Hair: '#AA0000', // KQ3 featured red-haired Gwydion/Alexander
            kq3Clothes: '#AA00AA', // Gwydion's tunic was purple
            kqMountains: '#5555FF'
        };
        
        // Standard Sierra screen layout for KQ3/4
        this.sierraLayout = {
            sky: 0.4,      // 40% of screen for sky
            horizon: 0.4,  // horizon line position
            ground: 0.6    // 60% of screen for ground
        };
        
        // Cache for background rendering
        this.backgroundCache = {};
        
        // Animation frame counter
        this.animationFrame = 0;
        
        // Use the grid size of KQ3/4 for more authentic pixel look
        this.pixelSize = 2;
    }
    
    setSpriteManager(spriteManager) {
        this.spriteManager = spriteManager;
    }
    
    render(currentRoomId, player) {
        // Clear virtual canvas
        this.virtualCtx.clearRect(0, 0, this.virtualWidth, this.virtualHeight);
        
        const room = this.rooms[currentRoomId];
        
        // Animate at KQ3/4 speed - these games had slower, chunkier animations
        this.animationFrame = Math.floor(Date.now() / 250) % 2; // Only 2 frames in KQ3/4
        
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
    
    update(timestamp) {
        // Update animation frames (King's Quest used slower animations)
        if (!this.lastTimestamp) this.lastTimestamp = timestamp;
        
        const elapsed = timestamp - this.lastTimestamp;
        this.animationTimer += elapsed;
        
        if (this.animationTimer > 250) { // 250ms per frame (4 frames per second)
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTimer = 0;
        }
        
        this.lastTimestamp = timestamp;
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
        } else if (room.type === 'cottage_interior') {
            this.drawSierraCottageInteriorBackground(bgCtx);
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
        
        // KQ3/4 style solid color sky
        ctx.fillStyle = this.EGAPalette.kq3Sky;
        ctx.fillRect(0, 0, width, horizon);
        
        // KQ3/4 style mountains - more blockier than later KQ games
        this.drawKQ3Mountains(ctx, horizon);
        
        // KQ3/4 style ground - flat colors with less gradient
        ctx.fillStyle = this.EGAPalette.kq3Grass;
        ctx.fillRect(0, horizon, width, height - horizon);
        
        // Draw trees in KQ3/4 style - more blocky and less detailed
        this.drawKQ3Trees(ctx, horizon);
        
        // Draw a simple path in KQ3/4 style
        ctx.fillStyle = this.EGAPalette.kq3Ground;
        
        // Simple straight path like in KQ3
        const pathWidth = 60;
        ctx.fillRect(width/2 - pathWidth/2, horizon, pathWidth, height - horizon);
        
        // Add a simple checkerboard dithering pattern for path edges
        for (let y = horizon; y < height; y += this.pixelSize*2) {
            for (let x = width/2 - pathWidth/2; x < width/2 + pathWidth/2; x += this.pixelSize*2) {
                if ((Math.floor(x / this.pixelSize) + Math.floor(y / this.pixelSize)) % 2 === 0) {
                    if (x < width/2 - pathWidth/2 + 8 || x > width/2 + pathWidth/2 - 8) {
                        ctx.fillStyle = this.EGAPalette.kq3Grass;
                        ctx.fillRect(x, y, this.pixelSize, this.pixelSize);
                    }
                }
            }
        }
    }
    
    drawKQ3Mountains(ctx, horizon) {
        const width = this.virtualWidth;
        
        // KQ3 used solid color mountains with simple outlines
        ctx.fillStyle = this.EGAPalette.kqMountains;
        
        // Create a jagged mountain range
        ctx.beginPath();
        ctx.moveTo(0, horizon);
        
        // KQ3 had more "pixelated/boxy" mountains than later games
        const peaks = [
            {x: width * 0.2, h: 40},
            {x: width * 0.4, h: 60},
            {x: width * 0.7, h: 30},
            {x: width * 0.9, h: 50}
        ];
        
        // Draw each mountain peak in a more blockier way
        for (let i = 0; i < peaks.length; i++) {
            // Create more "pixelated" peaks by using straight lines at angles
            if (i === 0) {
                // First peak starts from left edge
                ctx.lineTo(peaks[i].x - 30, horizon - peaks[i].h/2);
            }
            
            // Peaks have more angular tops in KQ3/4
            ctx.lineTo(peaks[i].x, horizon - peaks[i].h);
            
            if (i < peaks.length - 1) {
                // Valley between peaks
                ctx.lineTo(peaks[i].x + 20, horizon - peaks[i].h/2);
                ctx.lineTo(peaks[i+1].x - 20, horizon - peaks[i+1].h/3);
            } else {
                // Last peak goes to right edge
                ctx.lineTo(width, horizon - peaks[i].h/2);
            }
        }
        
        // Complete the mountain shape
        ctx.lineTo(width, horizon);
        ctx.closePath();
        ctx.fill();
        
        // Simple white caps for snow
        ctx.fillStyle = this.EGAPalette.white;
        for (const peak of peaks) {
            ctx.fillRect(peak.x - 10, horizon - peak.h, 20, 5);
        }
    }
    
    drawKQ3Trees(ctx, horizon) {
        const width = this.virtualWidth;
        
        // KQ3 style distant trees - very simplified and blocky
        for (let x = 0; x < width; x += 20) {
            // Skip trees in the middle for the path
            if (x > width/2 - 40 && x < width/2 + 40) continue;
            
            // Simple triangle trees
            ctx.fillStyle = this.EGAPalette.kq3Tree;
            
            // Draw a simple triangular tree
            ctx.beginPath();
            ctx.moveTo(x, horizon + 30);
            ctx.lineTo(x + 15, horizon - 10);
            ctx.lineTo(x + 30, horizon + 30);
            ctx.closePath();
            ctx.fill();
            
            // Add trunk
            ctx.fillStyle = this.EGAPalette.kq3Trunk;
            ctx.fillRect(x + 10, horizon + 30, 10, 15);
        }
    }
    
    drawSierraCottageBackground(ctx) {
        const width = this.virtualWidth;
        const height = this.virtualHeight;
        const horizon = height * this.sierraLayout.horizon;
        
        // KQ3/4 style sky
        ctx.fillStyle = this.EGAPalette.kq3Sky;
        ctx.fillRect(0, 0, width, horizon);
        
        // KQ3/4 style ground
        ctx.fillStyle = this.EGAPalette.kq3Grass;
        ctx.fillRect(0, horizon, width, height - horizon);
        
        // Draw a simple KQ3 style cottage - these were very blocky
        this.drawKQ3Cottage(ctx, width/2 - 40, horizon - 40, 80, 60);
        
        // Simple path to cottage
        ctx.fillStyle = this.EGAPalette.kq3Ground;
        const pathWidth = 40;
        
        // Straight path
        ctx.fillRect(width/2 - pathWidth/2, horizon, pathWidth, height - horizon);
        
        // Checkerboard dithering for texture (common in KQ3/4)
        this.addEGADithering(ctx, 0, horizon, width, height - horizon, 
                        this.EGAPalette.kq3Grass, this.EGAPalette.kq3Ground);
    }
    
    drawKQ3Cottage(ctx, x, y, width, height) {
        // Main cottage structure - KQ3 cottage was very blocky/angular
        // Walls
        ctx.fillStyle = this.EGAPalette.brown;
        ctx.fillRect(x, y, width, height);
        
        // Roof - simple triangle
        ctx.fillStyle = this.EGAPalette.darkGray;
        ctx.beginPath();
        ctx.moveTo(x - 10, y);
        ctx.lineTo(x + width/2, y - 20);
        ctx.lineTo(x + width + 10, y);
        ctx.closePath();
        ctx.fill();
        
        // Door - simple rectangle
        ctx.fillStyle = this.EGAPalette.darkGray;
        ctx.fillRect(x + width/2 - 10, y + height - 30, 20, 30);
        
        // Window - simple square with cross
        ctx.fillStyle = this.EGAPalette.brightCyan;
        ctx.fillRect(x + 10, y + 10, 15, 15);
        
        // Window cross
        ctx.strokeStyle = this.EGAPalette.darkGray;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 17.5);
        ctx.lineTo(x + 25, y + 17.5);
        ctx.moveTo(x + 17.5, y + 10);
        ctx.lineTo(x + 17.5, y + 25);
        ctx.stroke();
    }
    
    drawSierraCottageInteriorBackground(ctx) {
        const width = this.virtualWidth;
        const height = this.virtualHeight;
        
        // KQ3/4 interiors were very simple with flat colors
        // Walls
        ctx.fillStyle = this.EGAPalette.lightGray;
        ctx.fillRect(0, 0, width, height * 0.7);
        
        // Floor
        ctx.fillStyle = this.EGAPalette.brown;
        ctx.fillRect(0, height * 0.7, width, height * 0.3);
        
        // Simple window
        ctx.fillStyle = this.EGAPalette.brightCyan;
        ctx.fillRect(width * 0.7, height * 0.3, 30, 30);
        
        // Window frame
        ctx.strokeStyle = this.EGAPalette.darkGray;
        ctx.lineWidth = 2;
        ctx.strokeRect(width * 0.7, height * 0.3, 30, 30);
        
        // Door
        ctx.fillStyle = this.EGAPalette.darkGray;
        ctx.fillRect(width/2 - 20, height * 0.7 - 40, 40, 40);
        
        // Dithering for floor texture - common in KQ3/4
        this.addEGADithering(ctx, 0, height * 0.7, width, height * 0.3,
                         this.EGAPalette.brown, this.EGAPalette.darkGray);
    }
    
    addEGADithering(ctx, x, y, width, height, color1, color2) {
        // KQ3/4 used larger, more visible dithering patterns
        const patternSize = this.pixelSize;
        
        for (let pY = y; pY < y + height; pY += patternSize) {
            for (let pX = x; pX < x + width; pX += patternSize) {
                // Create a checkerboard pattern
                const isAlternate = ((Math.floor(pX / patternSize) + 
                                   Math.floor(pY / patternSize)) % 2 === 0);
                
                ctx.fillStyle = isAlternate ? color1 : color2;
                ctx.fillRect(
                    pX, pY, patternSize, patternSize
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
                case 'table':
                    this.drawSierraTable(this.virtualCtx, scaledX, scaledY, scaledWidth, scaledHeight);
                    break;
                case 'chair':
                    this.drawSierraChair(this.virtualCtx, scaledX, scaledY, scaledWidth, scaledHeight);
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
        // KQ3/4 style trees were very simple
        const trunkWidth = width * 0.4;
        const trunkHeight = height * 0.3;
        const trunkX = x + (width - trunkWidth) / 2;
        const trunkY = y + height - trunkHeight;
        
        // Trunk - simple rectangle
        ctx.fillStyle = this.EGAPalette.brown;
        ctx.fillRect(trunkX, trunkY, trunkWidth, trunkHeight);
        
        // Foliage - simple triangle
        ctx.fillStyle = this.EGAPalette.green;
        ctx.beginPath();
        ctx.moveTo(x, y + height - trunkHeight);
        ctx.lineTo(x + width / 2, y);
        ctx.lineTo(x + width, y + height - trunkHeight);
        ctx.closePath();
        ctx.fill();
    }
    
    drawSierraRock(ctx, x, y, width, height) {
        // Draw a rock with Sierra-style shading
        ctx.fillStyle = this.VGAPalette.lightGray;
        
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
        ctx.fillStyle = this.VGAPalette.white;
        ctx.beginPath();
        ctx.moveTo(x + width * 0.3, y + height * 0.3);
        ctx.lineTo(x + width * 0.5, y + height * 0.2);
        ctx.lineTo(x + width * 0.4, y + height * 0.4);
        ctx.closePath();
        ctx.fill();
    }
    
    drawSierraPathSegment(ctx, x, y, width, height) {
        ctx.fillStyle = this.VGAPalette.kqDirt;
        ctx.fillRect(x, y, width, height);
        
        // Add dithering for texture
        this.addSierraDithering(
            ctx, x, y, width, height, 
            this.VGAPalette.kqDirt, this.VGAPalette.lightGray
        );
    }
    
    drawSierraDoor(ctx, x, y, width, height) {
        // Door frame
        ctx.fillStyle = this.VGAPalette.kqWood;
        ctx.fillRect(x, y, width, height);
        
        // Door itself (inset)
        ctx.fillStyle = this.VGAPalette.darkGray;
        ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
        
        // Door handle
        ctx.fillStyle = this.VGAPalette.yellow;
        ctx.fillRect(x + width * 0.8, y + height * 0.5, width * 0.1, width * 0.1);
    }
    
    drawSierraPendant(ctx, x, y, width, height) {
        // In Sierra style, important items usually stood out with bright colors
        
        // Pendant chain - single pixel line
        ctx.strokeStyle = this.VGAPalette.lightGray;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + width/2, y);
        ctx.lineTo(x + width/2, y + height * 0.3);
        ctx.stroke();
        
        // Pendant body
        ctx.fillStyle = this.VGAPalette.yellow;
        ctx.beginPath();
        ctx.arc(x + width/2, y + height * 0.6, width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Gem in center
        ctx.fillStyle = this.VGAPalette.red;
        ctx.beginPath();
        ctx.arc(x + width/2, y + height * 0.6, width/4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawSierraTable(ctx, x, y, width, height) {
        // Table top
        ctx.fillStyle = this.VGAPalette.kqWood;
        ctx.fillRect(x, y, width, height * 0.3);
        
        // Table legs
        const legWidth = width * 0.1;
        const legHeight = height * 0.7;
        ctx.fillRect(x, y + height * 0.3, legWidth, legHeight);
        ctx.fillRect(x + width - legWidth, y + height * 0.3, legWidth, legHeight);
        
        // Add some items on the table
        // Small book
        ctx.fillStyle = this.VGAPalette.red;
        ctx.fillRect(x + width * 0.2, y + height * 0.1, width * 0.15, height * 0.15);
        
        // Plate
        ctx.fillStyle = this.VGAPalette.white;
        ctx.beginPath();
        ctx.arc(x + width * 0.6, y + height * 0.15, width * 0.1, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawSierraChair(ctx, x, y, width, height) {
        // Chair seat
        ctx.fillStyle = this.VGAPalette.kqWood;
        ctx.fillRect(x, y + height * 0.4, width, height * 0.2);
        
        // Chair back
        ctx.fillRect(x, y, width * 0.2, height * 0.4);
        
        // Chair legs
        ctx.fillRect(x, y + height * 0.6, width * 0.2, height * 0.4);
        ctx.fillRect(x + width - width * 0.2, y + height * 0.6, width * 0.2, height * 0.4);
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
        // KQ3/4 style wizard/old man (like Manannan or Crispinophur)
        
        // Robe - simple rectangle
        ctx.fillStyle = this.EGAPalette.blue;
        ctx.fillRect(x, y + height/3, width, height*2/3);
        
        // Head - simple circle
        ctx.fillStyle = this.EGAPalette.flesh;
        ctx.beginPath();
        ctx.arc(x + width/2, y + height/4, width/4, 0, Math.PI * 2);
        ctx.fill();
        
        // Beard - simple triangle
        ctx.fillStyle = this.EGAPalette.white;
        ctx.beginPath();
        ctx.moveTo(x + width/3, y + height/4);
        ctx.lineTo(x + width/2, y + height/2);
        ctx.lineTo(x + width*2/3, y + height/4);
        ctx.closePath();
        ctx.fill();
        
        // Eyes - simple pixels
        ctx.fillStyle = this.EGAPalette.black;
        ctx.fillRect(x + width*0.4, y + height*0.2, 2, 2);
        ctx.fillRect(x + width*0.6, y + height*0.2, 2, 2);
        
        // Staff - simple line
        ctx.strokeStyle = this.EGAPalette.brown;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + width*0.8, y + height*0.3);
        ctx.lineTo(x + width*0.8, y + height);
        ctx.stroke();
        
        // Staff top - simple dot
        ctx.fillStyle = this.EGAPalette.yellow;
        ctx.beginPath();
        ctx.arc(x + width*0.8, y + height*0.3, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawPlayer(player) {
        // Scale player position from the actual canvas to our virtual resolution
        const scaledX = Math.round((player.x / this.canvas.width) * this.virtualWidth);
        const scaledY = Math.round((player.y / this.canvas.height) * this.virtualHeight);
        const scaledWidth = Math.round((player.width / this.canvas.width) * this.virtualWidth);
        const scaledHeight = Math.round((player.height / this.canvas.height) * this.virtualHeight);
        
        const direction = player.drawStyle.direction;
        
        // KQ3/4 character - much simpler than KQ5/6, more blocky and pixelated
        switch(direction) {
            case 'left':
                this.drawKQ3PlayerSide(scaledX, scaledY, scaledWidth, scaledHeight, 'left');
                break;
            case 'right':
                this.drawKQ3PlayerSide(scaledX, scaledY, scaledWidth, scaledHeight, 'right');
                break;
            case 'up':
                this.drawKQ3PlayerBack(scaledX, scaledY, scaledWidth, scaledHeight);
                break;
            default: // down or default
                this.drawKQ3PlayerFront(scaledX, scaledY, scaledWidth, scaledHeight);
        }
    }
    
    drawKQ3PlayerFront(x, y, width, height) {
        const ctx = this.virtualCtx;
        const walkFrame = this.animationFrame;
        
        // Head - simple circle
        ctx.fillStyle = this.EGAPalette.flesh;
        ctx.beginPath();
        ctx.arc(x + width/2, y + height*0.15, width*0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Hair - KQ3 Gwydion had red/brown hair
        ctx.fillStyle = this.EGAPalette.kq3Hair;
        ctx.fillRect(x + width*0.2, y, width*0.6, height*0.1);
        
        // Eyes - simple pixels
        ctx.fillStyle = this.EGAPalette.black;
        ctx.fillRect(x + width*0.35, y + height*0.15, 2, 2);
        ctx.fillRect(x + width*0.65, y + height*0.15, 2, 2);
        
        // Body - KQ3 Gwydion wore simple purple tunic
        ctx.fillStyle = this.EGAPalette.kq3Clothes;
        ctx.fillRect(x + width*0.2, y + height*0.3, width*0.6, height*0.4);
        
        // Legs - simple rectangles with minimal animation
        ctx.fillStyle = this.EGAPalette.darkGray;
        if (walkFrame === 0) {
            ctx.fillRect(x + width*0.3, y + height*0.7, width*0.15, height*0.3);
            ctx.fillRect(x + width*0.55, y + height*0.7, width*0.15, height*0.3);
        } else {
            // Simple leg spread for walking
            ctx.fillRect(x + width*0.25, y + height*0.7, width*0.15, height*0.3);
            ctx.fillRect(x + width*0.6, y + height*0.7, width*0.15, height*0.3);
        }
    }
    
    drawKQ3PlayerBack(x, y, width, height) {
        const ctx = this.virtualCtx;
        const walkFrame = this.animationFrame;
        
        // Head - back view is just a circle
        ctx.fillStyle = this.EGAPalette.kq3Hair;
        ctx.beginPath();
        ctx.arc(x + width/2, y + height*0.15, width*0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Body - simple rectangle
        ctx.fillStyle = this.EGAPalette.kq3Clothes;
        ctx.fillRect(x + width*0.2, y + height*0.3, width*0.6, height*0.4);
        
        // Legs - simple animation
        ctx.fillStyle = this.EGAPalette.darkGray;
        if (walkFrame === 0) {
            ctx.fillRect(x + width*0.3, y + height*0.7, width*0.15, height*0.3);
            ctx.fillRect(x + width*0.55, y + height*0.7, width*0.15, height*0.3);
        } else {
            ctx.fillRect(x + width*0.25, y + height*0.7, width*0.15, height*0.3);
            ctx.fillRect(x + width*0.6, y + height*0.7, width*0.15, height*0.3);
        }
    }
    
    drawKQ3PlayerSide(x, y, width, height, facing) {
        const ctx = this.virtualCtx;
        const walkFrame = this.animationFrame;
        const direction = facing === 'right' ? 1 : -1;
        
        // KQ3/4 character side view was very simplified
        
        // Head
        ctx.fillStyle = this.EGAPalette.flesh;
        ctx.beginPath();
        ctx.arc(x + width*0.5 + (direction * width*0.1), y + height*0.15, width*0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Hair
        ctx.fillStyle = this.EGAPalette.kq3Hair;
        ctx.fillRect(x + width*0.25 + (direction * width*0.1), y, width*0.5, height*0.1);
        
        // Eye (just one eye visible from side)
        ctx.fillStyle = this.EGAPalette.black;
        ctx.fillRect(x + width*0.5 + (direction * width*0.15), y + height*0.15, 2, 2);
        
        // Body
        ctx.fillStyle = this.EGAPalette.kq3Clothes;
        ctx.fillRect(x + width*0.25, y + height*0.3, width*0.5, height*0.4);
        
        // Legs - simple animation
        ctx.fillStyle = this.EGAPalette.darkGray;
        if (walkFrame === 0) {
            ctx.fillRect(x + width*0.3, y + height*0.7, width*0.2, height*0.3);
            ctx.fillRect(x + width*0.5, y + height*0.7, width*0.2, height*0.3);
        } else {
            // Simple leg spread for walking
            ctx.fillRect(x + width*0.4, y + height*0.7, width*0.2, height*0.3);
            ctx.fillRect(x + width*0.6, y + height*0.7, width*0.2, height*0.3);
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
