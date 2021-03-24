/**
 * OPER acts as an enumerator
 */
const OPER = {
    "AND": 1,
    "OR": 2,
    "NOT": 3,
}

/**
 * used to check valid parameters
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
        this.value = value;
        this.children = children;
        this.nodetype = nodetype;
    }

    _getValue() {
        return this.value;
    }

    _getChildren() {
        return this.children;
    }
}

class OperatorNode extends TreeNode {
    constructor(operator, children) {
        super(operator, children, "operator");
    }
}

class AND_OperatorNode extends OperatorNode {
    constructor(leftchild, rightchild) {
        this.value = OPER.AND;
        this.children = [leftchild, rightchild];
    }

    evaulate(availableAttributes) {
        let evaluatedChildren = [];
        for(let c=0; c<children.length; c++) {
            evaluatedChildren.push(children[c].evaluate(availableAttributes));
        }

        res = evaluatedChildren[0];
        for(let c=1; c<evaluatedChildren.length; c++) {
            for (let a in availableAttributes) {
                if(evaluatedChildren[c][a] !== undefined) {
                    if(res[a] == undefined) {
                        res[a] = evaluatedChildren[c][a];
                    } else {
                        // get intersection of res[a] and evaluatedChildren[c][a]
                        res[a] = res[a].filter(f1 => evaluatedChildren[c][a].some(f2 => f1 === f2))
                    }
                }
            }
        }
    }
}

class OR_OperatorNode extends OperatorNode {
    constructor(leftchild, rightchild) {
        this.value = OPER.OR;
        this.children = [leftchild, rightchild];
    }

    evaulate(availableAttributes) {
        let evaluatedChildren = [];
        for(let c=0; c<children.length; c++) {
            evaluatedChildren.push(children[c].evaluate(availableAttributes));
        }

        res = evaluatedChildren[0];
        for(let c=1; c<evaluatedChildren.length; c++) {
            for (let a in availableAttributes) {
                if(evaluatedChildren[c][a] !== undefined) {
                    if(res[a] == undefined) {
                        res[a] = evaluatedChildren[c][a];
                    } else {
                        // get union of res[a] and evaluatedChildren[c][a]
                        // first concatenates arrays, then turns into set, then back to array
                        res[a] = [...new Set([...res[a], ...evaluatedChildren[c][a]])];
                    }
                }
            }
        }

        return res;
    }
}

class NOT_OperatorNode extends OperatorNode {
    constructor(child) {
        this.value = OPER.NOT;
        this.children = [child];
    }

    evaluate (availableAttributes) {
        evaluatedChild = evaluate(children[0]);
        res = evaluatedChild;

        for(let a in availableAttributes) {
            // get features in availableAttributes and not in res
            res[a] = availableAttributes[a].filter(f1 => !res[a].some(f2 => f1 === f2))
        }

        return res;
    }
}

class FeatureNode extends TreeNode {
    /**
     * @param {int} attribute 
     * @param {*} feature 
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
        if(!availableAttributes.contains(this.attribute))
            throw new Error("tried to evaluate feature node with unavailable attribute");
        if(!avilableAttributes[this.attribute].contains(this.value))
            throw new Error("tried to evaluate feature node with unavailable feature");
        let ft;
        ft[this.attribute] = [this.value];
        return ft;
    }
}