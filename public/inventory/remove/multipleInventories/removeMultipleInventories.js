var Parse = require('parse/node');

exports.removeInventory = function removeInventory(productVariantObjectID, quantity) {
    var promise = new Parse.Promise();

    findInventory(productVariantObjectID, quantity).then(function(results) {
        promise.resolve(results);
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

function findInventory(productVariantObjectID, quantity) {
    var promise = new Parse.Promise();

    let nonExistentLineItemQuery = createNonExistentLineItemsQuery(productVariantObjectID);
    let existingLineItemsQuery = createExistingLineItemsQuery(productVariantObjectID);

    var orQuery = Parse.Query.or(nonExistentLineItemQuery, existingLineItemsQuery);
    orQuery.include("lineItem");

    orQuery.find().then(function(inventories) {
        return siftInventories(inventories, quantity);
    }).then(function(inventory) {
        promise.resolve(inventory);
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

function createNonExistentLineItemsQuery(productVariantObjectID) {
    var query = createInventoryQuery(productVariantObjectID);
    query.doesNotExist("lineItem");
    return query;
}

function createExistingLineItemsQuery(productVariantObjectID) {
    var query = createInventoryQuery(productVariantObjectID);

    var LineItem = require("../../../models/lineItem.js");
    var lineItemQuery = LineItem.query();
    lineItemQuery.doesNotExist("pick");
    query.matchesQuery("lineItem", lineItemQuery);

    return query;
}

function createInventoryQuery(productVariantObjectID) {
    var Item = require("../../../models/item.js");
    var query = Item.query();

    var Package = require("../../../models/tracking/package.js");
    var packageQuery = Package.query();
    packageQuery.equalTo("state", "in inventory");
    query.matchesQuery("package", packageQuery);
    
    let ProductVariant = require("../../../models/productVariant.js");
    let productVariantQuery = ProductVariant.query();
    productVariantQuery.equalTo("objectId", productVariantObjectID);
    query.matchesQuery("productVariant", productVariantQuery);

    return query
}

function siftInventories(items, quantityToRemove) {
    var itemsToDelete = [];

    let quantityLeftToRemove = deleteNonAllocatedInventories(items, quantityToRemove, itemsToDelete);

    //if we couldn't find any unallocated inventories, then we'll have to do the second best thing
    //which means stealing this inventory from another line item
    let tuple = checkAllocatedInventories(items, quantityLeftToRemove, itemsToDelete);
    let lineItemsToCheckWithPickables = tuple.lineItemsToCheckWithPickables;

    var promises = [];
    promises.push(removePickables(lineItemsToCheckWithPickables));
    promises.push(deleteAll(tuple.itemsToDelete));

    return Parse.Promise.when(promises);
}

function deleteNonAllocatedInventories(items, quantityToRemove, itemsToDelete) {
    for(var i = 0; i < items.length; i++) {
        if (quantityToRemove > 0) {
            let item = items[i];
            let lineItem = item.get("lineItem");
            if (lineItem == undefined) {
                //we found an inventory without a line item
                itemsToDelete.push(item);
                items.splice(i, 1);
                i--;
                quantityToRemove--;
            }
        } else {
            return 0;
        }
    }

    return quantityToRemove;
}

function checkAllocatedInventories(items, quantityToRemove, itemsToDelete) {
    var lineItemsToCheckWithPickables = [];
    if (items.length > 0 && quantityToRemove > 0) {
        for (var q = 0; q < quantityToRemove; q++) {
            if (items[q] != undefined) {
                let lineItem = items[q].get("lineItem");
                if (lineItem != undefined) {
                    lineItem.unset("item");
                    items[q].unset("lineItem");
                    itemsToDelete.push(items[q]);
                    lineItemsToCheckWithPickables.push(lineItem);
                    quantityToRemove--;
                }
            } else {
                /**if the item is undefined that means that quantity to remove is more than items in the database
                 * we currently don't throw an error for this because we just delete the items until we can't delete anymore
                */
                console.log("tried to delete more items than are even in inventory");
                break;
            }
        }
    }

    let results = {
        lineItemsToCheckWithPickables: lineItemsToCheckWithPickables,
        itemsToDelete: itemsToDelete
    };
    return results;
}

function deleteAll(items) {
    //deleting does not actually destroy the item, it just sets a delete flag upon the item.
    for (var i = 0; i < items.length; i++) {
        items[i].set("isDeleted", true);
    }
    return Parse.Object.saveAll(items);
}

function removePickables(lineItems) {
    var promise = new Parse.Promise();

    if (lineItems.length > 0) {
        let Pickable = require("../../../models/pickable.js");
        let query = Pickable.query();
        query.containedIn("lineItems", lineItems);
        query.find().then(function (pickables) {
            return Parse.Object.destroyAll(pickables);
        }).then(function (pickables) {
            let success = true;
            promise.resolve(success);
        }, function (error) {
            promise.reject(error);
        });
    } else {
        promise.resolve(true);
    }

    return promise;
}