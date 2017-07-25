const initializeParse = require('../../resources/initializeParse.js');

cleanMultipleProducts();
function cleanMultipleProducts() {
    const CleanMultipleProducts = require('../multipleProducts/cleanMultipleProducts.js');
    CleanMultipleProducts.cleanMultipleProducts().then(function(results) {
        console.log(results);
    }, function(error) {
        console.log(error);
    });
}