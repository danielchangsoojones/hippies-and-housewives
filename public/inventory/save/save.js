var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

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
        success: function (results) {
            promise.resolve(inventories);
        },
        error: function (error) {                                     
            promise.reject(inventories);
        },
    });

    return promise;
}

exports.findMatchingLineItem = function findMatchingLineItem(inventory) {
    var promise = new Parse.Promise();

    let productVariant = inventory.get("productVariant");
    console.log(productVariant);
    var LineItem = Parse.Object.extend("LineItem");
    var query = new Parse.Query(LineItem);
    query.equalTo("productVariant", productVariant);
    query.doesNotExist("inventory");
    
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