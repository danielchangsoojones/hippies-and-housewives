var Parse = require('parse/node');

exports.removeInventory = function removeInventory(productTypeObjectID, size) {
    var promise = new Parse.Promise();

    findInventory(productTypeObjectID, size).then(function(inventory) {
        promise.resolve(inventory);
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

function findInventory(productTypeObjectID, size) {
    var promise = new Parse.Promise();

    let nonExistentLineItemQuery = createNonExistentLineItemsQuery(productTypeObjectID, size);
    let existingLineItemsQuery = createExistingLineItemsQuery(productTypeObjectID, size);

    var orQuery = Parse.Query.or([nonExistentLineItemQuery, existingLineItemsQuery]);
    orQuery.include("productVariant.product.title");
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
    query.equalTo("state", "open");
    query.notEqualTo("isDeleted", true);
    query.notEqualTo("isPicked", true);
    return query;
}

function createInventoryQuery(productTypeObjectID, size) {
    var Inventory = Parse.Object.extend("Inventory");
    var query = new Parse.Query(Inventory);

    let Save = require("../save/save.js");
    let productVariantQuery = Save.createProductVariantQuery(productTypeObjectID, size);
    query.matchesQuery("productVariant", productVariantQuery);

    return query
}

function siftInventories(inventories) {
    var promise = new Parse.Promise();

    for(var i = 0; i < inventories.length; i++) {
        let inventory = inventories[i];
        let lineItem = inventory.get("lineItem");
        if (lineItem == undefined) {
            //we found an inventory without a line item
            promise.resolve(inventory);
        }
    }

    //if we couldn't find any unallocated inventories, then we'll have to do the second best thing
    //which means stealing this inventory from another line item
    if (inventories.length > 0) {
        let firstInventory = inventories[0];
        let lineItem = firstInventory.get("lineItem");
        lineItem.unset("inventory");
        inventory.unset("lineItem");
        inventory.set("isDeleted", true);
        Parse.Object.saveAll([lineItem, inventory], {
            success: function (results) {
                promise.resolve(inventory);
            },
            error: function (error) {                                     
                promise.resolve(error);
            },
        });
    }

    return promise;
}