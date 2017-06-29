var Parse = require('parse/node');
var ProductVariant = require("../../../models/productVariant.js");

exports.saveInventory = function saveInventory(productVariantObjectID, quantityToSave) {
    var promises = [];

    for (var i = 0; i < quantityToSave; i++) {
        let promise = new Parse.Promise();
        promises.push(promise);

        exports.getProductVariant(productVariantObjectID, i).then(function (productVariantResult) {
            let productVariant = productVariantResult.productVariant;
            checkIfGroupItem(productVariantResult.i, productVariant).then(function (result) {
                let groupItem = result.item;
                if (groupItem == undefined) {
                    //no groupItem found
                    let lineItemsToSkip = quantityToSave - result.i - 1;
                    createNewInventory(productVariant, lineItemsToSkip).then(function (item) {
                        promise.resolve(item);
                    }, function (error) {
                        promise.reject(error);
                    });
                } else {
                    setAsPackaged(groupItem).then(function(groupItem) {
                        promise.resolve(groupItem);
                    }, function(error) {
                        promise.reject(error);
                    });
                }
            }, function (error) {
                promise.reject(error);
            });
        });
    }

    return Parse.Promise.when(promises);
}

/*
a group item is an item that was associated with a group and we used it to initiate a line item
Say, we send a bunch of swimsuits off to a factory, and we need to make sure those line items are initiated,
so they don't get double cut. But, they have no label, so when they are placed into inventory, we need to match them back up
*/
function checkIfGroupItem(itemsToSkip, productVariant) {
    var Item = require("../../../models/item.js");
    var query = Item.query();

    query.equalTo("productVariant", productVariant);
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
    let SetPackage = require("../../../package/save/savePackage.js");
    let Package = require("../../../models/tracking/package.js");
    return SetPackage.setPackage(Package.states().in_inventory, item);
}

exports.getProductVariant = function getProductVariant(productVariantObjectID, i) {
    var promise = new Parse.Promise();

    let query = exports.createProductVariantQuery(productVariantObjectID);
    query.first({
        success: function (productVariant) {
            if (productVariant == undefined) {
                promise.reject("could not find product variant");
            } else {
                let result = { productVariant: productVariant, i: i};
                promise.resolve(result);
            }
        },
        error: function (error) {
            promise.reject(error);
        }
    });

    return promise;
}

exports.createProductVariantQuery = function createProductVariantQuery(productVariantObjectID) {
    var query = ProductVariant.query();
    query.equalTo("objectId", productVariantObjectID);

    return query;
}

function createNewInventory(productVariant, lineItemsToSkip) {
    var Item = require('../../../models/item.js');
    var item = new Item();
    item.set("productVariant", productVariant);
    return allocateInventory(item, productVariant, lineItemsToSkip).then(function(objects) {
        return setAsPackaged(item);
    });
}

function allocateInventory(item, productVariant, lineItemsToSkip) {
    console.log("allocating inventories");
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
    var LineItem = require("../../../models/lineItem.js");
    var query = LineItem.query();
    query.equalTo("productVariant", productVariant);
    query.doesNotExist("item");
    query.notEqualTo("isInitiated", true);
    //if someone saves 15 inventory items at once, you want to skip the ones that would be saved for the ones before it.
    //so we don't save the same LineItem to multiple Inventories
    query.skip(lineItemsToSkip);

    return query.first();
}