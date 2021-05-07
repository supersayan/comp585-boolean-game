import { OPER, ATTR, createUniqueExpressions, getBooleanArrayIndexOfItem, getItemFromBooleanArrayIndex } from './Eval.js';

const GRID_WIDTH = 4;
const GRID_HEIGHT = 4;
const GRID_X = 240;
const GRID_Y = 190;
const GRID_CELLWIDTH = 120;
const GRID_CELLHEIGHT = 120;

export default class PickGame extends Phaser.Scene {

    // constructor -> init -> create

    constructor (str) {
        super('PickGame');
    }

    init (data) {
        this.level = data.level;
    }

    create () {
        // Circles that show when selecting
        this.circles = new Array(16);
        for(let i = 0; i < 16; i++){
            this.circles[i] = this.add.circle(0, 0, 60).setStrokeStyle(3, 0xf8960e);
            this.circles[i].setDepth(1);
            this.circles[i].setPosition((i%GRID_WIDTH)*GRID_CELLWIDTH+GRID_X-10, Math.floor(i/GRID_WIDTH)*GRID_CELLHEIGHT+GRID_Y-10);
            this.circles[i].setVisible(false);
        }
        
        this.win = false;

        //  Create a 4x4 grid aligned group to hold our sprites

        this.items = this.add.group({
            key: 'shapes',
            frameQuantity: 1,
            repeat: GRID_WIDTH * GRID_HEIGHT - 1,
            gridAlign: {
                width: GRID_WIDTH,
                height: GRID_HEIGHT,
                cellWidth: GRID_CELLWIDTH,
                cellHeight: GRID_CELLHEIGHT,
                x: GRID_X,
                y: GRID_Y,
            },
        });
        
        this.itemsBorders = this.add.group({
            key: 'shapes',
            frameQuantity: 1,
            repeat: GRID_WIDTH * GRID_HEIGHT - 1,
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
        this.bgrect = this.add.rectangle(0,0, 1600, 200, 0x0000FF, 0.4);
        // blue rectangle covering bottom of screen
        this.bgrect1 = this.add.rectangle(0,700, 1600, 200, 0x0000FF, 0.4);
        // text that shows on submission
        this.winText = this.add.text(570, 620, 'Correct!', fontStyle);
        this.winText.setColor('#FFD700');
        this.winText.setAlpha(0);
        this.loseText = this.add.text(550, 620, 'Try Again', fontStyle);
        this.loseText.setColor('#FF0000');
        this.loseText.setAlpha(0);

        // Create Buttons

        // submission button
        this.submitButton = this.add.image(750, 650, 'check').setScale(1.2);
        this.submitButton.setInteractive({useHandCursor: true});

        // flip button and reset button and help button
        this.flipButton = this.add.image(350, 650, 'invert').setScale(0.8);
        this.flipButton.setInteractive({useHandCursor: true});

        this.resetButton = this.add.image(450, 650, 'restart').setScale(0.8);
        this.resetButton.setInteractive({useHandCursor: true});

        this.pauseButton = this.add.image(750, 50, 'pause').setScale(0.7);
        this.pauseButton.setInteractive({useHandCursor: true});

        // Back Button


        this.timetext = this.add.text(5, 650, "", fontStyle);
        this.timetext.setPadding(10);
        
        // add Event Listeners
        this.turnOnSelectEvent();
        this.turnOnSubmitEvent();
        this.turnOnResetEvent();
        this.turnOnFlipEvent();
        this.turnOnPauseEvent();

        // Score / Time
        this.timeEvent = this.time.addEvent({
            delay: 999000,
            callback: this.emptyCallback,
            callbackScope: this,
            repeat: 1,
        })
        this.timePenalty = 0;
        this.score = 0;
        
        this.leveltext = this.add.text(0, 610, "", fontStyle).setDepth(2);
        this.roundProgressBar = this.add.rectangle(0, 100, 0, 20, 0x0000FF, 0.4).setOrigin(0);

        this.newLevel();
    }

    // main game loop
    update(time) {
        // update time text
        this.score = Math.min(Math.floor((this.timeEvent.getElapsedSeconds()))+this.timePenalty, 999);
        this.timetext.setText("Time: " + this.score);
    }

    emptyCallback() {
        // do nothing
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
            this.tweens.add({
                targets: [this.submitButton],
                alpha: {start: 1, to: 0.75},
                y: '+=5',
                ease: 'Elastic.out',
                duration: 100,
            });
            this.submitSelection();
        }, this);
    }

    flip() {
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
        this.buttonBounceAnimation(this.flipButton, 'f');
    }

    turnOnFlipEvent() {
        this.flipButton.once('pointerdown', this.flip, this)
    }

    turnOffFlipEvent() {
        this.flipButton.off('pointerdown', this.flip, this)
    }

    reset() {
        
        let a = [];
        for (let i = 0; i < this.selection.length; i++) {
            this.circles[this.selection[i]].setVisible(false);
        }
        this.selection = a;
        this.buttonBounceAnimation(this.resetButton, 'r');
    }

