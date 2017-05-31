var request = require('request');
var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

exports.findProductVariant = function findProductVariant(shopifyVariantID) {
    var promise = new Parse.Promise();

    var ProductVariant = Parse.Object.extend("ProductVariant");
    var query = new Parse.Query(ProductVariant);
    query.equalTo("shopifyVariantID", shopifyVariantID);
    query.first({
        success: function(variant) {
            if (variant == undefined) {
                //no variant exists yet
                //TODO: we actually want to use the code below to get a new product from Shopify if the variant doesn't exist yet, but for now, I am just having it return undefined
                promise.resolve(variant);
            } else {
                //variant exists
                promise.resolve(variant);
            }
        },
        error: function(error) {
            console.log("Error: " + error.code + " " + error.message);
        }
    });

    return promise;
}


//TODO: ALL OF THIS CODE BELOW WOULD HELP ME FIND A NEW PRODUCT VARIANT IF I COULDN'T FIND IT, RIGHT NOW I AM JUST SENDING BACK UNDEFINED, BUT ONE DAY I WANT FAILSAFES
// function findShopifyProduct(shopifyProductID) {
//     var getProducts = require("../js/getProducts.js");
//     getProducts.findProduct(shopifyProductID).then(function(product) {
//         //we found a product, but the variant for this product does not exist yet (i.e. Belle Bottom now has XXXL)
//         findShopifyVariant(shopifyVariantID, product).then(function(variant) {
//             promise.resolve(variant);
//         }, function(error) {
//             promise.reject(error);
//         });
//     }, function (error) {
//         if (error.message == "no product in our database yet") {
//             //TODO: connect this to the project file
//             findNewProduct(error.shopifyProductID)
//         } else {
//             console.log(error);
//         }
//     });
// }

// function findShopifyVariant(shopifyVariantID, product) {
//     var promise = new Parse.Promise();

//     let baseURL = require("../../resources/shopifyURL.js");
//     var shopifyURL = baseURL + '/variants/' + shopifyVariantID + ".json";
//     var parameters = {fields : "id,option"};
//     request({url: shopifyURL, qs: parameters}, function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//             let variantJSON = JSON.parse(body).variant;
//             let variant = createVariant(variantJSON);
//             variant.set("product", product);
//             promise.resolve(variant);
//         } else {
//             promise.reject(error);
//         }
//     });

//     return promise;
// }

// function createVariant(variantJSON) {
//     let ProductVariant = require('../../models/productVariant.js');
//     let variant = new ProductVariant();
        
//     variant.set("shopifyVariantID", variantJSON.id);
//     variant.set("size", getVariantSize(variantJSON));

//     return variant;
// }

// function getVariantSize(variantJSON) {
//     var size = "Size Error";
//     if (variantJSON.option2 == null) {
//         //the size is in option 1
//         //TODO: the size option is located in the first option. This works for now as a workaround, but could potentially break if we moved sizing to to the 3rd option
//         size = variantJSON.option1;
//     } else {
//         //option 1 is filled with color, so option 2 holds size. This is just how the we've set up Shopify, but could easily break if we ever changed this.
//         size = variantJSON.option2;
//     }

//     return size;
// }