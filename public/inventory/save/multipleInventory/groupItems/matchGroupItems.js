var Parse = require("parse/node");

exports.matchGroupItems = function matchGroupItems(quantityToSave, productVariant) {
    var promise = new Parse.Promise();

    getGroupItems(quantityToSave, productVariant).then(function(groupItems) {
        let results = setGroupItems(groupItems, quantityToSave);
        promise.resolve(results);
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

function setGroupItems(groupItems, quantityToSave) {
    var leftoverQuantity = quantityToSave;
    var groupItemsToSave = [];
    for (var i = 0; i < groupItems.length; i++) {
        let groupItem = groupItems[i];
        const SaveMultipleInventory = require('../saveMultipleInventory.js');
        SaveMultipleInventory.setAsPackaged(groupItem);
        groupItemsToSave.push(groupItem);
        leftoverQuantity--;
    }

    let results = {
        groupItemsToSave: groupItemsToSave,
        leftoverQuantity: leftoverQuantity
    };

    return results;
}

/*
a group item is an item that was associated with a group and we used it to initiate a line item
Say, we send a bunch of swimsuits off to a factory, and we need to make sure those line items are initiated,
so they don't get double cut. But, they have no label, so when they are placed into inventory, we need to match them back up
*/
function getGroupItems(quantityToSave, productVariant) {
    let nonExistingLineItemQuery = createNonExistingLineItemQuery(productVariant);
    let existingLineItemQuery = createExistingLineItemQuery(productVariant);

    let orQuery = Parse.Query.or(nonExistingLineItemQuery, existingLineItemQuery);
    orQuery.limit(quantityToSave);

    return orQuery.find();
}

function createNonExistingLineItemQuery(productVariant) {
    let query = createCommonItemQuery(productVariant);
    query.doesNotExist("lineItem");

    return query;
}

function createExistingLineItemQuery(productVariant) {
    let query = createCommonItemQuery(productVariant);

    const LineItem = require('../../../../models/lineItem.js');
    let lineItemQuery = LineItem.query();
    lineItemQuery.doesNotExist("pick");
    query.matchesQuery("lineItem", lineItemQuery);

    return query;
}

function createCommonItemQuery(productVariant) {
    const Item = require('../../../../models/item.js');
    var query = Item.query();

    query.equalTo("productVariant", productVariant);
    query.exists("group");
    query.doesNotExist("package");

    return query;
}