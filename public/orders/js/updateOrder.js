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

    var LineItem = require("../../models/lineItem.js");
    var query = LineItem.query();

    var Order = require("../../models/order.js");
    var innerQuery = Order.query();
    innerQuery.equalTo("shopifyID", orderJSON.id);
    query.matchesQuery("order", innerQuery);

    query.include("order");
    query.include("order.shippingAddress");
    query.find({
        success: function(lineItems) {
            promise.resolve(lineItems);
        },
        error: function(error) {
            promise.reject(error);
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
        order.set("shippingAddress", updateAddress(orderJSON, order));
        
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

function updateAddress(orderJSON, order) {
    let Update = require("./orders.js");
    let address = order.get("shippingAddress");
    if (address == undefined) {
        let newAddress = Update.createAddress(orderJSON);
        return newAddress;
    } else {
        let updatedAddress = Update.setAddress(address, orderJSON);
        return updatedAddress;
    }
}