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
        
        // VGA palette (256 colors, but we'll define key colors used in King's Quest)
        this.VGAPalette = {
            // Standard colors
            black: '#000000',
            darkBlue: '#0000AA',
            mediumBlue: '#0055AA',
            blue: '#0000FF',
            darkGreen: '#00AA00',
            green: '#00CC00',
            cyan: '#00AAAA',
            lightCyan: '#55FFFF',
            darkRed: '#AA0000',
            red: '#FF0000',
            magenta: '#AA00AA',
            brown: '#AA5500',
            darkBrown: '#663300',
            lightBrown: '#996633',
            darkGray: '#555555',
            gray: '#777777',
            lightGray: '#AAAAAA',
            white: '#FFFFFF',
            
            // KQ character colors
            flesh: '#FFCC99',
            darkFlesh: '#DDAA88',
            hair: '#886633',
            blond: '#FFDD55',
            kqPurple: '#550077', // King Graham's outfit
            kqBlue: '#000088',   // Alexander's outfit
            kqGreen: '#005500',  // Connor outfit elements
            
            // Sierra VGA environment colors
            kqSky: '#99CCFF',
            kqGrass: '#33AA33',
            kqDirt: '#AA7744',
            kqStone: '#999999',
            kqWood: '#775533'
        };
        
        // Standard Sierra screen layout
        this.sierraLayout = {
            sky: 0.35,     // 35% of screen for sky
            horizon: 0.35, // horizon line position
            ground: 0.65   // 65% of screen for ground
        };
        
        // Cache for background rendering
        this.backgroundCache = {};
        
        // Animation variables
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.lastTimestamp = 0;
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
        
        // VGA style gradient sky - KQ5 and 6 had beautiful gradient skies
        const skyGradient = ctx.createLinearGradient(0, 0, 0, horizon);
        skyGradient.addColorStop(0, this.VGAPalette.darkBlue);
        skyGradient.addColorStop(0.5, this.VGAPalette.mediumBlue);
        skyGradient.addColorStop(1, this.VGAPalette.kqSky);
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, width, horizon);
        
        // Draw distant mountains with snow caps (KQ style)
        this.drawKQMountains(ctx, horizon);
        
        // Draw ground
        const groundGradient = ctx.createLinearGradient(0, horizon, 0, height);
        groundGradient.addColorStop(0, this.VGAPalette.kqGrass);
        groundGradient.addColorStop(1, '#005500'); // Darker at bottom
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, horizon, width, height - horizon);
        
        // Draw detailed forest background (VGA had more detailed backgrounds)
        this.drawVGAForestElements(ctx, horizon, height);
        
        // Draw walking path with KQ style shading
        this.drawKQPath(ctx, horizon, height);
    }
    
    drawKQMountains(ctx, horizon) {
        const width = this.virtualWidth;
        
        // Far mountains (bluish)
        ctx.fillStyle = '#7799CC';
        this.drawMountainRange(ctx, horizon - 40, 50, 3);
        
        // Snow caps on far mountains
        ctx.fillStyle = this.VGAPalette.white;
        ctx.beginPath();
        ctx.moveTo(0, horizon - 70);
        ctx.lineTo(50, horizon - 85);
        ctx.lineTo(100, horizon - 75);
        ctx.lineTo(150, horizon - 90);
        ctx.lineTo(200, horizon - 78);
        ctx.lineTo(250, horizon - 88);
        ctx.lineTo(320, horizon - 75);
        // Connect back to top of screen to fill completely
        ctx.lineTo(320, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        
        // Near mountains (darker)
        ctx.fillStyle = this.VGAPalette.gray;
        this.drawMountainRange(ctx, horizon - 20, 30, 4);
    }
    
    drawVGAForestElements(ctx, horizon, height) {
        const width = this.virtualWidth;
        
        // Background trees (King's Quest had detailed treelines)
        for (let i = 0; i < 3; i++) {
            const treeRowY = horizon - 5 - i * 15;
            const treeColor = i === 0 ? this.VGAPalette.darkGreen : 
                             (i === 1 ? '#006600' : '#004400');
            
            ctx.fillStyle = treeColor;
            
            for (let x = -10; x < width; x += 25) {
                // King's Quest trees had more rounded tops
                const treeHeight = 20 + Math.sin(x/30) * 10;
                const treeWidth = 20;
                
                // Tree crown (multiple arcs for a fuller look)
                ctx.beginPath();
                ctx.arc(x + 10, treeRowY, treeWidth/2, Math.PI, 0);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(x + 20, treeRowY + 5, treeWidth/2, Math.PI, 0);
                ctx.fill();
            }
        }
        
        // Add some flowers and small bushes (KQ had detailed environment objects)
        for (let i = 0; i < 10; i++) {
            const x = 30 + (i * 29) % (width - 60);
            const y = horizon + 10 + (i * 17) % (height/5);
            
            // Small bush
            ctx.fillStyle = this.VGAPalette.kqGrass;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Flowers (alternating colors)
            if (i % 2 === 0) {
                ctx.fillStyle = this.VGAPalette.red;
            } else {
                ctx.fillStyle = this.VGAPalette.white;
            }
            
            ctx.fillRect(x - 5, y - 3, 2, 2);
            ctx.fillRect(x + 5, y - 2, 2, 2);
        }
    }
    
    drawKQPath(ctx, horizon, height) {
        const width = this.virtualWidth;
        
        // VGA King's Quest games had more detailed paths with shading
        // Create path gradient
        const pathGradient = ctx.createLinearGradient(
            width/2, horizon, width/2, height
        );
        pathGradient.addColorStop(0, this.VGAPalette.kqDirt);
        pathGradient.addColorStop(1, this.VGAPalette.darkBrown);
        ctx.fillStyle = pathGradient;
        
        // Draw curved path (KQ paths had curves)
        ctx.beginPath();
        ctx.moveTo(width/2 - 15, horizon);
        ctx.bezierCurveTo(
            width/2 - 20, horizon + height/4,
            width/2 - 30, horizon + height/2,
            width/2 - 40, height
        );
        ctx.lineTo(width/2 + 40, height);
        ctx.bezierCurveTo(
            width/2 + 30, horizon + height/2,
            width/2 + 20, horizon + height/4,
            width/2 + 15, horizon
        );
        ctx.closePath();
        ctx.fill();
        
        // Add path texture details (stones, highlights)
        for (let i = 0; i < 15; i++) {
            const pathX = width/2 + Math.sin(i/2) * 20;
            const pathY = horizon + 10 + (i * 10);
            
            // Stone
            ctx.fillStyle = this.VGAPalette.lightGray;
            ctx.fillRect(pathX, pathY, 3, 2);
            
            // Highlight
            ctx.fillStyle = this.VGAPalette.white;
            ctx.globalAlpha = 0.1;
            ctx.fillRect(pathX + 3, pathY, 5, 1);
            ctx.globalAlpha = 1.0;
        }
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
    
    drawSierraCottageBackground(ctx) {
        const width = this.virtualWidth;
        const height = this.virtualHeight;
        const horizon = height * this.sierraLayout.horizon;
        
        // Clear background
        ctx.fillStyle = this.VGAPalette.black;
        ctx.fillRect(0, 0, width, height);
        
        // Sky
        ctx.fillStyle = this.VGAPalette.kqSky;
        ctx.fillRect(0, 0, width, horizon);
        
        // Ground
        ctx.fillStyle = this.VGAPalette.kqGrass;
        ctx.fillRect(0, horizon, width, height - horizon);
        
        // Draw a cottage in Sierra style
        this.drawSierraCottage(ctx, width/2 - 60, horizon - 60, 120, 80);
        
        // Draw a path to the cottage
        ctx.fillStyle = this.VGAPalette.kqDirt;
        
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
            this.VGAPalette.kqGrass, this.VGAPalette.green
        );
    }
    
    drawSierraCottage(ctx, x, y, width, height) {
        // House wall
        ctx.fillStyle = this.VGAPalette.kqWood;
        ctx.fillRect(x, y, width, height);
        
        // Roof (pointy)
        ctx.fillStyle = this.VGAPalette.kqDirt;
        ctx.beginPath();
        ctx.moveTo(x - 10, y);
        ctx.lineTo(x + width/2, y - 30);
        ctx.lineTo(x + width + 10, y);
        ctx.closePath();
        ctx.fill();
        
        // Door
        ctx.fillStyle = this.VGAPalette.darkGray;
        const doorWidth = 20;
        const doorHeight = 40;
        const doorX = x + (width - doorWidth) / 2;
        const doorY = y + height - doorHeight;
        ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
        
        // Door handle
        ctx.fillStyle = this.VGAPalette.yellow;
        ctx.fillRect(doorX + doorWidth - 5, doorY + doorHeight/2, 3, 3);
        
        // Windows
        ctx.fillStyle = this.VGAPalette.lightCyan;
        
        // Left window
        this.drawSierraWindow(ctx, x + width * 0.25 - 10, y + height * 0.3, 20, 15);
        
        // Right window
        this.drawSierraWindow(ctx, x + width * 0.75 - 10, y + height * 0.3, 20, 15);
        
        // Add some Sierra-style detail lines for texture
        ctx.strokeStyle = this.VGAPalette.black;
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
        ctx.strokeStyle = this.VGAPalette.white;
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
    
    drawSierraCottageInteriorBackground(ctx) {
        const width = this.virtualWidth;
        const height = this.virtualHeight;
        
        // Clear background
        ctx.fillStyle = this.VGAPalette.black;
        ctx.fillRect(0, 0, width, height);
        
        // Draw floor
        ctx.fillStyle = this.VGAPalette.kqDirt;
        ctx.fillRect(0, height * 0.6, width, height * 0.4);
        
        // Draw walls
        ctx.fillStyle = this.VGAPalette.lightGray;
        ctx.fillRect(0, 0, width, height * 0.6);
        
        // Draw wooden beams
        ctx.fillStyle = this.VGAPalette.darkGray;
        for (let x = 0; x < width; x += 60) {
            ctx.fillRect(x, 0, 5, height * 0.6);
        }
        
        // Draw horizontal beam
        ctx.fillRect(0, height * 0.2, width, 5);
        
        // Draw window
        this.drawCottageInteriorWindow(ctx, width * 0.7, height * 0.3, 40, 30);
        
        // Add typical Sierra-style dithering for texture on the floor
        this.addSierraDithering(
            ctx, 0, height * 0.6, width, height * 0.4,
            this.VGAPalette.kqDirt, this.VGAPalette.darkGray
        );
    }
    
    drawCottageInteriorWindow(ctx, x, y, width, height) {
        // Window frame
        ctx.fillStyle = this.VGAPalette.kqWood;
        ctx.fillRect(x - 5, y - 5, width + 10, height + 10);
        
        // Window glass
        ctx.fillStyle = this.VGAPalette.kqSky;
        ctx.fillRect(x, y, width, height);
        
        // Window cross
        ctx.strokeStyle = this.VGAPalette.kqWood;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + width/2, y);
        ctx.lineTo(x + width/2, y + height);
        ctx.moveTo(x, y + height/2);
        ctx.lineTo(x + width, y + height/2);
        ctx.stroke();
        
        // Light effect outside window
        ctx.fillStyle = this.VGAPalette.yellow;
        ctx.globalAlpha = 0.2;
        ctx.fillRect(x - 10, y - 10, width + 20, height + 20);
        ctx.globalAlpha = 1.0;
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
                case 'table':
                    this.drawSierraTable(this.virtualCtx, scaledX, scaledY, scaledWidth, scaledHeight);
                    break;
                case 'chair':
                    this.drawSierraChair(this.virtualCtx, scaledX, scaledY, scaledWidth, scaledHeight);
                    break;
                default:
                    // Generic colored rectangle as fallback
                    this.virtualCtx.fillStyle = obj.isExit ? this.VGAPalette.darkGray : 
                                        obj.canTake ? this.VGAPalette.yellow : this.VGAPalette.brown;
                    this.virtualCtx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
            }
        }
    }
    
    drawSierraTree(ctx, x, y, width, height) {
        // VGA King's Quest trees were much more detailed
        const trunkWidth = width * 0.4;
        const trunkHeight = height * 0.5;
        const trunkX = x + (width - trunkWidth) / 2;
        const trunkY = y + height - trunkHeight;
        
        // Tree trunk with bark texture
        const trunkGradient = ctx.createLinearGradient(trunkX, trunkY, trunkX + trunkWidth, trunkY);
        trunkGradient.addColorStop(0, this.VGAPalette.darkBrown);
        trunkGradient.addColorStop(0.5, this.VGAPalette.brown);
        trunkGradient.addColorStop(1, this.VGAPalette.darkBrown);
        ctx.fillStyle = trunkGradient;
        ctx.fillRect(trunkX, trunkY, trunkWidth, trunkHeight);
        
        // Trunk texture lines (bark)
        ctx.strokeStyle = this.VGAPalette.darkBrown;
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const lineY = trunkY + trunkHeight * (0.3 + i * 0.2);
            ctx.beginPath();
            ctx.moveTo(trunkX, lineY);
            ctx.lineTo(trunkX + trunkWidth, lineY);
            ctx.stroke();
        }
        
        // Tree foliage - KQ had more rounded, detailed trees
        // Multiple green circles make up the foliage
        const foliageColors = [
            this.VGAPalette.darkGreen, 
            this.VGAPalette.kqGrass, 
            this.VGAPalette.green
        ];
        
        // Base of foliage
        const baseX = x + width/2;
        const baseY = y + height - trunkHeight;
        
        // Draw several overlapping circles for foliage
        for (let i = 0; i < 5; i++) {
            const offsetX = [-width*0.2, width*0.2, 0, -width*0.1, width*0.1][i];
            const offsetY = [-height*0.4, -height*0.4, -height*0.6, -height*0.25, -height*0.25][i];
            const radius = [width*0.3, width*0.3, width*0.25, width*0.2, width*0.2][i];
            
            ctx.fillStyle = foliageColors[i % foliageColors.length];
            ctx.beginPath();
            ctx.arc(baseX + offsetX, baseY + offsetY, radius, 0, Math.PI * 2);
            ctx.fill();
        }
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
                this.virtualCtx.fillStyle = this.VGAPalette.cyan;
                this.virtualCtx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
            }
        }
    }
    
    drawSierraOldMan(ctx, x, y, width, height) {
        // VGA King's Quest had much more detailed NPCs
        
        // Calculate animation for beard/staff movement
        const beardOffset = Math.sin(this.animationFrame / 2) * 1;
        
        // Robe
        ctx.fillStyle = this.VGAPalette.darkBlue; // VGA Cedric/wizard style
        ctx.fillRect(x + width*0.2, y + height*0.3, width*0.6, height*0.7);
        
        // Robe details - these details make it more KQ like
        // Sleeve shading
        ctx.fillStyle = this.VGAPalette.blue;
        ctx.fillRect(x + width*0.2, y + height*0.3, width*0.15, height*0.4);
        ctx.fillRect(x + width*0.65, y + height*0.3, width*0.15, height*0.4);
        
        // Robe hem
        ctx.fillStyle = this.VGAPalette.black;
        ctx.fillRect(x + width*0.2, y + height*0.95, width*0.6, height*0.05);
        
        // Head
        ctx.fillStyle = this.VGAPalette.flesh;
        ctx.beginPath();
        ctx.arc(x + width*0.5, y + height*0.18, width*0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Hat (wizard-like, KQ style)
        ctx.fillStyle = this.VGAPalette.darkBlue;
        ctx.beginPath();
        ctx.moveTo(x + width*0.25, y + height*0.15);
        ctx.lineTo(x + width*0.5, y - height*0.1);
        ctx.lineTo(x + width*0.75, y + height*0.15);
        ctx.closePath();
        ctx.fill();
        
        // White beard (with slight animation)
        ctx.fillStyle = this.VGAPalette.white;
        ctx.beginPath();
        ctx.moveTo(x + width*0.35, y + height*0.2);
        ctx.lineTo(x + width*0.3, y + height*0.4 + beardOffset);
        ctx.lineTo(x + width*0.5, y + height*0.5 + beardOffset);
        ctx.lineTo(x + width*0.7, y + height*0.4 + beardOffset);
        ctx.lineTo(x + width*0.65, y + height*0.2);
        ctx.closePath();
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = this.VGAPalette.white;
        ctx.fillRect(x + width*0.4, y + height*0.15, width*0.08, height*0.03);
        ctx.fillRect(x + width*0.55, y + height*0.15, width*0.08, height*0.03);
        
        // Pupils
        ctx.fillStyle = this.VGAPalette.black;
        ctx.fillRect(x + width*0.42, y + height*0.15, width*0.04, height*0.03);
        ctx.fillRect(x + width*0.57, y + height*0.15, width*0.04, height*0.03);
        
        // Staff - iconic wizard staff from KQ
        ctx.strokeStyle = this.VGAPalette.brown;
        ctx.lineWidth = width*0.06;
        ctx.beginPath();
        ctx.moveTo(x + width*0.8, y + height*0.3);
        ctx.lineTo(x + width*0.8, y + height);
        ctx.stroke();
        
        // Staff top crystal (KQ style magic staff)
        ctx.fillStyle = this.VGAPalette.lightCyan;
        ctx.beginPath();
        ctx.arc(x + width*0.8, y + height*0.25, width*0.08, 0, Math.PI * 2);
        ctx.fill();
        
        // Staff crystal glow
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(x + width*0.8, y + height*0.25, width*0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
    
    drawPlayer(player) {
        // Scale player position from the actual canvas to our virtual resolution
        const scaledX = Math.round((player.x / this.canvas.width) * this.virtualWidth);
        const scaledY = Math.round((player.y / this.canvas.height) * this.virtualHeight);
        const scaledWidth = Math.round((player.width / this.canvas.width) * this.virtualWidth);
        const scaledHeight = Math.round((player.height / this.canvas.height) * this.virtualHeight);
        
        const direction = player.drawStyle.direction;
        
        // King's Quest VGA characters were much more detailed than EGA ones
        // KQ characters had more detailed proportions and shading
        
        // Animation frame (0-3) for walking cycle
        const frame = this.animationFrame;
        const isMoving = player.keys.ArrowUp || player.keys.ArrowDown || 
                         player.keys.ArrowLeft || player.keys.ArrowRight;
        
        // Draw King Graham / Alexander style character (KQ5/KQ6)
        switch(direction) {
            case 'left':
                this.drawKQCharacterSide(scaledX, scaledY, scaledWidth, scaledHeight, 'left', isMoving, frame);
                break;
            case 'right':
                this.drawKQCharacterSide(scaledX, scaledY, scaledWidth, scaledHeight, 'right', isMoving, frame);
                break;
            case 'up':
                this.drawKQCharacterBack(scaledX, scaledY, scaledWidth, scaledHeight, isMoving, frame);
                break;
            default: // down or default
                this.drawKQCharacterFront(scaledX, scaledY, scaledWidth, scaledHeight, isMoving, frame);
        }
    }
    
    drawKQCharacterFront(x, y, width, height, isMoving, frame) {
        const ctx = this.virtualCtx;
        
        // Head
        ctx.fillStyle = this.VGAPalette.flesh;
        ctx.beginPath();
        ctx.arc(x + width/2, y + height*0.18, width*0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Hair (Alexander style from KQ6)
        ctx.fillStyle = this.VGAPalette.hair;
        ctx.beginPath();
        ctx.arc(x + width/2, y + height*0.13, width*0.3, Math.PI, 0);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = this.VGAPalette.white;
        ctx.fillRect(x + width*0.4, y + height*0.15, width*0.08, height*0.04);
        ctx.fillRect(x + width*0.55, y + height*0.15, width*0.08, height*0.04);
        
        // Pupils
        ctx.fillStyle = this.VGAPalette.black;
        ctx.fillRect(x + width*0.42, y + height*0.16, width*0.04, height*0.02);
        ctx.fillRect(x + width*0.57, y + height*0.16, width*0.04, height*0.02);
        
        // KQ characters had detailed clothing
        // Body with royal outfit (colors vary by character)
        ctx.fillStyle = this.VGAPalette.kqPurple; // King Graham's color
        
        // Torso
        ctx.fillRect(x + width*0.3, y + height*0.35, width*0.4, height*0.3);
        
        // Shoulders
        ctx.fillRect(x + width*0.2, y + height*0.35, width*0.1, height*0.1);
        ctx.fillRect(x + width*0.7, y + height*0.35, width*0.1, height*0.1);
        
        // Legs with walking animation
        ctx.fillStyle = this.VGAPalette.kqBlue;
        
        if (isMoving) {
            // Animate legs when moving
            if (frame % 2 === 0) {
                // First walking frame
                ctx.fillRect(x + width*0.35, y + height*0.65, width*0.15, height*0.3);
                ctx.fillRect(x + width*0.5, y + height*0.65, width*0.15, height*0.35);
            } else {
                // Second walking frame
                ctx.fillRect(x + width*0.35, y + height*0.65, width*0.15, height*0.35);
                ctx.fillRect(x + width*0.5, y + height*0.65, width*0.15, height*0.3);
            }
        } else {
            // Standing still
            ctx.fillRect(x + width*0.35, y + height*0.65, width*0.15, height*0.35);
            ctx.fillRect(x + width*0.5, y + height*0.65, width*0.15, height*0.35);
        }
        
        // Detail - belt
        ctx.fillStyle = this.VGAPalette.brown;
        ctx.fillRect(x + width*0.3, y + height*0.6, width*0.4, height*0.05);
        
        // Detail - shirt collar
        ctx.fillStyle = this.VGAPalette.white;
        ctx.fillRect(x + width*0.4, y + height*0.35, width*0.2, height*0.05);
    }
    
    drawKQCharacterBack(x, y, width, height, isMoving, frame) {
        const ctx = this.virtualCtx;
        
        // Back of head
        ctx.fillStyle = this.VGAPalette.hair;
        ctx.beginPath();
        ctx.arc(x + width/2, y + height*0.18, width*0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Neck
        ctx.fillStyle = this.VGAPalette.flesh;
        ctx.fillRect(x + width*0.4, y + height*0.30, width*0.2, height*0.05);
        
        // Body - back view of royal outfit
        ctx.fillStyle = this.VGAPalette.kqPurple;
        
        // Torso
        ctx.fillRect(x + width*0.3, y + height*0.35, width*0.4, height*0.3);
        
        // Legs with walking animation
        ctx.fillStyle = this.VGAPalette.kqBlue;
        
        if (isMoving) {
            // Animate legs when moving
            if (frame % 2 === 0) {
                ctx.fillRect(x + width*0.35, y + height*0.65, width*0.15, height*0.3);
                ctx.fillRect(x + width*0.5, y + height*0.65, width*0.15, height*0.35);
            } else {
                ctx.fillRect(x + width*0.35, y + height*0.65, width*0.15, height*0.35);
                ctx.fillRect(x + width*0.5, y + height*0.65, width*0.15, height*0.3);
            }
        } else {
            ctx.fillRect(x + width*0.35, y + height*0.65, width*0.15, height*0.35);
            ctx.fillRect(x + width*0.5, y + height*0.65, width*0.15, height*0.35);
        }
        
        // Detail - belt from back
        ctx.fillStyle = this.VGAPalette.brown;
        ctx.fillRect(x + width*0.3, y + height*0.6, width*0.4, height*0.05);
    }
    
    drawKQCharacterSide(x, y, width, height, facing, isMoving, frame) {
        const ctx = this.virtualCtx;
        const direction = facing === 'right' ? 1 : -1;
        
        // Adjust x position for left-facing character
        if (facing === 'left') {
            x += width;
        }
        
        // Head
        ctx.fillStyle = this.VGAPalette.flesh;
        ctx.beginPath();
        ctx.arc(x + width*0.3 * direction, y + height*0.18, width*0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Hair
        ctx.fillStyle = this.VGAPalette.hair;
        ctx.beginPath();
        ctx.arc(x + width*0.32 * direction, y + height*0.13, width*0.25, Math.PI, 0);
        ctx.fill();
        
        // Eye
        ctx.fillStyle = this.VGAPalette.white;
        ctx.fillRect(x + width*(0.38 * direction), y + height*0.15, width*0.08 * direction, height*0.04);
        
        // Pupil
        ctx.fillStyle = this.VGAPalette.black;
        ctx.fillRect(x + width*(0.4 * direction), y + height*0.16, width*0.04 * direction, height*0.02);
        
        // Body - side view
        ctx.fillStyle = this.VGAPalette.kqPurple;
        
        // Torso
        ctx.fillRect(x + width*0.15 * direction, y + height*0.35, width*0.4 * direction, height*0.3);
        
        // Legs with walking animation
        ctx.fillStyle = this.VGAPalette.kqBlue;
        
        if (isMoving) {
            // Walking animation
            if (frame % 2 === 0) {
                ctx.fillRect(x + width*0.05 * direction, y + height*0.65, width*0.2 * direction, height*0.35);
                ctx.fillRect(x + width*0.3 * direction, y + height*0.65, width*0.2 * direction, height*0.3);
            } else {
                ctx.fillRect(x + width*0.05 * direction, y + height*0.65, width*0.2 * direction, height*0.3);
                ctx.fillRect(x + width*0.3 * direction, y + height*0.65, width*0.2 * direction, height*0.35);
            }
        } else {
            // Standing
            ctx.fillRect(x + width*0.1 * direction, y + height*0.65, width*0.2 * direction, height*0.35);
            ctx.fillRect(x + width*0.25 * direction, y + height*0.65, width*0.2 * direction, height*0.35);
        }
        
        // Detail - belt
        ctx.fillStyle = this.VGAPalette.brown;
        ctx.fillRect(x + width*0.15 * direction, y + height*0.6, width*0.4 * direction, height*0.05);
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
