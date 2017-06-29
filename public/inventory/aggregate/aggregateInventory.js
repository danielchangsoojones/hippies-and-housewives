var Parse = require('parse/node');

exports.updateInventoryCount = function updateInventoryCount(productVariantDictionary) {
    var promises = [];

    for (var productVariantObjectID in productVariantDictionary) {
        var delta = productVariantDictionary[productVariantObjectID];
        if (delta > 0) {
            let Add = require("../save/multipleInventory/saveMultipleInventory.js");
            promises.push(Add.saveInventory(productVariantObjectID, delta));
        } else if (delta < 0) {
            console.log("delta is negative");            
        }
    }

    return Parse.Promise.when(promises);
}

