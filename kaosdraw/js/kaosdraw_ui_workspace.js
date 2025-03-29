/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** UIWorkspace class
    Manages the workspace area, managing interactions between the application and the SVG elements and KAOS items.
**/
class UIWorkspace {
    /** constructor
        :param container: a container element for the workspace
    **/
    constructor(container) {
        this._container = container;
        this._connector = null;
        this._copied = null;
        this._creationMode = null;
        this._dragItem = null;
        this._dragOffset= null;
        this._dragRelationships = null;
        this._model = null;
        this._panOffset = null;
        this._redoHistory = [];
        this._scaleOrigin = null;
        this._scaleOriginDist = null;
        this._scaleOriginMatrix = null;
        this._selectedItem = null;
        this._svgRoot = null;
        this._undoHistory = [];
        this._undoHistoryMax = 16;

        if (this._container !== null) {
            // create svg root
            this._svgRoot = this._createSVGRoot(this._container.ownerDocument);
            this._container.appendChild(this._svgRoot);

            // create model and add to svg root
            this._model = new KAOSModel(this._createUUID(), "kaos_model_0");
            this._model.createSVGElement(this._container.ownerDocument, this._svgRoot.createSVGTransform());
            this._svgRoot.appendChild(this._model.svgGroup);
        }
    }

    /** creationMode (getter)
        :return: returns the current creation mode
    **/
    get creationMode() {
        return this._creationMode;
    }

    /** isConnecting (getter)
        :return: true if workspace is connecting items
    **/
    get isConnecting() {
        return (this._connector !== null);
    }

    /** isDragging (getter)
        :return: true if workspace is dragging an item
    **/
    get isDragging() {
        return ((this._dragItem !== null) && (this._dragOffset !== null) && (this._dragRelationships !== null));
    }

    /** isPanning (getter)
        :return: true if workspace is panning
    **/
    get isPanning() {
        return (this._panOffset !== null);
    }

    /** isScaling (getter)
        :return: true if workspace is scaling
    **/
    get isScaling() {
        return ((this._scaleOrigin !== null) && (this._scaleOriginDist !== null) && (this._scaleOriginMatrix !== null));
    }

    /** model (getter)
        :return: the active kaos model
    **/
    get model() {
        return this._model;
    }

    /** selectedItem (getter)
        :return: the selected kaos item
    **/
    get selectedItem() {
        return this._selectedItem;
    }

    /** copyItem
        Stores a copy of the given item in memory.
        :param item: an item
    **/
    copyItem(item) {
        if ((item !== null) && !(item instanceof KAOSRelationship)) {
            // serialize svg group for the item
            let serializer = new XMLSerializer();
            let text = serializer.serializeToString(item.svgGroup);
            this._copied = text;
        }
    }

    /** drag
        Drags an item by some amount.
        :param item: an item
        :param delta: a 2d delta amount to drag
    **/
    drag(item, delta) {
        // verify item exists
        if (item === null) {
            return;
        }

        // get anchor points for item
        let anchors = item.anchors;
        if (anchors === null) {
            return;
        }

        // set origin to center of item and calculate destination
        let origin = anchors.center;
        let destination = {"x": (origin.x + delta.x), "y": (origin.y + delta.y)};

        // drag the item
        this._dragBegin(item, origin);
        this._dragMove(destination);
        this._dragEnd();
    }

    /** displayMessage
        Fires off event to display message to user.
        :param text: text content of message to send
    **/
    displayMessage(text) {
        let evt = new CustomEvent("displaymessage", {detail: {"message": text}});
        this._container.dispatchEvent(evt);
    }

    /** loadFromSVGXML
        Loads a kaos model from the given SVG xml.
        :param text: text content of SVG xml.
    **/
    loadFromSVGXML(text) {
        // parse svg file and verify that doc contains an svg element
        let parser = new DOMParser();
        let doc = parser.parseFromString(text, "image/svg+xml");
        if (doc.children.length !== 1) {
            this.displayMessage("Invalid format of SVG file.")
            return;
        }
        if (doc.childNodes[0].nodeName !== "svg") {
            this.displayMessage("Invalid format of SVG file.")
            return;
        }

        // verify arrangement of svg
        let svgRoot = doc.childNodes[0];
        let svgModel = null;
        for (const node of svgRoot.childNodes) {
            if (node.getAttribute("data-entity") === "KAOSModel") {
                svgModel = node;
                break;
            }
        }
        if (svgRoot === null) {
            this.displayMessage("Invalid format of SVG file.")
            return;
        }

        // get model group and copy transform matrix
        let svgModelReference = svgModel.getAttribute("data-reference");
        let svgModelIdentifier = svgModel.getAttribute("data-identifier");
        let svgModelTransform = svgModel.transform.baseVal.getItem(0);
        let svgModelUUID = (svgModelReference !== null) ? svgModelReference.split("_")[1] : this._createUUID();

        // clear and reset model
        this.unselectItem();
        if (this._svgRoot.contains(this._model.svgGroup)) {
            this._svgRoot.removeChild(this._model.svgGroup);
        }
        this._model = new KAOSModel(svgModelUUID, svgModelIdentifier);
        this._model.createSVGElement(this._container.ownerDocument, this._svgRoot.createSVGTransform());
        this._model.resetTransformMatrix(svgModelTransform.matrix);
        this._svgRoot.appendChild(this._model.svgGroup);

        // iterate through each child node and create a new one and clone it
        let mapping = {};
        let relationships = [];
        for (const curr of svgModel.childNodes) {
            if (curr.nodeName === "g") {
                // get identifying attributes for item
                let itemType = curr.getAttribute("data-entity");
                let itemReference = curr.getAttribute("data-reference");
                let itemUUID = (itemReference !== null) ? itemReference.split("_")[1] : this._createUUID();

                // create clone
                let clone = this._createItem(itemType, itemUUID);
                if (clone !== null) {
                    // clone all contained elements
                    clone.copySVGElement(curr);

                    // map original reference to clone reference
                    let reference = curr.getAttribute("data-reference");
                    mapping[reference] = clone.reference;

                    // remember relationships
                    if (clone instanceof KAOSRelationship) {
                        relationships.push(clone);
                    }
                }
            }
        }

        // update source and target for each cloned relationship
        for (const clone of relationships) {
            // update source
            let sourceAnchor = clone.svgGroup.getAttribute("data-source-anchor");
            sourceAnchor = (sourceAnchor === null) ? "" : sourceAnchor;
            let sourceReference = clone.svgGroup.getAttribute("data-source-reference");
            sourceReference = (sourceReference in mapping) ? mapping[sourceReference] : null;
            clone.source = this._model.findItem(sourceReference);
            clone.sourceAnchor = sourceAnchor;

            // update target
            let targetAnchor = clone.svgGroup.getAttribute("data-target-anchor");
            targetAnchor = (targetAnchor === null) ? "" : targetAnchor;
            let targetReference = clone.svgGroup.getAttribute("data-target-reference");
            targetReference = (targetReference in mapping) ? mapping[targetReference] : null;
            clone.target = this._model.findItem(targetReference);
            clone.targetAnchor = targetAnchor;

            // update endpoints
            let p1 = clone.source.chooseAnchorPoint(clone.target.anchors.center);
            if (clone.sourceAnchor !== "") {
                p1 = clone.source.anchors[clone.sourceAnchor];
            }
            let p2 = clone.target.chooseAnchorPoint(p1);
            if (clone.targetAnchor !== "") {
                p2 = clone.target.anchors[clone.targetAnchor];
            }
            clone.updateEndpoints(p1, p2);
        }
    }

