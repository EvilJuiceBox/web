/** KAOSDraw
    Created by: Michael Austin Langford
**/

/** UIApplication class
    Manages the overall application, mediating interactions between the user and the workspace.
**/
class UIApplication {
    /** constructor
    **/
    constructor() {
        // keep track of last known mouse position
        this._lastMouse = {"x": 0, "y": 0};

        // add event listeners to document body
        document.body.addEventListener("keydown", onKeyDown);

        // initialize workspace container
        this._containerWorkspace = this._initContainer("workspace_container");
        if (this._containerWorkspace === null) {
            throw new Error("Failed to locate workspace container.");
        }

        // create workspace
        this._workspace = new UIWorkspace(this._containerWorkspace);

        // add workspace event listeners
        this._containerWorkspace.addEventListener("touchstart", onPointerDown);
        this._containerWorkspace.addEventListener("touchmove", onPointerMove);
        this._containerWorkspace.addEventListener("touchend", onPointerUp);
        this._containerWorkspace.addEventListener("touchleave", onPointerUp);
        this._containerWorkspace.addEventListener("touchcancel", onPointerUp);
        this._containerWorkspace.addEventListener("mousedown", onPointerDown);
        this._containerWorkspace.addEventListener("mousemove", onPointerMove);
        this._containerWorkspace.addEventListener("mouseup", onPointerUp);
        this._containerWorkspace.addEventListener("mouseleave", onPointerUp);
        this._containerWorkspace.addEventListener("wheel", onPointerScroll);
        this._containerWorkspace.addEventListener("creationchange", onCreationChange);
        this._containerWorkspace.addEventListener("clearitem", onItemHideRequest);
        this._containerWorkspace.addEventListener("displayitem", onItemDisplayRequest);
        this._containerWorkspace.addEventListener("displaymessage", onMessageDisplayRequest);
        this._containerWorkspace.addEventListener("displayvalidation", onValidationDisplayRequest);

        // read css theme from cookie
        this._theme = this._getCookie("theme");
        if ((this._theme === null) || (this._theme === "")) {
            this._theme = document.body.className;
        }
        else {
            document.body.className = this._theme;
        }

        // initialize buttons
        this._btnItemForward = this._initButton("btn_item_forward", onItemForwardRequest);
        this._btnItemBackward = this._initButton("btn_item_backward", onItemBackwardRequest);
        this._btnItemDelete = this._initButton("btn_item_delete", onItemDeleteRequest);
        this._btnZoomCenter = this._initButton("btn_zoom_center", onZoomCenterRequest);
        this._btnZoomIn = this._initButton("btn_zoom_in", onZoomInRequest);
        this._btnZoomOut = this._initButton("btn_zoom_out", onZoomOutRequest);
        this._lnkModelValidate = this._initButton("lnk_model_validate", onModelValidateRequest);
        this._lnkGridToggle = this._initButton("lnk_grid", onGridToggleRequest);
        this._lnkGridToggle.innerHTML = "grid-on";
        this._lnkThemeToggle = this._initButton("lnk_theme", onThemeToggleRequest);
        this._lnkThemeToggle.innerHTML = this._theme;

        // init file save buttons
        this._lnkFileSaveJPEG = this._initSaveButton("lnk_file_savejpeg", onSaveJPEGRequest, "local");
        this._lnkFileSaveKAOS = this._initSaveButton("lnk_file_savekaos", onSaveKAOSRequest, "local");
        this._lnkFileSaveLogic = this._initSaveButton("lnk_file_savelogic", onSaveLogicRequest, "local");
        this._lnkFileSaveSVG = this._initSaveButton("lnk_file_savesvg", onSaveSVGRequest, "local");

        // initialize file dialogs
        this._dlgFileOpenSVG = this._initFileDialog("dlg_file_opensvg", onOpenSVGRequest);

        // initialize message and overlay containers
        this._containerMessage = this._initContainer("message_container");
        this._txtMessage = this._initContainer("message_text");
        this._containerOverlay = this._initContainer("overlay_container", onValidationHideRequest);
        this._txtOverlay = this._initContainer("overlay_text");

        // initialize workspace buttons
        this._creationButtons = [
            this._initCreationButton("btn_connect_refinement", "KAOSRefinement", onCreationRequest),
            this._initCreationButton("btn_create_agent", "KAOSAgent", onCreationRequest),
            this._initCreationButton("btn_create_domainproperty", "KAOSDomainProperty", onCreationRequest),
            this._initCreationButton("btn_create_goal", "KAOSGoal", onCreationRequest),
            this._initCreationButton("btn_create_obstacle", "KAOSObstacle", onCreationRequest),
        ];

        // initialize model inputs
        this._fieldsetModel = this._initFieldset("fld_model", true);
        this._fieldsetModelLegend = this._initFieldsetLegend("lgd_model");
        this._modelFields = [
            this._initModelHiddenField("hdn_model_reference", "reference"),
            this._initModelTextField("txt_model_description", "description", onModelFieldChange),
            this._initModelTextField("txt_model_identifier", "identifier", onModelFieldChange),
        ];
        this._refreshModelInputs();

        // initialize item inputs
        this._fieldsetItem = this._initFieldset("fld_item", false);
        this._fieldsetItemLegend = this._initFieldsetLegend("lgd_item");
        this._itemFields = [
            this._initItemGroup("grp_item_definition", "definition"),
            this._initItemGroup("grp_item_description", "description"),
            this._initItemGroup("grp_item_identifier", "identifier"),
            this._initItemGroup("grp_item_isachieve", "isAchieve"),
            this._initItemGroup("grp_item_isavoid", "isAvoid"),
            this._initItemGroup("grp_item_ismaintain", "isMaintain"),
            this._initItemGroup("grp_item_description", "description"),
            this._initItemGroup("grp_item_utilityfunction", "utilityFunction"),
            this._initItemGroup("grp_item_utilityfunction_param1", "utilityFunction_param1"),
            this._initItemGroup("grp_item_utilityfunction_param2", "utilityFunction_param2"),
            this._initItemGroup("grp_item_utilityfunction_param3", "utilityFunction_param3"),
            this._initItemHiddenField("hdn_item_reference", "reference"),
            this._initItemCheckField("chk_item_isachieve", "isAchieve", onItemFieldChange),
            this._initItemCheckField("chk_item_isavoid", "isAvoid", onItemFieldChange),
            this._initItemCheckField("chk_item_ismaintain", "isMaintain", onItemFieldChange),
            this._initItemLabelField("txt_item_definition", "definition"),
            this._initItemSelectField("sel_item_operatingcondition", "operatingCondition", onItemFieldChange, OPERATING_CONDITIONS),
            this._initItemSelectField("sel_item_utilityfunction", "utilityFunction", onItemFieldChange, UTILITY_FUNCTIONS),
            this._initItemTextField("txt_item_description", "description", onItemFieldChange),
            this._initItemTextField("txt_item_identifier", "identifier", onItemFieldChange),
            this._initItemGroup("grp_item_operatingcondition", "operatingCondition"),
            this._initItemGroup("grp_item_operatingcondition_param1", "operatingCondition_param1"),
            this._initItemGroup("grp_item_operatingcondition_param2", "operatingCondition_param2"),
            this._initItemGroup("grp_item_operatingcondition_param3", "operatingCondition_param3"),
            this._initItemTextField("txt_item_description", "description", onItemFieldChange),
            this._initItemTextField("txt_item_operatingcondition_param1", "operatingCondition_param1", onItemFieldChange),
            this._initItemTextField("txt_item_operatingcondition_param2", "operatingCondition_param2", onItemFieldChange),
            this._initItemTextField("txt_item_operatingcondition_param3", "operatingCondition_param3", onItemFieldChange),
            this._initItemTextField("txt_item_utilityfunction_param1", "utilityFunction_param1", onItemFieldChange),
            this._initItemTextField("txt_item_utilityfunction_param2", "utilityFunction_param2", onItemFieldChange),
            this._initItemTextField("txt_item_utilityfunction_param3", "utilityFunction_param3", onItemFieldChange),
        ];
    }

