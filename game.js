import GameEngine from './modules/GameEngine.js';
import Renderer from './modules/Renderer.js';
import InputHandler from './modules/InputHandler.js';
import CommandParser from './modules/CommandParser.js';
import Player from './modules/Player.js';
import { rooms } from './modules/WorldData.js';

// Initialize game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    const canvas = document.getElementById('gameCanvas');
    const textOutput = document.getElementById('textOutput');
    const commandInput = document.getElementById('commandInput');
    const roomNameDisplay = document.getElementById('roomName');
    
    const player = new Player(160, 150);
    const renderer = new Renderer(canvas, rooms);
    const commandParser = new CommandParser(textOutput);
    const inputHandler = new InputHandler(commandInput, commandParser);
    
    // Initialize game engine with all components
    const gameEngine = new GameEngine({
        player,
        renderer,
        commandParser,
        inputHandler,
        rooms,
        textOutput,
        roomNameDisplay
    });
    
    // Start the game
    gameEngine.start();
});
