/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** KAOSRefinement class
    A KAOS refinement relationship
**/
class KAOSRefinement extends KAOSRelationship {
    /** constructor
        :param uuid: a universal unique identifier
        :param idnum: an id number for the displayed identifier
    **/
    constructor(uuid, idnum) {
        super(uuid, idnum);
        this._idname = "Refinement";
        this._identifier = "R" + idnum;
        this._reference =  this._idname.toLowerCase() + "_" + uuid;
        this._definition = "Relationship linking a goal to subgoals. Each subgoal contributes to the satisfaction " +
                           "of the goal it refines.";
        this._constraints = [
            ["KAOSGoal", "KAOSGoal"],
            ["KAOSGoal", "KAOSObstacle"],
            ["KAOSGoal", "KAOSRefinement"],
            ["KAOSObstacle", "KAOSGoal"],
            ["KAOSObstacle", "KAOSObstacle"],
            ["KAOSObstacle", "KAOSRefinement"],
            ["KAOSAgent", "KAOSGoal"],
            ["KAOSAgent", "KAOSObstacle"],
            ["KAOSAgent", "KAOSRefinement"],
            ["KAOSDomainProperty", "KAOSGoal"],
            ["KAOSDomainProperty", "KAOSObstacle"],
            ["KAOSDomainProperty", "KAOSRefinement"],
        ];
    }

    /** target (getter)
        The target item for the relationship.
        :return: an item
    **/
    get target() {
        return this._target;
    }

    /** target (setter)
        Sets the target item for the relationship.
        :param value: an item
    **/
    set target(value) {
        super.target = value;
        // if adding relationship between agent and goal, toggle requirement status
        if ((this._source instanceof KAOSAgent) && (this._target instanceof KAOSGoal)) {
            this._target.isRequirement = true;
        }
    }

    /** createSVGElement
        Creates a SVG element.
        :param doc: the parent document
        :param pos1: a 2d position
        :param pos2: a 2d position
        :return: an svg element
    **/
    createSVGElement(doc, pos1=null, pos2=null) {
        pos1 = (pos1 !== null) ? pos1 : {"x": 0, "y": 0};
        pos2 = (pos2 !== null) ? pos2 : {"x": 0, "y": 0};

        // create group element
        this._svgGroup = this._createSVGElementGroup(doc);

        // create base element
        let baseColor = new UIColors(this);
        this._svgElemBase = this._createSVGElementBase(doc, pos1, pos2, baseColor);

        // create hidden base selection element
        this._svgElemBaseSelection = this._createSVGElementBaseSelection(doc, pos1, pos2, baseColor);

        // create mid-point element
        let midPos = {"x": 0.5 * (pos1.x + pos2.x), "y": 0.5 * (pos1.y + pos2.y)}
        this._svgElemMidPoint = this._createSVGElementMidPoint(doc, midPos, baseColor);

        // append elements to group
        this._svgGroup.appendChild(this._svgElemBase);
        this._svgGroup.appendChild(this._svgElemBaseSelection);
        this._svgGroup.appendChild(this._svgElemMidPoint);

        return this._svgGroup;
    }

    /** highlight
        Updates appearance of item to highlight it.
        :param value: highlight toggle value
    **/
    highlight(value) {
        if (this._svgElemBase !== null) {
            this._svgElemBase.setAttribute("stroke-width", (value) ? "3px" : "2px");
            this._svgElemMidPoint.setAttribute("stroke-width", (value) ? "3px" : "2px");
        }
    }

    /** updateEndpoints
        Updates endpoints for the relationship.
        :param pos1: a 2d position
        :param pos2: a 2d position
    **/
    updateEndpoints(pos1, pos2) {
        super.updateEndpoints(pos1, pos2);

        // cancel if any values are not valid
        if (isNaN(pos1.x) || isNaN(pos1.y) || isNaN(pos2.x) || isNaN(pos2.y)) {
            return;
        }

        // update mid-point decorator position
        let midPos = {"x": 0.5 * (pos1.x + pos2.x), "y": 0.5 * (pos1.y + pos2.y)};
        if (this._svgElemMidPoint !== null) {
            this._svgElemMidPoint.setAttribute("cx", midPos.x);
            this._svgElemMidPoint.setAttribute("cy", midPos.y);
        }

        // update mid-point decorator color
        if (this._source !== null) {
            let midColor = new UIColors(8);
            if (this._source instanceof KAOSAgent) {
                midColor = new UIColors(3);
            }
            if (this._source instanceof KAOSObstacle) {
                midColor = new UIColors(3);
            }

            if (this._svgElemMidPoint !== null) {
                this._svgElemMidPoint.setAttribute("fill", midColor.light);
                this._svgElemMidPoint.setAttribute("stroke", midColor.full);
            }
        }

        // update mid-point decorator visibility
        if (this._target !== null) {
            let marker = "url(#filledarrow)";
            let visibility = "visible";
            if (this._target instanceof KAOSRefinement) {
                marker = "none";
                visibility = "hidden";
            }

            if (this._svgElemBase !== null) {
                this._svgElemBase.setAttribute("marker-end", marker);
            }
            if (this._svgElemMidPoint !== null) {
                this._svgElemMidPoint.setAttribute("visibility", visibility);
            }
        }
    }

