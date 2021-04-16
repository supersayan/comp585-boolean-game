export default class BuildGame extends Phaser.Scene {

    constructor(str) {
        super('BuildGame');
    }
    
    init(data) {
    }

    create() {
        this.items = this.add.group({
            key: 'shapes',
            frameQuantity: 1,
            repeat: 15,
            gridAlign: {
                width: GRID_WIDTH,
                height: GRID_HEIGHT,
                cellWidth: GRID_CELLWIDTH,
                cellHeight: GRID_CELLHEIGHT,
                x: GRID_X,
                y: GRID_Y,
            }
        });
        this.backrect = this.add.rectangle(0,0, 1600, 220, 0x0000FF, 0.4); // blue rectangle covering top of screen

        this.submitrect = this.add.rectangle(568, 55, 125, 50,0x55ffff);
        this.submitrect.setStrokeStyle(2,0x000000);
        this.submitText = this.add.text(500, 20, 'Submit', fontStyle);
        this.submitText.setInteractive({useHandCursor: true});
        this.turnOnSubmitEvent();
    }

    turnOnSubmitEvent() {
        this.submitText.once('pointerdown', () => { // one time listener
            this.tweens.add({
                targets: [this.submitText, this.rect],
                alpha: {start: 1, to: 0.75},
                y: '+=5',
                ease: 'Elastic.out',
                duration: 100,
            });
            this.submitSelection();
        }, this);
    }
}