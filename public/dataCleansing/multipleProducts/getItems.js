var Parse = require('parse/node');

exports.getCorrespondingItems = function getCorrespondingItems(originalProductType) {
    let title = originalProductType.get("title");

    const Item = require('../../models/item.js');
    let query = Item.query();

    let productVariantQuery = createProductVariantQuery(title, originalProductType.id);
    query.matchesQuery("productVariant", productVariantQuery);

    query.limit(10000);
    query.include("productVariant");

    return query.find();
}

function createProductVariantQuery(productTypeTitle, productTypeObjectID) {
    const ProductVariant = require('../../models/productVariant.js');
    let query = ProductVariant.query();

    const ProductType = require('../../models/productType.js');
    let productTypeQuery = ProductType.query();
    productTypeQuery.equalTo("title", productTypeTitle);
    productTypeQuery.notEqualTo("objectId", productTypeObjectID);
    query.matchesQuery("product", productTypeQuery);

    return query;
}