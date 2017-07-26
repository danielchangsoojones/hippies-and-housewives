var Parse = require("parse/node");

exports.findMatchingLineItems = function findMatchingLineItems(productVariant, quantityToSave) {
    let nonExistingItemQuery = createNonExistingItemQuery(productVariant);
    let nonInitiatedItemQuery = createNonInitiatedLineItemQuery(productVariant);
    let orQuery = Parse.Query.or(nonInitiatedItemQuery, nonExistingItemQuery);
    orQuery.limit(quantityToSave);

    return orQuery.find();
}

function createNonExistingItemQuery(productVariant) {
    let query = createCommonMatchingLineItemQuery(productVariant);
    query.doesNotExist("item");

    return query;
}

function createNonInitiatedLineItemQuery(productVariant) {
    let query = createCommonMatchingLineItemQuery(productVariant);
    
    const Item = require('../../../../models/item.js');
    let itemQuery = Item.query();
    itemQuery.notEqualTo("isInitiated", true);
    query.matchesQuery("item", itemQuery);

    return query;
}

function createCommonMatchingLineItemQuery(productVariant) {
    const LineItem = require('../../../../models/lineItem.js');
    var query = LineItem.query();
    query.equalTo("productVariant", productVariant);

    return query;
}