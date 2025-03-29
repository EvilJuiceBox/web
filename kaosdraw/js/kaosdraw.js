/** KAOSDraw
    Created by: Michael Austin Langford
**/

// namespaces
const SVGNS = "http://www.w3.org/2000/svg";
const XMLNS = "http://www.w3.org/2000/xmlns/";
const XLINKNS = "http://www.w3.org/1999/xlink";

// number of days until cookie expires
const COOKIE_EXPIRATION = 3650

// delay for message fade
const FADE_DELAY = 5000;

// activates automatic function parsing
const FUNCTION_PARSING = false;

// create a hidden canvas element for auxiliary purposes.
const HIDDEN_CANVAS = document.createElement("canvas");
const HIDDEN_CANVAS_FONT = "normal 0.85rem Tahoma, Geneva, sans-serif";
const HIDDEN_CANVAS_2D = ("getContext" in HIDDEN_CANVAS) ? HIDDEN_CANVAS.getContext("2d") : null;
if (HIDDEN_CANVAS_2D !== null) {
    HIDDEN_CANVAS_2D.font = HIDDEN_CANVAS_FONT;
}

// maximum line columns and rows for displayed descriptions
const MAX_LINE_COLUMNS = 40;
const MAX_LINE_ROWS = 6;

// default item size
const MIN_ITEM_SIZE = {"w": 90, "h": 60};

// minimum distance for two touches to register as separate
const MIN_TOUCH_DIST = 100;

// movement increment for pan and drag w/ keyboard
const MOVEMENT_INCREMENT = 5;

// adjustment factor for degree of movement from scrolling
const SCROLL_ADJUSTMENT = -3.0;

// activates "sticky" creation mode
const STICKY_CREATION_MODE = false;

// default font size (in pixels)
const TEXT_FONT_SIZE = 16;

// scaling factor for zoom
const ZOOM_FACTOR = 1.2;

// global functions
const IS_BROWSER_CHROME = function() { return (window.navigator.userAgent.indexOf("Chrome") >= 0); };
const IS_BROWSER_EDGE = function() { return (window.navigator.userAgent.indexOf("Edge") >= 0); };
const IS_BROWSER_FIREFOX = function() { return (window.navigator.userAgent.indexOf("Firefox") >= 0); };
const IS_DEVICE_DESKTOP = function() { return window.matchMedia("(min-device-width: 90rem)").matches; };
const IS_DEVICE_LANDSCAPE = function() { return window.matchMedia("(max-device-width: 89rem) and (orientation: landscape)").matches; };
const IS_DEVICE_PORTRAIT = function() { return window.matchMedia("(max-device-width: 89rem) and (orientation: portrait)").matches; };

/** startup
    Creates a singleton of the application.
**/
let _application = null;
function startup() {
    // create application
    _application = new UIApplication();
}

/** onCreationChange
    Handles event for creation mode change in workspace.
**/
function onCreationChange(evt) {
    if ((typeof evt.detail !== "undefined") && (typeof evt.detail.mode !== "undefined")) {
        if (_application !== null) {
            _application.refreshCreationButtons(evt.detail.mode);
        }
    }
}

/** onCreationRequest
    Handles event for any workspace button presses.
**/
function onCreationRequest(evt) {
    if ((typeof evt.target !== "undefined") && (evt.target !== null)) {
        if (_application !== null) {
            _application.clickCreationButton(evt.target);
        }
    }
}

/** onItemBackwardRequest
    Handles event for shifting an item's z-index down.
**/
function onItemBackwardRequest(evt) {
    if (_application !== null) {
        _application.shiftItemBackward();
    }
}

/** onItemDeleteRequest
    Handles event for removing an item.
**/
function onItemDeleteRequest(evt) {
    if (_application !== null) {
        _application.deleteItem();
    }
}

/** onItemDisplayRequest
    Handles event for displaying an item's attributes.
**/
function onItemDisplayRequest(evt) {
    if (_application !== null) {
        _application.displayItem();
    }
}

/** onItemForwardRequest
    Handles event for shifting an item's z-index up.
**/
function onItemForwardRequest(evt) {
    if (_application !== null) {
        _application.shiftItemForward();
    }
}

/** onItemFieldChange
    Handles event for updating an item's attributes.
**/
function onItemFieldChange(evt) {
    if ((typeof evt.target !== "undefined") && (evt.target !== null)) {
        if (_application !== null) {
            _application.updateItem(evt.target);
        }
    }
}

/** onItemHideRequest
    Handles event for hiding an item's attributes.
**/
function onItemHideRequest(evt) {
    if (_application !== null) {
        _application.hideItem();
    }
}

/** onKeyDown
    Handles event for user key presses.
**/
function onKeyDown(evt) {
    if (_application !== null) {
        _application.keyDown(evt);
    }
}

/** onMessageDisplayRequest
    Handles event for displaying a message to the user.
**/
function onMessageDisplayRequest(evt) {
    if ((typeof evt.detail !== "undefined") && (typeof evt.detail.message !== "undefined")) {
        if (_application !== null) {
            _application.displayMessage(evt.detail.message);
        }
    }
}

/** onModelFieldChange
    Handles event for updating a model's attibutes.
**/
function onModelFieldChange(evt) {
    if ((typeof evt.target !== "undefined") && (evt.target !== null)) {
        if (_application !== null) {
            _application.updateModel(evt.target);
        }
    }
}

