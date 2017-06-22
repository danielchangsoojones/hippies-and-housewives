var request = require('request');
require("../../resources/initializeParse.js");
var Parse = require('parse/node');

searchProduct("izzy");
function searchProduct(searchText) {
    var Search = require("../search/searchProduct.js");
    Search.searchProduct(searchText).then(function(products) {
        console.log(products);
    }, function(error) {
        console.log(error);
    });
}

//MARK: retrieving mass products
// function getAllProducts(page) {
//     let baseURL = require("../../resources/shopifyURL.js");
//     var shopifyURL = baseURL + '/products.json';
//     var parameters = {limit : 250, fields : "id,variants,title,vendor,options", page : page};
//     request({url: shopifyURL, qs: parameters}, function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//             let products = JSON.parse(body).products;
//             if (products.length != 0) {
//                 //we have not hit the most recent product because more exist beyond it
//                 getAllProducts(page + 1);
//             }

//             for (var i = 0; i < products.length; i++) {
//                 let productJSON = products[i];
//                 let ProductHelper = require("../js/getProducts.js");
//                 ProductHelper.uploadNewProduct(productJSON);
//             }
//         } else {
//             console.log(error);
//         }
//     });
// }

//MARK: duplicate products.
//TODO: this doesn't check to make sure that inventory is safe, so the inventory could still be bad data.
// function getDuplicateProduct() {
//     let alreadyUsedProductIDs = [];
//     var duplicateProducts = [];
    
//     let ProductType = require("../../models/productType.js");
//     var query = ProductType.query();
//     query.limit(10000);

//     query.find({
//       success: function(products) {
//           for (var i = 0; i < products.length; i++) {
//               let product = products[i];
//               let shopifyProductID = product.get("shopifyID");
//               if (alreadyUsedProductIDs.indexOf(shopifyProductID) == -1) {
//                   //first time seeing this product number
//                   alreadyUsedProductIDs.push(shopifyProductID);
//               } else {
//                   //it's a duplicate product number
//                   deleteDuplicateProduct(product);
//               }
//           }
//       },
//       error: function(error) {
//           console.log(error);
//       }
//     });
// }

// function deleteDuplicateProduct(duplicateProduct) {
//         var ProductVariant = Parse.Object.extend("ProductVariant");
//         var query = new Parse.Query(ProductVariant);
//         query.equalTo("product", duplicateProduct);

//         query.find({
//             success: function(variants) {
//                 let objects = [variants, duplicateProduct];
//                 var flattenedObjects = [].concat.apply([], objects);
//                 Parse.Object.destroyAll(flattenedObjects);
//                 matchLineItems();
//             },
//             error: function(error) {
//                 console.log(error);
//             }
//         });
// }

// function matchLineItems() {
//     var LineItem = require("../../models/lineItem.js");
//     var query = LineItem.query();
//     query.limit(10000);
//     query.include("productVariant");

//     query.find({
//         success: function(lineItems) {
//             for(var i = 0; i < lineItems.length; i++) {
//                 let lineItem = lineItems[i];
//                 if (lineItem.get("productVariant") == undefined) {
//                      associateProductVariant(lineItem);
//                 }
//             }
//         }, 
//         error: function(error) {
//             console.log(error);
//         }
//     })
// }

// function associateProductVariant(lineItem) {
//     var ProductVariant = Parse.Object.extend("ProductVariant");
//     var query = new Parse.Query(ProductVariant);
    
//     query.equalTo("shopifyVariantID", lineItem.get("shopifyVariantID"));

//     query.first({
//         success: function(variant) {
//             lineItem.set("productVariant", variant);
//             lineItem.save();
//         },
//         error: function(error) {
//             console.log(error);
//         }
//     });
// }