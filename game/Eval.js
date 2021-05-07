/**
 * @typedef {Object.<string, string>} AttributeFeature
 * @typedef {Object.<string, string[]>} AttributeFeatureArray
 */

/**
 * every operation
 */
export const OPER = ["AND", "OR", "NOT"]

/**
 * every possible attribute and feature; used to check valid parameters
 */
export const ATTR = {
    "SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"],
    "COLOR": ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"],
    "PATTERN": ["PLAIN", "STRIPED", "SPOTTED", "NET", "SPIRAL"],
    "BORDER": ["BLACK", "BRONZE", "SILVER", "GOLD", "LIGHTBLUE"],
}

/**
 * node for constructing expression trees
 */
class TreeNode {
    /**
     * 
     * @param {string} value 
     * @param {Object[]} children 
     * @param {string} nodetype 
     */
    constructor(value, children, nodetype) {
        this._value = value;
        this._children = children;
        this._childrenBorder = children;
        this._nodetype = nodetype;
    }

    getValue() {
        return this._value;
    }

    getChildren() {
        return this._children;
    }

    getChildrenBorder() {
        return this._childrenBorder;
    }

    getNodeType() {
        return this._nodetype;
    }
}

/**
 * operator nodes are non-leaf nodes, they always have children
 */
class OperatorNode extends TreeNode {
    /**
     * creates a parent node with an operator
     * @param {string} operator 
     * @param {Object[]} children 
     * [ TreeNode1, TreeNode2, ... ]
     */
    constructor(operator, children) {
        if(!OPER.includes(operator))
            throw new Error("invalid operator");
        let isBinary = (operator !== "NOT");
        if(isBinary && children.length != 2) {
            throw new Error("binary operator node must have two chldren");
        } else if (!isBinary && children.length != 1) {
            throw new Error("unary operator node must have one child")
        }
        super(operator, children, "operator");
        this._isBinary = isBinary;
    }

    /**
     * @returns {boolean} true if node has two children, false otherwise
     */
    isBinary() {
        return this._isBinary;
    }

    /**
     * @returns {string} string representing the boolean expression of this node
     */
    getString() {
        if (this.isBinary()) {
            return "(" + this.getChildren()[0].getString() + " " + this.getValue() + " " + this.getChildren()[1].getString() + ")";
        } else {
            return "(" + this.getValue() + " " + this.getChildren()[0].getString() + ")";
        }
    }

    /**
     * 
     * @param {AttributeFeatureArray[]} availableAttributes 
     * @returns 
     */
    evaluate(availableAttributes) {
        let evaluatedChildren = [];
        for(let c=0; c<this.getChildren().length; c++) {
            evaluatedChildren.push(this.getChildren()[c].evaluate(availableAttributes));
        }
        let res = evaluatedChildren[0];
        
        if (this.getValue() === "NOT") {
            for(let i=0; i<res.length; i++) {
                // flip all booleans
                res[i] = !res[i];
            }
        } else if (this.getValue() === "AND") {
            for(let i=0; i<res.length; i++) {
                res[i] = res[i] && evaluatedChildren[1][i];
            }
        } else if (this.getValue() === "OR") {
            for(let i=0; i<res.length; i++) {
                res[i] = res[i] || evaluatedChildren[1][i];
            }
        }

        return res;
    }

    getExpression() {
        if (this.isBinary()) {
            return ["("].concat(this.getChildren()[0].getExpression(), this.getValue(), this.getChildren()[1].getExpression(), [")"]);
        } else {
            return ["("].concat([this.getValue()], this.getChildren()[0].getExpression(), [")"]);
        }
    }

    clone() {
        let newChildren = [];
        for (let i=0; i<this.getChildren().length; i++) {
            newChildren.push(this.getChildren()[i].clone());
        }
        return new OperatorNode(this.getValue(), newChildren);
    }
}

/**
 * leaf nodes
 */
class FeatureNode extends TreeNode {
    /**
     * @param {string} attribute 
     * @param {string} feature
     */
    constructor(attribute, feature) {
        super(feature, [], "feature");
        this.attribute = attribute;
    }

    /**
     * returns the boolean array for this node
     * @param {AttributeFeatureArray[]} availableAttributes
     * @returns {boolean[]} boolean array for agreement of each possible item
     */
    evaluate(availableAttributes) {
        let booleanArray = [];
        let length = 1;
        for (let i=0; i<availableAttributes.length; i++) {
            length *= Object.values(availableAttributes[i])[0].length;
        }
        for (let i=0; i<length; i++) {
            booleanArray.push(false);
        }
        function recursiveSetTrueBooleanArray(index, remainingAttributes, feature) {
            if (remainingAttributes.length === 0) {
                booleanArray[index] = true; // recursive end
            } else {
                let d = Object.values(remainingAttributes[0])[0].length;
                if (Object.values(remainingAttributes[0])[0].includes(feature)) {
                    let f = Object.values(remainingAttributes[0])[0].indexOf(feature);
                    recursiveSetTrueBooleanArray(index * d + f, remainingAttributes.slice(1), feature);
                } else {
                    for(let i=0; i<d; i++) {
                        recursiveSetTrueBooleanArray(index * d + i, remainingAttributes.slice(1), feature);
                    }
                }
            }
        }
        recursiveSetTrueBooleanArray(0, availableAttributes, this.getValue());
        return booleanArray;
    }