/** onMessageHideRequest
    Handles event for hiding a message from the user.
**/
function onMessageHideRequest(evt) {
    if (_application !== null) {
        _application.hideMessage();
    }
}

/** onModelValidateRequest
    Handles event for validating a model.
**/
function onModelValidateRequest(evt) {
    if (_application !== null) {
        _application.validateModel();
    }
}

/** onOpenSVGRequest
    Handles event for loading an SVG file.
**/
function onOpenSVGRequest(evt) {
    // check for files
    if ((typeof this.files === "undefined") || (this.files.length === 0)) {
        if (_application !== null) {
            _application.displayMessage("No file selected.");
        }
        return;
    }

    // verify file type
    let file = this.files[0];
    if ((file.type !== "image/svg+xml") && (file.type !== "text/plain") && (file.type !== "text/xml")) {
        if (_application !== null) {
            _application.displayMessage("Unexpected file type.");
        }
    }

    // initialize file reader with event listeners
    let reader = new FileReader();
    reader.addEventListener("load", function(evt) {
        if (_application !== null) {
            // open file contents in application
            _application.openSVGXML(evt.target.result);
        }
    });
    reader.addEventListener("error", function() {
        if (_application !== null) {
            _application.displayMessage("Failed to read file.");
        }
    });

    // read file as text
    reader.readAsText(file);
}

/** onPointerDown
    Handles user pointer press events (mouse and/or touch).
**/
function onPointerDown(evt) {
    if (_application !== null) {
        _application.pointerDown(evt);
    }
}

/** onPointerMove
    Handles user pointer movement (mouse and/or touch).
**/
function onPointerMove(evt) {
    if (_application !== null) {
        _application.pointerMove(evt);
    }
}

/** onPointerScroll
    Handles user pointer scroll (mouse and/or touch).
**/
function onPointerScroll(evt) {
    if (_application !== null) {
        _application.pointerScroll(evt);
    }
}

/** onPointerUp
    Handles user pointer release (mouse and/or touch).
**/
function onPointerUp(evt) {
    if (_application !== null) {
        _application.pointerUp(evt);
    }
}

/** onSaveJPEGRequest
    Handles event for saving a jpeg file.
**/
function onSaveJPEGRequest(evt) {
    if ((typeof evt.target !== "undefined") && (evt.target !== null)) {
        let destination = evt.target.getAttribute("data-destination");
        if (_application !== null) {
            _application.saveJPEG(destination);
        }
    }
}

/** onSaveKAOSRequest
    Handles event for saving a KAOS xml file.
**/
function onSaveKAOSRequest(evt) {
    if ((typeof evt.target !== "undefined") && (evt.target !== null)) {
        let destination = evt.target.getAttribute("data-destination");
        if (_application !== null) {
            _application.saveKAOSXML(destination);
        }
    }
}

/** onSaveLogicRequest
    Handles event for saving a logic xml file.
**/
function onSaveLogicRequest(evt) {
    if ((typeof evt.target !== "undefined") && (evt.target !== null)) {
        let destination = evt.target.getAttribute("data-destination");
        if (_application !== null) {
            _application.saveLogicXML(destination);
        }
    }
}

/** onSaveSVGRequest
    Handles event for saving an SVG file.
**/
function onSaveSVGRequest(evt) {
    if ((typeof evt.target !== "undefined") && (evt.target !== null)) {
        let destination = evt.target.getAttribute("data-destination");
        if (_application !== null) {
            _application.saveSVGXML(destination);
        }
    }
}

/** onGridToggleRequest
    Handles event for toggling the background grid.
**/
function onGridToggleRequest(evt) {
    if ((typeof evt.target !== "undefined") && (evt.target !== null)) {
        if (_application !== null) {
            _application.toggleGrid(evt.target);
        }
    }
}

/** onThemeToggleRequest
    Handles event for toggling the current css theme.
**/
function onThemeToggleRequest(evt) {
    if ((typeof evt.target !== "undefined") && (evt.target !== null)) {
        if (_application !== null) {
            _application.toggleTheme(evt.target);
        }
    }
}

/** onValidationDisplayRequest
    Handles event for displaying validation results.
**/
function onValidationDisplayRequest(evt) {
    if ((typeof evt.detail !== "undefined") && (typeof evt.detail.violations !== "undefined")) {
        if (_application !== null) {
            _application.displayValidation(evt.detail.violations);
        }
    }
}

/** onValidationHideRequest
    Handles event for hiding validation results redo.
**/
function onValidationHideRequest(evt) {
    if (_application !== null) {
        _application.hideValidation();
    }
}

/** onZoomCenterRequest
    Handles event for re-centering the workspace zoom.
**/
function onZoomCenterRequest(evt) {
    if (_application !== null) {
        _application.zoomCenter();
    }
}

/** onZoomInRequest
    Handles event for zooming into the workspace.
**/
function onZoomInRequest(evt) {
    if (_application !== null) {
        _application.zoomIn();
    }
}

/** onZoomOutRequest
    Handles event for zooming out of the workspace.
**/
function onZoomOutRequest(evt) {
    if (_application !== null) {
        _application.zoomOut();
    }
}