    /** initiateCreation
        Initiates mode to allow for the creation of an item.
        :param mode: indicates what sort of kaos item to create
    **/
    initiateCreation(mode) {
        if (mode !== this._creationMode) {
            // begin creation mode when creation mode has changed
            this._createBegin(mode);
        }
        else {
            // end creation mode when same creation mode is given
            this._createEnd();
        }
    }

    /** move
        Moves either the given item or the entire workspace view.
        :param delta: a 2d delta amount for movement
    **/
    move(delta, item=null) {
        if (item !== null) {
            this.drag(item, delta);
        }
        else {
            this.pan(delta);
        }
    }

    /** pan
        Pans the workspace view by some amount.
        :param delta: a 2d delta amount to pan
    **/
    pan(delta) {
        let transform = this._model.transform;
        let origin = {"x": (delta.x + transform.matrix.e), "y": (delta.y + transform.matrix.f)};
        this._model.repositionTransformMatrix(origin);
    }

    /** pasteItem
        Pastes a copied item into the workspace.
        :param pos: a 2d position
    **/
    pasteItem(pos=null) {
        // cancel if no item has been copied
        if (this._copied === null) {
            return;
        }

        // parse the copied item
        let parser = new DOMParser();
        let doc = parser.parseFromString(this._copied, "text/xml");
        if (doc.children.length !== 1) {
            // cancel if no elements were parsed
            return;
        }

        // create a clone of the copied item
        let elem = doc.firstChild;
        let itemType = elem.getAttribute("data-entity");
        let itemUUID = this._createUUID();
        let clone = this._createItem(itemType, itemUUID);
        if (clone !== null) {
            // clone all attributes from the svg elements
            clone.copySVGElement(elem);

            // reposition the clone
            let anchors = clone.anchors;
            if (anchors !== null) {
                if (pos === null) {
                    // if no position given, paste to center of workspace view
                    pos = {"x": (0.5 * this._container.offsetWidth), "y": (0.5 * this._container.offsetHeight)};
                }
                pos = this._transformFromScreenToModel(pos);
                let delta = {"x": (pos.x - anchors.center.x), "y": (pos.y - anchors.center.y)};
                this.drag(clone, delta);
            }
        }
    }

    /** pointerDown
        Performs a context-dependent action for the user.
        :param elem: the element pointed down on
        :param pos: the pointer position
    **/
    pointerDown(elem, pos) {
        // get item associated with target element
        let reference = elem.getAttribute("data-reference");
        let item = (reference !== null) ? this._model.findItem(reference) : null;

        // transform pointer positions to model coordinate frame
        for (let i = 0; i < pos.length; i++) {
            pos[i] = this._transformFromScreenToModel(pos[i]);
        }

        // define connector types
        let connectorTypes = ["KAOSRefinement"];

        // check if "sticky" creation is desired
        let stickyCreation = (typeof STICKY_CREATION_MODE !== "undefined") ? STICKY_CREATION_MODE : false;

        // perform context-sensitive action at pointer position
        if ((pos.length > 0) && (this._creationMode !== null) && (connectorTypes.indexOf(this._creationMode) >= 0)) {
            // start connecting if the new item is a relationship
            this._connectBegin(this._creationMode, item, pos[0]);
            if (stickyCreation !== true) {
                // if "sticky" creation mode is not desired, end creation mode after item is created
                this._createEnd();
            }
        }
        else if ((pos.length > 0) && (this._creationMode !== null) && (item === null)) {
            // create a new kaos item and select it
            item = this._createItem(this._creationMode, this._createUUID(), pos[0]);
            this.selectItem(item);
            if (stickyCreation !== true) {
                // if "sticky" creation mode is not desired, end creation mode after item is created
                this._createEnd();
            }
        }
        else if ((pos.length > 0) && (!this.isConnecting && !this.isDragging && !this.isPanning && !this.isScaling)) {
            if (item !== null) {
                // select target item
                this.selectItem(item);
                this._createEnd();
            }
            else {
                // if no target item, unselect current selection
                this.unselectItem();
            }

            if (item !== null) {
                // begin dragging target item
                this._dragBegin(item, pos[0]);
            }
            else  if (pos.length > 1) {
                // begin scaling workspace
                this._scaleBegin(pos[0], pos[1]);
            }
            else {
                // begin panning workspace
                this._panBegin(pos[0]);
            }
        }
    }

    /** pointerMove
        Performs a context-dependent action for the user.
        :param elem: the element moved over
        :param pos: the pointer position
    **/
    pointerMove(elem, pos) {
        // get item associated with target element
        let reference = elem.getAttribute("data-reference");
        let item = (reference !== null) ? this._model.findItem(reference) : null;

        // transform pointer positions to model coordinate frame
        for (let i = 0; i < pos.length; i++) {
            pos[i] = this._transformFromScreenToModel(pos[i]);
        }

        if ((pos.length >= 2) && (this.isPanning)) {
            // stopping panning and start scaling when multiple pointers given
            this._panEnd();
            this._scaleBegin(pos[0], pos[1]);
        }
        else if ((pos.length >= 2) && (this.isScaling)) {
            // continue moving within context of scaling
            this._scaleMove(pos[0], pos[1]);
        }
        else if ((pos.length > 0) && (this.isConnecting)) {
            // continue moving within context of connecting
            this._connectMove(pos[0]);
        }
        else if ((pos.length > 0) && (this.isDragging)) {
            // continue moving within context of dragging
            this._dragMove(pos[0]);
        }
        else if((pos.length > 0) && (this.isPanning)) {
            // continue moving within context of panning
            this._panMove(pos[0]);
        }
        else if((pos.length > 0) && (this.isScaling)) {
            // cancel scaling if only single pointer given
            this._scaleEnd();
        }
    }


