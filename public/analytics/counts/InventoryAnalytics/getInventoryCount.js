var Parse = require('parse/node');

exports.findAllocatedInventoryCount = function findAllocatedInventoryCount() {
    let allocatedItemsQuery = createExistingLineItemQuery();

    // let orQuery = Parse.Query.or(nonExistentLineItemQuery, existingLineItemQuery);
    allocatedItemsQuery.limit(10000);
    return allocatedItemsQuery.count();
}

/**
 * some items in inventory have been allocated to a Line Item. These allocated line items would still
 * be considered inventory. However, some Items are allocated to archived Line Items, which means that 
 * those items (aka inventory) has already been picked/shipped. Therefore, they should not be considered inventory.
 */
function createExistingLineItemQuery() {
    let query = createItemQuery();

    const LineItem = require('../../../models/lineItem.js');
    let lineItemQuery = LineItem.query();
    lineItemQuery.doesNotExist("pick");
    query.matchesQuery("lineItem", lineItemQuery);

    return query;
}

function createItemQuery() {
    const Item = require('../../../models/item.js');
    let query = Item.query();

    const Package = require('../../../models/tracking/package.js');
    let packageQuery = Package.query();
    packageQuery.equalTo("state", Package.states().in_inventory);
    query.matchesQuery("package", packageQuery);

    return query;
}
