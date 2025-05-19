/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** KAOSDomainProperty class
    A KAOS domain property element.
**/
class KAOSDomainProperty extends KAOSUtilityElement {
    /** constructor
        :param uuid: a universal unique identifier
        :param idnum: an id number for the displayed identifier
    **/
    constructor(uuid, idnum) {
        super(uuid, idnum);
        this._idname = "DomainProperty";
        this._identifier = "D" + idnum;
        this._reference =  this._idname.toLowerCase() + "_" + uuid;
        this._definition = "Domain properties are properties relevant to the application domain. They are used in " +
                           "refinements to prove that a refinement is complete.";
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
        let descPos = {"x": anchors.northwest.x, "y": anchors.northwest.y + 1.25 * this._fontSize};
        this._svgElemDescription = this._createSVGElementDescription(doc, descPos);

        // create utility elements
        let utilColor = new UIColors(8);
        let utilPos = {"x": anchors.southsouthwest.x, "y": anchors.southsouthwest.y - 0.5 * this._fontSize};
        this._svgElemUtilityDescriptionBase = this._createSVGElementUtilityDescriptionBase(doc, utilPos, utilColor);
        this._svgElemUtilityDescription = this._createSVGElementUtilityDescription(doc, utilPos);

        // append elements to group
        this._svgGroup.appendChild(this._svgElemBase);
        this._svgGroup.appendChild(this._svgElemIdentifier);
        this._svgGroup.appendChild(this._svgElemDescription);
        this._svgGroup.appendChild(this._svgElemUtilityDescriptionBase);
        this._svgGroup.appendChild(this._svgElemUtilityDescription);

        return this._svgGroup;
    }

    /** recommendSize
        :return: a 2d size
    **/
    recommendSize() {
        let minSize = (typeof MIN_ITEM_SIZE !== "undefined") ? MIN_ITEM_SIZE : {"w": 90, "h": 60};
        let textSize = this._measureTextContent();
        textSize.w *= 1.2;
        textSize.h += this._fontSize;
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
        let p1 = {"x": pos.x - (0.5 * size.w), "y": pos.y - (0.5 * size.h)}
        let p1a = {"x": pos.x, "y": pos.y - (0.5 * size.h) - this._fontSize}
        let p2 = {"x": pos.x + (0.5 * size.w), "y": pos.y - (0.5 * size.h)}
        let p3 = {"x": pos.x + (0.5 * size.w), "y": pos.y + (0.5 * size.h)}
        let p4 = {"x": pos.x - (0.5 * size.w), "y": pos.y + (0.5 * size.h)}

        // convert points to string format
        let points = "";
        points += p1.x + "," + p1.y + " ";
        points += p1a.x + "," + p1a.y + " ";
        points += p2.x + "," + p2.y + " ";
        points += p3.x + "," + p3.y + " ";
        points += p4.x + "," + p4.y;

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
        if (points.length !== 5) {
            return null;
        }

        // parse vertices
        let p1 = points[0].split(",");
        let p1a = points[1].split(",");
        let p2 = points[2].split(",");
        let p3 = points[3].split(",");
        let p4 = points[4].split(",");
        p1 = (p1.length === 2) ? {"x": parseFloat(p1[0]), "y": parseFloat(p1[1])} : {"x": 0, "y": 0};
        p1a = (p1a.length === 2) ? {"x": parseFloat(p1a[0]), "y": parseFloat(p1a[1])} : {"x": 0, "y": 0};
        p2 = (p2.length === 2) ? {"x": parseFloat(p2[0]), "y": parseFloat(p2[1])} : {"x": 0, "y": 0};
        p3 = (p3.length === 2) ? {"x": parseFloat(p3[0]), "y": parseFloat(p3[1])} : {"x": 0, "y": 0};
        p4 = (p4.length === 2) ? {"x": parseFloat(p4[0]), "y": parseFloat(p4[1])} : {"x": 0, "y": 0};
        let p0 = {"x": p1.x + (p2.x - p1.x) / 2, "y": p1.y + (p4.y - p1.y) / 2};
        let w = p2.x - p1.x;
        let h = p4.y - p1.y;

        // compute anchor points
        let anchors = {
            "east":             {"x": dx + p2.x,                         "y": dy + (0.50 * p2.y + 0.50 * p3.y)},
            "eastsoutheast":    {"x": dx + p3.x,                         "y": dy + (0.25 * p2.y + 0.75 * p3.y)},
            "southeast":        {"x": dx + p3.x,                         "y": dy + p3.y},
            "southsoutheast":   {"x": dx + (0.75 * p3.x + 0.25 * p4.x),  "y": dy + p3.y},
            "south":            {"x": dx + (0.50 * p3.x + 0.50 * p4.x),  "y": dy + p3.y},
            "southsouthwest":   {"x": dx + (0.25 * p3.x + 0.75 * p4.x),  "y": dy + p4.y},
            "southwest":        {"x": dx + p4.x,                         "y": dy + p4.y},
            "westsouthwest":    {"x": dx + p4.x,                         "y": dy + (0.25 * p1.y + 0.75 * p4.y)},
            "west":             {"x": dx + p4.x,                         "y": dy + (0.50 * p1.y + 0.50 * p4.y)},
            "westnorthwest":    {"x": dx + p1.x,                         "y": dy + (0.75 * p1.y + 0.25 * p4.y)},
            "northwest":        {"x": dx + p1.x,                         "y": dy + p1.y},
            "northnorthwest":   {"x": dx + (0.5 * p1.x + 0.5 * p1a.x),   "y": dy + (0.5 * p1.y + 0.5 * p1a.y)},
            "north":            {"x": dx + p1a.x,                        "y": dy + p1a.y},
            "northnortheast":   {"x": dx + (0.5 * p2.x + 0.5 * p1a.x),   "y": dy + (0.5 * p1.y + 0.5 * p1a.y)},
            "northeast":        {"x": dx + p2.x,                         "y": dy + p2.y},
            "eastnortheast":    {"x": dx + p2.x,                         "y": dy + (0.75 * p2.y + 0.25 * p3.y)},
            "center":           {"x": dx + p0.x,                         "y": dy + p0.y},
        };

        return anchors;
    }
}
