export default class LevelFinish extends Phaser.Scene {
    constructor () {
        super("LevelFinish");
    }

    init(data) {
        this.level = data.level;
        this.score = data.score;
    }

    create() {
        this.add.image(this.game.config.width/2, this.game.config.height/2, 'background').setDepth(0).setScale(1.5);
        // this.pausebg = this.add.rectangle(400, 300, 800, 600, 0x008eb0);
        // this.pausebg.setDepth(5);

        // this.input.once('pointerdown', () => {
        //     this.scene.resume('PickGame');
        //     this.scene.stop('PauseMenu');
        // });

        this.back_arrow = this.add.image(750, 600, 'back_arrow').setScale(0.8).setDepth(1);
        this.back_arrow.setInteractive({useHandCursor: true});
        this.back_arrow.once('pointerdown', () => {
            this.scene.start('LevelSelect');
        }, this);
        this.add.text(750, 650, "Back", fontStyle2).setOrigin(0.5).setDepth(1);

        this.levelText = this.add.text(400, 300, "Level " + this.level + " Complete!", fontStyle).setOrigin(0.5).setDepth(1);

        this.scoreText = this.add.text(400, 350, "Score: " + this.score, fontStyle2).setOrigin(0.5).setDepth(1);
        
        let highscore = this.registry.get('level' + this.level);

        if (highscore < this.score) {
            this.add.text(400, 400, "Best Score: " + highscore, fontStyle2).setOrigin(0.5).setDepth(1);
        } else {
            // if undefined
            this.add.text(400, 400, "New Best Score!", fontStyle).setOrigin(0.5).setDepth(1);
            this.registry.set('level' + this.level, this.score);
            if (typeof(Storage) !== 'undefined') {
                window.localStorage.setItem('level' + this.level, this.score);
            }
        }
    }

}

const fontStyle = {
    fontFamily: 'Arial',
    fontSize: 48,
    color: '#ffffff',
    fontStyle: 'bold',
    padding: 16,
    shadow: {
        color: '#000000',
        fill: true,
        offsetX: 2,
        offsetY: 2,
        blur: 4
    }
};

const fontStyle2 = {
    fontFamily: 'Arial',
    fontSize: 16,
    color: '#ffffff',
    fontStyle: 'bold',
    padding: 16,
    shadow: {
        color: '#000000',
        fill: true,
        offsetX: 2,
        offsetY: 2,
        blur: 4
    }
};