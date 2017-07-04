var Parse = require('parse/node');

exports.getCutDistributions = function getCutDistributions() {
    var promise = new Parse.Promise();
    const CutList = require('../cutList.js');
    let query = CutList.createLineItemsToCutQuery();
    query.include("productVariant.product.fabric");
    query.limit(10000);
    query.find({
        success: function(lineItems) {
            let colorDictionary = sort(lineItems);
            promise.resolve(colorDictionary);
        }, 
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}

function sort(lineItems) {
    let alreadyUsedColors = {};
    for (var i = 0; i < lineItems.length; i++) {
        let lineItem = lineItems[i];
        if (lineItem.get("productVariant") != undefined) {
            let color = lineItem.get("productVariant").get("product").get("fabric").get("color");
            if (alreadyUsedColors[color] == undefined) {
                //never seen this color before
                alreadyUsedColors[color] = 1
            } else {
                alreadyUsedColors[color]++;
            }
        }
    }
    return alreadyUsedColors;
}