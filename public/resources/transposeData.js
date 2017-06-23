let Package = require("../models/tracking/package.js");
let Item = require("../models/item.js");
require("./initializeParse.js");
var Parse = require('parse/node');

var num = 1;

//TODO: we are not setting the product variant right now, but we need to or else it won't be set
//TODO: we need to add unique ID's to every item
// function transposeData() {
//     var LineItem = require("../models/lineItem.js");
//     let query = LineItem.query();
//     query.exists("state");
//     query.limit(10000);
//     query.include("inventory");

//     var objectsToSave = [];

//     query.find({
//         success: function(lineItems) {
//             var objectsArray = [];
//             for (var i = 0; i < lineItems.length; i++) {
//                 let lineItem = lineItems[i];
//                 let objects = transposeLineItem(lineItem);
//                 objectsArray.push(objects);
//             }
//             var Flatten = require("../orders/js/orders.js");
//             Flatten.saveAllComponents(objectsArray).then(function(results) {
//                 console.log(results);
//             }, function(error) {
//                 console.log(error);
//             });
//         },
//         error: function(error) {
//             console.log(error);
//         }
//     });
// }

// function transposeLineItem(lineItem) {
//     let isCut = lineItem.get("isCut");
//     let isSewn = lineItem.get("isSewn");
//     let isPackaged = lineItem.get("isPackaged");
//     let isPicked = lineItem.get("isPicked");
//     let isShipped = lineItem.get("isShipped");

//     if (lineItem.id == "YzJkrTPsxV") {
//             console.log("the id is YzJkrTPsxV first")
//             console.log(isCut);
//             console.log(isSewn);
//             console.log(isPackaged);
//             console.log(isPicked);
//             console.log(isShipped);
//         }

//     var item;
//     if (isCut == true || isSewn == true || isPackaged == true || isPicked == true || isShipped == true) {
//         //this line item was marked with some attribute, so create an item
//         item = createAttributedItem(lineItem);
//     } else if (lineItem.get("inventory") != undefined) {
//         //the line item is only made via inventory and nothing else
//         item = createInventoryItem(lineItem);
//     } else {
//         return;
//     }
//     console.log(num);
//     num++;

//     lineItem.set("item", item);
//     item.set("lineItem", lineItem);

//     return [item, lineItem];

//     //I guess in the array order when saving all, you have to put the new item first and then the already made object. IF I do [lineItem, item] instead of [item, lineItem] then it gives weird errors.
//     // Parse.Object.saveAll([item, lineItem], {
//     //         success: function (results) {
//     //            console.log(results);
//     //         },
//     //         error: function (error) {                                     
//     //             console.log(error);
//     //         }
//     // });
// }

// function createInventoryItem(lineItem) {
//     let item = new Item();
//     var package = new Package();
//     item.set("package", package);
//     package.set("state", Package.states().in_inventory);
//     item.set("isInitiated", true);
//     return item;
// }

// function createAttributedItem(lineItem) {
//     let item = new Item();

//     let isCut = lineItem.get("isCut");
//     let isSewn = lineItem.get("isSewn");
//     let isPackaged = lineItem.get("isPackaged");
//     let isPicked = lineItem.get("isPicked");
//     let isShipped = lineItem.get("isShipped");
//     let isWithMike = lineItem.get("mike");

//     if(isCut == true) {
//         let Cut = require("../models/tracking/cut.js");
//         let cut = new Cut();
//         item.set("cut", cut);
//         item.set("isInitiated", true);
//     }
//     if(isSewn == true) {
//         let Sewn = require("../models/tracking/sewn.js");
//         let sewn = new Sewn();
//         item.set("sewn", sewn);
//         item.set("isInitiated", true);
//     }
//     if(isPackaged == true) {
//         let Package = require("../models/tracking/package.js");
//         var package = new Package();
//         if (lineItem.get("inventory") != undefined) {
//             package.set("state", Package.states().in_inventory);
//         } else {
//             package.set("state", Package.states().waiting_for_identified_pick);
//         }
//         item.set("package", package);
//         item.set("isInitiated", true);
//     }
//     if(isPicked) {
//         let Pick = require("../models/tracking/pick.js");
//         let pick = new Pick();
//         lineItem.set("pick", pick);
//         item.set("isInitiated", true);
//     }
//     if (isShipped) {
//         let Ship = require("../models/tracking/ship.js");
//         let ship = new Ship();
//         lineItem.set("ship", ship);
//         item.set("isInitiated", true);
//     }
//     if (isWithMike) {
//         let Group = require("../models/group.js");
//         let group = new Group();
//         item.set("group", group);
//     }
    
//     return item;
// }

// //MARK: add product variants to all items
// function addProductVariantsToItem() {
//     var Item = require("../models/Item.js");
//     let query = Item.query();
//     query.include("lineItem");
//     query.include("lineItem.productVariant");
//     query.limit(10000);
//     query.find({
//         success: function(items) {
//             var itemsArray = [];
//             for (var i = 0; i < items.length; i++) {
//                 let item = items[i];
//                 let lineItem = item.get("lineItem");
//                 if (lineItem != undefined) {
//                     let productVariant = lineItem.get("productVariant");
//                     if (productVariant != undefined) {
//                         item.set("productVariant", productVariant);
//                         itemsArray.push(item);
//                     }  
//                 }    
//             }

//             var Flatten = require("../orders/js/orders.js");
//             Flatten.saveAllComponents(itemsArray).then(function(results) {
//                 console.log(results);
//             }, function(error) {
//                 console.log(error);
//             });
            
//         },
//         error: function(error) {
//             console.log(error);
//         }
//     });
// }

//MARK: transpose inventory
// function getNonAllocatedInventory() {
//     let Inventory = Parse.Object.extend("Inventory");
//     let query = new Parse.Query(Inventory);
//     query.notEqualTo("isDeleted", true);
//     query.doesNotExist("lineItem");
//     query.include("productVariant");
//     query.limit(10000);
//     query.find({
//         success: function(inventories) {
//             var items = [];
//             for(var i = 0; i < inventories.length; i++) {
//                 let inventory = inventories[i];
//                 let item = createNonAllocatedInventoryItem(inventory);
//                 items.push(item);
//             }
//             saveAll(items);
//         },
//         error: function(error) {
//             console.log(error);
//         }
//     });
// }

// function createNonAllocatedInventoryItem(inventory) {
//     let item = new Item();
//     let productVariant = inventory.get("productVariant");
//     item.set("productVariant", productVariant);
//     let Package = require("../models/tracking/package.js");
//     var package = new Package();
//     package.set("state", Package.states().in_inventory);
//     item.set("package", package);
//     return item;
// }

function saveAll(objects) {
    var Flatten = require("../orders/js/orders.js");
    Flatten.saveAllComponents(objects).then(function (results) {
        console.log(results);
    }, function (error) {
        console.log(error);
    });
}

//MARK: unqiue ID's
// function addUniqueIDs() {
//     let query = Item.query();
//     query.limit(10000);
//     query.find({
//         success: function(items) {
//             var itemsArray = [];
//             for(var i = 0; i < items.length; i++) {
//                 let item = items[i];
//                 var Unique = require("../items/item/uniqueID.js");
//                 Unique.createUniqueID(item);
//                 itemsArray.push(item);
//             }
//             saveAll(itemsArray);
//         },
//         error: function(error) {
//             console.log(error);
//         }
//     });
// }


