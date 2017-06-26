/*
A pick list is the group of items to take from inventory and finished
packaged items. For H & H's purposes, an entire order will be pick only
when it is 100% capable of being filled. This means that every order chosen for the
pick list will have all of its line items ready.
*/
var Parse = require('parse/node');
let LineItem = require("../models/lineItem.js");
let Item = require("../models/item.js");

exports.createPickList = function createPickList() {
    var promise = new Parse.Promise();

    findCompletedLineItems().then(function(completedLineItems) {
        return findCompletedOrders(completedLineItems)
    }).then(function(results) {
        let filteredArray = filterArray(results);
        //For some reason, when I pass the results to Cloud code via a promise. The Object loses its class affiliation, so my iOS doesn't recieve an object, just JSON. Encoding the objects before sending to cloud code fixes this.
        promise.resolve(Parse._encode(filteredArray));
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

// /*
// A completed line item is either fulfilled via inventory or isPackaged.
// The best way Daniel could think of getting 100% filled orders was to first find all items
// that were completed. Then, we'll go get search the line item's orders to find any
// line items in that order that aren't completed. If we get no results, then that means the order is done. It's ineffecient because you run a query
// for every received line item, but it's the best way Daniel can think of accomplishing this.
// */
// function findCompletedLineItems() {
//     let query = LineItem.query();
//     query.doesNotExist("pick");

//     let itemQuery = Item.query();
//     itemQuery.exists("package");
//     query.matchesQuery("item", itemQuery);

//     query.include("order");

//     return query.find();
// }

// function findCompletedOrders(completedLineItems) {
//     let orderDictionary = groupLineItemsToOrders(completedLineItems);

//     var promises = [];
//     for(var orderID in orderDictionary) {
//         let completedOrderLineItems = orderDictionary[orderID];

//          var promise = runIncompleteLineItemQuery(completedOrderLineItems); 
//          promises.push(promise);
//     }

//     return Parse.Promise.when(promises);
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

// exports.runIncompleteLineItemQuery = function runIncompleteLineItemQuery(completedLineItem) {
//     var promise = new Parse.Promise();
//     let order = completedLineItem.get("order");

//     var incompleteLineItemQuery = createIncompleteLineItemQuery(order);
//     incompleteLineItemQuery.first({
//         success: function(lineItem) {
//             if (lineItem == undefined) {
//                 //we couldn't find an incomplete line item, which means the entire order is ready to be picked
//                 promise.resolve([order, completedLineItems]);
//             } else {
//                 //we found an incomplete line item, so don't pick this order. 
//                 promise.resolve(undefined);
//             }
//             },
//             error: function(error) {
//                 promise.reject(error);
//             }
//     });

//     return promise;
// }

exports.checkPickabilityForOrder = function checkPickabilityForOrder(order, initialLineItem) {
    var promise = new Parse.Promise();

    let LineItem = require("../models/lineItem.js");
    let query = LineItem.query();
    query.equalTo("order", order);
    //we don't want to pull down the line item that we are testing because it is not saved yet, but we are setting its packaging to true
    query.notEqualTo("objectId", initialLineItem.id);
    query.include("item.package");
    query.find({
        success: function(lineItems) {
            if (checkForAllCompletedLineItems(lineItems)) {
                lineItems.push(initialLineItem);
                promise.resolve(lineItems);
            } else {
                let SavePackage = require("../package/save/savePackage.js");
                promise.reject(SavePackage.noPickableAvailableError);
            }
        }, 
        error: function(error) {
            promise.reject(error);
        }
    });


    return promise;
}

function checkForAllCompletedLineItems(lineItems) {
    if (lineItems == undefined || lineItems.length == 0) {
        return false;
    }

    for (var i = 0; i < lineItems.length; i++) {
        let lineItem = lineItems[i];
        var item = lineItem.get("item");
        if (item == undefined) {
            return false;
        } else {
            var package = item.get("package");
            if (package == undefined) {
                //a line item of the order has not been packaged yet, therefore the order can't be picked
                return false;
            }
        }
    }

    //all line items are completed for an order, so the order can be picked
    return true;
}


// //TODO: delete this function, I changed it to fit my new needs
// // function runIncompleteLineItemQuery(completedLineItems) {
// //     var promise = new Parse.Promise();
// //     let order = completedLineItems[0].get("order")

// //     var incompleteLineItemQuery = createIncompleteLineItemQuery(order);
// //     incompleteLineItemQuery.first({
// //         success: function(lineItem) {
// //             if (lineItem == undefined) {
// //                 //we couldn't find an incomplete line item, which means the entire order is ready to be picked
// //                 promise.resolve([order, completedLineItems]);
// //             } else {
// //                 //we found an incomplete line item, so don't pick this order. 
// //                 promise.resolve(undefined);
// //             }
// //             },
// //             error: function(error) {
// //                 promise.reject(error);
// //             }
// //     });

// //     return promise;
// // }

// function createIncompleteLineItemQuery(order) {
//     let nonExistentItemQuery = createItemDoesNotExistQuery(order);
//     let nonPackagedItemQuery = createItemIsNotPackagedQuery(order);
//     return Parse.Query.or(nonExistentItemQuery, nonPackagedItemQuery);
// }

// function createItemDoesNotExistQuery(order) {
//     let lineItemQuery = createCommonIncompleteLineItemQuery(order);
//     lineItemQuery.doesNotExist("item");
//     return lineItemQuery;
// }

// function createItemIsNotPackagedQuery(order) {
//     let lineItemQuery = createCommonIncompleteLineItemQuery(order);
//     let itemQuery = Item.query();
//     itemQuery.doesNotExist("package");
//     lineItemQuery.matchesQuery("item", itemQuery);
//     return lineItemQuery;
// }

// function createCommonIncompleteLineItemQuery(order) {
//     var incompleteLineItemsQuery = LineItem.query();
//     incompleteLineItemsQuery.equalTo("order", order);
//     return incompleteLineItemsQuery;
// }

// function filterArray(array) {
//     let filteredArray = array.filter(function(a){return a !== undefined})
//     return filteredArray
// }

