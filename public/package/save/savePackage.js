let Pickable = require("../../models/pickable.js");
exports.noPickableAvailableError = "could not create a pickable";

exports.savePackage = function savePackage(state, item) {
    var promise = new Parse.Promise();

    setPackage(item);
    fetchLineItem().then(function(lineItem) {
        let PickList = require("../../pickList/pickList.js");
        PickList.checkPickabilityForOrder(lineItem.get("order"));
    }).then(function(pickableLineItems) {
        return doesPickableAlreadyExist(lineItem.get("order"));
    }).then(function(order) {
        return finishPickable(order, pickableLineItems);
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

function setPackage(item) {
    let Package = require("../../models/tracking/package.js");
    let package = new Package();
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
        success: function(order) {
            if (order == undefined) {
                promise.reject(exports.noPickableAvailableError);
            } else {
                promise.resolve(order);
            }
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}

function finishPickable(order, lineItems) {
    let pickable = createPickable(order, lineItems);
    let objects = [item, pickable];
    let SaveAll = require("../../orders/js/orders.js");
    return SaveAll.saveAllComponents(objects);
}

function createPickable(order, lineItems) {
    let pickable = new Pickable();
    pickable.set("order", order);
    pickable.set("lineItems");
    return pickable;
}

