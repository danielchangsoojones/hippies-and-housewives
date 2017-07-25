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
            let originalProductVariantDictionary = results[0];
            let correspondingItems = results[1];
            let correspondingLineItems = results[2];
            setObjectsToOriginalProductType(originalProductVariantDictionary, correspondingItems, correspondingLineItems);
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

function setObjectsToOriginalProductType(productVariantDictionary, items, lineItems) {
    if (items.length == 0 && lineItems.length == 0) {
        return;
    }

    let itemsToSave = updateItems(productVariantDictionary, items);
    let lineItemsToSave = updateLineItems(productVariantDictionary, lineItems);
    const SaveAll = require('../../orders/js/orders.js');
    SaveAll.saveAllComponents([itemsToSave, lineItemsToSave]).then(function(results) {
        console.log("successfully reset items/lineitems");
    }, function(error) {
        console.log(error);
    });
}

function updateItems(productVariantDictionary, items) {
    var itemsToSave = [];
    for (var i = 0; i < items.length; i++) {
        let item = items[i];
        let originalProductVariant = getOriginalProductVariant(item.get("productVariant"), productVariantDictionary);
        item.set("productVariant", originalProductVariant);
        itemsToSave.push(item);
    }

    return itemsToSave;
}

function updateLineItems(productVariantDictionary, lineItems) {
    var lineItemsToSave = [];

    for (var i = 0; i < lineItems.length; i++) {
        let lineItem = lineItems[i];
        let originalProductVariant = getOriginalProductVariant(lineItem.get("productVariant"), productVariantDictionary);
        lineItem.set("productVariant", originalProductVariant);
        lineItemsToSave.push(lineItem);
    }

    return lineItemsToSave;
}

function getOriginalProductVariant(targetProductVariant, productVariantDictionary) {
    let size = targetProductVariant.get("size");
    let sizeAbbreviation = abbreviateSizeTitle(size);
    let originalProductVariant = productVariantDictionary[sizeAbbreviation];
    return originalProductVariant;
}

//Some variants were saved like Small instead of S, so we need to clean this data
function abbreviateSizeTitle(size) {
    const ProductVariant = require('../../models/productVariant.js');
    let sizeAbbreviation = ProductVariant.longSizes(size);
    if (sizeAbbreviation == undefined) {
        //the size was already correct, so no need to convert
        return size;
    } else {
        //the size was something like Medium, and therefore needs to be converted to its abbreviation
        return sizeAbbreviation;
    }
}