    /**
     * 
     * @returns {Object[]} a single value array with object
     */
    getExpression() {
        let res = {};
        res[this.attribute] = this.getValue();
        return [res];
    }

    /**
     * @returns {string}
     */
    getString() {
        return this.getValue();
    }

    clone() {
        return new FeatureNode(this.attribute, this.getValue());
    }
}

/**
 * 
 * @param {Object} item 
 * @param {string[]} Object.keys(item) - item attributes
 * @param {string[]} Object.values(item) - item features
 * @param {AttributeFeatureArray[]} availableAttributes
 * @returns index of the feature combination in the expected generated boolean array
 */
export function getBooleanArrayIndexOfItem(item, availableAttributes) {
    function recursiveBooleanArray(index, item, remainingAttributes) {
        if (remainingAttributes.length === 0) {
            return index; // recursive end
        } else {
            let d = Object.values(remainingAttributes[0])[0].length;
            let f = Object.values(remainingAttributes[0])[0].indexOf(Object.values(item[0])[0]);
            return recursiveBooleanArray(index * d + f, item.slice(1), remainingAttributes.slice(1));
        }
    }
    return recursiveBooleanArray(0, item, availableAttributes);
}

/**
 * 
 * @param {number} index 
 * @param {AttributeFeatureArray[]} availableAttributes
 * @returns {AttributeFeature[]} the item (object array) specified by a given index in the boolean array outputted by evaluation
 */
export function getItemFromBooleanArrayIndex(index, availableAttributes) {
    let attrIntervals = [];
    for (let a=0; a<availableAttributes.length; a++) {
        attrIntervals.push(1);
    }
    for (let a=availableAttributes.length-1; a>=0; a--) {
        for (let b=a+1; b<availableAttributes.length; b++) {
            attrIntervals[a] *= Object.values(availableAttributes[b])[0].length;
        }
    }
    let item = [];
    for (let a=0; a<availableAttributes.length; a++) {
        let itemAttr = {};
        let i = Math.floor(index / attrIntervals[a]);
        index %= attrIntervals[a];
        itemAttr[Object.keys(availableAttributes[a])[0]] = Object.values(availableAttributes[a])[0][i];
        item.push(itemAttr);
    }
    return item;
}

/**
 * utility function
 * @param {number} min 
 * @param {number} max 
 * @returns integer from 0 inclusive to max exclusive
 */
function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

/**
 * create and return unique expression trees and their evaluations and strings
 * @param {number} numExpressions - the number of expressions to be returned
 * @param {number} numFeatures - the number of features in each expression. should be >= 2
 * @param {AttributeFeatureArray[]} availableAttributes
 * @param {string[]} availableOperations 
 * @param {boolean} allowNullSet - if true, every attribute is referenced in an expression at most once
 * @param {number|number[]} numNots - if "NOT" is in availableOperations, constrain the number of NOTs to numNots. if -1 (default), make NOTs random with 50% for any node.
 * if an array, pick a random number frmo it for each expression.
 * @param {boolean} repeat - if true, include exactly two expressions with the same evalutaion.
 * 
 * @typedef {Object} Expressions
 * @property {Object[]} rootNodes
 * @property {(AttributeFeature|string)[][]} expressions - an array of {attribute:feature} objects and string in the order to be displayed
 * @property {boolean[][]} evaluations
 * @property {string[]} strings
 * @property {number[][]} repeat - if repeat is true, the two indices for the equivalent expressions
 * @returns {Expressions}
 */
