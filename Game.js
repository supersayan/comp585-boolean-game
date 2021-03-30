import { OPER, ATTR, createUniqueExpressions, getBooleanArrayIndexOfItem } from './Eval.js';

export default class MainGame extends Phaser.Scene {

    constructor (str) {

        if (str == undefined ) {
            super('MainGame');
        } else {
            super(str)
        }
        
        // with the level number, create the expressions, evaluations, strings
        this.level = 1;
        this.expressionCounter = 0; // iterates every new round
        let levelParams = pickLevelParameters[this.level];
        this.attributes = levelParams.attributes;
        this.numExpressions = levelParams.numExpressions;
        let evalOutput = createUniqueExpressions(levelParams.numFeatures, levelParams.numExpressions, levelParams.attributes, levelParams.operators);
        this.expressions = evalOutput.expressions;
        this.evaluations = evalOutput.evaluations;
        this.strings = evalOutput.strings;

        this.items; // phaser group
        this.itemAttributes; // store array of attribute:feature objects for each item
        this.circles = new Array(16);
        this.selection = []; //just holds the selected items
        this.solution = []; //holds the required for AND operations

        this.win = false;

        this.selectedItem = null;
        
        //solution var
        this.score = 0;
        this.highscore = 0;
        this.submitText;

        this.timer; 
        this.timerText;
    }