    /** clickCreationButton
        Initiate item creation in workspace.
        :param button: the button that triggered the event
    **/
    clickCreationButton(button) {
        // save undo state
        this._workspace.recordUndoState();

        // initiation creation for associated item type
        let mode = button.getAttribute("data-creation-mode");
        this._workspace.initiateCreation(mode);
    }

    /** deleteItem
        Removes selected item from workspace.
    **/
    deleteItem() {
        // save undo state
        this._workspace.recordUndoState();

        // destroy the selected item
        this._workspace.removeItem(this._workspace.selectedItem);
    }

    /** displayItem
        Display selected item's details and inputs.
    **/
    displayItem() {
        // get the selected item and refresh inputs to match current values
        let selectedItem = this._workspace.selectedItem;
        this._refreshItemInputs(selectedItem);

        // display the fieldset
        if (this._fieldsetItem !== null) {
            this._fieldsetItem.classList.remove("hidden");

            // set the fieldset legend to the item type
            if (this._fieldsetItemLegend !== null) {
                this._fieldsetItemLegend.innerHTML = selectedItem.constructor.name;
            }
        }
    }

    /** displayMessage
        Displays a message from the workspace.
    **/
    displayMessage(text) {
        if ((this._containerMessage !== null) && (this._txtMessage !== null)) {
            // display message container and set text
            this._containerMessage.classList.remove("hidden");
            this._txtMessage.innerHTML = text;

            // set a delayed event to hide the message
            let delay = (typeof FADE_DELAY !== "undefined") ? FADE_DELAY : 5000;
            setTimeout(onMessageHideRequest, delay);
        }
    }

