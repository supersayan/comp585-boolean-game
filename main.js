//  Based on the Emoji Match game by Tom Miller (https://codepen.io/creativeocean/full/OeKjmp)

import Boot from './Boot.js';
import Preloader from './Preloader.js';
import MainMenu from './MainMenu.js';
import MainGame from './Game.js';
import LevelSelect from './LevelSelect.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#008eb0',
    scene: [ Boot, Preloader, MainMenu, MainGame, LevelSelect],
    // shapes: ['square', 'triangle', 'circle', 'pentagon', 'trapezoid'],
    // colors: ['red', 'orange', 'green', 'blue', 'purple'],
    // patterns: ['plain', 'striped', 'spots', 'lattice', 'swirl']
};

let game = new Phaser.Game(config);
//game.config.colors = ['red', 'green', 'blue', 'gray', 'purple']
// game.config.shapes = ['square', 'triangle', 'circle', 'pentagon', 'trapezoid']
// game.config.colors = ['red', 'orange', 'green', 'blue', 'purple']
// game.config.patterns = ['plain', 'striped', 'spotted', 'net', 'spiral']