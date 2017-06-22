var Parse = require('parse/node');


exports.allocateLineItem = function allocateLineItem(productVariant, lineItem) {
    var promise = new Parse.Promise();
    
    var Item = require("../../models/item.js");
    var query = Item.query();
    query.equalTo("productVariant", productVariant);
    query.doesNotExist("lineItem");
    query.notEqualTo("isDeleted", true);

    query.first({
        success: function(item) {
            if (item == undefined) {
                //no matching item found
                promise.resolve(lineItem);
            } else {
                item.set("lineItem", lineItem);
                lineItem.set("item", item);
                promise.resolve([lineItem, item]);
            }
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}