    /** displayValidation
        Displays validation text.
        :param violations: collection of violations from validator
    **/
    displayValidation(violations) {
        // show overlay container
        if (this._containerOverlay !== null) {
            this._containerOverlay.classList.remove("hidden");
        }

        // display validation results
        if (this._txtOverlay !== null) {
            this._txtOverlay.innerHTML = "Validation results:<br>";
            this._txtOverlay.innerHTML += "<ul>";
            if (violations.length > 0) {
                for (let i = 0; i < violations.length; i++) {
                    let reference = violations[i].reference;
                    let message = violations[i].message;
                    let violatorType = reference.split("_")[0].toUpperCase();
                    let violatorItem = this._workspace.model.findItem(reference);
                    let violatorIdentifier = (violatorItem !== null) ? violatorItem.identifier.toString().trim() : "";
                    let violator = (violatorIdentifier.length > 0) ? violatorIdentifier : violatorType;
                    this._txtOverlay.innerHTML += "<li class=\"violation\">" + violator + " - " + message + "</li>";
                }
            }
            else {
                this._txtOverlay.innerHTML += "<li>No violations found!</li>";
            }
            this._txtOverlay.innerHTML += "</ul>";
        }
    }

    /** hideItem
        Hide selected item's details and inputs.
    **/
    hideItem() {
        // hide the fieldset
        if (this._fieldsetItem !== null) {
            this._fieldsetItem.classList.add("hidden");
        }

        // take focus off active element
        document.activeElement.blur();
    }

    /** hideMessage
        Hides message text.
    **/
    hideMessage() {
        // hide message container
        if (this._containerMessage !== null) {
            this._containerMessage.classList.add("hidden");
        }

        // clear message text
        if (this._txtMessage !== null) {
            this._txtMessage.innerHTML = "";
        }
    }

    /** hideValidation
        Hides validation text.
    **/
    hideValidation() {
        // hide overlay container
        if (this._containerOverlay !== null) {
            this._containerOverlay.classList.add("hidden");
        }

        // clear overlay text
        if (this._txtOverlay !== null) {
            this._txtOverlay.innerHTML = "";
        }
    }

    /** keyDown
        Handles key presses.
        :param evt: key event data
    **/
    keyDown(evt) {
        // ignore shortcut keys when these types of elements are active
        let ignoreElements = ["number", "text", "textarea"];
        let ignoreKey = (ignoreElements.indexOf(document.activeElement.type) >= 0);
        if (ignoreKey) {
            return;
        }

        // get movement increment
        let movement = (typeof MOVEMENT_INCREMENT !== "undefined") ? MOVEMENT_INCREMENT : 5;

        // get pointer position at key press
        let pos = this._getPointerPosition(evt);

        // check the type of key pressed
        switch (evt.code) {
            case "ArrowDown":
                // drag the selected item or pan the workspace
                evt.preventDefault();
                this._workspace.move({"x": 0, "y": movement}, this._workspace.selectedItem);
                break;
            case "ArrowLeft":
                // drag the selected item or pan the workspace
                evt.preventDefault();
                this._workspace.move({"x": -movement, "y": 0}, this._workspace.selectedItem);
                break;
            case "ArrowRight":
                // drag the selected item or pan the workspace
                evt.preventDefault();
                this._workspace.move({"x": movement, "y": 0}, this._workspace.selectedItem);
                break;
            case "ArrowUp":
                // drag the selected item or pan the workspace
                evt.preventDefault();
                this._workspace.move({"x": 0, "y": -movement}, this._workspace.selectedItem);
                break;
            case "KeyC":
                if (evt.ctrlKey || evt.metaKey) {
                    // copy item
                    evt.preventDefault();
                    this._workspace.copyItem(this._workspace.selectedItem);
                }
                break;
            case "KeyV":
                if (evt.ctrlKey || evt.metaKey) {
                    // paste item
                    evt.preventDefault();
                    this._workspace.pasteItem(pos[0]);
                }
                break;
            case "KeyY":
                if (evt.ctrlKey || evt.metaKey) {
                    // perform a redo
                    evt.preventDefault();
                    this.redo();
                }
                break;
            case "KeyZ":
                if ((evt.ctrlKey || evt.metaKey) && evt.shiftKey) {
                    // perform a redo
                    evt.preventDefault();
                    this.redo();
                }
                else if ((evt.ctrlKey || evt.metaKey) && !evt.shiftKey) {
                    // perform an undo
                    evt.preventDefault();
                    this.undo();
                }
                break;
            case "Backspace":
            case "Delete":
                // delete item
                evt.preventDefault();
                this.deleteItem();
                break;
            case "Escape":
                // cancel creation mode
                evt.preventDefault();
                this._workspace.initiateCreation(null);
                break;
            default:
                break;
        }
    }

    /** openSVGXML
        Opens model from SVG XML file.
        :param text: text content from an SVG file
    **/
    openSVGXML(text) {
        // load workspace from svg xml
        this._workspace.loadFromSVGXML(text);

        // update model attribute inputs
        this._refreshModelInputs();

        // zoom to the center
        this._workspace.zoomCenter();
    }

    /** pointerDown
        Handle pointer down events.
        :param evt: mouse or touch event data
    **/
    pointerDown(evt) {
        // prevent default event
        evt.preventDefault();

        // locate pointer and relay event to workspace
        let pos = this._getPointerPosition(evt);
        this._workspace.pointerDown(evt.target, pos);
    }

