var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

exports.saveInventory = function saveInventory(productType, size, quantity) {
    var promise = new Parse.Promise();

    getProductVariant(productType, size).then(function(productVariant) {
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

function getProductVariant(productType, size) {
    var promise = new Parse.Promise();

    var ProductVariant = Parse.Object.extend("ProductVariant");
    var query = new Parse.Query(ProductVariant);
    query.equalTo("product", productType);
    query.equalTo("size", size);

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