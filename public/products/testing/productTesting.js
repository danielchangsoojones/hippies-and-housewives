var request = require('request');
require("../../resources/initializeParse.js");
var Parse = require('parse/node');

function searchProduct(searchText) {
    var Search = require("../search/searchProduct.js");
    Search.searchProduct(searchText).then(function(products) {
        console.log(products);
    }, function(error) {
        console.log(error);
    });
}

exports.getProductVariant = function getProductVariant(style, size) {
    var promise = new Parse.Promise();

    let ProductVariant = require("../../models/productVariant.js");
    let query = ProductVariant.query();
    query.equalTo("size", size);

    let ProductType = require("../../models/productType.js");
    let productQuery = ProductType.query();
    productQuery.equalTo("lowercaseTitle", style.toLowerCase());
    query.matchesQuery("product", productQuery);

    query.first({
        success: function(productVariant) {
            if (productVariant == undefined) {
                promise.reject("couldn't find product variant");
            } else {
                promise.resolve(productVariant.id);
            }
        },
        error: function(error) {
            promise.reject(error);
        }
    })

    return promise;
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
function getDuplicateProduct() {
    let alreadyUsedProductIDs = [];
    var alreadyUsedProducts = [];
    var duplicateProducts = [];
    
    let ProductType = require("../../models/productType.js");
    var query = ProductType.query();
    query.limit(10000);

    query.find({
      success: function(products) {
          for (var i = 0; i < products.length; i++) {
              let product = products[i];
              let shopifyProductID = product.get("shopifyID");
              if (alreadyUsedProductIDs.indexOf(shopifyProductID) == -1) {
                  //first time seeing this product number
                  alreadyUsedProducts.push(product);
                  alreadyUsedProductIDs.push(shopifyProductID);
              } else {
                  //it's a duplicate product number
                  console.log(product.get("title") + " " + product.get("createdAt"));
                  let alreadyUsedProduct = getAlreadyUsedProduct(alreadyUsedProducts, shopifyProductID);
                  matchItems(alreadyUsedProduct, product).then(function(items) {
                    deleteDuplicateProduct(product);
                  }, function(error) {
                      console.log(error);
                  });
              }
          }
      },
      error: function(error) {
          console.log(error);
      }
    });
}

function getAlreadyUsedProduct(alreadyUsedProducts, targetShopifyID) {
    for (var j = 0; j < alreadyUsedProducts.length; j++) {
        let alreadyUsedProduct = alreadyUsedProducts[j];
        if (alreadyUsedProduct.get("shopifyID") == targetShopifyID) {
            return alreadyUsedProduct
        }
    }
    console.log("failed to find our matching already used product");
}

function deleteDuplicateProduct(duplicateProduct) {
        var ProductVariant = Parse.Object.extend("ProductVariant");
        var query = new Parse.Query(ProductVariant);
        query.equalTo("product", duplicateProduct);

        query.find({
            success: function(variants) {
                let objects = [variants, duplicateProduct];
                var flattenedObjects = [].concat.apply([], objects);
                Parse.Object.destroyAll(flattenedObjects);
                matchLineItems();
            },
            error: function(error) {
                console.log(error);
            }
        });
}

function matchLineItems() {
    var LineItem = require("../../models/lineItem.js");
    var query = LineItem.query();
    query.limit(10000);
    query.include("productVariant");

    query.find({
        success: function(lineItems) {
            for(var i = 0; i < lineItems.length; i++) {
                let lineItem = lineItems[i];
                if (lineItem.get("productVariant") == undefined) {
                     associateProductVariant(lineItem);
                }
            }
        }, 
        error: function(error) {
            console.log(error);
        }
    })
}

function associateProductVariant(lineItem) {
    var ProductVariant = Parse.Object.extend("ProductVariant");
    var query = new Parse.Query(ProductVariant);
    
    query.equalTo("shopifyVariantID", lineItem.get("shopifyVariantID"));

    query.first({
        success: function(variant) {
            lineItem.set("productVariant", variant);
            lineItem.save();
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function matchItems(originalProductType, duplicateProductType) {
    var promise = new Parse.Promise();

    var ProductVariant = Parse.Object.extend("ProductVariant");
    var query = new Parse.Query(ProductVariant);

    query.containedIn("product", [duplicateProductType, originalProductType]);
    query.include("product");
    var originalProductVariants= [];
    var duplicateProductVariants = [];

    query.find({
        success: function(productVariants) {
            for (var i = 0; i < productVariants.length; i++) {
                let productVariant = productVariants[i];
                let productType = productVariant.get("product");
                if (productType == originalProductType) {
                    originalProductVariants.push(productType);
                } else if (productType == duplicateProductType) {
                    duplicateProductVariants.push(productType);
                }
            }
            resetItems(originalProductVariants, duplicateProductVariants).then(function(items) {
                promise.resolve(items);
            }, function(error){
                promise.reject(error);
            });
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}

function resetItems(originalProductVariants, duplicateProductVariants) {
    let Item = require("../../models/item.js");
    let query = Item.query();
    query.containedIn("productVariant", duplicateProductVariants);
    query.include("productVariant");

    return query.find().then(function(itemsToReset) {
        for (var i = 0; i < itemsToReset.length; i++) {
            let replacementProductVariant = getProductVariant(originalProductVariants, itemsToReset.get("productVariant").get("shopifyVariantID"));
            itemsToReset[i].set("productVariant", replacementProductVariant);
        }

        return Parse.Object.saveAll(itemsToReset);
    })
}

function getProductVariant(productVariants, targetProductVariantID) {
    for (var i = 0; i < productVariants.length; i++) {
        let productVariant = productVariants[i];
        let shopifyVariantID = productVariant.get("shopifyVariantID");
        if (shopifyVariantID == targetProductVariantID) {
            return productVariant;
        }
    }

    console.log("could not find matching product variants");
}

function seeIfProductIsUnique(productTypeObjectID) {

    const ProductType = require('../../models/productType.js');
    let query = ProductType.query();
    query.equalTo("objectId", productTypeObjectID);
    query.first().then(function(productType) {
        const UniqueProduct = require('../unique/uniqueProduct.js');
        return UniqueProduct.checkProductDuplicates(productType);
    }).then(function(success) {
        console.log("this product is unique");
    }, function(error) {
        console.log(error);
    });
}

