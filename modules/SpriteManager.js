export default class SpriteManager {
    constructor() {
        this.sprites = {};
        this.loaded = false;
        this.totalSprites = 0;
        this.loadedSprites = 0;
    }

    async loadSprites(spriteList) {
        this.totalSprites = spriteList.length;
        this.loadedSprites = 0;
        
        const loadPromises = spriteList.map(spriteInfo => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.sprites[spriteInfo.id] = img;
                    this.loadedSprites++;
                    resolve();
                };
                img.onerror = () => {
                    console.error(`Failed to load sprite: ${spriteInfo.path}`);
                    reject();
                };
                img.src = spriteInfo.path;
            });
        });
        
        await Promise.all(loadPromises);
        this.loaded = true;
        console.log('All sprites loaded successfully');
    }
    
    getSprite(id) {
        return this.sprites[id];
    }
    
    isLoaded() {
        return this.loaded;
    }
    
    getLoadingProgress() {
        if (this.totalSprites === 0) return 1;
        return this.loadedSprites / this.totalSprites;
    }
}
