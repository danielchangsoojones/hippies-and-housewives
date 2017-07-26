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

aggregateInventory();
function aggregateInventory() {
    let Aggregate = require("../aggregate/aggregateInventory.js");
    var dictionary = {"511bGXrSII" : 5};
    Aggregate.updateInventoryCount(dictionary).then(function(results) {
        for (var i = 0; i < results[0].length; i++) {
            let result = results[0][i];
            if (result.className === "Item") {
                console.log(result);
            }
        }
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

function removePickable() {
    let LineItem = require("../../models/lineItem.js");
    let lineItem = new LineItem();
    lineItem.id = "b4eWdX0Oh3"
    let Remove = require("../remove/multipleInventories/removeMultipleInventories.js");
    Remove.removePickables([lineItem]);
}