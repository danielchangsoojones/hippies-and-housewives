var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

exports.searchProductType = function searchProductType(searchText) {
    var promise = new Parse.Promise();

    var ProductType = Parse.Object.extend("ProductType");
    var query = new Parse.Query(ProductType);
    query.startsWith("lowercaseTitle", searchText.toLowerCase());

    query.find({
        success: function(products) {
            promise.resolve(products);
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}

exports.searchProducts = function searchProducts(searchText, size) {
    var promise = new Parse.Promise();

    if (typeof searchText === 'string' || searchText instanceof String) {
        //searchText is a sting
        var ProductVariant = Parse.Object.extend("ProductVariant");
        var query = new Parse.Query(ProductVariant);
        //TODO:probably need to have some sort of safe way to deal with Size error;
        query.equalTo("size", size);

        var ProductType = Parse.Object.extend("ProductType");
        var innerQuery = new Parse.Query(ProductType);
        innerQuery.startsWith("lowercaseTitle", searchText.toLowerCase());
        query.matchesQuery("product", innerQuery);

        //TODO: to optimize searching, I could just select certain fields and then when the user chooses an item, then we go fetch that product.
        query.include("product");

        query.find({
            success: function(products) {
                promise.resolve(products);
            },
            error: function(error) {
                promise.reject(error);
            }
        });
    } else {
        promise.reject("search text was not a string or undefined");
    }

    return promise;
}