var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

exports.recieveNewRefund = function recieveNewRefund(refundJSON) {
    let shopifyLineItemRefunds = exports.getLineItemIDsFromRefund(refundJSON);
    updateLineItemsState(shopifyLineItemIDs);
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
    var LineItem = Parse.Object.extend("LineItem");
    var query = new Parse.Query(LineItem);

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
        lineItem.set("state", "refunded");

        lineItem.save(null, {
            success: function(lineItem) {},
            error: function(lineItem, error) {
                console.log(error);
            }
        });
    }
}