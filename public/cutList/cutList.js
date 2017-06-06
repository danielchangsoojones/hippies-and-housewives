/*
The cut list is all items that have yet to enter the manufacturing pipeline. It is any items that need to get cut,
and have not yet been set to the cutters. The cut list should be any line items that are: 1) open orders 2) not allocated and 3) not initiated into the manufacturing pipeline
The cut list then gets sent to a google sheet where Andrew can print out labels to place on the swimsuits.
A label will have: Shopify Line Item ID, Shopify Order ID (i.e. #HippiesAndHousewives2048), item name, size, quantity
*/
var Parse = require('parse/node');
var initializeParse = require("../resources/initializeParse.js");

exports.getCutList = function getCutList() {
    var promise = new Parse.Promise();

    findLineItemsToCut().then(function(success) {
        createGoogleSheet(lineItems).then(function(success) {
            if (success) {
                promise.resolve(lineItems);
            } else {
                promise.reject("failed to save to Google sheets");
            }
        }, function (error) {
            promise.reject(error);
        });
    }, function(error) {
        console.log(error);
    });

    return promise;
}

function findLineItemsToCut() {
    var promise = new Parse.Promise();

    var LineItem = Parse.Object.extend("LineItem");
    var query = new Parse.Query(LineItem);
    query.equalTo("state", "open");
    query.notEqualTo("initiated", true);
    query.doesNotExist("inventory");
    //get the oldest items because we want to cut those first.
    query.ascending("createdAt");

    query.find({
      success: function(lineItems) {
          console.log(lineItems);
          promise.resolve(lineItems);
      },
      error: function(error) {
          promise.reject(error);
      }
    });

    return promise;
}

function createGoogleSheet(lineItems) {
    var promise = new Parse.Promise();

    return promise;
    //TODO: create a google sheet
}

function addRowToGoogleSheet(lineItem) {
    //TODO: send these to the google sheet
    let order = lineItem.get("order");
    let productVariant = lineItem.get("product");
    let shopifyLineItemID = lineItem.get("shopifyLineItemID");
    //i.e. #HippiesAndHousewives2645<3
    let shopifyOrderID = order.get("name");
    let itemName = order.get("title");
    let size = productVariant.get("size");
    let quantity = lineItem.get("quantity");
}

