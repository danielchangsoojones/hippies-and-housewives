var Parse = require('parse/node');
var ProductVariant = require("../../../models/productVariant.js");

exports.saveInventory = function saveInventory(productVariantObjectID, quantityToSave) {
    let promise = new Parse.Promise();

    exports.getProductVariant(productVariantObjectID, quantityToSave).then(function (productVariantResult) {
        let productVariant = productVariantResult.productVariant;
        const MatchGroupItems = require('./groupItems/matchGroupItems.js');
        return MatchGroupItems.matchGroupItems(quantityToSave, productVariant).then(function(results) {
            let leftoverQuantity = results.leftoverQuantity;
            let groupItemsToSave = results.groupItemsToSave;
            console.log("leftoverQuantity: " + leftoverQuantity);
            return createNewInventories(leftoverQuantity, productVariant).then(function(objectsToSave) {
                return saveAllObjects(groupItemsToSave, objectsToSave);  
            });
        });
    }).then(function(results) {
        console.log("results length: " + results);
        promise.resolve(results);
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

exports.setAsPackaged = function setAsPackaged(item) {
    let SetPackage = require("../../../package/save/savePackage.js");
    let Package = require("../../../models/tracking/package.js");
    SetPackage.setItemAsPackaged(item, Package.states().in_inventory);
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

function createNewInventories(leftoverQuantity, productVariant) {
    var newItems = [];
    for (var i = 0; i < leftoverQuantity; i++) {
        let newItem = createNewInventory(productVariant);
        newItems.push(newItem);
    }

    return allocateInventories(newItems, productVariant, leftoverQuantity);
}


function createNewInventory(productVariant, lineItemsToSkip) {
    var Item = require('../../../models/item.js');
    var item = new Item();
    item.set("productVariant", productVariant);
    exports.setAsPackaged(item);

    return item;
}

function allocateInventories(items, productVariant, quantityToSave) {
    console.log("allocating inventories");
    var promise = new Parse.Promise();

    const MatchingLineItem = require('./matchingLineItems/matchingLineItem.js');
    MatchingLineItem.findMatchingLineItems(productVariant, quantityToSave).then(function (lineItems) {
        var objectsToSave = [];
        for (var i = 0; i < items.length; i++) {
            let lineItem = lineItems[i];
            let item = items[i];
            if (lineItem != undefined) {
                //we found a matching line item
                objectsToSave.push(allocate(lineItem, item));
            } else {
                //there were no more line items to attach to items. This means that we have unallocated inventory, so just save it without a line item.
                objectsToSave.push(item);
            }
        }
        promise.resolve(objectsToSave);
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

function allocate(lineItem, item) {
    item.set("lineItem", lineItem);
    lineItem.set("item", item);
    return [item, lineItem];
}

function saveAllObjects(groupItemsToSave, objectsToSave) {
    const SaveAll = require('../../../orders/js/orders.js');
    let flattenedArray = flatten([groupItemsToSave, objectsToSave]);
    return SaveAll.saveAllComponents(flattenedArray);
}

function flatten(arr, result = []) {
    for (let i = 0, length = arr.length; i < length; i++) {
        const value = arr[i];
        if (Array.isArray(value)) {
            flatten(value, result);
        } else {
            result.push(value);
        }
    }
    return result;
};