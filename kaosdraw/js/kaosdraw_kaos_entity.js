/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** KAOSEntity class
    An abstract entity belonging to a KAOS model.
**/
class KAOSEntity {
    /** constructor
        :param uuid: a universal unique identifier
        :param idnum: an id number for the displayed identifier
    **/
    constructor(uuid) {
        this._idname = "Entity"
        this._reference =  this._idname.toLowerCase() + "_" + uuid;
        this._definition = "";
        this._identifier = "";
    }

    /** attributes (getter)
        A collection of attribute values.
        :return: a collection of attribute values
    **/
    get attributes() {
        return this._getAttributes();
    }

    /** attributes (setter)
        Sets a collection of attribute values.
        :param values: a collection of attribute values
    **/
    set attributes(values) {
        this._setAttributes(values);
    }

    /** definition (getter)
        A definition description of the entity.
        :return: a definition description of the entity.
    **/
    get definition() {
        return this._definition;
    }

    /** identifier (getter)
        The displayed identifier.
        :return: an identifier
    **/
    get identifier() {
        return this._identifier;
    }

    /** identifier (setter)
        Sets the displayed identifier.
        :param value: an identifier value
    **/
    set identifier(value) {
        this._identifier = value;
    }

    /** reference (getter)
        The unique reference.
        :return: a unique reference
    **/
    get reference() {
        return this._reference;
    }

    /** createKAOSXMLElement
        Creates an XML element.
        :param doc: the parent document
        :return: an xml element
    **/
    createKAOSXMLElement(doc) {
        let elem = doc.createElement(this.constructor.name);
        elem.setAttribute("id", this.identifier);
        return elem;
    }

    /** toString
        Converts entity into a string form.
        :return: a string representation
    **/
    toString() {
        let text = this._idname + " " + this._identifier;
        return text;
    }

    /** _getAttributes
        Gets a collection of attribute values.
        :return: a collection of attribute values
    **/
    _getAttributes() {
        return {
            "reference": this.reference,
            "definition": this.definition,
            "identifier": this.identifier,
        };
    }

    /** _setAttributes
        Sets a collection of attribute values.
        :param values: a collection of attribute values
    **/
    _setAttributes(values) {
        // get attributes permitted for editing
        let permitted = this._getAttributes();;
        if ("reference" in permitted) {
            // never permit reference to be edited
            delete permitted["reference"];
        }

        // iterate through each attribute in value and set it
        for (const attribute of Object.keys(values)) {
            if ((attribute in permitted) && (attribute in this)) {
                try {
                    this[attribute] = values[attribute];
                }
                catch (e) {
                    // pass: attribute has no setter (ignore)
                }
            }
        }
    }
}
