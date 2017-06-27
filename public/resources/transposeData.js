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
//     addUniqueID(item, lineItem);
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

// //MARK: unqiue ID's
// function addUniqueID(item, lineItem) {
//     item.set("uniqueID", lineItem.get("shopifyLineItemID"));
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

//MARK: transposing the pick list
// function transposePickListData() {
//     let LineItem = require("../models/lineItem.js");
//     let query = LineItem.query();
//     query.limit(10000);
//     query.include("package");
//     query.include("pick");
//     query.include("order");
//     query.include("item");
//     query.find({
//         success: function(lineItems) {
//             let orderDictionary = groupLineItemsToOrders(lineItems);
//             let completedOrderDictionary = goThrough(orderDictionary);
//             savePickables(completedOrderDictionary);
//         }, function(error) {
//             console.log(error);
//         }
//     });
// }

// function groupLineItemsToOrders(completedLineItems) {
//     //{order : [line items]}
//     var orderDictionary = {}

//     for (var i = 0; i < completedLineItems.length; i++) {
//         let lineItem = completedLineItems[i];
//         let order = lineItem.get("order");
//         let orderID = order.id
        
//         if (orderDictionary[orderID] == undefined) {
//             //order key doesn't exist in dictionary yet
//             orderDictionary[orderID] = [lineItem];
//         } else {
//             //order key already exists in dictionary because it a related line item was already iterated through
//             orderDictionary[orderID].push(lineItem);
//         }
//     }

//     return orderDictionary
// }

// function goThrough(orderDictionary) {
//     var completedOrdersDictionary = {};

//     for(var orderID in orderDictionary) {
//         let lineItems = orderDictionary[orderID];
//         if (checkIfAllLineItemsCompleted(lineItems)) {
//             if (lineItems.length == 1) {
//                 console.log(lineItems[0].get("order"));
//             }
//             completedOrdersDictionary[orderID] = lineItems;
//         }
//     }

//     return completedOrdersDictionary;
// }

// function checkIfAllLineItemsCompleted(lineItems) {
//     for (var i = 0; i < lineItems.length; i++) {
//         let lineItem = lineItems[i];
//         let item = lineItem.get("item");
//         if (item == undefined) {
//             return false;
//         } else {
//             var package = item.get("package");
//             let pick = lineItem.get("pick");
//             if (package == undefined || pick != undefined) {
//                 return false;
//             }
//         }
//     }

//     return true;
// }

// function savePickables(orderDictionary) {
//     for(var orderID in orderDictionary) {
//         let lineItems = orderDictionary[orderID];
//         let order = lineItems[0].get("order");

//         doesPickableAlreadyExist(order).then(function(success) {
//              let Pickable = require("../models/pickable.js");
//              let pickable = new Pickable();
//              pickable.set("order", order);
//              pickable.set("lineItems", lineItems);

//              return pickable.save({
//                  success: function (pickable) {
//                      console.log("success");
//                  },
//                  error: function (error) {
//                      console.log(error);
//                  }
//              });
//         }).then(function(pickable) {
//             console.log("succcess");
//         }, function(error) {
//             console.log(error);
//         });
//     }
// }


// function doesPickableAlreadyExist(order) {
//     var promise = new Parse.Promise();

//     let Pickable = require("../models/pickable.js");
//     let query = Pickable.query();
//     query.equalTo("order", order);
//     query.first({
//         success: function(pickable) {
//             if (pickable == undefined) {
//                 //the pickable has never been made before, so return our order adn create a pickable
//                 promise.resolve(order);
//             } else {
//                 //the pickable has already been created and we don't want duplicates
//                 promise.reject("pick already exists");
//             }
//         },
//         error: function(error) {
//             promise.reject(error);
//         }
//     });

//     return promise;
// }


