let Package = require("../models/tracking/package.js");
let Item = require("../models/item.js");
require("./initializeParse.js");
var Parse = require('parse/node');

transposeData();
function transposeData() {
    var LineItem = require("../models/lineItem.js");
    let query = LineItem.query();
    query.exists("state");
    query.limit(10000);
    query.include("inventory");

    query.find({
        success: function(lineItems) {
            for (var i = 0; i < lineItems.length; i++) {
                let lineItem = lineItems[i];
                transposeLineItem(lineItem);
            }
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

    var item;
    if (lineItem.get("inventory") != undefined) {
        //this line item is in inventory
        item = createInventoryItem(lineItem);
    } else if (isCut == true || isSewn == true || isPackaged == true || isPicked == true || isShipped == true) {
        //this line item was marked with some attribute, so create an item
        item = createAttributedItem(lineItem);
    } else {
        return;
    }

    item.set("lineItem", lineItem);
    lineItem.set("item", item);

    Parse.Object.saveAll([lineItem, item], {
            success: function (results) {
               console.log(results);
            },
            error: function (error) {                                     
                console.log(error);
            }
    });
}

function createInventoryItem(lineItem) {
    let item = new Item();
    var package = new Package();
    package.set("state", Package.states().in_inventory);
    item.set("package", package);

    return item;
}

function createAttributedItem(lineItem) {
    let item = new Item();

    let isCut = lineItem.get("isCut");
    let isSewn = lineItem.get("isSewn");
    let isPackaged = lineItem.get("isPackaged");
    let isPicked = lineItem.get("isPicked");
    let isShipped = lineItem.get("isShipped");
    let isWithMike = lineItem.get("mike");

    if(isCut == true) {
        let Cut = require("../models/tracking/cut.js");
        let cut = new Cut();
        item.set("cut", cut);
    }
    if(isSewn == true) {
        let Sewn = require("../models/tracking/sewn.js");
        let sewn = new Sewn();
        item.set("sewn", sewn);
    }
    if(isPackaged == true) {
        let Package = require("../models/tracking/package.js");
        var package = new Package();
        package.set("state", Package.states().waiting_for_identified_pick);
        item.set("package", package);
    }
    if(isPicked) {
        let Pick = require("../models/tracking/pick.js");
        let pick = new Pick();
        lineItem.set("pick", pick);
    }
    if (isShipped) {
        let Ship = require("../models/tracking/ship.js");
        let ship = new Ship();
        lineItem.set("ship", ship);
    }
    if (isWithMike) {
        let Group = require("../models/group.js");
        let group = new Group();
        item.set("group", group);
    }
    
    return item;
}

