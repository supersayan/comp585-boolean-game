export default class MainMenu extends Phaser.Scene
{
    constructor ()
    {
        super('MainMenu');

        this.music;
        this.state = "main";
    }

    create ()
    {
        let background = this.add.image(400, 300, 'background');
        background.setScale(1.5,1.5);

        this.tweens.add({
            targets: background,
            alpha: { from: 0, to: 1 },
            duration: 1000
        });

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

        this.text1 = this.add.text(240, -20, 'Shape Shop', fontStyle);
        let frames = this.textures.get('shapes').getFrameNames();
        for (let i = 0; i < 25; i++ ){
            frames.pop();
        }
        this.im1 = this.add.sprite(-20,-20, 'shapes').setScale(0.8)
        this.im1.setFrame(Phaser.Utils.Array.GetRandom(frames));
        this.im2 = this.add.sprite(this.game.canvas.width + 40,40, 'shapes').setScale(0.8)
        this.im2.setFrame(Phaser.Utils.Array.GetRandom(frames));
        this.im3 = this.add.sprite(-20,this.game.canvas.height +40, 'shapes').setScale(0.8)
        this.im3.setFrame(Phaser.Utils.Array.GetRandom(frames));
        this.im4 = this.add.sprite(-20,this.game.canvas.height +40, 'shapes').setScale(0.8)
        this.im4.setFrame(Phaser.Utils.Array.GetRandom(frames));

        this.tweens.add({
            targets: this.text1,
            duration: 2000,
            y: {start: 0, to: this.game.canvas.height/2 - this.text1.height},
            ease: 'bounce.out',
            
        });

        this.tweens.add({
            targets: this.im1,
            duration: 2000,
            y: {start: 0, to: this.game.canvas.height/4},
            x: {start: 0, to:this.game.canvas.width/4},
            ease: 'bounce.out',
        });

        this.tweens.add({
            targets: this.im2,
            duration: 2000,
            y: {start: this.game.canvas.height + 40, to: this.game.canvas.height/1.5},
            x: {start: this.game.canvas.width + 40, to:this.game.canvas.width/1.35},
            ease: 'bounce.out',
        });

        this.tweens.add({
            targets: this.im3,
            duration: 2000,
            y: {start: -20, to: this.game.canvas.height/4},
            x: {start: this.game.canvas.width + 40, to:this.game.canvas.width/1.35},
            ease: 'bounce.out',
        });

        this.tweens.add({
            targets: this.im4,
            duration: 2000,
            y: {start: this.game.canvas.width + 40, to: this.game.canvas.height/1.5},
            x: {start: -20, to:this.game.canvas.width/4},
            ease: 'bounce.out',
        });
        // let logo = this.add.image(400, -200, 'logo');

        // if (!this.music)
        // {
        //     this.music = this.sound.play('music', { loop: true });
        // }

        // this.tweens.add({
        //     targets: logo,
        //     y: 300,
        //     ease: 'bounce.out',
        //     duration: 1200
        // });

        this.input.once('pointerdown', () => {
            this.state = "intro";
            let background2 = this.add.image(400, 300, 'background');
            background2.setScale(1.5,1.5);
            let intro = this.add.image(400,300, 'intro');

            this.tweens.add({
                targets: intro,
                alpha: { from: 0, to: 1 },
                duration: 100
            });

            this.input.once('pointerdown', () => {
                this.state = "game";
                this.scene.start('LevelSelect', {colorblind: false});
            })
        });
    }
}

