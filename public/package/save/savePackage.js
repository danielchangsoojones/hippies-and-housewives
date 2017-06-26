let Pickable = require("../../models/pickable.js");
var Parse = require('parse/node');
exports.noPickableAvailableError = "could not create a pickable";

exports.savePackage = function savePackage(state, item) {
    var promise = new Parse.Promise();

    setPackage(item, state);
    var initialLineItem;
    var lineItems;
    fetchLineItem(item).then(function(lineItem) {
        initialLineItem = lineItem;
        var PickList = require("../../pickList/pickList.js");
        return PickList.checkPickabilityForOrder(lineItem.get("order"), lineItem);
    }).then(function(pickableLineItems) {
        lineItems = pickableLineItems;
        return doesPickableAlreadyExist(initialLineItem.get("order"));
    }).then(function(order) {
        return finishPickable(item, order, lineItems);
    }).then(function(objects) {
        //returning the item
        promise.resolve(objects[0]);
    }, function(error) {
        if(error == exports.noPickableAvailableError) {
            item.save().then(function (item) {
                promise.resolve(item);
            }, function (error) {
                promise.reject(error);
            });
        } else {
            promise.reject(error);
        }
    })

    return promise;
}

function setPackage(item, state) {
    let Package = require("../../models/tracking/package.js");
    var package = new Package();
    package.set("state", state);
    item.set("package", package);
}

function fetchLineItem(item) {
    var promise = new Parse.Promise();

    let LineItem = require("../../models/lineItem.js");
    let query = LineItem.query();
    query.equalTo("item", item);
    query.include("order");
    query.first({
        success: function(lineItem) {
            if (lineItem == undefined) {
                //this item had no line Item
                promise.reject(exports.noPickableAvailableError);
            } else {
                promise.resolve(lineItem);
            }
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
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
                promise.reject(exports.noPickableAvailableError);
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
    let SaveAll = require("../../orders/js/orders.js");
    return SaveAll.saveAllComponents(objects);
}

function createPickable(order, lineItems) {
    let pickable = new Pickable();
    pickable.set("order", order);
    pickable.set("lineItems", lineItems);
    return pickable;
}

