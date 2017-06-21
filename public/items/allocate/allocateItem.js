var Parse = require('parse/node');

exports.allocateItem = function allocateItem(item, lineItemsToSkip) {
    var promise = new Parse.Promise();

    let productVariant = item.get("productVariant");
    findLineItem(productVariant, lineItemsToSkip).then(function(lineItem) {
        if (lineItem == undefined) {
            //no allocation found
            promise.resolve(item);
        } else {
            //found a line item to allocate to
            lineItem.set("item", item);
            item.set("lineItem", lineItem);
            promise.resolve([lineItem, item]);
        }
    }, function(error) {
        promise.reject(error);
    })

    return promise;
}

function findLineItem(productVariant, lineItemsToSkip) {
    var LineItem = Parse.Object.extend("LineItem");
    var query = new Parse.Query(LineItem);
    query.doesNotExist("item");
    query.equalTo("productVariant", productVariant);
    query.skip(lineItemsToSkip);

    return query.first();
}