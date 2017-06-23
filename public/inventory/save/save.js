var Parse = require('parse/node');

exports.saveInventory = function saveInventory(productTypeObjectID, size, quantity) {
    var promises = [];

    for (var i = 0; i < quantity; i++) {
        let promise = new Parse.Promise();
        promises.push(promise);
        checkIfGroupItem(i).then(function (result) {
            let groupItem = result.item;
            if (groupItem == undefined) {
                //no groupItem found
                let lineItemsToSkip = quantity - result.i - 1;
                createNewInventory(productTypeObjectID, size, lineItemsToSkip).then(function(item) {
                    promise.resolve(item);
                }, function(error) {
                    promise.reject(error);
                });
            } else {
                setAsPackaged(groupItem);
                groupItem.save(null, {
                    success: function (groupItem) {
                        promise.resolve(groupItem);
                    },
                    error: function (error) {
                        promise.reject(error);
                    }
                });
            }
        }, function (error) {
            promise.reject(error);
        });
    }

    return Parse.Promise.when(promises);
}

/*
a group item is an item that was associated with a group and we used it to initiate a line item
Say, we send a bunch of swimsuits off to a factory, and we need to make sure those line items are initiated,
so they don't get double cut. But, they have no label, so when they are placed into inventory, we need to match them back up
*/
function checkIfGroupItem(itemsToSkip) {
    var Item = require("../../models/item.js");
    var query = Item.query();
    query.exists("group");
    query.doesNotExist("package");
    query.skip(itemsToSkip);

    var promise = new Parse.Promise();

    query.first(function(item) {
        let result = {item: item, i: itemsToSkip}
        promise.resolve(result);
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

function setAsPackaged(item) {
    //package states: in inventory, waiting for identified pick
    let Package = require("../../models/tracking/package.js");
    var package = new Package();
    package.set("state", "in inventory");
    item.set("package", package);
}

function createNewInventory(productTypeObjectID, size, lineItemsToSkip) {
    return exports.getProductVariant(productTypeObjectID, size).then(function (productVariant) {
        return saveInventory(productVariant, lineItemsToSkip);
    });
}

exports.getProductVariant = function getProductVariant(productTypeObjectID, size) {
    var promise = new Parse.Promise();

    let query = exports.createProductVariantQuery(productTypeObjectID, size);
    query.first({
        success: function (productVariant) {
            promise.resolve(productVariant);
        },
        error: function (error) {
            promise.reject(error);
        }
    });

    return promise;
}

exports.createProductVariantQuery = function createProductVariantQuery(productTypeObjectID, size) {
    var ProductVariant = require("../../models/productVariant.js");
    var query = ProductVariant.query();
    query.equalTo("size", size);

    var ProductType = require("../../models/productType.js");
    var innerQuery = ProductType.query();
    innerQuery.equalTo("objectId", productTypeObjectID);
    query.matchesQuery("product", innerQuery);

    return query;
}

function saveInventory(productVariant, lineItemsToSkip) {
    let Item = require('../../models/item.js');
    let item = new Item();
    item.set("productVariant", productVariant);
    setAsPackaged(item);
    return allocateInventory(item, productVariant, lineItemsToSkip);
}

function allocateInventory(item, productVariant, lineItemsToSkip) {
    var promise = new Parse.Promise();
    findMatchingLineItem(item, productVariant, lineItemsToSkip).then(function (lineItem) {
        if (lineItem == undefined) {
            //couldn't allocate
            return item.save();
        } else {
            //allocated
            item.set("lineItem", lineItem);
            lineItem.set("item", item);
            return Parse.Object.saveAll([item, lineItem]);
        }
    }).then(function(objects) {
        promise.resolve(item);
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

function findMatchingLineItem(inventory, productVariant, lineItemsToSkip) {
    var LineItem = require("../../models/lineItem.js");
    var query = LineItem.query();
    query.equalTo("productVariant", productVariant);
    query.doesNotExist("item");
    query.notEqualTo("isInitiated", true);
    //if someone saves 15 inventory items at once, you want to skip the ones that would be saved for the ones before it.
    //so we don't save the same LineItem to multiple Inventories
    query.skip(lineItemsToSkip);

    return query.first();
}