    /** pointerScroll
        Performs a context-dependent action for the user.
        :param elem: the element moved over
        :param pos: the pointer position
    **/
    pointerScroll(elem, delta) {
        if (!this.isConnecting && !this.isDragging && !this.isPanning && !this.isScaling) {
            let adjustment = (typeof SCROLL_ADJUSTMENT !== "undefined") ? SCROLL_ADJUSTMENT : 1;
            delta.x *= adjustment;
            delta.y *= adjustment;
            this.pan(delta);
        }
    }


    /** pointerUp
        Performs a context-dependent action for the user.
        :param elem: the element pointed up on
        :param pos: the pointer position
    **/
    pointerUp(elem, pos) {
        // get item associated with target element
        let reference = elem.getAttribute("data-reference");
        let item = (reference !== null) ? this._model.findItem(reference) : null;

        // transform pointer positions to model coordinate frame
        for (let i = 0; i < pos.length; i++) {
            pos[i] = this._transformFromScreenToModel(pos[i]);
        }

        if (this.isConnecting) {
            // finish connecting
            this._connectEnd(item, pos[0]);
        }

        if (this.isDragging) {
            // finish dragging
            this._dragEnd();
        }

        if (this.isPanning) {
            // finish panning
            this._panEnd();
        }

        if (this.isScaling) {
            // finish scaling
            this._scaleEnd();
        }
    }

    /** recordUndoState
        Records the workspace state for an undo action.
    **/
    recordUndoState() {
        // set a max limit on how many states saved in memory
        if (this._undoHistory.length >= this._undoHistoryMax) {
            this._undoHistory.shift();
        }

        // save current state to undo history
        let content = this.toSVGXML();
        let selection = (this._selectedItem !== null) ? this._selectedItem.reference : null;
        let currState = {"svgxml": this.toSVGXML(), "selection": selection};
        this._undoHistory.push(currState);

        // clear redo history
        this._redoHistory = [];
    }

    /** removeItem
        Remove item from workspace.
        :param item: an item
    **/
    removeItem(item) {
        if (item !== null) {
            // clear current selection
            this.unselectItem();

            // remove item from model
            this._model.removeItem(item);
        }
    }

    /** restoreRedoState
        Restores a previous workspace state from the redo history.
    **/
    restoreRedoState() {
        if (this._redoHistory.length > 0) {
            // save current state to undo history
            let content = this.toSVGXML();
            let selection = (this._selectedItem !== null) ? this._selectedItem.reference : null;
            let currState = {"svgxml": this.toSVGXML(), "selection": selection};
            this._undoHistory.push(currState);

            // get last saved redo state and load it
            let prevState = this._redoHistory.pop();
            this.loadFromSVGXML(prevState.svgxml);

            // re-select item from loaded state
            let selectedItem = this._model.findItem(prevState.selection);
            if (selectedItem !== null) {
                this.selectItem(selectedItem);
            }
        }
    }

    /** restoreUndoState
        Restores a previous workspace state from the undo history.
    **/
    restoreUndoState() {
        if (this._undoHistory.length > 0) {
            // save current state to redo history
            let content = this.toSVGXML();
            let selection = (this._selectedItem !== null) ? this._selectedItem.reference : null;
            let currState = {"svgxml": this.toSVGXML(), "selection": selection};
            this._redoHistory.push(currState);

            // get last saved undo state and load it
            let prevState = this._undoHistory.pop();
            this.loadFromSVGXML(prevState.svgxml);

            // re-select item from loaded state
            let selectedItem = this._model.findItem(prevState.selection);
            if (selectedItem !== null) {
                this.selectItem(selectedItem);
            }
        }
    }

    /** selectItem
        Selects the given item.
        :param item: an item
    **/
    selectItem(item) {
        if (this._selectedItem === item) {
            // given item is already selected, create and dispatch event to display item attributes
            let evt = new CustomEvent("displayitem", {detail: {"reference": this._selectedItem}});
            this._container.dispatchEvent(evt);
            return;
        }

        // check if an item is already selected
        if (this._selectedItem !== null) {
            // create and dispatch event to clear item attributes
            let evt = new CustomEvent("clearitem", {detail: {"reference": this._selectedItem}});
            this._container.dispatchEvent(evt);

            // remove selection from current selection
            this._selectedItem.highlight(false);
            this._selectedItem = null;
        }

        // set selection
        this._selectedItem = item;
        if (this._selectetedItem !== null) {
            this._selectedItem.highlight(true);
        }
    }

    /** showGrid
        Sets visibility of background grid.
        :param visibility: visibility status
    **/
    showGrid(visibility) {
        try {
            let svgBackgroundGroup = this._svgRoot.childNodes[1];
            if (svgBackgroundGroup.getAttribute("id") == "background") {
                svgBackgroundGroup.setAttribute("visibility", (visibility) ? "visible" : "hidden");
            }
        }
        catch (e) {
            // Do nothing.
        }
    }

    /** toKAOSXML
        Converts workspace to KAOS xml.
        :return: kaos xml
    **/
    toKAOSXML() {
        // build xml document from kaos model
        let xmlDoc = document.implementation.createDocument("", "", null);
        let xmlRoot = xmlDoc.createElement("KAOSModel");
        xmlRoot.setAttribute("id", this._model.identifier);
        for (let i = 0; i < this._model.items.length; i++) {
            let child = this._model.items[i].createKAOSXMLElement(xmlDoc);
            xmlRoot.appendChild(child);
        }
        xmlDoc.appendChild(xmlRoot);

        // serialize xml document
        let serializer = new XMLSerializer();
        let text = serializer.serializeToString(xmlDoc);
        return text;
    }

    /** toLogicText
        Converts workspace to logic string.
        :return: logic string
    **/
    toLogicText() {
        // recursive function to build logic xml
        function _buildtext(logic) {
            let text = "";
            if (Array.isArray(logic)) {
                let id = (logic[0].split(".").length > 1) ? logic[0].split(".")[0] : "";
                let op = (logic[0].split(".").length > 1) ? logic[0].split(".")[1] : logic[0];
                if (op === "AND") {
                    let temp = [];
                    for (let i = 1; i < logic.length; i++) {
                        temp.push(_buildtext(logic[i]));
                    }
                    text = "(" + temp.join(" AND ") + ")";
                }
                else if (op === "IF") {
                    let temp = [];
                    for (let i = 1; i < logic.length; i++) {
                        temp.push(_buildtext(logic[i]));
                    }
                    text = "(IF " + temp[0] + " THEN " + temp.slice(1).join(" OR ") + ")";
                }
                else if (op === "IFF") {
                    let temp = [];
                    for (let i = 1; i < logic.length; i++) {
                        temp.push(_buildtext(logic[i]));
                    }
                    text = "(IFF " + temp[0] + " THEN " + temp.slice(1).join(" OR ") + ")";
                }
                else if (op === "OR") {
                    let temp = [];
                    for (let i = 1; i < logic.length; i++) {
                        temp.push(_buildtext(logic[i]));
                    }
                    text = "(" + temp.join(" OR ") + ")";
                }
            }
            else if (logic !== null) {
                text = logic.toString();
            }
            return text;
        }

        // build xml for each root
        let texts = [];
        let roots = this._model.findRoots();
        for (const root of roots) {
            let logic = this._model.getLogicFor(root);
            texts.push(_buildtext(logic));
        }

        let text = texts.join("\n");
        return text;
    }


