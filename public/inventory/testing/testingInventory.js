var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

function testAllocation(objectID) {
    var Inventory = Parse.Object.extend("Inventory");
    var query = new Parse.Query(Inventory);
    query.equalTo("objectId", objectID);
    query.include("productVariant");
    query.first({
      success: function(inventory) {
          let Allocate = require("../save/save.js");
          Allocate.findMatchingLineItem(inventory);
      },
      error: function(error) {
          console.log(error);
      }
  });
}

console.log(testAllocation("AILZcKIDB2"));