/**
 * every operation
 */
const OPER = ["AND", "OR", "NOT"]

/**
 * every possible attribute and feature; used to check valid parameters
 */
const ATTR = {
    "SHAPE": ["SQUARE", "TRIANGLE", "CIRCLE", "PENTAGON", "TRAPEZOID"],
    "COLOR": ["RED", "ORANGE", "GREEN", "BLUE", "PURPLE"],
    "PATTERN": ["PLAIN", "STRIPED", "SPOTS", "LATTICE", "SWIRL"],
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
        this._isBinary = (operator !== "NOT");
        if(this.isBinary() && children.length != 2) {
            throw new Error("binary operator node must have two chldren");
        } else if (!this.isBinary() && children.length != 1) {
            throw new Error("unary operator node must have one child")
        }
        super(operator, children, "operator");
    }

    isBinary() {
        return this._isBinary;
    }

    getString() {
        if (!this.isBinary()) {
            s = this.getValue();
            for (c of this.getChildren()) { // loop not needed since it's just NOT (unary)
                s += " " + c.getString();
            }
            return s;
        } else {
            return "(" + this.getChildren()[0].getString() + " " + this.getValue() + " " + this.getChildren() + ")";
        }
    }

    evaulate(availableAttributes) {
        let evaluatedChildren = [];
        for(let c=0; c<children.length; c++) {
            evaluatedChildren.push(children[c].evaluate(availableAttributes));
        }
        res = evaluatedChildren[0];
        
        if (this.getValue() === "NOT") {
            for(let a in availableAttributes) {
                // get features in availableAttributes and not in res
                res[a] = availableAttributes[a].filter(f1 => !res[a].some(f2 => f1 === f2))
            }
        } else if (this.getValue() === "AND") {
            for (let a in availableAttributes) {
                if(evaluatedChildren[1][a] !== undefined) { // if the feature list of the second is undefined, do nothing
                    if(res[a] == undefined) { // if the feature list of the first is undefined, make it the second
                        res[a] = evaluatedChildren[1][a];
                    } else {
                        // get intersection of res[a] and evaluatedChildren[1][a]
                        res[a] = res[a].filter(f1 => evaluatedChildren[1][a].some(f2 => f1 === f2))
                    }
                }
            }
        } else if (this.getValue() === "OR") {
            for (let a in availableAttributes) {
                if(evaluatedChildren[1][a] !== undefined) {
                    if(res[a] == undefined) {
                        res[a] = evaluatedChildren[1][a];
                    } else {
                        // get union of res[a] and evaluatedChildren[1][a]
                        // first concatenates arrays, then turns into Set, then back to array
                        res[a] = [...new Set([...res[a], ...evaluatedChildren[1][a]])];
                    }
                }
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
     *  an object of available attributes as keys and arrays of available features as values
     */
    evaluate(availableAttributes) {
        if(availableAttributes.hasOwnProperty(this.attribute))
            throw new Error("tried to evaluate feature node with unavailable attribute");
        if(!avilableAttributes[this.attribute].includes(this.getValue()))
            throw new Error("tried to evaluate feature node with unavailable feature");
        let ft;
        ft[this.attribute] = [this.getValue()];
        return ft;
    }

    getString() {
        return this.getValue();
    }
}

/**
 * utility function
 * @param {integer} min 
 * @param {integer} max 
 * @returns integer from min inclusive to max exclusive
 */
function randomInt(min, max) {
    if (min > max)
        throw new Error("randomInt: max must be >= min");
    return Math.floor(min) + Math.floor(Math.random() * Math.floor(max - min));
}

/**
 * create and return 10 unique expression trees
 * @param {integer} numFeatures 
 * the number of features in each expression. should be >= 2
 * @param {object} availableAttributes 
 * json object. keys are attribute strings, values are feature string arrays
 * @param {string array} availableOperations 
 * @param {boolean} repeat 
 * if true, include exactly two expressions with the same evalutaion
 * @returns {json}
 * expressions: array of root nodes
 * evaluations: array of evaluation objects
 * repeat: two indices with the same evalutaion
 */
function createUniqueExpressions(numFeatures, availableAttributes, availableOperations, repeat = false) {
    expressionRootNodes = [];
    expressionStrings = [];

    let useNot = false;
    if (aviailableOperations.includes("NOT")) {
        useNot = true;
    }
    let binaryOperators = [];
    if (aviailableOperations.includes("AND")) {
        binaryOperators.push("AND");
    }
    if (aviailableOperations.includes("OR")) {
        useOr = true;
    }

    for (let e = 0; e < 10; e++) {
        // create random feature nodes
        let randFeatures = [];
        let randFeatureNodes = [];
        for (let f=0; f<numFeatures; f++) {
            do {
                // select random attribute from availableAttributes.keys()
                var rand_at = availableAttributes[randomInt(0, availableAttributes.keys().length)];
                // select random feature from availableAttributes[rand_at]
                var rand_ft = availableAttributes[rand_at][randomInt(0, availableAttributes[rand_at].length)];
            } while (!randFeatures.includes(rand_ft))
            randFeatures.push(rand_ft);
            randFeatureNodes.push(new FeatureNode(rand_at, rand_ft));
        }

        // generate random trees with numFeatures leaves
        let rootNode = treeGenerator(numFeatures)
    }
}

/**
 * recursive function
 * @param {*} numLeaves 
 * @param {*} availableAttributes 
 * @param {*} availableOperations 
 */
function treeGenerator(numLeaves, availableAttributes, availableOperations) {

}