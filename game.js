import GameEngine from './modules/GameEngine.js';
import Renderer from './modules/Renderer.js';
import InputHandler from './modules/InputHandler.js';
import CommandParser from './modules/CommandParser.js';
import Player from './modules/Player.js';
import { rooms } from './modules/WorldData.js';

// Initialize game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const elements = {
        canvas: document.getElementById('gameCanvas'),
        textOutput: document.getElementById('textOutput'),
        commandInput: document.getElementById('commandInput'),
        roomName: document.getElementById('roomName'),
        scoreDisplay: document.getElementById('scoreDisplay'),
        submitCommand: document.getElementById('submitCommand')
    };
    
    // Check if any required elements are missing
    const missingElements = Object.entries(elements)
        .filter(([key, element]) => !element)
        .map(([key]) => key);
    
    if (missingElements.length > 0) {
        console.error('Missing DOM elements:', missingElements);
        return;
    }
    
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Initialize game components
    const player = new Player(160, 150);
    const renderer = new Renderer(elements.canvas, rooms);
    const commandParser = new CommandParser(elements.textOutput);
    const inputHandler = new InputHandler(elements.commandInput, commandParser, elements.submitCommand, isMobile);
    
    // Initialize game engine
    const gameEngine = new GameEngine({
        player,
        renderer,
        commandParser,
        inputHandler,
        rooms,
        ...elements,
        isMobile
    });
    
    // Start the game
    gameEngine.start();
});