    /** toLogicXML
        Converts workspace to logic xml.
        :return: logic xml
    **/
    toLogicXML() {
        // build logic xml document from kaos model
        let xmlDoc = document.implementation.createDocument("", "", null);
        let xmlRoot = xmlDoc.createElement("Logic");
        xmlRoot.setAttribute("id", this._model.identifier);

        // recursive function to build logic xml
        function _buildxml(parent, logic) {
            if (Array.isArray(logic)) {
                let elem = null;
                let id = (logic[0].split(".").length > 1) ? logic[0].split(".")[0] : "";
                let op = (logic[0].split(".").length > 1) ? logic[0].split(".")[1] : logic[0];
                if (op === "AND") {
                    elem = xmlDoc.createElement("Conjunction");
                    elem.setAttribute("id", id);
                }
                else if (op === "IF") {
                    elem = xmlDoc.createElement("Conditional");
                    elem.setAttribute("id", id);
                }
                else if (op === "IFF") {
                    elem = xmlDoc.createElement("Biconditional");
                    elem.setAttribute("id", id);
                }
                else if (op === "OR") {
                    elem = xmlDoc.createElement("Disjunction");
                    elem.setAttribute("id", id);
                }
                if (elem !== null) {
                    for (let i = 1; i < logic.length; i++) {
                        _buildxml(elem, logic[i]);
                    }
                    parent.appendChild(elem);
                }
            }
            else if (logic !== null) {
                // convert curr to logic xml element
                if (typeof logic.createLogicXMLElement !== "undefined") {
                    let elem = logic.createLogicXMLElement(xmlDoc);
                    parent.appendChild(elem);
                }
            }
        }

        // build xml for each root
        let roots = this._model.findRoots();
        for (const root of roots) {
            let logic = this._model.getLogicFor(root);
            _buildxml(xmlRoot, logic);
        }
        xmlDoc.appendChild(xmlRoot);

        // serialize xml document
        let serializer = new XMLSerializer();
        let text = serializer.serializeToString(xmlDoc);

        return text;
    }

    /** toSVGXML
        Converts workspace to SVG xml.
        :return: svg xml
    **/
    toSVGXML() {
        // serialize svg document
        let serializer = new XMLSerializer();
        let text = serializer.serializeToString(this._svgRoot);

        // remove grid background from svg
        text = text.replace("fill=\"url(#grid)\"", "fill=\"#ffffff\"");

        // set the font style
        let fontFamily = "Tahoma, Geneva, sans-serif";
        let fontSize = (typeof TEXT_FONT_SIZE !== "undefined") ? TEXT_FONT_SIZE : 16;
        let style = "<style>text{font-family: " + fontFamily + ";font-size:" + (fontSize * 0.85) + "px;}</style>";
        text = text.replace("</defs>", "</defs>" + style);

        return text;
    }

    /** unselectItem
        Removes current selection.
    **/
    unselectItem() {
        // create and dispatch event to clear item attributes
        let evt = new CustomEvent("clearitem", {detail: {"reference": this._selectedItem}});
        this._container.dispatchEvent(evt);

        // remove selection from current item
        if (this._selectedItem !== null) {
            this._selectedItem.highlight(false);
            this._selectedItem = null;
        }
    }

    /** updateItem
        Update the attributes of an item.
        :param item: an item
        :param values: a collection of attribute values
    **/
    updateItem(item, values) {
        let violation = this._model.updateItem(item, values);
        if (violation !== null) {
            this.displayMessage(violation);
        }

        // preserve highlight in case item was resized
        if (item === this._selectedItem) {
            item.highlight(true);
        }
    }

    /** validate
        Validates the workspace.
    **/
    validate() {
        // validate kaos model
        let validator = new KAOSValidator(this._model);
        let violations = validator.validate();

        // create and dispatch event to display violations
        let evt = new CustomEvent("displayvalidation", {detail: {"violations": violations}});
        this._container.dispatchEvent(evt);
    }

    /** zoomCenter
        Resets workspace view to default point and scale.
    **/
    zoomCenter() {
        // reset the transformation matrix
        this._model.resetTransformMatrix();

        // get center point of all items in model and set as shift it to the center of the container
        let center = this._model.getCenter();
        let origin = this._transformFromModelToContainer(center);
        origin.x = (0.5 * this._container.offsetWidth) - origin.x;
        origin.y = (0.5 * this._container.offsetHeight) - origin.y;

        // pan to center of items
        this._model.repositionTransformMatrix(origin);
    }

    /** zoomIn
        Updates workspace view to a larger scale.
    **/
    zoomIn() {
        // get origin point of zoom
        let origin = {"x": (0.5 * this._container.offsetWidth), "y": (0.5 * this._container.offsetHeight)};
        if ((this._selectedItem !== null) && (this._selectedItem.anchors !== null)) {
            origin = this._transformFromModelToContainer(this._selectedItem.anchors.center);
        }

        // scale model
        let factor = (typeof ZOOM_FACTOR !== "undefined") ? ZOOM_FACTOR : 1.2;
        this._model.scaleTransformMatrix(factor, origin);
    }

    /** zoomOut
        Updates workspace view to a smaller scale.
    **/
    zoomOut() {
        // get origin point of zoom
        let origin = {"x": (0.5 * this._container.offsetWidth), "y": (0.5 * this._container.offsetHeight)};
        if ((this._selectedItem !== null) && (this._selectedItem.anchors !== null)) {
            origin = this._transformFromModelToContainer(this._selectedItem.anchors.center);
        }

        // scale model
        let factor = (typeof ZOOM_FACTOR !== "undefined") ? 1 / ZOOM_FACTOR : (1 / 1.2);
        this._model.scaleTransformMatrix(factor, origin);
    }

    /** _connectBegin
        Initiates a connection between KAOS items.
        :param connectorType: type of kaos relationship
        :param item: the source kaos item
        :param pos: the pointer position
    **/
    _connectBegin(connectorType, item, pos) {
        if (item === null) {
            // cancel if no item given
            this._connector = null;
            this._createEnd();
            return;
        }

        // calculate endpoints of connector
        let p1 = item.chooseAnchorPoint(pos);
        let p2 = pos;

        // create kaos item for connecting relationship
        this._connector = this._createItem(connectorType, this._createUUID(), p1, p2);
        if (this._connector !== null) {
            // set source of relationship to given item and select the connector
            this._connector.source = item;

            // check constraints and purge any invalid relationships
            if (!this._connector.checkConstraints()) {
                // display violation
                this.displayMessage("Invalid source for relationship.");
                this.removeItem(this._connector);
                this._connector = null;
            } else {
                // select source
                this.selectItem(this._connector.source);
            }
        }
    }

