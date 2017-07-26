require("../../resources/initializeParse.js");
var Parse = require('parse/node');

function inputMultipleCuts() {
    let quantity = 5;
    let productTypeObjectID = "C9p2zg51P7";
    let size = "M";
    let currentUser =  { __type: "Pointer", className:"_User", objectId: "odzCqVngRb"};
    let Input = require("../input/saveMultipleCuts.js");
    Input.saveMultipleCuts(productTypeObjectID, size, quantity, currentUser).then(function(item) {
        console.log(item);
    }, function(error) {
        console.log(error);
    });
}