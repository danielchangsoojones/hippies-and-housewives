/*
A pick list is the group of items to take from inventory and finished
packaged items. For H & H's purposes, an entire order will be pick only
when it is 100% capable of being filled. This means that every order chosen for the
pick list will have all of its line items ready.
*/
var Parse = require('parse/node');

exports.updatePickList = function updatePickList() {
    let LineItem = require("../models/lineItem.js");
    let query = LineItem.query();
    //TODO: if our data every gets bigger than 10000 rows, then we need to change this up.
    query.limit(10000);
    query.include("package");
    query.include("pick");
    query.include("order");
    query.include("item");
    query.find({
        success: function(lineItems) {
            let orderDictionary = groupLineItemsToOrders(lineItems);
            let completedOrderDictionary = goThrough(orderDictionary);
            savePickables(completedOrderDictionary);
        }, function(error) {
            console.log(error);
        }
    });
}

function groupLineItemsToOrders(completedLineItems) {
    //{order : [line items]}
    var orderDictionary = {}

    for (var i = 0; i < completedLineItems.length; i++) {
        let lineItem = completedLineItems[i];
        let order = lineItem.get("order");
        let orderID = order.id
        
        if (orderDictionary[orderID] == undefined) {
            //order key doesn't exist in dictionary yet
            orderDictionary[orderID] = [lineItem];
        } else {
            //order key already exists in dictionary because it a related line item was already iterated through
            orderDictionary[orderID].push(lineItem);
        }
    }

    return orderDictionary
}

function goThrough(orderDictionary) {
    var completedOrdersDictionary = {};

    for(var orderID in orderDictionary) {
        let lineItems = orderDictionary[orderID];
        if (checkIfAllLineItemsCompleted(lineItems)) {
            completedOrdersDictionary[orderID] = lineItems;
        }
    }

    return completedOrdersDictionary;
}

function checkIfAllLineItemsCompleted(lineItems) {
    for (var i = 0; i < lineItems.length; i++) {
        let lineItem = lineItems[i];
        let item = lineItem.get("item");
        if (item == undefined) {
            return false;
        } else {
            var package = item.get("package");
            let pick = lineItem.get("pick");
            if (package == undefined || pick != undefined) {
                return false;
            }
        }
    }

    return true;
}

function savePickables(orderDictionary) {
    for(var orderID in orderDictionary) {
        let lineItems = orderDictionary[orderID];
        let order = lineItems[0].get("order");

        doesPickableAlreadyExist(order).then(function(success) {
            console.log("nonexistent pick order: " + order.id);
             let Pickable = require("../models/pickable.js");
             let pickable = new Pickable();
             pickable.set("order", order);
             pickable.set("lineItems", lineItems);

             return pickable.save({
                 success: function (pickable) {
                     console.log("success");
                 },
                 error: function (error) {
                     console.log(error);
                 }
             });
        }).then(function(pickable) {
            console.log("succcess");
        }, function(error) {
            console.log(error);
        });
    }
}


function doesPickableAlreadyExist(order) {
    var promise = new Parse.Promise();

    let Pickable = require("../models/pickable.js");
    let query = Pickable.query();
    query.equalTo("order", order);
    query.first({
        success: function(pickable) {
            if (pickable == undefined) {
                //the pickable has never been made before, so return our order adn create a pickable
                promise.resolve(order);
            } else {
                //the pickable has already been created and we don't want duplicates
                promise.reject("pick already exists");
            }
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}

