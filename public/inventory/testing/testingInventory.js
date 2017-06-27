require("../../resources/initializeParse.js");
var Parse = require('parse/node');
var Saving = require("../save/save.js");

testInventorySave();
function testInventorySave() {
    let productTypeObjectID = "B1keGnp9F2";
    let size = "S";
    let quantity = 20;
    
    Saving.saveInventory(productTypeObjectID, size, quantity).then(function(items) {
        console.log(items);
    }, function (error) {
        console.log(error);
    });
}

// removeInventory("C9p2zg51P7", "S");
// function removeInventory(productTypeObjectID, size) {
//     let Inventory = require("../remove/removeInventory.js");
//     Inventory.removeInventory(productTypeObjectID, size).then(function(inventory) {
//         console.log(inventory);
//     }, function(error) {
//         console.log(error);
//     });
// }

//Purpose: tell us how many inventories exist for a product variant
// checkInventoryCount("YehYeh Top // Chaco", "S");
function checkInventoryCount(style, size) {
    let Get = require("../../products/testing/productTesting.js");
    Get.getProductVariant(style, size).then(function(productVariantObjectID) {
        let Item = require("../../models/item.js");
        let query = Item.query();

        let productVariantQuery = require("../../models/productVariant.js").query();
        productVariantQuery.equalTo("objectId", productVariantObjectID);
        query.matchesQuery("productVariant", productVariantQuery);

        let Package = require("../../models/tracking/package.js");
        let packageQuery = Package.query();
        packageQuery.equalTo("state", Package.states().in_inventory);
        query.matchesQuery("package", packageQuery);


        query.count({
            success: function (count) {
                console.log(count);
            }
        });
    }, function(error) {
        console.log(error);
    });
}