/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** KAOSAgent class
    A KAOS agent element.
**/
class KAOSAgent extends KAOSElement {
    /** constructor
        :param uuid: a universal unique identifier
        :param idnum: an id number for the displayed identifier
    **/
    constructor(uuid, idnum) {
        super(uuid, idnum);
        this._idname = "Agent";
        this._identifier = "A" + idnum;
        this._reference =  this._idname.toLowerCase() + "_" + uuid;
        this._definition = "Agents are either human beings or automated components that are responsible for " +
                           "achieving related requirements/expectations.";
        this._svgElemTopic = null;
        this._svgElemTopicBase = null;
        this._topic = "";
    }

    /** topic (getter)
        A topic function.
        :return: a topic function
    **/
    get topic() {
        return this._topic;
    }

    /** topic (setter)
        Sets a topic function.
        :param value: a topic function
    **/
    set topic(value) {
        this._topic = (value !== null) ? value : "";
        let visibility = (value !== "") ? "visible" : "hidden";
        if (this._svgElemTopicBase !== null) {
            this._svgElemTopicBase.setAttribute("visibility", visibility);
        }
        if (this._svgElemTopic !== null) {
            this._svgElemTopic.setAttribute("data-value", this._topic);
            this._svgElemTopic.setAttribute("visibility", visibility);
            let tspans = this._createSVGElementDescriptionText(this._svgElemTopic, this._topic);
            for (let i = 0; i < Math.min(this._maxRows, tspans.length); i++) {
                this._svgElemTopic.appendChild(tspans[i]);
            }
        }
    }

