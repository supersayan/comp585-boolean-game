export default class PauseMenu extends Phaser.Scene {
    constructor () {
        super("PauseMenu");
    }

    create() {
        this.add.image(this.game.config.width/2, this.game.config.height/2, 'background').setDepth(4).setScale(1.5);
        // this.pausebg = this.add.rectangle(400, 300, 800, 600, 0x008eb0);
        // this.pausebg.setDepth(5);

        // this.input.once('pointerdown', () => {
        //     this.scene.resume('PickGame');
        //     this.scene.stop('PauseMenu');
        // });

        this.resume = this.add.image(350, 400, 'resume').setScale(0.8).setDepth(5);
        this.resume.setInteractive({useHandCursor: true});
        this.resume.once('pointerdown', () => {
            this.scene.resume('PickGame');
            this.scene.stop('PauseMenu');
        }, this);

        this.back_arrow = this.add.image(450, 400, 'back_arrow').setScale(0.8).setDepth(5);
        this.back_arrow.setInteractive({useHandCursor: true});
        this.back_arrow.once('pointerdown', () => {
            this.scene.start('LevelSelect');
            this.scene.stop('PickGame');
            this.scene.stop('PauseMenu');
        }, this);

        this.pauseText = this.add.text(400, 300, "Paused", fontStyle);
        this.pauseText.setOrigin(0.5);
        this.pauseText.setDepth(6);

        this.add.text(350, 450, "Resume", fontStyle2).setOrigin(0.5).setDepth(5);
        this.add.text(450, 450, "Exit", fontStyle2).setOrigin(0.5).setDepth(5);
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