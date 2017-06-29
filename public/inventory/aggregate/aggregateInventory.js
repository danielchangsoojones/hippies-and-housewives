var Parse = require('parse/node');

exports.updateInventoryCount = function updateInventoryCount(productVariantDictionary) {
    var promises = [];

    for (var productVariantObjectID in productVariantDictionary) {
        var delta = productVariantDictionary[productVariantObjectID];
        if (delta > 0) {
            let Add = require("../save/multipleInventory/saveMultipleInventory.js");
            promises.push(Add.saveInventory(productVariantObjectID, delta));
        } else if (delta < 0) {
            let Remove = require("../remove/multipleInventories/removeMultipleInventories.js");
            promises.push(Remove.removeInventory(productVariantObjectID, delta));         
        }
    }

    return Parse.Promise.when(promises);
}

