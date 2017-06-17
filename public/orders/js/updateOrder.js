var Parse = require('parse/node');
var OrderHelper = require("./orders.js");

exports.updateOrder = function updateOrder(orderJSON) {
    if (orderJSON != undefined) {
        findLineItems(orderJSON).then(function(lineItems) {
            updateLineItems(lineItems, orderJSON);
            setOrder(lineItems, orderJSON);
        }, function(error) {
            console.log(error);
        });
    }
}

function findLineItems(orderJSON) {
    var promise = new Parse.Promise();

    var LineItem = Parse.Object.extend("LineItem");
    var query = new Parse.Query(LineItem);

    var Order = Parse.Object.extend("Order");
    var innerQuery = new Parse.Query(Order);
    innerQuery.equalTo("shopifyID", orderJSON.id);
    query.matchesQuery("order", innerQuery);

    query.include("order");
    query.find({
        success: function(lineItems) {
            console.log(lineItems);
            promise.resolve(lineItems);
        },
        error: function(error) {
            promise.reject(error);
            console.log("Error: " + error.code + " " + error.message);
        }
    });

    return promise;
}

function setOrder(lineItems, orderJSON) {
    if (lineItems[0] != undefined) {
        let order = lineItems[0].get("order");
        order.set("note", orderJSON.note);
        order.set("shipmentStatus", OrderHelper.getShipmentStatus(orderJSON));
        order.set("name", orderJSON.name);
        order.set("address", updateAddress(orderJSON));
        
        order.save(null, {
            success: function(order) {},
            error: function(error) {
                console.log(error);
            }
        });
    }
}

function updateLineItems(lineItems, orderJSON) {
    var lineItemIDs = [];

    for (var i = 0; i < lineItems.length; i++) {
        let lineItem = lineItems[i];   
        updateLineItem(lineItem, orderJSON);
        lineItemIDs.push(lineItemIDs);
    }
}

function updateLineItem(lineItem, orderJSON) {
    lineItem.set("state", OrderHelper.getLineItemState(orderJSON));
    lineItem.save(null, {
        success: function(order) {},
        error: function(error) {
            console.log(error);
        }
    });
}

function updateAddress(orderJSON) {
    let Update = require("./orders.js");
    let updatedAddress = Update.createAddress(orderJSON);
    return updatedAddress;
}