var Parse = require('parse/node');

exports.searchProduct = function searchProduct(searchText) {
    var promise = new Parse.Promise();

    var ProductType = require("../../models/productType.js");
    var query = ProductType.query();
    query.startsWith("lowercaseTitle", searchText.toLowerCase());
    query.ascending("createdAt");

    //For some reason, if I put this query in another file and then make a promise for it, the return array to my iOS is not Parse encoded, so I can't cast it. But, if I do the query in this function, then it works fine.
    query.find({
        success: function (products) {
            promise.resolve(Parse._encode(products));
        },
        error: function (error) {
            promise.reject(error);
        }
    });

    return promise;
}