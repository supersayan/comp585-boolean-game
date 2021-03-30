//  Based on the Emoji Match game by Tom Miller (https://codepen.io/creativeocean/full/OeKjmp)

import Boot from './Boot.js';
import Preloader from './Preloader.js';
import MainMenu from './MainMenu.js';
import MainGame from './Game.js';
import Level1a from './Levels/Level1a.js';
import Level1b from './Levels/Level1b.js';
import Level1c from './Levels/Level1c.js';
import Level2a from './Levels/Level2a.js';
import Level3a from './Levels/Level3a.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#008eb0',
    parent: 'phaser-example',
    scene: [ Boot, Preloader, MainMenu, Level1a, Level1b, Level1c, Level2a, Level3a, MainGame],
    //colors: ['red', 'green', 'blue', 'gray', 'purple'],
    //fruits: ['apple', 'banana', 'orange', 'strawberry']
    shapes: ['square', 'triangle', 'circle', 'pentagon', 'trapezoid'],
    colors: ['red', 'orange', 'green', 'blue', 'purple'],
    patterns: ['plain', 'striped', 'spots', 'lattice', 'swirl']
};

let game = new Phaser.Game(config);
//game.config.colors = ['red', 'green', 'blue', 'gray', 'purple']
//game.config.fruits = ['apple', 'banana', 'orange', 'strawberry']
game.config.shapes = ['square', 'triangle', 'circle', 'pentagon', 'trapezoid']
game.config.colors = ['red', 'orange', 'green', 'blue', 'purple']
game.config.patterns = ['plain', 'striped', 'spotted', 'net', 'spiral']