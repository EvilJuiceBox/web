/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** KAOSModel class
    A KAOS model.
**/
class KAOSModel extends KAOSEntity {
    /** constructor
        :param uuid: a universal unique identifier
        :param idnum: an id number for the displayed identifier
    **/
    constructor(uuid, identifier) {
        super(uuid);
        this._idname = "Model"
        this._reference =  this._idname.toLowerCase() + "_" + uuid;
        this._identifier = identifier;
        this._items = [];
        this._typeCount = {};
        this._svgGroup = null;
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
        if (this._svgGroup !== null) {
            this._svgGroup.setAttribute("data-identifier", this._identifier);
        }
    }

    /** items (getter)
        Gets a collection of items belonging to the model.
        :return: a collection of items
    **/
    get items () {
        return this._items;
    }

    /** svgGroup (getter)
        The SVG group element corresponding to the item.
        :return: an svg group element
    **/
    get svgGroup() {
        return this._svgGroup;
    }

    /** transform (getter)
        The transform corresponding to the model's SVG group.
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
        Sets the transform corresponding to the model's SVG group.
        :param value: an svg transform
    **/
    set transform(value) {
        if (this._svgGroup !== null) {
            this._svgGroup.transform.baseVal.insertItemBefore(value, 0);
        }
    }

    /** addItem
        Adds an item to the model.
        :param item: an item
    **/
    addItem(item) {
        // add item to collection
        this._items.push(item);

        // add item to svg group
        if (item.svgGroup !== null) {
            this._svgGroup.appendChild(item.svgGroup);
        }
    }

    /** createSVGElement
        Creates a SVG element.
        :param doc: the parent document
        :param transform: an svg transform
        :return: an svg element
    **/
    createSVGElement(doc, transform) {
        this._svgGroup = this._createSVGElementGroup(doc);
        this._svgGroup.transform.baseVal.clear();
        this._svgGroup.transform.baseVal.insertItemBefore(transform, 0);
        return this._svgGroup;
    }

    /** findItem
        Finds the first item with a given attribute value.
        :param value: an attribute value
        :param attribute: an attribute (default: "reference")
        :return: an item
    **/
    findItem(value, attribute="reference") {
        let items = this.findItems(value, attribute);
        return (items.length > 0) ? items[0] : null;
    }

    /** findItemAtPosition
        Finds an item located at the given position.
        :param pos: a 2d position
        :param ignore: a collection of items to ignore (default: empty)
        :return: an item
    **/
    findItemAtPosition(pos, ignore=[]) {
        let item = null;
        for (let i = 0; i < this._items.length; i++) {
            if (ignore.indexOf(this._items[i]) < 0) {
                let anchors = this._items[i].anchors;
                if (anchors !== null) {
                    // check for overlap
                    if ((pos.x >= anchors.west.x) && (pos.x <= anchors.east.x) &&
                        (pos.y >= anchors.north.y) && (pos.y <= anchors.south.y)) {
                        item = this._items[i];
                    }
                }
            }
        }
        return item;
    }

    /** findItem
        Finds all items with a given attribute value.
        :param value: an attribute value
        :param attribute: an attribute (default: "reference")
        :return: a collection of items
    **/
    findItems(value, attribute="reference") {
        // filter with match function
        return this._items.filter(function(x) {
            if (attribute in x) {
                return (x[attribute] === value);
            }
            else {
                return false;
            }
        });
    }

    /** findRoots
        Searches for all root elements.
        :return: a collection of roots
    **/
    findRoots() {
        let roots = [];
        for (let i = 0; i < this._items.length; i++) {
            let curr = this._items[i];
            if (!(curr instanceof KAOSRelationship)) {
                let relationships = this.getRelationshipsFor(curr);
                let isRoot = true;
                for (const rel of relationships) {
                    if (rel.source === curr) {
                        isRoot = false;
                        break;
                    }
                }
                if (isRoot) {
                    roots.push(curr);
                }
            }
        }
        return roots;
    }