export function createUniqueExpressions(numExpressions, numFeatures, availableAttributes, availableOperations, allowNullSet = true, numNots = -1, repeat = false) {
    
    let sum = 0;
    for (let a of availableAttributes) {
        sum += Object.values(a)[0].length;
    }
    if (numFeatures > sum) {
        throw new Error("numFeatures cannot be larger than number of available features");
    }
    if (numFeatures < 2) {
        throw new Error("invalid number of features");
    }
    if (availableAttributes.length < 2) {
        throw new Error("must have at least two attributes");
    }
    if (numExpressions < 1 || numExpressions > 15) {
        throw new Error("invalid number of expressions");
    }
    if (repeat && numExpressions < 2) {
        throw new Error("if repeat is true, numExpressions must be >= 2");
    }
    if (!allowNullSet && (numFeatures > availableAttributes.length)) {
        throw new Error("if no null solution, numFeatures must be <= number of available attributes");
    }

    let expressionRootNodes = [], expressionArrays = [], expressionEvaluations = [], expressionStrings = [];

    let useNot = false;
    if (availableOperations.includes("NOT")) {
        useNot = true;
        availableOperations = availableOperations.filter(o => o != "NOT"); //remove "NOT" from array
    }
    if (availableOperations.length === 0) {
        throw new Error("must have at least one binary operation (AND/OR)");
    }

    // if repeat, make only the first n-1 expressions unique, so the last can be the same
    // store the repeated root node so it can be shuffled in later
    let repeatIndex1 = randomInt(numExpressions - 1), repeatIndex2 = numExpressions - 1;
    let repeatRoot;
    if (repeat) {
        numExpressions--;
    }

    // create each expression
    for (let e = 0; e < numExpressions; e++) {
        let rootNode;
        let evaluation;
        let isUnique;
        do {
            // create random feature nodes
            let randAttributes = [];
            let randFeatures = [];
            let randFeatureNodes = [];
            for (let f=0; f<numFeatures; f++) {
                do {
                    // select random attribute from availableAttributes.keys()
                    let r = randomInt(availableAttributes.length);
                    var rand_at = Object.keys(availableAttributes[r])[0];
                    // select random feature from availableAttributes[rand_at]
                    var rand_ft = availableAttributes[r][rand_at][randomInt(availableAttributes[r][rand_at].length)];
                } while (randFeatures.includes(rand_ft)) // if numFeatures > number of features in availableAttributes, this is infinite loop
                if (!randAttributes.includes(rand_at)) {
                    randAttributes.push(rand_at);
                }
                randFeatures.push(rand_ft);
                randFeatureNodes.push(new FeatureNode(rand_at, rand_ft));
            }

            // if numNots is an array instead of a number, choose a random number from it
            let nots = numNots;
            if (Array.isArray(numNots)) {
                nots = numNots[Math.floor(Math.random() * numNots.length)];
            }
            // generate random trees with numFeatures leaves
            rootNode = treeGenerator(randFeatureNodes, availableAttributes, availableOperations, useNot, nots);
            evaluation = rootNode.evaluate(availableAttributes);

            // check for uniqueness of the newly generated expression before pushing it
            // if there are no other expressions already generated with the same evaluation, it is unique
            isUnique = !expressionEvaluations.some( (ev) => {
                for (let i=0; i<ev.length; i++) {
                    if (ev[i] != evaluation[i]) {
                        return false;
                    }
                }
                return true;
            });
            
        } while(!isUnique || (!allowNullSet && !evaluation.some(Boolean))); // if the expression is not unique or is a null set (is null sets aren't allowed), make another one

        expressionRootNodes.push(rootNode);
        expressionArrays.push(rootNode.getExpression());
        expressionEvaluations.push(evaluation);
        expressionStrings.push(rootNode.getString());

        if (repeat && e === repeatIndex1) {
            // transform the tree according to a boolean algebra law
            // proof of concept: DeMorgan's Law
            // NOT (A AND B) = (NOT A) OR (NOT B)
            // NOT (A OR B) = (NOT A) AND (NOT B)
            let children;
            // deep copy
            repeatRoot = rootNode.clone();
            if (repeatRoot.getValue() === "NOT") {
                repeatRoot = repeatRoot.getChildren()[0];
                if (repeatRoot.getValue() === "AND") { // switch AND to OR or OR to AND
                    repeatRoot = new OperatorNode("OR", repeatRoot.getChildren());
                } else if (repeatRoot.getValue() === "OR") {
                    repeatRoot = new OperatorNode("AND", repeatRoot.getChildren());
                }
                children = repeatRoot.getChildren();
            } else {
                children = repeatRoot.getChildren();
                if (repeatRoot.getValue() === "AND") { // switch AND to OR or OR to AND
                    repeatRoot = new OperatorNode("OR", repeatRoot.getChildren());
                } else if (repeatRoot.getValue() === "OR") {
                    repeatRoot = new OperatorNode("AND", repeatRoot.getChildren());
                }
                repeatRoot = new OperatorNode("NOT", [repeatRoot]);
            }
            for (let i=0; i<children.length; i++) {
                if (children[i].getValue() === "NOT") {
                    children[i] = children[i].getChildren()[0];
                } else {
                    children[i] = new OperatorNode("NOT", [children[i]]);
                }
            }
        }
    }

    if(repeat) {
        // shuffle in the repeat root node and save their indices
        expressionRootNodes.push(repeatRoot);
        expressionArrays.push(repeatRoot.getExpression());
        expressionEvaluations.push(repeatRoot.evaluate(availableAttributes));
        expressionStrings.push(repeatRoot.getString());

        let currentIndex = expressionRootNodes.length, tempValue, randIndex;

        while (0 !== currentIndex) {
            randIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // if the one of the indices being swapped is a repeatIndex, change those as well
            if (currentIndex === repeatIndex1) {
                if (randIndex === repeatIndex2) { //swap
                    tempValue = repeatIndex1;
                    repeatIndex1 = repeatIndex2;
                    repeatIndex2 = tempValue;
                } else {
                    repeatIndex1 = randIndex;
                }
            } else if (currentIndex === repeatIndex2) {
                if (randIndex === repeatIndex1) { //swap
                    tempValue = repeatIndex1;
                    repeatIndex1 = repeatIndex2;
                    repeatIndex2 = tempValue;
                } else {
                    repeatIndex2 = randIndex;
                }
            } else if (randIndex === repeatIndex1) {
                repeatIndex1 = currentIndex;
            } else if (randIndex === repeatIndex2) {
                repeatIndex2 = currentIndex;
            }

            // shuffle expressionRootNodes, expressionArrays, expressionEvaluations, expressionStrings
            tempValue = expressionRootNodes[currentIndex];
            expressionRootNodes[currentIndex] = expressionRootNodes[randIndex];
            expressionRootNodes[randIndex] = tempValue;

            tempValue = expressionArrays[currentIndex];
            expressionArrays[currentIndex] = expressionArrays[randIndex];
            expressionArrays[randIndex] = tempValue;

            tempValue = expressionEvaluations[currentIndex];
            expressionEvaluations[currentIndex] = expressionEvaluations[randIndex];
            expressionEvaluations[randIndex] = tempValue;

            tempValue = expressionStrings[currentIndex];
            expressionStrings[currentIndex] = expressionStrings[randIndex];
            expressionStrings[randIndex] = tempValue;
        }
    }

    let res = {};
    res["rootNodes"] = expressionRootNodes;
    res["expressions"] = expressionArrays;
    res["evaluations"] = expressionEvaluations;
    res["strings"] = expressionStrings;
    if (repeat) {
        res["repeat"] = [repeatIndex1, repeatIndex2].sort((a, b) => a - b); // sort in ascending order
    }
    return res;
}

