var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

console.log(testCutList());

function testCutList() {
    var CutList = require("../cutList.js");
    CutList.getCutList().then(function(lineItems) {
        console.log(lineItems);
    }, function(error) {
        console.log(error);
    });
}