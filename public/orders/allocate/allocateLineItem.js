var Parse = require('parse/node');

exports.allocateLineItem = function allocateLineItem(productVariant, lineItem) {
    var promise = new Parse.Promise();
    
    var Inventory = Parse.Object.extend("Inventory");
    var query = new Parse.Query(Inventory);
    query.equalTo("productVariant", productVariant);
    query.doesNotExist("lineItem");
    query.notEqualTo("isDeleted", true);

    query.first({
        success: function(inventory) {
            if (inventory == undefined) {
                //no matching inventory found, just returning the initial lineItem
                promise.resolve(lineItem);
            } else {
                //found matching inventory, so allocate both ways
                inventory.set("lineItem", lineItem);
                lineItem.set("inventory", inventory);
                promise.resolve([lineItem, inventory]);
            }
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}