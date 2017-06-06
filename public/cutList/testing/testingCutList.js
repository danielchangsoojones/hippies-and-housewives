var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

console.log(testCutList());

function testCutList() {
    var CutList = require("../cutList.js");
    CutList.getCutList().then(function(lineItems) {
        // var GoogleSheets = require("../googleSheets/googleSheets.js");
        // // console.log("heyyy");
        // // console.log(lineItems);
        
        // GoogleSheets.createCutList(lineItems);
    }, function(error) {
        console.log(error);
    });
}