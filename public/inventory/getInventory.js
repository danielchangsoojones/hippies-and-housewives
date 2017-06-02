var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

exports.recieveInventory = function recieveInventory(product) {
    if (product != undefined) {
        let Inventory = require("./models/inventory.js");
        let inventory = new Inventory();
        inventory.set("product", product);

        inventory.save(null, {
            success: function(inventory) {},
            error: function(error) {
                console.log(error);
            }
        });
    }
}