    /** getCenter
        Gets the center point of all items in the model.
        :return: a 2d position
    **/
    getCenter() {
        // get center point of all items in model
        let center = {"x": 0, "y": 0};
        if (this._items.length > 0) {
            let count = 0;
            for (let i = 0; i < this._items.length; i++) {
                let anchors = this._items[i].anchors;
                if (anchors !== null) {
                    center.x += anchors.center.x;
                    center.y += anchors.center.y;
                    count++;
                }
            }
            center.x /= count;
            center.y /= count;
        }
        return center;
    }

    /** getLogicFor
        Gets a logical expression for the given item.
        :param item: an item
        :return: a logical expression
    **/
    getLogicFor(item) {
        let outer = [];
        let outer_a = [];
        let outer_b = [];
        let outer_c = [];
        
        // get function associated with current item
        if ((typeof item.utilityFunction !== "undefined") && (item.utilityFunction !== null)) {
            outer_a.push(item.utilityFunction);
        }
        else if ((typeof item.operatingCondition !== "undefined") && (item.operatingCondition !== null)) {
            outer_a.push(item.operatingCondition);
        }

        // get logic for all adjacent relationships
        let relationships = this.getRelationshipsFor(item);
        for (const rel of relationships) {
            if (rel.target === item) {
                if (rel instanceof KAOSConflict) {
                    // handle conflict
                    let curr = this.getLogicFor(rel.source);
                    if (curr !== null) {
                        outer_c.push(curr);
                    }
                }
                else {
                    // get branching relationships from current relationship
                    let branches = this.getRelationshipsFor(rel);
                    if (branches.length === 0) {
                        // if no branches, treat as or-refinement
                        let curr = this.getLogicFor(rel.source);
                        if (curr !== null) {
                            outer_b.push(curr);
                        }
                    }
                    else {
                        // if branches, treat as and-refinement
                        let curr = this.getLogicFor(rel.source);
                        let inner = (curr !== null) ? [curr] : [];
                        for (const branch of branches) {
                            if (branch.target === rel) {
                                let curr = this.getLogicFor(branch.source);
                                if (curr !== null) {
                                    inner.push(curr);
                                }
                            }
                        }
                        if (inner.length > 1) {
                            let op = "AND";
                            inner.unshift(item.identifier + "." + op);
                            outer_b.push(inner);
                        }
                        if (inner.length === 1) {
                            inner = inner[0];
                            outer_b.push(inner);
                        }
                    }
                }
            }
        }

        // post-process outer_b and add to outer_a
        if (outer_b.length > 1) {
            let op = "OR";
            outer_b.unshift(item.identifier + "." + op);
            outer_a.push(outer_b);
        }
        else if (outer_b.length === 1) {
            outer_b = outer_b[0];
            outer_a.push(outer_b);
        }

        // post-process outer_a and add to outer
        if (outer_a.length > 1) {
            let op = (outer_a[0] instanceof KAOSOperatingCondition) ? "IF" : "AND";
            outer_a.unshift(item.identifier + "." + op);
            outer.push(outer_a);
        }
        else if (outer_a.length === 1) {
            outer_a = outer_a[0];
            outer.push(outer_a);
        }

        // post-process outer_c and add to outer
        if (outer_c.length > 1) {
            let op = "OR";
            outer_c.unshift(item.identifier + "." + op);
            outer.push(outer_c);
        }
        else if (outer_c.length === 1) {
            outer_c = outer_c[0];
            outer.push(outer_c);
        }

        // post-process outer
        if (outer.length > 1) {
            let op = "AND";
            outer.unshift(item.identifier + "." + op);
        }
        if (outer.length === 1) {
            outer = outer[0];
        }
        if (outer.length === 0) {
            outer = null;
        }
        return outer;
    }

