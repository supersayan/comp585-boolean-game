import MainGame from "../Game.js";

export default class Level1a extends MainGame {

    constructor ()
    {
        super('MainGame');

        this.emojis;

        this.circle1;
        this.circle2;

        this.child1;
        this.child2;
        this.correctset = []

        this.selectedEmoji = null;
        this.matched = false;

        this.score = 0;
        this.highscore = 0;
        this.scoreText;

        this.timer;
        this.timerText;
    }

    create ()
    {
        this.add.image(400, 300, 'background');

        // generates selection circles
        for(let i = 0; i < 16; i++){
            this.circles[i] = this.add.circle(0, 0, 42).setStrokeStyle(3, 0xf8960e);
            this.circles[i].setVisible(false);
        }
        
        /*this.circle1 = this.add.circle(0, 0, 42).setStrokeStyle(3, 0xf8960e);
        this.circle2 = this.add.circle(0, 0, 42).setStrokeStyle(3, 0x00ff00);

        this.circle1.setVisible(false);
        this.circle2.setVisible(false);*/

        //  Create a 4x4 grid aligned group to hold our sprites

        this.emojis = this.add.group({
            key: 'emojis',
            frameQuantity: 1,
            repeat: 15,
            gridAlign: {
                width: 4,
                height: 4,
                cellWidth: 120,
                cellHeight: 120,
                x: 280,
                y: 200
            }
        });

        const fontStyle = {
            fontFamily: 'Arial',
            fontSize: 30,
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

        this.timerText = this.add.text(20, 20, 'Red AND Blue', fontStyle);
        this.scoreText = this.add.text(300, 20, 'Hover here to End game', fontStyle);
        this.scoreText.setInteractive({ useHandCursor: true});    
        this.scoreText.on('pointerover', () => this.gameOver(), this)

        let children = this.emojis.getChildren();

        children.forEach((child) => {

            child.setInteractive();
            child.on('gameobjectdown', this.selectEmoji, this)
        });

        this.input.on('gameobjectdown', this.selectEmoji, this);
        //this.input.once('pointerdown', this.start, this);

        this.highscore = this.registry.get('highscore');

        this.arrangeGrid();
    }

    arrangeGrid ()
    {
        //  We need to make sure there is only one pair in the grid
        //  Let's create an array with all possible frames in it:

        let frames = Phaser.Utils.Array.NumberArray(1, 40);
        let selected = Phaser.Utils.Array.NumberArray(0, 15);
        let children = this.emojis.getChildren();
        
        //  Now we pick 16 random values, removing each one from the array so we can't pick it again
        //  and set those into the sprites

        let a = Math.floor(Math.random()*15)
        let b = a
        while (b == a) {
            b = Math.floor(Math.random()*15)
        }
        // boolean expression is pick red and blue
        children[a].setFrame('redapple.png')
        children[b].setFrame('bluebanana.png')
        this.correctset.push(a)
        this.correctset.push(b)
        //console.log(a,b)
        for (let i = 0; i < 16; i++)
        {
            if (i != a && i != b) {
                children[i].setFrame(this.game.config.colors[Math.floor((5*Math.random()))] + this.game.config.fruits[Math.floor((4*Math.random()))] +'.png')
                if (children[i].frame.customData.color == 'red' || children[i].frame.customData.color == 'blue') {
                    this.correctset.push(i)
                }
            }
        }

        this.correctset.sort(((a,b)=> a-b))
        console.log(this.correctset)

        //  Finally, pick two random children and make them a pair:
        let index1 = Phaser.Utils.Array.RemoveRandomElement(selected);
        let index2 = Phaser.Utils.Array.RemoveRandomElement(selected);

        this.child1 = children[index1];
        this.child2 = children[index2];

        //  Set the frame to match
        this.child2.setFrame(this.child1.frame.name);

        //console.log('Pair: ', index1, index2);

        //  Clear the currently selected emojis (if any)
        this.selectedEmoji = null;

        //  Stagger tween them all in
        this.tweens.add({
            targets: children,
            scale: { start: 0, from: 0, to: 1 },
            ease: 'bounce.out',
            duration: 600,
            delay: this.tweens.stagger(100, { grid: [ 4, 4 ], from: 'center' })
        });
    }
}