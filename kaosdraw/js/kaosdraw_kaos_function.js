/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** KAOSFunction class
    An abstract function for a KAOS element.
**/
class KAOSFunction {
    /** constructor
        :param type: type of function
        :param pattern: pattern for the function
    **/
    constructor(type, pattern) {
        this._type = type;
        this._pattern = pattern;
        this._parameters = {};
        this._item = null;
        this._attribute = null;
        this._elem = null;
    }

    /** numParameters (getter)
        Number of parameters expected for the function
        :return: number of expected parameters
    **/
    get numParameters() {
        return this.parsePlaceholders().length;
    }

    /** pattern (getter)
        Pattern for the function
        :return: function pattern
    **/
    get pattern() {
        return this._pattern;
    }

    /** type (getter)
        Type of the function
        :return: function type
    **/
    get type() {
        return this._type;
    }

    /** attach
        Attaches function to the given KAOS item and SVG element.
        :param item: an item
        :param attribute: an attribute of the item
        :param elem: an svg element
    **/
    attach(item, attribute, elem) {
        this._item = item;
        this._attribute = attribute;
        this._elem = elem;
        this._sync();
    }

    /** clone
        Creates a clone of the function.
        :return: an identical clone of the function
    **/
    clone() {
        return new KAOSFunction(this._type, this._pattern);
    }

    /** createKAOSXMLElement
        Creates an XML element.
        :param doc: the parent document
        :return: an xml element
    **/
    createKAOSXMLElement(doc) {
        let elem = doc.createElement("KAOSFunction");
        elem.setAttribute("type", this._type);
        if ((this._item !== null) && (typeof this._item.objective !== "undefined")) {
            if (this._item.objective !== "") {
                elem.setAttribute("objective", this._item.objective);
            }
        }
        for (const key of Object.keys(this._parameters).sort()) {
            let child = doc.createElement("KAOSParameter");
            child.setAttribute("index", key);
            child.setAttribute("value", this._parameters[key]);
            elem.appendChild(child);
        }
        return elem;
    }

    /** createLogicXMLElement
        Creates an XML element.
        :param doc: the parent document
        :return: an xml element
    **/
    createLogicXMLElement(doc) {
        let elem = doc.createElement("Function");
        elem.setAttribute("id", (this._item !== null) ? this._item.identifier : "");
        elem.setAttribute("type", this._type);
        if ((this._item !== null) && (typeof this._item.objective !== "undefined")) {
            if (this._item.objective !== "") {
                elem.setAttribute("objective", this._item.objective);
            }
        }
        for (const key of Object.keys(this._parameters).sort()) {
            let child = doc.createElement("Parameter");
            child.setAttribute("index", key);
            child.setAttribute("value", this._parameters[key]);
            elem.appendChild(child);
        }
        return elem;
    }

    /** getParameter
        Get the value of the indexed parameter
        :param i: the parameter index
        :return: the parameter value
    **/
    getParameter(i) {
        if (i in this._parameters) {
            return this._parameters[i];
        }
        return null;
    }

    /** parsePlaceholders
        Parses the function pattern to get placeholder positions.
        :return: the index of each placeholder in the pattern
    **/
    parsePlaceholders() {
        let indices = [];
        let i = 0;
        while (i > -1) {
            i = this._pattern.indexOf("{?}", i);
            if (i >= 0) {
                indices.push(i);
                i++;
            }
        }
        return indices;
    }

    /** setParameter
        Sets the value of the indexed parameter
        :param i: the parameter index
        :param value: the parameter value
    **/
    setParameter(i, value) {
        this._parameters[i] = value;
        if ((value === null) || (value === "")) {
            delete this._parameters[i];
        }
        this._sync();
    }

    /** toString
        Converts function into a string form.
        :return: a string representation
    **/
    toString() {
        let text = this._pattern;

        // replace placeholders with parameters
        let idx = this.parsePlaceholders();
        for (let i = idx.length; i >= 0; i--) {
            if ((i + 1) in this._parameters) {
                text = text.substring(0, idx[i]) + this._parameters[i + 1] + text.substring(idx[i] + 3);
            }
        }
        return text;
    }

    /** _sync
        Updates contents of the attached SVG element with current function attributes.
    **/
    _sync() {
        if ((this._item !== null) && (this._attribute in this._item)){
            this._item[this._attribute] = this.toString();
        }

        if (this._elem !== null) {
            this._elem.setAttribute("data-func-type", this._type);
            this._elem.setAttribute("data-func-pattern", this._pattern);
            for (const key of Object.keys(this._parameters).sort()) {
                this._elem.setAttribute("data-func-parameter" + key, this._parameters[key]);
            }
        }
    }
}
