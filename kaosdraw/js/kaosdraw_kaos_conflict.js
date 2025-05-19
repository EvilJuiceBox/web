/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** KAOSConflict class
    A KAOS conflict relationship
**/
class KAOSConflict extends KAOSRelationship {
    /** constructor
        :param uuid: a universal unique identifier
        :param idnum: an id number for the displayed identifier
    **/
    constructor(uuid, idnum) {
        super(uuid, idnum);
        this._idname = "Conflict";
        this._identifier = "R" + idnum;
        this._reference =  this._idname.toLowerCase() + "_" + uuid;
        this._definition = "Target goal cannot be satisfied when the attached condition is met.";
        this._constraints = [
            ["KAOSObstacle", "KAOSGoal"],
        ];
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

        // append elements to group
        this._svgGroup.appendChild(this._svgElemBase);
        this._svgGroup.appendChild(this._svgElemBaseSelection);

        return this._svgGroup;
    }

    /** highlight
        Updates appearance of item to highlight it.
        :param value: highlight toggle value
    **/
    highlight(value) {
        if (this._svgElemBase !== null) {
            this._svgElemBase.setAttribute("stroke-width", (value) ? "3px" : "2px");
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
        elem.setAttribute("marker-end", "url(#linedarrow)");
        elem.setAttribute("x1", pos1.x);
        elem.setAttribute("y1", pos1.y);
        elem.setAttribute("x2", pos2.x);
        elem.setAttribute("y2", pos2.y);
        return elem;
    }
}
