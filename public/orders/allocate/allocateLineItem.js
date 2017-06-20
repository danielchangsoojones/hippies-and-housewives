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
            var setItem = item;
            if (item == undefined) {
                //no matching item found, so create a new one
                let Item = require("../../models/item.js");
                let newItem = new Item();
                var Unique = require("../../inventory/save/save.js");
                newItem.set("uniqueID", Unique.createUniqueID());
                setItem = newItem
            }
            lineItem.set("item", setItem);
            setItem.set("lineItem", lineItem);
            promise.resolve([lineItem, item]);
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}