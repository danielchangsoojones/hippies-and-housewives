/*
The cut list is all items that have yet to enter the manufacturing pipeline. It is any items that need to get cut,
and have not yet been set to the cutters. The cut list should be any line items that are: 1) open orders 2) not allocated and 3) not initiated into the manufacturing pipeline
The cut list then gets sent to a google sheet where Andrew can print out labels to place on the swimsuits.
A label will have: Shopify Line Item ID, Shopify Order ID (i.e. #HippiesAndHousewives2048), item name, size, quantity
*/
var Parse = require('parse/node');
let Item = require("../models/item.js");

exports.getCutList = function getCutList() {
    var promise = new Parse.Promise();

    findLineItemsToCut().then(function(lineItems) {
        exports.createGoogleSheet(lineItems).then(function(success) {
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
    let orQuery = exports.createLineItemsToCutQuery();
    return orQuery.find();
}

exports.createLineItemsToCutQuery = function createLineItemsToCutQuery() {
    let nonExistentItemsQuery = createNonExistentItemsQuery();
    let nonInitiatedItemsQuery = createNonInitiatedItemsQuery();
    let orQuery = Parse.Query.or(nonExistentItemsQuery, nonInitiatedItemsQuery);
    orQuery.include("item");
    //get the oldest items because we want to cut those first.
    orQuery.ascending("createdAt");
    orQuery.include("order");
    return orQuery;
}

function createNonExistentItemsQuery() {
    let lineItemQuery = createCommonLineItemsQuery();
    lineItemQuery.doesNotExist("item");
    return lineItemQuery;
}

function createNonInitiatedItemsQuery() {
    let lineItemQuery = createCommonLineItemsQuery();
    let itemQuery = Item.query();
    itemQuery.notEqualTo("isInitiated", true);
    lineItemQuery.matchesQuery("item", itemQuery);
    return lineItemQuery;
}

function createCommonLineItemsQuery() {
    var LineItem = require("../models/lineItem.js");
    var query = LineItem.query();
    return query;
}

exports.createGoogleSheet = function createGoogleSheet(lineItems) {
    var promise = new Parse.Promise();

    createItems(lineItems).then(function(lineItems) {
        var GoogleSheets = require("./googleSheets/googleSheets.js"); 
        return GoogleSheets.createCutList(lineItems)
    }).then(function(success) {
        promise.resolve(success);
    }, function(error) {
        promise.resolve(error);
    });

    return promise;
}

function createItems(lineItems) {
    var promise = new Parse.Promise();
    var newItems = [];

    for(var i = 0; i < lineItems.length; i++) {
        let lineItem = lineItems[i];
        let item = lineItem.get("item");
        if (item == undefined) {
            //item has never been created before. We need to create an item at the start because we need to haev a unique ID that we can create stickers for. 
            let item = new Item();
            let Unique = require("../items/item/uniqueID.js");
            Unique.createUniqueID(item);
            lineItem.set("item", item);
            item.set("lineItem", lineItem);
            newItems.push(item);
        }
    }

    //at some point, it would make sense to save All items as initiated here, but sometimes we don't want to initiate them, we just want to see our options.
    Parse.Object.saveAll(newItems, function(newItems) {
        promise.resolve(lineItems);
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

// function saveAllLineItemsAsInitiated(lineItems) {
//     for (var i = 0; i < lineItems.length; i++) {
//         let lineItem = lineItems[i];
//         //TODO: not saving line items as initiated yet because the cutting production is not good enough to do this yet. 
//         // lineItem.set("isInitiated", true);
//     }

//     Parse.Object.saveAll(lineItems);
// }

