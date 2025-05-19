/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** KAOSItem class
    An abstract item belonging to a KAOS model.
**/
class KAOSItem extends KAOSEntity {
    /** constructor
        :param uuid: a universal unique identifier
        :param idnum: an id number for the displayed identifier
    **/
    constructor(uuid, idnum) {
        super(uuid);
        this._idname = "Item"
        this._reference =  this._idname.toLowerCase() + "_" + uuid;
        this._definition = "";
        this._identifier = "";
        this._maxColumns = (typeof MAX_LINE_COLUMNS !== "undefined") ? MAX_LINE_COLUMNS : 40;
        this._maxRows =  (typeof MAX_LINE_ROWS !== "undefined") ? MAX_LINE_ROWS : 4;
        this._svgElemBase = null;
        this._svgElemIdentifier = null;
        this._svgGroup = null;

        // get default font size
        this._fontSize = (typeof TEXT_FONT_SIZE !== "undefined") ? TEXT_FONT_SIZE : 16;
    }

    /** anchors (getter)
        Anchor points.
        :return: a collection of anchor points
    **/
    get anchors() {
        return this._getAnchorPoints();
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
        if (this._svgElemIdentifier !== null) {
            // Update corresonding svg element for identifier
            this._svgElemIdentifier.setAttribute("data-value", this._identifier);
            this._svgElemIdentifier.textContent = this._identifier.substring(0, this._maxColumns);
        }
    }

    /** svgGroup (getter)
        The SVG group element corresponding to the item.
        :return: an svg group element
    **/
    get svgGroup() {
        return this._svgGroup;
    }

    /** transform (getter)
        The transform corresponding to the item's SVG group.
        :return: an svg transform
    **/
    get transform() {
        try {
            return (this._svgGroup !== null) ? this._svgGroup.transform.baseVal.getItem(0) : null;
        }
        catch (e) {
            return null;
        }
    }

    /** transform (setter)
        Sets the transform corresponding to the item's SVG group.
        :param value: an svg transform
    **/
    set transform(value) {
        if (this._svgGroup !== null) {
            this._svgGroup.transform.baseVal.insertItemBefore(value, 0);
        }
    }

    /** chooseAnchor
        Chooses the ideal anchor for the given point.
        :param pos: a 2d position
        :return: a 2d anchor point
    **/
    chooseAnchor(pos) {
        // get anchor points
        let anchorPoints = this._getAnchorPoints();
        if (anchorPoints === null) {
            return null;
        }

        // list all desired anchors
        let desired = [
            "east",
            "eastsoutheast",
            // "southeast",
            "southsoutheast",
            "south",
            "southsouthwest",
            // "southwest",
            "westsouthwest",
            "west",
            "westnorthwest",
            // "northwest",
            "northnorthwest",
            "north",
            "northnortheast",
            // "northeast",
            "eastnortheast",
        ];

        // reduce to the number of available options
        let options = [];
        for (const option of desired) {
            if (typeof option !== "undefined") {
                options.push(option);
            }
        }

        // compute closest anchor point to given position
        let closestAnchor = null;
        let closestDist = null;
        for (let i = 0; i < options.length; i++) {
            let dx = anchorPoints[options[i]].x - pos.x;
            let dy = anchorPoints[options[i]].y - pos.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if ((closestDist === null) || (dist < closestDist)) {
                closestAnchor = options[i];
                closestDist = dist;
            }
        }
        return closestAnchor;
    }

    /** chooseAnchorPoint
        Chooses the ideal anchor for the given point.
        :param pos: a 2d position
        :return: a 2d anchor point
    **/
    chooseAnchorPoint(pos) {
        // get anchor points
        let anchorPoints = this._getAnchorPoints();
        if (anchorPoints === null) {
            return pos;
        }

        // choose anchor
        let anchor = this.chooseAnchor(pos);
        if (anchor === null) {
            return pos;
        }

        // return associated anchor point
        let anchorPoint = anchorPoints[anchor];
        return anchorPoint;
    }
    
    /** copySVGElement
        Clones the attributes of the given SVG element.
        :param elem: an svg element
    **/
    copySVGElement(elem) {
        // get matching element
        let elementType = "_" + elem.getAttribute("data-element");
        if (elementType in this) {
            // copy attributes to matching element
            let ignore = ["id", "data-reference"];
            for (let j = 0; j < elem.attributes.length; j++) {
                let attr = elem.attributes[j];
                if ((attr.specified) && (ignore.indexOf(attr.name) < 0)) {
                    this[elementType].setAttribute(attr.name, attr.value);
                }
            }
        }

        // update any attributes
        let attribute = elem.getAttribute("data-attribute");
        if (attribute !== null) {
            // get the value of the attribute and copy it
            let value = elem.getAttribute("data-value");
            if (attribute in this) {
                try {
                    this[attribute] = value;
                }
                catch (e) {
                    // pass: attribute has no setter (ignore)
                }
            }
        }

        // recursively repeat for all children
        for (let i = 0; i < elem.children.length; i++) {
            this.copySVGElement(elem.children[i]);
        }
    }

    /** createSVGElement
        Creates a SVG element.
        :param doc: the parent document
        :param pos: a 2d position
        :return: an svg element
    **/
    createSVGElement(doc, pos) {
        return null;
    }

