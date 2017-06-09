var Parse = require('parse/node');
let Fabric = require("../fabric/getFabric.js");

//MARK: upload new product
exports.uploadNewProduct = function uploadNewProduct(productJSON) {
    Fabric.getFabric(productJSON).then(function(fabric) {
        let product = createProduct(productJSON, fabric);
        let variants = getVariants(productJSON, product);
        saveAllComponents([product, fabric, variants]);
    }, function (error) {
        console.log(error);
    });
}

function saveAllComponents(objects) {
    var flattenedObjects = [].concat.apply([], objects);

    Parse.Object.saveAll(flattenedObjects, {
        success: function (results) {},
        error: function (error) {                                     
            console.log(error);
        },
    });
}

function createProduct(productJSON, fabric) {
    let ProductType = require('../../models/productType.js');
    let product = new ProductType();

    product.set("shopifyID", productJSON.id);
    product.set("title", productJSON.title);
    product.set("vendor", productJSON.vendor.toLowerCase());
    product.set("fabric", fabric);
    
    return product;
}

function getVariants(productJSON, product) {
    let variantsJSON = productJSON.variants;
    var variants = [];
    
    for (var v = 0; v < variantsJSON.length; v++) {
        let variantJSON = variantsJSON[v];
        let variant = exports.createVariant(variantJSON, productJSON, product);
        variants.push(variant);
    }

    return variants;
}

exports.createVariant = function createVariant(variantJSON, productJSON, product) {
    let ProductVariant = require('../../models/productVariant.js');
    let variant = new ProductVariant();
        
    variant.set("shopifyVariantID", variantJSON.id);
    variant.set("size", exports.getSize(productJSON, variantJSON));
    variant.set("product", product);

    return variant
}

//MARK: variant attributes
exports.getSize = function getSize(productJSON, variantJSON) {
    //an option is customizable data that you can place on variants, so on shopify most variants have size and color, but the problem is that not all have these options, so the order is messed up sometimes.
    let options = productJSON.options;
    let size = "size"
    
    if (options[0] != undefined && options[0].name.toLowerCase() == size) {
        //size is the first option, sometimes size is the first option, other times it is the second option because someone did bad shopify data.
        return variantJSON.option1;
    } else if (options[1] != undefined && options[1].name.toLowerCase() == size) {
        return variantJSON.option2;
    } else {
        return "Size Error"
    }
}