    /** copySVGElement
        Clones the attributes of the given SVG element.
        :param elem: an svg element
    **/
    copySVGElement(elem) {
        super.copySVGElement(elem);
        if (this._svgElemTopic !== null) {
            let topic = this._svgElemTopic.getAttribute("data-topic");
            if (topic !== null) {
                this.topic = topic
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
        if (this.topic !== null) {
            let child = doc.createElement("KAOSAgent");
            child.setAttribute("topic", this._topic);
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
        let elem = doc.createElement("Agent");
        elem.setAttribute("id", this.identifier);
        elem.setAttribute("key", this._description);
        elem.setAttribute("topic", this._topic);
        return elem;
    }

    /** createSVGElement
        Creates a SVG element.
        :param doc: the parent document
        :param pos: a 2d position
        :return: an svg element
    **/
    createSVGElement(doc, pos=null) {
        pos = (pos !== null) ? pos : {"x": 0, "y": 0};

        // create group element
        this._svgGroup = this._createSVGElementGroup(doc);

        // create base element
        let baseSize = this.recommendSize();
        let baseColor = new UIColors(this);
        this._svgElemBase = this._createSVGElementBase(doc, pos, baseSize, baseColor);

        // get anchor points
        let anchors = this._getAnchorPoints();

        // create identifier element
        let identPos = {"x": anchors.northwest.x, "y": anchors.northwest.y};
        this._svgElemIdentifier = this._createSVGElementIdentifier(doc, identPos);

        // create description element
        let descPos = {"x": anchors.southwest.x, "y": anchors.northwest.y + 1.25 * this._fontSize};
        this._svgElemDescription = this._createSVGElementDescription(doc, descPos);

        // create topic elements
        let topicColor = new UIColors(8);
        let topicPos = {"x": anchors.southsouthwest.x, "y": anchors.southsouthwest.y - 0.5 * this._fontSize};
        this._svgElemTopicBase = this._createSVGElementTopicBase(doc, topicPos, topicColor);
        this._svgElemTopic = this._createSVGElementTopic(doc, topicPos);

        // append elements to group
        this._svgGroup.appendChild(this._svgElemBase);
        this._svgGroup.appendChild(this._svgElemIdentifier);
        this._svgGroup.appendChild(this._svgElemDescription);
        this._svgGroup.appendChild(this._svgElemTopicBase);
        this._svgGroup.appendChild(this._svgElemTopic);

        return this._svgGroup;
    }

    /** recommendSize
        :return: a 2d size
    **/
    recommendSize() {
        let minSize = (typeof MIN_ITEM_SIZE !== "undefined") ? MIN_ITEM_SIZE : {"w": 90, "h": 60};
        let textSize = this._measureTextContent();
        textSize.w *= 1.2;
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
        // compute vertices
        let p1 = {"x": pos.x - (0.5 * size.w) + this._fontSize, "y": pos.y - (0.5 * size.h)}
        let p2 = {"x": pos.x + (0.5 * size.w) - this._fontSize, "y": pos.y - (0.5 * size.h)}
        let p2a = {"x": pos.x + (0.5 * size.w), "y": pos.y}
        let p3 = {"x": pos.x + (0.5 * size.w) - this._fontSize, "y": pos.y + (0.5 * size.h)}
        let p4 = {"x": pos.x - (0.5 * size.w) + this._fontSize, "y": pos.y + (0.5 * size.h)}
        let p4a = {"x": pos.x - (0.5 * size.w), "y": pos.y}

        // convert points to string format
        let points = "";
        points += p1.x + "," + p1.y + " ";
        points += p2.x + "," + p2.y + " ";
        points += p2a.x + "," + p2a.y + " ";
        points += p3.x + "," + p3.y + " ";
        points += p4.x + "," + p4.y + " ";
        points += p4a.x + "," + p4a.y;

        // create element
        let elem = doc.createElementNS(SVGNS, "polygon");
        elem.setAttribute("data-element", "svgElemBase");
        elem.setAttribute("data-reference", this._reference);
        elem.setAttribute("class", "selectable");
        elem.setAttribute("fill", color.light);
        elem.setAttribute("stroke", color.full);
        elem.setAttribute("filter", "url(#shadow)");
        elem.setAttribute("points", points);
        return elem;
    }

    /** _createSVGElementTopic
        Creates a topic description SVG element.
        :param doc: the parent document
        :param pos: a 2d position
        :return: an svg element
    **/
    _createSVGElementTopic(doc, pos) {
        let elem = doc.createElementNS(SVGNS, "text");
        elem.setAttribute("data-reference", this._reference);
        elem.setAttribute("data-element", "svgElemTopic");
        elem.setAttribute("data-attribute", "topic");
        elem.setAttribute("data-value", this.topic);
        elem.setAttribute("class", "caption");
        elem.setAttribute("visibility", (this.topic !== "") ? "visible" : "hidden");
        elem.setAttribute("x", pos.x);
        elem.setAttribute("y", pos.y);

        let tspans = this._createSVGElementDescriptionText(elem, this.topic);
        for (let i = 0; i < Math.min(this._maxRows, tspans.length); i++) {
            elem.appendChild(tspans[i]);
        }
        return elem;
    }

    /** _createSVGElementTopicBase
        Creates a topic base SVG element.
        :param doc: the parent document
        :param pos: a 2d position
        :param color: a color
        :return: an svg element
    **/
    _createSVGElementTopicBase(doc, pos, color) {
        let base = {"w": 1.5 * this._fontSize, "h": 1.5 * this._fontSize};
        let textSize = this._measureTopicContent();
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
        elem.setAttribute("data-element", "svgElemTopicBase");
        elem.setAttribute("data-reference", this._reference);
        elem.setAttribute("class", "selectable");
        elem.setAttribute("fill", color.light);
        elem.setAttribute("stroke", color.full);
        elem.setAttribute("filter", "url(#shadow)");
        elem.setAttribute("visibility", (this.topic !== "") ? "visible" : "hidden");
        elem.setAttribute("d", path);
        return elem;
    }

    /** _getAnchorPoints
        Gets a collection of anchor points.
        :return: a collection of anchor points
    **/
    _getAnchorPoints() {
        if ((this._svgGroup === null) || (this._svgElemBase === null)) {
            return null;
        }

        // get group translation
        let NUMERIC_REGEXP = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g;
        let transform = this._svgGroup.getAttribute("transform");
        transform = (transform !== null) ? transform.match(NUMERIC_REGEXP) : [0, 0];
        let dx = parseInt(isNaN(transform[0]) ? 0 : transform[0]);
        let dy = parseInt(isNaN(transform[1]) ? 0 : transform[1]);

        // get svg attributes
        let points = this._svgElemBase.getAttribute("points");
        points = points.split(" ");
        if (points.length !== 6) {
            return null;
        }

        // parse vertices
        let p1 = points[0].split(",");
        let p2 = points[1].split(",");
        let p2a = points[2].split(",");
        let p3 = points[3].split(",");
        let p4 = points[4].split(",");
        let p4a = points[5].split(",");
        p1 = (p1.length === 2) ? {"x": parseFloat(p1[0]), "y": parseFloat(p1[1])} : {"x": 0, "y": 0};
        p2 = (p2.length === 2) ? {"x": parseFloat(p2[0]), "y": parseFloat(p2[1])} : {"x": 0, "y": 0};
        p2a = (p2a.length === 2) ? {"x": parseFloat(p2a[0]), "y": parseFloat(p2a[1])} : {"x": 0, "y": 0};
        p3 = (p3.length === 2) ? {"x": parseFloat(p3[0]), "y": parseFloat(p3[1])} : {"x": 0, "y": 0};
        p4 = (p4.length === 2) ? {"x": parseFloat(p4[0]), "y": parseFloat(p4[1])} : {"x": 0, "y": 0};
        p4a = (p4a.length === 2) ? {"x": parseFloat(p4a[0]), "y": parseFloat(p4a[1])} : {"x": 0, "y": 0};
        let p0 = {"x": p1.x + (p2.x - p1.x) / 2, "y": p1.y + (p4.y - p1.y) / 2};
        let w = p2.x - p1.x;
        let h = p4.y - p1.y;

        // compute anchor points
        let anchors = {
            "east":             {"x": dx + p2a.x,                        "y": dy + p2a.y},
            "eastsoutheast":    {"x": dx + (0.5 * p3.x + 0.5 * p2a.x),   "y": dy + (0.5 * p3.y + 0.5 * p2a.y)},
            "southeast":        {"x": dx + p3.x,                         "y": dy + p3.y},
            "southsoutheast":   {"x": dx + (0.75 * p3.x + 0.25 * p4.x),  "y": dy + p3.y},
            "south":            {"x": dx + (0.50 * p3.x + 0.50 * p4.x),  "y": dy + p3.y},
            "southsouthwest":   {"x": dx + (0.25 * p3.x + 0.75 * p4.x),  "y": dy + p4.y},
            "southwest":        {"x": dx + p4.x,                         "y": dy + p4.y},
            "westsouthwest":    {"x": dx + (0.5 * p4.x + 0.5 * p4a.x),   "y": dy + (0.5 * p4.y + 0.5 * p4a.y)},
            "west":             {"x": dx + p4a.x,                        "y": dy + p4a.y},
            "westnorthwest":    {"x": dx + (0.5 * p1.x + 0.5 * p4a.x),   "y": dy + (0.5 * p1.y + 0.5 * p4a.y)},
            "northwest":        {"x": dx + p1.x,                         "y": dy + p1.y},
            "northnorthwest":   {"x": dx + (0.25 * p2.x + 0.75 * p1.x),  "y": dy + p1.y},
            "north":            {"x": dx + (0.50 * p2.x + 0.50 * p1.x),  "y": dy + p1.y},
            "northnortheast":   {"x": dx + (0.75 * p2.x + 0.25 * p1.x),  "y": dy + p2.y},
            "northeast":        {"x": dx + p2.x,                         "y": dy + p2.y},
            "eastnortheast":    {"x": dx + (0.5 * p2.x + 0.5 * p2a.x),   "y": dy + (0.5 * p2.y + 0.5 * p2a.y)},
            "center":           {"x": dx + p0.x,                         "y": dy + p0.y},
        };

        return anchors;
    }

    /** _getAttributes
        Gets a collection of attribute values.
        :return: a collection of attribute values
    **/
    _getAttributes() {
        let values = super._getAttributes();
        values["topic"] = this.topic;
        return values;
    }

    /** _measureTopicContent
        Measures the text area required for the item's text content.
        :return: a 2d size
    **/
    _measureTopicContent() {
        let w = 0;
        let h = 0;
        if (this._svgElemTopic !== null) {
            for (let i = 0; i < this._svgElemTopic.children.length; i++) {
                let line = this._svgElemTopic.childNodes[i].textContent;
                w = Math.max(w, this._measureTextWidth(line));
                h += this._fontSize * 1.25;
            }
        }
        w += this._fontSize;
        let size = {"w": w, "h": h};
        return size;
    }
}
