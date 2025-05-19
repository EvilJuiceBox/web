/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** KAOSUtilityElement class
    An abstract utility element belonging to a KAOS model.
**/
class KAOSUtilityElement extends KAOSElement {
    /** constructor
        :param uuid: a universal unique identifier
        :param idnum: an id number for the displayed identifier
    **/
    constructor(uuid, idnum) {
        super(uuid, idnum);
        this._svgElemUtilityDescription = null;
        this._svgElemUtilityDescriptionBase = null;
        this._utilityFunction = null;
        this._utilityDescription = "";
    }

    /** utilityDescription (getter)
        A utility description.
        :return: a utility description
    **/
    get utilityDescription() {
        return this._utilityDescription;
    }

    /** utilityDescription (setter)
        Sets the utility description.
        :param value: a description value
    **/
    set utilityDescription(value) {
        this._utilityDescription = (value !== null) ? value : "";
        let visibility = (value !== "") ? "visible" : "hidden";
        if (this._svgElemUtilityDescriptionBase !== null) {
            this._svgElemUtilityDescriptionBase.setAttribute("visibility", visibility);
        }
        if (this._svgElemUtilityDescription !== null) {
            this._svgElemUtilityDescription.setAttribute("data-value", this._utilityDescription);
            this._svgElemUtilityDescription.setAttribute("visibility", visibility);
            let tspans = this._createSVGElementDescriptionText(this._svgElemUtilityDescription, this._utilityDescription);
            for (let i = 0; i < Math.min(this._maxRows, tspans.length); i++) {
                this._svgElemUtilityDescription.appendChild(tspans[i]);
            }
        }
    }

    /** utilityFunction (getter)
        A utility function.
        :return: a utility function
    **/
    get utilityFunction() {
        return this._utilityFunction;
    }

    /** utilityFunction (setter)
        Sets a utility function.
        :param value: a utility function
    **/
    set utilityFunction(value) {
        this._utilityFunction = value;
        if (this._utilityFunction !== null) {
            this._utilityFunction.attach(this, "utilityDescription", this._svgElemUtilityDescription);
        }
        else {
            this.utilityDescription = "";
            if (this._svgElemUtilityDescription !== null) {
                this._svgElemUtilityDescription.removeAttribute("data-func-type");
                this._svgElemUtilityDescription.removeAttribute("data-func-pattern");
                this._svgElemUtilityDescription.removeAttribute("data-func-parameter1");
                this._svgElemUtilityDescription.removeAttribute("data-func-parameter2");
                this._svgElemUtilityDescription.removeAttribute("data-func-parameter3");
            }
        }
    }

