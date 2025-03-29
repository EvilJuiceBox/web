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
    new KAOSOperatingCondition("greater_or_equal", "{?} >= {?}"),
    new KAOSOperatingCondition("less_or_equal", "{?} <= {?}"),
    new KAOSOperatingCondition("not_equal", "{?} != {?}"),
    new KAOSOperatingCondition("equal", "{?} == {?}"),
    new KAOSOperatingCondition("greater", "{?} > {?}"),
    new KAOSOperatingCondition("less", "{?} < {?}"),
    new KAOSOperatingCondition("existence", "has {?}"),
    new KAOSOperatingCondition("non-existence", "has no {?}"),
    new KAOSOperatingCondition("membership", "{?} ∈ {?}"),
    new KAOSOperatingCondition("nonmembership", "{?} ∉ {?}"),
];
