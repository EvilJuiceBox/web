/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** KAOSRelationship class
**/
class KAOSRelationship extends KAOSItem {
    /** constructor
        :param uuid: a universal unique identifier
        :param idnum: an id number for the displayed identifier
    **/
    constructor(uuid, idnum) {
        super(uuid, idnum);
        this._constraints = [];
        this._source = null;
        this._sourceAnchor = "";
        this._target = null;
        this._targetAnchor = "";
        this._svgElemBaseSelection = null;
    }

    /** source (getter)
        The source item for the relationship.
        :return: an item
    **/
    get source() {
        return this._source;
    }

    /** source (setter)
        Sets the source item for the relationship.
        :param value: an item
    **/
    set source(value) {
        this._source = value;
        this.sourceAnchor = "";
        if ((this._svgGroup !== null) && (this._source !== null)) {
            // update svg attribute for source reference
            this._svgGroup.setAttribute("data-source-reference", this._source.reference);
        }
    }

    /** sourceAnchor (getter)
        The source anchor for the relationship.
        :return: an anchor
    **/
    get sourceAnchor() {
        return this._sourceAnchor;
    }

    /** sourceAnchor (setter)
        Sets the source anchor for the relationship.
        :param value: an anchor
    **/
    set sourceAnchor(value) {
        this._sourceAnchor = (value !== null) ? value : "";
        if (this._svgGroup !== null) {
            // update svg attribute for source reference
            this._svgGroup.setAttribute("data-source-anchor", this._sourceAnchor);
        }
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
        this._target = value;
        this.targetAnchor = "";
        if ((this._svgGroup !== null) && (this._target !== null)) {
            // update svg attribute for target reference
            this._svgGroup.setAttribute("data-target-reference", this._target.reference);
        }
    }

    /** targetAnchor (getter)
        The target anchor for the relationship.
        :return: an anchor
    **/
    get targetAnchor() {
        return this._targetAnchor;
    }

    /** targetAnchor (setter)
        Sets the target anchor for the relationship.
        :param value: an anchor
    **/
    set targetAnchor(value) {
        this._targetAnchor = (value !== null) ? value : "";
        if (this._svgGroup !== null) {
            // update svg attribute for target reference
            this._svgGroup.setAttribute("data-target-anchor", this._targetAnchor);
        }
    }

    /** checkConstraints
        Checks if constraints are satisfied for the relationship.
        :return: result of constraint check
    **/
    checkConstraints() {
        let result = false;
        let src = (this._source !== null) ? this._source.constructor.name : null;
        let tgt = (this._target !== null) ? this._target.constructor.name : null;
        for (const pair of this._constraints) {
            if ((pair[0] === src) && ((pair[1] === tgt) || (tgt === null))) {
                result = true;
                break;
            }
        }
        return result;
    }

    /** createSVGElement
        Creates a SVG element.
        :param doc: the parent document
        :param pos1: a 2d position
        :param pos2: a 2d position
        :return: an svg element
    **/
    createSVGElement(doc, pos1=null, pos2=null) {
        return null;
    }

    /** createKAOSXMLElement
        Creates an XML element.
        :param doc: the parent document
        :return: an xml element
    **/
    createKAOSXMLElement(doc) {
        let elem = super.createKAOSXMLElement(doc);
        elem.setAttribute("source", this.source.identifier);
        elem.setAttribute("target", this.target.identifier);
        return elem;
    }

    /** toString
        Converts relationship into a string form.
        :return: a string representation
    **/
    toString() {
        let modifier = "";
        let text = "";
        if ((this._source !== null) && (this._target !== null)) {
            text = this._source.identifier + " " + this._idname + " " + modifier + this._target.identifier;
        }
        return text;
    }

    /** updateEndpoints
        Updates endpoints for the relationship.
        :param pos1: a 2d position
        :param pos2: a 2d position
    **/
    updateEndpoints(pos1, pos2) {
        // cancel if any values are not valid
        if (isNaN(pos1.x) || isNaN(pos1.y) || isNaN(pos2.x) || isNaN(pos2.y)) {
            return;
        }

        // updated endpoints
        if (this._svgElemBase !== null) {
            this._svgElemBase.setAttribute("x1", pos1.x);
            this._svgElemBase.setAttribute("y1", pos1.y);
            this._svgElemBase.setAttribute("x2", pos2.x);
            this._svgElemBase.setAttribute("y2", pos2.y);
        }
        if (this._svgElemBaseSelection !== null) {
            this._svgElemBaseSelection.setAttribute("x1", pos1.x);
            this._svgElemBaseSelection.setAttribute("y1", pos1.y);
            this._svgElemBaseSelection.setAttribute("x2", pos2.x);
            this._svgElemBaseSelection.setAttribute("y2", pos2.y);
        }
    }

    /** _createSVGElementBaseSelection
        Creates a base selection SVG element. (This is an invisible buffer to aide selection.)
        :param doc: the parent document
        :param pos1: a 2d position
        :param pos2: a 2d position
        :param color: a color value
        :return: an svg element
    **/
    _createSVGElementBaseSelection(doc, pos1, pos2, color) {
        let elem = doc.createElementNS(SVGNS, "line");
        elem.setAttribute("data-element", "svgElemBaseSelection");
        elem.setAttribute("data-reference", this._reference);
        elem.setAttribute("class", "selectable");
        elem.setAttribute("opacity", "0.0");
        elem.setAttribute("stroke", color.full);
        elem.setAttribute("stroke-width", "20px");
        elem.setAttribute("x1", pos1.x);
        elem.setAttribute("y1", pos1.y);
        elem.setAttribute("x2", pos2.x);
        elem.setAttribute("y2", pos2.y);
        return elem;
    }

    /** _getAttributes
        Gets a collection of attribute values.
        :return: a collection of attribute values
    **/
    _getAttributes() {
        return {
            "reference": this.reference,
            "definition": this.definition,
            "identifier": this.identifier,
        };
    }
}
