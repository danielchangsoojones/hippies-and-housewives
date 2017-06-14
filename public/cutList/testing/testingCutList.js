require("../../resources/initializeParse.js");
var Parse = require('parse/node');

// function testCutList() {
//     var CutList = require("../cutList.js");
//     CutList.getCutList().then(function(lineItems) {
//         console.log(lineItems);
//     }, function(error) {
//         console.log(error);
//     });
// }

function getZenCutList() {
    var LineItem = Parse.Object.extend("LineItem");
    var query = new Parse.Query(LineItem);
    query.endsWith("title", "Midnight Garden");
    query.equalTo("state", "open");
    query.notEqualTo("isInitiated", true);
    query.include("order");
    
    query.find({
      success: function(lineItems) {
          console.log();
          for(var i = 0; i < lineItems.length; i++) {
              let lineItem = lineItems[i];
              console.log(lineItem.get("shopifyLineItemID")  + ", " + lineItem.get("title") + ", " +  lineItem.get("variant_title") + ", " + lineItem.get("order").get("name"));
          }
          console.log();
      },
      error: function(error) {
          res.error(error);
      }
    });
}