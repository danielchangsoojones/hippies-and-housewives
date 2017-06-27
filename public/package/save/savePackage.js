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
        return PickList.checkPickabilityForOrder(lineItem.get("order"), lineItem, item);
    }).then(function(objects) {
        //returning the item
        promise.resolve(objects[0]);
    }, function(error) {
        if(error == exports.noPickableAvailableError) {
            item.save().then(function (item) {
                console.log(error);
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

