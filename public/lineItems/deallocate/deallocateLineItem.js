var Parse = require('parse/node');
let LineItem = require("../../models/lineItem.js");
let success = true;

/**
 * 
 * If a line item is cancelled, refunded, or archived without the lineItem having a shipped property
 * theb, this means that the line item's current item (if it even exists) was never used, and therefore,
 * it should be reallocated to a new line item that can use it.
 */
exports.deallocateNonUsedItem = function deallocateNonUsedItem(lineItem) {
    var promise = new Parse.Promise();

    let query = LineItem.query();
    query.equalTo("objectId", lineItem.id);
    query.exists("state");
    query.include("item");
    query.include("item.productVariant");
    query.include("ship");

    query.first().then(function(lineItem) {
        if (lineItem == undefined) {
            promise.resolve();
        } else {
            checkForDeallocation(lineItem).then(function(lineItem) {
                promise.resolve(success);
            }, function(error) {
                promise.reject(error);
            });
        }
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

function checkForDeallocation(lineItem) {
    var promise = new Parse.Promise();
    
    let ship = lineItem.get("ship");
    let state = lineItem.get("state");

    if (state != LineItem.states().open && ship == undefined) {
        //the item was either archived, refunded or cancelled without being shipped via our shipping interface
        var item = lineItem.get("item");
        if (item != undefined) {
            item.unset("lineItem");
            lineItem.unset("item");
        }
        let Allocate = require("../../items/allocate/allocateItem.js");
        return Allocate.allocateItem(item, 0).then(function(objects) {
            let SaveAll = require("../../orders/js/orders.js");
            return SaveAll.saveAllComponents([objects, lineItem]);
        });
    } else {
        promise.resolve();
    }

    return promise;
}