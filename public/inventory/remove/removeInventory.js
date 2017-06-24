var Parse = require('parse/node');

exports.removeInventory = function removeInventory(productTypeObjectID, size) {
    var promise = new Parse.Promise();

    findInventory(productTypeObjectID, size).then(function(inventory) {
        promise.resolve(Parse._encode(inventory));
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

function findInventory(productTypeObjectID, size) {
    var promise = new Parse.Promise();

    let nonExistentLineItemQuery = createNonExistentLineItemsQuery(productTypeObjectID, size);
    let existingLineItemsQuery = createExistingLineItemsQuery(productTypeObjectID, size);

    var orQuery = Parse.Query.or(nonExistentLineItemQuery, existingLineItemsQuery);
    orQuery.include("lineItem");

    orQuery.find().then(function(inventories) {
        return siftInventories(inventories);
    }).then(function(inventory) {
        promise.resolve(inventory);
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

function createNonExistentLineItemsQuery(productTypeObjectID, size) {
    var query = createInventoryQuery(productTypeObjectID, size);
    query.doesNotExist("lineItem");
    return query;
}

function createExistingLineItemsQuery(productTypeObjectID, size) {
    var query = createInventoryQuery(productTypeObjectID, size);

    var LineItem = require("../../models/lineItem.js");
    var lineItemQuery = LineItem.query();
    lineItemQuery.doesNotExist("pick");
    query.matchesQuery("lineItem", lineItemQuery);

    return query;
}

function createInventoryQuery(productTypeObjectID, size) {
    var Item = require("../../models/item.js");
    var query = Item.query();

    var Package = require("../../models/tracking/package.js");
    var packageQuery = Package.query();
    packageQuery.equalTo("state", "in inventory");
    query.matchesQuery("package", packageQuery);
    
    let Save = require("../save/save.js");
    let productVariantQuery = Save.createProductVariantQuery(productTypeObjectID, size);
    query.matchesQuery("productVariant", productVariantQuery);

    return query
}

function siftInventories(items) {
    var promise = new Parse.Promise();

    for(var i = 0; i < items.length; i++) {
        let item = items[i];
        let lineItem = item.get("lineItem");
        if (lineItem == undefined) {
            //we found an inventory without a line item
            item.set("isDeleted", true);
            item.save(null, {
                success: function(item) {
                    promise.resolve(item);
                },
                error: function(error) {
                    promise.reject(error);
                }
            });
            return promise;
        }
    }

    //if we couldn't find any unallocated inventories, then we'll have to do the second best thing
    //which means stealing this inventory from another line item
    if (items.length > 0) {
        let firstInventory = items[0];
        let lineItem = firstInventory.get("lineItem");
        lineItem.unset("item");
        firstInventory.unset("lineItem");
        firstInventory.set("isDeleted", true);
        Parse.Object.saveAll([lineItem, firstInventory], {
            success: function (results) {
                promise.resolve(firstInventory);
            },
            error: function (error) {                                     
                promise.resolve(error);
            },
        });
    } else {
        promise.reject("failed to find any matching inventory");
    }

    return promise;
}