var Parse = require('parse/node');

exports.getOneColorCutList = function getOneColorCutList(color) {
    var LineItem = Parse.Object.extend("LineItem");
    var query = new Parse.Query(LineItem);
    query.doesNotExist("item");
    
    let productVariantQuery = createFabricColorQuery(color);
    query.matchesQuery("productVariant", productVariantQuery);
    query.limit(10000);

    return query.find().then(function(lineItems) {
        var CutList = require("../cutList.js");
        return CutList.createGoogleSheet(lineItems);
    });
}

function createFabricColorQuery(color) {
    var ProductVariant = Parse.Object.extend("ProductVariant");
    var variantQuery = new Parse.Query(ProductVariant);

    var ProductType = Parse.Object.extend("ProductType");
    var productTypeQuery = new Parse.Query(ProductType);

    var Fabric = Parse.Object.extend("Fabric");
    var fabricQuery = new Parse.Query(Fabric);
    fabricQuery.equalTo("color", color);
    productTypeQuery.matchesQuery("fabric", fabricQuery);
    variantQuery.matchesQuery("product", productTypeQuery);

    return variantQuery;
}