    /** _connectEnd
        Completes or cancels a connection between KAOS items.
        :param item: the target kaos item
        :param pos: the pointer position
    **/
    _connectEnd(item, pos) {
        if (this._connector === null) {
            // cancel if no connector is being tracked
            this._createEnd();
            return;
        }

        // verify source and candidate target exist
        if ((this._connector.source === null) || (item === null)) {
            // clear reference to connecting item and remove it from workspace
            this.removeItem(this._connector);
            this._connector = null;
            return;
        }

        // check if target is same as source
        if ((item === this._connector) || (item === this._connector.source)) {
            // check for alternatives at same location (for touch quirkiness?)
            let altItem = this._model.findItemAtPosition(pos, [this._connector, this._connector.source]);
            if (altItem !== null) {
                item = altItem;
            }

            // check if no alternatives were found
            if ((item === this._connector) || (item === this._connector.source))  {
                // clear reference to connector and remove it from workspace
                this.removeItem(this._connector);
                this._connector = null;

                // end creation mode for connector
                this._createEnd();

                // select the target item
                this.selectItem(item);
                return;
            }
        }

        // calculate endpoints for connecting relationship
        this._connector.target = item;
        let p1 = this._connector.source.chooseAnchorPoint(pos);
        let p2 = this._connector.target.chooseAnchorPoint(p1);
        this._connector.updateEndpoints(p1, p2);

        // check constraints and purge any invalid relationships
        if (!this._connector.checkConstraints()) {
            this.displayMessage("Invalid target for relationship.");
            this.removeItem(this._connector);
            this._connector = null;
            return;
        }

        // check for any matching pre-existing relationships
        let items = this._model.items;
        for (let i = 0; i < items.length; i++) {
            if ((items[i] instanceof KAOSRelationship) && (items[i].reference !== this._connector.reference)) {
                if ((items[i].source === this._connector.source) && (items[i].target === this._connector.target)) {
                    this.displayMessage("Relationship already exists.");
                    this.removeItem(this._connector);
                    this._connector = null;
                    return;
                }
                if ((items[i].source === this._connector.target) && (items[i].target === this._connector.source)) {
                    this.displayMessage("Relationships must only be one-way.");
                    this.removeItem(this._connector);
                    this._connector = null;
                    return;
                }
            }
        }

        // convert relationship to conflict if appropriate
        if (this._connector.source.constructor.name === "KAOSObstacle" && this._connector.target.constructor.name === "KAOSGoal") {
            this.removeItem(this._connector)
            let alt = this._createItem("KAOSConflict", this._createUUID(), p1, p2)
            alt.source = this._connector.source
            alt.target = this._connector.target
        }

        // convert relationship to resolution if appropriate
        if (this._connector.source.constructor.name === "KAOSGoal" && this._connector.target.constructor.name === "KAOSObstacle") {
            this.removeItem(this._connector)
            let alt = this._createItem("KAOSResolution", this._createUUID(), p1, p2)
            alt.source = this._connector.source
            alt.target = this._connector.target
        }
        if (this._connector.source.constructor.name === "KAOSDomainProperty" && this._connector.target.constructor.name === "KAOSObstacle") {
            this.removeItem(this._connector)
            let alt = this._createItem("KAOSResolution", this._createUUID(), p1, p2)
            alt.source = this._connector.source
            alt.target = this._connector.target
        }

        // clear reference to connecting item
        this._connector = null;
    }

    /** _connectMove
        Continues a connection between KAOS items.
        :param pos: the pointer position
    **/
    _connectMove(pos) {
        if ((this._connector === null) || (this._connector.source === null)) {
            // cancel if no connecting item is being tracked
            return;
        }

        // calculate endpoints for connecting relationship
        let p1 = this._connector.source.chooseAnchorPoint(pos);
        let p2 = pos;

        // offset end slightly for aesthetics
        let dist = Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
        let angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        p2.x = p1.x + (dist - 5) * Math.cos(angle);
        p2.y = p1.y + (dist - 5) * Math.sin(angle);

        // update endpoints for connecting relationship
        this._connector.updateEndpoints(p1, p2);

        // switch selection
        this.unselectItem();
        let item = this._model.findItemAtPosition(pos);
        if (item !== null) {
            this.selectItem(item);
        }
    }

    /** _createBegin
        Initiates the creation of an item.
        :param mode: designates which type of KAOS to create
    **/
    _createBegin(mode) {
        this._creationMode = mode;

        // create and dispatch event to reflect a change in the creation mode
        let evt = new CustomEvent("creationchange", {detail: {"mode": this._creationMode}});
        this._container.dispatchEvent(evt);
    }

    /** _createEnd
        Completes or cancels the creation of an item.
    **/
    _createEnd() {
        this._creationMode = null;

        // create and dispatch event to reflect a change in the creation mode
        let evt = new CustomEvent("creationchange", {detail: {"mode": this._creationMode}});
        this._container.dispatchEvent(evt);
    }

    /** _createItem
        Creates an item in the workspace.
        :param itemType: type of kaos item to create
        :param uuid: a unique identifier for the kaos item
        :param pos1: the initial position of the kaos item
        :param pos2: a second position given for kaos relationships
        :return: the new kaos item
    **/
    _createItem(itemType, uuid, pos1=null, pos2=null) {
        // get next available identifier number
        let idnum = this._model.issueNextIdentifierNumber(itemType);

        // create item based on given type
        let item = null;
        switch (itemType.toLowerCase()) {
            case "KAOSAgent".toLowerCase():
                item = new KAOSAgent(uuid, idnum);
                break;
            case "KAOSConflict".toLowerCase():
                item = new KAOSConflict(uuid, idnum);
                break;
            case "KAOSDomainProperty".toLowerCase():
                item = new KAOSDomainProperty(uuid, idnum);
                break;
            case "KAOSGoal".toLowerCase():
                item = new KAOSGoal(uuid, idnum);
                break;
            case "KAOSObstacle".toLowerCase():
                item = new KAOSObstacle(uuid, idnum);
                break;
            case "KAOSRefinement".toLowerCase():
                item = new KAOSRefinement(uuid, idnum);
                break;
            case "KAOSResolution".toLowerCase():
                item = new KAOSResolution(uuid, idnum);
                break;
            default:
                break;
        }

        if (item !== null) {
            // check if item is in model
            if (this._model.findItem(item.reference) !== null) {
                // when duplicates exists, try again (this will create a new uuid)
                return this._createItem(itemType, this._createUUID(), pos1, pos2);
            }

            // check if item identifier is unique within model
            if (this._model.findItem(item.identifier, "identifier") !== null) {
                // when duplicates exists, try again (this will issue a new identifier number)
                return this._createItem(itemType, uuid, pos1, pos2);
            }

            // create svg elements for item and add it to the model
            if (item instanceof KAOSRelationship) {
                let elem = item.createSVGElement(this._container.ownerDocument, pos1, pos2);
                this._model.addItem(item);
            }
            else {
                let elem = item.createSVGElement(this._container.ownerDocument, pos1);
                this._model.addItem(item);
            }
        }

        return item;
    }

