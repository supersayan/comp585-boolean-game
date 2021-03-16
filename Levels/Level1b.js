import MainGame from "../Game.js";

export default class Level1b extends MainGame {

    constructor ()
    {
        super('Level1b');

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
        this.win = false

        //this.timer = this.time.addEvent({ delay: 30000, callback: this.gameOver, callbackScope: this });

        this.sound.play('countdown', { delay: 27 });
    }

    newRound ()
    {
        this.set = []
        this.win = false

        this.scoreText.setText('Submit');

        //  Stagger tween them all out
        this.tweens.add({
            targets: this.fruits.getChildren(),
            scale: 0,
            ease: 'power2',
            duration: 600,
            delay: this.tweens.stagger(100, { grid: [ 4, 4 ], from: 'center' }),
            onComplete: () => this.arrangeGrid()
        });
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

        const fontStyle2 = {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff',
            fontStyle: 'bold',
            padding: 8,
            shadow: {
                color: '#000000',
                fill: true,
                offsetX: 2,
                offsetY: 2,
                blur: 4
            }
        };

        const fontStyle3 = {
            fontFamily: 'Impact',
            fontSize: 25,
            color: '#ffffff',
            padding: 6,
            shadow: {
                color: '#000000',
                fill: true,
                offsetX: 1,
                offsetY: 1,
                blur: 1
            }
        };

        this.rect3 = this.add.rectangle(0,0, 1600, 250, 0x0000FF, 0.4);
        //let sprite = this.add.sprite(200,20,"fruits","redapple.png")
        //sprite.tint = 0x000000;
        this.fruittext = this.add.text(110, 85, 'strawberry', fontStyle3);
        this.timerText = this.add.text(20, 0, `Color   =`, fontStyle2);     
        this.colorrect = this.add.rectangle(150, 20, 30, 30, 0x808080)
        this.colorrect.setStrokeStyle(2,0x000000);
        this.timerText2 = this.add.text(70, 45, 'AND', fontStyle3);
        this.timerText2.setColor('#32CD32');
        this.timerText = this.add.text(20, 90, 'Fruit   =', fontStyle2);
        this.rect = this.add.rectangle(478, 55, 125, 50,0x55ffff);
        this.rect.setStrokeStyle(2,0x000000);
        this.scoreText = this.add.text(410, 20, 'Submit', fontStyle);
        this.scoreText.setInteractive({ useHandCursor: false});    
        this.scoreText.once('pointerdown', () => {
            this.tweens.add({
                targets: [this.scoreText, this.rect],
                alpha: {start: 1, to: 0.75},
                y: '+=5',
                ease: 'Elastic.out',
                duration: 100,
                onComplete: () => {
                    this.tweens.add({
                        targets:this.winText,
                        alpha: {start: 0, to:1}
                    })
                }
            })
            this.gameOver()
        }, this)
        this.winText = this.add.text(550, 20, 'You Won!', fontStyle);

        this.winText.setAlpha(0);
        this.loseText = this.add.text(550, 20, 'You Lost...', fontStyle);
        
        //this.loseText.setVisible(false);
        this.loseText.setAlpha(0);

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
        children[a].setFrame('graystrawberry.png')
        children[b].setFrame('graystrawberry.png')
        this.required.push(a)
        this.required.push(b)

        for (let i = 0; i < 16; i++)
        {
            if (i != a && i != b) {
                children[i].setFrame(this.game.config.colors[Math.floor((5*Math.random()))] + this.game.config.fruits[Math.floor((4*Math.random()))] +'.png')
                    if (children[i].frame.customData.color == 'gray' && children[i].frame.customData.fruit == 'strawberry')
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
            if (!(children[e].frame.customData.color == 'gray' && children[e].frame.customData.fruit == 'strawberry')) {
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
        let win = (this.checkSolutionAND())
        //  Show them where the match actually was
        this.input.off('gameobjectdown', this.selectFruit, this);
        if (win) {
            this.win = true;
            //alert('you won')
            //this.winText.setVisible(true);
            this.winText.setColor('#FFD700')
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
                        this.scene.start('Level1c');   
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
            this.winText = this.loseText;
            this.winText.setColor('#FF0000')
            //this.loseText.setVisible(true);
            //alert('you lost')
            //Timeout is needed so that the click to submit doesn't count for going to the main menu
            setTimeout(() => {this.input.once('pointerdown', () => {
                this.scene.start('MainMenu');   
            }, this);}, 100);
            
        }
        
        

        //console.log(this.score, this.highscore);

        
    }
}