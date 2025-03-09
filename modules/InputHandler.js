export default class InputHandler {
    constructor(inputElement, commandParser, submitButton, isMobile) {
        this.inputElement = inputElement;
        this.commandParser = commandParser;
        this.submitButton = submitButton;
        this.isMobile = isMobile;
        this.gameEngine = null;
    }
    
    setGameEngine(gameEngine) {
        this.gameEngine = gameEngine;
    }
    
    initialize() {
        if (this.isMobile) {
            this.setupMobileControls();
        }
        
        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.processCommand();
            }
        });
        
        if (this.submitButton) {
            this.submitButton.addEventListener('click', () => {
                this.processCommand();
            });
        }
    }
    
    setupMobileControls() {
        const buttons = {
            upBtn: 'ArrowUp',
            downBtn: 'ArrowDown',
            leftBtn: 'ArrowLeft',
            rightBtn: 'ArrowRight'
        };
        
        Object.entries(buttons).forEach(([btnId, key]) => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.gameEngine.player.keys[key] = true;
                });
                
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.gameEngine.player.keys[key] = false;
                });
            }
        });
        
        // Command shortcuts
        const cmdButtons = document.querySelectorAll('.cmd-btn');
        cmdButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.getAttribute('data-command');
                this.inputElement.value = cmd + ' ';
                this.inputElement.focus();
            });
        });
    }
    
    processCommand() {
        const command = this.inputElement.value.toLowerCase().trim();
        this.commandParser.parseCommand(command);
        this.inputElement.value = '';
    }
}
