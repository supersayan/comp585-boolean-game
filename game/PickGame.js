import { OPER, ATTR, createUniqueExpressions, getBooleanArrayIndexOfItem, getItemFromBooleanArrayIndex } from './Eval.js';

const GRID_WIDTH = 4;
const GRID_HEIGHT = 4;
const GRID_X = 280;
const GRID_Y = 180;
const GRID_CELLWIDTH = 120;
const GRID_CELLHEIGHT = 120;

export default class PickGame extends Phaser.Scene {

    // constructor -> init -> create

    constructor (str) {
        super('PickGame');

        this.expOperands;
        this.expOperators;
        this.expSize;
        this.expCompact;
        this.parentheses;
        this.parenthesesLength;
        // this.strings = evalOutput.strings;
        this.items; // phaser group
        this.itemsBorders;
        this.itemAttributes; // store array of attribute:feature objects for each item

        //new things for the display
        this.goal1;
        this.goal2;
        this.goal3;
        this.goal4;
    }

    init (data) {
        this.level = data.level;
        this.leveltext = this.add.text(0, 540, "", fontStyle);
        this.newLevel();
    }

    create () {
        // Circles that show when selecting
        this.circles = new Array(16);
        for(let i = 0; i < 16; i++){
            this.circles[i] = this.add.circle(0, 0, 60).setStrokeStyle(3, 0xf8960e);
            this.circles[i].depth = 1;
            this.circles[i].setPosition((i%GRID_WIDTH)*GRID_CELLWIDTH+GRID_X-10, Math.floor(i/GRID_WIDTH)*GRID_CELLHEIGHT+GRID_Y-10);
            this.circles[i].setVisible(false);
        }

        this.updateExpressionDisplay();
        createDisplay(this);


        
        this.win = false;

        //  Create a 4x4 grid aligned group to hold our sprites

        this.items = this.add.group({
            key: 'shapes',
            frameQuantity: 1,
            repeat: 15,
            gridAlign: {
                width: GRID_WIDTH,
                height: GRID_HEIGHT,
                cellWidth: GRID_CELLWIDTH,
                cellHeight: GRID_CELLHEIGHT,
                x: GRID_X,
                y: GRID_Y,
            },
            // setScale: {
            //     x: 0.5,
            //     y: 0.5,
            // }
        });
        // this.items.getChildren().setScale(0.5);
        // Phaser.Actions.SetScale(this.items, 0.5);
        // testing scale , none of above work
        this.itemsBorders = this.add.group({
            key: 'shapes',
            frameQuantity: 1,
            repeat: 15,
            gridAlign: {
                width: GRID_WIDTH,
                height: GRID_HEIGHT,
                cellWidth: GRID_CELLWIDTH,
                cellHeight: GRID_CELLHEIGHT,
                x: GRID_X,
                y: GRID_Y,
            }
        });

        // blue rectangle covering top of screen
        this.bgrect = this.add.rectangle(0,0, 1600, 210, 0x0000FF, 0.4);

        // submission button
        this.rect = this.add.rectangle(568, 55, 125, 50,0x55ffff);
        this.rect.setStrokeStyle(2,0x000000);
        this.submitText = this.add.text(500, 20, 'Submit', fontStyle);
        this.submitText.setInteractive({useHandCursor: true});
        //this.rect.depth = -1;
        //this.submitText = -1;

        // text that shows on submission
        this.winText = this.add.text(620, 20, 'Correct!', fontStyle);
        this.winText.setColor('#FFD700');
        this.winText.setAlpha(0);
        this.loseText = this.add.text(620, 20, 'Try Again', fontStyle);
        this.loseText.setColor('#FF0000');
        //this.loseText.setVisible(false);
        this.loseText.setAlpha(0);

        // Back Button
        this.back_arrow = this.add.image(760, 565, 'back_arrow').setScale(0.1);
        this.back_arrow.setInteractive({useHandCursor: true});
        this.back_arrow.once('pointerdown', () => {
            this.scene.start('LevelSelect');
        }, this);

        this.timetext = this.add.text(5, 510, "", fontStyle);
        // this.timetext.setStyle(fontStyle);
        this.timetext.setPadding(10);

        this.arrangeGrid();
        
        this.turnOnSelectEvent();
        this.turnOnSubmitEvent();

        this.starttime = new Date();
    }

