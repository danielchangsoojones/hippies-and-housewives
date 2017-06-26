/*
A pick list is the group of items to take from inventory and finished
packaged items. For H & H's purposes, an entire order will be pick only
when it is 100% capable of being filled. This means that every order chosen for the
pick list will have all of its line items ready.
*/
var Parse = require('parse/node');

//MARK: the stuff that is good for my software that I just made
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

