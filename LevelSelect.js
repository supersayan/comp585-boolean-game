export default class LevelSelect extends Phaser.Scene {
    constructor () {
        super('LevelSelect');
    }

    create () {
        this.add.image(400, 300, 'background');
        this.level = 0;

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
        let numLevels = 6;

        this.add.text(400, 200, "Level Select", fontStyle).setOrigin(0.5);
        for (let l=0; l<numLevels; l++) {
            let levelnumber = this.add.text(100+100*l, 300, l+1, fontStyle).setOrigin(0.5);
            levelnumber.setInteractive();
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
        // console.log(pointer.x);
        this.scene.start("MainGame", {level: Math.floor((pointer.x+50) / 100)});
        // console.log(Math.floor((pointer.x-100) / 100));
    }
}

