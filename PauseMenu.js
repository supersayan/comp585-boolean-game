export default class PauseMenu extends Phaser.Scene {
    constructor () {
        super("PauseMenu");
    }

    create() {
        this.add.image(400, 300, 'background').setDepth(5);
        // this.pausebg = this.add.rectangle(400, 300, 800, 600, 0x008eb0);
        // this.pausebg.setDepth(5);

        this.input.once('pointerdown', () => {
            this.scene.resume('PickGame');
            this.scene.stop('PauseMenu');
        });

        this.pauseText = this.add.text(400, 300, "Paused", fontStyle);
        this.pauseText.setOrigin(0.5);
        this.pauseText.setDepth(6);

        this.add.text(400, 400, "Click to Resume", fontStyle2).setOrigin(0.5).setDepth(6);
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