    // loop
    update() {
        // update time text
        let currenttime = new Date();
        this.time = Math.min(Math.floor((currenttime - this.starttime) / 1000), 999);
        this.timetext.setText("Time: " + this.time);
    }

    turnOnSelectEvent() {
        this.items.getChildren().forEach((child) => {
            child.setInteractive({useHandCursor: true});
            child.on('pointerdown', this.selectItem, this);
        });
    }

    turnOffSelectEvent() {
        this.items.getChildren().forEach((child) => {
            child.off('pointerdown', this.selectItem, this);
        });
    }

    turnOnSubmitEvent() {
        this.submitText.once('pointerdown', () => { // one time listener
            this.tweens.add({
                targets: [this.submitText, this.rect],
                alpha: {start: 1, to: 0.75},
                y: '+=5',
                ease: 'Elastic.out',
                duration: 100,
            });
            this.submitSelection();
        }, this);
    }

    selectItem(pointer) {
        let x = pointer.worldX;
        let y = pointer.worldY;
        let index = xyConvertToIndex(x,y);
        if (index < 0 || index >= GRID_WIDTH * GRID_HEIGHT)
            return;
        if (pointer.leftButtonDown()) {
            //  Checks if selected object is in selection pool
            if (!this.circles[index].visible)
            {
                this.selection.push(index); //pushes selection
                this.circles[index].setVisible(true);
            } else {
                this.circles[index].setVisible(false);
                this.selection = this.selection.filter((value, index, array) => {
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

            // let children = this.items.getChildren();
            // let a = children[index].frame.customData.item;
            // let b = children[index].frame.customData.color;
            // let c = children[index].frame.customData.pattern;
            this.proptext = [];
            this.proptext[0] = this.add.text(10, 120, 'Properties: ', fontStyle2);
            for (let i=0; i<this.itemAttributes[index].length; i++) {
                this.proptext[i+1] = this.add.text(10, 150 + 30*i, Object.keys(this.itemAttributes[index][i])[0] + " = " + Object.values(this.itemAttributes[index][i])[0], fontStyle2);
            }
        }
    }

    arrangeGrid () {
        this.solution = [];
        let children = this.items.getChildren();
        let childrenBorder = this.itemsBorders.getChildren();
        this.itemAttributes = [];
        // presolved: ensure at least one item is part of solution
        let presolved = [];
        for (let i=0; i<this.evaluations[this.currentRound].length; i++) { // get all indices of correct items
            if (this.evaluations[this.currentRound][i]) {
                presolved.push(i);
            }
        }
        let presolvedGrid = []; // contains index of this grid for items which will be made to be part of solution
        presolvedGrid.push(Math.floor(16 * Math.random()));
        // randomly generate items
        for (let i = 0; i < 16; i++) {
            let item = [];
            let itemJSON = {};
            if (presolvedGrid.includes(i)) {
                item = getItemFromBooleanArrayIndex(presolved[Math.floor(presolved.length * Math.random())], this.attributes);
                for (let a=0; a<item.length; a++) {
                    itemJSON[Object.keys(item[a])[0]] = Object.values(item[a])[0];
                }
            } else {
                // for each attribute generate a random feature from those available and add it to item
                for (let a = 0; a < this.attributes.length; a++) {
                    let attr = Object.keys(this.attributes[a]);
                    let itemattr = {};
                    itemattr[attr] = this.attributes[a][attr][Math.floor(this.attributes[a][attr].length * Math.random())];
                    item.push(itemattr);
                    itemJSON[attr] = itemattr[attr];
                }
            }
            this.itemAttributes.push(item);
            // if the generated item is part of solution, add its index to this.solution
            if (this.evaluations[this.currentRound][getBooleanArrayIndexOfItem(item, this.attributes)]) {
                // for (let i = 0; i < this.attributes.length; i++) {

                // }
                // console.log(i, ": ", item);
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
            
            children[i].setFrame(ATTR["COLOR"][color].toLowerCase() + ATTR["PATTERN"][pattern].toLowerCase() + ATTR["SHAPE"][shape].toLowerCase() + '.png');
            childrenBorder[i].setFrame(ATTR["BORDER"][border].toLowerCase() + "border" + ATTR["SHAPE"][shape].toLowerCase() + ".png");
            // children[i].setScale(2, 2);
        }

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

    updateExpressionDisplay() {
        if (this.expressionString)
            this.expressionString.destroy();
        this.expressionString = this.add.text(5, 80, this.strings[this.currentRound], fontStyle3);
        this.expressionString.depth = 2;
        this.expressionString.setAlpha(0.7);
    }

    newRound () {
        // TODO: move all expression display code to a new function
        this.counter2 = 0;  
        this.selection.forEach((e) => {
            this.circles[e].setVisible(false)
        })
        if (this.currentRound < this.numRounds - 1) {
            this.currentRound++;
        } else {
            // end level
            // this.newLevel();
            this.scene.start("LevelSelect");
            return;
        }
        this.selection = [];
        console.log(this.expressions[this.currentRound]);
        console.log(this.strings[this.currentRound]);

        this.expressionText.destroy();
        if(this.goal3sprite == undefined){

        } else {
            this.goal3sprite.destroy();
        }
        if(this.expressionText2 == undefined){

        } else {
            this.expressionText2.destroy();
        }
        if(this.goal4sprite == undefined){

        } else {
            this.goal4sprite.destroy();
        }
        if(this.expressionText3 == undefined){

        } else {
            this.expressionText3.destroy();
        }
        createDisplay(this);

        this.win = false;

        //this.input.on('gameobjectdown', this.selectItem, this);
        // this.submitText.setInteractive({ useHandCursor: false});   

        // this.submitText.setText('Submit');

        //  Stagger tween shapes all out
        this.tweens.add({
            targets: this.items.getChildren(),
            scale: 0,
            ease: 'power2',
            duration: 600,
            delay: this.tweens.stagger(100, { grid: [ 4, 4 ], from: 'center' }),
            onComplete: () => {
                this.arrangeGrid();
                this.turnOnSelectEvent();
                this.turnOnSubmitEvent();
                this.winText.setAlpha(0);
                // let children = this.items.getChildren();
                // console.log(children);
                // children.forEach((child) => {
                //     child.setInteractive();
                    // child.on('gameobjectdown', this.selectItem, this);
                // });
            }
        });

        this.tweens.add({
            targets: this.itemsBorders.getChildren(),
            scale: 0,
            ease: 'power2',
            duration: 600,
            delay: this.tweens.stagger(100, { grid: [ 4, 4 ], from: 'center' }),
        });

        // TODO: display new expression
    }

    newLevel() {
        // if (this.level+1 in pickLevelParameters)
        //     this.level++;
        // else
        //     this.scene.start('LevelSelect');
        if (!(this.level in pickLevelParameters))
            throw new Error("invalid level");
        this.currentRound = 0; // iterates every new round
        let levelParams = pickLevelParameters[this.level];
        this.attributes = levelParams.attributes;
        this.numRounds = levelParams.numExpressions;
        let evalOutput = createUniqueExpressions(levelParams.numExpressions, levelParams.numFeatures, levelParams.attributes, levelParams.operators, levelParams.allowNullSet, levelParams.numNots);
        this.expressions = evalOutput.expressions;
        this.evaluations = evalOutput.evaluations;
        this.strings = evalOutput.strings;

        // display level number
        this.leveltext.setText("Level " + this.level, fontStyle);
        // this.leveltext.setStyle(fontStyle);
    }

    checkSolution() {
        // console.log(this.solution, this.selection);
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
        let win = (this.checkSolution());
        
        // this.input.off('gameobjectdown', this.selectItem, this); 
        this.turnOffSelectEvent();
        if (win) {
           
            this.win = true;
            this.winText.setAlpha(1);
            let circledance = []
            for (let i = 0; i < this.selection.length; i++){
                circledance.push(this.circles[this.selection[i]])
            }

            this.score = 0;
            this.win = false;

            this.tweens.add({
                targets: circledance,
                alpha: 0,
                yoyo: true,
                repeat: 2,
                duration: 150,
                ease: 'sine.inout',
                onComplete: () => {
                    // let counter = 0;
                    // let a = this.input.on('pointerdown', (pointer) => {
                    //     console.log('counter1', counter)     
                    //     if (pointer.leftButtonDown()) { 
                    //         this.input.off('gameobjectdown', this.selectItem, this);
                    //         //this.scene.start('MainGame');
                    //         if (counter == 0)
                    //             this.newRound();
                    //         else {
                    //             this.input.on('gameobjectdown', this.selectItem, this);
                    //         }
                    //         counter++;
                    //     } else if (pointer.rightButtonDown()) {
                    //         // this.input.on('gameobjectdown', this.selectItem, this);
                    //     }
                    // }, this);
                    // a.off();

                    this.tweens.add({
                        targets: [this.submitText, this.rect],
                        alpha: {start: 0.75, to: 1},
                        y: '-=5',
                        ease: 'Elastic.out',
                        duration: 300,
                    });
                    this.newRound();
                    // use below for 'click to continue'
                    // this.input.once('pointerdown', (pointer) => {
                    // })
                }
            });
        } else {
            // if incorrect submission, should not do anything, allow to keep trying until correct
            this.score = 0;
            this.win = false;
            this.loseText.setAlpha(1);

            this.turnOnSelectEvent();

            // let b = this.input.on('pointerdown', (pointer) => {   
            //     console.log('counter2',this.counter2)
            //     if (this.counter2 > 0)
            //         this.input.once('gameobjectdown', this.selectItem, this);
            //     this.counter2++;
            // })
            // console.log(this.input);
            setTimeout( () => {
                this.tweens.add({
                    targets: [this.submitText, this.rect],
                    alpha: {start: 0.75, to: 1},
                    y: '-=5',
                    ease: 'Elastic.out',
                    duration: 500,
                });
                this.tweens.add({
                    targets: [this.loseText],
                    alpha: {start: 1, to: 0},
                    duration: 500,
                    onComplete: () => {
                        // this.loseText.setVisible(false);
                        this.turnOnSubmitEvent();
                    }
                });
            }, 500);
            
            //Timeout is needed so that the click to submit doesn't count for going to the main menu
            
        }
    }
}

function xyConvertToIndex(x,y) {
    x = Math.floor((x-GRID_X+GRID_CELLWIDTH/2)/GRID_CELLWIDTH);
    y = Math.floor((y-GRID_Y+GRID_CELLHEIGHT/2)/GRID_CELLHEIGHT);
    return (x+GRID_WIDTH*y);
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

// size 30
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

// size 20
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

// size 16
const fontStyle3 = {
    fontFamily: 'Arial',
    fontSize: 16,
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

const pickLevelParameters = {
    1: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"]},
            //{"BORDER": ["BLACK", "BRONZE", "SILVER", "GOLD", "LIGHTBLUE"]},
            //{"PATTERN": ["PLAIN", "STRIPED", "SPOTTED", "NET", "SPIRAL"]},
        ],
        operators: ["AND"],
        numFeatures: 2,
        numExpressions: 8,
        allowNullSet: false,
        numNots: -1,
        repeat: false,
    },
    2: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"]},
        ],
        operators: ["OR"],
        numFeatures: 2,
        numExpressions: 8,
        allowNullSet: false,
        numNots: -1,
        repeat: false,
    },
    3: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"]},
            {"PATTERN": ["PLAIN", "STRIPED", "SPOTTED", "NET", "SPIRAL"]}, 
        ],
        operators: ["AND", "OR"],
        numFeatures: 3,
        numExpressions: 8,
        allowNullSet: false,
        numNots: -1,
        repeat: false,
    },
    4: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"]},
            {"PATTERN": ["PLAIN", "STRIPED", "SPOTTED", "NET", "SPIRAL"]},
        ],
        operators: ["AND", "OR", "NOT"],
        numFeatures: 2,
        numExpressions: 8,
        allowNullSet: true,
        numNots: [1, 2],
        repeat: false,
    },
    5: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"]},
            {"PATTERN": ["PLAIN", "STRIPED", "SPOTTED", "NET", "SPIRAL"]},
        ],
        operators: ["AND", "OR", "NOT"],
        numFeatures: 3,
        numExpressions: 8,
        allowNullSet: true,
        numNots: [1, 2],
        repeat: false,
    },
    6: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"]},
            {"PATTERN": ["PLAIN", "STRIPED", "SPOTTED", "NET", "SPIRAL"]},
            {"BORDER": ["BLACK", "BRONZE", "SILVER", "GOLD", "LIGHTBLUE"]},
        ],
        operators: ["AND", "OR", "NOT"],
        numFeatures: 3,
        numExpressions: 8,
        allowNullSet: true,
        numNots: [1, 2],
        repeat: false,
    },
    7: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"]},
            {"PATTERN": ["PLAIN", "STRIPED", "SPOTTED", "NET", "SPIRAL"]},
            {"BORDER": ["BLACK", "BRONZE", "SILVER", "GOLD", "LIGHTBLUE"]},
        ],
        operators: ["AND", "OR"],
        numFeatures: 4,
        numExpressions: 8,
        allowNullSet: true,
        numNots: [1, 2],
        repeat: false,
    },
    8: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"]},
            {"PATTERN": ["PLAIN", "STRIPED", "SPOTTED", "NET", "SPIRAL"]},
            {"BORDER": ["BLACK", "BRONZE", "SILVER", "GOLD", "LIGHTBLUE"]},
        ],
        operators: ["AND", "OR", "NOT"],
        numFeatures: 4,
        numExpressions: 8,
        allowNullSet: true,
        numNots: [1, 2],
        repeat: false,
    },
}

