require("../../resources/initializeParse.js");
var Parse = require('parse/node');

// function testAllocation(objectID) {
//     var Inventory = Parse.Object.extend("Inventory");
//     var query = new Parse.Query(Inventory);
//     query.equalTo("objectId", objectID);
//     query.include("productVariant");
//     query.first({
//       success: function(inventory) {
//           let Allocate = require("../save/save.js");
//           Allocate.allocateInventories([inventory], inventory.get("productVariant"));
//       },
//       error: function(error) {
//           console.log(error);
//       }
//   });
// }

function getBrokenInventory(productName, size) {
  var Inventory = Parse.Object.extend("Inventory");
  var query = new Parse.Query(Inventory);

  let ProductVariant = Parse.Object.extend("ProductVariant");
  var variantQuery = new Parse.Query(ProductVariant);
  let upperCaseSize = size.toUpperCase();
  variantQuery.equalTo("size", upperCaseSize);

  let Product = Parse.Object.extend("ProductType");
  var productQuery = new Parse.Query(Product);
  let lowercaseProductName = productName.toLowerCase();
  productQuery.equalTo("lowercaseTitle", lowercaseProductName);
  variantQuery.matchesQuery("product", productQuery);

  query.matchesQuery("productVariant", variantQuery);

  query.include("productVariant");
  query.find({
      success: function(inventories) {
          console.log(inventories);
      },
      error: function(error) {
          console.log(error);
      }
  });



}