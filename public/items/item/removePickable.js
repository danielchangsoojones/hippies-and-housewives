exports.checkPickables = function checkPickables(lineItem) {
    let state = lineItem.get("state");
    console.log("in the check Pickables function");
    console.log(state);

    let LineItem = require("../../models/lineItem.js");
    if (state != LineItem.states().open) {
        // let Remove = require("../../inventory/remove/multipleInventories/removeMultipleInventories.js");
        // Remove.removePickable(lineItem);
        removePickable(lineItem);
    }
}

function removePickable(lineItem) {
    var promise = new Parse.Promise();

    if (lineItems.length > 0) {
        let Pickable = require("../../models/pickable.js");
        let query = Pickable.query();
        query.equalTo("lineItems", lineItem);
        query.find().then(function (pickables) {
            return Parse.Object.destroyAll(pickables);
        }).then(function (pickables) {
            console.log("successful deletion");
            console.log(pickables);
            let success = true;
            promise.resolve(success);
        }, function (error) {
            console.log(error);
            promise.reject(error);
        });
    } else {
        console.log("not deleted because no items length");
        promise.resolve(true);
    }

    return promise;
}