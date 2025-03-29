/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** KAOSUtilityFunction class
    A utility function for a KAOS element
**/
class KAOSUtilityFunction extends KAOSFunction {
    /** constructor
        :param type: type of function
        :param pattern: pattern for the function
    **/
    constructor(type, pattern) {
        super(type, pattern);
    }

    /** clone
        Creates a clone of the function.
        :return: an identical clone of the function
    **/
    clone() {
        return new KAOSUtilityFunction(this._type, this._pattern);
    }

    /** createKAOSXMLElement
        Creates an XML element.
        :param doc: the parent document
        :return: an xml element
    **/
    createKAOSXMLElement(doc) {
        let elem = doc.createElement("KAOSUtilityFunction");
        elem.setAttribute("type", this._type);
        for (const key of Object.keys(this._parameters).sort()) {
            let child = doc.createElement("KAOSParameter");
            child.setAttribute("index", key);
            child.setAttribute("name", this._parameters[key]);
            elem.appendChild(child);
        }
        return elem;
    }
}

const UTILITY_FUNCTIONS = [
    new KAOSUtilityFunction("greater_or_equal", "{?} >= {?}"),
    new KAOSUtilityFunction("less_or_equal", "{?} <= {?}"),
    new KAOSUtilityFunction("not_equal", "{?} != {?}"),
    new KAOSUtilityFunction("equal", "{?} == {?}"),
    new KAOSUtilityFunction("greater", "{?} > {?}"),
    new KAOSUtilityFunction("less", "{?} < {?}"),
    new KAOSUtilityFunction("existence", "has {?}"),
    new KAOSUtilityFunction("nonexistence", "has no {?}"),
    new KAOSUtilityFunction("membership", "{?} ∈ {?}"),
    new KAOSUtilityFunction("nonmembership", "{?} ∉ {?}"),
    new KAOSUtilityFunction("fuzzy_triangle", "{?} AS CLOSE AS POSSIBLE TO {?}\nWITHIN +/- {?}"),
    new KAOSUtilityFunction("fuzzy_left", "{?} AS HIGH POSSIBLE TO {?}\nWITHIN {?}"),
    new KAOSUtilityFunction("fuzzy_right", "{?} AS LOW AS POSSIBLE TO {?}\nWITHIN {?}"),
];