    /** _createSVGElementBase
        Creates the base SVG element.
        :param doc: the parent document
        :param pos: a 2d position
        :param size: a 2d size
        :param color: a color value
        :return: an svg element
    **/
    _createSVGElementBase(doc, pos1, pos2, color) {
        let elem = doc.createElementNS(SVGNS, "line");
        elem.setAttribute("data-element", "svgElemBase");
        elem.setAttribute("data-reference", this._reference);
        elem.setAttribute("class", "selectable");
        elem.setAttribute("stroke", color.full);
        elem.setAttribute("stroke-width", "2px");
        elem.setAttribute("marker-end", "url(#filledarrow)");
        elem.setAttribute("x1", pos1.x);
        elem.setAttribute("y1", pos1.y);
        elem.setAttribute("x2", pos2.x);
        elem.setAttribute("y2", pos2.y);
        return elem;
    }

    /** _createSVGElementMidPoint
        Creates a mid-point SVG element.
        :param doc: the parent document
        :param pos: a 2d position
        :param color: a color value
        :return: an svg element
    **/
    _createSVGElementMidPoint(doc, pos, color) {
        let r = 0.75 * this._fontSize;
        let elem = doc.createElementNS(SVGNS, "circle");
        elem.setAttribute("data-reference", this._reference);
        elem.setAttribute("data-element", "svgElemMidPoint");
        elem.setAttribute("visibility", "hidden");
        elem.setAttribute("class", "selectable");
        elem.setAttribute("fill", color.light);
        elem.setAttribute("stroke", color.full);
        elem.setAttribute("filter", "url(#shadow)");
        elem.setAttribute("cx", pos.x);
        elem.setAttribute("cy", pos.y);
        elem.setAttribute("r", r);
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
        let cx = parseFloat(this._svgElemMidPoint.getAttribute("cx"));
        let cy = parseFloat(this._svgElemMidPoint.getAttribute("cy"));
        let r = parseFloat(this._svgElemMidPoint.getAttribute("r"));
        let anchors = {
            "east":             {"x": dx + cx + r,                              "y": dy + cy},
            "eastsoutheast":    {"x": dx + cx + r * Math.cos(0.125 * Math.PI),  "y": dy + cy + r * Math.sin(0.125 * Math.PI)},
            "southeast":        {"x": dx + cx + r * Math.cos(0.250 * Math.PI),  "y": dy + cy + r * Math.sin(0.250 * Math.PI)},
            "southsoutheast":   {"x": dx + cx + r * Math.cos(0.375 * Math.PI),  "y": dy + cy + r * Math.sin(0.375 * Math.PI)},
            "south":            {"x": dx + cx,                                  "y": dy + cy + r},
            "southsouthwest":   {"x": dx + cx + r * Math.cos(0.625 * Math.PI),  "y": dy + cy + r * Math.sin(0.625 * Math.PI)},
            "southwest":        {"x": dx + cx + r * Math.cos(0.750 * Math.PI),  "y": dy + cy + r * Math.sin(0.750 * Math.PI)},
            "westsouthwest":    {"x": dx + cx + r * Math.cos(0.875 * Math.PI),  "y": dy + cy + r * Math.sin(0.875 * Math.PI)},
            "west":             {"x": dx + cx - r,                              "y": dy + cy},
            "westnorthwest":    {"x": dx + cx + r * Math.cos(-0.875 * Math.PI), "y": dy + cy + r * Math.sin(-0.875 * Math.PI)},
            "northwest":        {"x": dx + cx + r * Math.cos(-0.750 * Math.PI), "y": dy + cy + r * Math.sin(-0.750 * Math.PI)},
            "northnorthwest":   {"x": dx + cx + r * Math.cos(-0.625 * Math.PI), "y": dy + cy + r * Math.sin(-0.625 * Math.PI)},
            "north":            {"x": dx + cx,                                  "y": dy + cy - r},
            "northnortheast":   {"x": dx + cx + r * Math.cos(-0.375 * Math.PI), "y": dy + cy + r * Math.sin(-0.375 * Math.PI)},
            "northeast":        {"x": dx + cx + r * Math.cos(-0.250 * Math.PI), "y": dy + cy + r * Math.sin(-0.250 * Math.PI)},
            "eastnortheast":    {"x": dx + cx + r * Math.cos(-0.125 * Math.PI), "y": dy + cy + r * Math.sin(-0.125 * Math.PI)},
            "center":           {"x": dx + cx,                                  "y": dy + cy},
        };
        return anchors;
    }
}
