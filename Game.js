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

    create ()
    {
        console.log('x');
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

        this.timerText = this.add.text(20, 20, '30:00', fontStyle);
        this.scoreText = this.add.text(530, 20, 'Hover here to End game', fontStyle);
        //this.scoreText.setInteractive({ useHandCursor: true});    
        this.scoreText.on('pointerdown', () => this.gameOver(), this)

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

    start ()
    {
        this.score = 0;
        this.set = []
        this.win = false

        //this.timer = this.time.addEvent({ delay: 30000, callback: this.gameOver, callbackScope: this });

        this.sound.play('countdown', { delay: 27 });
    }

    selectFruit(pointer, fruit)
    {
        //console.log('emoji positions are: ', emoji.x, emoji.y)
        let x = fruit.x
        let y = fruit.y
        console.log('index is: ', xyConvertToIndex(x,y))
        let index = xyConvertToIndex(x,y);
        //  Checks if selected object is in selection pool
        if (!this.circles[index].visible)
        {
            this.circles[index].setPosition(x,y);
            this.set.push(xyConvertToIndex(x,y)) //pushes selection
            this.circles[index].setVisible(true);
        } else {
            this.circles[index].setVisible(false);
        }
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

    arrangeGrid ()
    {
    }

    checkSolution() {
        return true
    }

    gameOver ()
    {
        let win = this.checkSolution()
        //  Show them where the match actually was
        if (win) {
            this.win = true;
            alert('you won')
        }
        else {
            this.win = false;
            alert('you lost')
        }
        
        this.input.off('gameobjectdown', this.selectFruit, this);

        //console.log(this.score, this.highscore);
        let circledance = [this.circles[0]]
        console.log(circledance)
        for (let i = 0; i < this.set.length; i++){
            circledance.push(this.circles[this.set[i]])
        }
        console.log(circledance)
        this.tweens.add({
            targets: circledance,
            alpha: 0,
            yoyo: true,
            repeat: 2,
            duration: 250,
            ease: 'sine.inout',
            onComplete: () => {
                this.input.once('pointerdown', () => {
                    this.scene.start('MainMenu');
                }, this);

            }
        });
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
