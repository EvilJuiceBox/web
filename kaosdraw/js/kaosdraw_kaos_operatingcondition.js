/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** KAOSOperatingCondition class
    An operating condition for a KAOS element
**/
class KAOSOperatingCondition extends KAOSFunction {
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
        return new KAOSOperatingCondition(this._type, this._pattern);
    }

    /** createKAOSXMLElement
        Creates an XML element.
        :param doc: the parent document
        :return: an xml element
    **/
    createKAOSXMLElement(doc) {
        let elem = doc.createElement("KAOSOperatingCondition");
        elem.setAttribute("type", this._type)
        for (const key of Object.keys(this._parameters).sort()) {
            let child = doc.createElement("KAOSParameter");
            child.setAttribute("index", key);
            child.setAttribute("name", this._parameters[key]);
            elem.appendChild(child);
        }
        return elem;
    }
}

// don't change ordering!
const OPERATING_CONDITIONS = [
    {"func": new KAOSOperatingCondition("greater_or_equal", "{?} >= {?}"),
     "regex": [
        /^(.+)\s+>=\s+(.+)$/i,
        /^(.+)\s+is\s+greater\s+than\s+or\s+equal\s+to\s+(.+)$/i,
        /^(.+)\s+is\s+greater\s+than\s+or\s+equals\s+(.+)$/i,
        /^(.+)\s+greater\s+than\s+or\s+equal\s+to\s+(.+)$/i,
        /^(.+)\s+greater\s+than\s+or\s+equals\s+(.+)$/i,
    ]},
    {"func": new KAOSOperatingCondition("less_or_equal", "{?} <= {?}"),
     "regex": [
        /^(.+)\s+<=\s+(.+)$/i,
        /^(.+)\s+is\s+less\s+than\s+or\s+equal\s+to\s+(.+)$/i,
        /^(.+)\s+is\s+less\s+than\s+or\s+equals\s+(.+)$/i,
        /^(.+)\s+less\s+than\s+or\s+equal\s+to\s+(.+)$/i,
        /^(.+)\s+less\s+than\s+or\s+equals\s+(.+)$/i,
    ]},
    {"func": new KAOSOperatingCondition("not_equal", "{?} != {?}"),
     "regex": [
        /^(.+)\s+!=\s+(.+)$/i,
        /^(.+)\s+does\s+not\s+equal\s+(.+)$/i,
        /^(.+)\s+is\s+not\s+equal\s+to\s+(.+)$/i,
        /^(.+)\s+not\s+equal\s+to\s+(.+)$/i,
    ]},
    {"func": new KAOSOperatingCondition("equal", "{?} == {?}"),
     "regex": [
        /^(.+)\s+==\s+(.+)$/i,
        /^(.+)\s+is\s+equal\s+to\s+(.+)$/i,
        /^(.+)\s+equal\s+to\s+(.+)$/i,
        /^(.+)\s+equals\s+(.+)$/i,
        /^(.+)\s+is\s+(.+)$/i,
    ]},
    {"func": new KAOSOperatingCondition("greater", "{?} > {?}"),
     "regex": [
        /^(.+)\s+>\s+(.+)$/i,
        /^(.+)\s+is\s+greater\s+than\s+(.+)$/i,
        /^(.+)\s+greater\s+than\s+(.+)$/i,
    ]},
    {"func": new KAOSOperatingCondition("less", "{?} < {?}"),
     "regex": [
        /^(.+)\s+<\s+(.+)$/i,
        /^(.+)\s+is\s+less\s+than\s+(.+)$/i,
        /^(.+)\s+less\s+than\s+(.+)$/i,
    ]},
    {"func": new KAOSOperatingCondition("existence", "has {?}"),
     "regex": [
        /^has\s+(.+)$/i,
        /^(.+)\s+does\s+exist$/i,
    ]},
    {"func": new KAOSOperatingCondition("non-existence", "has no {?}"),
     "regex": [
        /^has no \s+(.+)$/i,
        /^(.+)\s+does\s+not\s+exist$/i,
    ]},
    {"func": new KAOSOperatingCondition("membership", "{?} ∈ {?}"),
     "regex": [
        /^(.+)\s+∈\s+(.+)$/i,
        /^(.+)\s+belongs to\s+(.+)$/i,
        /^(.+)\s+in\s+(.+)$/i,
    ]},
];

