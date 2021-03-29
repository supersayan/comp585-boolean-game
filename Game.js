// test comment for a commit
// another test comment for a commit
export default class MainGame extends Phaser.Scene
{
    constructor (str)
    {

        if (str == undefined ) {
            super('MainGame');
        } else {
            super(str)

        }  
        this.fruits;

        //added variables so we don't need to do multiple level .js
        this.goal11 = 'Fruit';
        this.goal12 = 'apple';
        this.goal21 = 'Color';
        this.goal22 = 'red';

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
        this.fruittext = this.add.text(110, 85, this.goal12, fontStyle3);
        this.timerText = this.add.text(20, 0, this.goal21 + `   =`, fontStyle2);     
        this.colorrect = this.add.rectangle(150, 20, 30, 30, 0xFF0000)
        this.colorrect.setStrokeStyle(2,0x000000);
        this.timerText2 = this.add.text(70, 45, 'AND', fontStyle3);
        this.timerText2.setColor('#32CD32');
        this.timerText = this.add.text(20, 90, this.goal11 + '   =', fontStyle2);
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
                    this.scoreText.disableInteractive();
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


    selectFruit(pointer, fruit)
    {
        let x = fruit.x
        let y = fruit.y
        console.log('index is: ', xyConvertToIndex(x,y))
        let index = xyConvertToIndex(x,y);
        if (pointer.leftButtonDown()) {
            //console.log('emoji positions are: ', emoji.x, emoji.y)
            
            //  Checks if selected object is in selection pool
            if (!this.circles[index].visible)
            {
                this.circles[index].setPosition(x,y);
                this.set.push(xyConvertToIndex(x,y)) //pushes selection
                this.circles[index].setVisible(true);
            } else {
                this.circles[index].setVisible(false);
            }
        } else if (pointer.rightButtonDown()) { //displays properties
            
            this.game.canvas.oncontextmenu = (e) => {
                e.preventDefault()
            }
            //this.add.rectangle(20, 250, 150, 100, 0xFF0000);
            if (this.proptext != undefined) {
                this.proptext.destroy();
                this.proptext2.destroy();
                this.proptext3.destroy();
            }
            const fontStyle = {
                fontFamily: 'Arial',
                fontSize: 20,
                color: '#ffffff',
                fontStyle: 'bold',
                padding: 4,
                shadow: {
                    color: '#000000',
                    fill: true,
                    offsetX: 2,
                    offsetY: 2,
                    blur: 4
                }
            };      
            let children = this.fruits.getChildren();
            let a = children[index].frame.customData.fruit;
            let b = children[index].frame.customData.color;
            this.proptext = this.add.text(20, 200, 'Properties: ', fontStyle);
            this.proptext2 = this.add.text(20, 230, `Fruit = ${a}`, fontStyle);
            this.proptext3 = this.add.text(20, 260, `Color = ${b}`, fontStyle);
        }
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
        // rework this to make it more general
        children[a].setFrame(this.goal22 + this.goal12 + '.png')
        children[b].setFrame(this.goal22 + this.goal12 + '.png')
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

    checkSolution() {
        let children = this.fruits.getChildren()
        for (let i = 0; i < this.set.length; i++) {
            let e = this.set[i]
            if (!(children[e].frame.customData.color == 'red' && children[e].frame.customData.fruit == 'apple')) {
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
        let win = (this.checkSolutionAND() && this.checkSolution())
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
                    this.input.on('pointerdown', (pointer) => {     
                        if (pointer.leftButtonDown()) { 
                            this.input.off('gameobjectdown', this.selectFruit, this);
                            this.scene.start('MainGame');   
                        } else if (pointer.rightButtonDown()) {
                            this.input.once('gameobjectdown', this.selectFruit, this);
                        }
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
            setTimeout(() => {this.input.on('pointerdown', (pointer) => {
                if (pointer.leftButtonDown()) { 
                    this.input.off('gameobjectdown', this.selectFruit, this);
                    this.scene.start('MainMenu');   
                } else if (pointer.rightButtonDown()) {
                    this.input.once('gameobjectdown', this.selectFruit, this);
                } 
            }, this)}, 100);
            
        }
   }
}

function xyConvertToIndex(x,y) {
    x = (x-275)/120
    y = (y-152.5)/120
    return x+4*y
}


/** 
function checkSolution(select,sol) {
    //assume solution is true until a case is found where it isn't
    let correctSelect = true;
    //create the answer set based on which ones are correct
    let answer = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
    for (let i = 0; i < sol.length; i++) {
        answer[sol[i]] = true;
    }
    //compare answer to selection
    for (let i = 0; i < select.length; i++) {
        if (select[i] != answer[i]) {
            correctSelect = false;
        }
    }

    return correctSelect;
}
*/
