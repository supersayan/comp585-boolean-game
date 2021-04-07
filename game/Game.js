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
        this.currentRound = 0; // iterates every new round
        let levelParams = pickLevelParameters[this.level];
        this.attributes = levelParams.attributes;
        this.numRounds = levelParams.numExpressions;
        let evalOutput = createUniqueExpressions(levelParams.numExpressions, levelParams.numFeatures, levelParams.attributes, levelParams.operators, levelParams.makeFeaturesDifferentAttributes);
        this.expressions = evalOutput.expressions;
        this.evaluations = evalOutput.evaluations;
        this.strings = evalOutput.strings;
        this.items; // phaser group
        this.itemsBorders;
        this.itemAttributes; // store array of attribute:feature objects for each item

        //added variables so we don't need to do multiple level .js
        // this.goal11 = 'Color';
        // this.goal12 = 'red';
        // this.goal21 = 'Pattern';
        // this.goal22 = 'plain';
        // this.goal31 = 'Shape';
        // this.goal32 = 'square';

        //new things for the display
        this.goal1;
        this.goal2;
        this.goal3;

        this.circles = new Array(16);

        // this.selection = []; //just holds the selected items
        // this.solution = []; //holds the required for AND operations
        // this.win = false;

        this.selectedItem = null;
        
        //solution var
        this.score = 0;
        this.highscore = 0;
        this.submitText;
        this.expressionText;
    }

    create () {
        this.add.image(400, 300, 'background');

        this.selection = [];
        this.solution = [];
        this.goal1 = this.expressions[this.currentRound][0];
        this.goal1.value = this.goal1[Object.keys(this.goal1)];
        this.goal2 = this.expressions[this.currentRound][2];
        this.goal2.value = this.goal2[Object.keys(this.goal2)];
        if(this.expressions[this.currentRound][3] != undefined){
            this.goal3 = this.expressions[this.currentRound][4];
            this.goal3.value = this.goal3[Object.keys(this.goal3)];
        }
        console.log(this.expressions[this.currentRound]);
        this.goal1sprite = this.add.sprite(20, 50, "attributes", getSprite(this.goal1.value));
        this.expressionText = this.add.text(40, 30, this.expressions[this.currentRound][1], fontStyle2);
        this.goal2sprite = this.add.sprite(120, 50, "attributes", getSprite(this.goal2.value));
        this.goal1sprite.setScale(0.4);
        this.goal1sprite.depth = 1;
        this.goal2sprite.setScale(0.4);
        this.goal2sprite.depth = 1;
        this.expressionText.depth = 1;

        if(this.expressions[this.currentRound][3] != undefined){
            this.goal3sprite = this.add.sprite(220,50, "attributes", getSprite(this.goal3.value));
            this.expressionText2 = this.add.text(140, 30, this.expressions[this.currentRound][3], fontStyle2);
            this.goal3sprite.setScale(0.4);
            this.goal3sprite.depth = 1;
            this.expressionText2.depth = 1;
        }
        this.win = false;

        // generates selection circles
        
        for(let i = 0; i < 16; i++){
            this.circles[i] = this.add.circle(0, 0, 60).setStrokeStyle(3, 0xf8960e);
            this.circles[i].depth = 1;
            this.circles[i].setVisible(false);
        }

        //  Create a 4x4 grid aligned group to hold our sprites

        this.items = this.add.group({
            key: 'shapes',
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

        this.itemsBorders = this.add.group({
            key: 'shapes',
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

        

        this.rect3 = this.add.rectangle(0,0, 1600, 250, 0x0000FF, 0.4);
        //let sprite = this.add.sprite(200,20,"items","redapple.png")
        //sprite.tint = 0x000000;
        // this.itemtext = this.add.text(110, 85, this.goal12, fontStyle3);
        // this.timerText = this.add.text(20, 0, this.goal21 + `   =`, fontStyle2);
        // this.colorrect = this.add.rectangle(150, 20, 30, 30, 0xFF0000)
        // this.colorrect.setStrokeStyle(2,0x000000);
        // this.timerText2 = this.add.text(70, 45, 'AND', fontStyle3);
        // this.timerText2.setColor('#32CD32');
        // this.timerText = this.add.text(20, 90, this.goal11 + '   =', fontStyle2);

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
            this.submitSelection()
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
                this.selection = this.selection.filter((value, index, array) => {
                    // console.log(value);
                    return value != xyConvertToIndex(x,y);
                })
            }
        } else if (pointer.rightButtonDown()) { //displays properties
            
            this.game.canvas.oncontextmenu = (e) => {
                e.preventDefault()
            }
            //this.add.rectangle(20, 250, 150, 100, 0xFF0000);
            if (this.proptext != undefined) {
                // this.proptext.destroy();
                // this.proptext2.destroy();
                // this.proptext3.destroy();
                // this.proptext4.destroy();
                for (let i=0; i<this.proptext.length; i++) {
                    this.proptext[i].destroy();
                }
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
            // let a = children[index].frame.customData.item;
            // let b = children[index].frame.customData.color;
            // let c = children[index].frame.customData.pattern;
            this.proptext = [];
            this.proptext[0] = this.add.text(20, 200, 'Properties: ', fontStyle);
            // this.proptext2 = this.add.text(20, 230, `Item = ${a}`, fontStyle);
            // this.proptext2 = this.add.text(20, 230, `Shape = ${a}`, fontStyle);
            // this.proptext3 = this.add.text(20, 260, `Color = ${b}`, fontStyle);
            // this.proptext4 = this.add.text(20, 290, `Pattern = ${c}`, fontStyle);
            for (let i=0; i<this.itemAttributes[index].length; i++) {
                this.proptext[i+1] = this.add.text(20, 230 + 30*i, Object.keys(this.itemAttributes[index][i])[0] + " = " + Object.values(this.itemAttributes[index][i])[0], fontStyle);
            }
        }
    }


    arrangeGrid () {
        //TODO: add items guaranteed to be part of solution
        // console.log(this.strings[this.currentRound]); //TODO: fix expression display going under submit button
        let children = this.items.getChildren();
        let childrenBorder = this.itemsBorders.getChildren();
        this.itemAttributes = [];
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
            this.itemAttributes.push(item);
            // if the generated item is part of solution, add its index to this.solution
            if (this.evaluations[this.currentRound][getBooleanArrayIndexOfItem(item, this.attributes)]) {
                for (let i = 0; i < this.attributes.length; i++) {

                }
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

            // or use lowercase itemJSON["SHAPE"] etc.
            
            // console.log(pattern);
            // console.log(ATTR["PATTERN"][pattern]);
            // console.log(ATTR["COLOR"][color].toLowerCase() + ATTR["PATTERN"][pattern].toLowerCase() + ATTR["SHAPE"][shape].toLowerCase() + '.png');
            children[i].setFrame(ATTR["COLOR"][color].toLowerCase() + ATTR["PATTERN"][pattern].toLowerCase() + ATTR["SHAPE"][shape].toLowerCase() + '.png');
            childrenBorder[i].setFrame(ATTR["BORDER"][border].toLowerCase() + "border" + ATTR["SHAPE"][shape].toLowerCase() + ".png");
        }
        // console.log(this.solution);

        //  Stagger tween them all in
        this.tweens.add({
            targets: children,
            scale: { start: 0, from: 0, to: 1 },
            ease: 'bounce.out',
            duration: 600,
            delay: this.tweens.stagger(100, { grid: [ 4, 4 ], from: 'center' })
        });

        this.tweens.add({
            targets: childrenBorder,
            scale: { start: 0, from: 0, to: 1 },
            ease: 'bounce.out',
            duration: 600,
            delay: this.tweens.stagger(100, { grid: [ 4, 4 ], from: 'center' })
        });
    }

    newRound () {
        this.selection.forEach((e) => {
            this.circles[e].setVisible(false)
        })
        if (this.currentRound < this.numRounds - 1) {
            this.currentRound++;
        } else {
            // end level
        }
        this.selection = [];
        this.solution = [];
        this.expressionText.destroy();
        this.goal1 = this.expressions[this.currentRound][0];
        this.goal1.value = this.goal1[Object.keys(this.goal1)];
        this.goal2 = this.expressions[this.currentRound][2];
        this.goal2.value = this.goal2[Object.keys(this.goal2)];
        if(this.expressions[this.currentRound][3] != undefined){
            this.goal3 = this.expressions[this.currentRound][4];
            this.goal3.value = this.goal3[Object.keys(this.goal3)];
        }
        console.log(this.goal1.value);
        this.goal1sprite.setFrame(getSprite(this.goal1.value));
        this.expressionText = this.add.text(40, 30, this.expressions[this.currentRound][1], fontStyle2);
        this.goal2sprite.setFrame(getSprite(this.goal2.value));

        if(this.expressions[this.currentRound][3] != undefined){
            this.goal3sprite = this.add.sprite(220,50, "attributes", getSprite(this.goal3.value));
            this.expressionText2 = this.add.text(140, 30, this.expressions[this.currentRound][3], fontStyle2);
            this.goal3sprite.setScale(0.4);
            this.goal3sprite.depth = 1;
            this.expressionText2.depth = 1;
        }
        this.win = false;

        //this.input.on('gameobjectdown', this.selectItem, this);
        this.submitText.setInteractive({ useHandCursor: false});   

        // this.submitText.setText('Submit');

        //  Stagger tween them all out
        this.tweens.add({
            targets: this.items.getChildren(),
            scale: 0,
            ease: 'power2',
            duration: 600,
            delay: this.tweens.stagger(100, { grid: [ 4, 4 ], from: 'center' }),
            onComplete: () => {
                this.arrangeGrid()
                this.winText.setAlpha(0);
                let children = this.items.getChildren();
                console.log(children)
                children.forEach((child) => {
                    child.setInteractive();
                    child.on('gameobjectdown', this.selectItem, this)
                });
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
                    this.submitSelection()
                }, this)
            }
        });

        this.tweens.add({
            targets: this.itemsBorders.getChildren(),
            scale: 0,
            ease: 'power2',
            duration: 600,
            delay: this.tweens.stagger(100, { grid: [ 4, 4 ], from: 'center' }),
            onComplete: () => this.arrangeGrid()
        });

        // TODO: display new expression
    }

    checkSolution() {
        console.log(this.solution, this.selection);
        // if index arrays solution and selection are equal, return true
        for (let i = 0; i < this.selection.length; i++) {
            if (!this.solution.includes(this.selection[i])) {
                return false;
            }
        }
        for (let i = 0; i < this.solution.length; i++) {
            if (!this.selection.includes(this.solution[i])) {
                return false;
            }
        }

        return true;
    }

    submitSelection () {
        let win = (this.checkSolution())
        console.log(win);
        
        this.input.off('gameobjectdown', this.selectItem, this);
        if (win) {
            this.win = true;
            this.winText.setVisible(true);
            this.winText.setColor('#FFD700')
            let circledance = []
            for (let i = 0; i < this.selection.length; i++){
                circledance.push(this.circles[this.selection[i]])
            }

            this.score = 0;
            this.win = false

            this.tweens.add({
                targets: circledance,
                alpha: 0,
                yoyo: true,
                repeat: 2,
                duration: 250,
                ease: 'sine.inout',
                onComplete: () => {
                    let counter = 0;
                    this.input.on('pointerdown', (pointer) => {     
                        if (pointer.leftButtonDown()) { 
                            this.input.off('gameobjectdown', this.selectItem, this);
                            //this.scene.start('MainGame');
                            if (counter == 0)
                                this.newRound();
                            else {
                                this.input.once('gameobjectdown', this.selectItem, this);
                            }
                            counter++;
                        } else if (pointer.rightButtonDown()) {
                            this.input.once('gameobjectdown', this.selectItem, this);
                        }
                    }, this);

                }
            });
        } else {
            // if incorrect submission, should not do anything, allow to keep trying until correct
            this.score = 0;
            this.win = false;
            this.winText = this.loseText;
            this.winText.setColor('#FF0000');
            this.winText.setVisible(true);


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
    x = (x-270)/120
    y = (y-190)/120
    return x+4*y
}

function getSprite(attribute) {
    switch (attribute) {
        case "SQUARE":
            return "square.png";
        case "TRIANGLE":
            return "triangle.png";
        case "BLACK":
            return "attributes-15.png";
        case "BRONZE":
            return "attributes-16.png";
        case "SILVER":
            return "attributes-17.png";
        case "GOLD":
            return "attributes-18.png";
        case "LIGHTBLUE":
            return "attributes-19.png";
        case "CIRCLE":
            return "circle.png";
        case "PENTAGON":
            return "pentagon.png";
        case "TRAPEZOID":
            return "trapezoid.png";
        case "RED":
            return "red.png";
        case "ORANGE":
            return "orange.png";
        case "GREEN":
            return "green.png";
        case "BLUE":
            return "blue.png";
        case "PURPLE":
            return "purple.png";
        case "PLAIN":
            return "plain.png";
        case "STRIPED":
            return "striped.png";
        case "SPOTTED":
            return "spotted.png";
        case "NET":
            return "lattice.png";
        case "SPIRAL":
            return "swirl.png";
    }
}

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

const pickLevelParameters = {
    1: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"]},
            //{"BORDER": ["BLACK", "BRONZE", "SILVER", "GOLD", "LIGHTBLUE"]}
        ],
        operators: ["AND"],
        numFeatures: 2,
        numExpressions: 10,
        makeFeaturesDifferentAttributes: true,
    },
    2: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"]},
        ],
        operators: ["OR"],
        numFeatures: 2,
        numExpressions: 10,
        makeFeaturesDifferentAttributes: false,
    },
    3: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"]},
            {"PATTERN": ["PLAIN", "STRIPED", "SPOTTED", "NET", "SPIRAL"]}, 
        ],
        operators: ["AND", "OR"],
        numFeatures: 3,
        numExpressions: 10,
        makeFeaturesDifferentAttributes: false,
    },
}