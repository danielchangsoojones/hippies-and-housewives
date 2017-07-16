var Parse = require('parse/node');
var ProductVariant = require("../../../models/productVariant.js");

exports.saveInventory = function saveInventory(productVariantObjectID, quantityToSave) {
    let promise = new Parse.Promise();

    exports.getProductVariant(productVariantObjectID, quantityToSave).then(function (productVariantResult) {
        let productVariant = productVariantResult.productVariant;
        return getGroupItems(quantityToSave, productVariant).then(function (groupItems) {
            console.log("showing group items: ");
            console.log(groupItems);
            let results = setGroupItems(groupItems, quantityToSave);
            let leftoverQuantity = results.leftoverQuantity;
            let groupItemsToSave = results.groupItemsToSave;
            console.log("leftoverQuantity: " + leftoverQuantity);
            return createNewInventories(leftoverQuantity, productVariant).then(function(objectsToSave) {
                return saveAllObjects(groupItemsToSave, objectsToSave);  
            });
        });
    }).then(function(results) {
        console.log("results length: " + results.length);
        promise.resolve(results);
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

/*
a group item is an item that was associated with a group and we used it to initiate a line item
Say, we send a bunch of swimsuits off to a factory, and we need to make sure those line items are initiated,
so they don't get double cut. But, they have no label, so when they are placed into inventory, we need to match them back up
*/
function getGroupItems(itemsToSave, productVariant) {
    var Item = require("../../../models/item.js");
    var query = Item.query();

    query.equalTo("productVariant", productVariant);
    query.exists("group");
    query.doesNotExist("package");
    query.limit(itemsToSave);

    return query.find();
}

function setGroupItems(groupItems, quantityToSave) {
    var leftoverQuantity = quantityToSave;
    var groupItemsToSave = [];
    for (var i = 0; i < groupItems.length; i++) {
        let groupItem = groupItems[i];
        setAsPackaged(groupItem);
        groupItemsToSave.push(groupItem);
        leftoverQuantity--;
    }

    let results = {
        groupItemsToSave: groupItemsToSave,
        leftoverQuantity: leftoverQuantity
    };

    return results;
}

function setAsPackaged(item) {
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
    setAsPackaged(item);

    return item;
}

function allocateInventories(items, productVariant, quantityToSave) {
    console.log("allocating inventories");
    var promise = new Parse.Promise();

    findMatchingLineItems(productVariant, quantityToSave).then(function (lineItems) {
        var objectsToSave = [];
        for (var i = 0; i < lineItems.length; i++) {
            let lineItem = lineItems[i];
            let item = items[i];
            objectsToSave.push(allocate(lineItem, item));
        }
        promise.resolve(objectsToSave);
    });

    return promise;
}

function allocate(lineItem, item) {
    item.set("lineItem", lineItem);
    lineItem.set("item", item);
    return [item, lineItem];
}

function findMatchingLineItems(productVariant, quantityToSave) {
    var LineItem = require("../../../models/lineItem.js");
    var query = LineItem.query();
    query.equalTo("productVariant", productVariant);
    query.doesNotExist("item");
    query.limit(quantityToSave);

    return query.find();
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