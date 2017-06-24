require("../../resources/initializeParse.js");
var Parse = require('parse/node');

testInventorySave();
function testInventorySave() {
    let productTypeObjectID = "IRWM7WulrO";
    let size = "XL";
    let quantity = 5;
    var Saving = require("../save/save.js");
    Saving.saveInventory(productTypeObjectID, size, quantity).then(function(items) {
        console.log(items);
    }, function (error) {
        console.log(error);
    });
}

function removeInventory(productTypeObjectID, size) {
    let Inventory = require("../remove/removeInventory.js");
    Inventory.removeInventory(productTypeObjectID, size).then(function(inventory) {
        console.log(inventory);
    }, function(error) {
        console.log(error);
    });
}