    /** getRelationshipsFor
        Gets all relationships the given item is in involved in.
        :param item: an item
        :return: a collection of relationships
    **/
    getRelationshipsFor(item) {
        let relationships = [];
        for (let i = 0; i < this._items.length; i++) {
            if (this._items[i] instanceof KAOSRelationship) {
                if ((this._items[i].source === item) || (this._items[i].target === item)) {
                    relationships.push(this._items[i]);
                }
            }
        }
        return relationships;
    }

    /** issueNextIdentifierNumber
        Gets the next available identifier number for the given item type.
        :param itemType: a type of item
        :return: an identifier number
    **/
    issueNextIdentifierNumber(itemType) {
        itemType = itemType.toString().trim().toLowerCase();
        if (itemType in this._typeCount) {
            this._typeCount[itemType]++;
        }
        else {
            this._typeCount[itemType] = 1;
        }
        return this._typeCount[itemType];
    }

    /** removeItem
        Removes an item from the model.
        :param item: an item
    **/
    removeItem(item) {
        // check if item is in collection
        let i = this._items.indexOf(item);
        if (i === -1) {
            return;
        }

        // remove item from collection
        this._items.splice(i, 1);

        // get all connected relationships and recursively remove them, too
        let relationships = this.getRelationshipsFor(item);
        for (let i = 0; i < relationships.length; i++) {
            this.removeItem(relationships[i]);
        }

        // remove item from svg group
        if ((this._svgGroup !== null) && (this._svgGroup.contains(item.svgGroup))) {
            this._svgGroup.removeChild(item.svgGroup);
        }

        // if removing relationship between agent and goal, toggle requirement status
        if (item instanceof KAOSRefinement) {
            // update target goal if source is agent
            if ((item.source instanceof KAOSAgent) && (item.target instanceof KAOSGoal)) {
                item.target.isRequirement = false;
            }
        }
    }

    /** repositionTransformMatrix
        Repositions the transform matrix of the model.
        :param pos: a 2d position
    **/
    repositionTransformMatrix(pos) {
        let transform = this._svgGroup.transform.baseVal.getItem(0);
        transform.matrix.e = pos.x;
        transform.matrix.f = pos.y;
    }

    /** resetTransformMatrix
        Resets the transform matrix of the model.
        :param matrix: a transformation matrix (default: identity matrix)
    **/
    resetTransformMatrix(matrix=null) {
        let transform = this._svgGroup.transform.baseVal.getItem(0);
        transform.matrix.a = (matrix instanceof SVGMatrix) ? matrix.a : 1;
        transform.matrix.b = (matrix instanceof SVGMatrix) ? matrix.b : 0;
        transform.matrix.c = (matrix instanceof SVGMatrix) ? matrix.c : 0;
        transform.matrix.d = (matrix instanceof SVGMatrix) ? matrix.d : 1;
        transform.matrix.e = (matrix instanceof SVGMatrix) ? matrix.e : 0;
        transform.matrix.f = (matrix instanceof SVGMatrix) ? matrix.f : 0;
    }

    /** resizeItem
        Resizes an item in  the model.
        :param item: an item
    **/
    resizeItem(item) {
        if (item === null) {
            // cancel if no item given
            return;
        }

        let anchors = item.anchors;
        if (anchors === null) {
            // cancel if item has no anchor points
            return;
        }

        // resize item
        if ((this._svgGroup !== null) && (this._svgGroup.contains(item.svgGroup))) {
            // remove from svg group, create with new size, and add back to svg group
            let doc = this._svgGroup.ownerDocument;
            this._svgGroup.removeChild(item.svgGroup);
            let elem = item.createSVGElement(doc, anchors.center);
            this._svgGroup.appendChild(elem); // TODO: add to end or at some position?

            // update endpoints for relationships
            let relationships = this.getRelationshipsFor(item);
            for (let i = 0; i < relationships.length; i++) {
                let relationship = relationships[i];
                let p1 = relationship.source.chooseAnchorPoint(relationship.target.anchors.center);
                if (relationship.sourceAnchor !== "") {
                    p1 = relationship.source.anchors[relationship.sourceAnchor];
                }
                let p2 = relationship.target.chooseAnchorPoint(p1);
                if (relationship.targetAnchor !== "") {
                    p2 = relationship.target.anchors[relationship.targetAnchor];
                }
                relationship.updateEndpoints(p1, p2);

                // update endpoints for branching relationships
                let branches = this.getRelationshipsFor(relationship);
                for (let j = 0; j < branches.length; j++) {
                    let branch = branches[j];
                    let p1 = branch.source.chooseAnchorPoint(branch.target.anchors.center);
                    if (branch.sourceAnchor !== "") {
                        p1 = branch.source.anchors[branch.sourceAnchor];
                    }
                    let p2 = branch.target.chooseAnchorPoint(p1);
                    if (branch.targetAnchor !== "") {
                        p2 = branch.target.anchors[branch.targetAnchor];
                    }
                    branch.updateEndpoints(p1, p2);
                }
            }
        }
    }

