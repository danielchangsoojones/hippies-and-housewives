var Parse = require('parse/node');

exports.checkProductDuplicates = function checkProductDuplicates(productType) {
    var promise = new Parse.Promise();

    const ProductType = require('../../models/productType.js');
    let query = ProductType.query();
    query.equalTo("shopifyID", productType.get("shopifyID"));
    query.count({
        success: function(count) {
            if (count > 1) {
                promise.reject("the product is a duplicate that is not unique");
            } else {
                promise.resolve();
            }
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}