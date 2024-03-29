require("../../resources/initializeParse.js");
var Parse = require('parse/node');

function testCutList() {
    var CutList = require("../cutList.js");
    CutList.getCutList().then(function(lineItems) {
        console.log(lineItems);
    }, function(error) {
        console.log(error);
    });
}

// function getZenCutList() {
//     var readline = require('readline');

//     var rl = readline.createInterface({
//         input: process.stdin,
//         output: process.stdout
//     });

//     rl.question('Enter the color here (must perfectly match i.e. Malibu): ', function(color) {
//         rl.close();


//     var LineItem = require("../../models/lineItem.js");
//     var query = LineItem.query();
//     query.endsWith("title", color);
//     query.notEqualTo("isInitiated", true);
//     query.doesNotExist("item");
//     query.include("order");
//     query.limit(10000);
    
//     query.find({
//       success: function(lineItems) {
//           console.log();
//           for(var i = 0; i < lineItems.length; i++) {
//               let lineItem = lineItems[i];
//               console.log(lineItem.get("shopifyLineItemID")  + ", " + lineItem.get("title") + ", " +  lineItem.get("variant_title") + ", " + lineItem.get("order").get("name"));
//           }
//           console.log(lineItems.length);
//       },
//       error: function(error) {
//           res.error(error);
//       }
//     });
//     });
// }

function getOneColorCutList(color) {
    var OneColorCutList = require("../oneColor/oneColorCutList.js");
    OneColorCutList.getOneColorCutList(color).then(function(success) {
        console.log(success);
    }, function (error) {
        console.log(error);
    });
}

getCutDistributions();
function getCutDistributions() {
    const CutDistributions = require('../distributions/cutDistributions.js');
    CutDistributions.getCutDistributions().then(function(results) {
        console.log(results);
    }, function(error) {
        console.log(error);
    });
}