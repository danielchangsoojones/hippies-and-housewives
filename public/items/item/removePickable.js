exports.checkPickables = function checkPickables(lineItem) {
    let state = lineItem.get("state");

    let LineItem = require("../../models/lineItem.js");
    if (state != LineItem.states().open) {
        //For some reason, just passing the line item causes the subsquent query to not work. We need to pass a copy of the line item to make it work.
        let LineItem = require("../../models/lineItem.js");
        let copyLineItem = new LineItem();
        copyLineItem.id = lineItem.id;

        let Remove = require("../../inventory/remove/multipleInventories/removeMultipleInventories.js");
        Remove.removePickables([copyLineItem]);
    }
}