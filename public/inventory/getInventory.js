var Parse = require('parse/node');
var initializeParse = require("../resources/initializeParse.js");

exports.recieveInventory = function recieveInventory(productVariant) {
    if (productVariant != undefined) {
        let Inventory = require("../models/inventory.js");
        let inventory = new Inventory();
        inventory.set("productVariant", productVariant);
        
        allocateInventory(inventory, productVariant).then(function(objects) {
            console.log(objects);
        }, function(error) {
            console.log(error);
        })
    }
}

function allocateInventory(inventory, productVariant) {
    var promise = new Parse.Promise();
    
    var LineItem = Parse.Object.extend("LineItem");
    var query = new Parse.Query(LineItem);
    query.equalTo("productVariant", productVariant);
    query.doesNotExist("inventory");

    query.first({
        success: function(lineItem) {
            if (lineItem == undefined) {
                //no matching product variants found
                promise.resolve(undefined);
            } else {
                //found a matching product variant, so allocate it both ways (Inventory and Line Item)
                //we allocate both ways, so when we query on either side, we can see if the lineitem/inventory is already allocated.
                inventory.set("lineItem", lineItem);
                lineItem.set("inventory", inventory);
                Parse.Object.saveAll([inventory, lineItem], {
                    success: function (results) {
                        promise.resolve(results);
                    },
                     error: function (error) {                                     
                        promise.reject(error);
                    },
                });
            }
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}