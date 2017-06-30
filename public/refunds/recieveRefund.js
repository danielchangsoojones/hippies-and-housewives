var Parse = require('parse/node');
var request = require('request');
var LineItem = require("../models/lineItem.js");

exports.recieveNewRefund = function recieveNewRefund(refundJSON) {
    let shopifyLineItemRefundIDs = exports.getLineItemIDsFromRefund(refundJSON);
    updateLineItemsState(shopifyLineItemRefundIDs);
}

exports.getLineItemIDsFromRefund = function getLineItemsFromRefund(refundJSON) {
    var shopifyLineItemIDs = [];
    let refundLineItemsJSON = refundJSON.refund_line_items;
    for (var i = 0; i < refundLineItemsJSON.length; i++) {
        let refundLineItem = refundLineItemsJSON[i];
        shopifyLineItemIDs.push(refundLineItem.line_item_id);
    }

    return shopifyLineItemIDs;
}

function updateLineItemsState(shopifyLineItemIDs) {
    var query = LineItem.query();
    //overriding the open state on normal line items
    query.exists("state");

    query.containedIn("shopifyLineItemID", shopifyLineItemIDs);
    
    query.find({
        success: function(lineItems) {
            saveLineItems(lineItems);
        },
        error: function(error) {
            console.log("Error: " + error.code + " " + error.message);
        }
    });
}

function saveLineItems(lineItems) {
    for (var i = 0; i < lineItems.length; i++) {
        let lineItem = lineItems[i];
        lineItem.set("state", LineItem.states().refunded);

        deallocateNonUsedItems(lineItem).then(function(result) {
            lineItem.save(null, {
                success: function(lineItem) {
                    console.log("successfully marked lineItem: " + lineItem.id + " as refunded");
                },
                error: function(error) {
                    console.log(error);
                }
            });
        }, function(error) {
            console.log(error);
        });
    }
}

function deallocateNonUsedItems(lineItem) {
    let Deallocate = require("../lineItems/deallocate/deallocateLineItem.js");
    return Deallocate.deallocateNonUsedItem(lineItem);
}