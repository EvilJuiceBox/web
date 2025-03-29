/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** KAOSOperatingElement class
    An abstract operating element belonging to a KAOS model.
**/
class KAOSOperatingElement extends KAOSElement {
    /** constructor
        :param uuid: a universal unique identifier
        :param idnum: an id number for the displayed identifier
    **/
    constructor(uuid, idnum) {
        super(uuid, idnum);
        this._svgElemOperatingDescription = null;
        this._svgElemOperatingDescriptionBase = null;
        this._operatingCondition = null;
        this._operatingDescription = "";
    }

    /** operatingCondition (getter)
        A operating function.
        :return: a operating function
    **/
    get operatingCondition() {
        return this._operatingCondition;
    }

    /** operatingCondition (setter)
        Sets a operating function.
        :param value: a operating function
    **/
    set operatingCondition(value) {
        this._operatingCondition = value;
        if (this._operatingCondition !== null) {
            this._operatingCondition.attach(this, "operatingDescription", this._svgElemOperatingDescription);
        }
        else {
            this.operatingDescription = "";
            if (this._svgElemOperatingDescription !== null) {
                this._svgElemOperatingDescription.removeAttribute("data-func-type");
                this._svgElemOperatingDescription.removeAttribute("data-func-pattern");
                this._svgElemOperatingDescription.removeAttribute("data-func-parameter1");
                this._svgElemOperatingDescription.removeAttribute("data-func-parameter2");
                this._svgElemOperatingDescription.removeAttribute("data-func-parameter3");
            }
        }
    }

    /** operatingDescription (getter)
        A operating description.
        :return: a operating description
    **/
    get operatingDescription() {
        return this._operatingDescription;
    }

    /** operatingDescription (setter)
        Sets the operating description.
        :param value: a description value
    **/
    set operatingDescription(value) {
        this._operatingDescription = (value !== null) ? value : "";;
        let visibility = (value !== "") ? "visible" : "hidden";
        if (this._svgElemOperatingDescriptionBase !== null) {
            this._svgElemOperatingDescriptionBase.setAttribute("visibility", visibility);
        }
        if (this._svgElemOperatingDescription !== null) {
            this._svgElemOperatingDescription.setAttribute("data-value", this._operatingDescription);
            this._svgElemOperatingDescription.setAttribute("visibility", visibility);
            let tspans = this._createSVGElementDescriptionText(this._svgElemOperatingDescription, this._operatingDescription);
            for (let i = 0; i < Math.min(this._maxRows, tspans.length); i++) {
                this._svgElemOperatingDescription.appendChild(tspans[i]);
            }
        }
    }