    /** scaleTransformMatrix
        Scales the transform matrix of the model.
        :param factor: a scale factor
        :param origin: the origin of the scaled transformation (default: (0, 0))
    **/
    scaleTransformMatrix(factor, origin={"x": 0, "y": 0}) {
        let transform = this._svgGroup.transform.baseVal.getItem(0);
        transform.matrix.e -= origin.x;
        transform.matrix.f -= origin.y;
        transform.matrix.a *= factor;
        transform.matrix.d *= factor;
        transform.matrix.e *= factor;
        transform.matrix.f *= factor;
        transform.matrix.e += origin.x;
        transform.matrix.f += origin.y;
    }

    /** shiftItemBackward
        Shifts an item z-ordering backward.
        :param item: an item
    **/
    shiftItemBackward(item) {
        if (item === null) {
            return;
        }

        let elem = item.svgGroup;
        if ((elem === null) || (elem.previousSibling === null)) {
            return;
        }

        if (this._svgGroup === null) {
            return;
        }

        this._svgGroup.insertBefore(elem, elem.previousSibling);
    }

    /** shiftItemForward
        Shifts an item z-ordering forward.
        :param item: an item
    **/
    shiftItemForward(item) {
        if (item === null) {
            return;
        }

        let elem = item.svgGroup;
        if ((elem === null) || (elem.nextSibling === null)) {
            return;
        }

        if (this._svgGroup === null) {
            return;
        }

        this._svgGroup.insertBefore(elem.nextSibling, elem);
    }

    /** toString
        Converts model into a string form.
        :return: a string representation
    **/
    toString() {
        let text = "Model " + this._identifier + "\n";
        for (let i = 0; i < this._items.length; i++) {
            text += this._items[i].toString() + "\n";
        }
        return text;
    }

    /** updateItem
        Update the attributes of an item.
        :param item: an item
        :param values: a collection of attribute values
        :return: violation message if there was a violation
    **/
    updateItem(item, values) {
        let violation = null;
        if (item !== null) {
            // check model for unique identifier
            /*
            if ("identifier" in values) {
                let match = this.findItem(values.identifier, "identifier");
                if (match !== null) {
                    violation = "Identifiers must be unique within a model.";
                    delete values.identifier;
                }
            }
            */

            // update item attribute values
            item.attributes = values;

            // resize item to fit changes
            this.resizeItem(item);
        }

        return violation;
    }

    /** _createSVGElementGroup
        Creates a group SVG element.
        :param doc: the parent document
        :return an svg element
    **/
    _createSVGElementGroup(doc, transform) {
        let elem = doc.createElementNS(SVGNS, "g");
        elem.setAttribute("data-reference", this._reference);
        elem.setAttribute("data-entity", this.constructor.name);
        elem.setAttribute("data-element", "svgGroup");
        elem.setAttribute("data-identifier", this._identifier);
        return elem;
    }

    /** _getAttributes
        Gets a collection of attribute values.
        :return: a collection of attribute values
    **/
    _getAttributes() {
        return {
            "reference": this.reference,
            "identifier": this.identifier,
        };
    }
}
