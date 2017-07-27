const initializeParse = require('../../resources/initializeParse.js');

function cleanMultipleProducts() {
    const CleanMultipleProducts = require('../multipleProducts/cleanMultipleProducts.js');
    CleanMultipleProducts.cleanMultipleProducts().then(function(results) {
        console.log(results);
    }, function(error) {
        console.log(error);
    });
}

function cleanItems() {
    const ItemCleaning = require('../itemCleaning/itemCleaning.js');
    ItemCleaning.cleanItems();
}

function cleanEmptyLineItemProductVariants() {
    const CleanEmptyLineItemProducts = require('../emptyProductVariantCleaning/cleanEmptyLineItemProducts.js');
    CleanEmptyLineItemProducts.cleanEmptyLineItemProductVariants();
}