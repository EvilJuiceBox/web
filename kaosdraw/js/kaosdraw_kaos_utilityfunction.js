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
    {"func": new KAOSUtilityFunction("greater_or_equal", "{?} >= {?}"),
     "regex": [
        /^(.+)\s+>=\s+(.+)$/i,
        /^(.+)\s+is\s+greater\s+than\s+or\s+equal\s+to\s+(.+)$/i,
        /^(.+)\s+is\s+greater\s+than\s+or\s+equals\s+(.+)$/i,
        /^(.+)\s+greater\s+than\s+or\s+equal\s+to\s+(.+)$/i,
        /^(.+)\s+greater\s+than\s+or\s+equals\s+(.+)$/i,
    ]},
    {"func": new KAOSUtilityFunction("less_or_equal", "{?} <= {?}"),
     "regex": [
        /^(.+)\s+<=\s+(.+)$/i,
        /^(.+)\s+is\s+less\s+than\s+or\s+equal\s+to\s+(.+)$/i,
        /^(.+)\s+is\s+less\s+than\s+or\s+equals\s+(.+)$/i,
        /^(.+)\s+less\s+than\s+or\s+equal\s+to\s+(.+)$/i,
        /^(.+)\s+less\s+than\s+or\s+equals\s+(.+)$/i,
    ]},
    {"func": new KAOSUtilityFunction("not_equal", "{?} != {?}"),
     "regex": [
        /^(.+)\s+!=\s+(.+)$/i,
        /^(.+)\s+does\s+not\s+equal\s+(.+)$/i,
        /^(.+)\s+is\s+not\s+equal\s+to\s+(.+)$/i,
        /^(.+)\s+not\s+equal\s+to\s+(.+)$/i,
    ]},
    {"func": new KAOSUtilityFunction("equal", "{?} == {?}"),
     "regex": [
        /^(.+)\s+==\s+(.+)$/i,
        /^(.+)\s+is\s+equal\s+to\s+(.+)$/i,
        /^(.+)\s+equal\s+to\s+(.+)$/i,
        /^(.+)\s+equals\s+(.+)$/i,
        /^(.+)\s+is\s+(.+)$/i,
    ]},
    {"func": new KAOSUtilityFunction("greater", "{?} > {?}"),
     "regex": [
        /^(.+)\s+>\s+(.+)$/i,
        /^(.+)\s+is\s+greater\s+than\s+(.+)$/i,
        /^(.+)\s+greater\s+than\s+(.+)$/i,
    ]},
    {"func": new KAOSUtilityFunction("less", "{?} < {?}"),
     "regex": [
        /^(.+)\s+<\s+(.+)$/i,
        /^(.+)\s+is\s+less\s+than\s+(.+)$/i,
        /^(.+)\s+less\s+than\s+(.+)$/i,
    ]},
    {"func": new KAOSUtilityFunction("existence", "has {?}"),
     "regex": [
        /^has\s+(.+)$/i,
        /^(.+)\s+does\s+exist$/i,
    ]},
    {"func": new KAOSUtilityFunction("nonexistence", "has no {?}"),
     "regex": [
        /^has no \s+(.+)$/i,
        /^(.+)\s+does\s+not\s+exist$/i,
    ]},
    {"func": new KAOSUtilityFunction("membership", "{?} ∈ {?}"),
     "regex": [
        /^(.+)\s+∈\s+(.+)$/i,
        /^(.+)\s+belongs\s+to\s+(.+)$/i,
        /^(.+)\s+in\s+(.+)$/i,
    ]},
    {"func": new KAOSUtilityFunction("nonmembership", "{?} ∉ {?}"),
     "regex": [
        /^(.+)\s+∉\s+(.+)$/i,
        /^(.+)\s+does\s+not\s+belong\s+to\s+(.+)$/i,
        /^(.+)\s+not\s+in\s+(.+)$/i,
    ]},
    {"func": new KAOSUtilityFunction("fuzzy_triangle", "{?} as close to {?} within +/- {?}"),
     "regex": [
        /^([\S]+)\s+as\s+close\s+as\s+possible\s+to\s+([\S]+)\s+within\s+([\S]+)$/i,
        /^([\S]+)\s+as\s+close\s+to\s+([\S]+)\s+as\s+possible\s+within\s+([\S]+)$/i,
        /^([\S]+)\s+is\s+as\s+close\s+as\s+possible\s+to\s+([\S]+)\s+within\s+([\S]+)$/i,
        /^([\S]+)\s+is\s+as\s+close\s+to\s+([\S]+)\s+as\s+possible\s+within\s+([\S]+)$/i,
        /^([\S]+)\s+is\s+as\s+close\s+to\s+([\S]+)\s+within\s+([\S]+)$/i,
    ]},
    {"func": new KAOSUtilityFunction("fuzzy_left", "{?} as high as {?} within {?}"),
     "regex": [
        /^([\S]+)\s+as\s+much\s+as\s+possible\s+up\s+to\s+([\S]+)\s+within\s+([\S]+)$/i,
        /^([\S]+)\s+is\s+as\s+much\s+as\s+possible\s+up\s+to\s+([\S]+)\s+within\s+([\S]+)$/i,
        /^([\S]+)\s+is\s+as\s+high\s+as\s+([\S]+)\s+within\s+([\S]+)$/i,
    ]},
    {"func": new KAOSUtilityFunction("fuzzy_right", "{?} as low as {?} within {?}"),
     "regex": [
        /^([\S]+)\s+as\s+less\s+as\s+possible\s+down\s+to\s+([\S]+)\s+within\s+([\S]+)$/i,
        /^([\S]+)\s+is\s+as\s+less\s+as\s+possible\s+down\s+to\s+([\S]+)\s+within\s+([\S]+)$/i,
        /^([\S]+)\s+is\s+as\s+low\s+as\s+([\S]+)\s+within\s+([\S]+)$/i,
    ]},
];
