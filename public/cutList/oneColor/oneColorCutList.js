var Parse = require('parse/node');

exports.getOneColorCutList = function getOneColorCutList(color) {
    var promise = new Parse.Promise();

    let CutList = require("../cutList.js");
    let query = CutList.createLineItemsToCutQuery();
    
    let productVariantQuery = createFabricColorQuery(color);
    query.matchesQuery("productVariant", productVariantQuery);
    query.limit(10000);

    query.find().then(function(lineItems) {
        return CutList.createGoogleSheet(lineItems);
    }).then(function(results) {
        promise.resolve(results);
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

function createFabricColorQuery(color) {
    var ProductVariant = require("../../models/productVariant.js");
    var variantQuery = ProductVariant.query();

    var ProductType = require("../../models/productType.js");
    var productTypeQuery = ProductType.query();

    var Fabric = require("../../models/fabric.js");
    var fabricQuery = Fabric.query();
    fabricQuery.equalTo("color", color);
    productTypeQuery.matchesQuery("fabric", fabricQuery);
    variantQuery.matchesQuery("product", productTypeQuery);

    return variantQuery;
}