var Parse = require('parse/node');

exports.findCorrespondingLineItems = function findCorrespondingLineItems(originalProductType) {
    const LineItem = require('../../models/lineItem.js');
    let query = LineItem.query();
    query.equalTo("title", originalProductType.get("title"));
    
    let productVariantQuery = createProductVariantQuery(originalProductType);
    query.matchesQuery("productVariant", productVariantQuery);

    query.limit(10000);
    query.include("productVariant");
    return query.find();
}

function createProductVariantQuery(originalProductType) {
    const ProductVariant = require('../../models/productVariant.js');
    let query = ProductVariant.query();
    //there is no need to pull down any line items that already have the correct original product type
    query.notEqualTo("product", originalProductType);
    return query;
}