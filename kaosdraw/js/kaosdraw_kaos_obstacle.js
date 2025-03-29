/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** KAOSObstacle class
    A KAOS obstacle element.
**/
class KAOSObstacle extends KAOSOperatingElement {
    /** constructor
        :param uuid: a universal unique identifier
        :param idnum: an id number for the displayed identifier
    **/
    constructor(uuid, idnum) {
        super(uuid, idnum);
        this._idname = "Obstacle";
        this._identifier = "O" + idnum;
        this._reference =  this._idname.toLowerCase() + "_" + uuid;
        this._definition = "Obstacles are conditions that prevent goals from being satisfied.";
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

        // create operating elements
        let operColor = new UIColors(8);
        let operPos = {"x": anchors.southsouthwest.x, "y": anchors.southsouthwest.y - 0.5 * this._fontSize};
        this._svgElemOperatingDescriptionBase = this._createSVGElementOperatingDescriptionBase(doc, operPos, operColor);
        this._svgElemOperatingDescription = this._createSVGElementOperatingDescription(doc, operPos);

        // append elements to group
        this._svgGroup.appendChild(this._svgElemBase);
        this._svgGroup.appendChild(this._svgElemIdentifier);
        this._svgGroup.appendChild(this._svgElemDescription);
        this._svgGroup.appendChild(this._svgElemOperatingDescriptionBase);
        this._svgGroup.appendChild(this._svgElemOperatingDescription);

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
        let p2 = {"x": pos.x + (0.5 * size.w), "y": pos.y - (0.5 * size.h)}
        let p3 = {"x": pos.x + (0.5 * size.w), "y": pos.y + (0.5 * size.h)}
        let p4 = {"x": pos.x - (0.5 * size.w), "y": pos.y + (0.5 * size.h)}

        // compute segment
        let angle = 0.375 * Math.PI;
        let seg = size.h / Math.tan(angle);
        p1.x -= (seg / 2);
        p2.x -= (seg / 2);
        p3.x += (seg / 2);
        p4.x += (seg / 2);

        // convert points to string format
        let points = "";
        points += p1.x + "," + p1.y + " ";
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
        if (points.length !== 4) {
            return null;
        }

        // parse vertices
        let p1 = points[0].split(",");
        let p2 = points[1].split(",");
        let p3 = points[2].split(",");
        let p4 = points[3].split(",");
        p1 = (p1.length === 2) ? {"x": parseFloat(p1[0]), "y": parseFloat(p1[1])} : {"x": 0, "y": 0};
        p2 = (p2.length === 2) ? {"x": parseFloat(p2[0]), "y": parseFloat(p2[1])} : {"x": 0, "y": 0};
        p3 = (p3.length === 2) ? {"x": parseFloat(p3[0]), "y": parseFloat(p3[1])} : {"x": 0, "y": 0};
        p4 = (p4.length === 2) ? {"x": parseFloat(p4[0]), "y": parseFloat(p4[1])} : {"x": 0, "y": 0};
        let w = p2.x - p1.x;
        let h = p4.y - p1.y;
        let seg = p1.x - p4.x;

        // compute anchor points
        let anchors = {
            "east":             {"x": dx + p1.x + w - 0.50 * seg,   "y": dy + p1.y + 0.50 * h},
            "eastsoutheast":    {"x": dx + p1.x + w - 0.75 * seg,   "y": dy + p1.y + 0.75 * h},
            "southeast":        {"x": dx + p1.x + w - seg,          "y": dy + p1.y + h},
            "southsoutheast":   {"x": dx + p1.x + 0.75 * w - seg,   "y": dy + p1.y + h},
            "south":            {"x": dx + p1.x + 0.50 * w - seg,   "y": dy + p1.y + h},
            "southsouthwest":   {"x": dx + p1.x + 0.25 * w - seg,   "y": dy + p1.y + h},
            "southwest":        {"x": dx + p1.x - seg,              "y": dy + p1.y + h},
            "westsouthwest":    {"x": dx + p1.x - 0.75 * seg,       "y": dy + p1.y + 0.75 * h},
            "west":             {"x": dx + p1.x - 0.50 * seg,       "y": dy + p1.y + 0.50 * h},
            "westnorthwest":    {"x": dx + p1.x - 0.25 * seg,       "y": dy + p1.y + 0.25 * h},
            "northwest":        {"x": dx + p1.x,                    "y": dy + p1.y},
            "northnorthwest":   {"x": dx + p1.x + 0.25 * w,         "y": dy + p1.y},
            "north":            {"x": dx + p1.x + 0.50 * w,         "y": dy + p1.y},
            "northnortheast":   {"x": dx + p1.x + 0.75 * w,         "y": dy + p1.y},
            "northeast":        {"x": dx + p1.x + w,                "y": dy + p1.y},
            "eastnortheast":    {"x": dx + p1.x + w - 0.25 * seg,   "y": dy + p1.y + 0.25 * h},
            "center":           {"x": dx + p1.x + 0.5 * (w - seg),  "y": dy + p1.y + 0.50 * h},
        };
        return anchors;
    }
}
