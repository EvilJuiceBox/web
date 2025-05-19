/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** KAOSGoal class
    A KAOS goal element.
**/
class KAOSGoal extends KAOSUtilityElement {
    /** constructor
        :param uuid: a universal unique identifier
        :param idnum: an id number for the displayed identifier
    **/
    constructor(uuid, idnum) {
        super(uuid, idnum);
        this._idname = "Goal";
        this._identifier = "G" + idnum;
        this._reference =  this._idname.toLowerCase() + "_" + uuid;
        this._definition = "Goals are desired system properties that have been expressed by stakeholders.";
        this._isRequirement = false;
        this._objective = "";
        this._svgElemObjective = null;
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

        let text = this._description;
        let prefix = (this._objective !== null) ? this._objective : "";
        if (prefix.length > 0) {
            prefix = prefix.charAt(0).toUpperCase() + prefix.substr(1).toLowerCase();
            text = prefix + " [" + text + "]";
        }

        if (this._svgElemDescription !== null) {
            // update description svg element
            this._svgElemDescription.setAttribute("data-value", this._description);
            let tspans = this._createSVGElementDescriptionText(this._svgElemDescription, text);
            for (let i = 0; i < Math.min(this._maxRows, tspans.length); i++) {
                this._svgElemDescription.appendChild(tspans[i]);
            }
        }

        if (this._svgElemObjective !== null) {
            // update objective svg element
            this._svgElemObjective.setAttribute("data-value", this._objective);
        }
    }

    /** isAchieve (getter)
        Whether or not the goal objective is to achieve.
        :return: a status value
    **/
    get isAchieve() {
        return (this._objective !== null && this._objective.toLowerCase() === "achieve");
    }

    /** isAchieve (setter)
        Sets whether or not the goal objective is to achieve.
        :param value: a status value
    **/
    set isAchieve(value) {
        if (value) {
            this._objective = "achieve";
        }
        else if (this._objective === "achieve") {
            this._objective = "";
        }

        // trigger update to description element
        this.description = this._description;
    }

    /** isAvoid (getter)
        Whether or not the goal objective is to avoid.
        :return: a status value
    **/
    get isAvoid() {
        return (this._objective !== null && this._objective.toLowerCase() === "avoid");
    }

    /** isAvoid (setter)
        Sets whether or not the goal objective is to avoid.
        :param value: a status value
    **/
    set isAvoid(value) {
        if (value) {
            this._objective = "avoid";
        }
        else if (this._objective === "avoid") {
            this._objective = "";
        }

        // trigger update to description element
        this.description = this._description;
    }

    /** isMaintain (getter)
        Whether or not the goal objective is to maintain.
        :return: a status value
    **/
    get isMaintain() {
        return (this._objective !== null && this._objective.toLowerCase() === "maintain");
    }

    /** isMaintain (setter)
        Sets whether or not the goal objective is to maintain.
        :param value: a status value
    **/
    set isMaintain(value) {
        if (value) {
            this._objective = "maintain";
        }
        else if (this._objective === "maintain") {
            this._objective = "";
        }

        // trigger update to description element
        this.description = this._description;
    }

    /** isRequirement (getter)
        Whether or not the goal is a requirement.
        :return: a status value
    **/
    get isRequirement() {
        return this._isRequirement;
    }

    /** isRequirement (setter)
        Sets whether or not the goal is a requirement.
        :param value: a status value
    **/
    set isRequirement(value) {
        this._isRequirement = value;
        if (this._svgElemBase !== null) {
            let color = new UIColors(this);
            this._svgElemBase.setAttribute("stroke", (this._isRequirement) ? "#000000" : color.full);
        }
    }

    /** objective (getter)
        Whether or not the goal objective.
        :return: an objective
    **/
    get objective() {
        return this._objective;
    }

