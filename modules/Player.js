export default class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 30;
        this.color = '#ffff00';
        this.speed = 2;
        
        // Visual properties for procedural drawing
        this.drawStyle = {
            bodyColor: '#3366cc',
            headColor: '#ffcc99',
            hairColor: '#663300',
            shirtColor: '#3366cc',
            pantsColor: '#333366',
            direction: 'down' // down, up, left, right
        };
        
        this.gameEngine = null;
        
        // Movement state
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false
        };
        
        // Set up key event listeners
        this.setupKeyboardListeners();

        this.z = 0;  // Current height/elevation
        this.velocity = { x: 0, y: 0, z: 0 };
        this.gravity = 0.5;
        this.jumpForce = 8;
        this.isJumping = false;
        this.lastGroundHeight = 0;

        // Add collision buffer
        this.collisionBuffer = 5;
        this.maxStepHeight = 2;
    }
    
    setGameEngine(gameEngine) {
        this.gameEngine = gameEngine;
    }
    
    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key in this.keys) {
                this.keys[e.key] = true;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key in this.keys) {
                this.keys[e.key] = false;
            }
        });
    }
    
    update() {
        const room = this.gameEngine.getCurrentRoom();
        
        // Calculate new position
        let moveX = 0;
        let moveY = 0;

        if (this.keys.ArrowLeft) moveX -= this.speed;
        if (this.keys.ArrowRight) moveX += this.speed;
        if (this.keys.ArrowUp) moveY -= this.speed;
        if (this.keys.ArrowDown) moveY += this.speed;

        // Test movement with collision checks
        const newX = this.x + moveX;
        const newY = this.y + moveY;
        
        // Check if new position is walkable
        if (this.isPositionWalkable(newX, newY, room)) {
            this.x = newX;
            this.y = newY;
            this.lastGroundHeight = this.getHeightAt(newX, newY, room);
        }

        // Apply gravity
        this.velocity.z -= this.gravity;
        this.z += this.velocity.z;

        // Ground collision
        if (this.z <= this.lastGroundHeight) {
            this.z = this.lastGroundHeight;
            this.velocity.z = 0;
            this.isJumping = false;
        }

        // Update direction
        if (moveX !== 0 || moveY !== 0) {
            this.updateFacingDirection(moveX, moveY);
        }

        // Keep within bounds
        this.clampToBounds();
    }

    isPositionWalkable(x, y, room) {
        if (!room.heightMap) return true;
        
        // Check corners with buffer
        const buffer = 2;
        const points = [
            { x: x + buffer, y: y + buffer },                           // Top-left
            { x: x + this.width - buffer, y: y + buffer },             // Top-right
            { x: x + buffer, y: y + this.height - buffer },            // Bottom-left
            { x: x + this.width - buffer, y: y + this.height - buffer} // Bottom-right
        ];
        
        for (const point of points) {
            const heightAtPoint = this.getHeightAt(point.x, point.y, room);
            if (heightAtPoint === -999) return false;
        }
        
        return true;
    }

    updateFacingDirection(moveX, moveY) {
        if (Math.abs(moveX) > Math.abs(moveY)) {
            this.drawStyle.direction = moveX > 0 ? 'right' : 'left';
        } else {
            this.drawStyle.direction = moveY > 0 ? 'down' : 'up';
        }
    }

    clampToBounds() {
        const canvas = document.getElementById('gameCanvas');
        const buffer = this.collisionBuffer;
        
        this.x = Math.max(buffer, Math.min(canvas.width - this.width - buffer, this.x));
        this.y = Math.max(buffer, Math.min(canvas.height - this.height - buffer, this.y));
    }

    getHeightAt(x, y, room) {
        if (!room.heightMap) return 0;

        const centerX = x + this.width / 2;
        const centerY = y + this.height / 2;
        let currentHeight = room.heightMap.base;

        for (const variation of room.heightMap.variations) {
            if (centerX >= variation.x && 
                centerX < variation.x + variation.width &&
                centerY >= variation.y && 
                centerY < variation.y + variation.height) {
                currentHeight = variation.elevation;
            }
        }

        return currentHeight;
    }
    
    isColliding(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
    
    isNear(entity, maxDistance = 50) {
        const distance = Math.sqrt(
            Math.pow(this.x - entity.x, 2) + 
            Math.pow(this.y - entity.y, 2)
        );
        return distance < maxDistance;
    }
    
    placeInNewRoom(room) {
        // Standard entry/exit positions for each room type
        const positions = {
            forest: { x: 160, y: 150 },
            cottage: { x: 160, y: 160 },
            cottage_interior: { x: 160, y: 170 }
        };
        
        // Set position based on room type
        if (positions[room.type]) {
            this.x = positions[room.type].x;
            this.y = positions[room.type].y;
            return;
        }
        
        // Fallback positioning logic
        const canvas = document.getElementById('gameCanvas');
        this.x = canvas.width / 2;
        this.y = canvas.height - this.height - 40;
    }
}
