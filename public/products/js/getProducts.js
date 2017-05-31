var request = require('request');
var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

var allProducts = [];

console.log(getAllProducts());

function getAllProducts(lastShopifyProductID) {
    let baseURL = require("../../resources/shopifyURL.js");
    var shopifyURL = baseURL + '/products.json';
    var parameters = {limit : 250, fields : "id,variants,title,vendor,options", since_id : lastShopifyProductID};
    request({url: shopifyURL, qs: parameters}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let products = JSON.parse(body).products;
            if (products.length != 0) {
                //we have not hit the most recent product because more exist beyond it
                allProducts.push(products);
                let lastShopifyProductID = products[products.length - 1].id;
                getAllProducts(lastShopifyProductID);
            }

            saveFabric(products);
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
                    saveProduct(productJSON, fabric);
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
            saveProduct(productJSON, fabric);
        },
        error: function(fabric, error) {
            console.log('Failed to create new object, with error code: ' + error.message);
        }
    });
} 

function saveProduct(productJSON, fabric) {
    let Product = require('../../models/product.js');
    let product = new Product();

    product.set("shopifyID", productJSON.id);
    product.set("color", getColor(productJSON));
    product.set("title", productJSON.title);
    product.set("vendor", productJSON.vendor.toLowerCase());
    product.set("fabric", fabric);

    product.save(null, {
        success: function(product) {
            saveVariants(productJSON, product);
        },
        error: function(product, error) {
            console.log('Failed to create new object, with error code: ' + error.message);
        }
    });
}

function getColor(product) {
    var color;

    let title = product.title;
    //Take a title like (Belle Bottoms // Hamptons), and return Hamptons as the color. We can't use the options right now because not all products have an options field with color. Some don't for some reason.
    let index = title.indexOf("/");
    if (index != undefined) {
        color = title.substring(index + 3)
    } else {
        color = "COLOR ERROR";
    }

    return color.toLowerCase();
}

function saveVariants(productJSON, product) {
    var variantsArray = [];
    let variantsJSON = productJSON.variants;

    for (var v = 0; v < variantsJSON.length; v++) {
        let variantJSON = variantsJSON[v];

        let ProductVariant = require('../../models/productVariant.js');
        let variant = new ProductVariant();
        
        variant.set("shopifyVariantID", variantJSON.id);
        variant.set("size", getSize(productJSON, variantJSON));
        variant.set("product", product);
        variantsArray.push(variant);
    }

    Parse.Object.saveAll(variantsArray, {
        success: function (variants) {
            console.log("successfully saved variants");                     
        },
        error: function (error) {                                
            console.log(error);
        },
    });
}

function getSize(productJSON, variantJSON) {
    //an option is customizable data that you can place on variants, so on shopify most variants have size and color, but the problem is that not all have these options, so the order is messed up sometimes.
    let options = productJSON.options;
    let size = "size"
    if (options[0].name.toLowerCase() == size) {
        //size is the first option, sometimes size is the first option, other times it is the second option because someone did bad shopify data.
        return variantJSON.option1;
    } else if (options[1].name.toLowerCase() == size) {
        return variantJSON.option2;
    }
}

