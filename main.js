//  Based on the Emoji Match game by Tom Miller (https://codepen.io/creativeocean/full/OeKjmp)

import Boot from './Boot.js';
import Preloader from './Preloader.js';
import MainMenu from './MainMenu.js';
import MainGame from './Game.js';
import Level1a from './Levels/Level1a.js';
import Level1b from './Levels/Level1b.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#008eb0',
    parent: 'phaser-example',
    scene: [ Boot, Preloader, MainMenu, Level1a],
    colors: ['red', 'green', 'blue', 'gray', 'purple'],
    fruits: ['apple', 'banana', 'orange', 'strawberry']
};

let game = new Phaser.Game(config);
game.config.colors = ['red', 'green', 'blue', 'gray', 'purple']
game.config.fruits = ['apple', 'banana', 'orange', 'strawberry']
