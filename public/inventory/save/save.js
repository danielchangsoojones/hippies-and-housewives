var Parse = require('parse/node');

exports.saveInventory = function saveInventory(productTypeObjectID, size, quantity) {
    var promise = new Parse.Promise();

    exports.getProductVariant(productTypeObjectID, size).then(function(productVariant) {
        saveInventories(productVariant, quantity).then(function(inventories) {
            promise.resolve(inventories);
        }, function(error) {
            promise.reject(error);
        });
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

exports.getProductVariant = function getProductVariant(productTypeObjectID, size) {
    var promise = new Parse.Promise();

    let query = exports.createProductVariantQuery(productTypeObjectID, size);
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

exports.createProductVariantQuery = function createProductVariantQuery(productTypeObjectID, size) {
    var ProductVariant = Parse.Object.extend("ProductVariant");
    var query = new Parse.Query(ProductVariant);
    query.equalTo("size", size);

    var ProductType = Parse.Object.extend("ProductType");
    var innerQuery = new Parse.Query(ProductType);
    innerQuery.equalTo("objectId", productTypeObjectID);
    query.matchesQuery("product", innerQuery);

    return query;
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
        findMatchingLineItem(inventory, productVariant, i).then(function(lineItem) {
            //TODO: if you saved like 50 inventories at once, then they might get the same line item and they would jsut have all inventories allocated to the same inventory
            inventory.set("lineItem", lineItem);
            lineItem.set("inventory", inventory);

            Parse.Object.saveAll([inventory, lineItem], {});
        }, function(error) {
            console.log(error);
        });
    }
}

function findMatchingLineItem(inventory, productVariant, itemsToSkip) {
    var promise = new Parse.Promise();

    var LineItem = Parse.Object.extend("LineItem");
    var query = new Parse.Query(LineItem);
    query.equalTo("productVariant", productVariant);
    query.doesNotExist("inventory");
    query.equalTo("state", "open");
    query.notEqualTo("isInitiated", true);
    //if someone saves 15 inventory items at once, you want to skip the ones that would be saved for the ones before it.
    //so we don't save the same LineItem to multiple Inventories
    query.skip(itemsToSkip);
    
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

exports.createUniqueID = function createUniqueID(item) {
    //TODO: theoretically, we could create the same random ten digit number which would be bad because it is not techinically unique. However, this is highly unlikely and the goal is to use qr codes anyway and then we can just use the objectID
    item.set("uniqueID", createRandomID());
}

function createRandomID() {
    let length = 10;
    return Math.floor(Math.pow(10, length-1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length-1) - 1));
}