    buttonBounceAnimation(button, str) {

        this.tweens.add({
            targets: [button],
            alpha: {start: 1, to: 0.75},
            y: '+=5',
            ease: 'Elastic.out',
            duration: 200,
            onComplete: () => {
                this.tweens.add({
                    targets: [button],
                    alpha: {start: 0.75, to: 1},
                    y: '-=5',
                    ease: 'Elastic.out',
                    duration: 200,
                    onComplete: () => {
                        if (str == 'r') {
                            this.turnOnResetEvent();
                        } else if (str == 'f') {
                            this.turnOnFlipEvent();
                        }
                    }
                });
            }
        });
        
    }

    turnOnResetEvent() {
        this.resetButton.once('pointerdown', this.reset, this);
    }

    turnOnHelpEvent() {
        this.helpButton.on('pointerdown', () => {
            window.open('https://en.wikipedia.org/wiki/Boolean_algebra', '_blank');
        })
    }

    turnOffResetEvent() {
         this.resetButton.off('pointerdown', this.reset, this)
    }

    turnOnPauseEvent() {
        this.pauseButton.on('pointerdown', () => {
            this.scene.pause();
            // will run this scene in parallel while current scene is paused
            this.scene.launch('PauseMenu');
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
            if (this.proptext != undefined) {
                for (let i=0; i<this.proptext.length; i++) {
                    this.proptext[i].destroy();
                }
            }

            if (this.prevIndex != index) {
                this.proptext = [];
                this.proptext[0] = this.add.text(10, 120, 'Properties: ', fontStyle2);
                for (let i=0; i<this.itemAttributes[index].length; i++) {
                    this.proptext[i+1] = this.add.text(10, 150 + 30*i, Object.keys(this.itemAttributes[index][i])[0] + " = " + Object.values(this.itemAttributes[index][i])[0], fontStyle2);
                }
                this.prevIndex = index;
            } else {
                this.prevIndex = -1;
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
            children[i].setFrame(ATTR["COLOR"][color].toLowerCase() + ATTR["PATTERN"][pattern].toLowerCase() + ATTR["SHAPE"][shape].toLowerCase() + '.png');
            childrenBorder[i].setFrame(ATTR["BORDER"][border].toLowerCase() + "border" + ATTR["SHAPE"][shape].toLowerCase() + ".png");
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
        // for displaying the expression string
        if (this.expressionString)
            this.expressionString.destroy();
        this.expressionString = this.add.text(15, 75, this.strings[this.currentRound], fontStyle3);
        this.expressionString.depth = 2;
        this.expressionString.setAlpha(0.7);

        // for displaying the expression with images
        const expressionX = 10;
        const expressionY = 25;
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
        let ex = expressionX;
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
            } else {
                this.parentheses[j] = par;
                j++;
                par = [];
            }
            if(i == this.expressions[this.currentRound].length - 1){
                this.parentheses[j] = par;
            }
        }
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
        this.parentheses1 = this.add.text(ex, expressionY, this.parentheses[0], fontStyle2);
        ex = ex + this.parentheses1.width;
        this.goal1sprite = this.add.sprite(ex + 20, expressionY + 20, "attributes", getSprite(this.goal1.value));
        this.goal1sprite.setScale(0.4);
        ex = ex + this.goal1sprite.width * 0.4;
        this.parentheses2 = this.add.text(ex, expressionY, this.parentheses[1], fontStyle2);
        ex = ex + this.parentheses2.width;
        this.expressionText = this.add.text(ex, expressionY, this.expCompact[1], fontStyle2);
        ex = ex + this.expressionText.width;
        this.parentheses3 = this.add.text(ex, expressionY, this.parentheses[2], fontStyle2);
        ex = ex + this.parentheses3.width;
        this.goal2sprite = this.add.sprite(ex + 20, expressionY + 20, "attributes", getSprite(this.goal2.value));
        this.goal2sprite.setScale(0.4);
        ex = ex + this.goal2sprite.width * 0.4;
        this.parentheses4 = this.add.text(ex, expressionY, this.parentheses[3], fontStyle2);
        ex = ex + this.parentheses4.width;
        this.parentheses1.depth = 2;
        this.parentheses2.depth = 2;
        this.parentheses3.depth = 2;
        this.parentheses4.depth = 2;
        this.goal1sprite.depth = 1;
        this.goal2sprite.depth = 1;
        this.expressionText.depth = 1;
    
        if(this.expCompact[3] != undefined){
            this.expressionText2 = this.add.text(ex, expressionY, this.expCompact[3], fontStyle2);
            ex = ex + this.expressionText2.width;
            this.parentheses5 = this.add.text(ex, expressionY, this.parentheses[4], fontStyle2);
            ex = ex + this.parentheses5.width;
            this.goal3sprite = this.add.sprite(ex + 20, expressionY + 20, "attributes", getSprite(this.goal3.value));
            this.goal3sprite.setScale(0.4);
            ex = ex + this.goal3sprite.width * 0.4;
            this.parentheses6 = this.add.text(ex, expressionY, this.parentheses[5], fontStyle2);
            ex = ex + this.parentheses6.width;
            this.parentheses5.depth = 2;
            this.parentheses6.depth = 2;
            this.goal3sprite.depth = 1;
            this.expressionText2.depth = 1;
        }
    
        if(this.expCompact[5] != undefined){
            this.expressionText3 = this.add.text(ex, expressionY, this.expCompact[5], fontStyle2);
            ex = ex + this.expressionText3.width;
            this.parentheses7 = this.add.text(ex, expressionY, this.parentheses[6], fontStyle2);
            ex = ex + this.parentheses7.width;
            this.goal4sprite = this.add.sprite(ex + 20, expressionY + 20, "attributes", getSprite(this.goal4.value));
            this.goal4sprite.setScale(0.4);
            ex = ex + this.goal4sprite.width * 0.4;
            this.parentheses8 = this.add.text(ex, expressionY, this.parentheses[7], fontStyle2);
            this.parentheses7.depth = 2;
            this.parentheses8.depth = 2;
            this.goal4sprite.depth = 1;
            this.expressionText3.depth = 1;
        }
    }

    newRound () {
        this.selection.forEach((e) => {
            this.circles[e].setVisible(false)
        })
        if (this.currentRound < this.numRounds - 1) {
            this.currentRound++;
        } else {
            this.scene.start("LevelFinish", {level: this.level, score: this.score});
            return;
        }
        this.selection = [];

        this.updateExpressionDisplay();

        this.win = false;

        this.tweens.add({
            targets: this.roundProgressBar,
            width: this.game.config.width * (this.currentRound / this.numRounds),
            ease: 'power2',
            duration: 500,
        })

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
                this.prevIndex = -1;
            }
        });

        this.tweens.add({
            targets: this.itemsBorders.getChildren(),
            scale: 0,
            ease: 'power2',
            duration: 600,
            delay: this.tweens.stagger(100, { grid: [ 4, 4 ], from: 'center' }),
        });
    }

    newLevel() {
        if (!(this.level in pickLevelParameters))
            throw new Error("invalid level");
        this.currentRound = 0; // iterates every new round
        let levelParams = pickLevelParameters[this.level];
        
        this.attributes = levelParams.attributes;

        // modify attributes for colorblind
        let COLORBLINDCOLORS = ["RED", "PURPLE", "BLUE"];
        let COLORBLINDBORDERS = ["BLACK", "BRONZE", "GOLD"];
        let c = this.attributes.findIndex(a => Object.keys(a)[0] == "COLOR");
        let b = this.attributes.findIndex(a => Object.keys(a)[0] == "BORDER");
        if (this.registry.get('colorblind') === true) {
            if (c >= 0) {
                this.attributes[c]["COLOR"] = this.attributes[c]["COLOR"].filter((clr) => COLORBLINDCOLORS.includes(clr));
            }
            if (b >= 0) {
                this.attributes[b]["BORDER"] = this.attributes[b]["BORDER"].filter((clr) => COLORBLINDBORDERS.includes(clr));
            }
        }
        for (let i = 0; i < this.attributes.length; i++) {
            let k = Object.keys(this.attributes[i])[0];
            if (this.attributes[i][k].length < 1)
                throw new Error("invalid attributes");
        }

        this.numRounds = levelParams.numExpressions;
        let evalOutput = createUniqueExpressions(levelParams.numExpressions, levelParams.numFeatures, levelParams.attributes, levelParams.operators, levelParams.allowNullSet, levelParams.numNots);
        this.expressions = evalOutput.expressions;
        this.evaluations = evalOutput.evaluations;
        this.strings = evalOutput.strings;

        // display level number
        this.leveltext.setText("Level " + this.level, fontStyle);

        this.updateExpressionDisplay();
        this.arrangeGrid();
    }

    checkSolution() {
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
        this.turnOffSelectEvent();
        this.turnOffFlipEvent();
        this.turnOffResetEvent();
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
                    this.tweens.add({
                        targets: [this.submitButton],
                        alpha: {start: 0.75, to: 1},
                        y: '-=5',
                        ease: 'Elastic.out',
                        duration: 300,
                    });
                    this.newRound();
                }
            });
        } else {
            // if incorrect submission, should not do anything, allow to keep trying until correct
            this.score = 0;
            this.win = false;
            this.loseText.setAlpha(1);

            this.timePenalty += 10;
            let timePenaltyText = this.add.text(100, 635, "+10", fontStyle).setAlpha(1).setColor('#FF0000').setDepth(3);
            this.tweens.add({
                targets: [timePenaltyText],
                alpha: {start: 1, to: 0},
                y: '-=5',
                ease: 'linear',
                duration: 1000,
                onComplete: () => {
                    timePenaltyText.destroy();
                }
            });

            this.turnOnSelectEvent();
            setTimeout( () => {
                this.tweens.add({
                    targets: [this.submitButton],
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
                        this.turnOnSubmitEvent();
                        this.turnOnFlipEvent();
                        this.turnOnResetEvent();
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

/**
 * the level parameters
 * 1,2,3 are for levels 1,2,3
 * 10,20,30 are the colorlbind alternatives for levels 1,2,3, which have some colors (ORANGE, GREEN) removed
 */
const pickLevelParameters = {
    1: {
        attributes: [
            {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
            {"COLOR": ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"]},
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