    /** copySVGElement
        Clones the attributes of the given SVG element.
        :param elem: an svg element
    **/
    copySVGElement(elem) {
        super.copySVGElement(elem);
        if (this._svgElemOperatingDescription !== null) {
            let funcType = this._svgElemOperatingDescription.getAttribute("data-func-type");
            let funcPattern = this._svgElemOperatingDescription.getAttribute("data-func-pattern");
            if ((funcType !== null) && (funcPattern !== null)) {
                this.operatingCondition = new KAOSOperatingCondition(funcType, funcPattern);
                for (let i = 0; i < this.operatingCondition.numParameters; i++) {
                    let funcParam = this._svgElemOperatingDescription.getAttribute("data-func-parameter" + (i + 1));
                    this.operatingCondition.setParameter(i + 1, funcParam);
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
        if (this.operatingCondition !== null) {
            let child = this.operatingCondition.createKAOSXMLElement(doc);
            elem.appendChild(child);
        }
        return elem;
    }

    /** _createSVGElementOperatingDescription
        Creates a operating description SVG element.
        :param doc: the parent document
        :param pos: a 2d position
        :return: an svg element
    **/
    _createSVGElementOperatingDescription(doc, pos) {
        let elem = doc.createElementNS(SVGNS, "text");
        elem.setAttribute("data-reference", this._reference);
        elem.setAttribute("data-element", "svgElemOperatingDescription");
        elem.setAttribute("data-attribute", "operatingDescription");
        elem.setAttribute("data-value", this.operatingDescription);
        elem.setAttribute("class", "caption");
        elem.setAttribute("visibility", (this.operatingDescription !== "") ? "visible" : "hidden");
        elem.setAttribute("x", pos.x);
        elem.setAttribute("y", pos.y);
        let tspans = this._createSVGElementDescriptionText(elem, this.operatingDescription);
        for (let i = 0; i < Math.min(this._maxRows, tspans.length); i++) {
            elem.appendChild(tspans[i]);
        }
        if (this.operatingCondition !== null) {
            this.operatingCondition.attach(this, "operatingDescription", elem);
        }
        return elem;
    }

    /** _createSVGElementOperatingDescriptionBase
        Creates a operating base SVG element.
        :param doc: the parent document
        :param pos: a 2d position
        :param color: a color
        :return: an svg element
    **/
    _createSVGElementOperatingDescriptionBase(doc, pos, color) {
        let base = {"w": 1.5 * this._fontSize, "h": 1.5 * this._fontSize};
        let textSize = this._measureOperatingDescriptionContent();
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
        elem.setAttribute("data-element", "svgElemOperatingDescriptionBase");
        elem.setAttribute("data-reference", this._reference);
        elem.setAttribute("class", "selectable");
        elem.setAttribute("fill", color.light);
        elem.setAttribute("stroke", color.full);
        elem.setAttribute("filter", "url(#shadow)");
        elem.setAttribute("visibility", (this.operatingDescription !== "") ? "visible" : "hidden");
        elem.setAttribute("d", path);
        return elem;
    }

    /** _getAttributes
        Gets a collection of attribute values.
        :return: a collection of attribute values
    **/
    _getAttributes() {
        let values = super._getAttributes();
        values["operatingDescription"] = this.operatingDescription;
        values["operatingCondition"] = this.operatingCondition;
        if (this.operatingCondition !== null) {
            let n = this.operatingCondition.numParameters;
            for (let i = 0; i < n; i++) {
                let param = this.operatingCondition.getParameter(i + 1);
                values["operatingCondition_param" + (i + 1)] = (param !== null) ? param : "";
            }
        }
        return values;
    }

    /** _measureOperatingTextContent
        Measures the text area required for the item's text content.
        :return: a 2d size
    **/
    _measureOperatingDescriptionContent() {
        let w = 0;
        let h = 0;
        if (this._svgElemOperatingDescription !== null) {
            for (let i = 0; i < this._svgElemOperatingDescription.children.length; i++) {
                let line = this._svgElemOperatingDescription.childNodes[i].textContent;
                w = Math.max(w, this._measureTextWidth(line));
                h += this._fontSize * 1.25;
            }
        }
        w += this._fontSize;
        let size = {"w": w, "h": h};
        return size;
    }

    /** _parseDescriptionFunction
        Parse description into function.
        :param text: text value
        :return: matched function
    **/
    _parseDescriptionFunction(options, text) {
        for (let i = 0; i < options.length; i++) {
            let regexPatterns = options[i].regex;
            for (let j = 0; j < regexPatterns.length; j++) {
                let regexMatch = regexPatterns[j].exec(text);
                if (regexMatch !== null) {
                    let func = options[i].func.clone();
                    for (let k = 1; k < regexMatch.length; k++) {
                        func.setParameter(k, regexMatch[k]);
                    }
                    return func;
                }
            }
        }
        return null;
    }

    /** _setAttributes
        Sets a collection of attribute values.
        :param values: a collection of attribute values
    **/
    _setAttributes(values) {
        super._setAttributes(values);

        // set operating func params
        for (const key of Object.keys(values)) {
            if (key.indexOf("operatingCondition_param") >= 0) {
                let i = parseInt(key.replace("operatingCondition_param", ""));
                if (!(isNaN(i)) && (this.operatingCondition !== null)) {
                    this.operatingCondition.setParameter(i, values[key]);
                }
            }
        }
    }
}
