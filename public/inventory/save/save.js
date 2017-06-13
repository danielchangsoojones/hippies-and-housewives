var Parse = require('parse/node');

exports.saveInventory = function saveInventory(productTypeObjectID, size, quantity) {
    var promise = new Parse.Promise();

    getProductVariant(productTypeObjectID, size).then(function(productVariant) {
        saveInventories(productVariant, quantity).then(function(inventories) {
            promise.resolve(inventories)
        }, function(error) {
            promise.reject(error);
        });
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

function getProductVariant(productTypeObjectID, size) {
    var promise = new Parse.Promise();

    var ProductVariant = Parse.Object.extend("ProductVariant");
    var query = new Parse.Query(ProductVariant);
    query.equalTo("size", size);

    var ProductType = Parse.Object.extend("ProductType");
    var innerQuery = new Parse.Query(ProductType);
    innerQuery.equalTo("objectId", productTypeObjectID);
    query.matchesQuery("product", innerQuery);

    query.first({
        success: function(productVariant) {
            promise.resolve(productVariant);
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}

function saveInventories(productVariant, quantity) {
    var promise = new Parse.Promise();
    var inventories = [];

    for (var i = 0; i < quantity; i++) {
        let Inventory = require('../../models/inventory.js');
        let inventory = new Inventory();
        inventory.set("productVariant", productVariant);
        inventories.push(inventory);
    }

    Parse.Object.saveAll(inventories, {
        success: function (inventories) {
            promise.resolve(inventories);
            allocateInventories(inventories, productVariant);
        },
        error: function (error) {                                     
            promise.reject(inventories);
        },
    });

    return promise;
}

function allocateInventories(inventories, productVariant) {
    console.log("allocating the inventory");
    for (var i = 0; i < inventories.length; i++) {
        let inventory = inventories[i];
        findMatchingLineItem(inventory, productVariant).then(function(lineItem) {
            //TODO: if you saved like 50 inventories at once, then they might get the same line item and they would jsut have all inventories allocated to the same inventory
            inventory.set("lineItem", lineItem);
            lineItem.set("inventory", inventory);

            Parse.Object.saveAll([inventory, lineItem], {});
        }, function(error) {
            console.log(error);
        });
    }
}

function findMatchingLineItem(inventory, productVariant) {
    var promise = new Parse.Promise();

    var LineItem = Parse.Object.extend("LineItem");
    var query = new Parse.Query(LineItem);
    query.equalTo("productVariant", productVariant);
    query.doesNotExist("inventory");
    query.notEqualTo("isInitiated", true);
    
    query.first({
        success: function(lineItem) {
            promise.resolve(lineItem);
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}