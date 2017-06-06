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

    findLineItemsToCut().then(function(lineItems) {
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

console.log("hiii");
    var GoogleSheets = require("./googleSheets/googleSheets.js");    
    GoogleSheets.createCutList(lineItems).then(function(success) {
        promise.resolve(success);
    }, function(error) {
        promise.resolve(error);
    })

    return promise;
}

