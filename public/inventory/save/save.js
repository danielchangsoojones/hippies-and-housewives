var Parse = require('parse/node');

exports.saveInventory = function saveInventory(productTypeObjectID, size, quantity) {
    return exports.getProductVariant(productTypeObjectID, size).then(function (productVariant) {
        const SaveMultipleInventory = require('./multipleInventory/saveMultipleInventory.js');
        return SaveMultipleInventory.saveInventory(productVariant.id, quantity);
    });
}

exports.getProductVariant = function getProductVariant(productTypeObjectID, size) {
    var promise = new Parse.Promise();

    let query = createProductVariantQuery(productTypeObjectID, size);
    query.first({
        success: function (productVariant) {
            if (productVariant == undefined) {
                promise.reject("could not find product variant");
            } else {
                promise.resolve(productVariant);
            }
        },
        error: function (error) {
            promise.reject(error);
        }
    });

    return promise;
}

function createProductVariantQuery(productTypeObjectID, size) {
    var ProductVariant = require("../../models/productVariant.js");
    var query = ProductVariant.query();
    query.equalTo("size", size);

    var ProductType = require("../../models/productType.js");
    var innerQuery = ProductType.query();
    innerQuery.equalTo("objectId", productTypeObjectID);
    query.matchesQuery("product", innerQuery);

    return query;
}