    /** _createSVGRoot
        Creates root SVG element.
        :param doc: parent document for svg element
        :return: svg element
    **/
    _createSVGRoot(doc) {
        // create svg root
        let svgRoot = doc.createElementNS(SVGNS, "svg");
        svgRoot.setAttribute("SVGNS", SVGNS);
        svgRoot.setAttributeNS(XMLNS, "xmlns:xlink", XLINKNS);

        // create definitions
        let svgDefs = doc.createElementNS(SVGNS, "defs");
        svgRoot.appendChild(svgDefs);

        // create marker for empty arrowhead
        let svgEmptyArrowMarker = doc.createElementNS(SVGNS, "marker");
        svgEmptyArrowMarker.setAttribute("id", "emptyarrow");
        svgEmptyArrowMarker.setAttribute("markerWidth", "10");
        svgEmptyArrowMarker.setAttribute("markerHeight", "10");
        svgEmptyArrowMarker.setAttribute("refX", "8");
        svgEmptyArrowMarker.setAttribute("refY", "4");
        svgEmptyArrowMarker.setAttribute("orient", "auto");
        svgEmptyArrowMarker.setAttribute("markerUnits", "strokeWidth");
        svgDefs.appendChild(svgEmptyArrowMarker);
        let svgEmptyArrowMarkerPath = doc.createElementNS(SVGNS, "path");
        svgEmptyArrowMarkerPath.setAttribute("d", "M 0 0 C 1 4 1 4 0 8 L 9 4 Z");
        svgEmptyArrowMarkerPath.setAttribute("fill", "#ffffff");
        svgEmptyArrowMarkerPath.setAttribute("stroke", "#000000");
        svgEmptyArrowMarker.appendChild(svgEmptyArrowMarkerPath);

        // create marker for filled arrowhead
        let svgFilledArrowMarker = doc.createElementNS(SVGNS, "marker");
        svgFilledArrowMarker.setAttribute("id", "filledarrow");
        svgFilledArrowMarker.setAttribute("markerWidth", "10");
        svgFilledArrowMarker.setAttribute("markerHeight", "10");
        svgFilledArrowMarker.setAttribute("refX", "8");
        svgFilledArrowMarker.setAttribute("refY", "4");
        svgFilledArrowMarker.setAttribute("orient", "auto");
        svgFilledArrowMarker.setAttribute("markerUnits", "strokeWidth");
        svgDefs.appendChild(svgFilledArrowMarker);
        let svgFilledArrowMarkerPath = doc.createElementNS(SVGNS, "path");
        svgFilledArrowMarkerPath.setAttribute("d", "M 0 0 C 1 4 1 4 0 8 L 9 4 Z");
        svgFilledArrowMarkerPath.setAttribute("fill", "#000000");
        svgFilledArrowMarker.appendChild(svgFilledArrowMarkerPath);

        // create marker for filled arrowhead with line
        let svgLinedArrowMarker = doc.createElementNS(SVGNS, "marker");
        svgLinedArrowMarker.setAttribute("id", "linedarrow");
        svgLinedArrowMarker.setAttribute("markerWidth", "13");
        svgLinedArrowMarker.setAttribute("markerHeight", "10");
        svgLinedArrowMarker.setAttribute("refX", "11");
        svgLinedArrowMarker.setAttribute("refY", "4");
        svgLinedArrowMarker.setAttribute("orient", "auto");
        svgLinedArrowMarker.setAttribute("markerUnits", "strokeWidth");
        svgDefs.appendChild(svgLinedArrowMarker);
        let svgLinedArrowMarkerPath = doc.createElementNS(SVGNS, "path");
        svgLinedArrowMarkerPath.setAttribute("d", "M 3 0 C 4 4 4 4 3 8 L 12 4 Z");
        svgLinedArrowMarkerPath.setAttribute("fill", "#000000");
        svgLinedArrowMarker.appendChild(svgLinedArrowMarkerPath);
        let svgLinedArrowMarkerLine = doc.createElementNS(SVGNS, "path");
        svgLinedArrowMarkerLine.setAttribute("d", "M 0 0 L 0 8");
        svgLinedArrowMarkerLine.setAttribute("stroke", "#000000");
        svgLinedArrowMarkerLine.setAttribute("stroke-width", "2");
        svgLinedArrowMarker.appendChild(svgLinedArrowMarkerLine);

        // create shadow filter effect
        let svgShadowFilter = doc.createElementNS(SVGNS, "filter");
        svgShadowFilter.setAttribute("id", "shadow");
        svgShadowFilter.setAttribute("width", "1.5");
        svgShadowFilter.setAttribute("height", "1.5");
        svgShadowFilter.setAttribute("x", "-0.25");
        svgShadowFilter.setAttribute("y", "-0.25");
        svgDefs.appendChild(svgShadowFilter);
        let svgShadowBlur = doc.createElementNS(SVGNS, "feGaussianBlur");
        svgShadowBlur.setAttribute("in", "SourceAlpha");
        svgShadowBlur.setAttribute("stdDeviation", "2.5");
        svgShadowBlur.setAttribute("result", "blur");
        svgShadowFilter.appendChild(svgShadowBlur);
        let svgShadowOffset = doc.createElementNS(SVGNS, "feOffset");
        svgShadowOffset.setAttribute("in", "bluralpha");
        svgShadowOffset.setAttribute("dx", "3");
        svgShadowOffset.setAttribute("dy", "3");
        svgShadowOffset.setAttribute("result", "offsetBlur");
        svgShadowFilter.appendChild(svgShadowOffset);
        let svgShadowColorMatrix = doc.createElementNS(SVGNS, "feColorMatrix");
        svgShadowColorMatrix.setAttribute("result", "bluralpha");
        svgShadowColorMatrix.setAttribute("type", "matrix");
        svgShadowColorMatrix.setAttribute("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.4 0");
        svgShadowFilter.appendChild(svgShadowColorMatrix);
        let svgShadowMerge = doc.createElementNS(SVGNS, "feMerge");
        svgShadowFilter.appendChild(svgShadowMerge);
        let svgShadowMergeNode1 = doc.createElementNS(SVGNS, "feMergeNode");
        svgShadowMergeNode1.setAttribute("in", "offsetBlur");
        svgShadowMerge.appendChild(svgShadowMergeNode1);
        let svgShadowMergeNode2 = doc.createElementNS(SVGNS, "feMergeNode");
        svgShadowMergeNode2.setAttribute("in", "SourceGraphic");
        svgShadowMerge.appendChild(svgShadowMergeNode2);

        // create inner grid pattern
        let svgInnerGridPattern = doc.createElementNS(SVGNS, "pattern");
        svgInnerGridPattern.setAttribute("id", "innergrid");
        svgInnerGridPattern.setAttribute("width", "10");
        svgInnerGridPattern.setAttribute("height", "10");
        svgInnerGridPattern.setAttribute("patternUnits", "userSpaceOnUse");
        svgDefs.appendChild(svgInnerGridPattern);
        let svgInnerGridPatternPath = doc.createElementNS(SVGNS, "path");
        svgInnerGridPatternPath.setAttribute("d", "M 10 0 L 0 0 0 10");
        svgInnerGridPatternPath.setAttribute("fill", "none");
        svgInnerGridPatternPath.setAttribute("stroke", "gray");
        svgInnerGridPatternPath.setAttribute("stroke-width", "0.5");
        svgInnerGridPattern.appendChild(svgInnerGridPatternPath);

        // create grid pattern
        let svgGridPattern = doc.createElementNS(SVGNS, "pattern");
        svgGridPattern.setAttribute("id", "grid");
        svgGridPattern.setAttribute("width", "100");
        svgGridPattern.setAttribute("height", "100");
        svgGridPattern.setAttribute("patternUnits", "userSpaceOnUse");
        svgDefs.appendChild(svgGridPattern);
        let svgGridPatternRect = doc.createElementNS(SVGNS, "rect");
        svgGridPatternRect.setAttribute("width", "100");
        svgGridPatternRect.setAttribute("height", "100");
        svgGridPatternRect.setAttribute("fill", "url(#innergrid)");
        svgGridPattern.appendChild(svgGridPatternRect);
        let svgGridPatternPath = doc.createElementNS(SVGNS, "path");
        svgGridPatternPath.setAttribute("d", "M 100 0 L 0 0 0 100");
        svgGridPatternPath.setAttribute("fill", "none");
        svgGridPatternPath.setAttribute("stroke", "gray");
        svgGridPatternPath.setAttribute("stroke-width", "0.5");
        svgGridPattern.appendChild(svgGridPatternPath);

        // create background
        let svgBackgroundGroup = doc.createElementNS(SVGNS, "g");
        svgBackgroundGroup.setAttribute("id", "background");
        svgRoot.appendChild(svgBackgroundGroup);
        let svgBackgroundGroupRect = doc.createElementNS(SVGNS, "rect");
        svgBackgroundGroupRect.setAttribute("width", "100%");
        svgBackgroundGroupRect.setAttribute("height", "100%");
        svgBackgroundGroupRect.setAttribute("fill", "url(#grid)");
        svgBackgroundGroup.appendChild(svgBackgroundGroupRect);

        return svgRoot;
    }

