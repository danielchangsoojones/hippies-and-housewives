var Parse = require('parse/node');
var getProducts = require("./getProducts.js");
let ProductType = require("../../models/productType.js");

exports.updateProduct = function updateProduct(productJSON) {
    findProduct(productJSON).then(function(product) {
        translateUpdatedProduct(product, productJSON);
        updateVariants(productJSON, product);
    }, function(error) {
        console.log(error);
    })
}

function findProduct(productJSON) {
    var promise = new Parse.Promise();
    var query = ProductType.query();

    query.equalTo("shopifyID", productJSON.id);
    query.include("fabric");

    query.first({
        success: function(product) {
            if (product == undefined) {
                //product does not exist yet, so save it
                var getProduct = require("./getProducts.js");
                getProduct.uploadNewProduct(productJSON);
                promise.reject("product did not exist, so we created it in the database");
            } else {
                //product already exists
                promise.resolve(product);
            }
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}

function translateUpdatedProduct(product, productJSON) {
    let newTitle = productJSON.title;
    let newVendor = productJSON.vendor;

    let getFabric = require("../fabric/getFabric.js");
    let newColor = getFabric.getColor(productJSON);

    product.get("fabric").set("color", newColor);
    product.set("title", newTitle);
    product.set("vendor", newVendor.toLowerCase());

    product.save(null, {
        success: function(product) {},
        error: function(error) {
            console.log(error);
        }
    });
}

//MARK: updated variants
function updateVariants(productJSON, product) {
    let ProductVariant = require("../../models/productVariant.js");
    var query = ProductVariant.query();

    var innerQuery = new ProductType.query();
    innerQuery.equalTo("shopifyID", productJSON.id);
    query.matchesQuery("product", innerQuery);

    query.find({
        success: function(variants) {
            compareVariants(variants, productJSON, product);
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function compareVariants(variants, productJSON, product) {
    let variantsJSON = productJSON.variants;
    let currentVariantIDs = getCurrentVariantIDs(variants);

    for (var i = 0; i < variantsJSON.length; i++) {
        let variantJSON = variantsJSON[i];

        let matchingIndex = currentVariantIDs.indexOf(variantJSON.id);
        if (matchingIndex == -1) {
            //variant id does not exist yet because this particular variant just got created.
            createNewVariant(variantJSON, productJSON, product);
        } else {
            //variant already exists in our database
            updateVariant(variantJSON, variants[matchingIndex], productJSON);
        }
    }
}

function updateVariant(variantJSON, variant, productJSON) {
    variant.set("size", getProducts.getSize(productJSON, variantJSON));
    
    variant.save(null, {
        success: function(variant) {},
        error: function(error) {
            console.log(error);
        }
    });
}

function getCurrentVariantIDs(variants) {
    variantIDs = [];

    for (var i = 0; i < variants.length; i++) {
        let variant = variants[i];
        variantIDs.push(variant.get("shopifyVariantID"));
    }

    return variantIDs;
}

function createNewVariant(variantJSON, productJSON, product) {
    let variant = getProducts.createVariant(variantJSON, productJSON, product);
    variant.save(null, {
        success: function(variant) {},
        error: function(error) {
            console.log(error);
        }
    });
}