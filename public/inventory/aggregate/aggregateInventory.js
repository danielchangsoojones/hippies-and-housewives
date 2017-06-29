var Parse = require('parse/node');

exports.updateInventoryCount = function updateInventoryCount(productVariantDictionary) {
    var promises = [];

    for (var productVariantObjectID in productVariantDictionary) {
        var delta = productVariantDictionary[productVariantObjectID];
        if (delta > 0) {
            let Add = require("../save/multipleInventory/saveMultipleInventory.js");
            Add.saveInventory(productVariantObjectID, delta);
        }
    }

    return Parse.Promise.when(promises);
}