    /** objective (setter)
        Sets the goal objective.
        :param value: an objective
    **/
    set objective(value) {
        this._objective = value;

        // trigger update to description element
        this.description = this._description;
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
        this._svgElemObjective = this._createSVGElementObjective(doc, descPos);

        // create utility elements
        let utilColor = new UIColors(8);
        let utilPos = {"x": anchors.southsouthwest.x, "y": anchors.southsouthwest.y - 0.5 * this._fontSize};
        this._svgElemUtilityDescriptionBase = this._createSVGElementUtilityDescriptionBase(doc, utilPos, utilColor);
        this._svgElemUtilityDescription = this._createSVGElementUtilityDescription(doc, utilPos);

        // append elements to group
        this._svgGroup.appendChild(this._svgElemBase);
        this._svgGroup.appendChild(this._svgElemIdentifier);
        this._svgGroup.appendChild(this._svgElemDescription);
        this._svgGroup.appendChild(this._svgElemObjective);
        this._svgGroup.appendChild(this._svgElemUtilityDescriptionBase);
        this._svgGroup.appendChild(this._svgElemUtilityDescription);

        return this._svgGroup;
    }

    /** createKAOSXMLElement
        Creates an XML element.
        :param doc: the parent document
        :return: an xml element
    **/
    createKAOSXMLElement(doc) {
        let elem = super.createKAOSXMLElement(doc);
        elem.setAttribute("objective", this.objective);
        return elem;
    }

    /** highlight
        Updates appearance of item to highlight it.
        :param value: highlight toggle value
    **/
    highlight(value) {
        if (this._svgElemBase !== null) {
            let thin = (this._isRequirement) ? "3" : "1";
            let thick = (this._isRequirement) ? "5" : "3";
            this._svgElemBase.setAttribute("stroke-width", (value) ? thick : thin);
        }
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
        p1.x += (seg / 2);
        p2.x += (seg / 2);
        p3.x -= (seg / 2);
        p4.x -= (seg / 2);

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
        elem.setAttribute("stroke", (this._isRequirement) ? "#000000" : color.full);
        elem.setAttribute("filter", "url(#shadow)");
        elem.setAttribute("points", points);
        return elem;
    }

    /** _createSVGElementDescription
        Creates a description SVG element.
        :param doc: the parent document
        :param pos: a 2d position
        :return: an svg element
    **/
    _createSVGElementDescription(doc, pos) {
        let text = this._description;
        let prefix = (this._objective !== null) ? this._objective : "";
        if (prefix.length > 0) {
            prefix = prefix.charAt(0).toUpperCase() + prefix.substr(1).toLowerCase();
            text = prefix + " [" + text + "]";
        }

        let elem = doc.createElementNS(SVGNS, "text");
        elem.setAttribute("data-reference", this._reference);
        elem.setAttribute("data-element", "svgElemDescription");
        elem.setAttribute("data-attribute", "description");
        elem.setAttribute("data-value", this._description);
        elem.setAttribute("class", "caption");
        elem.setAttribute("x", pos.x);
        elem.setAttribute("y", pos.y);
        let tspans = this._createSVGElementDescriptionText(elem, text);
        for (let i = 0; i < Math.min(this._maxRows, tspans.length); i++) {
            elem.appendChild(tspans[i]);
        }
        return elem;
    }

    /** _createSVGElementObjective
        Creates an objective SVG element.
        :param doc: the parent document
        :param pos: a 2d position
        :return: an svg element
    **/
    _createSVGElementObjective(doc, pos) {
        let elem = doc.createElementNS(SVGNS, "text");
        elem.setAttribute("data-reference", this._reference);
        elem.setAttribute("data-element", "svgElemObjective");
        elem.setAttribute("data-attribute", "objective");
        elem.setAttribute("data-value", this._objective);
        elem.setAttribute("class", "caption");
        elem.setAttribute("visibility", "hidden");
        elem.setAttribute("x", pos.x);
        elem.setAttribute("y", pos.y);
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

    /** _getAttributes
        Gets a collection of attribute values.
        :return: a collection of attribute values
    **/
    _getAttributes() {
        let values = super._getAttributes();
        values["isAchieve"] = this.isAchieve;
        values["isAvoid"] = this.isAvoid;
        values["isMaintain"] = this.isMaintain;
        return values;
    }
}
