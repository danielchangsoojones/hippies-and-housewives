var Parse = require("parse/node");

/**
 * Find any products in the database where we have 2 or more. 
 * This doesn't just mean a duplicate product, Vee has made products where there are multiple different pictures
 * and they even have different Shopify ID's
 */
exports.getMultipleProductTypes = function getAllProductTypes() {
    var promise = new Parse.Promise();
    const ProductType = require('../../../models/productType.js');
    let query = ProductType.query();
    query.limit(10000);
    query.ascending("createdAt");
    query.find({
        success: function(productTypes) {
            let productTitleDictionary = createProductTitleDictionary(productTypes);
            promise.resolve(productTitleDictionary);
        },
        error: function(error) {
            promise.reject(error);
        }
    })

    return promise;
}

/**
 * The original productType would be the one that has the earliest creation date. The dictionary format will look as follows:
 * Title : (Earliest Product Pointer)
 */
function createProductTitleDictionary(productTypes) {
    var alreadySavedProductTitleArray = [];
    var alreadySavedProductTypes = [];
    var productTitleDictionary = {};
    for (var i = 0; i < productTypes.length; i++) {
        let productType = productTypes[i];
        let productTitle = productType.get("title");
        let alreadySavedIndex = alreadySavedProductTitleArray.indexOf(productTitle);
        if(alreadySavedIndex == -1) {
            //doesn't exist yet because, so far, it is unique
            alreadySavedProductTitleArray.push(productTitle);
            alreadySavedProductTypes.push(productType);
        } else {
            //the product title has been added to the array already because it is a multiple product
            //since we queried for the items in ascending order, we can just pull the first item that matches the title and this is the original item
            let earliestProductType = alreadySavedProductTypes[alreadySavedIndex];
            productTitleDictionary[productTitle] = earliestProductType;
        }
    }

    return productTitleDictionary;
}