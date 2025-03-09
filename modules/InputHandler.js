export default class InputHandler {
    constructor(inputElement, commandParser) {
        this.inputElement = inputElement;
        this.commandParser = commandParser;
        this.gameEngine = null;
    }
    
    setGameEngine(gameEngine) {
        this.gameEngine = gameEngine;
    }
    
    initialize() {
        // Set up command input listener
        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.inputElement.value.toLowerCase().trim();
                this.commandParser.parseCommand(command);
                this.inputElement.value = '';
            }
        });
    }
}
