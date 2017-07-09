require("../../resources/initializeParse.js");
var Parse = require('parse/node');
var Saving = require("../save/save.js");

function testInventorySave() {
    let productTypeObjectID = "SsOjSJqw32";
    let size = "S";
    let quantity = 2;
    
    Saving.saveInventory(productTypeObjectID, size, quantity).then(function(items) {
        console.log(items);
    }, function (error) {
        console.log(error);
    });
}

function aggregateInventory() {
    let Aggregate = require("../aggregate/aggregateInventory.js");
    var dictionary = {"xVQk4PISAd" : -2, "BqqyxB4jau" : 2};
    Aggregate.updateInventoryCount(dictionary).then(function(results) {
        console.log(results);
    }, function(error) {
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

function removeMultipleInventory(productVariantObjectID, quantity) {
    let Inventory = require("../remove/multipleInventories/removeMultipleInventories.js");
    Inventory.removeInventory(productVariantObjectID, quantity).then(function(inventories) {
        console.log(inventories);
    }, function(error) {
        console.log(error);
    });
}

function loadInventories(productTypeObjectID) {
    const LoadInventoryCounts = require('../aggregate/loadCounts/loadInventoryCounts.js');
    LoadInventoryCounts.loadInventories(productTypeObjectID).then(function(results) {
        console.log(results);
    }, function(error) {
        console.log(error);
    });
}

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

function removePickable() {
    let LineItem = require("../../models/lineItem.js");
    let lineItem = new LineItem();
    lineItem.id = "b4eWdX0Oh3"
    let Remove = require("../remove/multipleInventories/removeMultipleInventories.js");
    Remove.removePickables([lineItem]);
}