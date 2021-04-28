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
        this.colorblind = false;
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
        /*this.rect = this.add.rectangle(745, 355, 100, 50,0x55ffff);
        this.rect.setStrokeStyle(2,0x000000);
        this.submitText = this.add.text(680, 325, 'Submit', fontStyle);
        this.submitText.setInteractive({useHandCursor: true});*/
        this.submitButton = this.add.image(750, 325, 'check').setScale(0.15);
        this.submitButton.setInteractive({useHandCursor: true});

        // flip button and reset button and help button
        this.flipButton = this.add.image(750, 425, 'invert').setScale(0.15);
        this.flipButton.setInteractive({useHandCursor: true});

        this.resetButton = this.add.image(750,500, 'restart').setScale(0.15);
        this.resetButton.setInteractive({useHandCursor: true});

        this.helpButton = this.add.image(750,150, 'help').setScale(0.4);
        this.helpButton.setInteractive({useHandCursor: true});
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
        this.turnOnResetEvent();
        this.turnOnFlipEvent();
        this.turnOnHelpEvent(); 
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
        this.submitButton.once('pointerdown', () => { // one time listener
            /*this.tweens.add({
                targets: [this.submitButton],
                alpha: {start: 1, to: 0.75},
                y: '+=5',
                ease: 'Elastic.out',
                duration: 100,
            });*/
            this.submitSelection();
        }, this);
    }

    turnOnFlipEvent() {
        
        this.flipButton.on('pointerdown', () => {
            let a = [];
            for (let i = 0; i < 16; i++) {
                let inside = false;
                for (let j = 0; j < this.selection.length; j++) {
                    if (i == this.selection[j]) {
                        inside = true; 
                        break;
                    }
                }
                if (inside) {
                    this.circles[i].setVisible(false);
                } else {
                    a.push(i)
                    this.circles[i].setVisible(true);
                }
            }
            this.selection = a;
        })
    }

    turnOffFlipEvent() {
        this.flipButton.off('pointerdown', () => {
            let a = [];
            for (let i = 0; i < 16; i++) {
                if (i in this.selection) {
                    this.circles[i].setVisible(false);
                } else {
                    a.push(i)
                    this.circles[i].setVisible(true);
                }
            }
            this.selection = a;
        })
    }

    turnOnResetEvent() {
        this.resetButton.on('pointerdown', () => {
            let a = [];
            for (let i = 0; i < this.selection.length; i++) {
                this.circles[this.selection[i]].setVisible(false);
            }
            this.selection = a;
        })
    }

    turnOnHelpEvent() {
        this.helpButton.on('pointerdown', () => {
            window.open('https://en.wikipedia.org/wiki/Boolean_algebra', '_blank');
        })
    }

    turnOffResetEvent() {
        this.resetButton.off('pointerdown', () => {
            let a = [];
            for (let i = 0; i < this.selection.length; i++) {
                this.circles[this.selection[i]].setVisible(false);
            }
            this.selection = a;
        })
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
        // only push an index to be duplicated, if it isn't a null solution
        if (presolved.length > 0)
            presolvedGrid.push(Math.floor(16 * Math.random()));
        // randomly generate items
        for (let i = 0; i < 16; i++) {
            let item = [];
            let itemJSON = {};
            if (presolvedGrid.includes(i)) {
                // console.log(presolved, presolvedGrid);
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
                // console.log(item);
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
            
            // console.log(color, pattern, shape);
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
        if(this.expressionText != undefined){this.expressionText.destroy();}
        if(this.goal1sprite != undefined){this.goal1sprite.destroy();}
        if(this.goal2sprite != undefined){this.goal2sprite.destroy();}
        if(this.goal3sprite != undefined){this.goal3sprite.destroy();}
        if(this.expressionText2 != undefined){this.expressionText2.destroy();}
        if(this.goal4sprite != undefined){this.goal4sprite.destroy();}
        if(this.expressionText3 != undefined){this.expressionText3.destroy();}
        if(this.parentheses1 != undefined){this.parentheses1.destroy();}
        if(this.parentheses2 != undefined){this.parentheses2.destroy();}
        if(this.parentheses3 != undefined){this.parentheses3.destroy();}
        if(this.parentheses4 != undefined){this.parentheses4.destroy();}
        if(this.parentheses5 != undefined){this.parentheses5.destroy();}
        if(this.parentheses6 != undefined){this.parentheses6.destroy();}
        if(this.parentheses7 != undefined){this.parentheses7.destroy();}
        if(this.parentheses8 != undefined){this.parentheses8.destroy();}
        let ex = 0;
        this.expOperands = this.expressions[this.currentRound].filter(operand => Object.keys(operand) == "SHAPE" || Object.keys(operand) ==  "COLOR" || Object.keys(operand) == "BORDER" || Object.keys(operand) == "PATTERN");
        this.expOperators = this.expressions[this.currentRound].filter(operator => operator == "AND" || operator == "OR");
        this.expSize = this.expOperands.length + this.expOperators.length;
        this.expCompact = new Array(this.expSize);
        for(let i = 0; i<this.expOperands.length; i++){
            this.expCompact[2*i] = this.expOperands[i];
        }
        for(let i = 0; i<this.expOperators.length; i++){
            this.expCompact[2*i + 1] = this.expOperators[i];
        }
        this.parenthesesLength = 6;
        this.parentheses = new Array(this.parenthesesLength);
        let j = 0;
        let k = 0;
        let par = [];
        for(let i = 0; i<this.expressions[this.currentRound].length; i++){
            if(this.expressions[this.currentRound][i] == "(" || this.expressions[this.currentRound][i] == ")" || this.expressions[this.currentRound][i] == "NOT"){
                par.push(this.expressions[this.currentRound][i]);
            } /*else if (this.expressions[this.currentRound][i] == "AND" || this.expressions[this.currentRound][i] == "OR"){
                k++;
                if (k == 2){
                    this.parentheses[j] = par;
                    j++;
                    par = [];
                }
            }*/ else {
                this.parentheses[j] = par;
                j++;
                par = [];
            }
            if(i == this.expressions[this.currentRound].length - 1){
                this.parentheses[j] = par;
            }
        }
        // console.log(this.expressions[this.currentRound]);
        // console.log(this.parentheses);
        // console.log(this.level);
        // console.log(Object.keys(this.expressions[this.currentRound][0]));
        // this.add.image(400, 300, 'background');
        this.selection = [];
        this.solution = [];
        this.goal1 = this.expCompact[0];
        this.goal1.value = this.goal1[Object.keys(this.goal1)[0]];
        this.goal2 = this.expCompact[2];
        this.goal2.value = this.goal2[Object.keys(this.goal2)[0]];
        if(this.expCompact[3] != undefined){
            this.goal3 = this.expCompact[4];
            this.goal3.value = this.goal3[Object.keys(this.goal3)[0]];
        }
        if(this.expCompact[5] != undefined){
            this.goal4 = this.expCompact[6];
            this.goal4.value = this.goal4[Object.keys(this.goal4)[0]];
        }
        if(this.parentheses[0] == undefined){this.parentheses[0]=""};
        if(this.parentheses[1] == undefined){this.parentheses[1]=""};
        if(this.parentheses[2] == undefined){this.parentheses[2]=""};
        if(this.parentheses[3] == undefined){this.parentheses[3]=""};
        if(this.parentheses[4] == undefined){this.parentheses[4]=""};
        if(this.parentheses[5] == undefined){this.parentheses[5]=""};
        if(this.parentheses[6] == undefined){this.parentheses[6]=""};
        if(this.parentheses[7] == undefined){this.parentheses[7]=""};
        if(this.parentheses[0].length > 1){
            this.parentheses[0] = this.parentheses[0].join();
            while(this.parentheses[0].includes(",")){
                this.parentheses[0] = this.parentheses[0].replace(',','');
            }
        }
        if(this.parentheses[1].length > 1){
            this.parentheses[1] = this.parentheses[1].join();
            while(this.parentheses[1].includes(",")){
                this.parentheses[1] = this.parentheses[1].replace(',','');
            }
        }
        if(this.parentheses[2].length > 1){
            this.parentheses[2] = this.parentheses[2].join();
            while(this.parentheses[2].includes(",")){
                this.parentheses[2] = this.parentheses[2].replace(',','');
            }
        }
        if(this.parentheses[3].length > 1){
            this.parentheses[3] = this.parentheses[3].join();
            while(this.parentheses[3].includes(",")){
                this.parentheses[3] = this.parentheses[3].replace(',','');
            }
        }
        if(this.parentheses[4].length > 1){
            this.parentheses[4] = this.parentheses[4].join();
            while(this.parentheses[4].includes(",")){
                this.parentheses[4] = this.parentheses[4].replace(',','');
            }
        }
        if(this.parentheses[5].length > 1){
            this.parentheses[5] = this.parentheses[5].join();
            while(this.parentheses[5].includes(",")){
                this.parentheses[5] = this.parentheses[5].replace(',','');
            }
        }
        if(this.parentheses[6].length > 1){
            this.parentheses[6] = this.parentheses[6].join();
            while(this.parentheses[6].includes(",")){
                this.parentheses[6] = this.parentheses[6].replace(',','');
            }
        }
        if(this.parentheses[7].length > 1){
            this.parentheses[7] = this.parentheses[7].join();
            while(this.parentheses[7].includes(",")){
                this.parentheses[7] = this.parentheses[7].replace(',','');
            }
        }
        this.parentheses1 = this.add.text(ex, 30, this.parentheses[0], fontStyle2);
        ex = ex + this.parentheses1.width;
        this.goal1sprite = this.add.sprite(ex + 20, 50, "attributes", getSprite(this.goal1.value));
        this.goal1sprite.setScale(0.4);
        ex = ex + this.goal1sprite.width * 0.4;//40;
        this.parentheses2 = this.add.text(ex, 30, this.parentheses[1], fontStyle2);
        ex = ex + this.parentheses2.width;
        this.expressionText = this.add.text(ex, 30, this.expCompact[1], fontStyle2);
        ex = ex + this.expressionText.width;
        this.parentheses3 = this.add.text(ex, 30, this.parentheses[2], fontStyle2);
        ex = ex + this.parentheses3.width;
        this.goal2sprite = this.add.sprite(ex + 20, 50, "attributes", getSprite(this.goal2.value));
        this.goal2sprite.setScale(0.4);
        ex = ex + this.goal2sprite.width * 0.4;
        this.parentheses4 = this.add.text(ex, 30, this.parentheses[3], fontStyle2);
        ex = ex + this.parentheses4.width;
        this.parentheses1.depth = 2;
        this.parentheses2.depth = 2;
        this.parentheses3.depth = 2;
        this.parentheses4.depth = 2;
        this.goal1sprite.depth = 1;
        this.goal2sprite.depth = 1;
        this.expressionText.depth = 1;
    
        if(this.expCompact[3] != undefined){
            this.expressionText2 = this.add.text(ex, 30, this.expCompact[3], fontStyle2);
            ex = ex + this.expressionText2.width;
            this.parentheses5 = this.add.text(ex, 30, this.parentheses[4], fontStyle2);
            ex = ex + this.parentheses5.width;
            this.goal3sprite = this.add.sprite(ex + 20,50, "attributes", getSprite(this.goal3.value));
            this.goal3sprite.setScale(0.4);
            ex = ex + this.goal3sprite.width * 0.4;
            this.parentheses6 = this.add.text(ex, 30, this.parentheses[5], fontStyle2);
            ex = ex + this.parentheses6.width;
            this.parentheses5.depth = 2;
            this.parentheses6.depth = 2;
            this.goal3sprite.depth = 1;
            this.expressionText2.depth = 1;
        }
        //this.parentheses8 = this.add.text(620, 30, this.parentheses[5], fontStyle2);
    
        if(this.expCompact[5] != undefined){
            this.expressionText3 = this.add.text(ex, 30, this.expCompact[5], fontStyle2);
            ex = ex + this.expressionText3.width;
            this.parentheses7 = this.add.text(ex, 30, this.parentheses[6], fontStyle2);
            ex = ex + this.parentheses7.width;
            this.goal4sprite = this.add.sprite(ex + 20,50, "attributes", getSprite(this.goal4.value));
            this.goal4sprite.setScale(0.4);
            ex = ex + this.goal4sprite.width * 0.4;
            this.parentheses8 = this.add.text(ex, 30, this.parentheses[7], fontStyle2);
            this.parentheses7.depth = 2;
            this.parentheses8.depth = 2;
            this.goal4sprite.depth = 1;
            this.expressionText3.depth = 1;
        }
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
        // console.log(this.expressions[this.currentRound]);
        // console.log(this.strings[this.currentRound]);

        this.updateExpressionDisplay();

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
                if (this.proptext)
                    for (let i = 0; i < this.proptext.length; i++) {
                        this.proptext[i].destroy();
                    }
                this.arrangeGrid();
                this.turnOnSelectEvent();
                this.turnOnSubmitEvent();
                this.turnOnFlipEvent();
                this.turnOnResetEvent();
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
        if (this.colorblind) {
            levelParams = pickLevelParameters[this.level * 10];
        }
        
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

// size 28
const fontStyle = {
    fontFamily: 'Arial',
    fontSize: 28,
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
    //10 is colorblind version of 1
    10: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "PURPLE", "BLUE"]},
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
    //20 is colorblind 2
    20: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "PURPLE", "BLUE"]},
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
    //30 is colorblind 3
    30: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "PURPLE", "BLUE"]},
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
    //40 is colorblind 4
    40: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "PURPLE", "BLUE"]},
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
    //50 is colorblind 5
    50: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "PURPLE", "BLUE"]},
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
    //60 is colorblind 6
    60: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "PURPLE", "BLUE"]},
            {"PATTERN": ["PLAIN", "STRIPED", "SPOTTED", "NET", "SPIRAL"]},
            {"BORDER": ["BLACK", "BRONZE", "GOLD"]},
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
    //70 is colorblind 7
    70: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "PURPLE", "BLUE"]},
            {"PATTERN": ["PLAIN", "STRIPED", "SPOTTED", "NET", "SPIRAL"]},
            {"BORDER": ["BLACK", "BRONZE", "GOLD"]},
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
    //80 is colorblind 8
    80: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "PURPLE", "BLUE"]},
            {"PATTERN": ["PLAIN", "STRIPED", "SPOTTED", "NET", "SPIRAL"]},
            {"BORDER": ["BLACK", "BRONZE", "GOLD"]},
        ],
        operators: ["AND", "OR", "NOT"],
        numFeatures: 4,
        numExpressions: 8,
        allowNullSet: true,
        numNots: [1, 2],
        repeat: false,
    },
}

