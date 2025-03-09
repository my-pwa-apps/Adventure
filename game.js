import GameEngine from './modules/GameEngine.js';
import Renderer from './modules/Renderer.js';
import InputHandler from './modules/InputHandler.js';
import CommandParser from './modules/CommandParser.js';
import Player from './modules/Player.js';
import SpriteManager from './modules/SpriteManager.js';
import { rooms, spriteList } from './modules/WorldData.js';

// Initialize game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize components
    const canvas = document.getElementById('gameCanvas');
    const textOutput = document.getElementById('textOutput');
    const commandInput = document.getElementById('commandInput');
    const roomNameDisplay = document.getElementById('roomName');
    
    const player = new Player(160, 150);
    const renderer = new Renderer(canvas, rooms);
    const commandParser = new CommandParser(textOutput);
    const inputHandler = new InputHandler(commandInput, commandParser);
    const spriteManager = new SpriteManager();
    
    // Setup renderer to display loading screen
    renderer.setSpriteManager(spriteManager);
    
    // Show initial loading screen
    renderer.drawLoadingScreen(0);
    
    try {
        // Load sprites before starting the game
        await spriteManager.loadSprites(spriteList);
    } catch (error) {
        console.error('Error loading sprites:', error);
        // Continue with fallback colored rectangles
    }
    
    // Initialize game engine with all components
    const gameEngine = new GameEngine({
        player,
        renderer,
        commandParser,
        inputHandler,
        rooms,
        textOutput,
        roomNameDisplay,
        spriteManager
    });
    
    // Start the game
    gameEngine.start();
});
