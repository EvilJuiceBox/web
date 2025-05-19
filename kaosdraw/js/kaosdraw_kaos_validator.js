/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** KAOSValidator class
    Performs validation for a KAOS model.
**/
class KAOSValidator {
    /** constructor
        :param model: a kaos model
    **/
    constructor(model) {
        this._model = model;
    }

    /** validate
        Validates the model.
        :return: a collection of violations
    **/
    validate() {
        let violations = [];
        violations = violations.concat(this._validateModel());
        violations = violations.concat(this._validateItems());
        return violations;
    }

    /** _validateAgent
        Validate a KAOS agent.
        :param item: an item
        :return: a collection of violations
    **/
    _validateAgent(item) {
        let violations = [];
        if (item instanceof KAOSAgent) {

        }
        return violations;
    }

    /** _validateDomainProperty
        Validate a KAOS domain property.
        :param item: an item
        :return: a collection of violations
    **/
    _validateDomainProperty(item) {
        let violations = [];
        if (item instanceof KAOSDomainProperty) {
            if (item.utilityFunction !== null) {
                let numParams = item.utilityFunction.numParameters;
                for (let i = 0; i < numParams; i++) {
                    let param = item.utilityFunction.getParameter(i + 1);
                    if (param === null) {
                        violations.push({
                            "reference": item.reference,
                            "message": "Parameter #" + (i + 1) + " not specified.",
                        });
                    }
                }
            }
        }
        return violations;
    }

    /** _validateElement
        Validate a KAOS element.
        :param item: an item
        :return: a collection of violations   
    **/
    _validateElement(item) {
        let violations = [];
        if (item instanceof KAOSElement) {
            if ((item.description === null) || (item.description.toString().trim().length === 0)) {
                violations.push({
                    "reference": item.reference,
                    "message": "Description is missing.",
                });
            }
            if (this._model.items.length > 1) {
                let relationships = this._model.getRelationshipsFor(item);
                if (relationships.length === 0) {
                    violations.push({
                        "reference": item.reference,
                        "message": "Needs a relationship.",
                    });
                }
            }
        }
        violations = violations.concat(this._validateAgent(item));
        violations = violations.concat(this._validateDomainProperty(item));
        violations = violations.concat(this._validateGoal(item));
        violations = violations.concat(this._validateObstacle(item));
        return violations;
    }

    /** _validateGoal
        Validate a KAOS goal.
        :param item: an item
        :return: a collection of violations   
    **/
    _validateGoal(item) {
        let violations = [];
        if (item instanceof KAOSGoal) {
            if (item.utilityFunction !== null) {
                let numParams = item.utilityFunction.numParameters;
                for (let i = 0; i < numParams; i++) {
                    let param = item.utilityFunction.getParameter(i + 1);
                    if (param === null) {
                        violations.push({
                            "reference": item.reference,
                            "message": "Parameter #" + (i + 1) + " not specified.",
                        });
                    }
                }
            }
        }
        return violations;
    }

    /** _validateItem
        Validate a single item in the KAOS model.
        :param item: an item
        :return: a collection of violations
    **/
    _validateItem(item) {
        let violations = [];
        if (item instanceof KAOSItem) {
            if ((item.identifer === null) || (item.identifier.toString().trim().length === 0)) {
                violations.push({
                    "reference": item.reference,
                    "message": "Identifier is missing.",
                });
            }
            if (this._model.findItems(item.identifier, "identifier").length > 1) {
                violations.push({
                    "reference": item.reference,
                    "message": "Duplicate identifier found.",
                });
            }
        }

        violations = violations.concat(this._validateElement(item));
        violations = violations.concat(this._validateRelationship(item));
        return violations;
    }

    /** _validateItems
        Validate all items in the KAOS model.
        :return: a collection of violations
    **/
    _validateItems() {
        let violations = [];
        for (let i = 0; i < this._model.items.length; i++) {
            let curr = this._model.items[i];
            violations = violations.concat(this._validateItem(curr));
        }
        return violations;
    }

    /** _validateModel
        Validate the KAOS model.
        :return: a collection of violations
    **/
    _validateModel() {
        let violations = [];
        if (this._model instanceof KAOSModel) {
            if ((this._model.identifer === null) || (this._model.identifier.toString().trim().length === 0)) {
                violations.push({
                    "reference": this._model.reference,
                    "message": "Identifier is missing.",
                });
            }
            if (this._model.items.length > 0) {
                let roots = this._model.findRoots();
                if (roots.length === 0) {
                    violations.push({
                        "reference": this._model.reference,
                        "message": "No root has been specified.",
                    });
                }
                if (roots.length > 1) {
                    violations.push({
                        "reference": this._model.reference,
                        "message": "Multiple roots exist.",
                    });
                }
            }
        }
        return violations;
    }

    /** _validateObstacle
        Validate a KAOS obstacle.
        :param item: an item
        :return: a collection of violations
    **/
    _validateObstacle(item) {
        let violations = [];
        if (item instanceof KAOSObstacle) {
            if (item.operatingCondition !== null) {
                let numParams = item.operatingCondition.numParameters;
                for (let i = 0; i < numParams; i++) {
                    let param = item.operatingCondition.getParameter(i + 1);
                    if (param === null) {
                        violations.push({
                            "reference": item.reference,
                            "message": "Parameter #" + (i + 1) + " not specified.",
                        });
                    }
                }
            }
        }
        return violations;
    }

    /** _validateRelationship
        Validate a KAOS relationship.
        :param item: an item
        :return: a collection of violations
    **/
    _validateRelationship(item) {
        let violations = [];
        if (item instanceof KAOSRelationship) {
            if (item.source === null) {
                violations.push({
                    "reference": item.reference,
                    "message": "Needs a source.",
                });
            }
            if (item.target === null) {
                violations.push({
                    "reference": item.reference,
                    "message": "Needs a target.",
                });
            }
            if (item.checkConstraints() === false) {
                violations.push({
                    "reference": item.reference,
                    "message": "Invalid relationship.",
                });
            }
        }
        return violations;
    }
}