    /** highlight
        Updates appearance of item to highlight it.
        :param value: highlight toggle value
    **/
    highlight(value) {
        if (this._svgElemBase !== null) {
            this._svgElemBase.setAttribute("stroke-width", (value) ? "3" : "1");
        }
    }

    /** recommendSize
        :return: a 2d size
    **/
    recommendSize() {
        let minSize = (typeof MIN_ITEM_SIZE !== "undefined") ? MIN_ITEM_SIZE : {"w": 90, "h": 60};
        let textSize = this._measureTextContent();
        let size = {"w": Math.max(minSize.w, textSize.w), "h": Math.max(minSize.h, textSize.h)};
        return size;
    }

    /** _createSVGElementBase
        Creates the base SVG element.
        :param doc: the parent document
        :param pos: a 2d position
        :param size: a 2d size
        :param color: a color value
        :return: an svg element
    **/
    _createSVGElementBase(doc, pos, size, color) {
        return null;
    }

    /** _createSVGElementGroup
        Creates a group SVG element.
        :param doc: the parent document
        :return an svg element
    **/
    _createSVGElementGroup(doc) {
        let elem = doc.createElementNS(SVGNS, "g");
        elem.setAttribute("data-reference", this._reference);
        elem.setAttribute("data-entity", this.constructor.name);
        elem.setAttribute("data-element", "svgGroup");
        elem.setAttribute("data-identifier", this._identifier);
        elem.setAttribute("class", "selectable");
        return elem;
    }

    /** _createSVGElementIdentifier
        Creates an identifier SVG element.
        :param doc: the parent document
        :param pos: a 2d position
        :return an svg element
    **/
    _createSVGElementIdentifier(doc, pos) {
        let elem = doc.createElementNS(SVGNS, "text");
        elem.setAttribute("data-reference", this._reference);
        elem.setAttribute("data-element", "svgElemIdentifier");
        elem.setAttribute("data-attribute", "identifier");
        elem.setAttribute("data-value", this._identifier);
        elem.setAttribute("class", "caption");
        elem.setAttribute("x", pos.x + 0.5 * this._fontSize);
        elem.setAttribute("y", pos.y + this._fontSize);
        elem.textContent = this._identifier.substring(0, this._maxColumns);
        return elem;
    }

    /** _getAnchorPoints
        Gets a collection of anchor points.
        :return: a collection of anchor points
    **/
    _getAnchorPoints() {
        return null;
    }

    /** _linewrapText
        Breaks up text into a number of lines to fit the given line length.
        :param text: a text value
        :return: a collection of text lines
    **/
    _linewrapText(text) {
        let result = [];
        let temp = text.split("\n");
        for (let i = 0; i < temp.length; i++) {
            while (temp[i].length > 0) {
                let n = temp[i].length;
                if (n > this._maxColumns) {
                    n = this._maxColumns - 1;
                    while ((n > 0) && (temp[i][n] !== " ")) {
                        n--;
                    }
                    n = (n > 0) ? n : this._maxColumns;
                }
                result.push(temp[i].substring(0, n).trim());
                temp[i] = temp[i].substring(n);
            }
        }
        return result;
    }

    /** _measureTextContent
        Measures the text area required for the item's text content.
        :return: a 2d size
    **/
    _measureTextContent() {
        let w = 0;
        let h = 0;
        if (this._svgElemIdentifier !== null) {
            let line = this._svgElemIdentifier.textContent;
            w = Math.max(w, this._measureTextWidth(line));
            h += this._fontSize * 1.25;
        }
        w += this._fontSize;
        let size = {"w": w, "h": h};
        return size;
    }

    /** _measureTextWidth
        :param text: a line of text
        :return: the length of the text in pixels
    **/
    _measureTextWidth(text) {
        // check device and browser
        let isDeviceDesktop = (typeof IS_DEVICE_DESKTOP !== "undefined") ? IS_DEVICE_DESKTOP() : false;
        let isChrome = (typeof IS_BROWSER_CHROME !== "undefined") ? IS_BROWSER_CHROME() : false;
        let isEdge = (typeof IS_BROWSER_EDGE !== "undefined") ? IS_BROWSER_EDGE() : false;
        let isFirefox = (typeof IS_BROWSER_FIREFOX !== "undefined") ? IS_BROWSER_FIREFOX() : false;

        // method 1: use hidden canvas to measure text width
        function _method1(text) {
            let result = 0;
            let context = (typeof HIDDEN_CANVAS_2D !== "undefined") ? HIDDEN_CANVAS_2D : null;
            if (context !== null) {
                let metrics = context.measureText(text);
                result = metrics.width;
            }
            return result;
        }

        // method 2: use DOM to measure text width
        function _method2(text) {
            let elem = document.createElement("span");
            elem.style.float = "left";
            elem.style.font = HIDDEN_CANVAS_FONT;
            elem.style.visibility = "hidden";
            elem.innerHTML = text;
            document.body.appendChild(elem);
            let w = elem.clientWidth;
            document.body.removeChild(elem);
            return w;
        }

        // make a rough estimate by default
        let result = text.length * (0.4 * this._fontSize);
        if (isDeviceDesktop) {
            // measure width of text using alternative methods and use the largest result
            let w1 = _method1(text);
            let w2 = _method2(text);
            result = Math.max(w1, w2);
        }

        return result;
    }
}
