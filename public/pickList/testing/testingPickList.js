var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

console.log(testingPickList())

function testingPickList() {
    var PickList = require("../pickList.js");
    PickList.createPickList().then(function(results) {
        console.log("finished");
        console.log(results);
    }, function(error) {
        console.log(error);
    })

}