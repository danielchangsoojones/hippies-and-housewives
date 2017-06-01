var Parse = require('parse/node');
var initializeParse = require("../resources/initializeParse.js");
var request = require('request');

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

function testRefund() {
    let baseURL = require("../resources/shopifyURL.js");
    var shopifyURL = baseURL + '/orders/4920141833/refunds.json';
    var parameters = {};
    request({url: shopifyURL, qs: parameters}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //For some reason, the json has a field orders which you have to access first before it gets to the array of orders
            let refunds = JSON.parse(body).refunds;
            exports.recieveNewRefund(refunds[0]);
        } else {
            console.log(error);
        }
    });
}