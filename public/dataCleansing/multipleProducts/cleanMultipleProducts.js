var Parse = require('parse/node');

/**
 * Sometimes, Vee will make the same product on Shopify with different pictures
 * But, we have to make the same exact product. So we need all the different products
 * to point to the same product in my database
 */
exports.cleanMultipleProducts = function cleanMultipleProducts() {
    var promise = new Parse.Promise();
    
    getProductTypesDictionary().then(function(productTitleDictionary) {
        iterateThrough(productTitleDictionary);
    });

    return promise;
}

function getProductTypesDictionary() {
    const GetMultipleProducts = require('./getMultipleProducts/getMultipleProducts.js');
    return GetMultipleProducts.getMultipleProductTypes();
}

function iterateThrough(productTitleDictionary) {
    for (var productTitle in productTitleDictionary) {
        let productType = productTitleDictionary[productTitle];
        getCorrespondingObjects(productTitle, productType).then(function(results) {
            console.log(results);
        });
    }
}

function getCorrespondingObjects(productTitle, productType) {
    var promises = [];

    promises.push(getProductVariants(productType));
    promises.push(getCorrespondingItems(productType));
    promises.push(getCorrespondingLineItems(productType));

    return Parse.Promise.when(promises);
}

function getProductVariants(productType) {
    const GetProductVariants = require('./getProductVariants.js');
    return GetProductVariants.findOriginalProductVariants(productType);
}

function getCorrespondingItems(originalProductType) {
    const GetItems = require('./getItems.js');
    return GetItems.getCorrespondingItems(originalProductType);
}

function getCorrespondingLineItems(originalProductType) {
    const GetLineItems = require('./getLineItems.js');
    return GetLineItems.findCorrespondingLineItems(originalProductType);
}



