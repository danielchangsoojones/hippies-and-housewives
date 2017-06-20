var Parse = require('parse/node');

exports.allocateLineItem = function allocateLineItem(productVariant, lineItem) {
    var promise = new Parse.Promise();
    
    var Item = Parse.Object.extend("Item");
    var query = new Parse.Query(Item);
    query.equalTo("productVariant", productVariant);
    query.doesNotExist("lineItem");
    query.notEqualTo("isDeleted", true);

    query.first({
        success: function(item) {
            if (item == undefined) {
                //no matching item found, just returning the initial lineItem
                promise.resolve(lineItem);
            } else {
                //found matching item, so allocate both ways
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