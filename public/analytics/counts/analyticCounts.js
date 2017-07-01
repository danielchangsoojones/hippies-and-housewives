var Parse = require('parse/node');
var request = require("request");
let LineItem = require("../../models/lineItem.js");
let Analytic = require("../types/analytic.js");
let Item = require("../../models/item.js");

exports.getAnalyticCounts = function getAnalyticCounts() {
    var promises = [];

    promises.push(getOpenOrdersCount());
    promises.push(getItemsToBeCut());
    promises.push(getItemsToBeSewn());
    promises.push(getAllocatedInventoryCount());
    promises.push(getPickListCount());
    promises.push(getOrdersToBeShippedCount());
    promises.push(getShippedItemsTodayCount());
    promises.push(getShippedTodayOrdersCount());

    return Parse.Promise.when(promises)
}

function getOpenOrdersCount() {
    var promise = new Parse.Promise();

    let baseURL = require("../../resources/shopifyURL.js");
    var shopifyURL = baseURL + '/orders/count.json';
    var parameters = {};
    request({url: shopifyURL, qs: parameters}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let count = JSON.parse(body).count;
            let result = createResult(Analytic.types().openOrders, count);
            promise.resolve(result);
        } else {
            console.log(error);
        }
    });
    
    return promise;
}

function getItemsToBeCut() {
    var promise = new Parse.Promise();

    let CutList = require("../../cutList/cutList.js");
    let query = CutList.createLineItemsToCutQuery();
    query.limit(10000);

    query.count({
        success: function(count) {
            let result = createResult(Analytic.types().itemsToCut, count);
            promise.resolve(result);
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}

function getItemsToBeSewn() {
    var promise = new Parse.Promise();

    let query = LineItem.query();
    query.doesNotExist("package");

    let itemQuery = Item.query();
    itemQuery.exists("cut");
    query.matchesQuery("item", itemQuery);
    
    query.limit(10000);

    query.count({
        success: function(count) {
            let result = createResult(Analytic.types().itemsToSew, count);
            promise.resolve(result);
        }, 
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}

function getAllocatedInventoryCount() {
    var promise = new Parse.Promise();

    let query = LineItem.query();
    query.doesNotExist("pick");

    let itemQuery = Item.query();
    let Package = require("../../models/tracking/package.js");
    let packageQuery = Package.query();
    packageQuery.equalTo("state", Package.states().in_inventory);
    itemQuery.matchesQuery("package", packageQuery);
    query.matchesQuery("item", itemQuery);
    query.limit(10000);

    query.count({
        success: function(count) {
            let result = createResult(Analytic.types().allocatedInventoryCount, count);
            promise.resolve(result);
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}

function getPickListCount() {
    var promise = new Parse.Promise();

    let Pickable = require("../../models/pickable.js");
    let query = Pickable.query();
    query.limit(10000);

    query.count({
        success: function(count) {
            let result = createResult(Analytic.types().openPicks, count);
            promise.resolve(result);
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}

function getOrdersToBeShippedCount() {
    var promise = new Parse.Promise();

    let query = LineItem.query();
    query.exists("pick");
    query.doesNotExist("ship");
    query.limit(10000);

    query.count({
        success: function(count) {
            let result = createResult(Analytic.types().openShipping, count);
            promise.resolve(result);
        },
        error: function(error) {
            promise.reject(error);
        }
    })

    return promise;
}

/**
 * Get the amount of orders that have shipped since midnight in Hawaii time.
 */
function getShippedItemsTodayCount() {
    var promise = new Parse.Promise();
    let query = createShippedQuery();
    
    query.count({
        success: function(count) {
            let result = createResult(Analytic.types().lastShippedItems, count);
            promise.resolve(result);
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}

function getShippedTodayOrdersCount() {
    var promise = new Parse.Promise();
    let query = createShippedQuery();
    query.include("order");
    
    query.find({
        success: function(lineItems) {
            let count = getOrderCountFrom(lineItems);
            let result = createResult(Analytic.types().lastShippedOrders, count);
            promise.resolve(result);
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}

function getOrderCountFrom(lineItems) {
    let orderObjectIDs = [];
    for (var i = 0; i < lineItems.length; i++) {
        let lineItem = lineItems[i];
        let order = lineItem.get("order");
        if (orderObjectIDs.indexOf(order.id) == -1) {
            //we haven't seen this order yet
            orderObjectIDs.push(order.id);
        }
    }

    return orderObjectIDs.length
}

function createShippedQuery() {
    let query = LineItem.query();
    query.exists("state");

    let Ship = require("../../models/tracking/ship.js");
    let shipQuery = Ship.query();
    //the Parse Server time is in GMT (Greenwich Mean Time), which is 10 hours ahead of Hawaii
    let hawaiiMidnight = new Date();
    hawaiiMidnight.setHours(-10, 0, 0, 0);
    shipQuery.greaterThanOrEqualTo("createdAt", hawaiiMidnight);
    query.matchesQuery("ship", shipQuery);
    query.limit(10000);

    return query;
}

function createResult(analyticType, count) {
    let result = {};
    result[analyticType] = count;
    return result;
}