    /** pointerMove
        Handle pointer move events.
        :param evt: mouse or touch event data
    **/
    pointerMove(evt) {
        // prevent default event
        evt.preventDefault();

        // locate pointer and relay event to workspace
        let pos = this._getPointerPosition(evt);
        this._workspace.pointerMove(evt.target, pos);
    }

    /** pointerScroll
        Handle pointer scroll events.
        :param evt: mouse or touch event data
    **/
    pointerScroll(evt) {
        // prevent default event
        evt.preventDefault();

        // locate pointer and relay event to workspace
        let delta = {"x": evt.deltaX, "y": evt.deltaY};
        this._workspace.pointerScroll(evt.target, delta);
    }

    /** pointerUp
        Handle pointer up events.
        :param evt: mouse or touch event data
    **/
    pointerUp(evt) {
        // prevent default event
        evt.preventDefault();

        // locate pointer and relay event to workspace
        let pos = this._getPointerPosition(evt);
        this._workspace.pointerUp(evt.target, pos);
    }

    /** redo
        Reverts model back to state prior to undo.
    **/
    redo() {
        // restore last undo state
        this._workspace.restoreRedoState();

        // update model attribute inputs
        this._refreshModelInputs();
    }

    /** refreshCreationButtons
        Refresh state of creation buttons.
    **/
    refreshCreationButtons(creationMode) {
        let buttons = this._creationButtons;
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i] !== null) {
                let buttonMode = buttons[i].getAttribute("data-creation-mode");
                if (buttonMode === creationMode) {
                    // toggle on activation of buttons with matching creation mode
                    buttons[i].classList.add("activated");
                }
                else {
                    // toggle off activation of buttons without matching creation mode
                    buttons[i].classList.remove("activated");
                }
            }
        }
    }

    /** saveJPEGXML
        Saves model as a jpeg file.
        :param destination: destination option for saving (default: "local")
    **/
    saveJPEG(destination="local") {
        // cancel any selections
        this._workspace.unselectItem();

        // set width and height of image to the visible size of the workspace container
        let w = this._containerWorkspace.clientWidth;
        let h = this._containerWorkspace.clientHeight;

        // serialize svg and explicitly set the width and height (note: needed for firefox)
        let svg = this._workspace.toSVGXML();
        svg = svg.replace("<svg", "<svg width=\"" + w + "px\" height=\"" + h + "\"")

        // create an image and when loaded, force download
        let fileName = this._workspace.model.identifier + ".jpg";
        let img = document.createElement("img");
        img.onload = function () {
            context.drawImage(img, 0, 0, w, h);
            let url = canvas.toDataURL('image/jpeg', 1.0);
            let elem = document.createElement("a");
            elem.setAttribute("href", url);
            elem.setAttribute("download", fileName);
            elem.style.display = "none";
            document.body.appendChild(elem);
            elem.click();
            document.body.removeChild(elem);
        };

        // create a canvas to draw the svg image to
        let canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        let context = canvas.getContext("2d");
        context.fillStyle = "rgb(255,255,255)";
        context.fillRect(0, 0, w, h);

        // create an svg blob and set it to the created image
        let blob = new Blob([svg], {"type": "image/svg+xml;charset=utf-8"});
        img.src = URL.createObjectURL(blob);
    }

    /** saveKAOSXML
        Saves model as a KAOS xml file.
        :param destination: destination option for saving (default: "local")
    **/
    saveKAOSXML(destination="local") {
        // cancel any selections
        this._workspace.unselectItem();

        // get kaos xml from model
        let fileName = this._workspace.model.identifier + ".xml";
        let fileContent = this._workspace.toKAOSXML();
        let fileType = "text/xml";
        switch (destination) {
            case "local":
                this._saveLocal(fileName, fileContent, fileType);
                break;
            default:
                break;
        }
    }

    /** saveLogicXML
        Saves model as a logic xml file.
        :param destination: destination option for saving (default: "local")
    **/
    saveLogicXML(destination="local") {
        // cancel any selections
        this._workspace.unselectItem();

        // TO DO: Remove
        // display logic string to user
        // this._workspace.displayMessage(this._workspace.toLogicText());
        console.log(this._workspace.toLogicText());

        // get kaos xml from model
        let fileName = this._workspace.model.identifier + ".xml";
        let fileContent = this._workspace.toLogicXML();
        let fileType = "text/xml";
        switch (destination) {
            case "local":
                this._saveLocal(fileName, fileContent, fileType);
                break;
            default:
                break;
        }
    }

    /** saveSVGXML
        Saves model as a SVG file.
        :param destination: destination option for saving (default: "local")
    **/
    saveSVGXML(destination="local") {
        // cancel any selections
        this._workspace.unselectItem();

        // get svg xml from model
        let fileName = this._workspace.model.identifier + ".svg";
        let fileContent = this._workspace.toSVGXML();
        let fileType = "image/svg+xml";
        switch (destination) {
            case "local":
                this._saveLocal(fileName, fileContent, fileType);
                break;
            default:
                break;
        }
    }

    /** shiftItemBackward
        Push selected item's z-ordering backward.
    **/
    shiftItemBackward() {
        // save undo state
        this._workspace.recordUndoState();

        // update the selected item
        this._workspace.model.shiftItemBackward(this._workspace.selectedItem);
    }

    /** shiftItemForward
        Push selected item's z-ordering forward.
    **/
    shiftItemForward() {
        // save undo state
        this._workspace.recordUndoState();

        // update the selected item
        this._workspace.model.shiftItemForward(this._workspace.selectedItem);
    }

    /** toggleGrid
        Toggles the background grid.
        :param button: the button that triggered the event
    **/
    toggleGrid(button) {
        // get document body
        let elem = document.body;
        if (elem !== null) {
            // toggle background grid visibility
            let visibility = (button.innerHTML === "grid-off");
            this._workspace.showGrid(visibility);
            button.innerHTML = (visibility) ? "grid-on" : "grid-off";
        }
    }

    /** toggleTheme
        Toggles the css theme.
        :param button: the button that triggered the event
    **/
    toggleTheme(button) {
        // get document body
        let elem = document.body;
        if (elem !== null) {
            // toggle theme
            elem.classList.toggle("theme-light");
            elem.classList.toggle("theme-dark");

            // set input's text to the current theme
            button.innerHTML = elem.classList.item(0);

            // set theme and save a cookie
            let expiration = (typeof COOKIE_EXPIRATION !== "undefined") ? COOKIE_EXPIRATION : 3650;
            this._theme = elem.classList.item(0);
            this._setCookie("theme", this._theme, expiration);
        }
    }

    /** undo
        Reverts model back to a prior state.
    **/
    undo() {
        // restore last undo state
        this._workspace.restoreUndoState();

        // update model attribute inputs
        this._refreshModelInputs();
    }

    /** updateItem
        Update selected item's details based on input values
        :param inputElem: the input element that triggered the event
    **/
    updateItem(inputElem) {
        // get attributes from input
        let inputType = (inputElem.tagName.toLowerCase() === "input") ? inputElem.type.toLowerCase() : inputElem.tagName.toLowerCase();
        let inputAttribute = inputElem.getAttribute("data-attribute");
        if ((inputAttribute === null) || (inputAttribute.toString().trim().length === 0)) {
            // cancel if no element or attribute is associated with the input
            return;
        }

        // get input value based on input type
        let values = {};
        switch (inputType) {
            case "checkbox":
                values[inputAttribute] = inputElem.checked;
                break;
            case "label":
                values[inputAttribute] = inputElem.innerHTML.trim();
                break;
            case "hidden":
                values[inputAttribute] = inputElem.value.trim();
                break;
            case "number":
                values[inputAttribute] = inputElem.value.trim();
                break;
            case "select":
                values[inputAttribute] = null;
                let opts = [];
                opts = (inputAttribute === "operatingCondition") ? OPERATING_CONDITIONS : opts;
                opts = (inputAttribute === "utilityFunction") ? UTILITY_FUNCTIONS : opts;
                for (let i = 0; i < opts.length; i++) {
                    if (opts[i].func.type === inputElem.value) {
                        values[inputAttribute] = opts[i].func.clone();
                    }
                }
                break;
            case "text":
                values[inputAttribute] = inputElem.value.trim();
                break;
            case "textarea":
                values[inputAttribute] = inputElem.value.trim();
                break;
            default:
                break;
        }

        // get selected item
        let selectedItem = this._workspace.selectedItem;
        if (selectedItem === null) {
            // if selected item cannot be found, refer to hidden reference
            let hdnItemReference = document.getElementById("hdn_item_reference");
            if (hdnItemReference !== null) {
                selectedItem = this._workspace.model.findItem(hdnItemReference.value);
            }
        }

        // save undo state
        this._workspace.recordUndoState();

        // update selected item with new values
        this._workspace.updateItem(selectedItem, values);

        // refresh all inputs to sync with any indirect changes
        this._refreshItemInputs(selectedItem);
    }

    /** updateModel
        Update model details based on input values.
        :param inputElem: the input element that triggered the event
    **/
    updateModel(inputElem) {
        // get attributes from input
        let inputType = (inputElem.tagName.toLowerCase() === "input") ? inputElem.type.toLowerCase() : inputElem.tagName.toLowerCase();
        let inputAttribute = inputElem.getAttribute("data-attribute");
        if ((inputAttribute === null) || (inputAttribute.toString().trim().length === 0)) {
            // cancel if no element or attribute is associated with the input
            return;
        }

        // update value based on input type
        let values = {};
        switch (inputType) {
            case "checkbox":
                values[inputAttribute] = inputElem.checked;
                break;
            case "hidden":
                values[inputAttribute] = inputElem.value.trim();
                break;
            case "text":
                values[inputAttribute] = inputElem.value.trim();
                break;
            case "textarea":
                values[inputAttribute] = inputElem.value.trim();
                break;
            default:
                break;
        }

        // save undo state
        this._workspace.recordUndoState();

        // update model attributes
        this._workspace.model.attributes = values;

        // sync inputs with item
        this._refreshModelInputs();
    }

    /** validateModel
        Validates the contents of the model.
    **/
    validateModel() {
        this._workspace.validate();
    }

    /** zoomCenter
        Center zoom for workspace.
    **/
    zoomCenter() {
        this._workspace.zoomCenter();
    }

    /** zoomIn
        Zoom into workspace.
    **/
    zoomIn() {
        this._workspace.zoomIn();
    }

    /** zoomOut
        Zoom out on workspace.
    **/
    zoomOut() {
        this._workspace.zoomOut();
    }

    /** _getCookie
        Get cookie data.
        :param cname: name of the cookie
        :return: cookie value
    **/
    _getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(";");
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === " ") {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    /** _getPointerPosition
        Gets the pointer position from an event.
        :param evt: mouse or touch event data
        :return: a collection of pointer positions
    **/
    _getPointerPosition(evt) {
        let pos = [];
        if (("clientX" in evt) && ("clientY" in evt)) {
            this._lastMouse = {"x": evt.clientX, "y": evt.clientY};
            pos.push(this._lastMouse);
        }
        else if (("touches" in evt) && (evt.touches.length > 1)) {
            for (let i = 0; i < evt.touches.length; i++) {
                pos.push({"x": evt.touches[i].clientX, "y": evt.touches[i].clientY});
                if (pos.length > 1) {
                    let firstTouch = pos[0];
                    let lastTouch = pos[pos.length - 1];
                    let dx = firstTouch.x - lastTouch.x;
                    let dy = firstTouch.y - lastTouch.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    let distMin = (typeof MIN_TOUCH_DIST !== "undefined") ? MIN_TOUCH_DIST : 100;
                    if (dist <= distMin) {
                        pos.pop();
                    }
                }
            }
        }
        else if (("changedTouches" in evt) && (evt.changedTouches.length > 0)) {
            pos.push({"x": evt.changedTouches[0].clientX, "y": evt.changedTouches[0].clientY});
        }
        else {
            pos.push(this._lastMouse);
        }
        return pos;
    }

    /** _initButton
        Initializes a button element.
        :param id: element id
        :param eventListener: an event listener function for the element
        :return: the initialized element
    **/
    _initButton(id, eventListener=null) {
        let elem = document.getElementById(id);
        if (elem !== null) {
            if (eventListener !== null) {
                elem.addEventListener("click", eventListener);
            }
        }
        return elem;
    }

    /** _initContainer
        Initializes a container element.
        :param id: element id
        :param eventListener: an event listener function for the element
        :return: the initialized element
    **/
    _initContainer(id, eventListener=null) {
        let elem = document.getElementById(id);
        if (elem !== null) {
            if (eventListener !== null) {
                elem.addEventListener("click", eventListener);
            }
        }
        return elem;
    }

    /** _initItemCheckField
        Initializes a checkbox field for item attributes.
        :param id: element id
        :param attribute: an item attribute to associate with the element
        :param eventListener: an event listener function for the element
        :param value: an initial value for the field
        :return: the initialized element
    **/
    _initItemCheckField(id, attribute, eventListener=null, value=false) {
        let elem = document.getElementById(id);
        if (elem !== null) {
            elem.setAttribute("data-scope", "item");
            elem.setAttribute("data-attribute", attribute);
            elem.checked = (value === true);
            if (eventListener !== null) {
                elem.addEventListener("change", eventListener);
            }
        }
        return elem;
    }

    /** _initCreationButton
        Initializes a workspace creation button element.
        :param id: element id
        :param mode: the creation mode associated with the button
        :param eventListener: an event listener function for the element
        :return: the initialized element
    **/
    _initCreationButton(id, mode, eventListener=null) {
        let elem = document.getElementById(id);
        if (elem !== null) {
            elem.setAttribute("data-creation-mode", mode);
            if (eventListener !== null) {
                elem.addEventListener("click", eventListener);
            }
        }
        return elem;
    }

    /** _initItemGroup
        Initializes an input group for item attributes.
        :param id: element id
        :param attribute: an item attribute to associate with the element
        :return: the initialized element
    **/
    _initItemGroup(id, attribute) {
        let elem = document.getElementById(id);
        if (elem !== null) {
            elem.setAttribute("data-scope", "item");
            elem.setAttribute("data-attribute", attribute);
        }
        return elem;
    }

    /** _initItemHiddenField
        Initializes a hidden field for item attributes.
        :param id: element id
        :param attribute: an item attribute to associate with the element
        :param value: an initial value for the field
        :return: the initialized element
    **/
    _initItemHiddenField(id, attribute, value=null) {
        let elem = document.getElementById(id);
        if (elem !== null) {
            elem.setAttribute("data-scope", "item");
            elem.setAttribute("data-attribute", attribute);
            elem.value = (value !== null) ? value : "";
        }
        return elem;
    }

    /** _initItemLabelField
        Initializes a label field for item attributes.
        :param id: element id
        :param attribute: an item attribute to associate with the element
        :param value: an initial value for the field
        :return: the initialized element
    **/
    _initItemLabelField(id, attribute, value=null) {
        let elem = document.getElementById(id);
        if (elem !== null) {
            elem.setAttribute("data-scope", "item");
            elem.setAttribute("data-attribute", attribute);
            elem.innerHTML = (value !== null) ? value : "";
        }
        return elem;
    }

    /** _initItemSelectField
        Initializes a select field for item attributes.
        :param id: element id
        :param attribute: an item attribute to associate with the element
        :param eventListener: an event listener function for the element
        :param opts: a collection of options for the select field
        :return: the initialized element
    **/
    _initItemSelectField(id, attribute, eventListener=null, opts=[]) {
        let elem = document.getElementById(id);
        if (elem !== null) {
            elem.setAttribute("data-scope", "item");
            elem.setAttribute("data-attribute", attribute);
            if (eventListener !== null) {
                elem.addEventListener("change", eventListener);
            }
            let opt = document.createElement("option");
            opt.value = "";
            opt.innerHTML = "None";
            elem.appendChild(opt);
            elem.value = "";
            for (let i = 0; i < opts.length; i++) {
                opt = document.createElement("option");
                opt.value = opts[i].func.type;
                opt.innerHTML = opts[i].func.type;
                elem.appendChild(opt);
            }
        }
        return elem;
    }

    /** _initItemTextField
        Initializes a text field for item attributes.
        :param id: element id
        :param attribute: an item attribute to associate with the element
        :param eventListener: an event listener function for the element
        :param value: an initial value for the field
        :return: the initialized element
    **/
    _initItemTextField(id, attribute, eventListener=null, value=null) {
        let elem = document.getElementById(id);
        if (elem !== null) {
            elem.setAttribute("data-scope", "item");
            elem.setAttribute("data-attribute", attribute);
            elem.value = (value !== null) ? value : "";
            if (eventListener !== null) {
                elem.addEventListener("change", eventListener);
            }
        }
        return elem;
    }

    /** _initFieldset
        Initializes a fieldset element.
        :param id: element id
        :param visible: designates whether or not the fieldset should be visible
        :return: the initialized element
    **/
    _initFieldset(id, visible) {
        let elem = document.getElementById(id);
        if (elem !== null) {
            if (visible) {
                elem.classList.remove("hidden");
            }
            else {
                elem.classList.add("hidden");
            }
        }
        return elem;
    }

    /** _initFieldsetLegend
        Initializes a fieldset legend element.
        :param id: element id
        :return: the initialized element
    **/
    _initFieldsetLegend(id) {
        let elem = document.getElementById(id);
        return elem;
    }

    /** _initFileDialog
        Initializes a file dialog element.
        :param id: element id
        :param eventListener: an event listener function for the element
        :return: the initialized element
    **/
    _initFileDialog(id, eventListener=null) {
        let elem = document.getElementById(id);
        if (elem !== null) {
            if (eventListener !== null) {
                elem.addEventListener("change", eventListener);
            }
        }
        return elem;
    }

    /** _initModelGroup
        Initializes an input group for model attributes.
        :param id: element id
        :param attribute: a model attribute to associate with the element
        :param value: an initial value for the field
        :return: the initialized element
    **/
    _initModelGroup(id, attribute, value=null) {
        let elem = document.getElementById(id);
        if (elem !== null) {
            elem.setAttribute("data-scope", "model");
            elem.setAttribute("data-attribute", attribute);
            elem.value = (value !== null) ? value : "";
        }
        return elem;
    }

    /** _initModelHiddenField
        Initializes a hidden field for model attributes.
        :param id: element id
        :param attribute: a model attribute to associate with the element
        :param value: an initial value for the field
        :return: the initialized element
    **/
    _initModelHiddenField(id, attribute, value=null) {
        let elem = document.getElementById(id);
        if (elem !== null) {
            elem.setAttribute("data-scope", "model");
            elem.setAttribute("data-attribute", attribute);
            elem.value = (value !== null) ? value : "";
        }
        return elem;
    }

    /** _initModelTextField
        Initializes a text field for model attributes.
        :param id: element id
        :param attribute: a model attribute to associate with the element
        :param eventListener: an event listener function for the element
        :param value: an initial value for the field
        :return: the initialized element
    **/
    _initModelTextField(id, attribute, eventListener=null, value=null) {
        let elem = document.getElementById(id);
        if (elem !== null) {
            elem.setAttribute("data-scope", "model");
            elem.setAttribute("data-attribute", attribute);
            elem.value = (value !== null) ? value : "";
            if (eventListener !== null) {
                elem.addEventListener("change", eventListener);
            }
        }
        return elem;
    }

    /** _initSaveButton
        Initializes a save button element.
        :param id: element id
        :param eventListener: an event listener function for the element
        :param destination: the save destination
        :return: the initialized element
    **/
    _initSaveButton(id, eventListener=null, destination=null) {
        let elem = document.getElementById(id);
        if (elem !== null) {
            if (eventListener !== null) {
                elem.addEventListener("click", eventListener);
            }
            if (destination !== null) {
                elem.setAttribute("data-destination", destination);
            }
        }
        return elem;
    }

    /** _refreshItemInputs
        Toggle the visibility and sync the values of inputs to match current item attribute values.
        :param item: the target item to sync to
    **/
    _refreshItemInputs(item) {
        // check if given item exists
        if (item === null) {
            // cancel if item does not exit
            return;
        }

        // update associated inputs with values from item
        let values = item.attributes;
        let inputElems = document.querySelectorAll("*[data-scope=item]");
        for (const inputElem of inputElems) {
            let inputType = (inputElem.tagName.toLowerCase() === "input") ? inputElem.type.toLowerCase() : inputElem.tagName.toLowerCase();
            let inputAttribute = inputElem.getAttribute("data-attribute");
            if ((inputAttribute === null) || (inputAttribute.toString().trim().length === 0)) {
                // pass to next input if no attribute is associated
                continue;
            }
            // update input based on type and attribute
            if (!(inputAttribute in values)) {
                // hide or clear inputs with attributes not included in values
                switch (inputType) {
                    case "checkbox":
                        inputElem.checked = false;
                        break;
                    case "div":
                        inputElem.classList.add("hidden");
                        break;
                    case "hidden":
                        inputElem.value = "";
                        break;
                    case "label":
                        inputElem.innerHTML = "";
                        break;
                    case "number":
                        inputElem.value = "";
                        break;
                    case "select":
                        inputElem.value = "";
                        break;
                    case "text":
                        inputElem.value = "";
                        break;
                    case "textarea":
                        inputElem.value = "";
                        break;
                    default:
                        break;
                }
            }
            else if (inputAttribute in values) {
                // display and set inputs with attributes included in values
                let inputValue = (inputAttribute in values) ? values[inputAttribute] : null;
                switch (inputType) {
                    case "checkbox":
                        inputElem.checked = (inputValue !== null) ? inputValue : false;
                        break;
                    case "div":
                        inputElem.classList.remove("hidden");
                        break;
                    case "hidden":
                        inputElem.value = (inputValue !== null) ? inputValue.toString().trim() : "";
                        break;
                    case "label":
                        inputElem.innerHTML = (inputValue !== null) ? inputValue.toString().trim() : "";
                        break;
                    case "number":
                        inputElem.value = (inputValue !== null) ? inputValue.toString().trim() : "";
                        break;
                    case "select":
                        inputElem.value = (inputValue !== null) ? inputValue.type : "";
                        break;
                    case "text":
                        inputElem.value = (inputValue !== null) ? inputValue.toString().trim() : "";
                        break;
                    case "textarea":
                        inputElem.value = (inputValue !== null) ? inputValue.toString().trim() : "";
                        break;
                    default:
                        break;
                }
            }
        }
    }

    /** _refreshModelInputs
        Toggle the visibility and sync the values of inputs to match current model attribute values.
    **/
    _refreshModelInputs() {
        // sync inputs with model attribute values
        let values = this._workspace.model.attributes;
        let inputElems = document.querySelectorAll("*[data-scope=model]");
        for (const inputElem of inputElems) {
            let inputType = (inputElem.tagName.toLowerCase() === "input") ? inputElem.type.toLowerCase() : inputElem.tagName.toLowerCase();
            let inputAttribute = inputElem.getAttribute("data-attribute");
            if ((inputAttribute === null) || (inputAttribute.toString().trim().length === 0)) {
                // pass to next input if no attribute is associated
                continue;
            }
            
            // update input with attribute value
            let inputValue = (inputAttribute in values) ? values[inputAttribute] : null;
            switch (inputType) {
                case "checkbox":
                    inputElem.checked = (inputValue !== null) ? inputValue : false;
                    break;
                case "hidden":
                    inputElem.value = (inputValue !== null) ? inputValue.toString().trim() : "";
                    break;
                case "text":
                    inputElem.value = (inputValue !== null) ? inputValue.toString().trim() : "";
                    break;
                case "textarea":
                    inputElem.value = (inputValue !== null) ? inputValue.toString().trim() : "";
                    break;
                default:
                    break;
            }

            // update title to include model identifier
            if (inputAttribute === "identifier") {
                document.title = document.title.split(" - ")[0] + " - " + inputValue;
            }
        }
    }

    /** _saveLocal
        Initiates a download of the given content.
        :param fileName: name of the file
        :param fileContent: file content
        :param dataType: file data type
        :param fileCharset: charset for file
    **/
    _saveLocal(fileName, fileContent, fileType="text/plain", fileCharset="utf-8") {
        // create blob
        let blob = new Blob([fileContent], {"type": fileType + ";charset=" + fileCharset});
        let url = URL.createObjectURL(blob);

        // create a hidden link for the data, click it, and then, remove it
        let elem = document.createElement("a");
        elem.setAttribute("href", url);
        elem.setAttribute("download", fileName);
        elem.style.display = "none";
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }

    /** _setCookie
        Sets cookie data.
        :param cname: name of cookie
        :param cvalue: value of cookie
        :param exday: number of days until cookie expires
    **/
    _setCookie(cname, cvalue, exdays) {
        let d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + encodeURIComponent(cvalue) + ";" + expires + ";path=/;SameSite=Strict";
    }
}