    create () {
        this.add.image(400, 300, 'background');

        // generates selection circles
        for(let i = 0; i < 16; i++){
            this.circles[i] = this.add.circle(0, 0, 42).setStrokeStyle(3, 0xf8960e);
            this.circles[i].setVisible(false);
        }

        //  Create a 4x4 grid aligned group to hold our sprites

        this.items = this.add.group({
            key: 'items',
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
        //let sprite = this.add.sprite(200,20,"items","redapple.png")
        //sprite.tint = 0x000000;
        this.itemtext = this.add.text(110, 85, this.goal12, fontStyle3);
        this.timerText = this.add.text(20, 0, this.goal21 + `   =`, fontStyle2);     
        this.colorrect = this.add.rectangle(150, 20, 30, 30, 0xFF0000)
        this.colorrect.setStrokeStyle(2,0x000000);
        this.timerText2 = this.add.text(70, 45, 'AND', fontStyle3);
        this.timerText2.setColor('#32CD32');
        this.timerText = this.add.text(20, 90, this.goal11 + '   =', fontStyle2);
        this.rect = this.add.rectangle(478, 55, 125, 50,0x55ffff);
        this.rect.setStrokeStyle(2,0x000000);
        this.submitText = this.add.text(410, 20, 'Submit', fontStyle);
        this.submitText.setInteractive({ useHandCursor: false});    
        this.submitText.once('pointerdown', () => {
            this.tweens.add({
                targets: [this.submitText, this.rect],
                alpha: {start: 1, to: 0.75},
                y: '+=5',
                ease: 'Elastic.out',
                duration: 100,
                onComplete: () => {
                    this.tweens.add({
                        targets:this.winText,
                        alpha: {start: 0, to:1}
                    
                    })
                    this.submitText.disableInteractive();
                }
            })
            this.gameOver()
        }, this)
        this.winText = this.add.text(550, 20, 'You Won!', fontStyle);

        this.winText.setAlpha(0);
        this.loseText = this.add.text(550, 20, 'You Lost...', fontStyle);
        
        //this.loseText.setVisible(false);
        this.loseText.setAlpha(0);

        let children = this.items.getChildren();

        children.forEach((child) => {

            child.setInteractive();
            child.on('gameobjectdown', this.selectItem, this)
        });

        this.input.on('gameobjectdown', this.selectItem, this);
        //this.input.once('pointerdown', this.start, this);

        this.highscore = this.registry.get('highscore');

        this.arrangeGrid();
    }


    selectItem(pointer, item) {
        let x = item.x
        let y = item.y
        console.log('index is: ', xyConvertToIndex(x,y))
        let index = xyConvertToIndex(x,y);
        if (pointer.leftButtonDown()) {
            //console.log('emoji positions are: ', emoji.x, emoji.y)
            
            //  Checks if selected object is in selection pool
            if (!this.circles[index].visible)
            {
                this.circles[index].setPosition(x,y);
                this.selection.push(xyConvertToIndex(x,y)) //pushes selection
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
            let children = this.items.getChildren();
            let a = children[index].frame.customData.item;
            let b = children[index].frame.customData.color;
            this.proptext = this.add.text(20, 200, 'Properties: ', fontStyle);
            this.proptext2 = this.add.text(20, 230, `Item = ${a}`, fontStyle);
            this.proptext3 = this.add.text(20, 260, `Color = ${b}`, fontStyle);
        }
    }

    arrangeGrid () {
        let children = this.items.getChildren();

        // randomly generate items
        for (let i = 0; i < 16; i++) {
            let item = [];
            let itemJSON = {};
            // for each attribute generate a random feature from those available and add it to item
            for (let a = 0; a < this.attributes.length; a++) {
                let attr = Object.keys(this.attributes[a]);
                let itemattr = {};
                itemattr[attr] = this.attributes[a][attr][Math.floor(this.attributes[a][attr].length * Math.random())];
                item.push(itemattr);
                itemJSON[attr] = itemattr[attr];
            }
            // if the generated item is part of solution, add its index to this.solution
            if (this.evaluations[expressionCounter][getBooleanArrayIndexOfItem(item, this.attributes)]) {
                this.solution.push(i);
            }
            
            let shape = 0;
            if ("SHAPE" in itemJSON) {
                shape = ATTR["SHAPE"].indexOf(itemJSON["SHAPE"]);
            }
            let color = 0;
            if ("COLOR" in itemJSON) {
                color = ATTR["COLOR"].indexOf(itemJSON["COLOR"]);
            }
            let pattern = 0;
            if ("PATTERN" in itemJSON) {
                pattern = ATTR["PATTERN"].indexOf(itemJSON["PATTERN"]);
            }
            let border = 0;
            if ("BORDER" in itemJSON) {
                border = ATTR["BORDER"].indexOf(itemJSON["BORDER"]);
            }
            // sprite x = 100 * color
            // sprite y = 100 * (5 * pattern + shape)
            // border x = 100 * border
            // border y = 2500 + 100 * shape
            
            // children[i].setFrame('.png')
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

    newRound () {
        this.selection = []
        this.win = false
        if (this.expressionCounter < this.numExpressions - 1) {
            this.expressionCounter++;
        } else {
            // end level
        }

        this.submitText.setText('Submit');

        //  Stagger tween them all out
        this.tweens.add({
            targets: this.items.getChildren(),
            scale: 0,
            ease: 'power2',
            duration: 600,
            delay: this.tweens.stagger(100, { grid: [ 4, 4 ], from: 'center' }),
            onComplete: () => this.arrangeGrid()
        });
    }

    checkSolution() {
        let selection = this.selection[i];

        // if index arrays solution and selection are equal, return true
        for (let i = 0; i < this.selection.length; i++) {
            if (!solution.includes(selection[i])) {
                return false;
            }
        }
        for (let i = 0; i < this.solution.length; i++) {
            if (!selection.includes(solution[i])) {
                return false;
            }
        }

        return true;
    }

    gameOver () {
        let win = (this.checkSolution())
        
        this.input.off('gameobjectdown', this.selectItem, this);
        if (win) {
            this.win = true;
            //alert('you won')
            //this.winText.setVisible(true);
            this.winText.setColor('#FFD700')
            let circledance = []
            for (let i = 0; i < this.selection.length; i++){
                circledance.push(this.circles[this.selection[i]])
            }

            this.score = 0;
            this.selection = []
            this.solution =[]
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
                            this.input.off('gameobjectdown', this.selectItem, this);
                            this.scene.start('MainGame');   
                        } else if (pointer.rightButtonDown()) {
                            this.input.once('gameobjectdown', this.selectItem, this);
                        }
                    }, this);

                }
            });
        }
        else {
            this.score = 0;
            this.selection = [];
            this.solution = [];
            this.win = false;
            this.winText = this.loseText;
            this.winText.setColor('#FF0000')
            //this.loseText.setVisible(true);
            //alert('you lost')
            //Timeout is needed so that the click to submit doesn't count for going to the main menu
            setTimeout(() => {this.input.on('pointerdown', (pointer) => {
                if (pointer.leftButtonDown()) { 
                    this.input.off('gameobjectdown', this.selectItem, this);
                    this.scene.start('MainMenu');   
                } else if (pointer.rightButtonDown()) {
                    this.input.once('gameobjectdown', this.selectItem, this);
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

const pickLevelParameters = {
    1: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"]},
        ],
        operators: ["AND"],
        numFeatures: 2,
        numExpressions: 10,
    },
    2: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"]},
        ],
        operators: ["OR"],
        numFeatures: 2,
        numExpressions: 10,
    },
    3: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"]},
            {"PATTERN": ["PLAIN", "STRIPED", "SPOTS", "LATTICE", "SWIRL"]},
        ],
        operators: ["AND", "OR"],
        numFeatures: 3,
        numExpressions: 10,
    },
}