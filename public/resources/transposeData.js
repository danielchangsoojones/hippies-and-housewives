let Package = require("../models/tracking/package.js");
let Item = require("../models/item.js");

function transposeData() {
    var LineItem = require("../models/lineItem.js");
    let query = LineItem.query();
    query.exists("state");
    query.limit(10000);
    query.include("inventory");

    query.find({
        success: function(lineItems) {
            lineItems.array.forEach(function(lineItem) {
                
            }, this);
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function transposeLineItem(lineItem) {
    let isCut = lineItem.get("isCut");
    let isSewn = lineItem.get("isSewn");
    let isPackaged = lineItem.get("isPackaged");
    let isPicked = lineItem.get("isPicked");
    let isShipped = lineItem.get("isShipped");

    if (lineItem.get("inventory") != undefined) {
        //this line item is in inventory
        createInventoryItem(lineItem);
    } else if (isCut == true || isSewn == true || isPackaged == true || isPicked == true || isShipped == true) {
        //this line item was marked with some attribute, so create an item

    }
}

function createInventoryItem(lineItem) {
    let item = new Item();
    let package = new Package();
    package.set("state", Package.states().in_inventory);
    item.set("package", package);

    return item;
}

function createAttributedItem(lineItem) {
    let isCut = lineItem.get("isCut");
    let isSewn = lineItem.get("isSewn");
    let isPackaged = lineItem.get("isPackaged");
    let isPicked = lineItem.get("isPicked");
    let isShipped = lineItem.get("isShipped");

    if 
    
    
    return item;
}

