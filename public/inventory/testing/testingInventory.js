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

removeInventory("uxE8PdFqkP", "S")
function removeInventory(productTypeObjectID, size) {
    let Inventory = require("../remove/removeInventory.js");
    Inventory.removeInventory(productTypeObjectID, size).then(function(inventory) {
        console.log(inventory);
    }, function(error) {
        console.log(error);
    })
    
}