//  Based on the Emoji Match game by Tom Miller (https://codepen.io/creativeocean/full/OeKjmp)

import Boot from './Boot.js';
import Preloader from './Preloader.js';
import MainMenu from './MainMenu.js';
import PickGame from './PickGame.js';
import LevelSelect from './LevelSelect.js';
import PauseMenu from './PauseMenu.js';
import LevelFinish from './LevelFinish.js'

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 700,
    backgroundColor: '#008eb0',
    parent: 'game', // id of html element
    autoFocus: true,
    gameTitle: 'Shape Shop',
    scene: [ Boot, Preloader, MainMenu, PickGame, LevelSelect, PauseMenu, LevelFinish],
};

let game = new Phaser.Game(config);