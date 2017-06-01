var request = require('request');
var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

console.log(getAllProducts(1));

//MARK: upload new product
function uploadNewProduct(productJSON) {
    let Fabric = require("../fabric/getFabric.js");
    Fabric.getFabric(productJSON).then(function(fabric) {
        let product = createProduct(fabric);
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
    product.set("color", getColor(productJSON));
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
        let variant = createVariant(variantJSON, productJSON, product);
        variants.push(variant);
    }

    return variants;
}

function createVariant(variantJSON, productJSON, product) {
    let ProductVariant = require('../../models/productVariant.js');
    let variant = new ProductVariant();
        
    variant.set("shopifyVariantID", variantJSON.id);
    variant.set("size", getSize(productJSON, variantJSON));
    variant.set("product", product);

    return variant
}

//MARK: retrieving mass products
function getAllProducts(page) {
    let baseURL = require("../../resources/shopifyURL.js");
    var shopifyURL = baseURL + '/products.json';
    var parameters = {limit : 250, fields : "id,variants,title,vendor,options", page : page};
    request({url: shopifyURL, qs: parameters}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let products = JSON.parse(body).products;
            if (products.length != 0) {
                //we have not hit the most recent product because more exist beyond it
                getAllProducts(page + 1);
            }

            for (var i = 0; i < products.length; i++) {
                let productJSON = products[i];
                uploadNewProduct(productJSON);
            }
        } else {
            console.log(error);
        }
    });
}

//MARK: variant attributes
function getSize(productJSON, variantJSON) {
    //an option is customizable data that you can place on variants, so on shopify most variants have size and color, but the problem is that not all have these options, so the order is messed up sometimes.
    let options = productJSON.options;
    let size = "size"
    if (options[0].name.toLowerCase() == size) {
        //size is the first option, sometimes size is the first option, other times it is the second option because someone did bad shopify data.
        return variantJSON.option1;
    } else if (options[1].name.toLowerCase() == size) {
        return variantJSON.option2;
    } else {
        return "Size Error"
    }
}










//MARK: checking for a product
// exports.findProduct = findProduct(shopifyProductID) {
//     var promise = new Parse.Promise();

//     var ProductType = Parse.Object.extend("ProductType");
//     var query = new Parse.Query(ProductType);
//     query.equalTo("shopifyID", shopifyProductID);

//     query.first({
//         success: function(product) {
//             if (product == undefined) {
//                 //product does not exist yet, so save it
//                 //DO NOT CHANGE REJECT MESSAGE, we use this message to decide whether to search for a new product.
//                 promise.reject({message : "no product in our database yet", shopifyProductID : shopifyProductID});
//             } else {
//                 //product already exists
//                 promise.resolve(product);
//             }
//         },
//         error: function(error) {
//             promise.reject(error);
//         }
//     });

//     return promise;
// }

function findNewProduct(shopifyProductID) {
    let baseURL = require("../../resources/shopifyURL.js");
    //searching for individual shopifyProductID
    var shopifyURL = baseURL + '/products/' + shopifyProductID + ".json";
    var parameters = {fields : ""};
    request({url: shopifyURL, qs: parameters}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //For some reason, the json has a field orders which you have to access first before it gets to the array of orders
            let orders = JSON.parse(body).orders;
            if (orders.length == 0) {
                //we have hit the most recent order because no more exist beyond it
                saveLastShopifyID(lastRetrievedShopifyID);
            } else {
                //still more orders to go
                let lastShopifyID = orders[orders.length - 1].id
                getAllOrders(lastShopifyID);
            }

            saveCustomers(orders);
        } else {
            console.log(error);
        }
    });
}


function saveFabric(productsJSON) {
    for(var i = 0; i < productsJSON.length; i++) {
        let productJSON = productsJSON[i];

        var Fabric = Parse.Object.extend("Fabric");
        var query = new Parse.Query(Fabric);

        query.equalTo("color", getColor(productJSON));

        query.first({
            success: function(fabric) {
                if (fabric == undefined) {
                    //fabric color does not exist yet, so save it
                    saveNewFabric(productJSON);
                } else {
                    //fabric already exists
                    checkProduct(productJSON, fabric);
                }
            },
            error: function(error) {
                console.log("Error: " + error.code + " " + error.message);
            }
        });
    }
}

//TODO: it's possible that it could be querying at the same time as another color is saving, so we should really make sure to not save any duplicate fabrics. So, this still creates duplicates when we run mass queries, but I am just manually inputting the colors for now.
function saveNewFabric(productJSON) {
    let Fabric = require('../../models/fabric.js');
    let fabric = new Fabric();
    fabric.set("color", getColor(productJSON));
    fabric.save(null, {
        success: function(fabric) {
            checkProduct(productJSON, fabric);
        },
        error: function(fabric, error) {
            console.log('Failed to create new object, with error code: ' + error.message);
        }
    });
}

function checkProduct(productJSON, fabric) {
    var ProductType = Parse.Object.extend("ProductType");
    var query = new Parse.Query(ProductType);
    query.equalTo("shopifyID", productJSON.id);

    // query.first({
    //     success: function(product) {
    //         if (product == undefined) {
    //             //product does not exist yet, so save it
    //             saveProduct(productJSON, fabric);
    //         } else {
    //             //product already exists
    //             checkVariant(productJSON, product);
    //         }
    //     },
    //     error: function(error) {
    //         console.log("Error: " + error.code + " " + error.message);
    //     }
    // });
}

function saveProduct(productJSON, fabric) {
    let ProductType = require('../../models/productType.js');
    let product = new ProductType();

    product.set("shopifyID", productJSON.id);
    product.set("color", getColor(productJSON));
    product.set("title", productJSON.title);
    product.set("vendor", productJSON.vendor.toLowerCase());
    product.set("fabric", fabric);

    product.save(null, {
        success: function(product) {
            checkVariant(productJSON, product);
        },
        error: function(product, error) {
            console.log('Failed to create new object, with error code: ' + error.message);
        }
    });
}

function checkVariant(productJSON, product) {
    let variantsJSON = productJSON.variants;
    
    for (var v = 0; v < variantsJSON.length; v++) {
        let variantJSON = variantsJSON[v];
    
        var ProductVariant = Parse.Object.extend("ProductVariant");
        var query = new Parse.Query(ProductVariant);
        query.equalTo("shopifyVariantID", variantJSON.id);
        query.first({
            success: function(variant) {
                if (variant == undefined) {
                    //variant does not exist yet, so save it
                    saveVariant(productJSON, product, variantJSON);
                }
            },
            error: function(error) {
                console.log("Error: " + error.code + " " + error.message);
            }
        });
    }
}

function saveVariant(productJSON, product, variantJSON) {
    let ProductVariant = require('../../models/productVariant.js');
    let variant = new ProductVariant();
        
    variant.set("shopifyVariantID", variantJSON.id);
    variant.set("size", getSize(productJSON, variantJSON));
    variant.set("product", product);

    variant.save(null, {
        success: function(variant) {
            console.log("successfully saved a variant");
        },
        error: function(variant, error) {
            console.log('Failed to create new object, with error code: ' + error.message);
        }
    });
}

function createVariant(shopifyVariantID) {
    let ProductVariant = require('../../models/productVariant.js');
    let variant = new ProductVariant();
        
    variant.set("shopifyVariantID", variantJSON.id);
    variant.set("size", getSize(productJSON, variantJSON));
    variant.set("product", product);


}

