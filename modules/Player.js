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
        // Handle movement based on key presses
        if (this.keys.ArrowUp) {
            this.y -= this.speed;
            this.drawStyle.direction = 'up';
        }
        if (this.keys.ArrowDown) {
            this.y += this.speed;
            this.drawStyle.direction = 'down';
        }
        if (this.keys.ArrowLeft) {
            this.x -= this.speed;
            this.drawStyle.direction = 'left';
        }
        if (this.keys.ArrowRight) {
            this.x += this.speed;
            this.drawStyle.direction = 'right';
        }
        
        // Keep player within canvas bounds
        const canvas = document.getElementById('gameCanvas');
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
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
        // Find the exit that leads back to where we came from
        const canvas = document.getElementById('gameCanvas');
        
        for (const obj of room.objects) {
            if (obj.isExit) {
                if (obj.y < canvas.height / 2) {
                    // Exit is at the top, place player at the bottom
                    this.y = canvas.height - this.height - 20;
                } else if (obj.y > canvas.height / 2) {
                    // Exit is at the bottom, place player at the top
                    this.y = 20;
                }
                
                if (obj.x < canvas.width / 2) {
                    // Exit is at the left, place player at the right
                    this.x = canvas.width - this.width - 20;
                } else if (obj.x > canvas.width / 2) {
                    // Exit is at the right, place player at the left
                    this.x = 20;
                }
            }
        }
    }
}
