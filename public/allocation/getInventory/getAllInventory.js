var Parse = require('parse/node');

exports.getAllInventory = function getAllInventory() {
    var promise = new Parse.Promise();
    let query = createInventoryQuery();

    query.find({
        success: function(items) {
            let sortedItems = sort(items);
            promise.resolve(sortedItems);
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}

function createInventoryQuery() {
    let attatchedLineItemQuery = createAttatchedLineItemQuery();
    let nonAttachedLineItemQuery = createNonExistingLineItemQuery();

    let orQuery = Parse.Query.or(attatchedLineItemQuery, nonAttachedLineItemQuery);
    orQuery.include("productVariant");
    orQuery.limit(10000);
    return orQuery;
}

function createAttatchedLineItemQuery() {
    let query = createCommonItemQuery();
    const LineItem = require('../../models/lineItem.js');
    let lineItemQuery = LineItem.query();
    lineItemQuery.doesNotExist("pick");
    query.matchesQuery("lineItem", lineItemQuery);

    return query;
}

function createNonExistingLineItemQuery() {
    let query = createCommonItemQuery();
    query.doesNotExist("lineItem");

    return query;
}

function createCommonItemQuery() {
    const Item = require('../../models/item.js');
    let query = Item.query();

    const Package = require('../../models/tracking/package.js');
    let packageQuery = Package.query();
    packageQuery.equalTo("state", Package.states().in_inventory);
    query.matchesQuery("package", packageQuery);

    return query;
}

/**
 * have all non-allocated inventory items be placed first in the array. Then, when we are allocating we will be 
 * able to know that if we get to an allocated line item, we are there out of necessity and there are no
 * non-allocated items to take.
 */
function sort(items) {
    var sortedItems = [];
    for (var i = 0; i < items.length; i++) {
        let item = items[i];
        let lineItem = item.get("lineItem");
        if (lineItem == undefined) {
            //add to the beginning of the array
            sortedItems.unshift(item);
        } else {
            sortedItems.push(item);
        }
    }

    return sortedItems;
}