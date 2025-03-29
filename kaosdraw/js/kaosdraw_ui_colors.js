/** KAOSDraw
    Created by: Michael Austin Langford
**/

// default palette (includes full, medium, and light shades)
const tableau10 = {
    "full":     ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
    "medium":   ["#729ece", "#ff9e4a", "#67bf5c", "#ed665d", "#ad8bc9", "#a8786e", "#ed97ca", "#a2a2a2", "#cdcc5d", "#6dccda"],
    "light":    ["#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5", "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5"],
};

/** UIColors class
    Manages the coloring of displayed elements.
**/
class UIColors {
    /** constructor
        :param obj: an object to color
        :param palette: a color palette (must include full, medium, and light shades)
    **/
    constructor(obj, palette=tableau10) {
        this._palette = palette;
        if (Number.isInteger(obj)) {
            this._idx = obj;
        }
        else {
            // an mapping of objects to color
            let coloredObjects = {
                "KAOSDomainProperty": 0,
                "KAOSGoal": 0,
                "KAOSObstacle": 3,
            };

            // get object type from constructor name and map it to an index in the palette
            let key = (obj !== null) ? obj.constructor.name : null;
            this._idx = (key in coloredObjects) ? coloredObjects[key] : null;

            // Special check to color RELAXed goals green
            if ((obj !== null) && (obj instanceof KAOSGoal)) {
                if ((obj.utilityFunction !== null) && (obj.utilityFunction.type.includes('fuzzy'))) {
                    this._idx = 2;
                }
            }
        }
    }

    /** full (getter)
        :return: the full color shade for the given object
    **/
    get full() {
        if ((this._palette === null) || !("full" in this._palette) || (this._idx === null)) {
            // default to black if no color can be found
            return "#000000";
        }
        return this._palette.full[this._idx % this._palette.full.length];
    }

    /** light (getter)
        :return: the light color shade for the given object
    **/
    get light() {
        if ((this._palette === null) || !("light" in this._palette) || (this._idx === null)) {
            // default to white if no color can be found
            return "#ffffff";
        }
        return this._palette.light[this._idx % this._palette.light.length];
    }

    /** medium (getter)
        :return: the medium color shade for the given object
    **/
    get medium() {
        if ((this._palette === null) || !("medium" in this._palette) || (this._idx === null)) {
            // default to gray if no color can be found
            return "#888888";
        }
        return this._palette.medium[this._idx % this._palette.medium.length];
    }
}
