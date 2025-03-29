/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** KAOSElement class
    An abstract element belonging to a KAOS model.
**/
class KAOSElement extends KAOSItem {
    /** constructor
        :param uuid: a universal unique identifier
        :param idnum: an id number for the displayed identifier
    **/
    constructor(uuid, idnum) {
        super(uuid, idnum);
        this._description = "";
        this._svgElemDescription = null;
    }

    /** description (getter)
        A description.
        :return: a description
    **/
    get description() {
        return this._description;
    }

    /** description (setter)
        Sets the description.
        :param value: a description value
    **/
    set description(value) {
        this._description = value;
        if (this._svgElemDescription !== null) {
            // update description svg element
            this._svgElemDescription.setAttribute("data-value", this._description);
            let tspans = this._createSVGElementDescriptionText(this._svgElemDescription, this._description);
            for (let i = 0; i < Math.min(this._maxRows, tspans.length); i++) {
                this._svgElemDescription.appendChild(tspans[i]);
            }
        }
    }

    /** createKAOSXMLElement
        Creates an XML element.
        :param doc: the parent document
        :return: an xml element
    **/
    createKAOSXMLElement(doc) {
        let elem = super.createKAOSXMLElement(doc);
        elem.setAttribute("description", this.description);
        return elem;
    }

    /** toString
        Converts element into a string form.
        :return: a string representation
    **/
    toString() {
        let modifier = "";
        let text = this._idname + " " + modifier + this._identifier + " \"" + this._description + "\"";
        return text;
    }

    /** _createSVGElementDescription
        Creates a description SVG element.
        :param doc: the parent document
        :param pos: a 2d position
        :return: an svg element
    **/
    _createSVGElementDescription(doc, pos) {
        let elem = doc.createElementNS(SVGNS, "text");
        elem.setAttribute("data-reference", this._reference);
        elem.setAttribute("data-element", "svgElemDescription");
        elem.setAttribute("data-attribute", "description");
        elem.setAttribute("data-value", this._description);
        elem.setAttribute("class", "caption");
        elem.setAttribute("x", pos.x);
        elem.setAttribute("y", pos.y);
        let tspans = this._createSVGElementDescriptionText(elem, this._description);
        for (let i = 0; i < Math.min(this._maxRows, tspans.length); i++) {
            elem.appendChild(tspans[i]);
        }
        return elem;
    }

    /** _createSVGElementDescriptionText
        Resets the text content of the description SVG element, forcing line-wrap.
        :param elem: a parent svg element
        :return: a collection of tspan elements
    **/
    _createSVGElementDescriptionText(elem, text) {
        text = (text !== null) ? text : "";
        let tspans = [];
        if (elem !== null) {
            while (elem.firstChild) {
                elem.removeChild(elem.lastChild);
            }
            let x = parseInt(elem.getAttribute("x"));
            let lines = this._linewrapText(text);
            for (let i = 0; i < lines.length; i++) {
                let tspan = elem.ownerDocument.createElementNS(SVGNS, "tspan");
                tspan.setAttribute("data-reference", this._reference);
                tspan.setAttribute("x", x + 8);
                tspan.setAttribute("dy", "1.2em");
                tspan.textContent = lines[i];
                tspans.push(tspan);
            }
        }
        return tspans;
    }

    /** _getAttributes
        Gets a collection of attribute values.
        :return: a collection of attribute values
    **/
    _getAttributes() {
        return {
            "reference": this.reference,
            "definition": this.definition,
            "description": this.description,
            "identifier": this.identifier,
        };
    }

    /** _measureTextContent
        Measures the text area required for the item's text content.
        :return: a 2d size
    **/
    _measureTextContent() {
        let w = 0;
        let h = 0;
        if (this._svgElemDescription !== null) {
            for (let i = 0; i < this._svgElemDescription.children.length; i++) {
                let line = this._svgElemDescription.childNodes[i].textContent;
                w = Math.max(w, this._measureTextWidth(line));
                h += this._fontSize * 1.25;
            }
        }
        w += this._fontSize;
        let size = super._measureTextContent();
        size.w = Math.max(size.w, w);
        size.h += h;
        return size;
    }
}
