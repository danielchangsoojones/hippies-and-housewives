var Parse = require('parse/node');

exports.findOriginalProductVariants = function findOriginalProductVariants(productType) {
    var promise = new Parse.Promise();

    const ProductVariant = require('../../models/productVariant.js');
    let query = ProductVariant.query();
    query.equalTo("product", productType);
    query.find({
        success: function(productVariants) {
            let productVariantDictionary = createProductVariantDictionary(productVariants);
            promise.resolve(productVariantDictionary);
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}

/**
 * create a dictionary that matches the format of:
 * size : productVariant
 */
function createProductVariantDictionary(productVariants) {
    var productVariantDictionary = {};
    for (var i = 0; i < productVariants.length; i++) {
        let productVariant = productVariants[i];
        let size = productVariant.get("size");
        productVariantDictionary[size] = productVariant;
    }
    return productVariantDictionary;
}