/**
 * recursive function used to make trees
 * @param {Object[]} leafNodes
 * @param {boolean} useNot
 * if true, add 50% chance to make root node NOT operator
 * @param {AttributeFeatureArray[]} availableAttributes
 * @param {string[]} availableOperations
 * @returns {Object} root node of sub tree
 */
function treeGenerator(leafNodes, availableAttributes, availableOperations, useNot, notsLeft = -1) {
    let rootNode;
    let not = false;
    let leftNots, rightNots;
    if (useNot) {
        if (notsLeft < 0) {
            if (randomInt(2) === 0) {
                not = true;
            }
            leftNots, rightNots = -1;
        } else {
            if (randomInt(leafNodes.length * 2 - 1) < notsLeft) {
                not = true;
                notsLeft--;
            }
        }
    }
    if (leafNodes.length === 0) {
        throw new Error("no leaf nodes specified");
    } else if (leafNodes.length === 1) {
        rootNode = leafNodes[0];
    } else {
        // TODO: modify random int generated to be more likely to cut near the center
        let op = availableOperations[randomInt(availableOperations.length)];
        let cut = 1 + randomInt(leafNodes.length - 1);
        let leftLeaves = leafNodes.slice(0, cut);
        let rightLeaves = leafNodes.slice(cut);
        if (notsLeft >= leafNodes.length * 2 - 2) {
            leftNots = leftLeaves.length * 2 - 1;
            rightNots = rightLeaves.length * 2 - 1;
        } else {
            do {
                let r = randomInt(notsLeft + 1);
                leftNots = (r > leftLeaves.length * 2 - 1) ? leftLeaves.length * 2 - 1 : r;
            } while (notsLeft - leftNots > rightLeaves.length * 2 - 1); // inefficient
            rightNots = notsLeft - leftNots;
        }
        let leftRoot = treeGenerator(leftLeaves, availableAttributes, availableOperations, useNot, leftNots);
        let rightRoot = treeGenerator(rightLeaves, availableAttributes, availableOperations, useNot, rightNots);
        rootNode = new OperatorNode(op, [leftRoot, rightRoot]);
    }
    if (not) {
        rootNode = new OperatorNode("NOT", [rootNode]);
    }
    return rootNode;
}

/**
 * utility function; checks shallow equality
 * @param {Object} object1 
 * @param {Object} object2 
 * @returns {boolean}
 */
function objectEqual(object1, object2) {
    let keys1 = Object.keys(object1);
    let keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (let key of keys1) {
        if (object1[key] !== object2[key]) {
            return false;
        }
    }
    return true;
}