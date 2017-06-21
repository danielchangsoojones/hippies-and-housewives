require("../../resources/initializeParse.js");
var Parse = require('parse/node');

inputMultipleCuts();
function inputMultipleCuts() {
    let quantity = 5;
    let productTypeObjectID = "OFLDgDGEsA";
    let size = "S";
    let currentUser = new Parse.User();
    let Input = require("../input/saveMultipleCuts.js");
    Input.saveMultipleCuts(productTypeObjectID, size, quantity, currentUser).then(function(item) {
        console.log(item);
    }, function(error) {
        console.log(error);
    })

}