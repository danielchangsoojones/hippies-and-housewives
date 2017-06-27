/*
A pick list is the group of items to take from inventory and finished
packaged items. For H & H's purposes, an entire order will be pick only
when it is 100% capable of being filled. This means that every order chosen for the
pick list will have all of its line items ready.
*/
var Parse = require('parse/node');
let SavePackage = require("../package/save/savePackage.js");
var Pickable = require("../models/pickable.js");

exports.checkPickabilityForOrder = function checkPickability(order, initialLineItem, item) {
    var promise = new Parse.Promise();

    var lineItems;
    checkPickabilityForOrder(order, initialLineItem).then(function(pickableLineItems) {
        lineItems = pickableLineItems;
        return doesPickableAlreadyExist(initialLineItem.get("order"));
    }).then(function(order) {
        return finishPickable(item, order, lineItems);
    }).then(function(objects) {
        promise.resolve(objects);
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

function checkPickabilityForOrder(order, initialLineItem) {
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
    if (lineItems.length == 0) {
        //this order only has one item, therefore, we couldn't find any associated line items
        //we know we are packaging this item already, so the order is completed
        return true;
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

function doesPickableAlreadyExist(order) {
    var promise = new Parse.Promise();
    let query = Pickable.query();
    query.equalTo("order", order);
    query.first({
        success: function(pickable) {
            if (pickable == undefined) {
                //the pickable has never been made before, so return our order adn create a pickable
                promise.resolve(order);
            } else {
                //the pickable has already been created and we don't want duplicates
                promise.reject(SavePackage.noPickableAvailableError);
            }
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}

function finishPickable(item, order, lineItems) {
    let pickable = createPickable(order, lineItems);
    let objects = [item, pickable];
    let SaveAll = require("../orders/js/orders.js");
    return SaveAll.saveAllComponents(objects);
}

function createPickable(order, lineItems) {
    let pickable = new Pickable();
    pickable.set("order", order);
    pickable.set("lineItems", lineItems);
    return pickable;
}

