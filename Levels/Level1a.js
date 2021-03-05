import MainGame from "../Game.js";

export default class Level1a extends MainGame {

    constructor ()
    {
        super('Level1a');

        this.fruits;

        this.circles = new Array(16);
        this.set = []; //just holds the selected fruits
        this.required = []; //holds the required for AND operations

        this.win = false;

        this.selectedFruit = null;
        
        //solution var
        this.score = 0;
        this.highscore = 0;
        this.scoreText;

        this.timer; 
        this.timerText;
    }

    start ()
    {
        this.score = 0;
        this.set = []
        this.required =[]
        this.win = false

        //this.timer = this.time.addEvent({ delay: 30000, callback: this.gameOver, callbackScope: this });

        this.sound.play('countdown', { delay: 27 });
    }

    create ()
    {
        this.add.image(400, 300, 'background');

        // generates selection circles
        for(let i = 0; i < 16; i++){
            this.circles[i] = this.add.circle(0, 0, 42).setStrokeStyle(3, 0xf8960e);
            this.circles[i].setVisible(false);
        }

        //  Create a 4x4 grid aligned group to hold our sprites

        this.fruits = this.add.group({
            key: 'fruits',
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

        this.timerText = this.add.text(20, 20, 'Red AND Apple', fontStyle);
        this.scoreText = this.add.text(300, 20, 'Hover here to End game', fontStyle);
        this.scoreText.setInteractive({ useHandCursor: true});    
        this.scoreText.on('pointerover', () => this.gameOver(), this)

        let children = this.fruits.getChildren();

        children.forEach((child) => {

            child.setInteractive();
            child.on('gameobjectdown', this.selectFruit, this)
        });

        this.input.on('gameobjectdown', this.selectFruit, this);
        //this.input.once('pointerdown', this.start, this);

        this.highscore = this.registry.get('highscore');

        this.arrangeGrid();
    }

    arrangeGrid ()
    {
        //  We need to make sure there is only one pair in the grid

        let children = this.fruits.getChildren();

        let a = Math.floor(Math.random()*15)
        let b = a
        while (b == a) {
            b = Math.floor(Math.random()*15)
        }
        // boolean expression is pick red and apple
        children[a].setFrame('redapple.png')
        children[b].setFrame('redapple.png')
        this.required.push(a)
        this.required.push(b)

        for (let i = 0; i < 16; i++)
        {
            if (i != a && i != b) {
                children[i].setFrame(this.game.config.colors[Math.floor((5*Math.random()))] + this.game.config.fruits[Math.floor((4*Math.random()))] +'.png')
                    if (children[i].frame.customData.color == 'red' && children[i].frame.customData.fruit == 'apple')
                        this.required.push(i)
            }
        }

        //  Stagger tween them all in
        this.tweens.add({
            targets: children,
            scale: { start: 0, from: 0, to: 1 },
            ease: 'bounce.out',
            duration: 600,
            delay: this.tweens.stagger(100, { grid: [ 4, 4 ], from: 'center' })
        });
    }

    checkSolution() {
        let children = this.fruits.getChildren()
        for (let i = 0; i < this.set.length; i++) {
            let e = this.set[i]
            if (!(children[e].frame.customData.color == 'red' && children[e].frame.customData.fruit == 'apple')) {
                console.log("x")
                return false
            }
        }
        return true
    }

    checkSolutionAND() {
        console.log(this.required)
        for (let i = 0; i < this.required.length; i++) {
            let e = this.required[i]
            if (!(this.set.includes(e))) {
                console.log(this.set, e)
                return false
            }
        }
        return true
    }

    gameOver ()
    {
        let win = (this.checkSolution() && this.checkSolutionAND())
        //  Show them where the match actually was
        this.input.off('gameobjectdown', this.selectFruit, this);
        if (win) {
            this.win = true;
            alert('you won')

            let circledance = []
            for (let i = 0; i < this.set.length; i++){
                circledance.push(this.circles[this.set[i]])
            }

            this.score = 0;
            this.set = []
            this.required =[]
            this.win = false

            this.tweens.add({
                targets: circledance,
                alpha: 0,
                yoyo: true,
                repeat: 2,
                duration: 250,
                ease: 'sine.inout',
                onComplete: () => {
                    this.input.once('pointerdown', () => {
                        //this.scene.start('Level1b'); 
                        this.scene.start('MainMenu');   
                            //placeholder scene  
                    }, this);

                }
            });
        }
        else {
            this.score = 0;
            this.set = []
            this.required =[]
            this.win = false
            alert('you lost')
            this.input.once('pointerdown', () => {
                this.scene.start('MainMenu');   
            }, this);
        }
        
        

        //console.log(this.score, this.highscore);

        
    }
}