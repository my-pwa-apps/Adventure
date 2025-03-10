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

        const heightAtNewPos = this.getHeightAt(x, y, room);
        if (heightAtNewPos === -999) return false;

        const heightDiff = Math.abs(heightAtNewPos - this.z);
        return heightDiff <= this.maxStepHeight;
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

        // Check each height variation
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
        const canvas = document.getElementById('gameCanvas');
        
        // Handle cottage interior specially
        if (room.type === 'cottage_interior') {
            // Always place player near the door when entering cottage
            this.x = 160;
            this.y = 160;
            return;
        }
        
        // For other rooms, find appropriate exit positions
        for (const obj of room.objects) {
            if (obj.isExit) {
                if (obj.y < canvas.height / 2) {
                    // Exit is at the top, place player at the bottom
                    this.y = canvas.height - this.height - 40;
                } else if (obj.y > canvas.height / 2) {
                    // Exit is at the bottom, place player at the top
                    this.y = 40;
                }
                
                if (obj.x < canvas.width / 2) {
                    // Exit is at the left, place player at the right
                    this.x = canvas.width - this.width - 40;
                } else if (obj.x > canvas.width / 2) {
                    // Exit is at the right, place player at the left
                    this.x = 40;
                }
            }
        }
    }
}
