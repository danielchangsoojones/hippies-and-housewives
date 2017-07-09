let Package = require("../models/tracking/package.js");
let Item = require("../models/item.js");
require("./initializeParse.js");
var Parse = require('parse/node');

var num = 1;

// function transposeData() {
//     var LineItem = require("../models/lineItem.js");
//     let query = LineItem.query();
//     query.exists("state");
//     query.limit(10000);
//     query.include("inventory");
//     query.include("productVariant");

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
//                 //we need to also save any Inventory as Items that were not allocated because the only Inventories that became items were the ones that had an associated Line Item
//                 getNonAllocatedInventory();
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

//     addProductVariantToItem(item, lineItem);
//     item.set("lineItem", lineItem);
//     lineItem.set("item", item);

//     return [item, lineItem];
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

// // //MARK: add product variants to all items
// function addProductVariantToItem(item, lineItem) {
//     let productVariant = lineItem.get("productVariant");
//     item.set("productVariant", productVariant);
// }

// //MARK: transpose inventory
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

// function saveAll(objects) {
//     var Flatten = require("../orders/js/orders.js");
//     Flatten.saveAllComponents(objects).then(function (results) {
//         console.log(results);
//     }, function (error) {
//         console.log(error);
//     });
// }

// function deleteAllItems() {
//     createDeleteQuery("Item");
//     createDeleteQuery("Cut");
//     createDeleteQuery("Group");
//     createDeleteQuery("Package");
//     createDeleteQuery("Pick");
//     createDeleteQuery("Sewn");
//     createDeleteQuery("Ship");
//     unsetItemFromLineItem();
// }

// function unsetItemFromLineItem() {
//     let LineItem = Parse.Object.extend("LineItem");
//     let query = new Parse.Query(LineItem);
//     query.limit(10000);
//     query.exists("item");
//     query.find({
//         success: function(lineItems) {
//             var lineItemsArray = [];
//             for (var i = 0; i < lineItems.length; i++) {
//                 let lineItem = lineItems[i];
//                 lineItem.unset("item");
//                 lineItemsArray.push(lineItem);
//             }
//             Parse.Object.saveAll(lineItemsArray, {
//                 success: function(lineItems) {
//                     console.log("unset all items from line items");
//                 },
//                 error: function(error) {
//                     console.log(error);
//                 }
//             })
//         },
//         error: function(error) {
//             console.log(error);
//         }
//     })
// }

// function createDeleteQuery(objectName) {
//     let Object = Parse.Object.extend(objectName);
//     let query = new Parse.Query(Object);
//     deleteQuery(query);
// }

// function deleteQuery(query) {
//     query.limit(10000);
//     query.find(function(objects) {
//         return Parse.Object.destroyAll(objects);
//     }).then(function(objects) {
//         console.log("deleted all Parse Objects");
//     }, function(error) {
//         console.log(error);
//     });
// }

function getRidOfOldGroupCuts(style, size, lastHour) {
    const Item = require('../models/item.js');
    let query = Item.query();
    query.exists("group");

    const ProductVariant = require('../models/productVariant.js');
    let productVariantQuery = ProductVariant.query();
    const ProductType = require('../models/productType.js');
    let productTypeQuery = ProductType.query();
    productTypeQuery.equalTo("lowercaseTitle", style);
    productVariantQuery.matchesQuery("product", productTypeQuery);
    productVariantQuery.equalTo("size", size);
    query.matchesQuery("productVariant", productVariantQuery);

    let moment = require("moment-timezone");
    let badTime = moment().tz("Pacific/Honolulu");
    badTime.hour(lastHour);
    badTime.minute(0);
    badTime.second(0);
    badTime.millisecond(0);
    query.greaterThanOrEqualTo("createdAt", badTime.toDate());


    query.limit(10000);
    query.include("lineItem");
    query.find({
        success: function(items) {
            for (var i = 0; i < items.length; i++) {
                let item = items[i];
                let lineItem = item.get("lineItem");
                if (lineItem != undefined) {
                    lineItem.unset("item");
                }
                item.unset("lineItem");
                item.set("isDeleted", true);
                Parse.Object.saveAll([item, lineItem])
            }
            console.log(items.length);
        }, 
        error: function(error) {
            console.log(error);
        }
    });
}

//MARK: update a fabric color that is pointing wrongly
// function updateColors() {
//     var theFabric;
//     getFabric().then(function(fabric) {
//         theFabric = fabric;
//         const LineItem = require('../models/lineItem.js');
//         let query = LineItem.query();
//         query.exists("state");
//         query.endsWith("title", "Chaco");
//         query.limit(10000);
//         query.include("productVariant.product");
//         return query.find();
//     }).then(function(lineItems) {
//         var productTypes = [];
//         for (var i = 0; i < lineItems.length; i++) {
//             let lineItem = lineItems[i];
//             let productVariant = lineItem.get("productVariant");
//             if (productVariant != undefined) {
//                 let productType = productVariant.get("product");
//                 productType.set("fabric", theFabric);
//                 productTypes.push(productType);
//             }
//         }
//         Parse.Object.saveAll(productTypes, {
//             success: function(results) {
//                 console.log("succcessss");
//             },
//             error: function(error) {
//                 console.log(error);
//             }
//         });
//     }, function(error) {
//         console.log(error);
//     });
// }

// function getFabric() {
//     const Fabric = require('../models/fabric.js');
//     let query = Fabric.query();
//     query.equalTo("color", "chaco");
//     return query.first();
// }