    /** copySVGElement
        Clones the attributes of the given SVG element.
        :param elem: an svg element
    **/
    copySVGElement(elem) {
        super.copySVGElement(elem);
        if (this._svgElemUtilityDescription !== null) {
            let funcType = this._svgElemUtilityDescription.getAttribute("data-func-type");
            let funcPattern = this._svgElemUtilityDescription.getAttribute("data-func-pattern");
            if ((funcType !== null) && (funcPattern !== null)) {
                this.utilityFunction = new KAOSUtilityFunction(funcType, funcPattern);
                for (let i = 0; i < this.utilityFunction.numParameters; i++) {
                    let funcParam = this._svgElemUtilityDescription.getAttribute("data-func-parameter" + (i + 1));
                    this.utilityFunction.setParameter(i + 1, funcParam);
                }
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
        if (this.utilityFunction !== null) {
            let child = this.utilityFunction.createKAOSXMLElement(doc);
            elem.appendChild(child);
        }
        return elem;
    }

    /** _createSVGElementUtilityDescription
        Creates a utility description SVG element.
        :param doc: the parent document
        :param pos: a 2d position
        :return: an svg element
    **/
    _createSVGElementUtilityDescription(doc, pos) {
        let elem = doc.createElementNS(SVGNS, "text");
        elem.setAttribute("data-reference", this._reference);
        elem.setAttribute("data-element", "svgElemUtilityDescription");
        elem.setAttribute("data-attribute", "utilityDescription");
        elem.setAttribute("data-value", this.utilityDescription);
        elem.setAttribute("class", "caption");
        elem.setAttribute("visibility", (this.utilityDescription !== "") ? "visible" : "hidden");
        elem.setAttribute("x", pos.x);
        elem.setAttribute("y", pos.y);

        let tspans = this._createSVGElementDescriptionText(elem, this.utilityDescription);
        for (let i = 0; i < Math.min(this._maxRows, tspans.length); i++) {
            elem.appendChild(tspans[i]);
        }
        if (this.utilityFunction !== null) {
            this.utilityFunction.attach(this, "utilityDescription", elem);
        }
        return elem;
    }

    /** _createSVGElementUtilityDescriptionBase
        Creates a utility base SVG element.
        :param doc: the parent document
        :param pos: a 2d position
        :param color: a color
        :return: an svg element
    **/
    _createSVGElementUtilityDescriptionBase(doc, pos, color) {
        let base = {"w": 1.5 * this._fontSize, "h": 1.5 * this._fontSize};
        let textSize = this._measureUtilityDescriptionContent();
        let size = {"w": Math.max(base.w, textSize.w), "h": Math.max(base.h, textSize.h)};

        // compute vertices
        let p0 = {"x": pos.x + (0.5 * size.w), "y": pos.y + (0.5 * size.h)};
        let p1 = {"x": p0.x - (0.5 * size.w), "y": p0.y - (0.5 * size.h)};
        let p2 = {"x": p0.x + (0.5 * size.w), "y": p0.y - (0.5 * size.h)};
        let p2a = {"x": p0.x + (0.5 * size.w) + (0.25 * base.w), "y": p0.y - (0.33 * base.h)};
        let p2b = {"x": p0.x + (0.5 * size.w) + (0.25 * base.w), "y": p0.y + (0.33 * base.h)};
        let p3 = {"x": p0.x + (0.5 * size.w), "y": p0.y + (0.5 * size.h)};
        let p4 = {"x": p0.x - (0.5 * size.w), "y": p0.y + (0.5 * size.h)};
        let p4a = {"x": p0.x - (0.5 * size.w) - (0.25 * base.w), "y": p0.y + (0.33 * base.h)};
        let p4b = {"x": p0.x - (0.5 * size.w) - (0.25 * base.w), "y": p0.y - (0.33 * base.h)};

        // create path string
        let path = "";
        path += "M " + p1.x + " " + p1.y;
        path += " L " + p2.x + " " + p2.y;
        path += " C " + p2a.x + " " + p2a.y + " " + p2b.x + " " + p2b.y + " " + p3.x + " " + p3.y;
        path += " L " + p4.x + " " + p4.y;
        path += " C " + p4a.x + " " + p4a.y + " " + p4b.x + " " + p4b.y + " " + p1.x + " " + p1.y;

        // create element
        let elem = doc.createElementNS(SVGNS, "path");
        elem.setAttribute("data-element", "svgElemUtilityDescriptionBase");
        elem.setAttribute("data-reference", this._reference);
        elem.setAttribute("class", "selectable");
        elem.setAttribute("fill", color.light);
        elem.setAttribute("stroke", color.full);
        elem.setAttribute("filter", "url(#shadow)");
        elem.setAttribute("visibility", (this.utilityDescription !== "") ? "visible" : "hidden");
        elem.setAttribute("d", path);
        return elem;
    }

    /** _getAttributes
        Gets a collection of attribute values.
        :return: a collection of attribute values
    **/
    _getAttributes() {
        let values = super._getAttributes();
        values["utilityDescription"] = this.utilityDescription;
        values["utilityFunction"] = this.utilityFunction;
        if (this.utilityFunction !== null) {
            let n = this.utilityFunction.numParameters;
            for (let i = 0; i < n; i++) {
                let param = this.utilityFunction.getParameter(i + 1);
                values["utilityFunction_param" + (i + 1)] = (param !== null) ? param : "";
            }
        }
        return values;
    }

    /** _measureUtilityDescriptionContent
        Measures the text area required for the item's text content.
        :return: a 2d size
    **/
    _measureUtilityDescriptionContent() {
        let w = 0;
        let h = 0;
        if (this._svgElemUtilityDescription !== null) {
            for (let i = 0; i < this._svgElemUtilityDescription.children.length; i++) {
                let line = this._svgElemUtilityDescription.childNodes[i].textContent;
                w = Math.max(w, this._measureTextWidth(line));
                h += this._fontSize * 1.25;
            }
        }
        w += this._fontSize;
        let size = {"w": w, "h": h};
        return size;
    }

    /** _setAttributes
        Sets a collection of attribute values.
        :param values: a collection of attribute values
    **/
    _setAttributes(values) {
        super._setAttributes(values);

        // set utility func params
        for (const key of Object.keys(values)) {
            if (key.indexOf("utilityFunction_param") >= 0) {
                let i = parseInt(key.replace("utilityFunction_param", ""));
                if (!(isNaN(i)) && (this.utilityFunction !== null)) {
                    this.utilityFunction.setParameter(i, values[key]);
                }
            }
        }
    }
}
