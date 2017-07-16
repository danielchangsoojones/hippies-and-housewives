var Parse = require("parse/node");

exports.cleanPickables = function cleanPickables() {
    const Pickable = require('../../models/pickable.js');
    let query = Pickable.query();
    query.include("lineItems");
    query.include("lineItems.item");
    query.limit(10000);
    query.find({
        success: function(pickables) {
            removeObselete(pickables);
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function removeObselete(pickables) {
    for (var i = 0; i < pickables.length; i++) {
        let pickable = pickables[i];
        checkIfAllLineItemsCompleted(pickable).then(function(isValid) {
            if (!isValid) {
                pickable.destroy();
            }
        }, function(error) {
            console.log(error);
        });
    }
}

function checkIfAllLineItemsCompleted(pickable) {
    var promise = new Parse.Promise();

    let lineItems = pickable.get("lineItems");
    
    let lineItemIDs = [];
    for (var l = 0; l < lineItems.length; l++) {
        let lineItem = lineItems[l];
        lineItemIDs.push(lineItem.id);
    }

    const LineItem = require('../../models/lineItem.js');
    let query = LineItem.query();
    query.containedIn("objectId", lineItemIDs);
    query.include("item");
    query.include("item.package");
    query.include("item.pick");

    query.find({
        success: function(lineItems) {
            const PickList = require('../pickList.js');
            let isValid = PickList.checkIfAllLineItemsCompleted(lineItems);
            promise.resolve(isValid);
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}
