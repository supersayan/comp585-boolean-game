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
    constructor(value, children, nodetype) {
        this._value = value;
        this._children = children;
        this._nodetype = nodetype;
    }

    getValue() {
        return this._value;
    }

    getChildren() {
        return this._children;
    }

    getNodeType() {
        return this._nodetype;
    }
}

class OperatorNode extends TreeNode {
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

    isBinary() {
        return this._isBinary;
    }

    getString() {
        if (this.isBinary()) {
            return "(" + this.getChildren()[0].getString() + " " + this.getValue() + " " + this.getChildren()[1].getString() + ")";
        } else {
            return "(" + this.getValue() + " " + this.getChildren()[0].getString() + ")";
        }
    }

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
}

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
     * returns an object { Attribute: Feature }
     * @param {object array} availableAttributes
     * @returns an array of objects of available attributes as keys and available features as values
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

    getString() {
        return this.getValue();
    }
}

/**
 * 
 * @param {object} item 
 * @param {object array} availableAttributes 
 * @returns index of the feature combination in the expected generated boolean array
 */
export function getBooleanArrayIndexOfItem(item, availableAttributes) {
    function recursiveBooleanArray(index, item, remainingAttributes) {
        if (remainingAttributes.length === 0) {
            return index; // recursive end
        } else {
            let d = Object.values(remainingAttributes[0]).length;
            let f = Object.values(remainingAttributes[0])[0].indexOf(Object.values(item[0])[0]);
            return recursiveBooleanArray(index * d + f, item.slice(1), remainingAttributes.slice(1));
        }
    }
    return recursiveBooleanArray(0, item, availableAttributes);
}

/**
 * utility function
 * @param {integer} min 
 * @param {integer} max 
 * @returns integer from 0 inclusive to max exclusive
 */
function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

/**
 * create and returns unique expression trees
 * @param {integer} numExpressions
 * @param {integer} numFeatures 
 * the number of features in each expression. should be >= 2
 * @param {object} availableAttributes 
 * @param {string array} availableOperations 
 * @param {boolean} repeat 
 * if true, include exactly two expressions with the same evalutaion
 * @returns {object}
 * expressions: array of root nodes
 * evaluations: array of evaluation objects
 * repeat: two indices with the same evalutaion
 */
export function createUniqueExpressions(numExpressions, numFeatures, availableAttributes, availableOperations, repeat = false) {
    let sum = 0;
    for (let a of availableAttributes) {
        sum += Object.values(a)[0].length;
    }
    if (numFeatures > sum) {
        throw new Error("numFeatures cannot be larger than number of available features");
    }

    let expressionRootNodes = [];
    let expressionEvaluations = [];
    let expressionStrings = [];

    let useNot = false;
    if (availableOperations.includes("NOT")) {
        useNot = true;
        availableOperations = availableOperations.filter(o => o != "NOT"); //remove "NOT" from array
    }

    // if (repeat)
    //     numExpressions--;
    for (let e = 0; e < numExpressions; e++) {
        // create random feature nodes
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
            randFeatures.push(rand_ft);
            randFeatureNodes.push(new FeatureNode(rand_at, rand_ft));
        }

        // generate random trees with numFeatures leaves
        let rootNode = treeGenerator(randFeatureNodes, useNot, availableAttributes, availableOperations);
        let evaluation = rootNode.evaluate(availableAttributes);
        // if(repeat === true) {
        //     while(expressionEvaluations.some(ee => objectEqual(ee, evaluation))) { // possible infinite loop
        //         rootNode = treeGenerator(numFeatures, useNot, availableAttributes, availableOperations);
        //         evaluation = rootNode.evaluate(availableAttributes);
        //     }
        // }

        expressionRootNodes.push(rootNode);
        expressionEvaluations.push(evaluation);
        expressionStrings.push(rootNode.getString());
    }

    let res = {};
    res["expressions"] = expressionRootNodes;
    res["evaluations"] = expressionEvaluations;
    res["strings"] = expressionStrings;
    return res;
}

/**
 * recursive function
 * @param {object array} leafNodes
 * @param {boolean} useNot
 * if true, add 50% chance to make root node NOT operator
 * @param {object} availableAttributes 
 * @param {object} availableOperations
 * @returns {object} root node of sub tree
 */
function treeGenerator(leafNodes, useNot, availableAttributes, availableOperations) {
    let rootNode;
    if (leafNodes.length === 0) {
        throw new Error("no leaf nodes specified");
    } else if (leafNodes.length === 1) {
        rootNode = leafNodes[0];
    } else {
        let op = availableOperations[randomInt(availableOperations.length)];
        let cut = 1 + randomInt(leafNodes.length - 1);
        let leftLeaves = leafNodes.slice(0, cut);
        let rightLeaves = leafNodes.slice(cut);
        let leftRoot = treeGenerator(leftLeaves, useNot, availableAttributes, availableOperations);
        let rightRoot = treeGenerator(rightLeaves, useNot, availableAttributes, availableOperations);
        rootNode = new OperatorNode(op, [leftRoot, rightRoot]);
    }
    if (useNot && randomInt(2) === 0) { // 50% chance
        rootNode = new OperatorNode("NOT", [rootNode])
    }
    return rootNode;
}

/**
 * utility function; checks shallow equality
 * @param {object} object1 
 * @param {object} object2 
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

// testing
// let aa = [
//     {"SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"]},
//     {"COLOR": ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"]},
// ]
// // let f = new FeatureNode("COLOR", "GREEN");
// // console.log(f.evaluate(aa));
// let e = createUniqueExpressions(10, 3, aa, ["AND", "OR", "NOT"]);
// let item = [
//     {SHAPE: "SQUARE"},
//     {COLOR: "RED"}
// ]
// for (let i=0; i<10; i++) {
//     console.log(e.strings[i]);
//     console.log(e.evaluations[i]);
//     // console.log(e.evaluations[i][getBooleanArrayIndexOfItem(item, aa)]); // returns if expression e accepts item
// }