function createDisplay(game) {
    let ex = 0;
    game.expOperands = game.expressions[game.currentRound].filter(operand => Object.keys(operand) == "SHAPE" || Object.keys(operand) ==  "COLOR" || Object.keys(operand) == "BORDER" || Object.keys(operand) == "PATTERN");
    game.expOperators = game.expressions[game.currentRound].filter(operator => operator == "AND" || operator == "OR");
    game.expSize = game.expOperands.length + game.expOperators.length;
    game.expCompact = new Array(game.expSize);
    for(let i = 0; i<game.expOperands.length; i++){
        game.expCompact[2*i] = game.expOperands[i];
    }
    for(let i = 0; i<game.expOperators.length; i++){
        game.expCompact[2*i + 1] = game.expOperators[i];
    }
    game.parenthesesLength = 6;
    game.parentheses = new Array(game.parenthesesLength);
    let j = 0;
    let k = 0;
    let par = [];
    for(let i = 0; i<game.expressions[game.currentRound].length; i++){
        if(game.expressions[game.currentRound][i] == "(" || game.expressions[game.currentRound][i] == ")" || game.expressions[game.currentRound][i] == "NOT"){
            par.push(game.expressions[game.currentRound][i]);
        } /*else if (game.expressions[game.currentRound][i] == "AND" || game.expressions[game.currentRound][i] == "OR"){
            k++;
            if (k == 2){
                game.parentheses[j] = par;
                j++;
                par = [];
            }
        }*/ else {
            game.parentheses[j] = par;
            j++;
            par = [];
        }
        if(i == game.expressions[game.currentRound].length - 1){
            game.parentheses[j] = par;
        }
    }
    console.log(game.expressions[game.currentRound]);
    console.log(game.parentheses);
    console.log(game.level);
    console.log(Object.keys(game.expressions[game.currentRound][0]));
    // game.add.image(400, 300, 'background');
    game.selection = [];
    game.solution = [];
    game.goal1 = game.expCompact[0];
    game.goal1.value = game.goal1[Object.keys(game.goal1)[0]];
    game.goal2 = game.expCompact[2];
    game.goal2.value = game.goal2[Object.keys(game.goal2)[0]];
    if(game.expCompact[3] != undefined){
        game.goal3 = game.expCompact[4];
        game.goal3.value = game.goal3[Object.keys(game.goal3)[0]];
    }
    if(game.expCompact[5] != undefined){
        game.goal4 = game.expCompact[6];
        game.goal4.value = game.goal4[Object.keys(game.goal4)[0]];
    }
    if(game.parentheses[0] == undefined){game.parentheses[0]=""};
    if(game.parentheses[1] == undefined){game.parentheses[1]=""};
    if(game.parentheses[2] == undefined){game.parentheses[2]=""};
    if(game.parentheses[3] == undefined){game.parentheses[3]=""};
    if(game.parentheses[4] == undefined){game.parentheses[4]=""};
    if(game.parentheses[5] == undefined){game.parentheses[5]=""};
    if(game.parentheses[6] == undefined){game.parentheses[6]=""};
    if(game.parentheses[7] == undefined){game.parentheses[7]=""};
    if(game.parentheses[0].length > 1){
        game.parentheses[0] = game.parentheses[0].join();
        while(game.parentheses[0].includes(",")){
            game.parentheses[0] = game.parentheses[0].replace(',','');
        }
    }
    if(game.parentheses[1].length > 1){
        game.parentheses[1] = game.parentheses[1].join();
        while(game.parentheses[1].includes(",")){
            game.parentheses[1] = game.parentheses[1].replace(',','');
        }
    }
    if(game.parentheses[2].length > 1){
        game.parentheses[2] = game.parentheses[2].join();
        while(game.parentheses[2].includes(",")){
            game.parentheses[2] = game.parentheses[2].replace(',','');
        }
    }
    if(game.parentheses[3].length > 1){
        game.parentheses[3] = game.parentheses[3].join();
        while(game.parentheses[3].includes(",")){
            game.parentheses[3] = game.parentheses[3].replace(',','');
        }
    }
    if(game.parentheses[4].length > 1){
        game.parentheses[4] = game.parentheses[4].join();
        while(game.parentheses[4].includes(",")){
            game.parentheses[4] = game.parentheses[4].replace(',','');
        }
    }
    if(game.parentheses[5].length > 1){
        game.parentheses[5] = game.parentheses[5].join();
        while(game.parentheses[5].includes(",")){
            game.parentheses[5] = game.parentheses[5].replace(',','');
        }
    }
    if(game.parentheses[6].length > 1){
        game.parentheses[6] = game.parentheses[6].join();
        while(game.parentheses[6].includes(",")){
            game.parentheses[6] = game.parentheses[6].replace(',','');
        }
    }
    if(game.parentheses[7].length > 1){
        game.parentheses[7] = game.parentheses[7].join();
        while(game.parentheses[7].includes(",")){
            game.parentheses[7] = game.parentheses[7].replace(',','');
        }
    }
    game.parentheses1 = game.add.text(ex, 30, game.parentheses[0], fontStyle2);
    ex = ex + game.parentheses1.width;
    game.goal1sprite = game.add.sprite(ex + 20, 50, "attributes", getSprite(game.goal1.value));
    game.goal1sprite.setScale(0.4);
    ex = ex + game.goal1sprite.width * 0.4;//40;
    game.parentheses2 = game.add.text(ex, 30, game.parentheses[1], fontStyle2);
    ex = ex + game.parentheses2.width;
    game.expressionText = game.add.text(ex, 30, game.expCompact[1], fontStyle2);
    ex = ex + game.expressionText.width;
    game.parentheses3 = game.add.text(ex, 30, game.parentheses[2], fontStyle2);
    ex = ex + game.parentheses3.width;
    game.goal2sprite = game.add.sprite(ex + 20, 50, "attributes", getSprite(game.goal2.value));
    game.goal2sprite.setScale(0.4);
    ex = ex + game.goal2sprite.width * 0.4;
    game.parentheses4 = game.add.text(ex, 30, game.parentheses[3], fontStyle2);
    ex = ex + game.parentheses4.width;
    game.parentheses1.depth = 2;
    game.parentheses2.depth = 2;
    game.parentheses3.depth = 2;
    game.parentheses4.depth = 2;
    game.goal1sprite.depth = 1;
    game.goal2sprite.depth = 1;
    game.expressionText.depth = 1;

    if(game.expCompact[3] != undefined){
        game.expressionText2 = game.add.text(ex, 30, game.expCompact[3], fontStyle2);
        ex = ex + game.expressionText2.width;
        game.parentheses5 = game.add.text(ex, 30, game.parentheses[4], fontStyle2);
        ex = ex + game.parentheses5.width;
        game.goal3sprite = game.add.sprite(ex + 20,50, "attributes", getSprite(game.goal3.value));
        game.goal3sprite.setScale(0.4);
        ex = ex + game.goal3sprite.width * 0.4;
        game.parentheses6 = game.add.text(ex, 30, game.parentheses[5], fontStyle2);
        ex = ex + game.parentheses6.width;
        game.parentheses5.depth = 2;
        game.parentheses6.depth = 2;
        game.goal3sprite.depth = 1;
        game.expressionText2.depth = 1;
    }
    //game.parentheses8 = game.add.text(620, 30, game.parentheses[5], fontStyle2);

    if(game.expCompact[5] != undefined){
        game.expressionText3 = game.add.text(ex, 30, game.expCompact[5], fontStyle2);
        ex = ex + game.expressionText3.width;
        game.parentheses7 = game.add.text(ex, 30, game.parentheses[6], fontStyle2);
        ex = ex + game.parentheses7.width;
        game.goal4sprite = game.add.sprite(ex + 20,50, "attributes", getSprite(game.goal4.value));
        game.goal4sprite.setScale(0.4);
        ex = ex + game.goal4sprite.width * 0.4;
        game.parentheses8 = game.add.text(ex, 30, game.parentheses[7], fontStyle2);
        game.parentheses7.depth = 2;
        game.parentheses8.depth = 2;
        game.goal4sprite.depth = 1;
        game.expressionText3.depth = 1;
    }
}