var Parse = require('parse/node');
const ProductVariant = require('../../../models/productVariant.js');
const ProductType = require('../../../models/productType.js');

exports.loadInventories = function loadInventories(productTypeObjectID) {
    var promises = [];

    promises.push(getAllProductVariants(productTypeObjectID));
    promises.push(loadItems(productTypeObjectID));
    
    return Parse.Promise.when(promises);
}

function getAllProductVariants(productTypeObjectID) {
    let query = createMatchingProductTypeQuery(productTypeObjectID);
    return query.find();
}

function loadItems(productTypeObjectID) {
    let nonExistentLineItemQuery = createNonExistentLineItemQuery(productTypeObjectID);
    let existingLineItemQuery = createExistingLineItemQuery(productTypeObjectID);

    let orQuery = Parse.Query.or(nonExistentLineItemQuery, existingLineItemQuery);
    orQuery.limit(10000);
    orQuery.include("productVariant");

    return orQuery.find();
}

function createNonExistentLineItemQuery(productTypeObjectID) {
    let query = createCommonItemQuery(productTypeObjectID);
    query.doesNotExist("lineItem");
    return query;
}

/**
 * some items in inventory have been allocated to a Line Item. These allocated line items would still
 * be considered inventory. However, some Items are allocated to archived Line Items, which means that 
 * those items (aka inventory) has already been picked/shipped. Therefore, they should not be considered inventory.
 */
function createExistingLineItemQuery(productTypeObjectID) {
    let query = createCommonItemQuery(productTypeObjectID);

    const LineItem = require('../../../models/lineItem.js');
    let lineItemQuery = LineItem.query();
    lineItemQuery.doesNotExist("picked");
    query.matchesQuery("lineItem", lineItemQuery);

    return query;
}

function createCommonItemQuery(productTypeObjectID) {
    const Item = require('../../../models/item.js');
    let query = Item.query();

    const Package = require('../../../models/tracking/package.js');
    let packageQuery = Package.query();
    packageQuery.equalTo("state", Package.states().in_inventory);
    query.matchesQuery("package", packageQuery);

    let productVariantQuery = createMatchingProductTypeQuery(productTypeObjectID);
    query.matchesQuery("productVariant", productVariantQuery);

    return query;
}

function createMatchingProductTypeQuery(productTypeObjectID) {
    let productVariantQuery = ProductVariant.query();
    let productTypeQuery = ProductType.query();
    productTypeQuery.equalTo("objectId", productTypeObjectID);
    productVariantQuery.matchesQuery("product", productTypeQuery);

    return productVariantQuery;
}