    /** _createUUID
        Creates a universally unique identifier (UUID) identifier.
        :return: a uuid
    **/
    _createUUID() {
        let dt = new Date().getTime();
        let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            let r = (dt + Math.random()*16)%16 | 0;
            dt = Math.floor(dt/16);
            return (c === "x" ? r :(r&0x3|0x8)).toString(16);
        });
        return uuid;
    }

    /** _dragBegin
        Initiates the dragging of an item.
        :param item: the target kaos item
        :param pos: the pointer position
    **/
    _dragBegin(item, pos) {
        if (item === null) {
            // cancel dragging if no item given or given item is a relationship
            return;
        }

        // set dragged item
        this._dragItem = item;

        if (item instanceof KAOSRelationship) {
            // do nothing
            this._dragOffset = {"x": 0, "y": 0};
        }
        else {
            // create an initial transform for item if one does not exist
            if (this._dragItem.transform === null) {
                this._dragItem.transform = this._svgRoot.createSVGTransform();
                this._dragItem.transform.setTranslate(0, 0);
            }

            // compute an offset for the dragged item
            let transform = this._dragItem.transform;
            let dragOrigin = {"x": transform.matrix.e, "y": transform.matrix.f};
            this._dragOffset = {"x": (pos.x - dragOrigin.x), "y": (pos.y - dragOrigin.y)};
        }

        // find all relationships associated with the dragged item
        this._dragRelationships = this._model.getRelationshipsFor(this._dragItem);
        let addedRelationships = [];
        for (const rel1 of this._dragRelationships) {
            let extra = this._model.getRelationshipsFor(rel1);
            addedRelationships.push(...extra)
        }
        this._dragRelationships.push(...addedRelationships)
    }

    /** _dragEnd
        Completes or cancels the dragging of an item.
    **/
    _dragEnd() {
        this._dragItem = null;
        this._dragOffset = null;
        this._dragRelationships = null;
    }

    /** _dragMove
        Continues the dragging of an item.
        :param pos: the pointer position
    **/
    _dragMove(pos) {
        if ((this._dragItem === null) || (this._dragOffset === null) || (this._dragRelationships === null)) {
            // check if nothing is being tracked for dragging
            return;
        }

        if (this._dragItem instanceof KAOSRelationship) {
            this._dragItem.targetAnchor = this._dragItem.target.chooseAnchor(pos);
            let p1 = this._dragItem.source.chooseAnchorPoint(pos);
            if (this._dragItem.sourceAnchor !== "") {
                p1 = this._dragItem.source.anchors[this._dragItem.sourceAnchor];
            }
            let p2 = this._dragItem.target.chooseAnchorPoint(p1);
            if (this._dragItem.targetAnchor !== "") {
                p2 = this._dragItem.target.anchors[this._dragItem.targetAnchor];
            }
            this._dragItem.updateEndpoints(p1, p2);
        }
        else {
            // check transform for item and update it
            let transform = this._dragItem.transform;
            if (transform !== null) {
                transform.setTranslate((pos.x - this._dragOffset.x), (pos.y - this._dragOffset.y));
            }
        }

        // update relationships for the dragged item
        for (let i = 0; i < this._dragRelationships.length; i++) {
            // re-calculate endpoints from source and target
            let relationship = this._dragRelationships[i];
            if ((relationship.source !== null) && (relationship.target !== null)) {
                let p1 = relationship.source.chooseAnchorPoint(relationship.target.anchors.center);
                if (relationship.sourceAnchor !== "") {
                    p1 = relationship.source.anchors[relationship.sourceAnchor];
                }
                let p2 = relationship.target.chooseAnchorPoint(p1);
                if (relationship.targetAnchor !== "") {
                    p2 = relationship.target.anchors[relationship.targetAnchor];
                }
                relationship.updateEndpoints(p1, p2);
            }
        }
    }

    /** _panBegin
        Initiates the panning of the workspace.
        :param pos: the pointer position
    **/
    _panBegin(pos) {
        // compute pan offset
        let transform = this._model.transform;
        if (transform !== null) {
            let panOrigin = this._transformFromModelToContainer(pos);
            let viewOrigin = {"x": transform.matrix.e, "y": transform.matrix.f};
            this._panOffset = {"x": (panOrigin.x - viewOrigin.x), "y": (panOrigin.y - viewOrigin.y)};
        }
    }

    /** _panEnd
        Completes or cancels the panning of the workspace.
        :param pos: the pointer position
    **/
    _panEnd() {
        this._panOffset = null;
    }

    /** _panMove
        Continues the panning of the workspace.
        :param pos: the pointer position
    **/
    _panMove(pos) {
        if (this._panOffset === null) {
            // cancel if no pan offset is being tracked
            return;
        }

        // reposition view of model
        let panCurrent = this._transformFromModelToContainer(pos);
        let viewCurrent = {"x": (panCurrent.x - this._panOffset.x), "y": (panCurrent.y - this._panOffset.y)};
        this._model.repositionTransformMatrix(viewCurrent);
    }

    /** _scaleBegin
        Initiates the scaling of the workspace.
        :param pos1: a pointer position
        :param pos2: a pointer position
    **/
    _scaleBegin(pos1, pos2) {
        // transform points to correct coordinate frame
        pos1 = this._transformFromModelToContainer(pos1);
        pos2 = this._transformFromModelToContainer(pos2);

        // compute origin as the mid-point between given points and original distance between given points
        let delta = {"x": (pos1.x - pos2.x), "y": (pos1.y - pos2.y)};
        this._scaleOrigin = {"x": 0.5 * (pos1.x + pos2.x), "y": 0.5 * (pos1.y + pos2.y)};
        this._scaleOriginDist = Math.sqrt(delta.x * delta.x + delta.y * delta.y);

        // copy original transform matrix for model
        let transform = this._model.transform;
        this._scaleOriginMatrix = this._svgRoot.createSVGMatrix();
        this._scaleOriginMatrix.a = transform.matrix.a;
        this._scaleOriginMatrix.b = transform.matrix.b;
        this._scaleOriginMatrix.c = transform.matrix.c;
        this._scaleOriginMatrix.d = transform.matrix.d;
        this._scaleOriginMatrix.e = transform.matrix.e;
        this._scaleOriginMatrix.f = transform.matrix.f;
    }

    /** _scaleEnd
        Completes or cancels the scaling of the workspace.
    **/
    _scaleEnd() {
        this._scaleOrigin = null;
        this._scaleOriginDist = null;
        this._scaleOriginMatrix = null;
    }

    /** _scaleMove
        Continues the scaling of the workspace.
        :param pos1: a pointer position
        :param pos2: a pointer position
    **/
    _scaleMove(pos1, pos2) {
        if ((this._scaleOrigin === null) || (this._scaleOriginDist === null) || (this._scaleOriginMatrix === null)) {
            // cancel if scaling is not being tracked
            return;
        }

        if ((typeof pos1 === "undefined") || (pos1 === null)) {
            // cancel if pointer position not provided
            return;
        }

        if ((typeof pos2 === "undefined") || (pos2 === null)) {
            // cancel if pointer position not provided
            return;
        }

        // transform pointer positions to correct coordinate frame
        pos1 = this._transformFromModelToContainer(pos1);
        pos2 = this._transformFromModelToContainer(pos2);

        // compute scale factor as a ratio of current distance between points and original distance
        let delta = {"x": (pos1.x - pos2.x), "y": (pos1.y - pos2.y)};
        let currDist = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
        let factor = currDist / this._scaleOriginDist;

        // reset and scale the model transform matrix
        this._model.resetTransformMatrix(this._scaleOriginMatrix);
        this._model.scaleTransformMatrix(factor, this._scaleOrigin);
    }

    /** _transformFromModelToContainer
        Transforms a point from the model coordinate frame to the container coordinate frame.
        :param pos: a 2d point
        :return: the transformed 2d point
    **/
    _transformFromModelToContainer(pos) {
        if ((this._svgRoot === null) || (this._model.svgGroup === null) || (this._model.transform === null)) {
            return pos;
        }

        if ((typeof pos === "undefined") || (pos === null)) {
            return pos;
        }

        // translate the pointer position
        let point = this._svgRoot.createSVGPoint();
        point.x = pos.x;
        point.y = pos.y;
        point = point.matrixTransform(this._model.transform.matrix);
        return point;
    }


    /** _transformFromModelToScreen
        Transforms a point from the model coordinate frame to the screen coordinate frame.
        :param pos: a 2d point
        :return: the transformed 2d point
    **/
    _transformFromModelToScreen(pos) {
        if ((this._svgRoot === null) || (this._model.svgGroup === null) || (this._model.transform === null)) {
            return pos;
        }

        if ((typeof pos === "undefined") || (pos === null)) {
            return pos;
        }

        // translate the pointer position
        let point = this._svgRoot.createSVGPoint();
        point.x = pos.x;
        point.y = pos.y;
        point = point.matrixTransform(this._model.transform.matrix);
        point = point.matrixTransform(this._svgRoot.getScreenCTM());
        return point;
    }

    /** _transformFromScreenToContainer
        Transforms a point from the screen coordinate frame to the container coordinate frame.
        :param pos: a 2d point
        :return: the transformed 2d point
    **/
    _transformFromScreenToContainer(pos) {
        if ((this._svgRoot === null) || (this._model.svgGroup === null) || (this._model.transform === null)) {
            return pos;
        }

        if ((typeof pos === "undefined") || (pos === null)) {
            return pos;
        }

        // translate the pointer position
        let point = this._svgRoot.createSVGPoint();
        point.x = pos.x;
        point.y = pos.y;
        point = point.matrixTransform(this._svgRoot.getScreenCTM().inverse());
        return point;
    }

    /** _transformFromScreenToModel
        Transforms a point from the screen coordinate frame to the model coordinate frame.
        :param pos: a 2d point
        :return: the transformed 2d point
    **/
    _transformFromScreenToModel(pos) {
        if ((this._svgRoot === null) || (this._model.svgGroup === null) || (this._model.transform === null)) {
            return pos;
        }

        if ((typeof pos === "undefined") || (pos === null)) {
            return pos;
        }

        // translate the pointer position
        let point = this._svgRoot.createSVGPoint();
        point.x = pos.x;
        point.y = pos.y;
        point = point.matrixTransform(this._svgRoot.getScreenCTM().inverse());
        point = point.matrixTransform(this._model.transform.matrix.inverse());
        return point;
    }
}
