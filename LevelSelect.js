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

        if (this.colorblind == true) {
            this.colorblindButton = this.add.image(750, 550, 'colorblindOn').setScale(0.15);
        } else {
            this.colorblindButton = this.add.image(750, 550, 'colorblindOff').setScale(0.15);
        }
        this.colorblindButton.setInteractive({useHandCursor: true});
        this.turnOnColorblindEvent();

        

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
        
        // let levelGroup = this.add.group();

        this.add.text(50, 200, "Level Select", fontStyle);
        for (let l=0; l<NUMLEVELS; l++) {
            let levelnumber = this.add.text(400+100*(l%LEVELROWSIZE), 200+100*Math.floor(l/LEVELROWSIZE), l+1, fontStyle);
            levelnumber.setInteractive({useHandCursor: true});
            levelnumber.on('pointerdown', (pointer) => {
                this.levelClick(pointer);
            })
            // levelGroup.add(levelnumber);
        }


        // this.input.on('gameobjectdown', (pointer, gameObject) => {
        //     this.levelClick(pointer);
        // });

        // levelGroup.forEach((child, index) => {
        //     this.level = index;

        // })
    }

    levelClick(pointer) {
        let x = pointer.x;
        let y = pointer.y;
        // console.log(x, y);
        let level = 1 + Math.floor((x-400)/100) + Math.floor((y-200)/100)*LEVELROWSIZE;
        // console.log(level);
        this.scene.start("PickGame", {level: level, colorblind: this.colorblind});
        // console.log(Math.floor((pointer.x-100) / 100));
    }

    turnOnColorblindEvent() {
        this.colorblindButton.on('pointerdown', () => 
        {if (this.colorblind == false) {
            this.colorblind = true;
            this.colorblindButton = this.add.image(750, 550, 'colorblindOn').setScale(0.15);
        } else {
            this.colorblind = false;
            this.colorblindButton = this.add.image(750, 550, 'colorblindOff').setScale(0.15);
        }}
        
        );
    }

    turnOffColorblindEvent() {
        this.colorblindButton.off('pointerdown', this.colorblindToggle(), this)
    }
}

