const NUMLEVELS = 8;
const LEVELROWSIZE = 4;

export default class LevelSelect extends Phaser.Scene {
    constructor () {
        super('LevelSelect');
    }

    init (data) {
        this.colorblind = data.colorblind;
    }

    create () {
        this.add.image(400, 300, 'background');
        this.level = 0;

        // Colorblind Button
        if (!this.registry.get('colorblind'))
            this.registry.set('colorblind', false);
        if (this.registry.get('colorblind' == false)) {
            this.colorblindButton = this.add.image(750, 550, 'colorblindOn').setScale(0.15);
        } else {
            this.colorblindButton = this.add.image(750, 550, 'colorblindOff').setScale(0.15);
        }
        this.colorblindButton.setInteractive({useHandCursor: true});
        this.turnOnColorblindEvent();
        
        // let levelGroup = this.add.group();

        this.add.text(100, 80, "Level Select", fontStyle);
        for (let l=0; l<NUMLEVELS; l++) {
            this.createLevelButton(150+150*(l%LEVELROWSIZE), 250+150*Math.floor(l/LEVELROWSIZE), l+1);
            // levelnumber.setInteractive({useHandCursor: true});
            // levelnumber.on('pointerdown', (pointer) => {
            //     this.levelClick(pointer);
            // })
            // levelGroup.add(levelnumber);
        }


        // this.input.on('gameobjectdown', (pointer, gameObject) => {
        //     this.levelClick(pointer);
        // });

        // levelGroup.forEach((child, index) => {
        //     this.level = index;

        // })
    }

    createLevelButton(x, y, level) {
        let levelnumber = this.add.text(x, y, level, fontStyle).setOrigin(0.5).setDepth(2);
        let btn = this.add.image(x, y, 'button_up').setInteractive({useHandCursor: true}).setScale(2).setOrigin(0.5).setDepth(1);
        btn.on('pointerover', (ptr) => {btn.setTexture('button_hover'), levelnumber.setY(y)}); //on hover
        btn.on('pointerout', (ptr) => {btn.setTexture('button_up'), levelnumber.setY(y)});
        btn.on('pointerdown', (ptr) => {btn.setTexture('button_down'), levelnumber.setY(y+5)}); //on press
        // add once listener so lifting pointer after clicking from previous scene doesn't count
        btn.once('pointerdown', () =>
            btn.on('pointerup', (ptr) => {this.scene.start("PickGame", {level: level})}));

        return btn;
    }

    // levelClick(pointer) {
    //     let x = pointer.x;
    //     let y = pointer.y;
    //     // console.log(x, y);
    //     let level = 1 + Math.floor((x-400)/100) + Math.floor((y-200)/100)*LEVELROWSIZE;
    //     // console.log(level);
    //     this.scene.start("PickGame", {level: level});
    //     // console.log(Math.floor((pointer.x-100) / 100));
    // }

    turnOnColorblindEvent() {
        this.colorblindButton.on('pointerdown', () => {
            if (this.registry.get('colorblind') == false) {
                this.registry.set('colorblind', true);
                this.colorblindButton = this.add.image(750, 550, 'colorblindOn').setScale(0.15);
            } else {
                this.registry.set('colorblind', false);
                this.colorblindButton = this.add.image(750, 550, 'colorblindOff').setScale(0.15);
            }
        });
    }

    turnOffColorblindEvent() {
        this.colorblindButton.off('pointerdown');
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